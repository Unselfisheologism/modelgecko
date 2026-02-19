import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyApiKey } from '@/lib/unkey'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const apiKey = request.headers.get('x-api-key')
        const userId = request.headers.get('x-user-id')

        // Get model from database
        const model = await prisma.model.findUnique({
            where: { slug: params.slug },
        })

        if (!model) {
            return NextResponse.json(
                { error: 'Model not found' },
                { status: 404 }
            )
        }

        // If API key is provided, log usage and deduct credits
        if (apiKey && userId) {
            const verification = await verifyApiKey(apiKey)
            if (verification.valid) {
                const user = await prisma.apiUser.findUnique({
                    where: { clerkUserId: userId },
                })

                if (user && user.credits > 0) {
                    // Log usage
                    await prisma.usageLog.create({
                        data: {
                            apiUserId: userId,
                            endpoint: `/api/v1/models/${params.slug}`,
                            method: 'GET',
                            statusCode: 200,
                            creditsUsed: 1,
                        },
                    })

                    // Deduct credit
                    await prisma.apiUser.update({
                        where: { clerkUserId: userId },
                        data: {
                            credits: {
                                decrement: 1,
                            },
                        },
                    })
                }
            }
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
