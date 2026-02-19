import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Lazy initialization - don't connect until first query
let prismaClient: PrismaClient | null = null
let isConnected = false

const createPrismaClient = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
}

export const prisma = new Proxy({} as PrismaClient, {
    get(target, prop) {
        // Lazy initialization on first access
        if (!prismaClient) {
            try {
                prismaClient = globalForPrisma.prisma ?? createPrismaClient()
                if (process.env.NODE_ENV !== 'production') {
                    globalForPrisma.prisma = prismaClient
                }
            } catch (error) {
                console.warn('Failed to initialize Prisma client:', error)
                return async () => {
                    console.error('Database not available')
                    return []
                }
            }
        }

        // Handle model queries with error catching
        if (prop === 'model' || prop === 'apiUser' || prop === 'usageLog' || prop === 'pricingPlan') {
            return new Proxy({}, {
                get(_, modelProp) {
                    return async (...args: any[]) => {
                        try {
                            // @ts-ignore - dynamic property access
                            return await prismaClient![prop][modelProp](...args)
                        } catch (error: any) {
                            console.error(`Database error on ${String(prop)}.${String(modelProp)}:`, error?.message || error)
                            // Return empty results based on the operation
                            if (modelProp === 'findMany' || modelProp === 'findFirst') {
                                return []
                            }
                            if (modelProp === 'count') {
                                return 0
                            }
                            if (modelProp === 'create' || modelProp === 'update' || modelProp === 'delete') {
                                throw error
                            }
                            return null
                        }
                    }
                }
            })
        }

        // @ts-ignore - dynamic property access
        return prismaClient?.[prop]
    }
})
