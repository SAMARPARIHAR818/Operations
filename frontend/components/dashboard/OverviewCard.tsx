import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface OverviewCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: number
        label: string
        positive?: boolean
    }
    alert?: boolean
}

export function OverviewCard({ title, value, icon: Icon, description, trend, alert }: OverviewCardProps) {
    return (
        <Card className={`rounded-2xl border-0 shadow-ambient hover:shadow-ambient-lg transition-all duration-300 ${alert ? 'bg-tertiary-fixed/30' : 'surface-lowest'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${alert ? 'bg-destructive/10' : 'bg-primary/8'}`}>
                    <Icon className={`h-4 w-4 ${alert ? 'text-destructive' : 'text-primary'}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                        {trend && (
                            <span className={`inline-flex items-center font-semibold ${trend.positive ? 'text-primary' : 'text-destructive'} mr-1.5 px-1.5 py-0.5 rounded-full text-[11px] ${trend.positive ? 'bg-primary-fixed/40' : 'bg-destructive/10'}`}>
                                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                        )}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
