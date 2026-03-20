"use client"

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    { subject: 'Leadership', A: 85, fullMark: 100 },
    { subject: 'Communication', A: 92, fullMark: 100 },
    { subject: 'Crisis Handling', A: 78, fullMark: 100 },
    { subject: 'Reliability', A: 88, fullMark: 100 },
    { subject: 'Engagement', A: 95, fullMark: 100 },
    { subject: 'Knowledge', A: 80, fullMark: 100 },
]

export function CaptainPerformanceRadar() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-4">
                <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                        <Radar
                            name="Captain"
                            dataKey="A"
                            stroke="#2563eb"
                            fill="#3b82f6"
                            fillOpacity={0.5}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
