import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyWebhookSignature } from '@/lib/dodo'
import { createApiKey } from '@/lib/unkey'

export async function POST(request: Request) {
    try {
        const body = await request.text()
        const signature = request.headers.get('x-dodo-signature')

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing webhook signature' },
                { status: 400 }
            )
        }

        // Verify webhook signature
        const isValid = verifyWebhookSignature(
            body,
            signature,
            process.env.DODO_WEBHOOK_SECRET!
        )

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid webhook signature' },
                { status: 401 }
            )
        }

        const event = JSON.parse(body)

        switch (event.type) {
            case 'checkout.session.completed': {
                const { metadata, customer_id, subscription_id, price_id } = event.data

                if (!metadata?.userId) {
                    console.error('Missing userId in webhook metadata')
                    return NextResponse.json({ received: true })
                }

                // Get plan credits based on price_id (you'd store these in your DB)
                const planCredits: Record<string, number> = {
                    // Add your Dodo price IDs and corresponding credits
                    'price_basic': 1000,
                    'price_pro': 10000,
                    'price_enterprise': 100000,
                }

                const credits = planCredits[price_id] || 0

                // Update user with subscription and credits
                await prisma.apiUser.update({
                    where: { clerkUserId: metadata.userId },
                    data: {
                        dodoSubscriptionId: subscription_id,
                        credits: {
                            increment: credits,
                        },
                    },
                })

                // If this is a paid plan, update their Unkey key with higher rate limits
                if (credits > 1000) {
                    const user = await prisma.apiUser.findUnique({
                        where: { clerkUserId: metadata.userId },
                    })

                    if (user?.unkeyKeyId) {
                        // Revoke old key and create new one with higher limits
                        // Note: In production, you'd handle this more gracefully
                        console.log('Upgrading user to paid plan:', metadata.userId)
                    }
                }

                break
            }

            case 'customer.subscription.deleted': {
                const { customer_id } = event.data

                // Downgrade user to free tier
                await prisma.apiUser.update({
                    where: { dodoCustomerId: customer_id },
                    data: {
                        dodoSubscriptionId: null,
                    },
                })

                break
            }

            case 'invoice.payment_failed': {
                const { customer_id } = event.data

                // Handle failed payment (maybe revoke API access)
                console.log('Payment failed for customer:', customer_id)
                break
            }

            default:
                console.log('Unhandled event type:', event.type)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Error processing webhook:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}
