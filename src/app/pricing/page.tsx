"use client"

import { getAllPlans } from "@/lib/plans"
import { Check } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
    const plans = getAllPlans()

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b">
                <div className="container mx-auto px-4 py-6">
                    <Link href="/" className="text-lg font-semibold">
                        THF DataSuite
                    </Link>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-muted-foreground">
                        Choose the plan that fits your needs
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative rounded-lg border-2 p-8 ${plan.popular
                                    ? "border-primary shadow-lg scale-105"
                                    : "border-border"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                                        Recommended
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold">${plan.price}</span>
                                    {plan.price > 0 && (
                                        <span className="text-muted-foreground">/month</span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/register"
                                className={`block w-full text-center py-3 px-4 rounded-md font-medium transition-colors ${plan.popular
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                    }`}
                            >
                                Get Started
                            </Link>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-20 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-10">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">What happens if I reach my file limit?</h3>
                            <p className="text-muted-foreground">
                                You'll be notified when you're approaching your limit. Once reached, you'll need to upgrade to a higher plan or wait until the next month for your limit to reset.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
                            <p className="text-muted-foreground">
                                Yes! You can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">What file formats are supported?</h3>
                            <p className="text-muted-foreground">
                                We currently support DOCX and TXT files up to 5MB in size. More formats coming soon!
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                            <p className="text-muted-foreground">
                                Our Free plan is available forever with no credit card required. It's perfect for trying out our service!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
