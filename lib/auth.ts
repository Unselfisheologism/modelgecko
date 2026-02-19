import { prisma } from './db'
import { createServiceClient } from './supabase'

export interface AuthUser {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    emailVerified?: boolean
}

/**
 * Sync a Supabase Auth user to the local ApiUser database
 * This should be called when a user signs up or logs in
 */
export async function syncUserToDatabase(user: AuthUser): Promise<{
    id: string
    supabaseUserId: string
    email: string
    credits: number
    plan: string
}> {
    const dbUser = await prisma.apiUser.upsert({
        where: { supabaseUserId: user.id },
        update: {
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            emailVerified: user.emailVerified ?? false,
        },
        create: {
            supabaseUserId: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            emailVerified: user.emailVerified ?? false,
            credits: 1000, // Free tier starts with 1000 credits
            plan: 'free',
        },
    })

    return {
        id: dbUser.id,
        supabaseUserId: dbUser.supabaseUserId,
        email: dbUser.email,
        credits: dbUser.credits,
        plan: dbUser.plan,
    }
}

/**
 * Get user from database by Supabase user ID
 */
export async function getUserBySupabaseId(supabaseUserId: string) {
    return prisma.apiUser.findUnique({
        where: { supabaseUserId },
    })
}

/**
 * Get user from database by email
 */
export async function getUserByEmail(email: string) {
    return prisma.apiUser.findUnique({
        where: { email },
    })
}

/**
 * Get the current authenticated user from Supabase and sync to database
 * Use this in Server Components
 */
export async function getCurrentUser(supabaseUserId: string | null) {
    if (!supabaseUserId) {
        return null
    }

    // Get user from Supabase Auth (admin client)
    const supabase = createServiceClient()
    const { data: { user }, error } = await supabase.auth.admin.getUserById(supabaseUserId)

    if (error || !user) {
        return null
    }

    // Sync to database
    const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.user_metadata?.full_name,
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        emailVerified: user.email_confirmed_at != null,
    }

    return syncUserToDatabase(authUser)
}

/**
 * Sign out user from Supabase
 */
export async function signOut(supabaseClient: { auth: { signOut: () => Promise<{ error: Error | null }> } }) {
    const { error } = await supabaseClient.auth.signOut()
    return { error }
}

/**
 * Check if user is authenticated (for middleware)
 */
export async function getSession(supabaseClient: { auth: { getSession: () => Promise<{ data: { session: { user: { id: string; email?: string } } | null } }> } }) {
    const { data: { session } } = await supabaseClient.auth.getSession()
    return session
}
