import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiError {
    message: string
    code?: string
    field?: string
}

export interface ApiResponse<T> {
    data?: T
    error?: ApiError | ApiError[]
    meta?: {
        total?: number
        limit?: number
        offset?: number
        page?: number
        pages?: number
    }
}

export function successResponse<T>(data: T, meta?: ApiResponse<T>['meta'], headers?: Record<string, string>) {
    const response = NextResponse.json({ data, meta })
    
    if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value)
        })
    }
    
    return response
}

export function errorResponse(message: string, status: number = 500, code?: string, field?: string) {
    const error: ApiError = { message, ...(code && { code }), ...(field && { field }) }
    return NextResponse.json({ error }, { status })
}

export function validationErrorResponse(zodError: ZodError) {
    const errors: ApiError[] = zodError.errors.map(err => ({
        message: err.message,
        code: 'VALIDATION_ERROR',
        field: err.path.join('.'),
    }))
    
    return NextResponse.json({ errors }, { status: 400 })
}

export function notFoundResponse(resource: string = 'Resource') {
    return errorResponse(`${resource} not found`, 404, 'NOT_FOUND')
}

export function unauthorizedResponse(message: string = 'Authentication required') {
    return errorResponse(message, 401, 'UNAUTHORIZED')
}

export function forbiddenResponse(message: string = 'Access denied') {
    return errorResponse(message, 403, 'FORBIDDEN')
}

export function rateLimitResponse(retryAfter: number = 60) {
    const response = errorResponse('Rate limit exceeded', 429, 'RATE_LIMITED')
    response.headers.set('Retry-After', String(retryAfter))
    response.headers.set('X-RateLimit-Reset', String(Date.now() + retryAfter * 1000))
    return response
}

export function addRateLimitHeaders(
    response: NextResponse,
    limit: number,
    remaining: number,
    reset: number
) {
    response.headers.set('X-RateLimit-Limit', String(limit))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Reset', String(reset))
    return response
}
