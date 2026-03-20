import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const trips = [
    { id: "3024", destination: "Bali", date: "Apr 2024", service: "Hotel Stay", amount: "$4,500", rating: 5 },
    { id: "2988", destination: "Bali", date: "Mar 2024", service: "Airport Transfer", amount: "$800", rating: 4 },
    { id: "2850", destination: "Bali", date: "Jan 2024", service: "Hotel Stay", amount: "$4,200", rating: 5 },
]

export function VendorTripHistory() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Trip ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Rating</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {trips.map((trip) => (
                            <TableRow key={trip.id}>
                                <TableCell className="font-medium">#{trip.id}</TableCell>
                                <TableCell>{trip.date}</TableCell>
                                <TableCell>{trip.service}</TableCell>
                                <TableCell>{trip.amount}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{trip.rating}/5</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
