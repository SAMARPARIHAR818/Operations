"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { teamMembers } from "./teamData"
import {
    AlertTriangle, CheckCircle2, Info, X, Eye, EyeOff,
    TrendingUp, Star, FileText, ChevronRight, Bell, BellOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Alert {
    id: string
    type: "critical" | "warning" | "info"
    title: string
    description: string
    time: string
    read: boolean
    actionLabel?: string
    dismissed: boolean
}

const alertIcon: Record<string, { icon: any; color: string; bg: string }> = {
    critical: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 border-l-red-400" },
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 border-l-amber-400" },
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50 border-l-blue-400" },
}

const initialAlerts: Alert[] = [
    { id: "al1", type: "critical", title: "Overdue Task: Update Vendor SLAs", description: "Priya's SLA update task is 3 days overdue. Affects 4 vendor contracts.", time: "10 min ago", read: false, actionLabel: "View Task", dismissed: false },
    { id: "al2", type: "critical", title: "Captain Missing for Spiti Trip", description: "Spiti Valley trip on Apr 5 has no assigned captain. 18 pax confirmed.", time: "25 min ago", read: false, actionLabel: "Assign Captain", dismissed: false },
    { id: "al3", type: "warning", title: "Leave Conflict Detected", description: "Both Priya and Karan are requesting Apr 10-14 leave. Only 1 ops person would remain.", time: "1 hour ago", read: false, actionLabel: "Review Leaves", dismissed: false },
    { id: "al4", type: "warning", title: "Vendor Contract Expiring", description: "Mountain Lodge Spiti contract expires in 7 days. Renewal discussion pending.", time: "2 hours ago", read: true, actionLabel: "Contact Vendor", dismissed: false },
    { id: "al5", type: "info", title: "New Captain Application", description: "Kiran Joshi from Dehradun has applied. Adventure sports specialist.", time: "3 hours ago", read: true, actionLabel: "Review Application", dismissed: false },
    { id: "al6", type: "info", title: "Weekly Revenue Target Met", description: "Sales team exceeded target by 12%. Rahul closed TechCorp deal (₹4.5L).", time: "5 hours ago", read: true, dismissed: false },
    { id: "al7", type: "warning", title: "Low Customer Satisfaction Alert", description: "Rajasthan trip CSAT below 4.0. Main issues: hotel quality and itinerary timing.", time: "6 hours ago", read: true, actionLabel: "View Feedback", dismissed: false },
]

export function ReportsAlerts() {
    const { toast } = useToast()
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
    const [alertFilter, setAlertFilter] = useState<"all" | "unread" | "critical" | "warning" | "info">("all")
    const [muteNotifications, setMuteNotifications] = useState(false)
    const [reportView, setReportView] = useState<"alerts" | "weekly">("alerts")

    const markAsRead = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
        toast({ title: "✓ Marked as read" })
    }

    const markAllRead = () => {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })))
        toast({ title: "✓ All alerts marked as read" })
    }

    const dismissAlert = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a))
        toast({ title: "🗑️ Alert dismissed" })
    }

    const handleAction = (alert: Alert) => {
        markAsRead(alert.id)
        toast({
            title: `🔗 ${alert.actionLabel || "Action"}`,
            description: `Navigating to the relevant section for: "${alert.title}"`,
        })
    }

    const restoreAll = () => {
        setAlerts(prev => prev.map(a => ({ ...a, dismissed: false })))
        toast({ title: "↩️ All alerts restored" })
    }

    const filteredAlerts = alerts.filter(a => {
        if (a.dismissed) return false
        if (alertFilter === "unread") return !a.read
        if (alertFilter === "critical" || alertFilter === "warning" || alertFilter === "info") return a.type === alertFilter
        return true
    })

    const unreadCount = alerts.filter(a => !a.read && !a.dismissed).length
    const criticalCount = alerts.filter(a => a.type === "critical" && !a.dismissed).length

    // Weekly report data
    const weeklyReport = {
        period: "Mar 14 – Mar 20, 2026",
        metrics: [
            { label: "Trips Completed", value: 4, change: "+2 vs last week" },
            { label: "Revenue", value: "₹12.8L", change: "+18%" },
            { label: "Tasks Closed", value: 47, change: "+5" },
            { label: "Avg CSAT", value: "4.6", change: "+0.3" },
        ],
        highlights: [
            "TechCorp 50-pax deal closed (₹4.5L) by Rahul",
            "New captain Sonam Wangchuk onboarded (Leh specialist)",
            "Spiti Valley trip got 4.9 CSAT — best this quarter",
            "Social media reach up 32% from Ladakh campaign",
        ],
        concerns: [
            "Rajasthan trip CSAT below 4.0 — needs investigation",
            "2 vendor contracts expiring next week — renewal due",
            "Anita's support ticket backlog growing (14 open)",
        ],
        departments: [
            { name: "Operations", score: 92, trend: "up" },
            { name: "Sales", score: 88, trend: "up" },
            { name: "Marketing", score: 85, trend: "stable" },
            { name: "Finance", score: 90, trend: "up" },
            { name: "Support", score: 78, trend: "down" },
        ],
        starOfWeek: teamMembers[2], // Rahul
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Button size="sm" variant={reportView === "alerts" ? "default" : "outline"} className="rounded-full h-8"
                        onClick={() => setReportView("alerts")}>
                        Founder Alerts {unreadCount > 0 && <Badge className="ml-1 h-4 w-4 p-0 text-[9px] rounded-full">{unreadCount}</Badge>}
                    </Button>
                    <Button size="sm" variant={reportView === "weekly" ? "default" : "outline"} className="rounded-full h-8"
                        onClick={() => setReportView("weekly")}>
                        Weekly Report
                    </Button>
                </div>
                {reportView === "alerts" && (
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setMuteNotifications(!muteNotifications)}>
                            {muteNotifications ? <BellOff className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                            {muteNotifications ? "Unmute" : "Mute"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={markAllRead}>Mark All Read</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={restoreAll}>Restore All</Button>
                    </div>
                )}
            </div>

            {reportView === "alerts" && (
                <>
                    {/* Filter pills */}
                    <div className="flex gap-1.5">
                        {[
                            { key: "all" as const, label: "All", count: alerts.filter(a => !a.dismissed).length },
                            { key: "unread" as const, label: "Unread", count: unreadCount },
                            { key: "critical" as const, label: "Critical", count: criticalCount },
                            { key: "warning" as const, label: "Warning", count: alerts.filter(a => a.type === "warning" && !a.dismissed).length },
                            { key: "info" as const, label: "Info", count: alerts.filter(a => a.type === "info" && !a.dismissed).length },
                        ].map(f => (
                            <Button key={f.key} size="sm" variant={alertFilter === f.key ? "default" : "outline"} className="rounded-full text-xs h-7"
                                onClick={() => setAlertFilter(f.key)}>
                                {f.label} ({f.count})
                            </Button>
                        ))}
                    </div>

                    {/* Alert Cards */}
                    <div className="space-y-2.5">
                        {filteredAlerts.length === 0 && (
                            <p className="text-sm text-muted-foreground italic text-center py-8">
                                {alertFilter === "unread" ? "No unread alerts 🎉" : "No alerts matching this filter."}
                            </p>
                        )}
                        {filteredAlerts.map(alert => {
                            const config = alertIcon[alert.type]
                            const Icon = config.icon
                            return (
                                <Card key={alert.id} className={`rounded-xl border-l-4 ${config.bg} shadow-sm transition-all ${!alert.read ? "ring-1 ring-offset-1 ring-muted" : "opacity-85"}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.color}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-semibold">{alert.title}</h4>
                                                    {!alert.read && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                                                    <div className="flex gap-1.5">
                                                        {!alert.read && (
                                                            <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={() => markAsRead(alert.id)}>
                                                                <Eye className="h-3 w-3" /> Read
                                                            </Button>
                                                        )}
                                                        {alert.actionLabel && (
                                                            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 rounded-full" onClick={() => handleAction(alert)}>
                                                                {alert.actionLabel} <ChevronRight className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500" onClick={() => dismissAlert(alert.id)}>
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </>
            )}

            {reportView === "weekly" && (
                <div className="space-y-5">
                    <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                        <CardHeader className="pb-2 px-5 pt-5">
                            <CardTitle className="text-sm font-semibold flex items-center justify-between">
                                <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#0d4f53]" /> Weekly Performance Report</span>
                                <Badge variant="outline" className="text-xs">{weeklyReport.period}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                                {weeklyReport.metrics.map(m => (
                                    <div key={m.label} className="p-3 rounded-xl bg-muted/30 text-center">
                                        <div className="text-xl font-bold">{m.value}</div>
                                        <div className="text-[10px] text-muted-foreground">{m.label}</div>
                                        <div className="text-[10px] text-green-600 font-medium mt-0.5">{m.change}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Highlights */}
                        <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                            <CardHeader className="pb-2 px-5 pt-5">
                                <CardTitle className="text-sm font-semibold text-green-600 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" /> Highlights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5">
                                <ul className="space-y-2">
                                    {weeklyReport.highlights.map((h, i) => (
                                        <li key={i} className="text-xs flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                                            {h}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Concerns */}
                        <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                            <CardHeader className="pb-2 px-5 pt-5">
                                <CardTitle className="text-sm font-semibold text-amber-600 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> Concerns
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5">
                                <ul className="space-y-2">
                                    {weeklyReport.concerns.map((c, i) => (
                                        <li key={i} className="text-xs flex items-start gap-2">
                                            <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Department Scores */}
                    <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                        <CardHeader className="pb-2 px-5 pt-5">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-[#0d4f53]" /> Department Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                            <div className="grid grid-cols-5 gap-3">
                                {weeklyReport.departments.map(d => (
                                    <div key={d.name} className="text-center p-3 rounded-xl bg-muted/30">
                                        <div className={`text-xl font-bold ${d.score >= 90 ? "text-green-600" : d.score >= 80 ? "text-amber-600" : "text-red-500"}`}>
                                            {d.score}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">{d.name}</div>
                                        <div className="text-[10px] mt-0.5">
                                            {d.trend === "up" && "📈"}
                                            {d.trend === "down" && "📉"}
                                            {d.trend === "stable" && "➡️"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Star of the Week */}
                    <Card className="rounded-2xl border-none shadow-ambient surface-lowest bg-gradient-to-r from-amber-50 to-yellow-50">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Star className="h-7 w-7 text-amber-500 fill-current" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-amber-600">⭐ Star of the Week</p>
                                    <h4 className="text-lg font-bold">{weeklyReport.starOfWeek.name}</h4>
                                    <p className="text-xs text-muted-foreground">{weeklyReport.starOfWeek.role} · Closed ₹4.5L deal + exceeded weekly target by 12%</p>
                                </div>
                                <Avatar className="h-12 w-12 ml-auto border-2 border-amber-200 shadow-sm">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${weeklyReport.starOfWeek.name}`} />
                                    <AvatarFallback>{weeklyReport.starOfWeek.avatar}</AvatarFallback>
                                </Avatar>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
