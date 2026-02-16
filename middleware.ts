import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require API key
const publicRoutes = [
    '/',
    '/api/models',
    '/api/leaderboards',
    '/api/pricing',
    '/api/providers',
    '/api/modalities',
]

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Allow public routes
    if (publicRoutes.some(route => path.startsWith(route))) {
        return NextResponse.next()
    }

    // Check for API key
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key required. Provide X-API-KEY header.' },
            { status: 401 }
        )
    }

    // Verify the API key with Unkey
    try {
        const response = await fetch(
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

        const result = await response.json()

        if (!result.valid) {
            return NextResponse.json(
                { error: 'Invalid or expired API key' },
                { status: 401 }
            )
        }

        // Add user info to headers for downstream use
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', result.ownerId)
        requestHeaders.set('x-key-id', result.keyId)

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

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
    ],
}
