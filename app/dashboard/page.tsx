'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
    Key, CreditCard, BarChart3, Copy, RefreshCw, LogOut, User, 
    Settings, ExternalLink, Clock, Zap, TrendingUp, AlertCircle 
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UsageChart } from '@/components/usage-chart'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

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
    createdAt?: string
}

interface UserData {
    id: string
    email: string
    name?: string
}

interface UsageData {
    date: string
    requests: number
}

export default function DashboardPage() {
    const [keyData, setKeyData] = useState<ApiKeyData | null>(null)
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showKey, setShowKey] = useState(false)
    const [copied, setCopied] = useState(false)
    const [usageData, setUsageData] = useState<UsageData[]>([])
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
                    
                    // Generate mock usage data for demo
                    const mockUsage: UsageData[] = []
                    for (let i = 6; i >= 0; i--) {
                        const date = new Date()
                        date.setDate(date.getDate() - i)
                        mockUsage.push({
                            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                            requests: Math.floor(Math.random() * 100) + 10,
                        })
                    }
                    setUsageData(mockUsage)
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
            <div className="min-h-screen flex flex-col">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            
            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back{user?.name ? `, ${user.name}` : ''}!
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/profile">
                            <Button variant="outline" className="gap-2">
                                <Settings className="w-4 h-4" />
                                Settings
                            </Button>
                        </Link>
                        <Button variant="ghost" onClick={handleSignOut} className="gap-2">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Plan</p>
                                    <p className="text-2xl font-bold capitalize">{keyData?.plan || 'Free'}</p>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    Active
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Credits</p>
                                    <p className="text-2xl font-bold">{keyData?.credits?.toLocaleString() || 0}</p>
                                </div>
                                <Zap className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Requests Used</p>
                                    <p className="text-2xl font-bold">{keyData?.usage?.total?.toLocaleString() || 0}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Remaining</p>
                                    <p className="text-2xl font-bold">{keyData?.usage?.remaining?.toLocaleString() || 0}</p>
                                </div>
                                <Clock className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {!keyData?.key ? (
                    <Card className="max-w-xl mx-auto">
                        <CardContent className="py-12 text-center">
                            <Key className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                            <h2 className="text-xl font-semibold mb-2">Get Your API Key</h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Create an API key to start accessing our model database. 
                                Free tier includes 1,000 requests per month.
                            </p>
                            <Button onClick={handleCreateKey} disabled={loading} size="lg">
                                {loading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Key className="w-4 h-4 mr-2" />
                                )}
                                Create API Key
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* API Key Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Key className="w-5 h-5" />
                                                Your API Key
                                            </CardTitle>
                                            <CardDescription>
                                                Use this key to authenticate your API requests
                                            </CardDescription>
                                        </div>
                                        <Badge className="capitalize">{keyData.plan}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 p-3 bg-muted rounded-md font-mono text-sm overflow-x-auto">
                                            {showKey ? keyData.key : '•'.repeat(24)}
                                        </code>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setShowKey(!showKey)}
                                        >
                                            {showKey ? '🙈' : '👁️'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleCopy}
                                        >
                                            {copied ? '✓' : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>

                                    <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md">
                                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                                        <p className="text-sm text-destructive">
                                            <strong>Important:</strong> Copy your API key now. You won&apos;t be able to see it again after leaving this page.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Usage Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        API Usage
                                    </CardTitle>
                                    <CardDescription>
                                        Your API requests over the last 7 days
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <UsageChart data={usageData} type="bar" />
                                </CardContent>
                            </Card>

                            {/* Quick Start */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Start</CardTitle>
                                    <CardDescription>
                                        Get started with the API in minutes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
                                        <code>{`curl -X GET "https://modelgecko.com/api/v1/models" \\
  -H "X-API-KEY: ${showKey ? keyData.key : 'your_api_key'}"

# Response
{
  "data": [
    {
      "slug": "gpt-4o",
      "name": "GPT-4o",
      "provider": "OpenAI",
      ...
    }
  ]
}`}</code>
                                    </pre>
                                    <div className="mt-4 flex gap-4">
                                        <Link href="/api-docs">
                                            <Button variant="outline" className="gap-2">
                                                <ExternalLink className="w-4 h-4" />
                                                API Documentation
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Usage Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Usage Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-muted-foreground">Credits Used</span>
                                            <span className="font-medium">
                                                {((keyData.usage.total / keyData.usage.limit) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{
                                                    width: `${Math.min(100, (keyData.usage.total / keyData.usage.limit) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Requests</span>
                                            <span className="font-medium">{keyData.usage.total.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Remaining</span>
                                            <span className="font-medium">{keyData.usage.remaining.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Monthly Limit</span>
                                            <span className="font-medium">{keyData.usage.limit.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Billing Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Billing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Upgrade to get more requests and higher rate limits.
                                    </p>
                                    <div className="space-y-2">
                                        <Link href="/pricing" className="block">
                                            <Button variant="outline" className="w-full">
                                                View Pricing Plans
                                            </Button>
                                        </Link>
                                        <Link href="/portal" className="block">
                                            <Button variant="ghost" className="w-full">
                                                Manage Subscription
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
