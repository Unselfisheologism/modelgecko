import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

let prismaClient: PrismaClient | null = null

try {
    prismaClient =
        globalForPrisma.prisma ??
        new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        })

    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient
} catch (error) {
    console.warn('Failed to initialize Prisma client:', error)
    // Create a mock client that returns empty results
    const mockModel = {
        findMany: async () => [],
        count: async () => 0,
    }

    prismaClient = {
        model: mockModel,
        apiUser: {},
        usageLog: {},
        pricingPlan: {},
    } as any as PrismaClient
}

export const prisma = prismaClient!
