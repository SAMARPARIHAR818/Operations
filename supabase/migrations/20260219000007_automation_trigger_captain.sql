-- Automated Captain Performance Updates
CREATE OR REPLACE FUNCTION update_captain_performance()
RETURNS TRIGGER AS $$
DECLARE
    new_avg_score NUMERIC;
    old_avg_score NUMERIC;
    matches INT;
BEGIN
    -- 1. Get Old Score for comparison
    SELECT overall_score INTO old_avg_score FROM public.captains WHERE id = NEW.captain_id;

    -- 2. Recalculate Average Score from all performance records
    SELECT AVG(score) INTO new_avg_score
    FROM public.performance_records
    WHERE captain_id = NEW.captain_id;

    -- 3. Update Captain Table
    UPDATE public.captains
    SET 
        overall_score = COALESCE(new_avg_score, 0),
        trips_completed = (SELECT COUNT(*) FROM public.trips WHERE captain_id = NEW.captain_id AND status = 'Completed')
    WHERE id = NEW.captain_id;

    -- 4. Check for Performance Drop (>20%)
    IF old_avg_score IS NOT NULL AND old_avg_score > 0 THEN
        IF ((old_avg_score - new_avg_score) / old_avg_score) > 0.2 THEN
            -- Flag Risk
            INSERT INTO public.alerts (type, severity, reference_entity, reference_id, message)
            VALUES (
                'Performance',
                'Medium',
                'captain',
                NEW.captain_id,
                'Captain performance dropped by >20%'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger
DROP TRIGGER IF EXISTS on_performance_added ON public.performance_records;
CREATE TRIGGER on_performance_added
AFTER INSERT ON public.performance_records
FOR EACH ROW
EXECUTE FUNCTION update_captain_performance();
