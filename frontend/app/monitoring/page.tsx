import { LiveMap } from "@/components/monitoring/LiveMap"
import { TripStatusFeed } from "@/components/monitoring/TripStatusFeed"
import "leaflet/dist/leaflet.css"

export default function MonitoringPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Live Operations Monitoring</h2>
                    <p className="text-sm text-muted-foreground mt-1">Track all active trips across the globe in real-time</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <LiveMap />
                <TripStatusFeed />
            </div>

            {/* Metrics Row — Stitch tonal design */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="surface-lowest p-6 rounded-2xl shadow-ambient flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-primary">8</span>
                    <span className="text-sm text-muted-foreground mt-1">Active Trips</span>
                </div>
                <div className="surface-lowest p-6 rounded-2xl shadow-ambient flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-secondary">142</span>
                    <span className="text-sm text-muted-foreground mt-1">Pax Traveling</span>
                </div>
                <div className="surface-lowest p-6 rounded-2xl shadow-ambient flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-tertiary">2</span>
                    <span className="text-sm text-muted-foreground mt-1">Pending Alerts</span>
                </div>
            </div>
        </div>
    )
}
