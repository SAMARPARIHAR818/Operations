import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface Applicant {
    id: string
    name: string
    role: string
    score: number
    appliedDate: string
    status: string
}

export function ApplicantCard({ applicant }: { applicant: Applicant }) {
    return (
        <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary">
            <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`/avatars/${applicant.id}.jpg`} />
                            <AvatarFallback>{applicant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="text-sm font-semibold">{applicant.name}</h4>
                            <p className="text-xs text-muted-foreground">{applicant.role}</p>
                        </div>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex justify-between items-center mt-3">
                    <Badge variant="outline" className="text-xs font-normal">
                        {applicant.appliedDate}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                        Score: {applicant.score}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
