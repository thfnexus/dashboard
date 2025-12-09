export interface SubscriptionPlan {
    id: string;
    name: string;
    filesPerMonth: number;
    maxTeamMembers: number;
    price: number;
    popular?: boolean;
    features: readonly string[];
}

export const SUBSCRIPTION_PLANS = {
    free: {
        id: 'free',
        name: 'Free',
        filesPerMonth: 50,
        maxTeamMembers: 3,
        price: 0,
        popular: false,
        features: [
            '50 file analyses per month',
            'Up to 3 team members',
            'Basic analytics',
            'Email support'
        ]
    },
    business: {
        id: 'business',
        name: 'Business',
        filesPerMonth: 500,
        maxTeamMembers: 6,
        price: 29,
        popular: true,
        features: [
            '500 file analyses per month',
            'Up to 6 team members',
            'Advanced analytics',
            'Priority email support',
            'API access'
        ]
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        filesPerMonth: 1000,
        maxTeamMembers: 15,
        price: 99,
        popular: false,
        features: [
            '1000 file analyses per month',
            'Up to 15 team members',
            'Advanced analytics',
            '24/7 priority support',
            'API access',
            'Custom integrations'
        ]
    }
} satisfies Record<string, SubscriptionPlan>;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export function getPlan(planId: PlanId): SubscriptionPlan {
    return SUBSCRIPTION_PLANS[planId] as SubscriptionPlan;
}

export function getAllPlans(): SubscriptionPlan[] {
    return Object.values(SUBSCRIPTION_PLANS) as SubscriptionPlan[];
}

