import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    // Get team with members
    const { data: team, error: teamError } = await supabase
        .from("teams")
        .select(`
            *,
            users:created_by (name),
            team_members (
                id,
                team_role,
                joined_at,
                users (
                    id,
                    name,
                    email
                )
            )
        `)
        .eq("id", id)
        .single()

    if (teamError) return NextResponse.json({ error: teamError.message }, { status: 500 })

    return NextResponse.json(team)
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or team admin
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    const isSystemAdmin = userData?.role === 'admin'

    if (!isSystemAdmin) {
        // Check if team admin
        const { data: membership } = await supabase
            .from("team_members")
            .select("team_role")
            .eq("team_id", id)
            .eq("user_id", user.id)
            .single()

        if (membership?.team_role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
    }

    const body = await request.json()

    const { data, error } = await supabase
        .from("teams")
        .update({
            name: body.name,
            description: body.description,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only system admin can delete teams
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    if (userData?.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
