import Link from 'next/link'
import { 
    Code, Key, CreditCard, Globe, Zap, ArrowRight, 
    CheckCircle, AlertCircle, Clock, Database 
} from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12">
                        <Badge className="mb-4">REST API</Badge>
                        <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
                        <p className="text-xl text-muted-foreground">
                            Programmatic access to comprehensive AI model data, benchmarks, and rankings.
                        </p>
                    </div>

                    {/* Quick Start */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-6 h-6" />
                            Quick Start
                        </h2>
                        <Card>
                            <CardContent className="py-6">
                                <ol className="list-decimal list-inside space-y-4">
                                    <li className="flex items-start gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">1</span>
                                        <div>
                                            <p className="font-medium">Sign up for a free account</p>
                                            <p className="text-sm text-muted-foreground">Create an account to get your API key</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">2</span>
                                        <div>
                                            <p className="font-medium">Get your API key from the dashboard</p>
                                            <p className="text-sm text-muted-foreground">Navigate to your dashboard to create and view your API key</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">3</span>
                                        <div>
                                            <p className="font-medium">Make your first API request</p>
                                            <p className="text-sm text-muted-foreground">Include your API key in the request header</p>
                                        </div>
                                    </li>
                                </ol>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Authentication */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Key className="w-6 h-6" />
                            Authentication
                        </h2>
                        <Card>
                            <CardHeader>
                                <CardTitle>API Key Header</CardTitle>
                                <CardDescription>
                                    Include your API key in the X-API-KEY header for all protected requests
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <pre className="p-4 bg-muted rounded-md overflow-x-auto">
                                    <code>X-API-KEY: your_api_key_here</code>
                                </pre>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Base URL */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Globe className="w-6 h-6" />
                            Base URL
                        </h2>
                        <Card>
                            <CardContent className="py-6">
                                <code className="text-lg">https://modelgecko.com/api</code>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Public Endpoints */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Globe className="w-6 h-6" />
                            Public Endpoints
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            These endpoints are available without authentication (rate limited to 60 requests/minute):
                        </p>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">GET</Badge>
                                        <CardTitle className="text-lg font-mono">/models</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        List all AI models with optional filters.
                                    </p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Query Parameters:</p>
                                        <div className="grid gap-2 text-sm">
                                            <div className="flex gap-2">
                                                <code className="bg-muted px-2 py-0.5 rounded">provider</code>
                                                <span className="text-muted-foreground">Filter by provider (e.g., "OpenAI", "Anthropic")</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <code className="bg-muted px-2 py-0.5 rounded">modality</code>
                                                <span className="text-muted-foreground">Filter by modality (e.g., "text", "image")</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <code className="bg-muted px-2 py-0.5 rounded">search</code>
                                                <span className="text-muted-foreground">Search by name or provider</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <code className="bg-muted px-2 py-0.5 rounded">limit</code>
                                                <span className="text-muted-foreground">Number of results (default: 50, max: 100)</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <code className="bg-muted px-2 py-0.5 rounded">offset</code>
                                                <span className="text-muted-foreground">Pagination offset</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">GET</Badge>
                                        <CardTitle className="text-lg font-mono">/models/{'{slug}'}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Get detailed information about a specific model by its slug.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">GET</Badge>
                                        <CardTitle className="text-lg font-mono">/leaderboards/{'{benchmark}'}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-3">
                                        Get model rankings by benchmark score.
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium">Available benchmarks:</span>{' '}
                                        <span className="text-muted-foreground">mmlu, gpqa, hellaswag, humaneval, mmlu_pro, math</span>
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">GET</Badge>
                                        <CardTitle className="text-lg font-mono">/providers</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        List all model providers in the database.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">GET</Badge>
                                        <CardTitle className="text-lg font-mono">/modalities</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        List all available model modalities (text, image, audio, etc.).
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Protected Endpoints */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Code className="w-6 h-6" />
                            Protected Endpoints
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            These endpoints require an API key and have higher rate limits:
                        </p>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">GET</Badge>
                                        <CardTitle className="text-lg font-mono">/v1/models</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Full model list with expanded data. Includes additional fields like price history and market metrics.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">GET</Badge>
                                        <CardTitle className="text-lg font-mono">/v1/compare</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Compare multiple models side by side with benchmark comparisons.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Rate Limits */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-6 h-6" />
                            Rate Limits
                        </h2>
                        <Card>
                            <CardContent className="py-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">Plan</th>
                                                <th className="text-left py-3 px-4">Requests/Month</th>
                                                <th className="text-left py-3 px-4">Rate Limit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-muted-foreground">
                                            <tr className="border-b">
                                                <td className="py-3 px-4">Free</td>
                                                <td className="py-3 px-4">1,000</td>
                                                <td className="py-3 px-4">60 requests/minute</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4">Pro</td>
                                                <td className="py-3 px-4">100,000</td>
                                                <td className="py-3 px-4">600 requests/minute</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4">Enterprise</td>
                                                <td className="py-3 px-4">Unlimited</td>
                                                <td className="py-3 px-4">Custom</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Response Format */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Database className="w-6 h-6" />
                            Response Format
                        </h2>
                        <Card>
                            <CardHeader>
                                <CardTitle>Example Response</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
                                    <code>{`{
  "data": [
    {
      "slug": "gpt-4o",
      "name": "GPT-4o",
      "provider": "OpenAI",
      "contextWindow": 128000,
      "modalities": ["text", "vision", "audio"],
      "benchmarkScores": {
        "mmlu": 88.7,
        "gpqa": 53.6,
        "hellaswag": 95.3
      },
      "pricing": {
        "inputPrice": 0.005,
        "outputPrice": 0.015
      },
      "releaseDate": "2024-05-13"
    }
  ],
  "meta": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "page": 1,
    "pages": 3
  }
}`}</code>
                                </pre>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Pricing */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <CreditCard className="w-6 h-6" />
                            Pricing
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Free</CardTitle>
                                    <div className="text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            1,000 requests/month
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            All public endpoints
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Community support
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-primary">
                                <CardHeader>
                                    <Badge className="w-fit mb-2">Most Popular</Badge>
                                    <CardTitle>Pro</CardTitle>
                                    <div className="text-3xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            100,000 requests/month
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            All endpoints including protected
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Higher rate limits
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Priority support
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Enterprise</CardTitle>
                                    <div className="text-3xl font-bold">Custom</div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Unlimited requests
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Custom rate limits
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Dedicated support
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            SLA guarantee
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* CTA */}
                    <section>
                        <Card className="bg-primary text-primary-foreground">
                            <CardContent className="py-8 text-center">
                                <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
                                <p className="mb-6 opacity-90">
                                    Create your free API key and start building today.
                                </p>
                                <Link href="/signup">
                                    <Button size="lg" variant="secondary" className="gap-2">
                                        Get API Key <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
