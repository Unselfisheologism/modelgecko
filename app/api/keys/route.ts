import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createApiKey, revokeApiKey, getApiKeyUsage } from '@/lib/unkey'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, plan = 'free' } = body

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            )
        }

        // Check if user already has a key
        const existingUser = await prisma.apiUser.findUnique({
            where: { clerkUserId: userId },
        })

        if (existingUser?.unkeyKeyId) {
            // Revoke existing key first
            await revokeApiKey(existingUser.unkeyKeyId)
        }

        // Create new API key
        const keyResult = await createApiKey(userId, plan)

        // Save to database
        const user = await prisma.apiUser.upsert({
            where: { clerkUserId: userId },
            update: {
                unkeyKeyId: keyResult.keyId,
                unkeyKey: keyResult.key,
            },
            create: {
                clerkUserId: userId,
                email: existingUser?.email || '',
                unkeyKeyId: keyResult.keyId,
                unkeyKey: keyResult.key,
            },
        })

        // Return the key only once
        return NextResponse.json({
            keyId: keyResult.keyId,
            key: keyResult.key, // Only shown this one time!
            plan,
        })
    } catch (error) {
        console.error('Error creating API key:', error)
        return NextResponse.json(
            { error: 'Failed to create API key' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id')

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = await prisma.apiUser.findUnique({
            where: { clerkUserId: userId },
        })

        if (!user || !user.unkeyKeyId) {
            return NextResponse.json(
                { error: 'No API key found' },
                { status: 404 }
            )
        }

        // Get usage from Unkey
        const usage = await getApiKeyUsage(user.unkeyKeyId)

        return NextResponse.json({
            keyId: user.unkeyKeyId,
            credits: user.credits,
            usage: {
                total: usage?.usage || 0,
                remaining: Math.max(0, (user.credits || 1000) - (usage?.usage || 0)),
                limit: user.credits || 1000,
            },
            plan: usage?.meta?.plan || 'free',
            createdAt: user.createdAt,
        })
    } catch (error) {
        console.error('Error fetching API key:', error)
        return NextResponse.json(
            { error: 'Failed to fetch API key' },
            { status: 500 }
        )
    }
}
