-- Executive Insight Generator

-- 1. Table to store weekly snapshots
CREATE TABLE IF NOT EXISTS public.weekly_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    week_start_date DATE DEFAULT CURRENT_DATE,
    summary_json JSONB, -- Stores the full report structure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Generation Function
CREATE OR REPLACE FUNCTION generate_weekly_insights()
RETURNS VOID AS $$
DECLARE
    json_report JSONB;
BEGIN
    SELECT jsonb_build_object(
        'top_captains', (
            SELECT jsonb_agg(sub) FROM (
                SELECT name, overall_score FROM public.captains ORDER BY overall_score DESC LIMIT 3
            ) sub
        ),
        'bottom_captains', (
            SELECT jsonb_agg(sub) FROM (
                SELECT name, overall_score FROM public.captains ORDER BY overall_score ASC LIMIT 2
            ) sub
        ),
        'high_risk_destinations', (
            SELECT jsonb_agg(sub) FROM (
                SELECT destination, COUNT(*) as risks FROM public.trips WHERE risk_level = 'High' GROUP BY destination ORDER BY risks DESC LIMIT 1
            ) sub
        ),
        'financial_trend', (
            SELECT jsonb_build_object(
                'total_revenue', SUM(total_revenue),
                'total_profit', SUM(total_revenue - total_cost),
                'avg_margin', AVG( (total_revenue - total_cost) / NULLIF(total_revenue,0) ) * 100
            ) FROM public.trips WHERE created_at > NOW() - INTERVAL '7 days'
        ),
        'generated_at', NOW()
    ) INTO json_report;

    INSERT INTO public.weekly_insights (summary_json) VALUES (json_report);

    -- Optional: Trigger Notification that report is ready
    INSERT INTO public.notifications (role_target, title, message, type, link)
    VALUES ('admin', 'Weekly Executive Insights Ready', 'Your new weekly report has been generated.', 'Info', '/reports');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
