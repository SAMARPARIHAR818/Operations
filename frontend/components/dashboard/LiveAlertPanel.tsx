import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertTriangle, ShieldAlert, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data interface for alerts
interface AlertItem {
    id: string
    type: 'Trip' | 'Captain' | 'Monitoring'
    message: string
    severity: 'High' | 'Medium' | 'Low'
    timestamp: string
}

const mockAlerts: AlertItem[] = [
    { id: '1', type: 'Trip', message: 'Trip #3024 (Bali) flagged as High Risk', severity: 'High', timestamp: '10m ago' },
    { id: '2', type: 'Monitoring', message: 'Compliance drop: Trip #3045 < 60%', severity: 'High', timestamp: '22m ago' },
    { id: '3', type: 'Captain', message: 'Captain Jack Sparrow report overdue', severity: 'Medium', timestamp: '1h ago' },
]

export function LiveAlertPanel() {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-1 h-full rounded-2xl border-0 shadow-ambient bg-tertiary-fixed/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-tertiary">
                    <Activity className="h-5 w-5" />
                    Live Risk Alerts
                </CardTitle>
                <Badge className="animate-pulse bg-destructive text-white border-0 rounded-full px-3">3 Active</Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {mockAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 p-3 surface-lowest rounded-xl shadow-ambient">
                            {alert.type === 'Trip' && <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />}
                            {alert.type === 'Captain' && <ShieldAlert className="h-5 w-5 text-orange-500 mt-0.5" />}
                            {alert.type === 'Monitoring' && <Activity className="h-5 w-5 text-destructive mt-0.5" />}

                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{alert.message}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                                    <Badge
                                        className={`text-[10px] px-2 py-0 h-5 rounded-full border-0 ${
                                            alert.severity === 'High'
                                                ? 'bg-destructive/10 text-destructive'
                                                : 'bg-surface-container-high text-muted-foreground'
                                        }`}
                                    >
                                        {alert.severity}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
