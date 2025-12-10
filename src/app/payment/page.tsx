"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getPlan, type PlanId } from "@/lib/plans"
import { Loader2, CreditCard, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

function PaymentContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const planId = searchParams.get("plan") as PlanId
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Mock form state
    const [cardName, setCardName] = useState("")
    const [cardNumber, setCardNumber] = useState("")
    const [expiry, setExpiry] = useState("")
    const [cvc, setCvc] = useState("")

    const plan = planId ? getPlan(planId) : null

    useEffect(() => {
        if (!plan) {
            router.push("/pricing")
        }
    }, [plan, router])

    if (!plan) return null

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        try {
            // Check auth
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // Should not happen if flow is correct, but safe guard
                router.push(`/register?plan=${planId}`)
                return
            }

            // Call API to update plan
            const response = await fetch("/api/subscription/upgrade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ planId }),
            })

            if (!response.ok) {
                throw new Error("Failed to process upgrade")
            }

            setSuccess(true)
            // Redirect after showing success for a brief moment
            setTimeout(() => {
                router.push("/dashboard")
                router.refresh()
            }, 2000)

        } catch (err: any) {
            setError(err.message || "Payment failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full text-center border">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
                    <p className="text-muted-foreground mb-6">
                        You have successfully upgraded to the {plan.name} plan.
                    </p>
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Redirecting to dashboard...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/20 py-12 px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Order Summary */}
                <div className="space-y-6">
                    <div>
                        <Link href="/pricing" className="text-sm text-muted-foreground hover:underline mb-4 block">
                            ← Back to Pricing
                        </Link>
                        <h1 className="text-2xl font-bold">Complete your purchase</h1>
                    </div>

                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

                        <div className="flex justify-between items-center py-4 border-b">
                            <div>
                                <div className="font-medium">{plan.name} Plan</div>
                                <div className="text-sm text-muted-foreground">Monthly subscription</div>
                            </div>
                            <div className="font-bold">${plan.price}/mo</div>
                        </div>

                        <div className="flex justify-between items-center py-4 text-lg font-bold">
                            <div>Total today</div>
                            <div>${plan.price}</div>
                        </div>

                        <div className="mt-6 bg-muted p-4 rounded text-sm text-muted-foreground">
                            <p>This is a mock payment page. No real money will be charged.</p>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="bg-card p-6 rounded-lg border shadow-sm h-fit">
                    <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Details
                    </h2>

                    <form onSubmit={handlePayment} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cardholder Name</label>
                            <input
                                required
                                type="text"
                                placeholder="John Doe"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={cardName}
                                onChange={e => setCardName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Card Number</label>
                            <input
                                required
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={cardNumber}
                                onChange={e => setCardNumber(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Expiry</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="MM/YY"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={expiry}
                                    onChange={e => setExpiry(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CVC</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="123"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={cvc}
                                    onChange={e => setCvc(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-6"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                "Pay Now"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentContent />
        </Suspense>
    )
}
