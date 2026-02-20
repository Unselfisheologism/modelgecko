import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

interface ModelInput {
    slug: string
    name: string
    provider: string
    releaseDate?: string
    contextWindow?: number
    modalities?: string[]
    benchmarkScores?: Record<string, number>
    pricing?: {
        inputPrice?: number
        outputPrice?: number
        input?: number
        output?: number
    }
    capabilities?: string[]
    tags?: string[]
    links?: Record<string, string>
    changelog?: Record<string, any>
}

export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const admin = await verifyAdmin()
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { models } = body as { models: ModelInput[] }

        if (!models || !Array.isArray(models)) {
            return NextResponse.json(
                { error: 'Invalid request: models array required' },
                { status: 400 }
            )
        }

        let updated = 0
        let created = 0
        const errors: { slug: string; error: string }[] = []

        for (const model of models) {
            try {
                if (!model.slug || !model.name || !model.provider) {
                    errors.push({
                        slug: model.slug || 'unknown',
                        error: 'Missing required fields: slug, name, provider',
                    })
                    continue
                }

                const existing = await prisma.model.findUnique({
                    where: { slug: model.slug },
                })

                const data = {
                    name: model.name,
                    provider: model.provider,
                    releaseDate: model.releaseDate ? new Date(model.releaseDate) : undefined,
                    contextWindow: model.contextWindow,
                    modalities: model.modalities || ['text'],
                    benchmarkScores: model.benchmarkScores || {},
                    pricing: model.pricing || {},
                    capabilities: model.capabilities || [],
                    tags: model.tags || [],
                    links: model.links || {},
                    changelog: model.changelog || {},
                    lastUpdated: new Date(),
                }

                if (existing) {
                    await prisma.model.update({
                        where: { slug: model.slug },
                        data,
                    })
                    updated++
                } else {
                    await prisma.model.create({
                        data: {
                            slug: model.slug,
                            ...data,
                        },
                    })
                    created++
                }

                // Record price history if pricing is provided
                if (model.pricing?.inputPrice || model.pricing?.outputPrice) {
                    await prisma.priceHistory.create({
                        data: {
                            modelId: model.slug,
                            inputPrice: model.pricing.inputPrice || model.pricing.input || 0,
                            outputPrice: model.pricing.outputPrice || model.pricing.output || 0,
                        },
                    })
                }
            } catch (error) {
                errors.push({
                    slug: model.slug,
                    error: error instanceof Error ? error.message : 'Unknown error',
                })
            }
        }

        return NextResponse.json({
            success: true,
            updated,
            created,
            errors,
        })
    } catch (error) {
        console.error('Bulk update error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
