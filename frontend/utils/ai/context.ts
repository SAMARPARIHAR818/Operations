import { createClient } from "@/utils/supabase/server";

export type SystemContext = {
    highRiskTrips: any[];
    complianceIssues: any[];
    vendorAlerts: any[];
    recentAnomalies: any[];
    stats: any;
};

export async function getSystemContext(): Promise<SystemContext> {
    const supabase = createClient();

    // 1. High Risk Trips (Forecasted Risk > 70 or Status Risk = High)
    const { data: riskTrips } = await supabase
        .from('trips')
        .select('id, destination, captain_id, risk_level, status')
        .eq('risk_level', 'High')
        .eq('status', 'Live')
        .limit(5);

    // 2. Compliance Issues (Low scores in monitoring)
    const { data: compliance } = await supabase
        .from('trip_monitoring')
        .select('trip_id, compliance_score, check_in_status')
        .lt('compliance_score', 70)
        .order('created_at', { ascending: false })
        .limit(5);

    // 3. Vendor Alerts (From alerts table or logic)
    const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_read', false)
        .eq('type', 'Risk')
        .limit(5);

    // 4. Financial/Stats Overview
    const { data: stats } = await supabase.rpc('get_dashboard_stats'); // Assuming we made this, or we query directly
    // Fallback if RPC doesn't exist yet
    const { data: tripStats } = await supabase.from('trips').select('total_revenue, total_cost').eq('status', 'Completed');

    // Simplistic Aggregation if RPC missing
    const totalRev = tripStats?.reduce((acc, t) => acc + (t.total_revenue || 0), 0) || 0;
    const totalCost = tripStats?.reduce((acc, t) => acc + (t.total_cost || 0), 0) || 0;
    const margin = totalRev > 0 ? ((totalRev - totalCost) / totalRev) * 100 : 0;

    return {
        highRiskTrips: riskTrips || [],
        complianceIssues: compliance || [],
        vendorAlerts: alerts || [],
        recentAnomalies: [], // TODO: query anomaly_logs
        stats: {
            revenue: totalRev,
            margin: margin.toFixed(1) + '%'
        }
    };
}

export function formatContextForPrompt(ctx: SystemContext): string {
    return `
    SYSTEM CONTEXT (LIVE DATA):
    - High Risk LIVE Trips: ${JSON.stringify(ctx.highRiskTrips)}
    - Recent Compliance Issues: ${JSON.stringify(ctx.complianceIssues)}
    - Active Alerts: ${JSON.stringify(ctx.vendorAlerts)}
    - Financial Health: Margin ${ctx.stats.margin}
    `;
}
