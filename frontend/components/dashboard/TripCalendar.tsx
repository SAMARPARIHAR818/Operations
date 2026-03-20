"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Users, DollarSign, Clock } from "lucide-react"
import { useCurrency } from "@/components/providers/CurrencyProvider"

// Sample trips data — matches the trips from the seeded data
const calendarTrips = [
    { id: 1, destination: "Manali to Leh Road Trip", start: "2026-03-15", end: "2026-03-22", status: "Completed", pax: 14, revenue: 420000, captain: "Arjun Mehra", type: "Explorer" },
    { id: 2, destination: "Rishikesh Adventure", start: "2026-03-10", end: "2026-03-14", status: "Completed", pax: 18, revenue: 270000, captain: "Vikram Singh", type: "Party" },
    { id: 3, destination: "Goa Beach Retreat", start: "2026-03-25", end: "2026-03-30", status: "Live", pax: 20, revenue: 300000, captain: "Rahul Nair", type: "Party" },
    { id: 4, destination: "Rajasthan Heritage", start: "2026-04-10", end: "2026-04-16", status: "Live", pax: 15, revenue: 375000, captain: "Vikram Singh", type: "Elderly" },
    { id: 5, destination: "Leh Ladakh", start: "2026-04-15", end: "2026-04-22", status: "Upcoming", pax: 12, revenue: 360000, captain: "Arjun Mehra", type: "Explorer" },
    { id: 6, destination: "Spiti Valley", start: "2026-04-20", end: "2026-04-27", status: "Upcoming", pax: 8, revenue: 200000, captain: "Priya Sharma", type: "Explorer" },
    { id: 7, destination: "Kerala Backwaters", start: "2026-05-01", end: "2026-05-06", status: "Upcoming", pax: 10, revenue: 250000, captain: "Rahul Nair", type: "Elderly" },
    { id: 8, destination: "Sikkim & Darjeeling", start: "2026-05-10", end: "2026-05-17", status: "Upcoming", pax: 6, revenue: 180000, captain: "Tenzin Dorje", type: "Explorer" },
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    Live: { bg: "bg-green-500/15", text: "text-green-700", dot: "bg-green-500" },
    Upcoming: { bg: "bg-blue-500/15", text: "text-blue-700", dot: "bg-blue-500" },
    Completed: { bg: "bg-gray-400/15", text: "text-gray-600", dot: "bg-gray-400" },
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay()
}

