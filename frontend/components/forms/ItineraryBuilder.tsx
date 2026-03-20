"use client"

import { useState, useEffect } from "react"
import { Clock, MapPin, Trash2, CheckCircle2, XCircle, AlertCircle, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export type Checkpoint = {
    day: number
    title: string
    location: string
    lat: number
    lng: number
    status: "pending" | "completed"
}

export function ItineraryBuilder({ tripId }: { tripId: string }) {
    const [itinerary, setItinerary] = useState<Checkpoint[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()
    const { toast } = useToast()

    const fetchItinerary = async () => {
        const { data, error } = await supabase
            .from('trips')
            .select('itinerary')
            .eq('id', tripId)
            .single()
            
        if (data?.itinerary) {
            setItinerary(data.itinerary as Checkpoint[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchItinerary()
        
        // Setup realtime sync for the trips table
        const channel = supabase
            .channel(`trip-itinerary-${tripId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` },
                (payload) => {
                    if (payload.new.itinerary) {
                        setItinerary(payload.new.itinerary as Checkpoint[])
                    }
                })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [tripId])

    const updateStatus = async (index: number, newStatus: "pending" | "completed") => {
        const updatedItinerary = [...itinerary]
        updatedItinerary[index].status = newStatus
        
        // Optimistic UI update
        setItinerary(updatedItinerary)

        const { error } = await supabase
            .from('trips')
            .update({ itinerary: updatedItinerary })
            .eq('id', tripId)

        if (error) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message })
            fetchItinerary() // Revert on failure
        } else {
            toast({ title: newStatus === 'completed' ? "Checkpoint Completed!" : "Status Updated" })
        }
    }

    if (loading) return <div className="text-sm text-muted-foreground animate-pulse">Loading itinerary...</div>

    // Group by Day
    const days = Array.from(new Set(itinerary.map(i => i.day))).sort((a, b) => a - b)
    const progress = itinerary.length > 0 
        ? Math.round((itinerary.filter(i => i.status === 'completed').length / itinerary.length) * 100) 
        : 0

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Execution Timeline</h3>
                
                <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full shadow-ambient border border-border/40">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overall Progress</span>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-primary to-green-400 transition-all duration-500 ease-out" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                    <span className="text-sm font-bold text-primary">{progress}%</span>
                </div>
            </div>

            {itinerary.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground glass rounded-xl">
                    <MapPin className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p>No itinerary checkpoints mapped for this trip.</p>
                    <p className="text-xs mt-1">Edit the trip to add coordinates and itinerary steps.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {days.map(day => (
                        <div key={day} className="relative pl-6 border-l-2 border-muted">
                            <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                            <h4 className="text-md font-bold mb-4 flex items-center gap-2">Day {day}</h4>
                            
                            <div className="space-y-3">
                                {itinerary.map((item, index) => {
                                    if (item.day !== day) return null
                                    
                                    const isCompleted = item.status === 'completed'
                                    
                                    return (
                                        <div key={index} className={cn(
                                            "group flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                                            isCompleted ? "bg-card/30 border-border/50 opacity-75 grayscale-[0.3]" : "glass border-primary/20 shadow-ambient hover:border-primary/40"
                                        )}>
                                            <div className="flex items-center gap-4">
                                                <div className={cn("p-2.5 rounded-full transition-colors",
                                                    isCompleted ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
                                                )}>
                                                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <MapPin className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <p className={cn("font-semibold text-base transition-colors", isCompleted && "line-through text-muted-foreground")}>{item.title}</p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 font-medium">
                                                        {item.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {item.location}</span>}
                                                        <span className="flex items-center gap-1.5 opacity-60"><MapPin className="h-3.5 w-3.5" /> {item.lat.toFixed(4)}, {item.lng.toFixed(4)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isCompleted ? (
                                                    <Button size="sm" variant="outline" className="h-8 bg-transparent hover:bg-muted text-xs" onClick={() => updateStatus(index, 'pending')}>
                                                        Undo
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" className="h-8 gradient-primary text-xs shadow-ambient hover:brightness-110" onClick={() => updateStatus(index, 'completed')}>
                                                        Mark Completed
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
