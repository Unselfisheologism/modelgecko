import { z, ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

const analyticsQuerySchema = z.object({
    range: z.enum(['24h', '7d', '30d']).default('7d'),
    limit: z.coerce.number().int().min(1).max(50).default(10),
})

const analyticsBodySchema = z.object({
    query: z.string().min(1).max(200),
    results: z.number().int().min(0).optional().default(0),
})

const rangeToMs: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        let params
        try {
            params = analyticsQuerySchema.parse({
                range: searchParams.get('range') || '7d',
                limit: searchParams.get('limit') || '10',
            })
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        const now = Date.now()
        const currentStart = new Date(now - rangeToMs[params.range])
        const previousStart = new Date(now - rangeToMs[params.range] * 2)

        const [currentCounts, previousCounts] = await Promise.all([
            prisma.searchAnalytics.groupBy({
                by: ['query'],
                where: {
                    timestamp: {
                        gte: currentStart,
                    },
                },
                _count: {
                    _all: true,
                },
                _avg: {
                    results: true,
                },
                orderBy: {
                    _count: {
                        _all: 'desc',
                    },
                },
                take: params.limit,
            }),
            prisma.searchAnalytics.groupBy({
                by: ['query'],
                where: {
                    timestamp: {
                        gte: previousStart,
                        lt: currentStart,
                    },
                },
                _count: {
                    _all: true,
                },
            }),
        ])

        const previousMap = new Map(previousCounts.map((entry) => [entry.query, entry._count._all]))

        const popular = currentCounts.map((entry) => ({
            query: entry.query,
            searches: entry._count._all,
            avgResults: entry._avg.results ?? 0,
        }))

        const trending = currentCounts
            .map((entry) => {
                const previousCount = previousMap.get(entry.query) ?? 0
                const growthRate = (entry._count._all - previousCount) / Math.max(previousCount, 1)
                return {
                    query: entry.query,
                    searches: entry._count._all,
                    growthRate,
                }
            })
            .sort((a, b) => b.growthRate - a.growthRate)
            .slice(0, params.limit)

        return successResponse({
            popular,
            trending,
        })
    } catch (error) {
        console.error('Error fetching search analytics:', error)
        return errorResponse('Failed to fetch search analytics')
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        let validated
        try {
            validated = analyticsBodySchema.parse(body)
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        const entry = await prisma.searchAnalytics.create({
            data: {
                query: validated.query.trim().toLowerCase(),
                results: validated.results ?? 0,
            },
        })

        return successResponse({
            id: entry.id,
            query: entry.query,
            results: entry.results,
            timestamp: entry.timestamp,
        })
    } catch (error) {
        console.error('Error recording search analytics:', error)
        return errorResponse('Failed to record search analytics')
    }
}
