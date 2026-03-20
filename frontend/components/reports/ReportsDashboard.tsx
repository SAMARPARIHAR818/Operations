"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const revenueData = [
    { name: 'Jan', revenue: 4000, profit: 2400 },
    { name: 'Feb', revenue: 3000, profit: 1398 },
    { name: 'Mar', revenue: 2000, profit: 9800 },
    { name: 'Apr', revenue: 2780, profit: 3908 },
    { name: 'May', revenue: 1890, profit: 4800 },
    { name: 'Jun', revenue: 2390, profit: 3800 },
]

const satisfactionData = [
    { name: 'Jan', score: 4.5 },
    { name: 'Feb', score: 4.2 },
    { name: 'Mar', score: 4.8 },
    { name: 'Apr', score: 4.7 },
    { name: 'May', score: 4.9 },
]

export function ReportsDashboard() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Revenue vs Profit Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Customer Satisfaction Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={satisfactionData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 5]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="col-span-1 md:col-span-2 grid gap-4 grid-cols-1 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Net Profit Margin</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">24.5%</div><p className="text-xs text-muted-foreground">+2.1% from last month</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Avg Trip Cost</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">$1,250</div><p className="text-xs text-muted-foreground">-5% from last month</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Repeat Customer Rate</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">35%</div><p className="text-xs text-muted-foreground">+4% all time high</p></CardContent>
                </Card>
            </div>
        </div>
    )
}
