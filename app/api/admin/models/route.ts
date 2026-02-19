import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'
import { modelSchema } from '@/lib/validation'
import { 
    successResponse, 
    errorResponse, 
    unauthorizedResponse, 
    validationErrorResponse 
} from '@/lib/api-response'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        // Verify admin
        const admin = await verifyAdmin()
        if (!admin) {
            return unauthorizedResponse('Admin authentication required')
        }

        const body = await request.json()

        // Validate input
        let validatedData
        try {
            validatedData = modelSchema.parse(body)
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        // Check if slug already exists
        const existing = await prisma.model.findUnique({
            where: { slug: validatedData.slug },
        })

        if (existing) {
            return errorResponse('Model with this slug already exists', 409, 'CONFLICT')
        }

        // Create model
        const model = await prisma.model.create({
            data: {
                slug: validatedData.slug,
                name: validatedData.name,
                provider: validatedData.provider,
                releaseDate: validatedData.releaseDate ? new Date(validatedData.releaseDate) : null,
                contextWindow: validatedData.contextWindow,
                modalities: validatedData.modalities,
                benchmarkScores: validatedData.benchmarkScores ?? Prisma.JsonNull,
                pricing: validatedData.pricing ?? Prisma.JsonNull,
                capabilities: validatedData.capabilities,
                links: validatedData.links ?? Prisma.JsonNull,
            },
        })

        return successResponse(model, undefined, { 'X-Admin-Action': 'create' })
    } catch (error) {
        console.error('Error creating model:', error)
        return errorResponse('Failed to create model')
    }
}
