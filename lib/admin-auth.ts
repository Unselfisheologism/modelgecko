import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { prisma } from './db'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

export interface AdminUser {
    id: string
    email: string
    isAdmin: boolean
}

export async function verifyAdmin(): Promise<AdminUser | null> {
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

    if (!session?.user) {
        return null
    }

    const email = session.user.email?.toLowerCase() || ''
    const isAdmin = ADMIN_EMAILS.includes(email)

    if (!isAdmin) {
        // Also check database for admin role
        const dbUser = await prisma.apiUser.findUnique({
            where: { supabaseUserId: session.user.id },
        })
        
        if (dbUser?.plan !== 'admin') {
            return null
        }
    }

    return {
        id: session.user.id,
        email: session.user.email || '',
        isAdmin: true,
    }
}

export async function requireAdmin(): Promise<AdminUser> {
    const admin = await verifyAdmin()
    
    if (!admin) {
        throw new Error('Admin access required')
    }
    
    return admin
}
