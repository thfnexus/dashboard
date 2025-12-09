"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/Overview" // reusing existing chart for now
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AnalyticsPage() {
    const [roleData, setRoleData] = useState<any[]>([])
    const [signupData, setSignupData] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            const { data: users } = await supabase.from('users').select('role, created_at')
            if (!users) return

            // Role Distribution
            const roles: Record<string, number> = {}
            users.forEach(u => {
                roles[u.role] = (roles[u.role] || 0) + 1
            })
            setRoleData(Object.keys(roles).map(k => ({ name: k, value: roles[k] })))

            // Signups over time (Daily for last 7 days)
            // Simplified generic line chart data
            setSignupData([
                { name: 'Mon', value: 4 },
                { name: 'Tue', value: 3 },
                { name: 'Wed', value: 10 },
                { name: 'Thu', value: 7 },
                { name: 'Fri', value: 2 },
                { name: 'Sat', value: 5 },
                { name: 'Sun', value: 8 },
            ])
        }
        fetchData()
    }, [])

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={signupData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="currentColor" strokeWidth={2} className="stroke-primary" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Role Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 flex justify-center gap-4">
                            {roleData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-sm text-muted-foreground capitalize">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
