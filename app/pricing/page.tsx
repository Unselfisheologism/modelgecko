import Link from 'next/link'
import { Check, X, Zap, Building, Users, ArrowRight } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const plans = [
    {
        name: 'Free',
        price: 0,
        description: 'Perfect for getting started and exploring the API',
        features: [
            { text: '1,000 API requests/month', included: true },
            { text: 'Access to all public endpoints', included: true },
            { text: 'Basic model data', included: true },
            { text: 'Community support', included: true },
            { text: 'Protected API endpoints', included: false },
            { text: 'Priority support', included: false },
        ],
        cta: 'Get Started Free',
        popular: false,
    },
    {
        name: 'Pro',
        price: 29,
        description: 'For developers and teams building production applications',
        features: [
            { text: '100,000 API requests/month', included: true },
            { text: 'Access to all endpoints', included: true },
            { text: 'Full model data with history', included: true },
            { text: 'Higher rate limits (600/min)', included: true },
            { text: 'Priority email support', included: true },
            { text: 'API key management', included: true },
        ],
        cta: 'Start Pro Trial',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: null,
        description: 'Custom solutions for large-scale applications',
        features: [
            { text: 'Unlimited API requests', included: true },
            { text: 'Custom rate limits', included: true },
            { text: 'Dedicated infrastructure', included: true },
            { text: 'SLA guarantee', included: true },
            { text: 'Dedicated support team', included: true },
            { text: 'Custom integrations', included: true },
        ],
        cta: 'Contact Sales',
        popular: false,
    },
]

export default function PricingPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <Badge className="mb-4">Simple Pricing</Badge>
                    <h1 className="text-4xl font-bold mb-4">Plans for Every Scale</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Start free and scale as you grow. No hidden fees, no surprises.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                    {plans.map((plan) => (
                        <Card 
                            key={plan.name}
                            className={plan.popular ? 'border-primary relative' : ''}
                        >
                            {plan.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    Most Popular
                                </Badge>
                            )}
                            <CardHeader>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <div className="mt-4">
                                    {plan.price !== null ? (
                                        <div className="flex items-baseline">
                                            <span className="text-4xl font-bold">${plan.price}</span>
                                            <span className="text-muted-foreground ml-2">/month</span>
                                        </div>
                                    ) : (
                                        <span className="text-4xl font-bold">Custom</span>
                                    )}
                                </div>
                                <CardDescription className="mt-2">{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            {feature.included ? (
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                            )}
                                            <span className={feature.included ? '' : 'text-muted-foreground'}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href={plan.price === null ? '/contact' : '/signup'} className="block">
                                    <Button 
                                        className="w-full" 
                                        variant={plan.popular ? 'default' : 'outline'}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                    
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">What happens if I exceed my monthly limit?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    API requests will be rejected with a 429 status code. You can upgrade your plan 
                                    at any time to get more requests, or wait until your limit resets at the start 
                                    of the next billing cycle.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Can I cancel my subscription anytime?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Yes, you can cancel your subscription at any time. You&apos;ll continue to have 
                                    access until the end of your current billing period. No refunds are provided 
                                    for partial months.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    We accept all major credit cards through Dodo Payments. Enterprise customers 
                                    can also pay via invoice with NET-30 terms.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    We offer a 14-day money-back guarantee for Pro plans. If you&apos;re not satisfied, 
                                    contact support for a full refund within 14 days of your purchase.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <Card className="bg-primary text-primary-foreground max-w-2xl mx-auto">
                        <CardContent className="py-8">
                            <Zap className="w-12 h-12 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
                            <p className="mb-6 opacity-90">
                                Start with 1,000 free API requests. No credit card required.
                            </p>
                            <Link href="/signup">
                                <Button size="lg" variant="secondary" className="gap-2">
                                    Create Free Account <ArrowRight className="w-4 h-4" />
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
