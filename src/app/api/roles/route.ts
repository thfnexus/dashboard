
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
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

    // 3. Insert Role
    const body = await request.json()
    const { name, description } = body

    if (!name) {
        return NextResponse.json({ error: "Role name is required" }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("roles")
        .insert([{ name, description }])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
