import { z, ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

const compareQuerySchema = z.object({
    models: z.string().min(1),
})

type MetricValues = {
    performance: number | null
    price: number | null
    context: number | null
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
            params = compareQuerySchema.parse({
                models: searchParams.get('models') || '',
            })
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        const slugs = Array.from(
            new Set(
                params.models
                    .split(',')
                    .map((slug) => slug.trim())
                    .filter(Boolean)
            )
        )

        if (slugs.length < 2 || slugs.length > 5) {
            return errorResponse('Compare between 2 and 5 models', 400, 'INVALID_MODEL_COUNT')
        }

        const models = await prisma.model.findMany({
            where: {
                slug: { in: slugs },
            },
        })

        if (models.length !== slugs.length) {
            return errorResponse('One or more models not found', 404, 'NOT_FOUND')
        }

        const orderedModels = slugs
            .map((slug) => models.find((model) => model.slug === slug))
            .filter((model): model is typeof models[number] => Boolean(model))

        const metrics: MetricValues[] = orderedModels.map((model) => ({
            performance: averageBenchmark(model.benchmarkScores as Record<string, number> | null),
            price: averagePrice(model.pricing as Record<string, any> | null),
            context: model.contextWindow ?? null,
        }))

        const normalizedPerformance = normalize(metrics.map((metric) => metric.performance))
        const normalizedPrice = normalize(metrics.map((metric) => metric.price), true)
        const normalizedContext = normalize(metrics.map((metric) => metric.context))

        const comparison = orderedModels.map((model, index) => ({
            slug: model.slug,
            name: model.name,
            provider: model.provider,
            modalities: model.modalities,
            contextWindow: model.contextWindow,
            benchmarkScores: model.benchmarkScores as Record<string, number> | null,
            pricing: model.pricing as Record<string, any> | null,
            capabilities: model.capabilities,
            tags: model.tags,
            normalized: {
                performance: normalizedPerformance[index],
                price: normalizedPrice[index],
                context: normalizedContext[index],
            },
        }))

        return successResponse({
            models: comparison,
        })
    } catch (error) {
        console.error('Error comparing models:', error)
        return errorResponse('Failed to compare models')
    }
}
