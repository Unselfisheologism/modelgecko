'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Key, CreditCard, BarChart3, Copy, RefreshCw, LogOut, User } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'

interface ApiKeyData {
    keyId: string
    key?: string
    credits: number
    usage: {
        total: number
        remaining: number
        limit: number
    }
    plan: string
}

interface UserData {
    id: string
    email: string
    name?: string
}

export default function DashboardPage() {
    const [keyData, setKeyData] = useState<ApiKeyData | null>(null)
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showKey, setShowKey] = useState(false)
    const [copied, setCopied] = useState(false)
    const router = useRouter()
    const supabase = createBrowserClient()

    useEffect(() => {
        async function init() {
            // Check auth session
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push('/login?redirectTo=/dashboard')
                return
            }

            setUser({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
            })

            // Fetch API key
            try {
                const response = await fetch('/api/keys')
                if (response.ok) {
                    const data = await response.json()
                    setKeyData(data)
                }
            } catch (error) {
                console.error('Error fetching API key:', error)
            } finally {
                setLoading(false)
            }
        }

        init()
    }, [router, supabase])

    const handleCreateKey = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan: 'free' }),
            })

            if (response.ok) {
                const data = await response.json()
                setKeyData(data)
            }
        } catch (error) {
            console.error('Error creating API key:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        if (keyData?.key) {
            navigator.clipboard.writeText(keyData.key)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-primary">
                        ModelGecko
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/models" className="text-sm font-medium hover:text-primary">
                            Models
                        </Link>
                        <Link href="/leaderboard" className="text-sm font-medium hover:text-primary">
                            Leaderboard
                        </Link>
                        <Link href="/api-docs" className="text-sm font-medium hover:text-primary">
                            API
                        </Link>
                        <div className="flex items-center gap-4">
                            {user && (
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {user.email}
                                </span>
                            )}
                            <button
                                onClick={handleSignOut}
                                className="text-sm font-medium px-4 py-2 border rounded-md hover:bg-muted flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

                {!keyData?.key ? (
                    <div className="p-8 rounded-lg border bg-card text-center">
                        <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mb-2">No API Key</h2>
                        <p className="text-muted-foreground mb-6">
                            Get started by creating your first API key.
                        </p>
                        <button
                            onClick={handleCreateKey}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            Create API Key
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* API Key Card */}
                        <div className="p-6 rounded-lg border bg-card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Key className="w-5 h-5" />
                                    Your API Key
                                </h2>
                                <span className="px-3 py-1 rounded-full text-sm bg-secondary capitalize">
                                    {keyData.plan}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <code className="flex-1 p-3 bg-muted rounded-md font-mono text-sm">
                                    {showKey ? keyData.key : '•'.repeat(24)}
                                </code>
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="p-2 border rounded-md hover:bg-muted"
                                >
                                    {showKey ? 'Hide' : 'Show'}
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 border rounded-md hover:bg-muted"
                                >
                                    {copied ? 'Copied!' : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <p className="text-sm text-destructive">
                                Make sure to copy your API key now. You won&apos;t be able to see it again!
                            </p>
                        </div>

                        {/* Usage Card */}
                        <div className="p-6 rounded-lg border bg-card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Usage
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total Credits</p>
                                    <p className="text-2xl font-bold">{keyData.credits.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Used</p>
                                    <p className="text-2xl font-bold">{keyData.usage.total.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                                    <p className="text-2xl font-bold">{keyData.usage.remaining.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{
                                        width: `${Math.min(100, (keyData.usage.total / keyData.usage.limit) * 100)}%`,
                                    }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                {((keyData.usage.total / keyData.usage.limit) * 100).toFixed(1)}% used
                            </p>
                        </div>

                        {/* Billing Card */}
                        <div className="p-6 rounded-lg border bg-card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Billing
                                </h2>
                            </div>

                            <p className="text-muted-foreground mb-4">
                                Upgrade your plan to get more credits and higher rate limits.
                            </p>

                            <div className="flex gap-4">
                                <Link
                                    href="/api-docs#pricing"
                                    className="px-4 py-2 border rounded-md hover:bg-muted"
                                >
                                    View Pricing
                                </Link>
                                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                                    Upgrade
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
