import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { bulkExportSchema } from '@/lib/validation'
import { 
    successResponse, 
    errorResponse, 
    validationErrorResponse 
} from '@/lib/api-response'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

// Convert models to CSV format
function modelsToCSV(models: any[]): string {
    if (models.length === 0) return ''
    
    const headers = [
        'id', 'slug', 'name', 'provider', 'releaseDate', 'contextWindow',
        'modalities', 'capabilities', 'benchmarkScores', 'pricing', 'links',
        'createdAt', 'updatedAt'
    ]
    
    const rows = models.map(model => [
        model.id,
        model.slug,
        `"${model.name.replace(/"/g, '""')}"`,
        model.provider,
        model.releaseDate?.toISOString() || '',
        model.contextWindow || '',
        `"${model.modalities.join(', ')}"`,
        `"${model.capabilities.join(', ')}"`,
        `"${JSON.stringify(model.benchmarkScores || {}).replace(/"/g, '""')}"`,
        `"${JSON.stringify(model.pricing || {}).replace(/"/g, '""')}"`,
        `"${JSON.stringify(model.links || {}).replace(/"/g, '""')}"`,
        model.createdAt.toISOString(),
        model.updatedAt.toISOString()
    ])
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        
        // Validate query params
        let params
        try {
            params = bulkExportSchema.parse({
                format: searchParams.get('format') || 'json',
                limit: searchParams.get('limit') || '1000',
                offset: searchParams.get('offset') || '0',
            })
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        // Fetch models with pagination
        const [models, total] = await Promise.all([
            prisma.model.findMany({
                orderBy: { name: 'asc' },
                take: params.limit,
                skip: params.offset,
            }),
            prisma.model.count(),
        ])

        // Transform data
        const transformedModels = models.map(model => ({
            ...model,
            benchmarkScores: model.benchmarkScores as Record<string, number> | null,
            pricing: model.pricing as Record<string, any> | null,
            links: model.links as Record<string, string> | null,
        }))

        if (params.format === 'csv') {
            const csv = modelsToCSV(models)
            return new NextResponse(csv, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="models.csv"',
                    'X-Total-Count': String(total),
                },
            })
        }

        // JSON format (default)
        return successResponse(transformedModels, {
            total,
            limit: params.limit,
            offset: params.offset,
            page: Math.floor(params.offset / params.limit) + 1,
            pages: Math.ceil(total / params.limit),
        }, {
            'X-Total-Count': String(total),
            'Content-Type': 'application/json',
        })
    } catch (error) {
        console.error('Error exporting models:', error)
        return errorResponse('Failed to export models')
    }
}
