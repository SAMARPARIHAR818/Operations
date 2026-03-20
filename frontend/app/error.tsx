"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-muted/40">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-red-100 p-3">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
                <p className="text-muted-foreground">
                    An unexpected error occurred. Our team has been notified.
                </p>
            </div>
            <Button onClick={() => reset()}>Try again</Button>
        </div>
    )
}
