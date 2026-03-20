-- Function to calculate Captain Overall Score
CREATE OR REPLACE FUNCTION calculate_captain_score() RETURNS TRIGGER AS $$
BEGIN
    NEW.captain_overall_score := (
        (COALESCE(NEW.leadership_score, 0) * 0.25) +
        (COALESCE(NEW.communication_score, 0) * 0.20) +
        (COALESCE(NEW.crisis_handling_score, 0) * 0.20) +
        (COALESCE(NEW.engagement_score, 0) * 0.15) +
        (COALESCE(NEW.reliability_score, 0) * 0.10) +
        (COALESCE(NEW.instagram_presence_score, 0) * 0.10)
    ) * 10; -- Normalize 1-10 scale to 0-100
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_captain_score_trigger
BEFORE INSERT OR UPDATE ON captains
FOR EACH ROW
EXECUTE FUNCTION calculate_captain_score();

-- Function to calculate Applicant Score
CREATE OR REPLACE FUNCTION calculate_applicant_score() RETURNS TRIGGER AS $$
BEGIN
    NEW.applicant_score := (
        (COALESCE(NEW.communication_score, 0) * 0.3) +
        (COALESCE(NEW.confidence_score, 0) * 0.2) +
        (COALESCE(NEW.leadership_potential_score, 0) * 0.3) +
        (COALESCE(NEW.maturity_score, 0) * 0.2)
    );
    -- Check if recommended is handled by GENERATED ALWAYS column, if not, could set here.
    -- In schema it is GENERATED ALWAYS, so we just calculate the score.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applicant_score_trigger
BEFORE INSERT OR UPDATE ON captain_applicants
FOR EACH ROW
EXECUTE FUNCTION calculate_applicant_score();

