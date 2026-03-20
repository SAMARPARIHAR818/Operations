-- Verification Script for Bookido Ops OS

-- 1. Setup: Clear tables
TRUNCATE TABLE trip_vendors, performance_records, tasks, trip_monitoring, trips, captain_applicants, vendors, captains, user_roles RESTART IDENTITY CASCADE;

-- 2. Verify Captain Scoring
INSERT INTO captains (
    full_name, phone, email, status, 
    leadership_score, communication_score, crisis_handling_score, 
    engagement_score, reliability_score, instagram_presence_score,
    preferred_trip_type
) VALUES (
    'Jack Sparrow', '1234567890', 'jack@blackpearl.com', 'Active',
    8, 9, 10, 7, 5, 8, -- Scores
    ARRAY['Party', 'Explorer']::trip_type[]
);

DO $$ 
DECLARE 
    v_score FLOAT;
BEGIN
    SELECT captain_overall_score INTO v_score FROM captains WHERE email = 'jack@blackpearl.com';
    IF v_score IS NULL THEN RAISE EXCEPTION 'Captain score not calculated'; END IF;
    -- Expected: (8*0.25 + 9*0.20 + 10*0.20 + 7*0.15 + 5*0.10 + 8*0.10) * 10
    -- = (2 + 1.8 + 2 + 1.05 + 0.5 + 0.8) * 10 = 8.15 * 10 = 81.5
    RAISE NOTICE 'Captain Score: % (Expected 81.5)', v_score;
END $$;

-- 3. Verify Applicant Scoring
INSERT INTO captain_applicants (
    full_name, communication_score, confidence_score, leadership_potential_score, maturity_score
) VALUES (
    'Will Turner', 8, 7, 6, 9
);

DO $$
DECLARE
    v_score FLOAT;
    v_rec BOOLEAN;
BEGIN
    SELECT applicant_score, is_recommended INTO v_score, v_rec FROM captain_applicants WHERE full_name = 'Will Turner';
    -- Expected: 8*0.3 + 7*0.2 + 6*0.3 + 9*0.2 = 2.4 + 1.4 + 1.8 + 1.8 = 7.4
    RAISE NOTICE 'Applicant Score: % (Expected 7.4)', v_score;
    RAISE NOTICE 'Is Recommended: % (Expected False)', v_rec;
END $$;

-- 4. Verify Trip & Monitoring (Risk & Health)
-- Create Trip
INSERT INTO trips (
    destination, start_date, end_date, trip_type, captain_id,
    total_revenue, total_cost, expected_pax, confirmed_pax
) VALUES (
    'Tortuga', DATE '2024-06-01', DATE '2024-06-07', 'Party', 
    (SELECT id FROM captains WHERE email = 'jack@blackpearl.com'),
    10000, 7000, 10, 10
);

-- Initial State check
DO $$
DECLARE
    v_health FLOAT;
    v_risk risk_level;
BEGIN
    SELECT trip_health_score, risk_level INTO v_health, v_risk FROM trips WHERE destination = 'Tortuga';
    RAISE NOTICE 'Initial Trip Health: %, Risk: %', v_health, v_risk;
END $$;

-- Add Monitoring Entry with High Risk indicators
INSERT INTO trip_monitoring (
    trip_id, date, 
    complaint_count, sentiment_score, 
    morning_update_received, itinerary_shared
) VALUES (
    (SELECT id FROM trips WHERE destination = 'Tortuga'), CURRENT_DATE,
    6, 3, -- High complain (>5) and Low sentiment (<5) -> Should trigger High Risk
    TRUE, TRUE
);

-- Check Trip Update
DO $$
DECLARE
    v_health FLOAT;
    v_risk risk_level;
    v_compliance FLOAT;
BEGIN
    SELECT trip_health_score, risk_level, compliance_score 
    INTO v_health, v_risk, v_compliance 
    FROM trips WHERE destination = 'Tortuga';
    
    RAISE NOTICE 'Updated Trip - Health: %, Risk: %, Compliance: %', v_health, v_risk, v_compliance;
    
    IF v_risk != 'High' THEN
        RAISE WARNING 'Risk Level did not update to High as expected!';
    ELSE
        RAISE NOTICE 'Risk Level correctly updated to High.';
    END IF;
END $$;

-- 5. Verify Captain Allocation
-- Jack has: Overall ~81.5. Prefers Party. Destination History: None yet. Availability: Free (Trip is June, check overlap logic if we query for same dates)

-- Let's query for a trip in July
DO $$
DECLARE
    rec record;
BEGIN
    RAISE NOTICE 'Recommending captains for Trip ID matching Tortuga...';
    FOR rec IN SELECT * FROM recommend_captains_for_trip((SELECT id FROM trips WHERE destination = 'Tortuga')) LOOP
        RAISE NOTICE 'Recommended: % (Score: %)', rec.captain_name, rec.match_score;
    END LOOP;
END $$;

-- 6. Verify Vendor Scoring
INSERT INTO vendors (
    vendor_name, vendor_type, reliability_score, average_rating, escalation_incidents
) VALUES (
    'East India Trading Co', 'Transport', 9, 8, 1
);

DO $$
DECLARE
    v_score FLOAT;
BEGIN
    SELECT vendor_score INTO v_score FROM vendors WHERE vendor_name = 'East India Trading Co';
    -- Expected: 9*0.4 + 8*0.3 + (10-1)*0.15 + (10-0)*0.15 
    -- = 3.6 + 2.4 + 1.35 + 1.5 = 8.85
    RAISE NOTICE 'Vendor Score: % (Expected 8.85)', v_score;
END $$;

DO $$
BEGIN
    RAISE NOTICE 'Verification Completed.';
END $$;
