import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const history = [
    { destination: "Bali", date: "Mar 2024", rating: 9.8, status: "Completed" },
    { destination: "Thailand", date: "Feb 2024", rating: 9.5, status: "Completed" },
    { destination: "Vietnam", date: "Jan 2024", rating: 9.2, status: "Completed" },
]

export function CaptainTripHistory() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Trip History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {history.map((trip, i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div>
                                <p className="font-medium">{trip.destination}</p>
                                <p className="text-xs text-muted-foreground">{trip.date}</p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-green-600">{trip.rating}</div>
                                <Badge variant="outline" className="text-[10px]">{trip.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
