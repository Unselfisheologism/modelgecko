import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase'
import { syncUserToDatabase } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Create a temporary client for sign up (no cookies needed for this operation)
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
            },
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        // Sync user to database if user was created
        if (data.user) {
            await syncUserToDatabase({
                id: data.user.id,
                email: data.user.email!,
                name: name || data.user.user_metadata?.name,
                emailVerified: false,
            })
        }

        return NextResponse.json({
            message: 'Check your email to confirm your account',
            user: data.user ? {
                id: data.user.id,
                email: data.user.email,
            } : null,
        })
    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        )
    }
}
