"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { teamMembers, deptColor } from "./teamData"
import { Clock, BarChart3, Plus, Send, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const categoryOptions = [
    "Trip Planning", "Strategy", "HR", "Finance", "Sales", "Meetings",
    "Vendor Mgmt", "Crisis Mgmt", "Reporting", "Admin", "Lead Follow-up",
    "Client Calls", "Proposals", "Content Creation", "Social Media",
    "SEO/Blog", "Campaign Mgmt", "Analytics", "Emergency", "Documentation",
    "Invoicing", "Payroll", "Reconciliation", "Tax/Compliance", "Tickets",
    "Escalations", "Feedback", "Knowledge Base", "Training", "Site Visits",
]

const categoryColors: Record<string, string> = {
    "Trip Planning": "bg-teal-500", Strategy: "bg-[#0d4f53]", HR: "bg-pink-400",
    Finance: "bg-emerald-500", Sales: "bg-violet-500", Meetings: "bg-gray-400",
    "Vendor Mgmt": "bg-amber-500", "Crisis Mgmt": "bg-red-400", Reporting: "bg-blue-400",
    Admin: "bg-gray-300", "Lead Follow-up": "bg-violet-600", "Client Calls": "bg-indigo-400",
    Proposals: "bg-indigo-600", "Content Creation": "bg-pink-500", "Social Media": "bg-rose-400",
    "SEO/Blog": "bg-orange-400", "Campaign Mgmt": "bg-fuchsia-400", Analytics: "bg-cyan-400",
    Emergency: "bg-red-500", Documentation: "bg-slate-400", Invoicing: "bg-emerald-400",
    Payroll: "bg-green-400", Reconciliation: "bg-teal-400", "Tax/Compliance": "bg-amber-600",
    Tickets: "bg-orange-500", Escalations: "bg-red-400", Feedback: "bg-blue-500",
    "Knowledge Base": "bg-cyan-500", Training: "bg-purple-400", "Site Visits": "bg-lime-500",
}

interface TimeEntry {
    id: string
    memberId: string
    category: string
    hours: number
    description: string
    date: string
}

export function TimeTracking() {
    const { toast } = useToast()

    // Initialize from teamData's weeklyHours
    const initialEntries: TimeEntry[] = []
    teamMembers.forEach(m => {
        if (m.weeklyHours) {
            Object.entries(m.weeklyHours).forEach(([cat, hrs]) => {
                initialEntries.push({
                    id: `te-${m.id}-${cat}`,
                    memberId: m.id,
                    category: cat,
                    hours: hrs,
                    description: "",
                    date: new Date().toISOString().slice(0, 10),
                })
            })
        }
    })

    const [entries, setEntries] = useState<TimeEntry[]>(initialEntries)
    const [logDialogOpen, setLogDialogOpen] = useState(false)
    const [detailMember, setDetailMember] = useState<string | null>(null)

    // Form state
    const [formMember, setFormMember] = useState("")
    const [formCategory, setFormCategory] = useState("")
    const [formHours, setFormHours] = useState("")
    const [formDescription, setFormDescription] = useState("")
    const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10))

    // Load from API
    useEffect(() => {
        fetch("/api/time-entries")
            .then(r => r.json())
            .then(res => {
                if (res.data && res.data.length > 0) {
                    const mapped = res.data.map((t: any) => ({
                        id: t.id,
                        memberId: t.member_id,
                        category: t.category,
                        hours: t.hours,
                        description: t.description || "",
                        date: t.date,
                    }))
                    setEntries(mapped)
                }
            })
            .catch(() => {})
    }, [])

    const logTime = async () => {
        if (!formMember || !formCategory || !formHours) {
            toast({ title: "⚠️ Missing fields", description: "Member, category, and hours are required." })
            return
        }

        const newEntry: TimeEntry = {
            id: `te-${Date.now()}`,
            memberId: formMember,
            category: formCategory,
            hours: parseFloat(formHours),
            description: formDescription,
            date: formDate,
        }

        setEntries(prev => [newEntry, ...prev])

        try {
            const res = await fetch("/api/time-entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    member_id: formMember,
                    category: formCategory,
                    hours: parseFloat(formHours),
                    description: formDescription,
                    date: formDate,
                }),
            })
            const data = await res.json()
            if (data.data?.[0]?.id) {
                setEntries(prev => prev.map(e => e.id === newEntry.id ? { ...e, id: data.data[0].id } : e))
            }
        } catch (e) {}

        const member = teamMembers.find(m => m.id === formMember)
        toast({ title: "⏱️ Time Logged", description: `${formHours}h of ${formCategory} logged for ${member?.name}.` })
        setLogDialogOpen(false)
        setFormMember(""); setFormCategory(""); setFormHours(""); setFormDescription("")
    }

    const deleteEntry = async (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id))
        try {
            await fetch(`/api/time-entries?id=${id}`, { method: "DELETE" })
        } catch (e) {}
        toast({ title: "🗑️ Entry Removed" })
    }

    // Compute aggregations
    const membersWithData = teamMembers.filter(m => entries.some(e => e.memberId === m.id))
    const allCategories: Record<string, number> = {}
    entries.forEach(e => { allCategories[e.category] = (allCategories[e.category] || 0) + e.hours })
    const totalHours = Object.values(allCategories).reduce((a, b) => a + b, 0)
    const sortedCategories = Object.entries(allCategories).sort((a, b) => b[1] - a[1])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Time Tracking — This Week</h3>
                <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="text-xs">{totalHours.toFixed(1)} total hours logged</Badge>
                    <Button size="sm" className="rounded-full h-8 gap-1" onClick={() => setLogDialogOpen(true)}>
                        <Plus className="h-3 w-3" /> Log Time
                    </Button>
                </div>
            </div>

            {/* Company-wide breakdown */}
            <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                <CardHeader className="pb-2 px-5 pt-5">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-[#0d4f53]" /> Company-Wide Time Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className="flex h-6 rounded-full overflow-hidden mb-3">
                        {sortedCategories.slice(0, 8).map(([cat, hrs]) => (
                            <div key={cat} className={`${categoryColors[cat] || "bg-gray-300"} transition-all hover:opacity-80`}
                                 style={{ width: `${(hrs / totalHours) * 100}%` }} title={`${cat}: ${hrs}h`} />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {sortedCategories.slice(0, 10).map(([cat, hrs]) => (
                            <span key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className={`h-2 w-2 rounded-full ${categoryColors[cat] || "bg-gray-300"}`} />
                                {cat}: {hrs}h ({Math.round((hrs / totalHours) * 100)}%)
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Per-Person Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {membersWithData.map(member => {
                    const memberEntries = entries.filter(e => e.memberId === member.id)
                    const hours: Record<string, number> = {}
                    memberEntries.forEach(e => { hours[e.category] = (hours[e.category] || 0) + e.hours })
                    const memberTotal = Object.values(hours).reduce((a, b) => a + b, 0)
                    const sorted = Object.entries(hours).sort((a, b) => b[1] - a[1])
                    const maxHrs = Math.max(...Object.values(hours), 1)
                    const isExpanded = detailMember === member.id

                    return (
                        <Card key={member.id} className="rounded-2xl border-none shadow-ambient surface-lowest">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => setDetailMember(isExpanded ? null : member.id)}>
                                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                                        <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">{member.name}</h4>
                                        <p className="text-[11px] text-muted-foreground">{member.role}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold">{memberTotal}h</span>
                                        <div className="text-[10px] text-muted-foreground">this week</div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    {sorted.map(([cat, hrs]) => (
                                        <div key={cat} className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground w-24 truncate text-right">{cat}</span>
                                            <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
                                                <div className={`h-full rounded-full ${categoryColors[cat] || "bg-gray-300"} transition-all`}
                                                     style={{ width: `${(hrs / maxHrs) * 100}%` }} />
                                            </div>
                                            <span className="text-[10px] font-medium w-6 text-right">{hrs}h</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Expanded entries */}
                                {isExpanded && (
                                    <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5">
                                        <h5 className="text-xs font-semibold mb-2">Detailed Entries</h5>
                                        {memberEntries.map(entry => (
                                            <div key={entry.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 text-xs">
                                                <span className={`h-2 w-2 rounded-full shrink-0 ${categoryColors[entry.category] || "bg-gray-300"}`} />
                                                <span className="flex-1">{entry.category} — {entry.hours}h</span>
                                                {entry.description && <span className="text-muted-foreground truncate max-w-[120px]">{entry.description}</span>}
                                                <button onClick={() => deleteEntry(entry.id)} className="text-muted-foreground hover:text-red-500 shrink-0">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex h-2 rounded-full overflow-hidden mt-3">
                                    {sorted.map(([cat, hrs]) => (
                                        <div key={cat} className={`${categoryColors[cat] || "bg-gray-300"}`} style={{ width: `${(hrs / memberTotal) * 100}%` }} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Log Time Dialog */}
            <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Log Time Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium">Team Member *</label>
                            <select value={formMember} onChange={e => setFormMember(e.target.value)}
                                className="w-full mt-1.5 p-2 rounded-lg border text-sm bg-white">
                                <option value="">Select member...</option>
                                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Category *</label>
                            <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
                                className="w-full mt-1.5 p-2 rounded-lg border text-sm bg-white">
                                <option value="">Select category...</option>
                                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium">Hours *</label>
                                <Input type="number" step="0.5" min="0.5" max="24" className="mt-1.5" placeholder="e.g. 3"
                                    value={formHours} onChange={e => setFormHours(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Date</label>
                                <Input type="date" className="mt-1.5" value={formDate} onChange={e => setFormDate(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Input className="mt-1.5" placeholder="What were you working on?" value={formDescription} onChange={e => setFormDescription(e.target.value)} />
                        </div>
                        <Button className="w-full gap-2" onClick={logTime}>
                            <Send className="h-4 w-4" /> Log Time
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
