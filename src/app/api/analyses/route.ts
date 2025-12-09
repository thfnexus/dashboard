import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user role
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    const userRole = userData?.role || 'user'

    // Admin sees all analyses, others see only their own
    let query = supabase
        .from("document_analyses")
        .select("*")
        .order("created_at", { ascending: false })

    if (userRole !== 'admin') {
        query = query.eq("user_id", user.id)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
}
