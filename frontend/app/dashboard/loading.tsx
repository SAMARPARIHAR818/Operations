import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-32" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <Skeleton className="h-[300px] rounded-xl lg:col-span-1" />
                <Skeleton className="h-[300px] rounded-xl lg:col-span-2" />
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <Skeleton className="h-[300px] rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
            </div>
        </div>
    )
}
