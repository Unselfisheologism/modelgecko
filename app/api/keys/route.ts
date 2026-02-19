import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createApiKey, revokeApiKey, getApiKeyUsage } from '@/lib/unkey'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

// Helper to get authenticated user
async function getAuthUser() {
    const cookieStore = cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data: { session } } = await supabase.auth.getSession()
    return session?.user || null
}

export async function POST(request: Request) {
    try {
        const user = await getAuthUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { plan = 'free' } = body
        const userId = user.id

        // Check if user already has a key
        const existingUser = await prisma.apiUser.findUnique({
            where: { supabaseUserId: userId },
        })

        if (existingUser?.unkeyKeyId) {
            // Revoke existing key first
            await revokeApiKey(existingUser.unkeyKeyId)
        }

        // Create new API key
        const keyResult = await createApiKey(userId, plan)

        // Save to database
        const dbUser = await prisma.apiUser.upsert({
            where: { supabaseUserId: userId },
            update: {
                unkeyKeyId: keyResult.keyId,
                unkeyKey: keyResult.key,
                plan,
            },
            create: {
                supabaseUserId: userId,
                email: user.email || existingUser?.email || '',
                unkeyKeyId: keyResult.keyId,
                unkeyKey: keyResult.key,
                plan,
                credits: 1000,
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
        const user = await getAuthUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const dbUser = await prisma.apiUser.findUnique({
            where: { supabaseUserId: user.id },
        })

        if (!dbUser || !dbUser.unkeyKeyId) {
            return NextResponse.json(
                { error: 'No API key found' },
                { status: 404 }
            )
        }

        // Get usage from Unkey
        const usage = await getApiKeyUsage(dbUser.unkeyKeyId)

        return NextResponse.json({
            keyId: dbUser.unkeyKeyId,
            credits: dbUser.credits,
            usage: {
                total: usage?.usage || 0,
                remaining: Math.max(0, (dbUser.credits || 1000) - (usage?.usage || 0)),
                limit: dbUser.credits || 1000,
            },
            plan: usage?.meta?.plan || dbUser.plan || 'free',
            createdAt: dbUser.createdAt,
        })
    } catch (error) {
        console.error('Error fetching API key:', error)
        return NextResponse.json(
            { error: 'Failed to fetch API key' },
            { status: 500 }
        )
    }
}
