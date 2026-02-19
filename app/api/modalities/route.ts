import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

interface ModalityInfo {
    name: string
    modelCount: number
    providers: string[]
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const includeMetadata = searchParams.get('includeMetadata') === 'true'
        
        // Get all models with their modalities
        const models = await prisma.model.findMany({
            select: {
                modalities: true,
                provider: true,
            },
        })

        // Aggregate modality data
        const modalityMap = new Map<string, ModalityInfo>()

        for (const model of models) {
            for (const modality of model.modalities) {
                const existing = modalityMap.get(modality)
                
                if (existing) {
                    existing.modelCount += 1
                    // Track unique providers
                    if (!existing.providers.includes(model.provider)) {
                        existing.providers.push(model.provider)
                    }
                } else {
                    modalityMap.set(modality, {
                        name: modality,
                        modelCount: 1,
                        providers: [model.provider],
                    })
                }
            }
        }

        // Convert to array and sort by name
        let modalities = Array.from(modalityMap.values()).sort((a, b) => 
            a.name.localeCompare(b.name)
        )

        // Format response based on includeMetadata flag
        if (includeMetadata) {
            modalities = modalities.map(m => ({
                ...m,
                providers: m.providers.sort(),
            }))
        } else {
            // Simple list of modality names
            return successResponse(modalities.map(m => m.name))
        }

        return successResponse(modalities, {
            total: modalities.length,
        })
    } catch (error) {
        console.error('Error fetching modalities:', error)
        return errorResponse('Failed to fetch modalities')
    }
}
