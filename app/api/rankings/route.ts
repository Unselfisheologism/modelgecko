import { z, ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

const rankingsQuerySchema = z.object({
    sortBy: z.enum(['popularity', 'performance', 'price', 'context', 'composite']).default('composite'),
    order: z.enum(['asc', 'desc']).default('desc'),
    limit: z.coerce.number().int().min(1).max(100).default(50),
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

function averageBenchmark(scores: Record<string, number> | null): number | null {
    if (!scores) return null
    const values = Object.values(scores).filter((value) => typeof value === 'number')
    if (!values.length) return null
    return values.reduce((acc, value) => acc + value, 0) / values.length
}

function averagePrice(pricing: Record<string, any> | null): number | null {
    if (!pricing) return null
    const input = typeof pricing.inputPrice === 'number' ? pricing.inputPrice : null
    const output = typeof pricing.outputPrice === 'number' ? pricing.outputPrice : null
    if (input === null && output === null) return null
    const values = [input, output].filter((value): value is number => value !== null)
    return values.reduce((acc, value) => acc + value, 0) / values.length
}

function normalize(values: Array<number | null>, invert = false) {
    const numericValues = values.filter((value): value is number => value !== null)
    if (!numericValues.length) {
        return values.map(() => 0)
    }

    const min = Math.min(...numericValues)
    const max = Math.max(...numericValues)
    const range = max - min

    return values.map((value) => {
        if (value === null) return 0
        if (range === 0) return 0.5
        const normalized = (value - min) / range
        return invert ? 1 - normalized : normalized
    })
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        let params
        try {
            params = rankingsQuerySchema.parse({
                sortBy: searchParams.get('sortBy') || 'composite',
                order: searchParams.get('order') || 'desc',
                limit: searchParams.get('limit') || '50',
            })
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        const cacheKey = `rankings:${params.sortBy}:${params.order}:${params.limit}`
        const cached = getCached(cacheKey)
        if (cached) {
            const response = successResponse(cached)
            response.headers.set('X-Cache', 'HIT')
            return response
        }

        const models = await prisma.model.findMany({
            select: {
                slug: true,
                name: true,
                provider: true,
                contextWindow: true,
                benchmarkScores: true,
                pricing: true,
                tags: true,
                marketMetrics: true,
            },
        })

        const metrics = models.map((model) => ({
            slug: model.slug,
            name: model.name,
            provider: model.provider,
            tags: model.tags,
            performance: averageBenchmark(model.benchmarkScores as Record<string, number> | null),
            price: averagePrice(model.pricing as Record<string, any> | null),
            context: model.contextWindow ?? null,
            popularity: model.marketMetrics?.popularity ?? null,
        }))

        const normalizedPerformance = normalize(metrics.map((metric) => metric.performance))
        const normalizedPrice = normalize(metrics.map((metric) => metric.price), true)
        const normalizedContext = normalize(metrics.map((metric) => metric.context))
        const normalizedPopularity = normalize(metrics.map((metric) => metric.popularity))

        const scored = metrics.map((metric, index) => {
            const composite =
                normalizedPopularity[index] * 0.35 +
                normalizedPerformance[index] * 0.35 +
                normalizedPrice[index] * 0.2 +
                normalizedContext[index] * 0.1

            return {
                ...metric,
                scores: {
                    popularity: normalizedPopularity[index],
                    performance: normalizedPerformance[index],
                    price: normalizedPrice[index],
                    context: normalizedContext[index],
                    composite,
                },
            }
        })

        const sorted = scored.sort((a, b) => {
            const aValue = a.scores[params.sortBy]
            const bValue = b.scores[params.sortBy]
            return params.order === 'asc' ? aValue - bValue : bValue - aValue
        })

        const ranked = sorted.slice(0, params.limit).map((item, index) => ({
            rank: index + 1,
            slug: item.slug,
            name: item.name,
            provider: item.provider,
            tags: item.tags,
            scores: item.scores,
        }))

        setCached(cacheKey, ranked)

        const response = successResponse(ranked, undefined, {
            'X-Cache': 'MISS',
        })
        response.headers.set('X-Ranking-Sort', params.sortBy)
        return response
    } catch (error) {
        console.error('Error fetching rankings:', error)
        return errorResponse('Failed to fetch rankings')
    }
}
