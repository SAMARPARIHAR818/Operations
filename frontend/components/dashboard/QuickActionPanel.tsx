import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, UserPlus, FileSpreadsheet, CheckSquare, Zap, Store } from "lucide-react"

export function QuickActionPanel() {
    return (
        <Card className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1 h-full rounded-2xl border-0 shadow-ambient surface-lowest">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold tracking-tight">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
                <Button className="w-full justify-start gap-2 gradient-primary text-white border-0 rounded-xl hover:brightness-110 transition-all">
                    <PlusCircle className="h-4 w-4" />
                    Add Trip
                </Button>
                <Button className="w-full justify-start gap-2 surface-highest text-foreground border-0 rounded-xl hover:bg-surface-dim transition-colors" variant="secondary">
                    <UserPlus className="h-4 w-4" />
                    Assign Capt
                </Button>
                <Button className="w-full justify-start gap-2 surface-high text-foreground border-0 rounded-xl hover:bg-surface-container-highest transition-colors" variant="ghost">
                    <Zap className="h-4 w-4" />
                    Log Update
                </Button>
                <Button className="w-full justify-start gap-2 surface-high text-foreground border-0 rounded-xl hover:bg-surface-container-highest transition-colors" variant="ghost">
                    <Store className="h-4 w-4" />
                    Add Vendor
                </Button>
                <Button className="w-full justify-start gap-2 surface-high text-foreground border-0 rounded-xl hover:bg-surface-container-highest transition-colors" variant="ghost">
                    <CheckSquare className="h-4 w-4" />
                    Add Task
                </Button>
                <Button className="w-full justify-start gap-2 text-muted-foreground rounded-xl hover:text-foreground" variant="ghost">
                    More...
                </Button>
            </CardContent>
        </Card>
    )
}