-- Function to calculate Vendor Score
CREATE OR REPLACE FUNCTION calculate_vendor_score() RETURNS TRIGGER AS $$
BEGIN
    NEW.vendor_score := (
        (COALESCE(NEW.reliability_score, 0) * 0.40) +
        (COALESCE(NEW.average_rating, 0) * 0.30) +
        (LEAST(10, GREATEST(0, (10 - COALESCE(NEW.escalation_incidents, 0)))) * 0.15) +
        (LEAST(10, GREATEST(0, (10 - COALESCE(NEW.cancellation_history, 0)))) * 0.15)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_score_trigger
BEFORE INSERT OR UPDATE ON vendors
FOR EACH ROW
EXECUTE FUNCTION calculate_vendor_score();

-- Function to calculate Performance Rating
CREATE OR REPLACE FUNCTION calculate_performance_rating() RETURNS TRIGGER AS $$
DECLARE
    upsell_val FLOAT;
BEGIN
    IF NEW.upsell_success THEN
        upsell_val := 5;
    ELSE
        upsell_val := 0;
    END IF;

    NEW.final_rating := (
        (COALESCE(NEW.trip_nps, 0) * 0.30) + -- Assuming NPS is normalized to 0-10 or handled elsewhere, treating as raw input
        (COALESCE(NEW.group_engagement_score, 0) * 0.20) +
        (COALESCE(NEW.punctuality_score, 0) * 0.15) +
        (COALESCE(NEW.issue_resolution_score, 0) * 0.20) +
        (upsell_val * 0.15)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_performance_rating_trigger
BEFORE INSERT OR UPDATE ON performance_records
FOR EACH ROW
EXECUTE FUNCTION calculate_performance_rating();

-- Function to calculate Trip Health & Risk
-- This needs to handle updates from both 'trips' and 'trip_monitoring'.
-- Since cross-table triggers are complex, we will create triggers on both tables that update the 'trips' table.

-- 1. Helper Function to Calculate Compliance Score (used in logic)
CREATE OR REPLACE FUNCTION compute_compliance_score(
    p_morning boolean,
    p_itinerary boolean,
    p_wakeup boolean,
    p_vendor boolean,
    p_proof boolean,
    p_complaints integer,
    p_sentiment float
) RETURNS FLOAT AS $$
DECLARE
    score FLOAT;
BEGIN
    score := (
        (CASE WHEN p_morning THEN 15 ELSE 0 END) +
        (CASE WHEN p_itinerary THEN 15 ELSE 0 END) +
        (CASE WHEN p_wakeup THEN 15 ELSE 0 END) +
        (CASE WHEN p_vendor THEN 20 ELSE 0 END) +
        (CASE WHEN p_proof THEN 20 ELSE 0 END) +
        (LEAST(10, GREATEST(0, (10 - COALESCE(p_complaints, 0)))) * 5) +
        (COALESCE(p_sentiment, 0) * 10)
    );
    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger Function when Trip Monitoring changes (updates Trip)
CREATE OR REPLACE FUNCTION update_trip_from_monitoring() RETURNS TRIGGER AS $$
DECLARE
    v_compliance FLOAT;
    v_risk risk_level;
    v_trip_health FLOAT;
    v_profit_margin FLOAT;
    v_cancellation_rate FLOAT;
    v_gross_profit NUMERIC;
    v_total_revenue NUMERIC;
    v_trip_record record;
BEGIN
    -- Calculate Compliance Score
    v_compliance := compute_compliance_score(
        NEW.morning_update_received,
        NEW.itinerary_shared,
        NEW.wakeup_done,
        NEW.vendor_coordination_done,
        NEW.activity_proof_uploaded,
        NEW.complaint_count,
        NEW.sentiment_score
    );

    -- Fetch Trip details to calculate Trip Health
    SELECT * INTO v_trip_record FROM trips WHERE id = NEW.trip_id;
    
    -- If score changes, we need to update the trip record
    -- We'll perform the Trip Health Calculation here or in the Trip trigger?
    -- Better to update the compliance score on the trip, and let the trip trigger handle the rest.
    -- However, circular updates can be tricky. Let's do it in one go if possible.
    
    -- Update fields on Trip table
    UPDATE trips 
    SET 
        compliance_score = v_compliance,
        group_sentiment_score = NEW.sentiment_score, -- Sync sentiment
        risk_level = (
            CASE 
                WHEN NEW.complaint_count > 5 THEN 'High'::risk_level
                WHEN NEW.sentiment_score < 5 THEN 'High'::risk_level
                WHEN v_compliance < 60 THEN 'High'::risk_level
                -- Profit margin check requires querying trip data, handled in next trigger step or here
                ELSE risk_level -- Keep existing if specific monitoring checks don't flag high? Or re-evaluate?
                -- Ideally re-evaluate full risk logic.
            END
        )
    WHERE id = NEW.trip_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trip_from_monitoring_trigger
AFTER INSERT OR UPDATE ON trip_monitoring
FOR EACH ROW
EXECUTE FUNCTION update_trip_from_monitoring();

-- 3. Trigger Function on Trips Table (Calculates Profit, Health, Risk)
CREATE OR REPLACE FUNCTION calculate_trip_metrics() RETURNS TRIGGER AS $$
DECLARE
    v_profit_margin FLOAT;
    v_health_score FLOAT;
    v_new_risk risk_level;
BEGIN
    -- Calculate Profit Margin
    IF NEW.total_revenue > 0 THEN
        v_profit_margin := ((NEW.total_revenue - NEW.total_cost) / NEW.total_revenue) * 100;
    ELSE
        v_profit_margin := 0;
    END IF;

    -- Calculate Trip Health Score
    -- Formula: (profit_margin * 0.35 + sentiment * 0.25 + compliance * 0.20 + (10 - cancellation) * 0.20) normalized
    -- Assuming Sentiment (1-10) needs scaling to match profit (0-100) and compliance (0-100)
    -- Scaling: Sentiment * 10, (10-Cancellation) * 10
    v_health_score := (
        (v_profit_margin * 0.35) +
        (COALESCE(NEW.group_sentiment_score, 0) * 10 * 0.25) +
        (COALESCE(NEW.compliance_score, 0) * 0.20) +
        (LEAST(10, GREATEST(0, (10 - COALESCE(NEW.cancellation_rate, 0)))) * 10 * 0.20)
    );
    -- Normalize? Result is already on ~0-100 scale based on components.
    NEW.trip_health_score := LEAST(100, GREATEST(0, v_health_score));

    -- Risk Level Logic
    -- Determine Risk Level Re-evaluation
    v_new_risk := 'Low'; -- Default
    
    -- High Risk Checks
    -- Check 1: Monitoring fields (compliance, sentiment) might serve as input.
    -- Need to ensure we don't overwrite High risk set by Monitoring Trigger if we don't have enough info, 
    -- but here we have all info on the record.
    
    -- From Prompt:
    -- IF complaint_count > 5 (Not directly on Trip, but on Monitoring. We synced logic?)
    -- Let's assume Monitoring syncs crucial data or we query it. 
    -- For simplicity, let's look at the triggers we have: 
    -- Trip has: group_sentiment_score, compliance_score, profit_margin (calculated).
    -- Missing: complaint_count directly on trips. 
    -- Decision: Trust that risk is updated, but let's reinforce conditions we can check.
    
    IF v_profit_margin < 10 THEN
        v_new_risk := 'High';
    ELSIF NEW.group_sentiment_score < 5 THEN
        v_new_risk := 'High';
    ELSIF NEW.compliance_score < 60 THEN
        v_new_risk := 'High';
    ELSIF NEW.risk_level = 'High' THEN
         -- If already set to High (e.g. by Monitoring trigger for complaints), keep High?
         -- Or re-evaluate? The prompt implies "IF ... OR ... OR ... THEN High". 
         -- If any condition met, High.
         v_new_risk := 'High';
    ELSE
         -- Moderate Check (Prompt says: Else if moderate -> Medium. No definition for moderate)
         -- Let's define Moderate: Health < 50?
         IF v_health_score < 50 THEN
             v_new_risk := 'Medium';
         END IF;
    END IF;

    NEW.risk_level := v_new_risk;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trip_metrics_trigger
BEFORE INSERT OR UPDATE ON trips
FOR EACH ROW
EXECUTE FUNCTION calculate_trip_metrics();
