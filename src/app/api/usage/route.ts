import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getCurrentUsage } from "@/lib/usageChecker"

export async function GET() {
    const supabase = await createClient()

    // Verify Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const usage = await getCurrentUsage(user.id)
        return NextResponse.json(usage)
    } catch (error: any) {
        console.error('Usage fetch error:', error)
        return NextResponse.json({
            error: error.message || "Failed to fetch usage"
        }, { status: 500 })
    }
}
