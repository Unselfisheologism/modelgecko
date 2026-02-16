import { Unkey } from '@unkey/unkey'

const unkey = new Unkey({
    rootKey: process.env.UNKEY_ROOT_KEY!,
})

export async function createApiKey(userId: string, plan: 'free' | 'pro' | 'enterprise' = 'free') {
    const rateLimits = {
        free: { limit: 100, window: '1d' },
        pro: { limit: 10000, window: '1d' },
        enterprise: { limit: 100000, window: '1d' },
    }

    const { result, error } = await unkey.keys.create({
        apiId: process.env.UNKEY_API_ID!,
        ownerId: userId,
        expires: plan === 'free' ? undefined : Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days for paid
        ratelimit: {
            type: 'fast' as const,
            limit: rateLimits[plan].limit,
            window: rateLimits[plan].window as '1d' | '1h',
        },
        meta: {
            plan,
            userId,
        },
    })

    if (error) {
        throw new Error(`Failed to create API key: ${error.message}`)
    }

    return result
}

export async function verifyApiKey(key: string) {
    const { result, error } = await unkey.keys.verify({
        key,
        apiId: process.env.UNKEY_API_ID!,
    })

    if (error) {
        throw new Error(`Failed to verify API key: ${error.message}`)
    }

    return result
}

export async function revokeApiKey(keyId: string) {
    const { error } = await unkey.keys.delete({
        keyId,
    })

    if (error) {
        throw new Error(`Failed to revoke API key: ${error.message}`)
    }

    return true
}

export async function getApiKeyUsage(keyId: string) {
    const { result, error } = await unkey.keys.get({ keyId })

    if (error) {
        throw new Error(`Failed to get API key: ${error.message}`)
    }

    return result
}

export { unkey }
