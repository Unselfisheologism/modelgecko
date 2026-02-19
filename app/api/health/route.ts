import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

const API_VERSION = '1.0.0'

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy'
    version: string
    timestamp: string
    services: {
        database: {
            status: 'connected' | 'disconnected'
            latencyMs?: number
        }
        unkey: {
            status: 'connected' | 'disconnected'
            latencyMs?: number
        }
    }
    metrics?: {
        totalModels?: number
        totalUsers?: number
    }
}

export async function GET() {
    const timestamp = new Date().toISOString()
    
    // Check database connectivity
    let dbStatus: 'connected' | 'disconnected' = 'disconnected'
    let dbLatency: number | undefined
    let totalModels: number | undefined
    let totalUsers: number | undefined
    
    try {
        const dbStart = Date.now()
        const [modelCount, userCount] = await Promise.all([
            prisma.model.count(),
            prisma.apiUser.count(),
        ])
        dbLatency = Date.now() - dbStart
        dbStatus = 'connected'
        totalModels = modelCount
        totalUsers = userCount
    } catch (error) {
        console.error('Database health check failed:', error)
    }
    
    // Check Unkey connectivity
    let unkeyStatus: 'connected' | 'disconnected' = 'disconnected'
    let unkeyLatency: number | undefined
    
    try {
        const unkeyStart = Date.now()
        const response = await fetch(
            `${process.env.UNKEY_API_URL || 'https://api.unkey.dev'}/v1/keys/verify`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.UNKEY_ROOT_KEY}`,
                },
                body: JSON.stringify({
                    key: 'health-check-test-key',
                }),
            }
        )
        unkeyLatency = Date.now() - unkeyStart
        // We expect this to fail with invalid key, but connection should work
        unkeyStatus = 'connected'
    } catch (error) {
        console.error('Unkey health check failed:', error)
    }
    
    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (dbStatus === 'disconnected' && unkeyStatus === 'disconnected') {
        status = 'unhealthy'
    } else if (dbStatus === 'disconnected' || unkeyStatus === 'disconnected') {
        status = 'degraded'
    }
    
    const health: HealthStatus = {
        status,
        version: API_VERSION,
        timestamp,
        services: {
            database: {
                status: dbStatus,
                ...(dbLatency && { latencyMs: dbLatency }),
            },
            unkey: {
                status: unkeyStatus,
                ...(unkeyLatency && { latencyMs: unkeyLatency }),
            },
        },
        ...(status === 'healthy' && {
            metrics: {
                totalModels,
                totalUsers,
            },
        }),
    }
    
    const statusCode = status === 'unhealthy' ? 503 : 200
    
    return NextResponse.json(health, { 
        status: statusCode,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
        }
    })
}
