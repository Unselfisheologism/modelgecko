import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Public routes that don't require authentication or API key
const publicRoutes = [
    '/',
    '/api/models',
    '/api/leaderboards',
    '/api/pricing',
    '/api/providers',
    '/api/modalities',
    '/api/health',
    '/api/auth',
    '/api/webhooks',
    '/api-docs',
]

// Routes that require authentication (dashboard, etc.)
const authRoutes = [
    '/dashboard',
    '/api/keys',
    '/api/checkout',
    '/api/portal',
    '/api/admin',
]

// Routes that require API key
const apiRoutes = ['/api/v1']

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Allow static files and _next
    if (
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path.startsWith('/favicon') ||
        path.match(/\.(?:png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2)$/)
    ) {
        return NextResponse.next()
    }

    // Check if route is public
    if (publicRoutes.some(route => path.startsWith(route))) {
        return NextResponse.next()
    }

    // Create Supabase client for session checking
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Check if user is authenticated for auth routes
    const isAuthRoute = authRoutes.some(route => path.startsWith(route))

    if (isAuthRoute) {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            // Redirect to login page if not authenticated
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirectTo', path)
            return NextResponse.redirect(loginUrl)
        }

        // Add user info to headers for downstream use
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', session.user.id)
        requestHeaders.set('x-user-email', session.user.email || '')

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    }

    // Check API key for /api/v1/* routes
    const isApiRoute = apiRoutes.some(route => path.startsWith(route))

    if (isApiRoute) {
        const apiKey = request.headers.get('x-api-key')

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key required. Provide X-API-KEY header.' },
                { status: 401 }
            )
        }

        // Verify the API key with Unkey
        try {
            const unkeyResponse = await fetch(
                `${process.env.UNKEY_API_URL || 'https://api.unkey.dev'}/v1/keys/verify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.UNKEY_ROOT_KEY}`,
                    },
                    body: JSON.stringify({
                        key: apiKey,
                        apiId: process.env.UNKEY_API_ID,
                    }),
                }
            )

            const result = await unkeyResponse.json()

            if (!result.valid) {
                return NextResponse.json(
                    { error: 'Invalid or expired API key' },
                    { status: 401 }
                )
            }

            // Add user info to headers for downstream use
            const requestHeaders = new Headers(request.headers)
            requestHeaders.set('x-api-owner-id', result.ownerId || '')
            requestHeaders.set('x-api-key-id', result.keyId || '')

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            })
        } catch (error) {
            console.error('Error verifying API key:', error)
            return NextResponse.json(
                { error: 'Failed to verify API key' },
                { status: 500 }
            )
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
