-- 1. Create Risk Forecast Table
CREATE TABLE IF NOT EXISTS public.trip_risk_forecast (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    forecasted_risk_score NUMERIC CHECK (forecasted_risk_score BETWEEN 0 AND 100),
    probability_of_issue NUMERIC, -- percentage
    primary_risk_factor TEXT,
    predicted_complaint_count NUMERIC,
    predicted_sentiment_score NUMERIC,
    recommended_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Predictive Calculation Function
CREATE OR REPLACE FUNCTION calculate_trip_risk(target_trip_id UUID)
RETURNS VOID AS $$
DECLARE
    -- Factors
    captain_risk NUMERIC := 0;
    vendor_risk NUMERIC := 0;
    dest_risk NUMERIC := 0;
    margin_risk NUMERIC := 0;
    sentiment_risk NUMERIC := 0;
    
    -- Data holders
    curr_trip RECORD;
    avg_captain_complaints NUMERIC;
    avg_vendor_drop NUMERIC;
    dest_complaint_rate NUMERIC;
    profit_margin NUMERIC;
    sentiment_drop NUMERIC;
    
    -- Result
    total_score NUMERIC;
    primary_factor TEXT := 'None';
    max_risk_val NUMERIC := 0;
BEGIN
    SELECT * INTO curr_trip FROM public.trips WHERE id = target_trip_id;
    IF NOT FOUND THEN RETURN; END IF;

    -- A. Historical Captain Risk (30%)
    -- risk = (avg_complaint_count / 5) * 100 (normalized, assuming >5 complaints is 100% risk)
    IF curr_trip.captain_id IS NOT NULL THEN
        SELECT AVG(complaint_count) INTO avg_captain_complaints
        FROM (
            SELECT complaint_count FROM public.performance_records 
            WHERE captain_id = curr_trip.captain_id 
            ORDER BY created_at DESC LIMIT 5
        ) sub;
        
        captain_risk := LEAST(COALESCE(avg_captain_complaints, 0) * 20, 100); -- 1 complaint = 20 risk
    END IF;

    -- B. Vendor Instability (20%)
    -- Avg reliability score drop in last 60 days. (Simplification: just 100 - avg_score)
    -- Ideally we track "drifts", but using raw score for MVP.
    SELECT (10 - AVG(reliability_score)) * 10 INTO vendor_risk
    FROM public.vendors v
    JOIN public.trip_vendors tv ON v.id = tv.vendor_id
    WHERE tv.trip_id = target_trip_id;
    
    vendor_risk := LEAST(COALESCE(vendor_risk, 0), 100);

    -- C. Destination Risk (15%)
    -- % of trips to this destination with complaints > 0
    SELECT 
        (COUNT(*) FILTER (WHERE risk_level = 'High')::NUMERIC / COUNT(*)::NUMERIC) * 100 
    INTO dest_risk
    FROM public.trips 
    WHERE destination = curr_trip.destination AND status = 'Completed';
    
    dest_risk := COALESCE(dest_risk, 0);

    -- D. Low Profit Margin (15%)
    -- If margin < 15%, risk = (15 - margin) * 10.
    IF curr_trip.total_revenue > 0 THEN
        profit_margin := ((curr_trip.total_revenue - curr_trip.total_cost) / curr_trip.total_revenue) * 100;
        IF profit_margin < 15 THEN
            margin_risk := LEAST((15 - profit_margin) * 5, 100);
        END IF;
    END IF;

    -- E. Early Sentiment Drift (20%)
    -- Check last 2 monitoring logs. If drop > 2.
    SELECT 
        COALESCE(MAX(check_in_sentiment) - MIN(check_in_sentiment), 0) INTO sentiment_drop
    FROM (
        SELECT check_in_sentiment FROM public.trip_monitoring 
        WHERE trip_id = target_trip_id 
        ORDER BY created_at DESC LIMIT 2
    ) sub;
    
    IF sentiment_drop > 2 THEN 
        sentiment_risk := 100; 
    ELSIF sentiment_drop > 0 THEN
        sentiment_risk := 50;
    END IF;

    -- CALC TOTAL
    -- Weights: Capt 0.3, Vend 0.2, Dest 0.15, Marg 0.15, Sent 0.2
    total_score := (captain_risk * 0.3) + (vendor_risk * 0.2) + (dest_risk * 0.15) + (margin_risk * 0.15) + (sentiment_risk * 0.2);

    -- Identify Primary Factor
    IF captain_risk > max_risk_val THEN max_risk_val := captain_risk; primary_factor := 'Captain History'; END IF;
    IF vendor_risk > max_risk_val THEN max_risk_val := vendor_risk; primary_factor := 'Vendor Instability'; END IF;
    IF dest_risk > max_risk_val THEN max_risk_val := dest_risk; primary_factor := 'Destination Risk'; END IF;
    IF margin_risk > max_risk_val THEN max_risk_val := margin_risk; primary_factor := 'Low Margin'; END IF;
    IF sentiment_risk > max_risk_val THEN max_risk_val := sentiment_risk; primary_factor := 'Sentiment Drift'; END IF;

    -- UPSERT Forecast
    INSERT INTO public.trip_risk_forecast (
        trip_id, forecasted_risk_score, probability_of_issue, primary_risk_factor, updated_at
    ) VALUES (
        target_trip_id, 
        total_score, 
        LEAST(total_score * 0.8, 99), -- simplistic prob calc
        primary_factor,
        NOW()
    )
    ON CONFLICT (trip_id) DO UPDATE SET -- Note: need constraint for this upsert to work, usually ID is PK.
    -- Actually, let's just insert a new record for history? 
    -- Master prompt implies a single current state or log? "Fields: created_at". 
    -- Let's assume log history is good, but for simplicity of querying "current risk", let's update.
    -- To do ON CONFLICT update, we need a unique constraint on trip_id.
    -- Or we can just DELETE old and INSERT new.
    -- Let's just INSERT.
    forecasted_risk_score = EXCLUDED.forecasted_risk_score,
    probability_of_issue = EXCLUDED.probability_of_issue,
    primary_risk_factor = EXCLUDED.primary_risk_factor,
    updated_at = NOW();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add Unique Constraint to allow UPSERT
ALTER TABLE public.trip_risk_forecast ADD CONSTRAINT trip_risk_forecast_trip_id_key UNIQUE (trip_id);

-- 3. Triggers to Re-calculate Risk
CREATE OR REPLACE FUNCTION trigger_recalc_risk()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_trip_risk(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_recalc_risk_monitoring()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_trip_risk(NEW.trip_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind
DROP TRIGGER IF EXISTS on_trip_change_risk ON public.trips;
CREATE TRIGGER on_trip_change_risk
AFTER UPDATE OF status, captain_id, total_revenue, total_cost ON public.trips
FOR EACH ROW EXECUTE FUNCTION trigger_recalc_risk();

DROP TRIGGER IF EXISTS on_monitoring_risk ON public.trip_monitoring;
CREATE TRIGGER on_monitoring_risk
AFTER INSERT ON public.trip_monitoring
FOR EACH ROW EXECUTE FUNCTION trigger_recalc_risk_monitoring();
