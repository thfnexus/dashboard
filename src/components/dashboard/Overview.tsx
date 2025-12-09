"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function Overview() {
    const [data, setData] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            // Fetch users created in last 12 months
            // Since Supabase doesn't do "group by" easily via JS client, we fetch meaningful subset and aggregate
            const { data: users } = await supabase
                .from('users')
                .select('created_at')
                .gte('created_at', new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString())

            if (!users) return

            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const counts: Record<string, number> = {}

            users.forEach(u => {
                const date = new Date(u.created_at)
                const key = months[date.getMonth()]
                counts[key] = (counts[key] || 0) + 1
            })

            const chartData = months.map(m => ({
                name: m,
                total: counts[m] || 0
            }))

            // simple sort by month index? This just shows Jan-Dec. 
            // For rolling window, we'd need better logic. 
            // For this demo, static Jan-Dec axis is fine or simple aggregation.
            setData(chartData)
        }
        fetchData()
    }, [])

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
