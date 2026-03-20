"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Map, Plane, Users, AlertTriangle, Clock } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the map to avoid SSR issues with Leaflet
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
)
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
)
const CircleMarker = dynamic(
    () => import("react-leaflet").then((mod) => mod.CircleMarker),
    { ssr: false }
)

type ParsedTripLocation = {
    id: string
    destination: string
    lat: number
    lng: number
    status: keyof typeof statusConfig
    captain: string
    pax: number
    progress: number
    nextCheckpoint: string
    eta: string
}

const statusConfig = {
    active: {
        color: "#295c31",
        pulseColor: "#b8f1b8",
        label: "Live",
        bgClass: "bg-primary-fixed/40 text-primary",
    },
    completed: {
        color: "#006c4b",
        pulseColor: "#68fcbf",
        label: "Completed",
        bgClass: "bg-secondary-fixed/40 text-secondary",
    },
    alert: {
        color: "#ba1a1a",
        pulseColor: "#ffdad6",
        label: "High Risk",
        bgClass: "bg-destructive/10 text-destructive",
    },
}

export function LiveMap() {
    const [mounted, setMounted] = useState(false)
    const [selectedTrip, setSelectedTrip] = useState<string | null>(null)
    const [filter, setFilter] = useState<"all" | "active" | "alert" | "completed">("all")
    const [tripLocations, setTripLocations] = useState<ParsedTripLocation[]>([])

    useEffect(() => {
        setMounted(true)
        
        // Fetch trips and parse itineraries
        const fetchTripsMapData = async () => {
            try {
                const res = await fetch('/api/trips')
                const { data } = await res.json()
                
                if (data && Array.isArray(data)) {
                    const parsed: ParsedTripLocation[] = data.filter(trip => Array.isArray(trip.itinerary) && trip.itinerary.length > 0)
                        .map(trip => {
                            const itinerary = trip.itinerary || []
                            let currentPoint = itinerary.find((i: any) => i.status === 'pending')
                            if (!currentPoint && itinerary.length > 0) {
                                currentPoint = itinerary[itinerary.length - 1] // use last completed if all done
                            }

                            // Calculate mapped status
                            let mappedStatus: "active" | "completed" | "alert" = "active"
                            if (trip.status === "Completed") mappedStatus = "completed"
                            else if (trip.risk_level === "High") mappedStatus = "alert"
                            
                            // Check valid coordinates
                            const lat = Number(currentPoint?.lat) || 0
                            const lng = Number(currentPoint?.lng) || 0

                            const progress = itinerary.length > 0 
                                ? Math.round((itinerary.filter((i: any) => i.status === 'completed').length / itinerary.length) * 100)
                                : 0

                            return {
                                id: trip.id,
                                destination: trip.destination,
                                lat,
                                lng,
                                status: mappedStatus,
                                captain: trip.captains?.name || "Unassigned",
                                pax: trip.expected_pax || 0,
                                progress,
                                nextCheckpoint: currentPoint?.title || "Completion",
                                eta: "—" // ETA logic placeholder
                            }
                        })
                        // only keep ones with valid locations
                        .filter(t => t.lat !== 0 && t.lng !== 0)
                        
                    setTripLocations(parsed)
                }
            } catch (err) {
                console.error("Failed to load map data", err)
            }
        }
        
        fetchTripsMapData()
    }, [])

    const filteredTrips = filter === "all"
        ? tripLocations
        : tripLocations.filter((t) => t.status === filter)

    const activeCount = tripLocations.filter(t => t.status === "active").length
    const alertCount = tripLocations.filter(t => t.status === "alert").length
    const totalPax = tripLocations.reduce((sum, t) => sum + t.pax, 0)

    return (
        <Card className="col-span-1 lg:col-span-2 rounded-2xl border-0 shadow-ambient surface-lowest overflow-hidden">
            {/* Header with stats */}
            <CardHeader className="pb-3 z-10 relative">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 tracking-tight">
                        <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center">
                            <Map className="h-4 w-4 text-white" />
                        </div>
                        Global Operations Map
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-primary-fixed/40 text-primary border-0 rounded-full px-3 gap-1">
                            <Plane className="h-3 w-3" />
                            {activeCount} Live
                        </Badge>
                        {alertCount > 0 && (
                            <Badge className="bg-destructive/10 text-destructive border-0 rounded-full px-3 gap-1 animate-pulse">
                                <AlertTriangle className="h-3 w-3" />
                                {alertCount} Alerts
                            </Badge>
                        )}
                        <Badge className="bg-surface-container-high text-muted-foreground border-0 rounded-full px-3 gap-1">
                            <Users className="h-3 w-3" />
                            {totalPax} Pax
                        </Badge>
                    </div>
                </div>

                {/* Filter pills */}
                <div className="flex gap-2 mt-3">
                    {(["all", "active", "alert", "completed"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                filter === f
                                    ? "gradient-primary text-white shadow-ambient"
                                    : "surface-high text-muted-foreground hover:text-foreground hover:bg-surface-container-highest"
                            }`}
                        >
                            {f === 'active' ? 'Live' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="p-0 relative">
                <div className="h-[480px] w-full relative">
                    {mounted ? (
                        <MapContainer
                            center={[20, 30]}
                            zoom={2}
                            minZoom={2}
                            maxZoom={18}
                            scrollWheelZoom={true}
                            style={{ height: "100%", width: "100%", borderRadius: "0 0 1.5rem 1.5rem" }}
                            className="z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            />
                            {filteredTrips.map((trip) => {
                                const config = statusConfig[trip.status]
                                return (
                                    <CircleMarker
                                        key={trip.id}
                                        center={[trip.lat, trip.lng]}
                                        radius={selectedTrip === trip.id ? 14 : 10}
                                        pathOptions={{
                                            color: config.color,
                                            fillColor: config.color,
                                            fillOpacity: 0.7,
                                            weight: 3,
                                            opacity: 0.9,
                                        }}
                                        eventHandlers={{
                                            click: () => setSelectedTrip(trip.id === selectedTrip ? null : trip.id),
                                        }}
                                    >
                                        <Popup className="stitch-popup">
                                            <div className="min-w-[220px] p-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-sm">{trip.destination}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config.bgClass}`}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <div className="space-y-1.5 text-xs text-gray-600">
                                                    <div className="flex justify-between">
                                                        <span>Trip</span>
                                                        <span className="font-medium text-gray-900">#{trip.id.substring(0,8)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Captain</span>
                                                        <span className="font-medium text-gray-900">{trip.captain}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Passengers</span>
                                                        <span className="font-medium text-gray-900">{trip.pax} pax</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Next Pt.</span>
                                                        <span className="font-medium text-gray-900">{trip.nextCheckpoint}</span>
                                                    </div>
                                                </div>
                                                {/* Progress bar */}
                                                <div className="mt-2.5">
                                                    <div className="flex justify-between text-[10px] mb-1">
                                                        <span className="text-gray-500">Execution Progress</span>
                                                        <span className="font-semibold">{trip.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: `${trip.progress}%`,
                                                                background: `linear-gradient(90deg, ${config.color}, ${config.pulseColor})`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                )
                            })}
                        </MapContainer>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center surface-low animate-pulse">
                            <Map className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                    )}
                </div>

                {/* Floating trip list overlay */}
                <div className="absolute bottom-4 left-4 z-[1000] max-w-[280px]">
                    <div className="glass-card rounded-2xl p-3 space-y-2 max-h-[180px] overflow-y-auto">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Live Route Updates</p>
                        {filteredTrips.slice(0, 4).map((trip) => {
                            const config = statusConfig[trip.status]
                            return (
                                <button
                                    key={trip.id}
                                    onClick={() => setSelectedTrip(trip.id)}
                                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-left transition-all duration-200 ${
                                        selectedTrip === trip.id
                                            ? "bg-primary/10"
                                            : "hover:bg-surface-container-high/50"
                                    }`}
                                >
                                    <div
                                        className="h-2.5 w-2.5 rounded-full flex-shrink-0 animate-pulse"
                                        style={{ backgroundColor: config.color }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{trip.destination}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Map className="h-2.5 w-2.5" />
                                            {trip.progress}% Complete
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground">{trip.pax}p</span>
                                </button>
                            )
                        })}
                        {filteredTrips.length === 0 && (
                            <p className="text-xs text-muted-foreground italic px-2">No active mapped itineraries.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
