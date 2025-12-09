import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Verify Authorization (Admin or Manager)
    const { data: currentUserData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    const isAllowed = currentUserData?.role === 'admin' || currentUserData?.role === 'manager'

    if (roleError || !currentUserData || !isAllowed) {
        return NextResponse.json({ error: "Forbidden: Admin or Manager access required" }, { status: 403 })
    }

    // 3. Prevent Manager from changing roles (CRITICAL)
    if (body.role && currentUserData.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden: Only Admins can change user roles" }, { status: 403 })
    }

    // 4. Prevent Manager from changing plans (CRITICAL)
    if (body.plan_id && currentUserData.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden: Only Admins can change subscription plans" }, { status: 403 })
    }

    // Update public.users
    const { data, error } = await supabase
        .from("users")
        .update(body)
        .eq("id", id)
        .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Optionally update Auth email/password if provided (requires Admin)

    return NextResponse.json(data)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Verify Authorization (Admin Role)
    const { data: currentUserData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    if (roleError || !currentUserData || currentUserData.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceRoleKey) {
        // Need admin to delete from Auth
        const { createClient: createAdminClient } = require('@supabase/supabase-js')
        const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } else {
        // Fallback: Delete from public.users (Supabase client already created)
        const { error } = await supabase.from("users").delete().eq("id", id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true })
    }
}
