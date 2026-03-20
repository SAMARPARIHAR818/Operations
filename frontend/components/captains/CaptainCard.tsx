import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Award } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export interface Captain {
    id: string
    name: string
    status: "Active" | "Inactive" | "On Trip"
    score: number
    location: string
    tripsCompleted: number
    avatarUrl?: string
}

export function CaptainCard({ captain }: { captain: Captain }) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="p-0">
                <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                    <Badge className={`absolute top-2 right-2 ${captain.status === 'On Trip' ? 'bg-blue-500' : captain.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`}>
                        {captain.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-0 relative">
                <div className="flex flex-col items-center -mt-12">
                    <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={captain.avatarUrl} alt={captain.name} />
                        <AvatarFallback>{captain.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="mt-2 text-lg font-bold">{captain.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                        <MapPin className="h-3 w-3" />
                        {captain.location}
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full mt-4 text-center">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center font-bold text-lg gap-1">
                                <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                                {captain.score}
                            </div>
                            <span className="text-xs text-muted-foreground">Overall Score</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center font-bold text-lg gap-1">
                                <Award className="h-4 w-4 text-primary" />
                                {captain.tripsCompleted}
                            </div>
                            <span className="text-xs text-muted-foreground">Trips Done</span>
                        </div>
                    </div>

                    <div className="w-full mt-6">
                        <Button className="w-full" variant="outline" asChild>
                            <Link href={`/captains/${captain.id}`}>View Profile</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
