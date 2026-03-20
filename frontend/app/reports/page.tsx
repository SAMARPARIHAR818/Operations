import { ReportsDashboard } from "@/components/reports/ReportsDashboard"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Select Date Range
                    </Button>
                    <Button className="gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <ReportsDashboard />
        </div>
    )
}
