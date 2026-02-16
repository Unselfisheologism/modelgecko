import Link from 'next/link'
import { Code, Key, CreditCard, Globe, Zap } from 'lucide-react'

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
                <div className="max-w-4xl">
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
                        <p className="text-xl text-muted-foreground">
                            Programmatic access to comprehensive AI model data, benchmarks, and rankings.
                        </p>
                    </div>

                    {/* Getting Started */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-6 h-6" />
                            Getting Started
                        </h2>
                        <div className="p-6 rounded-lg border bg-card">
                            <p className="mb-4">To get started with the ModelGecko API:</p>
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                <li>Sign up for a free account</li>
                                <li>Get your API key from the dashboard</li>
                                <li>Make requests using your API key</li>
                            </ol>
                        </div>
                    </section>

                    {/* Authentication */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Key className="w-6 h-6" />
                            Authentication
                        </h2>
                        <div className="p-6 rounded-lg border bg-card">
                            <p className="mb-4">Include your API key in the request header:</p>
                            <pre className="p-4 bg-muted rounded-md overflow-x-auto">
                                <code>X-API-KEY: your_api_key_here</code>
                            </pre>
                        </div>
                    </section>

                    {/* Public Endpoints */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Globe className="w-6 h-6" />
                            Public Endpoints
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            These endpoints are available without authentication (rate limited):
                        </p>

                        <div className="space-y-4">
                            <div className="p-4 rounded-lg border">
                                <h3 className="font-mono text-sm font-bold mb-2">GET /api/models</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    List all AI models with optional filters.
                                </p>
                                <p className="text-sm text-muted-foreground">Query parameters:</p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    <li><code>provider</code> - Filter by provider (e.g., "OpenAI", "Anthropic")</li>
                                    <li><code>modality</code> - Filter by modality (e.g., "text", "image")</li>
                                    <li><code>search</code> - Search by name or provider</li>
                                    <li><code>limit</code> - Number of results (default: 50)</li>
                                    <li><code>offset</code> - Pagination offset</li>
                                </ul>
                            </div>

                            <div className="p-4 rounded-lg border">
                                <h3 className="font-mono text-sm font-bold mb-2">GET /api/models/[slug]</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Get detailed information about a specific model.
                                </p>
                            </div>

                            <div className="p-4 rounded-lg border">
                                <h3 className="font-mono text-sm font-bold mb-2">GET /api/leaderboards/[benchmark]</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Get model rankings by benchmark score.
                                </p>
                                <p className="text-sm text-muted-foreground">Available benchmarks: mmlu, gpqa, hellaswag, humaneval</p>
                            </div>

                            <div className="p-4 rounded-lg border">
                                <h3 className="font-mono text-sm font-bold mb-2">GET /api/providers</h3>
                                <p className="text-sm text-muted-foreground">
                                    List all model providers.
                                </p>
                            </div>

                            <div className="p-4 rounded-lg border">
                                <h3 className="font-mono text-sm font-bold mb-2">GET /api/modalities</h3>
                                <p className="text-sm text-muted-foreground">
                                    List all model modalities.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Protected Endpoints */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Code className="w-6 h-6" />
                            Protected Endpoints
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            These endpoints require an API key (higher rate limits):
                        </p>

                        <div className="space-y-4">
                            <div className="p-4 rounded-lg border">
                                <h3 className="font-mono text-sm font-bold mb-2">GET /api/v1/models</h3>
                                <p className="text-sm text-muted-foreground">
                                    Full model list with expanded data (same params as public).
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <CreditCard className="w-6 h-6" />
                            Pricing
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-lg border">
                                <h3 className="font-semibold mb-2">Free</h3>
                                <p className="text-3xl font-bold mb-4">$0</p>
                                <ul className="text-sm text-muted-foreground space-y-2">
                                    <li>• 1,000 requests/month</li>
                                    <li>• All public endpoints</li>
                                    <li>• Community support</li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-lg border border-primary">
                                <h3 className="font-semibold mb-2">Pro</h3>
                                <p className="text-3xl font-bold mb-4">$29/mo</p>
                                <ul className="text-sm text-muted-foreground space-y-2">
                                    <li>• 100,000 requests/month</li>
                                    <li>• All endpoints</li>
                                    <li>• Higher rate limits</li>
                                    <li>• Priority support</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Example */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Example Request</h2>
                        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
                            <code>{`curl -X GET "https://modelgecko.com/api/models?provider=OpenAI" \\
  -H "X-API-KEY: your_api_key"

Response:
{
  "data": [
    {
      "slug": "gpt-4o",
      "name": "GPT-4o",
      "provider": "OpenAI",
      "contextWindow": 128000,
      "modalities": ["text", "vision", "audio"],
      "benchmarkScores": {
        "mmlu": 88.7
      },
      "pricing": {
        "input": 0.005,
        "output": 0.015
      }
    }
  ],
  "meta": {
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}`}</code>
                        </pre>
                    </section>
                </div>
            </main>
        </div>
    )
}
