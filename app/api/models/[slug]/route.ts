import { prisma } from '@/lib/db'
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

// Simple in-memory cache (consider using Redis in production)
const cache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

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

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params
        const cacheKey = `model:${slug}`
        
        // Check cache
        const cached = getCached(cacheKey)
        if (cached) {
            const response = successResponse(cached)
            response.headers.set('X-Cache', 'HIT')
            return response
        }
        
        const model = await prisma.model.findUnique({
            where: { slug },
        })

        if (!model) {
            return notFoundResponse('Model')
        }

        // Transform response to include parsed JSON fields
        const responseData = {
            ...model,
            benchmarkScores: model.benchmarkScores as Record<string, number> | null,
            pricing: model.pricing as Record<string, any> | null,
            links: model.links as Record<string, string> | null,
            changelog: model.changelog as Record<string, any>[] | null,
        }

        // Cache the result
        setCached(cacheKey, responseData)

        const response = successResponse(responseData)
        response.headers.set('X-Cache', 'MISS')
        return response
    } catch (error) {
        console.error('Error fetching model:', error)
        return errorResponse('Failed to fetch model')
    }
}
