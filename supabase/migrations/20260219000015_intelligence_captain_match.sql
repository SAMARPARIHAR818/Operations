-- Captain-Trip Match Predictor

-- Function to score a Captain for a specific Trip
CREATE OR REPLACE FUNCTION predict_captain_match_score(p_trip_id UUID, p_captain_id UUID)
RETURNS TABLE (
    match_score NUMERIC,
    confidence_level TEXT,
    match_reasons TEXT[]
) AS $$
DECLARE
    v_dest TEXT;
    v_capt_score NUMERIC;
    v_dest_xp INT;
    v_busy INT;
    v_score NUMERIC := 0;
    v_reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Get Trip Context
    SELECT destination INTO v_dest FROM public.trips WHERE id = p_trip_id;
    
    -- Get Captain Stats
    SELECT overall_score INTO v_capt_score FROM public.captains WHERE id = p_captain_id;

    -- 1. Overall Score (35%)
    -- Normalize 0-5 score to 0-35 points
    v_score := v_score + ((v_capt_score / 5.0) * 35);

    -- 2. Destination Experience (15%)
    -- Count past trips to this destination
    SELECT COUNT(*) INTO v_dest_xp 
    FROM public.trips 
    WHERE captain_id = p_captain_id AND destination = v_dest AND status = 'Completed';
    
    IF v_dest_xp > 5 THEN 
        v_score := v_score + 15;
        v_reasons := array_append(v_reasons, 'High Destination Ops Experience');
    ELSIF v_dest_xp > 0 THEN
        v_score := v_score + 10;
        v_reasons := array_append(v_reasons, 'Familiar with Destination');
    END IF;

    -- 3. Availability/Load Factor (10%)
    -- Check active trips
    SELECT COUNT(*) INTO v_busy
    FROM public.trips
    WHERE captain_id = p_captain_id AND status IN ('Live', 'Upcoming');
    
    IF v_busy = 0 THEN
        v_score := v_score + 10;
        v_reasons := array_append(v_reasons, 'High Availability');
    ELSIF v_busy < 3 THEN
        v_score := v_score + 5;
    ELSE
        v_score := v_score - 10; -- Penalize if overloaded
        v_reasons := array_append(v_reasons, 'Captain Overloaded');
    END IF;

    -- 4. Placeholder for "Stress Handling" (15%) and "Type Match" (25%)
    -- For MVP, we give base points
    v_score := v_score + 25; 

    -- Finalize
    match_score := LEAST(v_score, 100);
    
    -- Confidence Level
    IF match_score > 80 THEN confidence_level := 'High';
    ELSIF match_score > 60 THEN confidence_level := 'Medium';
    ELSE confidence_level := 'Low';
    END IF;

    RETURN QUERY SELECT match_score, confidence_level, v_reasons;
END;
$$ LANGUAGE plpgsql;
