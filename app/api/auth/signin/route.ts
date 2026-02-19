import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { syncUserToDatabase } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { email, password, provider } = await request.json()

        const cookieStore = cookies()
        let response = NextResponse.json({})

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value, ...options })
                            response = NextResponse.json({
                                url: '/dashboard',
                            })
                            response.cookies.set({ name, value, ...options })
                        } catch (error) {
                            // Handle cases where cookies can't be set
                        }
                    },
                    remove(name: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value: '', ...options })
                            response = NextResponse.json({})
                            response.cookies.set({ name, value: '', ...options })
                        } catch (error) {
                            // Handle cases where cookies can't be removed
                        }
                    },
                },
            }
        )

        // OAuth sign in
        if (provider) {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
                },
            })

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
                )
            }

            return NextResponse.json({ url: data.url })
        }

        // Email/password sign in
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            )
        }

        // Sync user to database
        if (data.user) {
            await syncUserToDatabase({
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
                emailVerified: data.user.email_confirmed_at != null,
            })
        }

        return NextResponse.json({
            user: {
                id: data.user.id,
                email: data.user.email,
            },
            url: '/dashboard',
        })
    } catch (error) {
        console.error('Signin error:', error)
        return NextResponse.json(
            { error: 'Failed to sign in' },
            { status: 500 }
        )
    }
}
