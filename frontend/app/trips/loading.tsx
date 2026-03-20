import { Skeleton } from "@/components/ui/skeleton"

export default function TripsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-24" />
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-4">
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
