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
                    endpoint: `/api/v1/models/${params.slug}`,
                    method: 'GET',
                    statusCode: 200,
                    creditsUsed: 1,
                },
            })

            // Deduct credit
            const user = await prisma.apiUser.findUnique({
                where: { clerkUserId: userId },
            })

            if (user && user.credits > 0) {
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
