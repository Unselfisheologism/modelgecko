import { prisma } from '@/lib/db'
import { modelQuerySchema } from '@/lib/validation'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        
        // Parse and validate query params
        let params
        try {
            params = modelQuerySchema.parse({
                provider: searchParams.get('provider') || undefined,
                modality: searchParams.get('modality') || undefined,
                category: searchParams.get('category') || undefined,
                search: searchParams.get('search') || undefined,
                limit: searchParams.get('limit') || '50',
                offset: searchParams.get('offset') || '0',
                sortBy: searchParams.get('sortBy') || 'name',
                sortOrder: searchParams.get('sortOrder') || 'asc',
                minContextWindow: searchParams.get('minContextWindow') || undefined,
                maxContextWindow: searchParams.get('maxContextWindow') || undefined,
                minPricing: searchParams.get('minPricing') || undefined,
                maxPricing: searchParams.get('maxPricing') || undefined,
                releaseDateFrom: searchParams.get('releaseDateFrom') || undefined,
                releaseDateTo: searchParams.get('releaseDateTo') || undefined,
            })
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        const where: Prisma.ModelWhereInput = {}

        // Provider filter
        if (params.provider) {
            where.provider = params.provider
        }

        // Modality filter
        if (params.modality) {
            where.modalities = {
                has: params.modality,
            }
        }

        // Category/tag filter
        if (params.category) {
            where.tags = {
                has: params.category,
            }
        }

        // Search filter (name or provider)
        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { provider: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        // Context window range filter
        if (params.minContextWindow !== undefined || params.maxContextWindow !== undefined) {
            where.contextWindow = {}
            if (params.minContextWindow !== undefined) {
                where.contextWindow.gte = params.minContextWindow
            }
            if (params.maxContextWindow !== undefined) {
                where.contextWindow.lte = params.maxContextWindow
            }
        }

        // Release date range filter
        if (params.releaseDateFrom || params.releaseDateTo) {
            where.releaseDate = {}
            if (params.releaseDateFrom) {
                where.releaseDate.gte = new Date(params.releaseDateFrom)
            }
            if (params.releaseDateTo) {
                where.releaseDate.lte = new Date(params.releaseDateTo)
            }
        }

        // Pricing range filter
        if (params.minPricing !== undefined || params.maxPricing !== undefined) {
            const priceFilters: Prisma.ModelWhereInput[] = []

            if (params.minPricing !== undefined) {
                priceFilters.push({
                    OR: [
                        {
                            pricing: {
                                path: ['inputPrice'],
                                gte: params.minPricing,
                            },
                        },
                        {
                            pricing: {
                                path: ['outputPrice'],
                                gte: params.minPricing,
                            },
                        },
                    ],
                })
            }

            if (params.maxPricing !== undefined) {
                priceFilters.push({
                    OR: [
                        {
                            pricing: {
                                path: ['inputPrice'],
                                lte: params.maxPricing,
                            },
                        },
                        {
                            pricing: {
                                path: ['outputPrice'],
                                lte: params.maxPricing,
                            },
                        },
                    ],
                })
            }

            if (priceFilters.length) {
                where.AND = [...(where.AND ?? []), ...priceFilters]
            }
        }

        // Build orderBy based on sortBy and sortOrder
        const orderBy: Prisma.ModelOrderByWithRelationInput = {}
        if (params.sortBy === 'contextWindow') {
            orderBy.contextWindow = params.sortOrder
        } else if (params.sortBy === 'releaseDate') {
            orderBy.releaseDate = params.sortOrder
        } else if (params.sortBy === 'createdAt') {
            orderBy.createdAt = params.sortOrder
        } else if (params.sortBy === 'updatedAt') {
            orderBy.updatedAt = params.sortOrder
        } else if (params.sortBy === 'provider') {
            orderBy.provider = params.sortOrder
        } else {
            orderBy.name = params.sortOrder
        }

        const [models, total] = await Promise.all([
            prisma.model.findMany({
                where,
                orderBy,
                take: params.limit,
                skip: params.offset,
            }),
            prisma.model.count({ where }),
        ])

        if (params.search && params.search.trim().length > 1) {
            try {
                await prisma.searchAnalytics.create({
                    data: {
                        query: params.search.trim().toLowerCase(),
                        results: total,
                    },
                })
            } catch (analyticsError) {
                console.error('Failed to record search analytics:', analyticsError)
            }
        }

        // Transform response
        const transformedModels = models.map(model => ({
            ...model,
            benchmarkScores: model.benchmarkScores as Record<string, number> | null,
            pricing: model.pricing as Record<string, any> | null,
            links: model.links as Record<string, string> | null,
        }))

        return successResponse(transformedModels, {
            total,
            limit: params.limit,
            offset: params.offset,
            page: Math.floor(params.offset / params.limit) + 1,
            pages: Math.ceil(total / params.limit),
        })
    } catch (error) {
        console.error('Error fetching models:', error)
        return errorResponse('Failed to fetch models')
    }
}
