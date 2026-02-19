import { NextResponse } from 'next/server'
import { createCheckoutSession, createCustomer } from '@/lib/dodo'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { priceId, userId, email, planName } = body

        if (!priceId || !userId || !email) {
            return NextResponse.json(
                { error: 'Missing required fields: priceId, userId, email' },
                { status: 400 }
            )
        }

        // Get user from database
        const user = await prisma.apiUser.findUnique({
            where: { clerkUserId: userId },
        })

        let customerId = user?.dodoCustomerId

        // Create customer in Dodo if not exists
        if (!customerId) {
            const customer = await createCustomer({ email })
            customerId = customer.id

            // Update user with customer ID
            await prisma.apiUser.update({
                where: { clerkUserId: userId },
                data: { dodoCustomerId: customerId },
            })
        }

        // Create checkout session
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const session = await createCheckoutSession({
            priceId,
            customerId,
            successUrl: `${appUrl}/dashboard?checkout=success`,
            cancelUrl: `${appUrl}/dashboard?checkout=cancelled`,
            metadata: {
                userId,
                planName,
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
