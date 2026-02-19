import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'
import { updateModelSchema } from '@/lib/validation'
import { 
    successResponse, 
    errorResponse, 
    unauthorizedResponse, 
    notFoundResponse,
    validationErrorResponse 
} from '@/lib/api-response'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function PUT(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        // Verify admin
        const admin = await verifyAdmin()
        if (!admin) {
            return unauthorizedResponse('Admin authentication required')
        }

        const { slug } = params
        const body = await request.json()

        // Validate input
        let validatedData
        try {
            validatedData = updateModelSchema.parse(body)
        } catch (error) {
            if (error instanceof ZodError) {
                return validationErrorResponse(error)
            }
            throw error
        }

        // Check if model exists
        const existing = await prisma.model.findUnique({
            where: { slug },
        })

        if (!existing) {
            return notFoundResponse('Model')
        }

        // Prepare update data
        const updateData: any = {}
        if (validatedData.name !== undefined) updateData.name = validatedData.name
        if (validatedData.provider !== undefined) updateData.provider = validatedData.provider
        if (validatedData.releaseDate !== undefined) {
            updateData.releaseDate = validatedData.releaseDate ? new Date(validatedData.releaseDate) : null
        }
        if (validatedData.contextWindow !== undefined) updateData.contextWindow = validatedData.contextWindow
        if (validatedData.modalities !== undefined) updateData.modalities = validatedData.modalities
        if (validatedData.benchmarkScores !== undefined) {
            updateData.benchmarkScores = validatedData.benchmarkScores ?? Prisma.JsonNull
        }
        if (validatedData.pricing !== undefined) {
            updateData.pricing = validatedData.pricing ?? Prisma.JsonNull
        }
        if (validatedData.capabilities !== undefined) updateData.capabilities = validatedData.capabilities
        if (validatedData.tags !== undefined) updateData.tags = validatedData.tags
        if (validatedData.links !== undefined) {
            updateData.links = validatedData.links ?? Prisma.JsonNull
        }
        if (validatedData.changelog !== undefined) {
            updateData.changelog = validatedData.changelog ?? Prisma.JsonNull
        }

        updateData.lastUpdated = new Date()

        const inputPrice = typeof validatedData.pricing?.inputPrice === 'number'
            ? validatedData.pricing.inputPrice
            : null
        const outputPrice = typeof validatedData.pricing?.outputPrice === 'number'
            ? validatedData.pricing.outputPrice
            : null
        const shouldTrackPrice = validatedData.pricing !== undefined && (inputPrice !== null || outputPrice !== null)

        const model = await prisma.$transaction(async (tx) => {
            const updated = await tx.model.update({
                where: { slug },
                data: updateData,
            })

            if (shouldTrackPrice) {
                await tx.priceHistory.create({
                    data: {
                        modelId: updated.slug,
                        inputPrice: inputPrice ?? 0,
                        outputPrice: outputPrice ?? 0,
                    },
                })
            }

            return updated
        })

        return successResponse(model, undefined, { 'X-Admin-Action': 'update' })
    } catch (error) {
        console.error('Error updating model:', error)
        return errorResponse('Failed to update model')
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        // Verify admin
        const admin = await verifyAdmin()
        if (!admin) {
            return unauthorizedResponse('Admin authentication required')
        }

        const { slug } = params

        // Check if model exists
        const existing = await prisma.model.findUnique({
            where: { slug },
        })

        if (!existing) {
            return notFoundResponse('Model')
        }

        // Delete model
        await prisma.model.delete({
            where: { slug },
        })

        return NextResponse.json(
            { 
                data: { success: true, message: 'Model deleted successfully' },
                meta: { deletedSlug: slug }
            },
            { 
                status: 200,
                headers: { 'X-Admin-Action': 'delete' }
            }
        )
    } catch (error) {
        console.error('Error deleting model:', error)
        return errorResponse('Failed to delete model')
    }
}
