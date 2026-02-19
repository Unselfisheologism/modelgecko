import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const model = await prisma.model.findUnique({
            where: { slug: params.slug },
        })

        if (!model) {
            return NextResponse.json(
                { error: 'Model not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(model)
    } catch (error) {
        console.error('Error fetching model:', error)
        return NextResponse.json(
            { error: 'Failed to fetch model' },
            { status: 500 }
        )
    }
}
