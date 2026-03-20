import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, MoreVertical, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"
import { VendorOverview } from "@/components/vendors/VendorOverview"
import { VendorTripHistory } from "@/components/vendors/VendorTripHistory"

export default function VendorDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/vendors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Grand Bali Resort</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Bali, Indonesia</span>
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> +62 361 123456</span>
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> bookings@grandbali.com</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Vendor
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <VendorOverview />
            <VendorTripHistory />
        </div>
    )
}
