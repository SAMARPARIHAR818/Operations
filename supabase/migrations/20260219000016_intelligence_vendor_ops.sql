-- 1. Vendor Reliability Drift
-- Logic: If vendor reliability drops > 2 points in 30 days.
-- For MVP, we'll use a Trigger on the 'vendors' table assuming 'reliability_score' updates.
CREATE OR REPLACE FUNCTION analyze_vendor_drift()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if score dropped by > 2
    IF OLD.reliability_score - NEW.reliability_score > 2 THEN
        INSERT INTO public.alerts (type, severity, reference_entity, reference_id, message)
        VALUES (
            'Risk',
            'Medium',
            'vendor',
            NEW.id,
            'Vendor Stability Concern: Reliability dropped by ' || (OLD.reliability_score - NEW.reliability_score)
        );
        -- Recommendation?
        -- Could log to a 'vendor_logs' table if it existed.
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_vendor_score_change ON public.vendors;
CREATE TRIGGER on_vendor_score_change
AFTER UPDATE OF reliability_score ON public.vendors
FOR EACH ROW EXECUTE FUNCTION analyze_vendor_drift();


-- 2. Ops Efficiency Analyzer (View)
-- Formula: (compliance_avg * 0.3) + (on_time_tasks * 0.3) + (low_risk_rate * 0.2) + (profit_health * 0.2)
CREATE OR REPLACE VIEW public.ops_efficiency_view AS
WITH task_metrics AS (
    SELECT 
        COUNT(*) AS total_tasks,
        COUNT(*) FILTER (WHERE status = 'Completed' AND due_date >= updated_at) AS on_time_tasks
    FROM public.tasks
),
trip_metrics AS (
    SELECT 
        COUNT(*) AS total_trips,
        AVG( COALESCE( (SELECT AVG(compliance_score) FROM public.trip_monitoring WHERE trip_id = t.id), 100 ) ) AS avg_compliance,
        COUNT(*) FILTER (WHERE risk_level = 'Low') AS low_risk_trips,
        COUNT(*) FILTER (WHERE risk_level = 'High') AS high_risk_trips
    FROM public.trips t
    WHERE status != 'Cancelled'
)
SELECT 
    -- 1. Compliance Score (0-100)
    ROUND(tm.avg_compliance, 2) AS compliance_metric,
    
    -- 2. On Time Task Rate (0-100)
    ROUND((ts.on_time_tasks::NUMERIC / NULLIF(ts.total_tasks, 0)) * 100, 2) AS task_metric,
    
    -- 3. Low Risk Rate (0-100)
    ROUND((tm.low_risk_trips::NUMERIC / NULLIF(tm.total_trips, 0)) * 100, 2) AS risk_metric,
    
    -- 4. Ops Efficiency Score (Weighted)
    ROUND(
        (COALESCE(tm.avg_compliance, 100) * 0.30) +
        (COALESCE((ts.on_time_tasks::NUMERIC / NULLIF(ts.total_tasks, 0)) * 100, 100) * 0.30) +
        (COALESCE((tm.low_risk_trips::NUMERIC / NULLIF(tm.total_trips, 0)) * 100, 100) * 0.20) +
        (85 * 0.20) -- Placeholder for Profit Health Avg (assuming 'Strong' ~ 85 for now)
    , 1) AS ops_efficiency_score,
    
    -- 5. Level
    CASE 
        WHEN (COALESCE(tm.avg_compliance, 100) * 0.3 + ... ) > 85 THEN 'Elite'
        WHEN (COALESCE(tm.avg_compliance, 100) * 0.3 + ... ) > 70 THEN 'Strong'
        WHEN (COALESCE(tm.avg_compliance, 100) * 0.3 + ... ) > 50 THEN 'Improving'
        ELSE 'Weak'
    END AS efficiency_level

FROM trip_metrics tm, task_metrics ts;
