import { createClient } from "@/lib/supabase/server"
import { UsersTable } from "@/components/users/UsersTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { AddUserDialog } from "@/components/users/AddUserDialog"

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; role?: string; page?: string }>
}) {
    const params = await searchParams;
    const q = params?.q || ""
    const role = params?.role || "all"
    const page = Number(params?.page) || 1
    const pageSize = 10

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div>Unauthorized</div>
    }

    const { data: currentUserData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    if (currentUserData?.role !== 'admin' && currentUserData?.role !== 'manager') {
        // Redirect non-admins/non-managers to dashboard
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
                <Link href="/dashboard">
                    <Button variant="outline">Go to Dashboard</Button>
                </Link>
            </div>
        )
    }

    let query = supabase
        .from("users")
        .select("*", { count: "exact" })

    if (q) {
        query = query.ilike("email", `%${q}%`) // search by email (or name if I added or logic)
    }

    if (role !== "all") {
        query = query.eq("role", role)
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: users, count, error } = await query
        .range(from, to)
        .order("created_at", { ascending: false })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                <AddUserDialog />
            </div>

            <UsersTable
                users={users || []}
                total={count || 0}
                page={page}
                pageSize={pageSize}
            />
        </div>
    )
}
