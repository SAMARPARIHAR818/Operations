-- Automated Risk Detection
CREATE OR REPLACE FUNCTION detect_risk_updates()
RETURNS TRIGGER AS $$
DECLARE
    curr_trip_id UUID;
    curr_compliance NUMERIC;
    curr_sentiment NUMERIC;
    curr_margin NUMERIC;
    is_risk BOOLEAN := FALSE;
    risk_reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Determine context (Trip update or Monitoring update)
    IF TG_TABLE_NAME = 'trip_monitoring' THEN
        curr_trip_id := NEW.trip_id;
        curr_compliance := NEW.compliance_score;
        curr_sentiment := NEW.check_in_sentiment; -- Assuming check_in_sentiment is numeric 1-10 or we cast it
        
        -- Fetch profit from parent trip if needed, or optimization: skip profit check here
    ELSIF TG_TABLE_NAME = 'trips' THEN
        curr_trip_id := NEW.id;
        -- Calculate profit margin: (Revenue - Cost) / Revenue
        IF NEW.total_revenue > 0 THEN
            curr_margin := ((NEW.total_revenue - NEW.total_cost) / NEW.total_revenue) * 100;
        ELSE
            curr_margin := 0;
        END IF;
    END IF;

    -- CHECK 1: Compliance < 60%
    IF curr_compliance IS NOT NULL AND curr_compliance < 60 THEN
        is_risk := TRUE;
        risk_reasons := array_append(risk_reasons, 'Compliance Critical (<60%)');
    END IF;

    -- CHECK 2: Sentiment Bad (assuming 1-10 scale)
    IF curr_sentiment IS NOT NULL AND curr_sentiment < 5 THEN
        is_risk := TRUE;
        risk_reasons := array_append(risk_reasons, 'Negative Sentiment Detected');
    END IF;

    -- CHECK 3: Low Profit Margin < 10% (Only for Trip updates)
    IF curr_margin IS NOT NULL AND curr_margin < 10 THEN
        is_risk := TRUE;
        risk_reasons := array_append(risk_reasons, 'Low Profit Margin (<10%)');
    END IF;

    -- EXECUTE RISK ACTION
    IF is_risk THEN
        -- 1. Update Trip Risk Level
        UPDATE public.trips 
        SET risk_level = 'High'
        WHERE id = curr_trip_id;

        -- 2. Create Alert
        INSERT INTO public.alerts (type, severity, reference_entity, reference_id, message)
        VALUES (
            'Risk',
            'High',
            'trip',
            curr_trip_id,
            'Risk Detected: ' || array_to_string(risk_reasons, ', ')
        );

        -- 3. Notify Admins
        INSERT INTO public.notifications (role_target, title, message, type)
        VALUES (
            'admin',
            'High Risk Detected',
            'Trip ' || curr_trip_id || ' flagged: ' || array_to_string(risk_reasons, ', '),
            'Warning'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Triggers
DROP TRIGGER IF EXISTS on_monitoring_risk_check ON public.trip_monitoring;
CREATE TRIGGER on_monitoring_risk_check
AFTER INSERT OR UPDATE ON public.trip_monitoring
FOR EACH ROW
EXECUTE FUNCTION detect_risk_updates();

DROP TRIGGER IF EXISTS on_trip_profit_check ON public.trips;
CREATE TRIGGER on_trip_profit_check
AFTER UPDATE OF total_revenue, total_cost ON public.trips
FOR EACH ROW
EXECUTE FUNCTION detect_risk_updates();
