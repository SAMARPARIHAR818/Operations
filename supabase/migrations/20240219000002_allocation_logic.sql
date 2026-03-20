-- Function to Recommend Captains for a Trip
CREATE OR REPLACE FUNCTION recommend_captains_for_trip(p_trip_id UUID)
RETURNS TABLE (
    captain_id UUID,
    captain_name TEXT,
    match_score FLOAT,
    overall_score FLOAT,
    type_match_score FLOAT,
    dest_match_score FLOAT,
    availability_score FLOAT
) AS $$
DECLARE
    v_trip_record trips%ROWTYPE;
BEGIN
    -- Get trip details
    SELECT * INTO v_trip_record FROM trips WHERE id = p_trip_id;
    
    IF v_trip_record IS NULL THEN
        RAISE EXCEPTION 'Trip not found';
    END IF;

    RETURN QUERY
    SELECT
        c.id AS captain_id,
        c.full_name AS captain_name,
        (
            (COALESCE(c.captain_overall_score, 0) * 0.40) +
            (
                CASE 
                    WHEN v_trip_record.trip_type = ANY(c.preferred_trip_type) THEN 100.0 
                    ELSE 0.0 
                END * 0.25
            ) +
            (
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM trips t 
                        WHERE t.captain_id = c.id 
                        AND t.destination = v_trip_record.destination 
                        AND t.status = 'Completed'
                        AND t.trip_health_score > 70
                    ) THEN 100.0
                    ELSE 0.0
                END * 0.20
            ) +
            (
                -- Availability Score: 100 if available, 0 if busy
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM trips t
                        WHERE t.captain_id = c.id
                        AND t.status IN ('Upcoming', 'Live')
                        AND t.id != p_trip_id -- Exclude current trip if already assigned (though unlikely for recommendation)
                        AND t.start_date <= v_trip_record.end_date
                        AND t.end_date >= v_trip_record.start_date
                    ) THEN 0.0
                    ELSE 100.0
                END * 0.15
            )
        )::FLOAT AS match_score,
        COALESCE(c.captain_overall_score, 0)::FLOAT AS overall_score,
        (CASE WHEN v_trip_record.trip_type = ANY(c.preferred_trip_type) THEN 100.0 ELSE 0.0 END)::FLOAT AS type_match_score,
        (CASE WHEN EXISTS (SELECT 1 FROM trips t WHERE t.captain_id = c.id AND t.destination = v_trip_record.destination AND t.status = 'Completed' AND t.trip_health_score > 70) THEN 100.0 ELSE 0.0 END)::FLOAT AS dest_match_score,
        (CASE WHEN EXISTS (SELECT 1 FROM trips t WHERE t.captain_id = c.id AND t.status IN ('Upcoming', 'Live') AND t.id != p_trip_id AND t.start_date <= v_trip_record.end_date AND t.end_date >= v_trip_record.start_date) THEN 0.0 ELSE 100.0 END)::FLOAT AS availability_score
    FROM captains c
    WHERE c.status = 'Active'
    ORDER BY match_score DESC
    LIMIT 3;
END;
$$ LANGUAGE plpgsql;
