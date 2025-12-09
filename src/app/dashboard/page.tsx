import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/Overview"
import { RecentUsers } from "@/components/dashboard/RecentUsers"
import { Users, UserPlus, UserCheck, ShieldAlert } from "lucide-react"

export default async function DashboardPage() {
    const supabase = await createClient()

    // Parallel data fetching
    // Parallel data fetching
    const [
        { count: totalUsers },
        { count: activeUsers },
        { count: newUsers },
        { count: admins },
        { data: { user } },
    ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "admin"),
        supabase.auth.getUser()
    ])

    let userRole = 'user'
    if (user) {
        const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
        userRole = data?.role || 'user'
    }

    const isAdmin = userRole === 'admin'

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {isAdmin || userRole === 'manager' ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalUsers || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Total registered users
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeUsers || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Users with active status
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">New Signups</CardTitle>
                                <UserPlus className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{newUsers || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    In the last 7 days
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{admins || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    System administrators
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <Overview />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Signups</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RecentUsers />
                            </CardContent>
                        </Card>
                    </div>
                </>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Access</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Standard User</div>
                            <p className="text-xs text-muted-foreground">
                                Restricted View
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
