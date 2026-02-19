import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const models = await prisma.model.findMany({
            select: { modalities: true },
        })

        const allModalities = models.flatMap(m => m.modalities)
        const uniqueModalities = Array.from(new Set(allModalities)).sort()

        return NextResponse.json({ data: uniqueModalities })
    } catch (error) {
        console.error('Error fetching modalities:', error)
        return NextResponse.json(
            { error: 'Failed to fetch modalities' },
            { status: 500 }
        )
    }
}
