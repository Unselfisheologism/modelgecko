import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyApiKey, getApiKeyUsage } from '@/lib/unkey'

export const dynamic = 'force-dynamic'

// Protected route - requires API key (handled by middleware)
export async function GET(request: Request) {
    try {
        const apiKey = request.headers.get('x-api-key')
        const userId = request.headers.get('x-user-id')
        const keyId = request.headers.get('x-key-id')

        if (!apiKey || !userId || !keyId) {
            return NextResponse.json(
                { error: 'Unauthorized - Missing credentials' },
                { status: 401 }
            )
        }

        // Verify API key is valid
        const verification = await verifyApiKey(apiKey)
        if (!verification.valid) {
            return NextResponse.json(
                { error: 'Invalid or expired API key' },
                { status: 401 }
            )
        }

        // Get user's credit balance
        const user = await prisma.apiUser.findUnique({
            where: { clerkUserId: userId },
        })

        const credits = user?.credits || 0

        // Check if user has credits
        if (credits <= 0) {
            return NextResponse.json(
                { error: 'Insufficient credits. Please upgrade your plan.' },
                { status: 403 }
            )
        }

        // Log the API usage
        await prisma.usageLog.create({
            data: {
                apiUserId: userId,
                endpoint: '/api/v1/models',
                method: 'GET',
                statusCode: 200,
                creditsUsed: 1,
            },
        })

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const provider = searchParams.get('provider')
        const modality = searchParams.get('modality')
        const search = searchParams.get('search')
        const sort = searchParams.get('sort') || 'name'
        const order = searchParams.get('order') || 'asc'
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')

        const where: any = {}

        if (provider) {
            where.provider = provider
        }

        if (modality) {
            where.modalities = {
                has: modality,
            }
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { provider: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Build orderBy based on sort parameter
        const orderBy: any = {}
        if (sort === 'name' || sort === 'provider' || sort === 'releaseDate') {
            orderBy[sort] = order
        } else {
            orderBy.name = 'asc' // Default sort
        }

        const [models, total] = await Promise.all([
            prisma.model.findMany({
                where,
                orderBy,
                take: limit,
                skip: offset,
            }),
            prisma.model.count({ where }),
        ])

        // Deduct credits
        if (user) {
            await prisma.apiUser.update({
                where: { clerkUserId: userId },
                data: {
                    credits: {
                        decrement: 1, // Deduct 1 credit per request
                    },
                },
            })
        }

        return NextResponse.json({
            data: models,
            meta: {
                total,
                limit,
                offset,
                creditsRemaining: credits - 1,
            },
        })
    } catch (error) {
        console.error('Error fetching models:', error)
        return NextResponse.json(
            { error: 'Failed to fetch models' },
            { status: 500 }
        )
    }
}
