import { prisma } from './db'

export interface DBStatus {
    available: boolean
    error?: string
}

let cachedStatus: DBStatus | null = null
let lastCheck = 0
const CACHE_DURATION = 30000 // 30 seconds

export async function checkDatabaseStatus(): Promise<DBStatus> {
    const now = Date.now()
    
    // Return cached result if recent
    if (cachedStatus && (now - lastCheck) < CACHE_DURATION) {
        return cachedStatus
    }

    try {
        // Try a simple query to check if database is available
        await prisma.$queryRaw`SELECT 1`
        cachedStatus = { available: true }
    } catch (error: any) {
        console.error('Database connection failed:', error?.message || error)
        cachedStatus = { 
            available: false, 
            error: error?.message || 'Database connection failed' 
        }
    }
    
    lastCheck = now
    return cachedStatus
}

export function getDBStatusSync(): DBStatus {
    return cachedStatus || { available: false, error: 'Status not checked yet' }
}