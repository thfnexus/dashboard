"use client"

import { SUBSCRIPTION_PLANS, type PlanId } from "@/lib/plans"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlanSelectorProps {
    selectedPlan: PlanId
    onPlanSelect: (plan: PlanId) => void
}

export function PlanSelector({ selectedPlan, onPlanSelect }: PlanSelectorProps) {
    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Choose Your Plan</h2>
                <p className="text-sm text-muted-foreground">Select the plan that best fits your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
                    const planId = key as PlanId
                    const isSelected = selectedPlan === planId
                    const isPopular = plan.popular

                    return (
                        <button
                            key={planId}
                            type="button"
                            onClick={() => onPlanSelect(planId)}
                            className={cn(
                                "relative p-6 rounded-lg border-2 text-left transition-all",
                                "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-card hover:border-primary/50"
                            )}
                        >
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                                        Recommended
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                                    <div className="mt-2">
                                        <span className="text-3xl font-bold">${plan.price}</span>
                                        {plan.price > 0 && <span className="text-muted-foreground text-sm">/month</span>}
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                )}
                            </div>

                            <ul className="space-y-2 mb-4">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
