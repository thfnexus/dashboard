import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = await createClient()

    // Get current user role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    const userRole = userData?.role || 'user'

    // User: only teams they're a member of
    // Manager/Admin: all teams
    if (userRole === 'user') {
        const { data, error } = await supabase
            .from("team_members")
            .select(`
                team_id,
                teams (
                    id,
                    name,
                    description,
                    created_by,
                    created_at,
                    users:created_by (name)
                )
            `)
            .eq("user_id", user.id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        // Extract teams from the nested structure
        const teams = data?.map((item: any) => ({
    ...item.teams,
    created_by_name: item?.teams?.users?.[0]?.name || null
})) || [];


        return NextResponse.json(teams)
    }

    // Admin/Manager: all teams
    const { data, error } = await supabase
        .from("teams")
        .select(`
            *,
            users:created_by (name)
        `)
        .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const teams = data?.map(team => ({
        ...team,
        created_by_name: team.users?.name
    })) || []

    return NextResponse.json(teams)
}

export async function POST(request: Request) {
    const supabase = await createClient()

    // Verify Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify Admin or Manager
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    if (userData?.role !== 'admin' && userData?.role !== 'manager') {
        return NextResponse.json({ error: "Forbidden: Admin or Manager access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
        return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    // Create team
    const { data: team, error } = await supabase
        .from("teams")
        .insert([{
            name,
            description,
            created_by: user.id
        }])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add creator as team admin
    await supabase
        .from("team_members")
        .insert([{
            team_id: team.id,
            user_id: user.id,
            team_role: 'admin'
        }])

    return NextResponse.json(team)
}
