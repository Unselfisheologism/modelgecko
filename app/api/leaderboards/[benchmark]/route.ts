import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
    request: Request,
    { params }: { params: { benchmark: string } }
) {
    try {
        const benchmark = params.benchmark.toLowerCase()
        const limit = parseInt(new URL(request.url).searchParams.get('limit') || '50')

        // Get all models with benchmark scores
        const models = await prisma.model.findMany({
            where: {
                benchmarkScores: {
                    not: null,
                },
            },
            orderBy: {
                name: 'asc',
            },
        })

        // Sort by the specified benchmark score
        const sortedModels = models
            .map((model) => {
                const scores = model.benchmarkScores as Record<string, number> | null
                const score = scores?.[benchmark]
                return {
                    ...model,
                    score: score || 0,
                }
            })
            .filter((model) => model.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)

        return NextResponse.json({
            benchmark,
            data: sortedModels.map((model) => ({
                rank: sortedModels.indexOf(model) + 1,
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
