import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

const updates = [
    { time: "10:45 AM", trip: "#3024 (Bali)", message: "Group arrived at Ubud Hotel", type: "success" },
    { time: "10:30 AM", trip: "#3021 (Kyoto)", message: "Train delayed by 15 mins", type: "warning" },
    { time: "10:15 AM", trip: "#3030 (Amalfi)", message: "Positano boat tour started", type: "success" },
    { time: "09:50 AM", trip: "#3032 (Santorini)", message: "Weather advisory issued", type: "warning" },
    { time: "09:15 AM", trip: "#3025 (Goa)", message: "Breakfast service check completed", type: "info" },
    { time: "08:30 AM", trip: "#3035 (Marrakech)", message: "Medina guide confirmed", type: "success" },
    { time: "08:00 AM", trip: "#3024 (Bali)", message: "Departure from Airport", type: "info" },
    { time: "07:45 AM", trip: "#3040 (Cusco)", message: "Altitude sickness kit distributed", type: "info" },
]

const typeStyles = {
    success: "bg-primary-fixed/40",
    warning: "bg-tertiary-fixed/60",
    info: "bg-surface-container-high",
}

const typeDotStyles = {
    success: "bg-primary",
    warning: "bg-tertiary",
    info: "bg-secondary",
}

export function TripStatusFeed() {
    return (
        <Card className="col-span-1 flex flex-col rounded-2xl border-0 shadow-ambient surface-lowest min-h-[400px] md:h-[600px]">
            <CardHeader className="shrink-0">
                <CardTitle className="flex items-center gap-2 tracking-tight">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-primary" />
                    </div>
                    Live Feed
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto pr-2 pb-6">
                <div className="space-y-4">
                    {updates.map((update, i) => (
                        <div key={i} className="relative pl-6 pb-1 last:pb-0">
                            {/* Timeline line */}
                            {i < updates.length - 1 && (
                                <div className="absolute left-[7px] top-5 bottom-0 w-[2px] bg-surface-container-high" />
                            )}
                            {/* Dot */}
                            <div className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-surface-container-lowest ${typeDotStyles[update.type as keyof typeof typeDotStyles]}`} />
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground font-medium">{update.time}</span>
                                    <Badge className={`text-[10px] border-0 rounded-full px-2 ${typeStyles[update.type as keyof typeof typeStyles]} text-foreground`}>
                                        {update.trip}
                                    </Badge>
                                </div>
                                <p className="text-sm font-medium">{update.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
