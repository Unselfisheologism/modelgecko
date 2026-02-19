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

        // Get distinct providers with model counts
        const models = await prisma.model.findMany({
            select: { provider: true, name: true },
        })

        // Group by provider and count models
        const providerMap = new Map<string, number>()
        models.forEach(model => {
            providerMap.set(model.provider, (providerMap.get(model.provider) || 0) + 1)
        })

        const providers = Array.from(providerMap.entries()).map(([name, count]) => ({
            name,
            modelCount: count,
        })).sort((a, b) => a.name.localeCompare(b.name))

        return NextResponse.json({ data: providers })
    } catch (error) {
        console.error('Error fetching providers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch providers' },
            { status: 500 }
        )
    }
}
