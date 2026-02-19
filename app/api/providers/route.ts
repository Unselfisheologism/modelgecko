import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

interface ProviderInfo {
    name: string
    modelCount: number
    modalities: string[]
    latestModelDate: Date | null
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const includeMetadata = searchParams.get('includeMetadata') === 'true'
        
        // Get all models grouped by provider
        const models = await prisma.model.findMany({
            select: {
                provider: true,
                modalities: true,
                releaseDate: true,
            },
        })

        // Aggregate provider data
        const providerMap = new Map<string, ProviderInfo>()

        for (const model of models) {
            const existing = providerMap.get(model.provider)
            
            if (existing) {
                existing.modelCount += 1
                // Merge modalities
                for (const modality of model.modalities) {
                    if (!existing.modalities.includes(modality)) {
                        existing.modalities.push(modality)
                    }
                }
                // Track latest model date
                if (model.releaseDate && (!existing.latestModelDate || model.releaseDate > existing.latestModelDate)) {
                    existing.latestModelDate = model.releaseDate
                }
            } else {
                providerMap.set(model.provider, {
                    name: model.provider,
                    modelCount: 1,
                    modalities: [...model.modalities],
                    latestModelDate: model.releaseDate,
                })
            }
        }

        // Convert to array and sort by name
        let providers = Array.from(providerMap.values()).sort((a, b) => 
            a.name.localeCompare(b.name)
        )

        // Format response based on includeMetadata flag
        if (includeMetadata) {
            providers = providers.map(p => ({
                ...p,
                modalities: p.modalities.sort(),
            }))
        } else {
            // Simple list of provider names
            return successResponse(providers.map(p => p.name))
        }

        return successResponse(providers, {
            total: providers.length,
        })
    } catch (error) {
        console.error('Error fetching providers:', error)
        return errorResponse('Failed to fetch providers')
    }
}
