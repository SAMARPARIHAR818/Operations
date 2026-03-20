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

const monitoringData = [
    { date: "Apr 12", compliance: "100%", sentiment: 9, issues: "None", opsRating: 10 },
    { date: "Apr 13", compliance: "80%", sentiment: 8, issues: "Late wakeup", opsRating: 8 },
    { date: "Apr 14", compliance: "100%", sentiment: 10, issues: "None", opsRating: 10 },
]

export function TripMonitoringLog() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Monitoring Log</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Compliance</TableHead>
                            <TableHead>Group Sentiment</TableHead>
                            <TableHead>Issues Reported</TableHead>
                            <TableHead>Ops Rating</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {monitoringData.map((log, index) => (
                            <TableRow key={index}>
                                <TableCell>{log.date}</TableCell>
                                <TableCell>
                                    <Badge variant={parseInt(log.compliance) >= 90 ? "default" : "secondary"}>
                                        {log.compliance}
                                    </Badge>
                                </TableCell>
                                <TableCell>{log.sentiment}/10</TableCell>
                                <TableCell>{log.issues}</TableCell>
                                <TableCell>{log.opsRating}/10</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
