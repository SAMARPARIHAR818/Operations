import { TaskKanban } from "@/components/tasks/TaskKanban"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"

export default function TasksPage() {
    return (
        <div className="flex flex-col h-full space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tasks Board</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filter</span>
                    </Button>
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Task</span>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <TaskKanban />
            </div>
        </div>
    )
}
