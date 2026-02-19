import { NextResponse } from 'next/server'
import { createCheckoutSession, createCustomer } from '@/lib/dodo'
import { prisma } from '@/lib/db'
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
        const { priceId, planName } = body

        if (!priceId) {
            return NextResponse.json(
                { error: 'Missing required field: priceId' },
                { status: 400 }
            )
        }

        const userId = user.id
        const email = user.email!

        // Get user from database
        const dbUser = await prisma.apiUser.findUnique({
            where: { supabaseUserId: userId },
        })

        let customerId = dbUser?.dodoCustomerId

        // Create customer in Dodo if not exists
        if (!customerId) {
            const customer = await createCustomer({ email })
            customerId = customer.id

            // Update user with customer ID
            await prisma.apiUser.update({
                where: { supabaseUserId: userId },
                data: { dodoCustomerId: customerId },
            })
        }

        // Create checkout session
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const session = await createCheckoutSession({
            priceId,
            customerId,
            successUrl: `${appUrl}/dashboard?checkout=success`,
            cancelUrl: `${appUrl}/dashboard?checkout=cancelled`,
            metadata: {
                userId,
                planName,
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
