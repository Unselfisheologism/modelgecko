import { z } from 'zod'

export const modelCategories = ['coding', 'reasoning', 'image', 'audio', 'video', 'multimodal'] as const

export const modelSchema = z.object({
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
    name: z.string().min(1).max(200),
    provider: z.string().min(1).max(100),
    releaseDate: z.string().datetime().optional().nullable(),
    contextWindow: z.number().int().positive().optional().nullable(),
    modalities: z.array(z.string()).default([]),
    benchmarkScores: z.record(z.number()).optional().nullable(),
    pricing: z.object({
        inputPrice: z.number().nonnegative().optional(),
        outputPrice: z.number().nonnegative().optional(),
        unit: z.string().optional(),
    }).optional().nullable(),
    capabilities: z.array(z.string()).default([]),
    tags: z.array(z.enum(modelCategories)).default([]),
    links: z.object({
        website: z.string().url().optional(),
        paper: z.string().url().optional(),
        huggingface: z.string().url().optional(),
        github: z.string().url().optional(),
    }).optional().nullable(),
    changelog: z.array(z.object({
        date: z.string().datetime(),
        title: z.string().min(1),
        description: z.string().optional(),
    })).optional().nullable(),
})

export const updateModelSchema = modelSchema.partial().omit({ slug: true })

export const modelQuerySchema = z.object({
    provider: z.string().optional(),
    modality: z.string().optional(),
    category: z.enum(modelCategories).optional(),
    search: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(1000).default(50),
    offset: z.coerce.number().int().min(0).default(0),
    sortBy: z.enum(['name', 'provider', 'releaseDate', 'contextWindow', 'createdAt', 'updatedAt']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    minContextWindow: z.coerce.number().int().positive().optional(),
    maxContextWindow: z.coerce.number().int().positive().optional(),
    minPricing: z.coerce.number().nonnegative().optional(),
    maxPricing: z.coerce.number().nonnegative().optional(),
    releaseDateFrom: z.string().datetime().optional(),
    releaseDateTo: z.string().datetime().optional(),
})

export const leaderboardQuerySchema = z.object({
    sort: z.enum(['asc', 'desc']).default('desc'),
    provider: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    limit: z.coerce.number().int().min(1).max(1000).default(50),
    offset: z.coerce.number().int().min(0).default(0),
})

export const bulkExportSchema = z.object({
    format: z.enum(['json', 'csv']).default('json'),
    limit: z.coerce.number().int().min(1).max(10000).default(1000),
    offset: z.coerce.number().int().min(0).default(0),
})

export type ModelInput = z.infer<typeof modelSchema>
export type UpdateModelInput = z.infer<typeof updateModelSchema>
export type ModelQueryParams = z.infer<typeof modelQuerySchema>
export type LeaderboardQueryParams = z.infer<typeof leaderboardQuerySchema>
export type BulkExportParams = z.infer<typeof bulkExportSchema>
