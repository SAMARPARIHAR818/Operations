-- Profit Forecast Engine & View

-- 1. Create a View for Real-time Financial Health
CREATE OR REPLACE VIEW public.forecasted_profit_view AS
SELECT 
    t.id AS trip_id,
    t.destination,
    t.status,
    t.total_revenue,
    t.total_cost AS current_cost,
    
    -- Projected Cost Logic: 
    -- If active, assume 10% overrun on top of current cost? 
    -- Or simple: (Current Cost / Days Elapsed) * Total Days?
    -- Let's use a simpler heuristic for MVP: Cost * 1.05 (5% buffer)
    (t.total_cost * 1.05) AS projected_final_cost,

    -- Projected Profit
    (t.total_revenue - (t.total_cost * 1.05)) AS projected_profit,

    -- Projected Margin %
    CASE WHEN t.total_revenue > 0 THEN
        ((t.total_revenue - (t.total_cost * 1.05)) / t.total_revenue) * 100
    ELSE 0 END AS projected_margin,

    -- Health Status
    CASE 
        WHEN ((t.total_revenue - t.total_cost) / NULLIF(t.total_revenue,0)) * 100 > 25 THEN 'Strong'
        WHEN ((t.total_revenue - t.total_cost) / NULLIF(t.total_revenue,0)) * 100 BETWEEN 15 AND 25 THEN 'Stable'
        WHEN ((t.total_revenue - t.total_cost) / NULLIF(t.total_revenue,0)) * 100 BETWEEN 10 AND 15 THEN 'Weak'
        ELSE 'At Risk'
    END AS profit_health_status

FROM public.trips t;

-- 2. Anomaly Detection for Profit (Trigger)
CREATE OR REPLACE FUNCTION detect_financial_anomalies()
RETURNS TRIGGER AS $$
BEGIN
    -- If Margin drops below 10% suddenly or Cost jumps > 20%
    IF (NEW.total_cost > OLD.total_cost * 1.20) THEN
        INSERT INTO public.alerts (type, severity, reference_entity, reference_id, message)
        VALUES ('Finance', 'High', 'trip', NEW.id, 'Cost spiked by >20%');
        
        -- Log Anomaly
        -- (Assuming anomaly_logs table exists or using system_logs)
        INSERT INTO public.system_logs (log_level, source, message, details)
        VALUES ('WARN', 'anomaly:finance', 'Cost Spike Detected', jsonb_build_object('trip_id', NEW.id, 'old', OLD.total_cost, 'new', NEW.total_cost));
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_finance_check ON public.trips;
CREATE TRIGGER on_finance_check
AFTER UPDATE OF total_revenue, total_cost ON public.trips
FOR EACH ROW EXECUTE FUNCTION detect_financial_anomalies();
