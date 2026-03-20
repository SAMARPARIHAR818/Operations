import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Star, AlertCircle, CheckCircle } from "lucide-react"

export function PerformanceSnapshot() {
    return (
        <Card className="col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-1 h-full shadow-sm rounded-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Performance Snapshot
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Profit Trend */}
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Profit Goal</span>
                        <span className="font-medium">78%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[78%]" />
                    </div>
                </div>

                {/* Captain Ratings */}
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> Avg Captain Rating</span>
                        <span className="font-medium">4.8/5</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 w-[96%]" />
                    </div>
                </div>

                {/* Compliance */}
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Compliance Rate</span>
                        <span className="font-medium">92%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[92%]" />
                    </div>
                </div>

                {/* Cancellation */}
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Cancellation Rate</span>
                        <span className="font-medium text-green-600">Low (2%)</span>
                    </div>
                    {/* Visual indicator for low is good */}
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[2%]" />
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
