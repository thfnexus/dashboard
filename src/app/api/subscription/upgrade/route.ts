
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getPlan, type PlanId } from "@/lib/plans"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await request.json()
        const { planId } = body

        if (!planId) {
            return new NextResponse("Plan ID is required", { status: 400 })
        }

        const plan = getPlan(planId as PlanId)
        if (!plan) {
            return new NextResponse("Invalid plan ID", { status: 400 })
        }

        // In a real app, we would verify payment here before updating the database.
        // For this mock, we assume payment was successful on the client side check (simulated).

        const { error } = await supabase
            .from('users')
            .update({ plan_id: plan.id })
            .eq('id', session.user.id)

        if (error) {
            console.error('Error updating plan:', error)
            return new NextResponse("Failed to update plan", { status: 500 })
        }

        return NextResponse.json({ success: true, plan: plan.id })

    } catch (error) {
        console.error('Upgrade error:', error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
