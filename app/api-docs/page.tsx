import Link from 'next/link'
import { Code, Key, CreditCard, Globe, Zap, Copy, Check } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ApiDocsPage() {
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
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            Dashboard
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-5xl">
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
                        <p className="text-xl text-muted-foreground">
                            Programmatic access to comprehensive AI model data, benchmarks, and rankings.
                        </p>
                    </div>

                    <Tabs defaultValue="overview" className="mb-12">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="models">Models</TabsTrigger>
                            <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
                            <TabsTrigger value="pricing">Pricing</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview">
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-primary" />
                                            Getting Started
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                            <li>Sign up for a free account</li>
                                            <li>Get your API key from the dashboard</li>
                                            <li>Make requests using your API key</li>
                                        </ol>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Key className="w-5 h-5 text-primary" />
                                            Authentication
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">Include your API key in the header:</p>
                                        <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
                                            <code>X-API-KEY: mg_live_xxxxx</code>
                                        </pre>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Base URL</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <code className="text-sm">https://modelgecko.com/api</code>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Models Tab */}
                        <TabsContent value="models">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary">GET</Badge>
                                            <CardTitle className="font-mono text-lg">/models</CardTitle>
                                        </div>
                                        <CardDescription>List all AI models with optional filters</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">Query Parameters:</p>
                                        <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left pb-2 font-medium">Parameter</th>
                                                        <th className="text-left pb-2 font-medium">Type</th>
                                                        <th className="text-left pb-2 font-medium">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b">
                                                        <td className="py-2 font-mono text-primary">provider</td>
                                                        <td className="py-2 text-muted-foreground">string</td>
                                                        <td className="py-2 text-muted-foreground">Filter by provider</td>
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="py-2 font-mono text-primary">modality</td>
                                                        <td className="py-2 text-muted-foreground">string</td>
                                                        <td className="py-2 text-muted-foreground">Filter by modality</td>
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="py-2 font-mono text-primary">search</td>
                                                        <td className="py-2 text-muted-foreground">string</td>
                                                        <td className="py-2 text-muted-foreground">Search by name or provider</td>
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="py-2 font-mono text-primary">limit</td>
                                                        <td className="py-2 text-muted-foreground">number</td>
                                                        <td className="py-2 text-muted-foreground">Results per page (default: 50)</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-2 font-mono text-primary">offset</td>
                                                        <td className="py-2 text-muted-foreground">number</td>
                                                        <td className="py-2 text-muted-foreground">Pagination offset</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-sm text-muted-foreground mt-6 mb-3">Example Request:</p>
                                        <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs">
                                            <code>{`curl -X GET "https://modelgecko.com/api/models?provider=OpenAI&limit=10"`}</code>
                                        </pre>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary">GET</Badge>
                                            <CardTitle className="font-mono text-lg">/models/[slug]</CardTitle>
                                        </div>
                                        <CardDescription>Get detailed information about a specific model</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">Path Parameters:</p>
                                        <div className="bg-muted rounded-lg p-4">
                                            <table className="w-full text-sm">
                                                <tbody>
                                                    <tr className="border-b">
                                                        <td className="py-2 font-mono text-primary">slug</td>
                                                        <td className="py-2 text-muted-foreground">The model slug (e.g., gpt-4o)</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-sm text-muted-foreground mt-6 mb-3">Example Request:</p>
                                        <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs">
                                            <code>{`curl -X GET "https://modelgecko.com/api/models/gpt-4o"`}</code>
                                        </pre>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Leaderboards Tab */}
                        <TabsContent value="leaderboards">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">GET</Badge>
                                        <CardTitle className="font-mono text-lg">/leaderboards/[benchmark]</CardTitle>
                                    </div>
                                    <CardDescription>Get model rankings by benchmark score</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">Path Parameters:</p>
                                    <div className="bg-muted rounded-lg p-4 mb-6">
                                        <table className="w-full text-sm">
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="py-2 font-mono text-primary">benchmark</td>
                                                    <td className="py-2 text-muted-foreground">Benchmark name</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-3">Available Benchmarks:</p>
                                    <div className="grid md:grid-cols-2 gap-3 mb-6">
                                        {['mmlu', 'mmlu_c0', 'gpqa', 'hellaswag', 'humaneval'].map(b => (
                                            <Badge key={b} variant="outline" className="justify-start py-2">
                                                {b}
                                            </Badge>
                                        ))}
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-3">Example Request:</p>
                                    <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs">
                                        <code>{`curl -X GET "https://modelgecko.com/api/leaderboards/mmlu"`}</code>
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Pricing Tab */}
                        <TabsContent value="pricing" id="pricing">
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Free</CardTitle>
                                        <p className="text-3xl font-bold">$0< span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="text-sm text-muted-foreground space-y-2">
                                            <li>• 1,000 credits/month</li>
                                            <li>• Public endpoints</li>
                                            <li>• Community support</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Starter</CardTitle>
                                        <p className="text-3xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="text-sm text-muted-foreground space-y-2">
                                            <li>• 10,000 credits/month</li>
                                            <li>• All endpoints</li>
                                            <li>• Email support</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card className="border-primary">
                                    <CardHeader>
                                        <CardTitle>Pro</CardTitle>
                                        <p className="text-3xl font-bold">$99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="text-sm text-muted-foreground space-y-2">
                                            <li>• 100,000 credits/month</li>
                                            <li>• All endpoints</li>
                                            <li>• Priority support</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Enterprise</CardTitle>
                                        <p className="text-3xl font-bold">$499<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="text-sm text-muted-foreground space-y-2">
                                            <li>• 1M credits/month</li>
                                            <li>• Custom limits</li>
                                            <li>• 24/7 support</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Rate Limits */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
                        <Card>
                            <CardContent className="pt-6">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left pb-3 font-medium">Plan</th>
                                            <th className="text-left pb-3 font-medium">Rate Limit</th>
                                            <th className="text-left pb-3 font-medium">Burst Limit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-3">Free</td>
                                            <td className="py-3">100 requests/minute</td>
                                            <td className="py-3">150 requests</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3">Starter</td>
                                            <td className="py-3">1,000 requests/minute</td>
                                            <td className="py-3">1,500 requests</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3">Pro</td>
                                            <td className="py-3">10,000 requests/minute</td>
                                            <td className="py-3">15,000 requests</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Response Format */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Response Format</h2>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground mb-3">All responses follow this format:</p>
                                <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs">
                                    <code>{`{
  "data": [...],
  "meta": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}`}</code>
                                </pre>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>
        </div>
    )
}
