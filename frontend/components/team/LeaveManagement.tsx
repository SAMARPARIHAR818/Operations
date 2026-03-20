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
import { teamMembers, statusDot } from "./teamData"
import { Calendar, Check, X, Plus, Send, CalendarDays, Briefcase, ThumbsUp, ThumbsDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LeaveRequest {
    id: string
    memberId: string
    type: "Annual" | "Sick" | "Personal" | "WFH" | "Half Day"
    startDate: string
    endDate: string
    status: "Approved" | "Pending" | "Rejected"
    reason: string
}

const leaveTypes = ["Annual", "Sick", "Personal", "WFH", "Half Day"] as const
const leaveColor: Record<string, string> = {
    Annual: "bg-blue-400",
    Sick: "bg-red-400",
    Personal: "bg-purple-400",
    WFH: "bg-green-400",
    "Half Day": "bg-amber-400",
}
const statusStyle: Record<string, { bg: string; text: string }> = {
    Approved: { bg: "bg-green-100", text: "text-green-700" },
    Pending: { bg: "bg-amber-100", text: "text-amber-700" },
    Rejected: { bg: "bg-red-100", text: "text-red-700" },
}

const initialLeaves: LeaveRequest[] = [
    { id: "l1", memberId: "2", type: "Annual", startDate: "2026-04-10", endDate: "2026-04-14", status: "Pending", reason: "Family function in Jaipur" },
    { id: "l2", memberId: "4", type: "Sick", startDate: "2026-03-18", endDate: "2026-03-19", status: "Approved", reason: "Fever and cold" },
    { id: "l3", memberId: "7", type: "WFH", startDate: "2026-03-21", endDate: "2026-03-21", status: "Pending", reason: "Internet installation at new apartment" },
    { id: "l4", memberId: "6", type: "Personal", startDate: "2026-03-25", endDate: "2026-03-25", status: "Pending", reason: "Bank work and documentation" },
    { id: "l5", memberId: "3", type: "Half Day", startDate: "2026-03-22", endDate: "2026-03-22", status: "Approved", reason: "Doctor appointment" },
    { id: "l6", memberId: "5", type: "Annual", startDate: "2026-04-01", endDate: "2026-04-03", status: "Pending", reason: "Travel to hometown" },
]

const leaveBalances: Record<string, { annual: number; sick: number; personal: number; wfh: number }> = {
    "1": { annual: 18, sick: 8, personal: 3, wfh: 12 },
    "2": { annual: 15, sick: 7, personal: 2, wfh: 10 },
    "3": { annual: 12, sick: 6, personal: 3, wfh: 8 },
    "4": { annual: 14, sick: 5, personal: 2, wfh: 10 },
    "5": { annual: 16, sick: 8, personal: 3, wfh: 11 },
    "6": { annual: 13, sick: 7, personal: 1, wfh: 9 },
    "7": { annual: 11, sick: 6, personal: 2, wfh: 8 },
    "8": { annual: 10, sick: 4, personal: 3, wfh: 7 },
}

export function LeaveManagement() {
    const { toast } = useToast()
    const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves)
    const [requestDialogOpen, setRequestDialogOpen] = useState(false)
    const [viewTab, setViewTab] = useState<"requests" | "calendar" | "balances">("requests")

    // Form state
    const [formMember, setFormMember] = useState("")
    const [formType, setFormType] = useState<typeof leaveTypes[number]>("Annual")
    const [formStart, setFormStart] = useState("")
    const [formEnd, setFormEnd] = useState("")
    const [formReason, setFormReason] = useState("")

    // Load from API
    useEffect(() => {
        fetch("/api/leaves")
            .then(r => r.json())
            .then(res => {
                if (res.data && res.data.length > 0) {
                    const mapped = res.data.map((l: any) => ({
                        id: l.id,
                        memberId: l.member_id,
                        type: l.type,
                        startDate: l.start_date,
                        endDate: l.end_date,
                        status: l.status,
                        reason: l.reason || "",
                    }))
                    setLeaves(mapped)
                }
            })
            .catch(() => {})
    }, [])

    const handleApproveReject = async (id: string, action: "Approved" | "Rejected") => {
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: action } : l))

        try {
            await fetch("/api/leaves", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: action }),
            })
        } catch (e) {}

        const leave = leaves.find(l => l.id === id)
        const member = leave ? teamMembers.find(m => m.id === leave.memberId) : null
        toast({
            title: action === "Approved" ? "✅ Leave Approved" : "❌ Leave Rejected",
            description: member ? `${member.name}'s ${leave?.type} leave has been ${action.toLowerCase()}.` : "Leave updated.",
        })
    }

    const submitLeaveRequest = async () => {
        if (!formMember || !formStart || !formEnd) {
            toast({ title: "⚠️ Missing fields", description: "Please fill in all required fields." })
            return
        }

        const newLeave: LeaveRequest = {
            id: `l-${Date.now()}`,
            memberId: formMember,
            type: formType,
            startDate: formStart,
            endDate: formEnd,
            status: "Pending",
            reason: formReason,
        }

        setLeaves(prev => [newLeave, ...prev])

        try {
            const res = await fetch("/api/leaves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    member_id: formMember,
                    type: formType,
                    start_date: formStart,
                    end_date: formEnd,
                    reason: formReason,
                    status: "Pending",
                }),
            })
            const data = await res.json()
            if (data.data?.[0]?.id) {
                setLeaves(prev => prev.map(l => l.id === newLeave.id ? { ...l, id: data.data[0].id } : l))
            }
        } catch (e) {}

        const member = teamMembers.find(m => m.id === formMember)
        toast({ title: "📋 Leave Requested", description: `${member?.name}'s ${formType} leave request submitted for approval.` })
        setRequestDialogOpen(false)
        setFormMember("")
        setFormStart("")
        setFormEnd("")
        setFormReason("")
    }

    const pendingLeaves = leaves.filter(l => l.status === "Pending")
    const allApproved = leaves.filter(l => l.status === "Approved")

    // Calendar generation for current month
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Leave Management</h3>
                <div className="flex gap-2">
                    {(["requests", "calendar", "balances"] as const).map(tab => (
                        <Button key={tab} size="sm" variant={viewTab === tab ? "default" : "outline"} className="rounded-full text-xs h-8 capitalize" onClick={() => setViewTab(tab)}>
                            {tab}
                        </Button>
                    ))}
                    <Button size="sm" className="rounded-full h-8 gap-1" onClick={() => setRequestDialogOpen(true)}>
                        <Plus className="h-3 w-3" /> Request Leave
                    </Button>
                </div>
            </div>

            {viewTab === "requests" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Approvals */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-amber-700">Pending Approvals ({pendingLeaves.length})</h4>
                        {pendingLeaves.length === 0 && <p className="text-sm text-muted-foreground italic">No pending leave requests 🎉</p>}
                        {pendingLeaves.map(leave => {
                            const member = teamMembers.find(m => m.id === leave.memberId)!
                            return (
                                <Card key={leave.id} className="rounded-xl border-l-4 border-l-amber-400 bg-amber-50/50 shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                                                    <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h5 className="font-semibold text-sm">{member.name}</h5>
                                                    <p className="text-xs text-muted-foreground">{member.role}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={`${statusStyle[leave.status].bg} ${statusStyle[leave.status].text} text-[10px]`}>
                                                {leave.status}
                                            </Badge>
                                        </div>
                                        <div className="mt-3 p-2.5 bg-white/60 rounded-lg space-y-1">
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className={`h-2 w-2 rounded-full ${leaveColor[leave.type]}`} />
                                                <span className="font-medium">{leave.type}</span>
                                                <span className="text-muted-foreground">· {leave.startDate} → {leave.endDate}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground italic">"{leave.reason}"</p>
                                        </div>
                                        <div className="mt-3 flex gap-2 justify-end">
                                            <Button size="sm" variant="outline" className="h-7 text-xs rounded-full gap-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => handleApproveReject(leave.id, "Rejected")}>
                                                <ThumbsDown className="h-3 w-3" /> Reject
                                            </Button>
                                            <Button size="sm" className="h-7 text-xs rounded-full gap-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleApproveReject(leave.id, "Approved")}>
                                                <ThumbsUp className="h-3 w-3" /> Approve
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    {/* All Leaves List */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm">All Requests</h4>
                        {leaves.map(leave => {
                            const member = teamMembers.find(m => m.id === leave.memberId)!
                            return (
                                <Card key={leave.id} className="rounded-xl shadow-sm surface-lowest border-none">
                                    <CardContent className="p-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} /><AvatarFallback className="text-xs">{member.avatar}</AvatarFallback></Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{member.name}</span>
                                                    <Badge variant="outline" className="text-[9px] h-4 rounded-full">
                                                        <span className={`h-1.5 w-1.5 rounded-full mr-1 ${leaveColor[leave.type]}`} />
                                                        {leave.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">{leave.startDate} → {leave.endDate}</p>
                                            </div>
                                            <Badge variant="outline" className={`${statusStyle[leave.status].bg} ${statusStyle[leave.status].text} text-[10px]`}>
                                                {leave.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {viewTab === "calendar" && (
                <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                    <CardHeader className="pb-2 px-5 pt-5">
                        <CardTitle className="text-sm font-semibold">
                            {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })} — Team Availability
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                <div key={d} className="font-medium text-muted-foreground py-1">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1
                                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                                const dayLeaves = leaves.filter(l => l.status === "Approved" && l.startDate <= dateStr && l.endDate >= dateStr)
                                const isToday = day === today.getDate()
                                return (
                                    <div key={day} className={`p-1.5 rounded-lg min-h-[48px] text-center text-xs transition-all ${isToday ? "bg-[#0d4f53] text-white" : dayLeaves.length > 0 ? "bg-red-50" : "hover:bg-muted/30"}`}>
                                        <span className="font-medium">{day}</span>
                                        <div className="flex gap-0.5 justify-center mt-0.5 flex-wrap">
                                            {dayLeaves.slice(0, 3).map(l => (
                                                <span key={l.id} className={`h-1.5 w-1.5 rounded-full ${leaveColor[l.type]}`} title={`${teamMembers.find(m => m.id === l.memberId)?.name} - ${l.type}`} />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground flex-wrap">
                            {Object.entries(leaveColor).map(([type, color]) => (
                                <span key={type} className="flex items-center gap-1">
                                    <span className={`h-2 w-2 rounded-full ${color}`} /> {type}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {viewTab === "balances" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers.map(member => {
                        const balance = leaveBalances[member.id] || { annual: 0, sick: 0, personal: 0, wfh: 0 }
                        const usedLeaves = leaves.filter(l => l.memberId === member.id && l.status === "Approved")
                        return (
                            <Card key={member.id} className="rounded-2xl border-none shadow-ambient surface-lowest">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                                            <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h5 className="font-semibold text-sm">{member.name}</h5>
                                            <p className="text-[10px] text-muted-foreground">{usedLeaves.length} leaves taken</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Annual", value: balance.annual, color: "bg-blue-400" },
                                            { label: "Sick", value: balance.sick, color: "bg-red-400" },
                                            { label: "Personal", value: balance.personal, color: "bg-purple-400" },
                                            { label: "WFH", value: balance.wfh, color: "bg-green-400" },
                                        ].map(b => (
                                            <div key={b.label} className="p-2 rounded-lg bg-muted/30 text-center">
                                                <div className="flex items-center gap-1 justify-center">
                                                    <span className={`h-1.5 w-1.5 rounded-full ${b.color}`} />
                                                    <span className="text-[10px] text-muted-foreground">{b.label}</span>
                                                </div>
                                                <div className="text-sm font-bold">{b.value}</div>
                                                <div className="text-[9px] text-muted-foreground">remaining</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Request Leave Dialog */}
            <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Request Leave</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium">Team Member</label>
                            <select value={formMember} onChange={e => setFormMember(e.target.value)}
                                className="w-full mt-1.5 p-2 rounded-lg border text-sm bg-white">
                                <option value="">Select member...</option>
                                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Leave Type</label>
                            <div className="flex gap-2 mt-1.5 flex-wrap">
                                {leaveTypes.map(t => (
                                    <button key={t} onClick={() => setFormType(t)}
                                        className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all ${formType === t ? "border-[#0d4f53] bg-muted/50 font-bold" : "border-transparent bg-muted/20 hover:bg-muted/40"}`}>
                                        <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${leaveColor[t]}`} />
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium">Start Date</label>
                                <Input type="date" className="mt-1.5" value={formStart} onChange={e => setFormStart(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">End Date</label>
                                <Input type="date" className="mt-1.5" value={formEnd} onChange={e => setFormEnd(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Reason</label>
                            <Input className="mt-1.5" placeholder="Reason for leave..." value={formReason} onChange={e => setFormReason(e.target.value)} />
                        </div>
                        <Button className="w-full gap-2" onClick={submitLeaveRequest}>
                            <Send className="h-4 w-4" /> Submit Request
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
