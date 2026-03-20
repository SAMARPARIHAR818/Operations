import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface Task {
    id: string
    title: string
    priority: "High" | "Medium" | "Low"
    dueDate: string
    assignee: string
    status: string
    tripId?: string
}

export function TaskCard({ task }: { task: Task }) {
    return (
        <Card className={`mb-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${task.priority === 'High' ? 'border-l-red-500' : task.priority === 'Medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
            <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-semibold line-clamp-2">{task.title}</h4>
                </div>

                {task.tripId && (
                    <Badge variant="secondary" className="mb-2 text-[10px] h-5 px-1">{task.tripId}</Badge>
                )}

                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                    </div>
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={`/avatars/${task.assignee}.jpg`} />
                        <AvatarFallback className="text-[10px]">{task.assignee.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
            </CardContent>
        </Card>
    )
}
