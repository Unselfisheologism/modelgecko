import Link from 'next/link'
import { ArrowRight, BarChart3, Database, Globe, Key, Zap } from 'lucide-react'
import { prisma } from '@/lib/db'

export default async function HomePage() {
    // Fetch models for leaderboard
    const models = await prisma.model.findMany({
        where: {
            benchmarkScores: { not: null },
        },
        orderBy: { name: 'asc' },
        take: 10,
    })

    // Sort by MMLU score as default
    const leaderboard = models
        .map((model) => {
            const scores = model.benchmarkScores as Record<string, number> | null
            const score = scores?.mmlu || scores?.mmlu_c0 || 0
            return { ...model, score }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)

    return (
        <div className="min-h-screen">
            {/* Header */}
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

            {/* Hero */}
            <section className="py-20 bg-gradient-to-b from-background to-muted/30">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Track & Compare
                        <span className="text-primary block">AI Models</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Real-time rankings, benchmarks, pricing, and capabilities for LLMs, image, video,
                        audio, and multimodal AI models.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/leaderboard"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            View Leaderboard <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/api-docs"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-md hover:bg-muted"
                        >
                            API Documentation
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-lg border bg-card">
                            <BarChart3 className="w-10 h-10 text-primary mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Real-time Rankings</h3>
                            <p className="text-muted-foreground">
                                Track model performance across multiple benchmarks including MMLU, GPQA, HumanEval, and more.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg border bg-card">
                            <Database className="w-10 h-10 text-primary mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Comprehensive Data</h3>
                            <p className="text-muted-foreground">
                                Access pricing, context windows, capabilities, and specifications for hundreds of AI models.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg border bg-card">
                            <Key className="w-10 h-10 text-primary mb-4" />
                            <h3 className="text-lg font-semibold mb-2">API Access</h3>
                            <p className="text-muted-foreground">
                                Programmatic access to all model data with usage-based billing and generous free tier.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leaderboard Preview */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Top Models by MMLU</h2>
                        <Link
                            href="/leaderboard"
                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="rounded-lg border bg-card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Model</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Provider</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">MMLU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((model, index) => (
                                    <tr key={model.id} className="border-t">
                                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium">
                                            <Link href={`/models/${model.slug}`} className="hover:text-primary">
                                                {model.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{model.provider}</td>
                                        <td className="px-4 py-3 text-sm text-right font-mono">{model.score.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Get API Access</h2>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                        Build AI-powered applications with our comprehensive model data API.
                        Free tier includes 1,000 requests/month.
                    </p>
                    <Link
                        href="/api-docs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        <Zap className="w-4 h-4" />
                        Start Building
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-8">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        <span className="font-semibold">ModelGecko</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} ModelGecko. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}
