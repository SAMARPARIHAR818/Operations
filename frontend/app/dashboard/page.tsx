import { OverviewCard } from "@/components/dashboard/OverviewCard"
import { LiveAlertPanel } from "@/components/dashboard/LiveAlertPanel"
import { UpcomingTripsTimeline } from "@/components/dashboard/UpcomingTripsTimeline"
import { PerformanceSnapshot } from "@/components/dashboard/PerformanceSnapshot"
import { QuickActionPanel } from "@/components/dashboard/QuickActionPanel"
import { TripCalendar } from "@/components/dashboard/TripCalendar"
import { DollarSign, Map as MapIcon, Star, AlertTriangle } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {/* 1. KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <OverviewCard
                    title="Active Trips"
                    value="12"
                    icon={MapIcon}
                    description="3 ending today"
                    trend={{ value: 12, label: "from last month", positive: true }}
                />
                <OverviewCard
                    title="Total Revenue"
                    value="$45,231.89"
                    icon={DollarSign}
                    description="vs $38k last month"
                    trend={{ value: 18, label: "from last month", positive: true }}
                />
                <OverviewCard
                    title="Avg Captain Score"
                    value="4.8"
                    icon={Star}
                    description="Top 10% in region"
                    trend={{ value: 0.2, label: "from last month", positive: true }}
                />
                <OverviewCard
                    title="High Risk Trips"
                    value="3"
                    icon={AlertTriangle}
                    description="Requires attention"
                    alert={true}
                />
            </div>

            {/* 2. Middle Row: Alerts & Timeline */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <LiveAlertPanel />
                <UpcomingTripsTimeline />
            </div>

            {/* 3. Bottom Row: Performance & Actions */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <PerformanceSnapshot />
                <QuickActionPanel />
                <TripCalendar />
            </div>
        </div>
    )
}