function formatDate(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function isDateInRange(dateStr: string, start: string, end: string) {
    return dateStr >= start && dateStr <= end
}

export function TripCalendar() {
    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const { formatAmount } = useCurrency()

    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate())

    // Build a map of date -> trips
    const tripMap = useMemo(() => {
        const map: Record<string, typeof calendarTrips> = {}
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = formatDate(currentYear, currentMonth, d)
            const tripsOnDay = calendarTrips.filter(t => isDateInRange(dateStr, t.start, t.end))
            if (tripsOnDay.length > 0) map[dateStr] = tripsOnDay
        }
        return map
    }, [currentMonth, currentYear, daysInMonth])

    const selectedTrips = selectedDate ? (tripMap[selectedDate] || []) : []

    // Month stats
    const monthTrips = useMemo(() => {
        const monthStart = formatDate(currentYear, currentMonth, 1)
        const monthEnd = formatDate(currentYear, currentMonth, daysInMonth)
        return calendarTrips.filter(t => {
            return (t.start >= monthStart && t.start <= monthEnd) ||
                   (t.end >= monthStart && t.end <= monthEnd) ||
                   (t.start < monthStart && t.end > monthEnd)
        })
    }, [currentMonth, currentYear, daysInMonth])

    const prevMonth = () => {
        setSelectedDate(null)
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
        else setCurrentMonth(m => m - 1)
    }
    const nextMonth = () => {
        setSelectedDate(null)
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
        else setCurrentMonth(m => m + 1)
    }

    return (
        <Card className="col-span-1 rounded-2xl shadow-ambient border-none surface-lowest overflow-hidden">
            <CardHeader className="pb-2 px-5 pt-5">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#0d4f53]" />
                        Trip Calendar
                    </CardTitle>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center">
                            {MONTHS[currentMonth]} {currentYear}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {/* Month summary */}
                <div className="flex gap-3 mt-2">
                    {[
                        { label: "Live", count: monthTrips.filter(t => t.status === "Live").length },
                        { label: "Upcoming", count: monthTrips.filter(t => t.status === "Upcoming").length },
                        { label: "Completed", count: monthTrips.filter(t => t.status === "Completed").length },
                    ].map(s => (
                        <div key={s.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className={`h-2 w-2 rounded-full ${statusColors[s.label]?.dot}`} />
                            {s.count} {s.label}
                        </div>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-2">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0">
                    {DAYS.map(day => (
                        <div key={day} className="text-center text-[10px] font-medium text-muted-foreground py-1.5 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                    {/* Empty cells before first day */}
                    {Array(firstDay).fill(null).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const dateStr = formatDate(currentYear, currentMonth, day)
                        const dayTrips = tripMap[dateStr] || []
                        const isToday = dateStr === todayStr
                        const isSelected = dateStr === selectedDate
                        const hasTrips = dayTrips.length > 0

                        // Get highest priority status for the dot color
                        const topStatus = dayTrips.find(t => t.status === "Live")?.status ||
                                         dayTrips.find(t => t.status === "Upcoming")?.status ||
                                         dayTrips[0]?.status

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                className={`
                                    aspect-square flex flex-col items-center justify-center relative
                                    text-xs rounded-lg transition-all duration-150 cursor-pointer
                                    ${isToday ? "bg-[#0d4f53] text-white font-bold" : ""}
                                    ${isSelected && !isToday ? "bg-[#0d4f53]/10 ring-1 ring-[#0d4f53]" : ""}
                                    ${!isToday && !isSelected ? "hover:bg-muted/50" : ""}
                                `}
                            >
                                <span className={isToday ? "text-white" : ""}>{day}</span>
                                {hasTrips && (
                                    <div className="flex gap-0.5 mt-0.5">
                                        {dayTrips.slice(0, 3).map((t, idx) => (
                                            <span
                                                key={idx}
                                                className={`h-1 w-1 rounded-full ${statusColors[t.status]?.dot || "bg-gray-400"}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Selected Date Details */}
                {selectedDate && (
                    <div className="mt-3 pt-3 border-t border-border/30 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="text-xs font-medium text-muted-foreground">
                            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </div>
                        {selectedTrips.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic py-2">No trips on this day.</p>
                        ) : (
                            selectedTrips.map(trip => {
                                const sc = statusColors[trip.status] || statusColors.Upcoming
                                return (
                                    <div key={trip.id} className={`p-3 rounded-xl ${sc.bg} transition-all hover:shadow-sm`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold truncate">{trip.destination}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(trip.start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(trip.end + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" /> {trip.pax}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" /> {formatAmount(trip.revenue, true)}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-muted-foreground mt-1">
                                                    <span className="font-medium text-foreground/70">{trip.captain}</span> · {trip.type}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={`${sc.text} border-current/20 text-[10px] shrink-0`}>
                                                {trip.status}
                                            </Badge>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}

                {/* If nothing selected, show upcoming summary */}
                {!selectedDate && (
                    <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground mb-2">Next Up</div>
                        {calendarTrips
                            .filter(t => t.start >= todayStr && t.status !== "Completed")
                            .sort((a, b) => a.start.localeCompare(b.start))
                            .slice(0, 3)
                            .map(trip => {
                                const sc = statusColors[trip.status] || statusColors.Upcoming
                                return (
                                    <div key={trip.id} className="flex items-center gap-2.5 py-1.5">
                                        <span className={`h-2 w-2 rounded-full shrink-0 ${sc.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-medium truncate block">{trip.destination}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground shrink-0">
                                            {new Date(trip.start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                    </div>
                                )
                            })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
