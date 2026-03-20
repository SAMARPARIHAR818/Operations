import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export interface Vendor {
    id: string
    name: string
    type: "Hotel" | "Transport" | "Activity" | "Other"
    location: string
    reliabilityScore: number
    status: "Active" | "Inactive" | "Blacklisted"
    contact: string
}

export function VendorCard({ vendor }: { vendor: Vendor }) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{vendor.name}</h3>
                    <Badge variant="secondary" className="font-normal">{vendor.type}</Badge>
                </div>
                <Badge variant={vendor.status === 'Active' ? 'default' : vendor.status === 'Blacklisted' ? 'destructive' : 'outline'}>
                    {vendor.status}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {vendor.location}
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {vendor.contact}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 font-medium text-foreground">
                            <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                            {vendor.reliabilityScore}/10
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/vendors/${vendor.id}`}>View Details</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
