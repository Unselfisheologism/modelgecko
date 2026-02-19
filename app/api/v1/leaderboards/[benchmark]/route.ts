import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyApiKey } from '@/lib/unkey'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: { benchmark: string } }
) {
    try {
        const apiKey = request.headers.get('x-api-key')
        const userId = request.headers.get('x-user-id')

        const benchmark = params.benchmark.toLowerCase()
        const limit = parseInt(new URL(request.url).searchParams.get('limit') || '50')

        // Verify API key if provided
        if (apiKey && userId) {
            const verification = await verifyApiKey(apiKey)
            if (!verification.valid) {
                return NextResponse.json(
                    { error: 'Invalid API key' },
                    { status: 401 }
                )
            }

            // Log usage
            await prisma.usageLog.create({
                data: {
                    apiUserId: userId,
                    endpoint: `/api/v1/leaderboards/${benchmark}`,
                    method: 'GET',
                    statusCode: 200,
                    creditsUsed: 1,
                },
            })
        }

        // Get all models with benchmark scores
        const models = await prisma.model.findMany({
            where: {
                benchmarkScores: { not: null },
            },
            orderBy: { name: 'asc' },
        })

        // Sort by the specified benchmark score
        const sortedModels = models
            .map((model) => {
                const scores = model.benchmarkScores as Record<string, number> | null
                const score = scores?.[benchmark] || scores?.[`${benchmark}_c0`] || 0
                return {
                    ...model,
                    score,
                }
            })
            .filter((model) => model.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)

        return NextResponse.json({
            benchmark,
            data: sortedModels.map((model, index) => ({
                rank: index + 1,
                slug: model.slug,
                name: model.name,
                provider: model.provider,
                score: model.score,
            })),
        })
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        )
    }
}
