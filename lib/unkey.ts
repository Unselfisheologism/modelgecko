import { Unkey } from '@unkey/api'

const unkey = new Unkey({
    token: process.env.UNKEY_ROOT_KEY!,
})

export async function createApiKey(userId: string, plan: 'free' | 'pro' | 'enterprise' = 'free') {
    const rateLimits = {
        free: { limit: 100, refillRate: 100, refillInterval: 86400 }, // daily refill
        pro: { limit: 10000, refillRate: 10000, refillInterval: 86400 },
        enterprise: { limit: 100000, refillRate: 100000, refillInterval: 86400 },
    }

    const result = await unkey.keys.create({
        apiId: process.env.UNKEY_API_ID!,
        ownerId: userId,
        expires: plan === 'free' ? undefined : Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days for paid
        ratelimit: {
            type: 'fast' as const,
            limit: rateLimits[plan].limit,
            refillRate: rateLimits[plan].refillRate,
            refillInterval: rateLimits[plan].refillInterval,
        },
        meta: {
            plan,
            userId,
        },
    })

    return result
}

export async function verifyApiKey(key: string) {
    // Unkey SDK verify only needs the key, apiId is inferred from the key's associated API
    const result = await unkey.keys.verify({
        key,
    })

    return result
}

export async function revokeApiKey(keyId: string) {
    // Since update doesn't support 'enabled', we use the Unkey API directly via fetch
    const response = await fetch(`https://api.unkey.dev/v1/keys.updateKey`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY}`,
        },
        body: JSON.stringify({
            keyId,
            enabled: false,
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to revoke API key: ${error}`)
    }

    return true
}

export async function getApiKeyUsage(keyId: string) {
    // Use the Unkey API directly to get key details
    const response = await fetch(`https://api.unkey.dev/v1/keys.getKey?keyId=${encodeURIComponent(keyId)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY}`,
        },
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to get API key: ${error}`)
    }

    const result = await response.json()
    return result
}

export { unkey }
