const DODO_API_URL = 'https://api.dodopayments.com'

interface DodoCheckoutSession {
    id: string
    url: string
}

interface DodoCustomer {
    id: string
    email: string
}

export async function createCheckoutSession({
    priceId,
    customerId,
    successUrl,
    cancelUrl,
    metadata,
}: {
    priceId: string
    customerId?: string
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
}): Promise<DodoCheckoutSession> {
    const response = await fetch(`${DODO_API_URL}/checkout/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DODO_SECRET_KEY}`,
        },
        body: JSON.stringify({
            price_id: priceId,
            customer_id: customerId,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata,
        }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(`Failed to create checkout session: ${error.message}`)
    }

    return response.json()
}

export async function createCustomer({
    email,
    name,
}: {
    email: string
    name?: string
}): Promise<DodoCustomer> {
    const response = await fetch(`${DODO_API_URL}/customers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DODO_SECRET_KEY}`,
        },
        body: JSON.stringify({
            email,
            name,
        }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(`Failed to create customer: ${error.message}`)
    }

    return response.json()
}

export async function getCustomer(customerId: string): Promise<DodoCustomer> {
    const response = await fetch(`${DODO_API_URL}/customers/${customerId}`, {
        headers: {
            Authorization: `Bearer ${process.env.DODO_SECRET_KEY}`,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(`Failed to get customer: ${error.message}`)
    }

    return response.json()
}

export async function createCustomerPortalSession({
    customerId,
    returnUrl,
}: {
    customerId: string
    returnUrl: string
}): Promise<{ url: string }> {
    const response = await fetch(`${DODO_API_URL}/customers/${customerId}/portal_session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DODO_SECRET_KEY}`,
        },
        body: JSON.stringify({
            return_url: returnUrl,
        }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(`Failed to create portal session: ${error.message}`)
    }

    return response.json()
}

export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    // Dodo uses HMAC-SHA256 for webhook signatures
    const crypto = require('crypto')
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

    return signature === expectedSignature
}
