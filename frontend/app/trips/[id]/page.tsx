"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { Calendar, MapPin, Users, DollarSign, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/client"
import { ItineraryBuilder } from "@/components/forms/ItineraryBuilder"
import { MonitoringForm } from "@/components/forms/MonitoringForm"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useCurrency } from "@/components/providers/CurrencyProvider"

export default function TripDetails({ params }: { params: { id: string } }) {
    const { id } = params
    const [trip, setTrip] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const { formatAmount } = useCurrency()

    useEffect(() => {
        const fetchTrip = async () => {
            const { data, error } = await supabase
                .from('trips')
                .select('*, captains(full_name, profile_photo_url)')
                .eq('id', id)
                .single()
            if (error) {
                setError(error.message)
                setLoading(false)
                return
            }
            if (data) setTrip(data)
            setLoading(false)
        }
        if (id) fetchTrip()
    }, [id])

    if (loading) return <div className="p-8"><Skeleton className="h-[400px] w-full rounded-xl" /></div>
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>
    if (!trip) return <div className="p-8 text-center">Trip not found</div>

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-muted/20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/trips">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{trip.destination}</h1>
                        <Badge variant="outline" className={
                            trip.status === 'Live' ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-700"
                        }>{trip.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground mt-1 text-sm">
                        <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {format(new Date(trip.start_date), 'PPP')} - {format(new Date(trip.end_date), 'PPP')}</div>
                        <div className="flex items-center gap-1"><Users className="h-4 w-4" /> {trip.expected_pax} Pax</div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-background/50 backdrop-blur">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Summary Cards */}
                        <div className="glass p-6 rounded-xl space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Assigned Captain</h3>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                    {trip.captains?.profile_photo_url ?
                                        <img src={trip.captains.profile_photo_url} className="h-full w-full object-cover" /> :
                                        <span className="text-xs font-bold text-primary">{(trip.captains?.full_name || "?").substring(0, 2).toUpperCase()}</span>
                                    }
                                </div>
                                <div className="font-medium">{trip.captains?.full_name || "Unassigned"}</div>
                            </div>
                        </div>

                        <div className="glass p-6 rounded-xl space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Financial Health</h3>
                            <div className="text-2xl font-bold">
                                {trip.total_revenue > 0 ?
                                    `${(((trip.total_revenue - trip.total_cost) / trip.total_revenue) * 100).toFixed(1)}%`
                                    : "0%"}
                                <span className="text-sm font-normal text-muted-foreground ml-2">Margin</span>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="itinerary">
                    <div className="glass p-6 rounded-xl">
                        <ItineraryBuilder tripId={id as string} />
                    </div>
                </TabsContent>

                <TabsContent value="financials">
                    <div className="glass p-6 rounded-xl">
                        <h3 className="font-semibold mb-4">Financial Breakdown</h3>
                        <div className="pt-4 border-t border-border/50">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</div>
                                <div className="text-2xl font-bold text-green-600">{formatAmount(trip.total_revenue || 0)}</div>
                            </div>
                            <div className="mt-4">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Total Cost</div>
                                <div className="text-2xl font-bold text-red-500">{formatAmount(trip.total_cost || 0)}</div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
