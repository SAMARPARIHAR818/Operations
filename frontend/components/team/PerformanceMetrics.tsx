"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { teamMembers, deptColor } from "./teamData"
import { DollarSign, TrendingUp, Star, Clock, MessageSquare, ThumbsUp, Target, Headphones } from "lucide-react"
import { useCurrency } from "@/components/providers/CurrencyProvider"

// Revenue data per sales person
const revenueData = [
    { memberId: "3", monthly: [120000, 180000, 210000, 185000, 240000, 310000, 280000, 195000, 220000, 180000, 250000, 350000], target: 300000 },
    { memberId: "8", monthly: [80000, 95000, 110000, 85000, 130000, 145000, 160000, 120000, 105000, 90000, 140000, 180000], target: 200000 },
]

// SLA data for support
const slaMetrics = {
    avgFirstResponse: "4 min",
    avgResolution: "2.3 hrs",
    ticketsToday: 18,
    ticketsResolved: 14,
    csat: 4.1,
    slaBreaches: 2,
    openTickets: 12,
    categories: [
        { name: "Hotel Complaints", count: 5, avgTime: "1.8 hrs" },
        { name: "Transport Issues", count: 4, avgTime: "45 min" },
        { name: "Itinerary Changes", count: 6, avgTime: "3.2 hrs" },
        { name: "Refund Requests", count: 2, avgTime: "4.5 hrs" },
        { name: "General Inquiry", count: 8, avgTime: "15 min" },
    ]
}

export function PerformanceMetrics() {
    const salesMembers = teamMembers.filter(m => m.department === "Sales")
    const totalRevenue = salesMembers.reduce((a, m) => a + (m.revenueGenerated || 0), 0)
    const { formatAmount } = useCurrency()

    return (
        <div className="space-y-6">
            {/* Revenue Attribution */}
            <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#0d4f53]" /> Revenue Attribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                        <CardContent className="p-4 text-center">
                            <DollarSign className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                            <div className="text-2xl font-bold">{formatAmount(totalRevenue, true)}</div>
                            <div className="text-xs text-muted-foreground">Total Sales Revenue (Q1)</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                        <CardContent className="p-4 text-center">
                            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                            <div className="text-2xl font-bold">{formatAmount(350000, true)}</div>
                            <div className="text-xs text-muted-foreground">This Month</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                        <CardContent className="p-4 text-center">
                            <Target className="h-5 w-5 mx-auto mb-1 text-amber-600" />
                            <div className="text-2xl font-bold">78%</div>
                            <div className="text-xs text-muted-foreground">Target Achievement</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Per-person revenue */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {revenueData.map(rd => {
                        const member = teamMembers.find(m => m.id === rd.memberId)!
                        const thisMonth = rd.monthly[rd.monthly.length - 1]
                        const lastMonth = rd.monthly[rd.monthly.length - 2]
                        const growth = ((thisMonth - lastMonth) / lastMonth * 100).toFixed(0)
                        const targetPercent = Math.round((thisMonth / rd.target) * 100)
                        return (
                            <Card key={rd.memberId} className="rounded-2xl border-none shadow-ambient surface-lowest">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                                            <AvatarFallback>{member.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold text-sm">{member.name}</h4>
                                            <p className="text-xs text-muted-foreground">{member.role} · {member.specialization.split(",")[0]}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-center mb-3">
                                        <div className="p-2 rounded-lg bg-muted/30">
                                            <div className="text-sm font-bold">{formatAmount(thisMonth, true)}</div>
                                            <div className="text-[10px] text-muted-foreground">This Month</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted/30">
                                            <div className={`text-sm font-bold ${Number(growth) >= 0 ? "text-green-600" : "text-red-500"}`}>
                                                {Number(growth) >= 0 ? "+" : ""}{growth}%
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">Growth</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted/30">
                                            <div className="text-sm font-bold">{targetPercent}%</div>
                                            <div className="text-[10px] text-muted-foreground">of Target</div>
                                        </div>
                                    </div>
                                    {/* Mini bar chart of monthly revenue */}
                                    <div className="flex items-end gap-1 h-12">
                                        {rd.monthly.map((v, i) => {
                                            const max = Math.max(...rd.monthly)
                                            const h = (v / max) * 100
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                                    <div className={`w-full rounded-t transition-all ${i === rd.monthly.length - 1 ? "bg-[#0d4f53]" : "bg-[#0d4f53]/30"}`} style={{ height: `${h}%` }} />
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="flex justify-between text-[8px] text-muted-foreground mt-1">
                                        <span>Jan</span><span>Jun</span><span>Dec</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* SLA Tracking */}
            <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Headphones className="h-5 w-5 text-[#0d4f53]" /> Support SLA Tracking
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                        { label: "Avg. First Response", value: slaMetrics.avgFirstResponse, icon: Clock, color: "text-blue-600" },
                        { label: "Avg. Resolution", value: slaMetrics.avgResolution, icon: MessageSquare, color: "text-emerald-600" },
                        { label: "CSAT Score", value: slaMetrics.csat.toString(), icon: ThumbsUp, color: "text-amber-600" },
                        { label: "SLA Breaches", value: slaMetrics.slaBreaches.toString(), icon: Target, color: "text-red-500" },
                    ].map(m => (
                        <Card key={m.label} className="rounded-2xl border-none shadow-ambient surface-lowest">
                            <CardContent className="p-4 text-center">
                                <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
                                <div className="text-xl font-bold">{m.value}</div>
                                <div className="text-[10px] text-muted-foreground">{m.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Ticket Categories */}
                <Card className="rounded-2xl border-none shadow-ambient surface-lowest">
                    <CardHeader className="pb-2 px-5 pt-5">
                        <CardTitle className="text-sm font-semibold">Ticket Breakdown ({slaMetrics.ticketsResolved}/{slaMetrics.ticketsToday} resolved today)</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="space-y-3">
                            {slaMetrics.categories.map(cat => {
                                const percent = (cat.count / slaMetrics.ticketsToday) * 100
                                return (
                                    <div key={cat.name} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium">{cat.name}</span>
                                            <span className="text-muted-foreground">{cat.count} tickets · avg {cat.avgTime}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                                            <div className="h-full rounded-full bg-[#0d4f53]/70 transition-all" style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
