"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { teamMembers, statusDot, deptColor } from "./teamData"
import { Clock, AlertTriangle, CheckCircle2, Sun, Plus, X, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StandupEntry {
    id: string
    memberId: string
    checkedIn: boolean
    checkInTime: string
    yesterdayDone: string[]
    focus: string[]
    blockers: string
    mood: "🟢" | "🟡" | "🔴"
}

const moods = [
    { emoji: "🟢", label: "Good", color: "bg-green-500" },
    { emoji: "🟡", label: "Blocked", color: "bg-amber-400" },
    { emoji: "🔴", label: "Struggling", color: "bg-red-500" },
] as const

export function DailyStandup() {
    const { toast } = useToast()
    const today = new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const initialStandups: StandupEntry[] = teamMembers.filter(m => m.status !== "On Leave").map((m, i) => ({
        id: `s-${m.id}`,
        memberId: m.id,
        checkedIn: i < 5,
        checkInTime: i < 5 ? `${8 + Math.floor(i * 0.5)}:${i % 2 === 0 ? '30' : '00'} AM` : "",
        yesterdayDone: m.id === "1" ? ["Approved Ladakh budget", "Team sync meeting"] :
                       m.id === "2" ? ["Assigned captain for Rajasthan", "Updated vendor SLAs"] :
                       m.id === "3" ? ["Closed Goa 20-pax deal", "Sent 3 proposals"] :
                       m.id === "4" ? ["Published Spiti blog", "Edited 5 reels"] :
                       m.id === "5" ? ["Coordinated Rishikesh emergency", "Updated trip logistics"] :
                       m.id === "6" ? ["Processed vendor invoices", "Updated payroll sheet"] :
                       m.id === "7" ? ["Resolved 12 support tickets", "Updated FAQ docs"] :
                       ["Filed GST returns", "Completed compliance check"],
        focus: m.id === "1" ? ["Review Q1 financials", "Onboard 2 captain applicants"] :
               m.id === "2" ? ["Finalize Leh Ladakh itinerary", "Resolve Rajasthan overbooking"] :
               m.id === "3" ? ["Close TechCorp deal", "Follow up 8 warm leads"] :
               m.id === "4" ? ["Create Ladakh campaign", "Schedule influencer collaboration"] :
               m.id === "5" ? ["Setup Spiti Valley logistics", "Captain briefing session"] :
               m.id === "6" ? ["Process March invoices", "Budget forecast Q2"] :
               m.id === "7" ? ["Clear pending tickets", "Update knowledge base"] :
               ["Vendor contract review", "Risk assessment report"],
        blockers: m.id === "2" ? "Waiting for hotel confirmation" :
                  m.id === "3" ? "TechCorp needs budget approval from their side" :
                  m.id === "7" ? "Need access to new CRM system" :
                  "None",
        mood: m.id === "2" || m.id === "3" || m.id === "7" ? "🟡" as const :
              m.id === "8" ? "🔴" as const : "🟢" as const,
    }))

    const [standups, setStandups] = useState<StandupEntry[]>(initialStandups)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form state
    const [formYesterday, setFormYesterday] = useState<string[]>([])
    const [formFocus, setFormFocus] = useState<string[]>([])
    const [formBlockers, setFormBlockers] = useState("None")
    const [formMood, setFormMood] = useState<"🟢" | "🟡" | "🔴">("🟢")
    const [newYesterday, setNewYesterday] = useState("")
    const [newFocus, setNewFocus] = useState("")

    // Load from API on mount
    useEffect(() => {
        fetch(`/api/standups?date=${new Date().toISOString().slice(0, 10)}`)
            .then(r => r.json())
            .then(res => {
                if (res.data && res.data.length > 0) {
                    const mapped = res.data.map((s: any) => ({
                        id: s.id,
                        memberId: s.member_id,
                        checkedIn: s.completed,
                        checkInTime: s.check_in_time || "",
                        yesterdayDone: s.yesterday_done || [],
                        focus: s.focus_items || [],
                        blockers: s.blockers || "None",
                        mood: s.mood || "🟢",
                    }))
                    setStandups(prev => {
                        const apiIds = new Set(mapped.map((m: StandupEntry) => m.memberId))
                        const kept = prev.filter(p => !apiIds.has(p.memberId))
                        return [...mapped, ...kept]
                    })
                }
            })
            .catch(() => {})
    }, [])

    const openEdit = (entry: StandupEntry) => {
        setEditingId(entry.memberId)
        setFormYesterday([...entry.yesterdayDone])
        setFormFocus([...entry.focus])
        setFormBlockers(entry.blockers)
        setFormMood(entry.mood)
        setDialogOpen(true)
    }

    const openNew = (memberId: string) => {
        setEditingId(memberId)
        setFormYesterday([])
        setFormFocus([])
        setFormBlockers("None")
        setFormMood("🟢")
        setDialogOpen(true)
    }

    const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string, clear: React.Dispatch<React.SetStateAction<string>>) => {
        if (value.trim()) {
            setter(prev => [...prev, value.trim()])
            clear("")
        }
    }

    const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
        setter(prev => prev.filter((_, i) => i !== idx))
    }

    const saveStandup = async () => {
        if (!editingId) return

        const now = new Date()
        const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

        // Update local state
        setStandups(prev => prev.map(s =>
            s.memberId === editingId
                ? { ...s, checkedIn: true, checkInTime: s.checkInTime || time, yesterdayDone: formYesterday, focus: formFocus, blockers: formBlockers, mood: formMood }
                : s
        ))

        // Also save to backend
        try {
            await fetch("/api/standups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    member_id: editingId,
                    date: now.toISOString().slice(0, 10),
                    check_in_time: time,
                    focus_items: formFocus,
                    yesterday_done: formYesterday,
                    blockers: formBlockers,
                    mood: formMood,
                    completed: true,
                }),
            })
        } catch (e) {}

        toast({ title: "✅ Standup saved", description: `Check-in recorded at ${time}` })
        setDialogOpen(false)
    }

    const checkedCount = standups.filter(s => s.checkedIn).length
    const moodCounts = {
        good: standups.filter(s => s.mood === "🟢" && s.checkedIn).length,
        blocked: standups.filter(s => s.mood === "🟡" && s.checkedIn).length,
        struggling: standups.filter(s => s.mood === "🔴" && s.checkedIn).length,
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-lg">Today&apos;s Standup — {today}</h3>
                    <p className="text-sm text-muted-foreground">{checkedCount}/{standups.length} team members checked in</p>
                </div>
                <div className="flex gap-2">
                    {[
                        { label: "Good", count: moodCounts.good, color: "bg-green-100 text-green-700" },
                        { label: "Blocked", count: moodCounts.blocked, color: "bg-amber-100 text-amber-700" },
                        { label: "Struggling", count: moodCounts.struggling, color: "bg-red-100 text-red-700" },
                    ].map(m => (
                        <Badge key={m.label} variant="outline" className={`${m.color} rounded-full`}>{m.count} {m.label}</Badge>
                    ))}
                </div>
            </div>

            {/* Cards */}
            {standups.map(entry => {
                const member = teamMembers.find(m => m.id === entry.memberId)!
                return (
                    <Card key={entry.memberId} className="rounded-2xl border-none shadow-ambient surface-lowest hover:shadow-lg transition-all">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                                            <AvatarFallback>{member.avatar}</AvatarFallback>
                                        </Avatar>
                                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${statusDot[member.status]}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-sm">{member.name}</h4>
                                            <Badge variant="outline" className="text-[10px] rounded-full">
                                                <span className={`h-1.5 w-1.5 rounded-full mr-1 ${deptColor[member.department]}`} />
                                                {member.role}
                                            </Badge>
                                        </div>
                                        {entry.checkedIn && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" /> Checked in at {entry.checkInTime}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {entry.checkedIn ? (
                                        <span className="text-lg">{entry.mood}</span>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground text-xs">Not checked in</Badge>
                                    )}
                                    <Button size="sm" variant="outline" className="h-7 text-xs rounded-full" onClick={() => entry.checkedIn ? openEdit(entry) : openNew(entry.memberId)}>
                                        {entry.checkedIn ? "Edit" : "Check In"}
                                    </Button>
                                </div>
                            </div>

                            {entry.checkedIn && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <h5 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3 text-green-500" /> Yesterday
                                        </h5>
                                        {entry.yesterdayDone.map((d, i) => (
                                            <p key={i} className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                                                <span className="text-green-500">✓</span> {d}
                                            </p>
                                        ))}
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                                            <Sun className="h-3 w-3 text-amber-500" /> Today&apos;s Focus
                                        </h5>
                                        {entry.focus.map((f, i) => (
                                            <p key={i} className="text-xs text-muted-foreground mb-0.5">→ {f}</p>
                                        ))}
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 text-amber-500" /> Blockers
                                        </h5>
                                        <p className={`text-xs ${entry.blockers !== "None" ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                                            {entry.blockers}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{member.tasksPending} active tasks · {member.tasksOverdue} critical</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}

            {/* Check-In / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId && standups.find(s => s.memberId === editingId)?.checkedIn ? "Edit Standup" : "Daily Check-In"}
                            {editingId && (() => {
                                const m = teamMembers.find(tm => tm.id === editingId)
                                return m ? ` — ${m.name}` : ""
                            })()}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-2">
                        {/* Mood */}
                        <div>
                            <label className="text-sm font-medium">How are you feeling?</label>
                            <div className="flex gap-3 mt-2">
                                {moods.map(m => (
                                    <button key={m.emoji} onClick={() => setFormMood(m.emoji)}
                                        className={`flex-1 p-3 rounded-xl text-center border-2 transition-all ${formMood === m.emoji ? "border-[#0d4f53] bg-muted/50 shadow-md scale-105" : "border-transparent bg-muted/20 hover:bg-muted/40"}`}>
                                        <span className="text-2xl">{m.emoji}</span>
                                        <p className="text-xs mt-1 font-medium">{m.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Yesterday */}
                        <div>
                            <label className="text-sm font-medium">What did you do yesterday?</label>
                            <div className="mt-2 space-y-1.5">
                                {formYesterday.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-green-50 text-sm">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                                        <span className="flex-1">{item}</span>
                                        <button onClick={() => removeItem(setFormYesterday, i)}><X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" /></button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Input placeholder="Add item..." value={newYesterday} onChange={e => setNewYesterday(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && addItem(setFormYesterday, newYesterday, setNewYesterday)} className="text-sm" />
                                    <Button size="icon" variant="outline" className="shrink-0" onClick={() => addItem(setFormYesterday, newYesterday, setNewYesterday)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Focus */}
                        <div>
                            <label className="text-sm font-medium">What are you focusing on today?</label>
                            <div className="mt-2 space-y-1.5">
                                {formFocus.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-sm">
                                        <Sun className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                        <span className="flex-1">{item}</span>
                                        <button onClick={() => removeItem(setFormFocus, i)}><X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" /></button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Input placeholder="Add focus item..." value={newFocus} onChange={e => setNewFocus(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && addItem(setFormFocus, newFocus, setNewFocus)} className="text-sm" />
                                    <Button size="icon" variant="outline" className="shrink-0" onClick={() => addItem(setFormFocus, newFocus, setNewFocus)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Blockers */}
                        <div>
                            <label className="text-sm font-medium">Any blockers?</label>
                            <Input className="mt-2" placeholder="Describe any blockers or type 'None'..." value={formBlockers} onChange={e => setFormBlockers(e.target.value)} />
                        </div>

                        <Button className="w-full gap-2" onClick={saveStandup}>
                            <Send className="h-4 w-4" /> Submit Standup
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
