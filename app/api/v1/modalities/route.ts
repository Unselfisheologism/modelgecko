import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyApiKey } from '@/lib/unkey'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const apiKey = request.headers.get('x-api-key')
        const userId = request.headers.get('x-user-id')

        // Verify API key if provided
        if (apiKey && userId) {
            const verification = await verifyApiKey(apiKey)
            if (!verification.valid) {
                return NextResponse.json(
                    { error: 'Invalid API key' },
                    { status: 401 }
                )
            }
        }

        // Get all models with modalities
        const models = await prisma.model.findMany({
            select: { modalities: true },
        })

        // Get unique modalities and count models for each
        const modalityMap = new Map<string, number>()
        models.forEach(model => {
            model.modalities.forEach(modality => {
                modalityMap.set(modality, (modalityMap.get(modality) || 0) + 1)
            })
        })

        const modalities = Array.from(modalityMap.entries()).map(([name, count]) => ({
            name,
            modelCount: count,
        })).sort((a, b) => a.name.localeCompare(b.name))

        return NextResponse.json({ data: modalities })
    } catch (error) {
        console.error('Error fetching modalities:', error)
        return NextResponse.json(
            { error: 'Failed to fetch modalities' },
            { status: 500 }
        )
    }
}
