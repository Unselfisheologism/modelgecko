import { z, ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

const trendingQuerySchema = z.object({
    range: z.enum(['24h', '7d', '30d']).default('7d'),
    limit: z.coerce.number().int().min(1).max(50).default(10),
})

const cache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 2 * 60 * 1000

function getCached(key: string) {
    const cached = cache.get(key)
    if (cached && cached.expires > Date.now()) {
        return cached.data
    }
    cache.delete(key)
    return null
}

function setCached(key: string, data: any) {
    cache.set(key, { data, expires: Date.now() + CACHE_TTL })
}

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
            params = trendingQuerySchema.parse({
                range: searchParams.get('range') || '7d',
                limit: searchParams.get('limit') || '10',
            })
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        const cacheKey = `trending:${params.range}:${params.limit}`
        const cached = getCached(cacheKey)
        if (cached) {
            const response = successResponse(cached)
            response.headers.set('X-Cache', 'HIT')
            return response
        }

        const since = new Date(Date.now() - rangeToMs[params.range])

        const metrics = await prisma.marketMetrics.findMany({
            where: {
                lastUpdated: {
                    gte: since,
                },
            },
            include: {
                model: true,
            },
            orderBy: [
                { growthRate: 'desc' },
                { popularity: 'desc' },
            ],
            take: params.limit,
        })

        const trendingModels = metrics.map((metric) => ({
            slug: metric.model.slug,
            name: metric.model.name,
            provider: metric.model.provider,
            modalities: metric.model.modalities,
            contextWindow: metric.model.contextWindow,
            benchmarkScores: metric.model.benchmarkScores as Record<string, number> | null,
            pricing: metric.model.pricing as Record<string, any> | null,
            tags: metric.model.tags,
            trendScore: metric.growthRate,
            popularity: metric.popularity,
            totalViews: metric.totalViews,
            totalApiCalls: metric.totalApiCalls,
            lastUpdated: metric.lastUpdated,
        }))

        setCached(cacheKey, trendingModels)

        const response = successResponse(trendingModels, undefined, {
            'X-Cache': 'MISS',
        })
        response.headers.set('X-Range', params.range)
        return response
    } catch (error) {
        console.error('Error fetching trending models:', error)
        return errorResponse('Failed to fetch trending models')
    }
}
