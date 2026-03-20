import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, MapPin, Users } from "lucide-react"

// Mock data
const upcomingTrips = [
    { id: 1, destination: "Bali, Indonesia", date: "Apr 12 - 18", captain: "Jack Sparrow", pax: 12 },
    { id: 2, destination: "Kyoto, Japan", date: "Apr 15 - 22", captain: "Will Turner", pax: 8 },
    { id: 3, destination: "Amalfi Coast", date: "Apr 20 - 27", captain: "Elizabeth Swann", pax: 15 },
    { id: 4, destination: "Santorini, Greece", date: "May 01 - 07", captain: "Hector Barbossa", pax: 10 },
    { id: 5, destination: "Machu Picchu", date: "May 10 - 18", captain: "James Norrington", pax: 14 },
]

export function UpcomingTripsTimeline() {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-2 h-full shadow-sm rounded-xl">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Upcoming Trips Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {upcomingTrips.map((trip) => (
                        <div key={trip.id} className="min-w-[200px] p-4 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors">
                            <h4 className="font-semibold text-foreground truncate">{trip.destination}</h4>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {trip.date}
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    {trip.pax} Pax
                                </div>
                                <span className="font-medium text-primary">{trip.captain.split(' ')[0]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
