import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const vendors = [
    { name: "Bali Transport Co", type: "Transport", cost: "$1,200", status: "Paid" },
    { name: "Ubud Resort & Spa", type: "Hotel", cost: "$4,500", status: "Given Advance" },
    { name: "Blue Lagoon Snorkel", type: "Activity", cost: "$300", status: "Pending" },
]

export function LinkedVendors() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor, index) => (
                <Card key={index}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{vendor.name}</CardTitle>
                            <Badge variant="outline">{vendor.type}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-muted-foreground">Cost</span>
                            <span className="font-medium">{vendor.cost}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Status</span>
                            <span className={`font-medium ${vendor.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {vendor.status}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
