import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Protected route - requires API key (handled by middleware)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const provider = searchParams.get('provider')
        const modality = searchParams.get('modality')
        const search = searchParams.get('search')
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')

        const where: any = {}

        if (provider) {
            where.provider = provider
        }

        if (modality) {
            where.modalities = {
                has: modality,
            }
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { provider: { contains: search, mode: 'insensitive' } },
            ]
        }

        const [models, total] = await Promise.all([
            prisma.model.findMany({
                where,
                orderBy: { name: 'asc' },
                take: limit,
                skip: offset,
            }),
            prisma.model.count({ where }),
        ])

        return NextResponse.json({
            data: models,
            meta: {
                total,
                limit,
                offset,
            },
        })
    } catch (error) {
        console.error('Error fetching models:', error)
        return NextResponse.json(
            { error: 'Failed to fetch models' },
            { status: 500 }
        )
    }
}
