import { z, ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { errorResponse, notFoundResponse, successResponse, validationErrorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

const similarQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(10).default(5),
})

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

function jaccardSimilarity(a: string[], b: string[]) {
    const setA = new Set(a)
    const setB = new Set(b)
    const intersection = [...setA].filter((value) => setB.has(value)).length
    const union = new Set([...setA, ...setB]).size
    if (union === 0) return 0
    return intersection / union
}

function normalizeDifference(value: number | null, baseline: number | null, min: number, max: number) {
    if (value === null || baseline === null) return 0
    const range = max - min
    if (range === 0) return 0.5
    const diff = Math.abs(value - baseline)
    return 1 - Math.min(diff / range, 1)
}

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { searchParams } = new URL(request.url)

        let queryParams
        try {
            queryParams = similarQuerySchema.parse({
                limit: searchParams.get('limit') || '5',
            })
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        const model = await prisma.model.findUnique({
            where: { slug: params.slug },
        })

        if (!model) {
            return notFoundResponse('Model')
        }

        const candidates = await prisma.model.findMany({
            where: {
                slug: { not: model.slug },
                OR: [
                    { provider: model.provider },
                    { modalities: { hasSome: model.modalities } },
                ],
            },
        })

        if (!candidates.length) {
            return successResponse([])
        }

        const baseBenchmark = averageBenchmark(model.benchmarkScores as Record<string, number> | null)
        const basePrice = averagePrice(model.pricing as Record<string, any> | null)

        const benchmarkValues = [baseBenchmark, ...candidates.map((candidate) => averageBenchmark(candidate.benchmarkScores as Record<string, number> | null))]
            .filter((value): value is number => value !== null)
        const priceValues = [basePrice, ...candidates.map((candidate) => averagePrice(candidate.pricing as Record<string, any> | null))]
            .filter((value): value is number => value !== null)

        const benchmarkMin = benchmarkValues.length ? Math.min(...benchmarkValues) : 0
        const benchmarkMax = benchmarkValues.length ? Math.max(...benchmarkValues) : 0
        const priceMin = priceValues.length ? Math.min(...priceValues) : 0
        const priceMax = priceValues.length ? Math.max(...priceValues) : 0

        const scored = candidates.map((candidate) => {
            const candidateBenchmark = averageBenchmark(candidate.benchmarkScores as Record<string, number> | null)
            const candidatePrice = averagePrice(candidate.pricing as Record<string, any> | null)
            const providerScore = candidate.provider === model.provider ? 1 : 0
            const modalityScore = jaccardSimilarity(model.modalities, candidate.modalities)
            const benchmarkScore = normalizeDifference(candidateBenchmark, baseBenchmark, benchmarkMin, benchmarkMax)
            const priceScore = normalizeDifference(candidatePrice, basePrice, priceMin, priceMax)

            const similarityScore =
                providerScore * 0.2 +
                modalityScore * 0.3 +
                benchmarkScore * 0.3 +
                priceScore * 0.2

            return {
                slug: candidate.slug,
                name: candidate.name,
                provider: candidate.provider,
                modalities: candidate.modalities,
                contextWindow: candidate.contextWindow,
                benchmarkScores: candidate.benchmarkScores as Record<string, number> | null,
                pricing: candidate.pricing as Record<string, any> | null,
                tags: candidate.tags,
                similarityScore,
            }
        })

        const similar = scored
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, queryParams.limit)

        return successResponse(similar)
    } catch (error) {
        console.error('Error fetching similar models:', error)
        return errorResponse('Failed to fetch similar models')
    }
}
