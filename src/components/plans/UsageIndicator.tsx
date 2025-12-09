"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Zap } from "lucide-react"
import Link from "next/link"

interface UsageIndicatorProps {
    className?: string
}

export function UsageIndicator({ className }: UsageIndicatorProps) {
    const [usage, setUsage] = useState({ current: 0, limit: 0, planName: '' })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchUsage()
    }, [])

    const fetchUsage = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const response = await fetch('/api/usage')
            if (response.ok) {
                const data = await response.json()
                setUsage(data)
            }
        } catch (error) {
            console.error('Failed to fetch usage:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className={`animate-pulse bg-muted rounded-lg p-4 ${className}`}>
                <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mb-2" />
                <div className="h-2 bg-muted-foreground/20 rounded" />
            </div>
        )
    }

    const percentage = usage.limit > 0 ? (usage.current / usage.limit) * 100 : 0
    const isNearLimit = percentage >= 80
    const isAtLimit = usage.current >= usage.limit

    return (
        <div className={`bg-card border rounded-lg p-4 ${className}`}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-medium text-sm">File Analysis Usage</h3>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {usage.planName} Plan
                    </p>
                </div>
                {isNearLimit && (
                    <AlertCircle className={`w-5 h-5 ${isAtLimit ? 'text-destructive' : 'text-yellow-500'}`} />
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        {usage.current} of {usage.limit} files
                    </span>
                    <span className="font-medium">{percentage.toFixed(0)}%</span>
                </div>

                <Progress
                    value={percentage}
                    className="h-2"
                />
            </div>

            {isAtLimit ? (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-destructive">Limit Reached</p>
                            <p className="text-xs text-destructive/80 mt-1">
                                You've used all your file analyses this month. Upgrade to continue.
                            </p>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline mt-2"
                            >
                                <Zap className="w-3 h-3" />
                                Upgrade Now
                            </Link>
                        </div>
                    </div>
                </div>
            ) : isNearLimit ? (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-600">Running Low</p>
                            <p className="text-xs text-yellow-600/80 mt-1">
                                You're approaching your monthly limit. Consider upgrading.
                            </p>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 hover:underline mt-2"
                            >
                                View Plans
                            </Link>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
