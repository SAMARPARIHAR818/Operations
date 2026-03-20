-- Sentiment Drift Analyzer
CREATE OR REPLACE FUNCTION analyze_sentiment_drift()
RETURNS TRIGGER AS $$
DECLARE
    last_sentiments NUMERIC[];
    trend_status TEXT := 'Stable';
    rec_action TEXT := NULL;
BEGIN
    -- Get last 3 sentiment scores
    SELECT ARRAY_AGG(check_in_sentiment ORDER BY created_at DESC) 
    INTO last_sentiments
    FROM (
        SELECT check_in_sentiment FROM public.trip_monitoring
        WHERE trip_id = NEW.trip_id
        LIMIT 3
    ) sub;

    -- Logic: If we have at least 2 points
    IF array_length(last_sentiments, 1) >= 2 THEN
        -- Case: Rapid Decline (Difference > 2 between latest and previous)
        IF (last_sentiments[2] - last_sentiments[1]) >= 2 THEN
            trend_status := 'Declining Rapidly';
            rec_action := 'Mid-Trip Ops Call';
            
            -- Trigger Critical Alert
            INSERT INTO public.alerts (type, severity, reference_entity, reference_id, message)
            VALUES (
                'Risk', 
                'High', 
                'trip', 
                NEW.trip_id, 
                'Sentiment Drift Detected: dropped from ' || last_sentiments[2] || ' to ' || last_sentiments[1]
            );
        ELSIF last_sentiments[1] < last_sentiments[2] THEN
            trend_status := 'Declining';
        ELSIF last_sentiments[1] > last_sentiments[2] THEN
            trend_status := 'Improving';
        END IF;
    END IF;

    -- Update Risk Forecast metadata
    UPDATE public.trip_risk_forecast
    SET 
        predicted_sentiment_score = NEW.check_in_sentiment, -- current is best predictor of next
        recommended_action = COALESCE(rec_action, recommended_action)
    WHERE trip_id = NEW.trip_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger (Separate from Risk Calc to keep logic modular)
DROP TRIGGER IF EXISTS on_sentiment_check ON public.trip_monitoring;
CREATE TRIGGER on_sentiment_check
AFTER INSERT ON public.trip_monitoring
FOR EACH ROW EXECUTE FUNCTION analyze_sentiment_drift();
