import { NextResponse } from 'next/server'
import { createCustomerPortalSession } from '@/lib/dodo'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            )
        }

        const user = await prisma.apiUser.findUnique({
            where: { clerkUserId: userId },
        })

        if (!user?.dodoCustomerId) {
            return NextResponse.json(
                { error: 'No billing account found' },
                { status: 400 }
            )
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const session = await createCustomerPortalSession({
            customerId: user.dodoCustomerId,
            returnUrl: `${appUrl}/dashboard`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Error creating portal session:', error)
        return NextResponse.json(
            { error: 'Failed to create portal session' },
            { status: 500 }
        )
    }
}
