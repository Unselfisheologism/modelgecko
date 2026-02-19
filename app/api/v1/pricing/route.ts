import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyApiKey } from '@/lib/unkey'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const apiKey = request.headers.get('x-api-key')
        const userId = request.headers.get('x-user-id')

        // Verify API key if provided
        if (apiKey && userId) {
            const verification = await verifyApiKey(apiKey)
            if (!verification.valid) {
                return NextResponse.json(
                    { error: 'Invalid API key' },
                    { status: 401 }
                )
            }
        }

        // Get active pricing plans from database
        const plans = await prisma.pricingPlan.findMany({
            where: { isActive: true },
            orderBy: { priceUsd: 'asc' },
        })

        return NextResponse.json({ data: plans })
    } catch (error) {
        console.error('Error fetching pricing:', error)
        return NextResponse.json(
            { error: 'Failed to fetch pricing' },
            { status: 500 }
        )
    }
}
