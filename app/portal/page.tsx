'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, RefreshCw, ExternalLink } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SubscriptionData {
    plan: string
    credits: number
    dodoCustomerId?: string
    dodoSubscriptionId?: string
}

export default function PortalPage() {
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [portalLoading, setPortalLoading] = useState(false)
    const router = useRouter()
    const supabase = createBrowserClient()

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push('/login?redirectTo=/portal')
                return
            }

            try {
                const response = await fetch('/api/keys')
                if (response.ok) {
                    const data = await response.json()
                    setSubscription({
                        plan: data.plan || 'free',
                        credits: data.credits || 1000,
                    })
                }
            } catch (error) {
                console.error('Error fetching subscription:', error)
            } finally {
                setLoading(false)
            }
        }

        init()
    }, [router, supabase])

    const handleOpenPortal = async () => {
        setPortalLoading(true)
        try {
            const response = await fetch('/api/portal', {
                method: 'POST',
            })

            if (response.ok) {
                const data = await response.json()
                if (data.url) {
                    window.location.href = data.url
                }
            }
        } catch (error) {
            console.error('Error opening portal:', error)
        } finally {
            setPortalLoading(false)
        }
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
                <div className="mb-6">
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Current Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold capitalize">{subscription?.plan || 'Free'}</p>
                                    <p className="text-muted-foreground">
                                        {subscription?.credits.toLocaleString() || '1,000'} requests/month
                                    </p>
                                </div>
                                <Badge>Active</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Manage Subscription</CardTitle>
                            <CardDescription>
                                Update your payment method, change plans, or cancel your subscription
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleOpenPortal} disabled={portalLoading} className="gap-2">
                                {portalLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ExternalLink className="w-4 h-4" />
                                )}
                                Open Billing Portal
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                If you have any questions about your subscription or billing, 
                                please contact our support team.
                            </p>
                            <Link href="/api-docs#pricing">
                                <Button variant="outline">
                                    View Pricing Plans
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    )
}
