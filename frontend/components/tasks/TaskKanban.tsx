import { Task, TaskCard } from "@/components/tasks/TaskCard"
import { Badge } from "@/components/ui/badge"

const stages = ["To Do", "In Progress", "Review", "Completed"]

// Mock data
const tasks: Task[] = [
    { id: "1", title: "Review Captain Application #42", priority: "High", dueDate: "Today", assignee: "Admin", status: "To Do" },
    { id: "2", title: "Confirm Bali Hotel Booking", priority: "High", dueDate: "Tomorrow", assignee: "Ops", status: "In Progress", tripId: "Trip #3024" },
    { id: "3", title: "Send Feedback Survey", priority: "Low", dueDate: "Apr 20", assignee: "Admin", status: "To Do", tripId: "Trip #3021" },
    { id: "4", title: "Update Vendor Contracts", priority: "Medium", dueDate: "Next Week", assignee: "Founder", status: "Review" },
    { id: "5", title: "Onboard New Captain", priority: "Medium", dueDate: "Yesterday", assignee: "Ops", status: "Completed" },
]

export function TaskKanban() {
    return (
        <div className="flex h-full gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
                <div key={stage} className="min-w-[280px] flex flex-col bg-muted/30 rounded-xl p-3 h-full">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="font-semibold text-sm">{stage}</h3>
                        <Badge variant="secondary" className="text-xs">
                            {tasks.filter(t => t.status === stage).length}
                        </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                        {tasks
                            .filter(t => t.status === stage)
                            .map(task => (
                                <TaskCard key={task.id} task={task} />
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    )
}
