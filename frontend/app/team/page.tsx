"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
    Users, Search, UserPlus, TrendingUp, Clock, CheckCircle2, AlertCircle,
    Calendar, MapPin, Phone, Mail, Star, Briefcase, Activity, Trophy,
    ChevronRight, BarChart3, Zap, Coffee, Plane, Target, Shield,
    ArrowLeft, Sun, CalendarDays, DollarSign, Anchor, FileText, Timer
} from "lucide-react"

// Tab components
import { DailyStandup } from "@/components/team/DailyStandup"
import { LeaveManagement } from "@/components/team/LeaveManagement"
import { PerformanceMetrics } from "@/components/team/PerformanceMetrics"
import { OnboardingPipeline } from "@/components/team/OnboardingPipeline"
import { ReportsAlerts } from "@/components/team/ReportsAlerts"
import { TimeTracking } from "@/components/team/TimeTracking"

// Shared data
import { teamMembers, allTasks, statusDot, priorityColor, taskStatusColor, deptColor, type TeamMember } from "@/components/team/teamData"

// ─────────────────── TABS CONFIG ───────────────────
const tabs = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "standup", label: "Daily Standup", icon: Sun },
    { id: "leaves", label: "Leaves", icon: CalendarDays },
    { id: "performance", label: "Revenue & SLA", icon: DollarSign },
    { id: "onboarding", label: "Onboarding", icon: Anchor },
    { id: "reports", label: "Reports & Alerts", icon: FileText },
    { id: "time", label: "Time Tracking", icon: Timer },
]

