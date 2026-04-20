import { ReportsDashboard } from "@/components/reports/ReportsDashboard"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"

export default function ReportsPage() {
    return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 min-h-screen bg-muted/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Reports & Analytics</h2>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="hidden sm:inline">Select Date Range</span>
                        <span className="sm:hidden">Date</span>
                    </Button>
                    <Button size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                        <span className="sm:hidden">Export</span>
                    </Button>
                </div>
            </div>

            <ReportsDashboard />
        </div>
    )
}
