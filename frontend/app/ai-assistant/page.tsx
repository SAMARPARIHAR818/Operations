import { AIChatInterface } from "@/components/ai/AIChatInterface"
import { Button } from "@/components/ui/button"
import { Sparkles, FileText, Search, AlertTriangle } from "lucide-react"

export default function AIAssistantPage() {
    return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 max-w-4xl mx-auto h-[calc(100vh-100px)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-purple-500" />
                        AI Assistant
                    </h2>
                    <p className="text-muted-foreground text-sm">Ask questions, generate reports, and analyze data.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                    <Search className="h-5 w-5 text-blue-500" />
                    <span className="text-xs">Find available captains</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <span className="text-xs">Draft trip itinerary</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="text-xs">Analyze risk factors</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span className="text-xs">Summarize feedback</span>
                </Button>
            </div>

            <div className="flex-1 min-h-0">
                <AIChatInterface />
            </div>
        </div>
    )
}
