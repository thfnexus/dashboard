import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: teamId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permissions: Admin or Team Admin/Manager
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    const isSystemAdmin = userData?.role === 'admin'
    const isSystemManager = userData?.role === 'manager'

    if (!isSystemAdmin && !isSystemManager) {
        // Check team role
        const { data: membership } = await supabase
            .from("team_members")
            .select("team_role")
            .eq("team_id", teamId)
            .eq("user_id", user.id)
            .single()

        if (membership?.team_role !== 'admin' && membership?.team_role !== 'manager') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
    }

    const body = await request.json()
    const { userId, teamRole = 'member' } = body

    // Add member
    const { data, error } = await supabase
        .from("team_members")
        .insert([{
            team_id: teamId,
            user_id: userId,
            team_role: teamRole
        }])
        .select()

    if (error) {
        if (error.code === '23505') { // Unique constraint violation
            return NextResponse.json({ error: "User is already a member of this team" }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: teamId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userIdToRemove = searchParams.get('userId')

    if (!userIdToRemove) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Check permissions
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    const isSystemAdmin = userData?.role === 'admin'
    const isSystemManager = userData?.role === 'manager'

    if (!isSystemAdmin && !isSystemManager) {
        const { data: membership } = await supabase
            .from("team_members")
            .select("team_role")
            .eq("team_id", teamId)
            .eq("user_id", user.id)
            .single()

        if (membership?.team_role !== 'admin' && membership?.team_role !== 'manager') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
    }

    const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", userIdToRemove)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
