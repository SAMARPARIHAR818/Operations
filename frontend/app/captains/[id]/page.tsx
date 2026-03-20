import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CaptainPerformanceRadar } from "@/components/captains/CaptainPerformanceRadar"
import { CaptainTripHistory } from "@/components/captains/CaptainTripHistory"

export default function CaptainProfilePage({ params }: { params: { id: string } }) {
    // mock data based on id
    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/captains">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">Captain Profile</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                        <div className="px-6 pb-6 -mt-16 flex flex-col items-center">
                            <Avatar className="h-32 w-32 border-4 border-background">
                                <AvatarImage src="/avatars/jack.jpg" />
                                <AvatarFallback>JS</AvatarFallback>
                            </Avatar>
                            <h3 className="mt-4 text-2xl font-bold">Jack Sparrow</h3>
                            <Badge className="mt-2 bg-green-500 hover:bg-green-600">Active</Badge>

                            <div className="w-full mt-6 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    Bali, Indonesia
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    jack.sparrow@bookido.com
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    +62 812 3456 7890
                                </div>
                            </div>
                        </div>
                    </div>

                    <CaptainTripHistory />
                </div>

                {/* Right Column: Performance & Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Stats Cards */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="text-sm text-muted-foreground">Total Trips</div>
                            <div className="text-3xl font-bold">45</div>
                        </div>
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="text-sm text-muted-foreground">Avg Rating</div>
                            <div className="text-3xl font-bold text-green-600">4.9/5</div>
                        </div>
                    </div>

                    <CaptainPerformanceRadar />

                    {/* Additional sections like Feedback Log could go here */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h3 className="font-semibold mb-4">Latest Feedback</h3>
                        <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
                            "Jack was amazing! He verified the itinerary multiple times and kept the group spirit high even during the rain."
                            <footer className="text-xs font-medium mt-2">- Sarah (Trip #3021)</footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    )
}
