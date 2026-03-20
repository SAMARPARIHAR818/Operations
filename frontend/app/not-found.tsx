import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-muted/40">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-muted p-4">
                    <FileQuestion className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
                <p className="text-muted-foreground">Could not find requested resource</p>
            </div>
            <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
        </div>
    )
}
