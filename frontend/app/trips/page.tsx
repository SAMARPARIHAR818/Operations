"use client"

import { useEffect, useState } from "react"
import { Search, Plus, Calendar as CalIcon, DollarSign, Users, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TripForm } from "@/components/forms/TripForm"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/components/providers/CurrencyProvider"

import { useRouter } from "next/navigation"

const sampleTrips = [
    { destination: "Leh Ladakh", start_date: "2026-04-15", end_date: "2026-04-22", trip_type: "Explorer", expected_pax: 12, total_revenue: 360000, total_cost: 216000, status: "Upcoming", risk_level: "Low" },
    { destination: "Spiti Valley", start_date: "2026-04-20", end_date: "2026-04-27", trip_type: "Explorer", expected_pax: 8, total_revenue: 200000, total_cost: 128000, status: "Upcoming", risk_level: "Medium" },
    { destination: "Rajasthan Heritage Circuit", start_date: "2026-04-10", end_date: "2026-04-16", trip_type: "Elderly", expected_pax: 15, total_revenue: 375000, total_cost: 225000, status: "Live", risk_level: "Low" },
    { destination: "Goa Beach Retreat", start_date: "2026-03-25", end_date: "2026-03-30", trip_type: "Party", expected_pax: 20, total_revenue: 300000, total_cost: 180000, status: "Live", risk_level: "Low" },
    { destination: "Kerala Backwaters", start_date: "2026-05-01", end_date: "2026-05-06", trip_type: "Elderly", expected_pax: 10, total_revenue: 250000, total_cost: 150000, status: "Upcoming", risk_level: "Low" },
    { destination: "Sikkim & Darjeeling", start_date: "2026-05-10", end_date: "2026-05-17", trip_type: "Explorer", expected_pax: 6, total_revenue: 180000, total_cost: 108000, status: "Upcoming", risk_level: "Medium" },
    { destination: "Manali to Leh Road Trip", start_date: "2026-03-15", end_date: "2026-03-22", trip_type: "Explorer", expected_pax: 14, total_revenue: 420000, total_cost: 252000, status: "Completed", risk_level: "High" },
    { destination: "Rishikesh Adventure", start_date: "2026-03-10", end_date: "2026-03-14", trip_type: "Party", expected_pax: 18, total_revenue: 270000, total_cost: 162000, status: "Completed", risk_level: "Low" },
]

export default function TripsPage() {
    const [trips, setTrips] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTrip, setEditingTrip] = useState<any>(null)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const { toast } = useToast()
    const { formatAmount } = useCurrency()
    const router = useRouter()

    const fetchTrips = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/trips')
            const { data } = await res.json()
            if (data) setTrips(data)
        } catch (err) {
            console.error('Failed to fetch trips:', err)
        }
        setLoading(false)
    }

    useEffect(() => { fetchTrips() }, [])

    const seedSampleData = async () => {
        try {
            for (const trip of sampleTrips) {
                await fetch('/api/trips', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(trip),
                })
            }
            toast({ title: "Sample data added", description: "8 sample trips have been created." })
            fetchTrips()
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to seed sample data." })
        }
    }

    const updateTripStatus = async (tripId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/trips', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tripId, status: newStatus }),
            })
            if (response.ok) {
                toast({ title: "Status updated", description: `Trip status changed to ${newStatus}.` })
                fetchTrips()
            }
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update status." })
        }
    }

    const filtered = trips.filter(t => {
        const matchesSearch = (t.destination || '').toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-muted/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Trips Management</h1>
                    <p className="text-muted-foreground mt-1">Track live and upcoming operations.</p>
                </div>
                <div className="flex items-center gap-2">
                    {trips.length === 0 && !loading && (
                        <Button variant="outline" onClick={seedSampleData} className="gap-2">
                            Seed Sample Data
                        </Button>
                    )}
                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingTrip(null) }}>
                        <DialogTrigger asChild>
                            <Button className="shadow-lg">
                                <Plus className="mr-2 h-4 w-4" /> Create Trip
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] glass-card">
                            <DialogHeader>
                                <DialogTitle>{editingTrip ? "Edit Trip" : "Plan New Trip"}</DialogTitle>
                            </DialogHeader>
                            <TripForm onSuccess={() => {
                                setIsDialogOpen(false)
                                setEditingTrip(null)
                                fetchTrips()
                            }} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search destination..."
                        className="pl-8 bg-white/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {["all", "Live", "Upcoming", "Completed"].map(s => (
                        <Button
                            key={s}
                            variant={statusFilter === s ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(s)}
                            className="rounded-full"
                        >
                            {s === "all" ? "All" : s}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-[200px] rounded-xl" />
                )) : filtered.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                        No trips found. Create your first trip to get started.
                    </div>
                ) : filtered.map(trip => {
                    const hasItinerary = Array.isArray(trip.itinerary) && trip.itinerary.length > 0
                    const progress = hasItinerary 
                        ? Math.round((trip.itinerary.filter((i: any) => i.status === 'completed').length / trip.itinerary.length) * 100) 
                        : 0

                    return (
                        <Card 
                            key={trip.id} 
                            onClick={() => router.push(`/trips/${trip.id}`)}
                            className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 glass-card border-none group relative overflow-hidden"
                        >
                            {/* Subtle background progress bar if Live */}
                            {trip.status === 'Live' && hasItinerary && (
                                <div 
                                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-green-400 transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                />
                            )}
                            
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg pr-8">{trip.destination}</h3>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                            <CalIcon className="h-3 w-3" />
                                            {trip.start_date && trip.end_date ? (
                                                <>{format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}</>
                                            ) : 'Dates TBD'}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 rounded-full shadow-lg"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingTrip(trip)
                                            setIsDialogOpen(true)
                                        }}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <Badge variant="outline" className={
                                            trip.status === 'Live' ? "bg-green-100 text-green-700 border-green-200" :
                                            trip.status === 'Completed' ? "bg-gray-100 text-gray-700" : "bg-blue-50 text-blue-700"
                                        }>{trip.status}</Badge>
                                        
                                        {hasItinerary && (
                                            <span className="text-[10px] font-bold text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">
                                                {progress}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="h-[1px] w-full bg-border/50" />
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{trip.expected_pax || 0} Pax</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span>{formatAmount(trip.total_revenue || 0)}</span>
                                    </div>
                                </div>
                                {/* Quick status actions */}
                                <div className="flex gap-1.5 pt-1">
                                    {trip.status !== 'Live' && trip.status !== 'Completed' && (
                                        <Button size="sm" variant="outline" className="h-7 text-xs rounded-full" onClick={(e) => { e.stopPropagation(); updateTripStatus(trip.id, 'Live') }}>
                                            Mark Live
                                        </Button>
                                    )}
                                    {trip.status !== 'Completed' && (
                                        <Button size="sm" variant="outline" className="h-7 text-xs rounded-full" onClick={(e) => { e.stopPropagation(); updateTripStatus(trip.id, 'Completed') }}>
                                            Complete
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
