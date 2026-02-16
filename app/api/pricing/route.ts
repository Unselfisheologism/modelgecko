import { NextResponse } from 'next/server'

// Static pricing data - in production this could come from DB
const pricingPlans = [
    {
        id: 'free',
        name: 'Free',
        description: 'Perfect for testing and exploration',
        credits: 1000,
        price: 0,
        priceId: null,
        features: [
            '1,000 API credits/month',
            'Basic model data access',
            'Community support',
        ],
    },
    {
        id: 'starter',
        name: 'Starter',
        description: 'For hobby projects and small apps',
        credits: 10000,
        price: 29,
        priceId: 'price_starter', // Replace with actual Dodo price ID
        features: [
            '10,000 API credits/month',
            'Full model data access',
            'Higher rate limits',
            'Email support',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'For production applications',
        credits: 100000,
        price: 99,
        priceId: 'price_pro', // Replace with actual Dodo price ID
        features: [
            '100,000 API credits/month',
            'Full model data access',
            'Highest rate limits',
            'Priority support',
            'Usage analytics',
        ],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Custom solutions for large scale',
        credits: 1000000,
        price: 499,
        priceId: 'price_enterprise', // Replace with actual Dodo price ID
        features: [
            '1,000,000 API credits/month',
            'Full model data access',
            'Dedicated rate limits',
            '24/7 support',
            'Custom integrations',
            'SLA guarantee',
        ],
    },
]

export async function GET() {
    return NextResponse.json({ data: pricingPlans })
}
