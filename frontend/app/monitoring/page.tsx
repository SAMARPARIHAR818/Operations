import { LiveMap } from "@/components/monitoring/LiveMap"
import { TripStatusFeed } from "@/components/monitoring/TripStatusFeed"
import "leaflet/dist/leaflet.css"

export default function MonitoringPage() {
    return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 min-h-screen bg-muted/20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Live Operations Monitoring</h2>
                    <p className="text-sm text-muted-foreground mt-1">Track all active trips across the globe in real-time</p>
                </div>
            </div>

            {/* Metrics Row — Stitch tonal design */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                <div className="surface-lowest p-5 rounded-2xl shadow-ambient flex flex-col items-center justify-center border border-border/30">
                    <span className="text-3xl md:text-4xl font-bold text-primary">8</span>
                    <span className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">Active Trips</span>
                </div>
                <div className="surface-lowest p-5 rounded-2xl shadow-ambient flex flex-col items-center justify-center border border-border/30">
                    <span className="text-3xl md:text-4xl font-bold text-secondary">142</span>
                    <span className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">Pax Traveling</span>
                </div>
                <div className="surface-lowest p-5 rounded-2xl shadow-ambient flex flex-col items-center justify-center border border-destructive/20 bg-destructive/5 col-span-2 md:col-span-1">
                    <span className="text-3xl md:text-4xl font-bold text-destructive">2</span>
                    <span className="text-xs md:text-sm text-destructive/80 mt-1 font-medium">Pending Alerts</span>
                </div>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
                <LiveMap />
                <TripStatusFeed />
            </div>
        </div>
    )
}
