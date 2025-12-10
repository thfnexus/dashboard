"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { PlanSelector } from "@/components/plans/PlanSelector"
import { type PlanId, SUBSCRIPTION_PLANS, getPlan } from "@/lib/plans"

export default function RegisterPage() {
    const [step, setStep] = useState<1 | 2>(1)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [selectedPlan, setSelectedPlan] = useState<PlanId>('free')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    useEffect(() => {
        const planParam = searchParams.get('plan')
        if (planParam && Object.keys(SUBSCRIPTION_PLANS).includes(planParam)) {
            setSelectedPlan(planParam as PlanId)
        }
    }, [searchParams])

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!email || !password || !name) {
            setError("Please fill in all fields")
            return
        }
        setStep(2)
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Check plan pricing
            const planDetails = getPlan(selectedPlan)
            const isPaidPlan = planDetails.price > 0

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        // Initially set as free if paid plan, so they aren't upgraded until payment
                        plan: isPaidPlan ? 'free' : selectedPlan
                    }
                }
            })

            if (error) {
                throw error
            }

            // If auto-confirm is on, we can redirect to dashboard, or ask to check email
            if (data.user && !data.session) {
                setError("Please check your email to confirm your account.")
            } else {
                if (isPaidPlan) {
                    router.push(`/payment?plan=${selectedPlan}`)
                } else {
                    router.push("/dashboard")
                }
                router.refresh()
            }

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 py-8">
            <div className="w-full max-w-4xl p-8 bg-card rounded-lg shadow-sm border">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">Create Your Account</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        {step === 1 ? 'Enter your details to get started' : 'Choose the plan that fits your needs'}
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                            1
                        </div>
                        <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                            2
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-muted text-primary text-sm rounded-md border">
                        {error}
                    </div>
                )}

                {/* Step 1: User Info */}
                {step === 1 && (
                    <form onSubmit={handleNext} className="space-y-4 max-w-md mx-auto">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            Next
                        </button>
                    </form>
                )}

                {/* Step 2: Plan Selection */}
                {step === 2 && (
                    <form onSubmit={handleRegister} className="space-y-6">
                        <PlanSelector
                            selectedPlan={selectedPlan}
                            onPlanSelect={setSelectedPlan}
                        />

                        <div className="flex gap-3 justify-center">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Create Account
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 text-center text-sm">
                    <Link href="/login" className="text-primary hover:underline">
                        Already have an account? Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
