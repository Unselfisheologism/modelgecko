import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { leaderboardQuerySchema } from '@/lib/validation'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: { benchmark: string } }
) {
    try {
        const benchmark = params.benchmark.toLowerCase()
        const { searchParams } = new URL(request.url)
        
        // Parse and validate query params
        let queryParams
        try {
            queryParams = leaderboardQuerySchema.parse({
                sort: searchParams.get('sort') || 'desc',
                provider: searchParams.get('provider') || undefined,
                dateFrom: searchParams.get('dateFrom') || undefined,
                dateTo: searchParams.get('dateTo') || undefined,
                limit: searchParams.get('limit') || '50',
                offset: searchParams.get('offset') || '0',
            })
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        const where: Prisma.ModelWhereInput = {
            benchmarkScores: {
                not: Prisma.JsonNull,
            },
        }

        // Provider filter
        if (queryParams.provider) {
            where.provider = queryParams.provider
        }

        // Date range filter
        if (queryParams.dateFrom || queryParams.dateTo) {
            where.lastUpdated = {}
            if (queryParams.dateFrom) {
                where.lastUpdated.gte = new Date(queryParams.dateFrom)
            }
            if (queryParams.dateTo) {
                where.lastUpdated.lte = new Date(queryParams.dateTo)
            }
        }

        // Get all models matching criteria
        const models = await prisma.model.findMany({
            where,
            orderBy: {
                name: 'asc',
            },
        })

        // Sort by the specified benchmark score
        const scoredModels = models
            .map((model) => {
                const scores = model.benchmarkScores as Record<string, number> | null
                const score = scores?.[benchmark]
                return {
                    ...model,
                    score: score || 0,
                }
            })
            .filter((model) => model.score > 0)

        // Apply sorting
        const sortedModels = scoredModels.sort((a, b) => {
            if (queryParams.sort === 'asc') {
                return a.score - b.score
            }
            return b.score - a.score
        })

        // Apply pagination
        const total = sortedModels.length
        const paginatedModels = sortedModels.slice(
            queryParams.offset,
            queryParams.offset + queryParams.limit
        )

        // Build response with ranks
        const startRank = queryParams.sort === 'asc' 
            ? total - queryParams.offset 
            : queryParams.offset + 1

        const rankedModels = paginatedModels.map((model, index) => ({
            rank: queryParams.sort === 'asc' 
                ? startRank - index 
                : startRank + index,
            slug: model.slug,
            name: model.name,
            provider: model.provider,
            score: model.score,
            lastUpdated: model.lastUpdated,
        }))

        return successResponse(rankedModels, {
            total,
            limit: queryParams.limit,
            offset: queryParams.offset,
            page: Math.floor(queryParams.offset / queryParams.limit) + 1,
            pages: Math.ceil(total / queryParams.limit),
        }, {
            'X-Benchmark': benchmark,
        })
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return errorResponse('Failed to fetch leaderboard')
    }
}
