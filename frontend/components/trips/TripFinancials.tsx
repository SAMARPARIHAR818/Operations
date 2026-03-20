import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, CreditCard } from "lucide-react"

export function TripFinancials() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Profit Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Revenue</span>
                        <span className="font-bold text-lg">$12,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Cost</span>
                        <span className="font-bold text-lg text-red-500">-$8,500</span>
                    </div>
                    <div className="pt-4 border-t flex justify-between items-center">
                        <span className="font-medium">Gross Profit</span>
                        <span className="font-bold text-xl text-green-600">$3,500</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Vendor Costs (Hotels/Transport)</span>
                                <span>$6,000</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[70%]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Activity Costs</span>
                                <span>$1,500</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[20%]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Marketing Allocation</span>
                                <span>$1,000</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 w-[10%]" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
