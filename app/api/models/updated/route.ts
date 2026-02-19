import { z, ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

const updatedQuerySchema = z.object({
    range: z.enum(['24h', '7d', '30d', '90d']).default('30d'),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

const rangeToMs: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        let params
        try {
            params = updatedQuerySchema.parse({
                range: searchParams.get('range') || '30d',
                limit: searchParams.get('limit') || '20',
            })
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        const since = new Date(Date.now() - rangeToMs[params.range])

        const models = await prisma.model.findMany({
            where: {
                lastUpdated: {
                    gte: since,
                },
            },
            orderBy: {
                lastUpdated: 'desc',
            },
            take: params.limit,
        })

        const response = models.map((model) => ({
            slug: model.slug,
            name: model.name,
            provider: model.provider,
            lastUpdated: model.lastUpdated,
            changelog: model.changelog as Record<string, any>[] | null,
            tags: model.tags,
            benchmarkScores: model.benchmarkScores as Record<string, number> | null,
            pricing: model.pricing as Record<string, any> | null,
        }))

        return successResponse(response)
    } catch (error) {
        console.error('Error fetching updated models:', error)
        return errorResponse('Failed to fetch updated models')
    }
}
