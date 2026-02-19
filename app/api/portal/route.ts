import { NextResponse } from 'next/server'
import { createCustomerPortalSession } from '@/lib/dodo'
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

        const dbUser = await prisma.apiUser.findUnique({
            where: { supabaseUserId: user.id },
        })

        if (!dbUser?.dodoCustomerId) {
            return NextResponse.json(
                { error: 'No billing account found' },
                { status: 400 }
            )
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const session = await createCustomerPortalSession({
            customerId: dbUser.dodoCustomerId,
            returnUrl: `${appUrl}/dashboard`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Error creating portal session:', error)
        return NextResponse.json(
            { error: 'Failed to create portal session' },
            { status: 500 }
        )
    }
}