// ─────────────────── MAIN PAGE ───────────────────
export default function TeamPage() {
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("overview")
    const [search, setSearch] = useState("")
    const [deptFilter, setDeptFilter] = useState("All")
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)

    // Add Member state
    const [addMemberOpen, setAddMemberOpen] = useState(false)
    const [newName, setNewName] = useState("")
    const [newRole, setNewRole] = useState("")
    const [newDept, setNewDept] = useState("Operations")
    const [newEmail, setNewEmail] = useState("")
    const [newPhone, setNewPhone] = useState("")
    const [newLocation, setNewLocation] = useState("")
    const [newSpecialization, setNewSpecialization] = useState("")

    // Dynamic team members list
    const [teamList, setTeamList] = useState(teamMembers)

    // Load from API
    useEffect(() => {
        fetch("/api/team")
            .then(r => r.json())
            .then(res => {
                if (res.data && res.data.length > 0) {
                    const mapped = res.data.map((m: any) => ({
                        id: m.id,
                        name: m.name,
                        avatar: m.name.split(' ').map((n: string) => n[0]).join(''),
                        role: m.role,
                        department: m.department,
                        email: m.email,
                        phone: m.phone || '',
                        status: m.status || 'Offline',
                        location: m.location || '',
                        joinDate: m.join_date || '',
                        specialization: m.specialization || '',
                        tasksCompleted: m.tasks_completed || 0,
                        tasksPending: m.tasks_pending || 0,
                        tasksOverdue: m.tasks_overdue || 0,
                        onTimeRate: m.on_time_rate || 100,
                        tripsManaged: m.trips_managed || 0,
                        rating: m.rating || 0,
                        currentTask: m.current_task || 'No active task',
                        vendorsManaged: m.vendors_managed || [],
                        recentActivity: 'Just added',
                        activityTime: 'now',
                        weeklyHours: {},
                    }))
                    setTeamList([...teamMembers, ...mapped])
                }
            })
            .catch(() => {})
    }, [])

    const addTeamMember = async () => {
        if (!newName || !newRole || !newEmail) {
            toast({ title: "⚠️ Missing fields", description: "Name, role, and email are required." })
            return
        }

        const newMember: TeamMember = {
            id: `m-${Date.now()}`,
            name: newName,
            avatar: newName.split(' ').map(n => n[0]).join(''),
            role: newRole,
            department: newDept as TeamMember['department'],
            email: newEmail,
            phone: newPhone,
            status: 'Offline' as const,
            location: newLocation,
            joinDate: new Date().toISOString().slice(0, 10),
            specialization: newSpecialization,
            tasksCompleted: 0,
            tasksPending: 0,
            tasksOverdue: 0,
            onTimeRate: 100,
            tripsManaged: 0,
            rating: 0,
            currentTask: 'No active task',
            vendorsManaged: [],
            recentActivity: 'Just joined the team',
            activityTime: 'now',
            weeklyHours: {},
        }

        setTeamList(prev => [newMember, ...prev])

        try {
            const res = await fetch("/api/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    role: newRole,
                    department: newDept,
                    email: newEmail,
                    phone: newPhone,
                    location: newLocation,
                    specialization: newSpecialization,
                    status: 'Offline',
                }),
            })
            const data = await res.json()
            if (data.data?.[0]?.id) {
                setTeamList(prev => prev.map(m => m.id === newMember.id ? { ...m, id: data.data[0].id } : m))
            }
        } catch (e) {}

        toast({ title: "✅ Team Member Added", description: `${newName} has been added to the team.` })
        setAddMemberOpen(false)
        setNewName(''); setNewRole(''); setNewEmail(''); setNewPhone(''); setNewLocation(''); setNewSpecialization('')
    }

    const departments = ["All", "Leadership", "Operations", "Sales", "Marketing", "Finance", "Support"]

    const filtered = teamList.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                              m.role.toLowerCase().includes(search.toLowerCase()) ||
                              m.department.toLowerCase().includes(search.toLowerCase())
        const matchesDept = deptFilter === "All" || m.department === deptFilter
        return matchesSearch && matchesDept
    })

    const totalStaff = teamList.length
    const onlineCount = teamList.filter(m => m.status === "Online" || m.status === "Busy").length
    const onLeaveCount = teamList.filter(m => m.status === "On Leave").length
    const avgOnTime = Math.round(teamList.reduce((a, m) => a + m.onTimeRate, 0) / totalStaff)
    const totalPending = teamList.reduce((a, m) => a + m.tasksPending, 0)
    const totalOverdue = teamList.reduce((a, m) => a + m.tasksOverdue, 0)

    const openMemberDetail = (member: TeamMember) => {
        setSelectedMember(member)
        setDetailOpen(true)
    }

    const memberTasks = selectedMember
        ? allTasks.filter(t => t.assigneeId === selectedMember.id)
        : []

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen">
            {/* Page Header with Back Button */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-muted/50">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Team Hub</h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">Monitor your team, track tasks, and keep operations running smoothly.</p>
                    </div>
                </div>
                <Button className="shadow-lg gap-2" onClick={() => setAddMemberOpen(true)}>
                    <UserPlus className="h-4 w-4" /> Add Team Member
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: "Total Staff", value: totalStaff, icon: Users, color: "text-[#0d4f53]" },
                    { label: "Active Now", value: onlineCount, icon: Zap, color: "text-green-600" },
                    { label: "On Leave", value: onLeaveCount, icon: Coffee, color: "text-blue-500" },
                    { label: "Avg On-Time", value: `${avgOnTime}%`, icon: Target, color: "text-emerald-600" },
                    { label: "Tasks Pending", value: totalPending, icon: Clock, color: "text-amber-600" },
                    { label: "Overdue", value: totalOverdue, icon: AlertCircle, color: "text-red-500" },
                ].map((kpi) => (
                    <Card key={kpi.label} className="rounded-2xl border-none shadow-ambient surface-lowest">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                                <span className="text-xs text-muted-foreground">{kpi.label}</span>
                            </div>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-border/30">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all whitespace-nowrap ${
                            activeTab === tab.id
                                ? "bg-white shadow-ambient text-[#0d4f53] border-b-2 border-[#0d4f53]"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name, role, department..." className="pl-8 bg-white/50" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                            {departments.map(d => (
                                <Button key={d} size="sm" variant={deptFilter === d ? "default" : "outline"} className="rounded-full text-xs h-8" onClick={() => setDeptFilter(d)}>
                                    {d !== "All" && <span className={`h-2 w-2 rounded-full mr-1.5 ${deptColor[d]}`} />}
                                    {d}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Staff Grid + Sidebar */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-lg">Staff Directory</h3>
                                <span className="text-xs text-muted-foreground">{filtered.length} members</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filtered.map(member => (
                                    <Card key={member.id} className="rounded-2xl border-none shadow-ambient surface-lowest hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 group" onClick={() => openMemberDetail(member)}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="relative">
                                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                                                        <AvatarFallback className="text-sm font-bold">{member.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${statusDot[member.status]}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-sm truncate">{member.name}</h4>
                                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 rounded-full">
                                                            <span className={`h-1.5 w-1.5 rounded-full mr-1 ${deptColor[member.department]}`} />
                                                            {member.department}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                            <MapPin className="h-2.5 w-2.5" /> {member.location}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-3 gap-2 text-center">
                                                <div><div className="text-xs font-bold">{member.tasksPending}</div><div className="text-[10px] text-muted-foreground">Pending</div></div>
                                                <div><div className="text-xs font-bold text-emerald-600">{member.onTimeRate}%</div><div className="text-[10px] text-muted-foreground">On-Time</div></div>
                                                <div><div className="text-xs font-bold">{member.tripsManaged}</div><div className="text-[10px] text-muted-foreground">Trips</div></div>
                                            </div>
                                            <div className="mt-2 px-2 py-1.5 bg-muted/40 rounded-lg">
                                                <span className="text-[10px] text-muted-foreground">Working on: </span>
                                                <span className="text-[11px] font-medium">{member.currentTask}</span>
                                            </div>

                                            {/* Vendor Relationships */}
                                            {member.vendorsManaged && member.vendorsManaged.length > 0 && (
                                                <div className="mt-2 flex items-center gap-1 flex-wrap">
                                                    <span className="text-[9px] text-muted-foreground">Vendors:</span>
                                                    {member.vendorsManaged.map(v => (
                                                        <Badge key={v} variant="secondary" className="text-[9px] h-4 px-1.5">{v.split(" ")[0]}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-4">
                            <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                                <CardHeader className="pb-2 px-5 pt-5">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-[#0d4f53]" /> Live Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5 pt-1">
                                    <div className="space-y-3">
                                        {teamList.filter(m => m.status !== "On Leave").sort((a, b) => {
                                            const timeOrder = (t: string) => { if (t.includes("m ago")) return parseInt(t); if (t.includes("h ago")) return parseInt(t) * 60; return 9999 }
                                            return timeOrder(a.activityTime) - timeOrder(b.activityTime)
                                        }).slice(0, 6).map(member => (
                                            <div key={member.id} className="flex items-start gap-2.5 py-1">
                                                <Avatar className="h-7 w-7 mt-0.5"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} /><AvatarFallback className="text-[9px]">{member.avatar}</AvatarFallback></Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs"><span className="font-medium">{member.name.split(" ")[0]}</span>{" "}<span className="text-muted-foreground">{member.recentActivity}</span></p>
                                                    <span className="text-[10px] text-muted-foreground">{member.activityTime}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                                <CardHeader className="pb-2 px-5 pt-5">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-amber-500" /> Top Performers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5 pt-1">
                                    <div className="space-y-2.5">
                                        {[...teamList].sort((a, b) => b.tasksCompleted - a.tasksCompleted).slice(0, 5).map((member, idx) => (
                                            <div key={member.id} className="flex items-center gap-3">
                                                <span className="text-xs font-bold w-5 text-center">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}</span>
                                                <Avatar className="h-7 w-7"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} /><AvatarFallback className="text-[9px]">{member.avatar}</AvatarFallback></Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-xs font-medium truncate block">{member.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{member.tasksCompleted} tasks</span>
                                                </div>
                                                <div className="flex items-center gap-0.5 text-amber-500"><Star className="h-3 w-3 fill-current" /><span className="text-xs font-medium">{member.rating}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                                <CardHeader className="pb-2 px-5 pt-5">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-[#0d4f53]" /> Workload
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5 pt-1">
                                    <div className="space-y-3">
                                        {[...teamList].sort((a, b) => b.tasksPending - a.tasksPending).slice(0, 6).map(member => {
                                            const load = member.tasksPending; const maxLoad = 15
                                            const percent = Math.min((load / maxLoad) * 100, 100); const isOverloaded = load > 10
                                            return (
                                                <div key={member.id} className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-medium truncate">{member.name.split(" ")[0]}</span>
                                                        <span className={`font-medium ${isOverloaded ? "text-red-500" : "text-muted-foreground"}`}>{load} tasks {isOverloaded && "⚠️"}</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${isOverloaded ? "bg-red-400" : percent > 60 ? "bg-amber-400" : "bg-[#0d4f53]"}`} style={{ width: `${percent}%` }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                                <CardHeader className="pb-2 px-5 pt-5">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-[#0d4f53]" /> By Department
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5 pt-1">
                                    <div className="space-y-2">
                                        {departments.filter(d => d !== "All").map(dept => {
                                            const members = teamList.filter(m => m.department === dept)
                                            const active = members.filter(m => m.status === "Online" || m.status === "Busy").length
                                            return (
                                                <div key={dept} className="flex items-center gap-2.5">
                                                    <span className={`h-3 w-3 rounded-full ${deptColor[dept]}`} />
                                                    <span className="text-xs font-medium flex-1">{dept}</span>
                                                    <span className="text-[10px] text-muted-foreground">{active}/{members.length} active</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "standup" && <DailyStandup />}
            {activeTab === "leaves" && <LeaveManagement />}
            {activeTab === "performance" && <PerformanceMetrics />}
            {activeTab === "onboarding" && <OnboardingPipeline />}
            {activeTab === "reports" && <ReportsAlerts />}
            {activeTab === "time" && <TimeTracking />}

            {/* ──────── Member Detail Dialog ──────── */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                    {selectedMember && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl">{selectedMember.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <Avatar className="h-16 w-16 border-2 border-white shadow-md"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.name}`} /><AvatarFallback className="text-lg">{selectedMember.avatar}</AvatarFallback></Avatar>
                                        <span className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white ${statusDot[selectedMember.status]}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{selectedMember.name}</h3>
                                            <Badge variant="outline" className="rounded-full text-xs"><span className={`h-1.5 w-1.5 rounded-full mr-1 ${statusDot[selectedMember.status]}`} />{selectedMember.status}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{selectedMember.role} · {selectedMember.department}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{selectedMember.specialization}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedMember.email}</span>
                                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedMember.phone}</span>
                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedMember.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { label: "Completed", value: selectedMember.tasksCompleted, icon: CheckCircle2, color: "text-green-600" },
                                        { label: "Pending", value: selectedMember.tasksPending, icon: Clock, color: "text-amber-600" },
                                        { label: "On-Time Rate", value: `${selectedMember.onTimeRate}%`, icon: Target, color: "text-emerald-600" },
                                        { label: "Trips Managed", value: selectedMember.tripsManaged, icon: Plane, color: "text-blue-600" },
                                    ].map(s => (
                                        <div key={s.label} className="p-3 rounded-xl bg-muted/30 text-center">
                                            <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                                            <div className="text-lg font-bold">{s.value}</div>
                                            <div className="text-[10px] text-muted-foreground">{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Vendor relationships */}
                                {selectedMember.vendorsManaged && selectedMember.vendorsManaged.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-[#0d4f53]" /> Vendor Relationships
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMember.vendorsManaged.map(v => (
                                                <Badge key={v} variant="outline" className="text-xs rounded-full">{v}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Time breakdown */}
                                {selectedMember.weeklyHours && Object.keys(selectedMember.weeklyHours).length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <Timer className="h-4 w-4 text-[#0d4f53]" /> Weekly Time ({Object.values(selectedMember.weeklyHours).reduce((a, b) => a + b, 0)}h)
                                        </h4>
                                        <div className="flex h-3 rounded-full overflow-hidden">
                                            {Object.entries(selectedMember.weeklyHours).sort((a, b) => b[1] - a[1]).map(([cat, hrs]) => (
                                                <div key={cat} className="bg-[#0d4f53] first:rounded-l-full last:rounded-r-full hover:opacity-80"
                                                     style={{ width: `${(hrs / Object.values(selectedMember.weeklyHours!).reduce((a, b) => a + b, 0)) * 100}%`, opacity: 0.3 + (hrs / Object.values(selectedMember.weeklyHours!).reduce((a, b) => a + b, 0)) }} title={`${cat}: ${hrs}h`} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-[#0d4f53]" /> Assigned Tasks ({memberTasks.length})
                                    </h4>
                                    {memberTasks.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">No tasks assigned.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {memberTasks.map(task => {
                                                const pc = priorityColor[task.priority]
                                                const tc = taskStatusColor[task.status]
                                                return (
                                                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                                                        <div className={`h-2 w-2 rounded-full ${pc.dot}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{task.title}</p>
                                                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                                                <span>{task.category}</span>
                                                                {task.tripLinked && <span>· ✈️ {task.tripLinked}</span>}
                                                                <span>· Due: {task.dueDate}</span>
                                                                {task.estimatedHours && <span>· Est: {task.estimatedHours}h</span>}
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className={`${tc.bg} ${tc.text} text-[10px] shrink-0 rounded-full`}>{task.status}</Badge>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ──────── Add Team Member Dialog ──────── */}
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium">Full Name *</label>
                                <Input className="mt-1.5" placeholder="e.g. Arun Mehta" value={newName} onChange={e => setNewName(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Role *</label>
                                <Input className="mt-1.5" placeholder="e.g. Operations Lead" value={newRole} onChange={e => setNewRole(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium">Department</label>
                                <select value={newDept} onChange={e => setNewDept(e.target.value)}
                                    className="w-full mt-1.5 p-2 rounded-lg border text-sm bg-white">
                                    {["Operations", "Sales", "Marketing", "Finance", "Support", "Leadership"].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email *</label>
                                <Input type="email" className="mt-1.5" placeholder="email@boketto.co" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium">Phone</label>
                                <Input className="mt-1.5" placeholder="+91 98765 43210" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Location</label>
                                <Input className="mt-1.5" placeholder="e.g. New Delhi" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Specialization</label>
                            <Input className="mt-1.5" placeholder="e.g. Ladakh & Spiti Routes" value={newSpecialization} onChange={e => setNewSpecialization(e.target.value)} />
                        </div>
                        <Button className="w-full gap-2" onClick={addTeamMember}>
                            <UserPlus className="h-4 w-4" /> Add to Team
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
