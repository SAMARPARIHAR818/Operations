export const dynamic = "force-dynamic";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    const supabase = await createClient();

    // 1. Fetch Candidates for Priority
    // - High Risk Trips
    const { data: riskyTrips } = await supabase
        .from('trips')
        .select('id, destination, risk_level, status')
        .eq('risk_level', 'High')
        .eq('status', 'Live');

    // - Overdue Tasks
    const { data: overdueTasks } = await supabase
        .from('tasks')
        .select('id, title, due_date, priority')
        .eq('status', 'Pending')
        .lt('due_date', new Date().toISOString());

    // - Low Compliance
    const { data: lowCompliance } = await supabase
        .from('trip_monitoring')
        .select('trip_id, compliance_score')
        .lt('compliance_score', 60)
        .order('created_at', { ascending: false })
        .limit(5);

    // 2. Rank Logic
    let priorities: any[] = [];

    // A. High Risk Trips (Weight: 40)
    riskyTrips?.forEach(trip => {
        priorities.push({
            id: trip.id,
            title: `Monitor High Risk Trip: ${trip.destination}`,
            type: 'Trip',
            impact_score: 90, // Base high
            reason: 'Trip is marked High Risk'
        });
    });

    // B. Overdue High Priority Tasks (Weight: 30)
    overdueTasks?.forEach(task => {
        const score = task.priority === 'High' ? 85 : 50;
        priorities.push({
            id: task.id,
            title: `Overdue: ${task.title}`,
            type: 'Task',
            impact_score: score,
            reason: `Task is overdue since ${new Date(task.due_date).toLocaleDateString()}`
        });
    });

    // C. Compliance Issues (Weight: 20)
    // De-duplicate if same trip is already in high risk
    lowCompliance?.forEach(record => {
        if (!priorities.find(p => p.id === record.trip_id)) {
            priorities.push({
                id: record.trip_id,
                title: `Compliance Alert: Trip ${record.trip_id.split('-')[0]}...`,
                type: 'Monitoring',
                impact_score: 75,
                reason: `Compliance score dropped to ${record.compliance_score}`
            });
        }
    });

    // 3. Sort & Slice Top 5
    priorities.sort((a, b) => b.impact_score - a.impact_score);
    const top5 = priorities.slice(0, 5);

    // 4. Save to `daily_ops_focus`
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('daily_ops_focus').upsert({
        focus_date: today,
        top_priorities: top5,
        summary_text: `Identified ${priorities.length} critical items. Top focus is ${top5[0]?.title || 'None'}.`
    }, { onConflict: 'focus_date' });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, generated: top5.length });
}
