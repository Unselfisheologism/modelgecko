import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const models = await prisma.model.findMany({
            select: { provider: true },
            distinct: ['provider'],
        })

        const providers = models.map(m => m.provider).sort()

        return NextResponse.json({ data: providers })
    } catch (error) {
        console.error('Error fetching providers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch providers' },
            { status: 500 }
        )
    }
}
