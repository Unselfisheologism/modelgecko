import Link from 'next/link'
import { ArrowRight, BarChart3, Database, Globe, Key, Zap, User, TrendingUp, Shield, Code } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

async function getSession() {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

async function getStats() {
    const [totalModels, totalProviders, modelsWithBenchmarks] = await Promise.all([
        prisma.model.count(),
        prisma.model.groupBy({
            by: ['provider'],
            _count: true,
        }),
        prisma.model.count({
            where: {
                benchmarkScores: { not: Prisma.JsonNull },
            },
        }),
    ])

    return {
        totalModels,
        totalProviders: totalProviders.length,
        modelsWithBenchmarks,
    }
}

export default async function HomePage() {
    const session = await getSession()
    const stats = await getStats()

    // Fetch models for leaderboard
    const models = await prisma.model.findMany({
        where: {
            benchmarkScores: { not: Prisma.JsonNull },
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

    // Fetch trending models
    const trendingModels = await prisma.model.findMany({
        where: {
            marketMetrics: { isNot: null },
        },
        include: {
            marketMetrics: true,
        },
        orderBy: {
            marketMetrics: {
                popularity: 'desc',
            },
        },
        take: 6,
    })

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            
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
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/leaderboard">
                            <Button size="lg" className="gap-2">
                                View Leaderboard <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/api-docs">
                            <Button size="lg" variant="outline" className="gap-2">
                                <Code className="w-4 h-4" />
                                API Documentation
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 border-y bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-primary">{stats.totalModels}+</p>
                            <p className="text-sm text-muted-foreground mt-1">AI Models</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-primary">{stats.totalProviders}+</p>
                            <p className="text-sm text-muted-foreground mt-1">Providers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-primary">{stats.modelsWithBenchmarks}+</p>
                            <p className="text-sm text-muted-foreground mt-1">With Benchmarks</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-primary">10+</p>
                            <p className="text-sm text-muted-foreground mt-1">Benchmarks</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                        Everything you need to evaluate AI models
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card>
                            <CardHeader>
                                <BarChart3 className="w-10 h-10 text-primary mb-4" />
                                <CardTitle>Real-time Rankings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Track model performance across multiple benchmarks including MMLU, GPQA, HumanEval, and more.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Database className="w-10 h-10 text-primary mb-4" />
                                <CardTitle>Comprehensive Data</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Access pricing, context windows, capabilities, and specifications for hundreds of AI models.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Key className="w-10 h-10 text-primary mb-4" />
                                <CardTitle>API Access</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Programmatic access to all model data with usage-based billing and generous free tier.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <TrendingUp className="w-10 h-10 text-primary mb-4" />
                                <CardTitle>Trending Models</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Discover which models are gaining popularity and see market trends over time.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Shield className="w-10 h-10 text-primary mb-4" />
                                <CardTitle>Reliable Data</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Data sourced from official provider announcements and verified benchmark results.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Users className="w-10 h-10 text-primary mb-4" />
                                <CardTitle>Community Driven</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Contribute updates and corrections to help keep the database accurate and up-to-date.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Leaderboard Preview */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">Top Models by MMLU</h2>
                            <p className="text-muted-foreground mt-1">Massive Multitask Language Understanding benchmark</p>
                        </div>
                        <Link href="/leaderboard">
                            <Button variant="outline" className="gap-2">
                                View All <ArrowRight className="w-4 h-4" />
                            </Button>
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
                                    <tr key={model.id} className="border-t hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium">
                                            {index < 3 ? (
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                                    index === 0 ? 'bg-yellow-500 text-yellow-900' :
                                                    index === 1 ? 'bg-gray-300 text-gray-700' :
                                                    'bg-amber-600 text-white'
                                                }`}>
                                                    {index + 1}
                                                </span>
                                            ) : (
                                                index + 1
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">
                                            <Link href={`/models/${model.slug}`} className="hover:text-primary">
                                                {model.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{model.provider}</td>
                                        <td className="px-4 py-3 text-sm text-right font-mono font-bold">{model.score.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Trending Models */}
            {trendingModels.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold">Trending Models</h2>
                                <p className="text-muted-foreground mt-1">Most popular models this week</p>
                            </div>
                            <Link href="/models">
                                <Button variant="outline" className="gap-2">
                                    View All <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trendingModels.map((model) => (
                                <Link key={model.id} href={`/models/${model.slug}`}>
                                    <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{model.name}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">{model.provider}</p>
                                                </div>
                                                <Badge variant="secondary">#{trendingModels.indexOf(model) + 1}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-1.5">
                                                {model.modalities.slice(0, 3).map((m) => (
                                                    <Badge key={m} variant="outline" className="text-xs">
                                                        {m}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* API CTA */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4" />
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Build with our API</h2>
                    <p className="mb-6 max-w-xl mx-auto opacity-90">
                        Get programmatic access to all model data. Free tier includes 1,000 requests/month.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href={session ? "/dashboard" : "/signup"}>
                            <Button size="lg" variant="secondary" className="gap-2">
                                <Key className="w-4 h-4" />
                                {session ? 'Go to Dashboard' : 'Get API Key'}
                            </Button>
                        </Link>
                        <Link href="/api-docs">
                            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10">
                                View Documentation
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
