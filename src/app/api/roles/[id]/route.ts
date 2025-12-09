
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Verify Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Verify Admin
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    if (userData?.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // 3. Update Role
    const body = await request.json()
    const { data, error } = await supabase
        .from("roles")
        .update(body)
        .eq("id", id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Verify Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Verify Admin
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    if (userData?.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // 3. Delete Role
    const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
