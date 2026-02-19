import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BenchmarkChart } from '@/components/usage-chart'
import { formatNumber, formatDate } from '@/lib/utils'
import { 
    ArrowLeft, ExternalLink, Calendar, Layers, DollarSign, 
    Zap, Clock, BarChart3, Code, Globe, BookOpen 
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: { slug: string }
}

async function getModel(slug: string) {
    const model = await prisma.model.findUnique({
        where: { slug },
        include: {
            priceHistory: {
                orderBy: { recordedAt: 'desc' },
                take: 30,
            },
            marketMetrics: true,
        },
    })
    return model
}

async function getSimilarModels(provider: string, currentSlug: string) {
    const models = await prisma.model.findMany({
        where: {
            provider,
            slug: { not: currentSlug },
        },
        take: 4,
    })
    return models
}

export default async function ModelDetailPage({ params }: PageProps) {
    const model = await getModel(params.slug)
    
    if (!model) {
        notFound()
    }

    const similarModels = await getSimilarModels(model.provider, model.slug)
    const benchmarkScores = model.benchmarkScores as Record<string, number> | null
    const pricing = model.pricing as Record<string, any> | null
    const links = model.links as Record<string, string> | null

    const benchmarkData = benchmarkScores
        ? Object.entries(benchmarkScores)
            .filter(([, score]) => score > 0)
            .map(([name, score]) => ({
                name: name.toUpperCase().replace(/_/g, ' '),
                score,
            }))
        : []

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            
            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link href="/models" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Models
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{model.name}</h1>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Globe className="w-4 h-4" />
                                    {model.provider}
                                </span>
                                {model.releaseDate && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Released {formatDate(model.releaseDate)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {links?.website && (
                                <a href={links.website} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        Website
                                    </Button>
                                </a>
                            )}
                            {links?.docs && (
                                <a href={links.docs} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Docs
                                    </Button>
                                </a>
                            )}
                            {links?.api && (
                                <a href={links.api} target="_blank" rel="noopener noreferrer">
                                    <Button className="gap-2">
                                        <Code className="w-4 h-4" />
                                        API
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {model.modalities.map((m) => (
                            <Badge key={m} variant="secondary">
                                {m}
                            </Badge>
                        ))}
                        {model.tags?.map((tag) => (
                            <Badge key={tag} variant="outline">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Benchmarks */}
                        {benchmarkData.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        Benchmark Scores
                                    </CardTitle>
                                    <CardDescription>
                                        Performance across various AI benchmarks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <BenchmarkChart data={benchmarkData} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Capabilities */}
                        {model.capabilities.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="w-5 h-5" />
                                        Capabilities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {model.capabilities.map((cap) => (
                                            <Badge key={cap} variant="secondary">
                                                {cap}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Price History */}
                        {model.priceHistory.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        Price History
                                    </CardTitle>
                                    <CardDescription>
                                        Historical pricing data (last 30 days)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Current Input Price</p>
                                                <p className="text-xl font-bold">
                                                    ${model.priceHistory[0]?.inputPrice.toFixed(4) || 'N/A'}/M
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Current Output Price</p>
                                                <p className="text-xl font-bold">
                                                    ${model.priceHistory[0]?.outputPrice.toFixed(4) || 'N/A'}/M
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Specs Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Specifications</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {model.contextWindow && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Layers className="w-4 h-4" />
                                            <span className="text-sm">Context Window</span>
                                        </div>
                                        <span className="font-medium">
                                            {formatNumber(model.contextWindow)} tokens
                                        </span>
                                    </div>
                                )}

                                {pricing?.inputPrice !== undefined && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="text-sm">Input Price</span>
                                        </div>
                                        <span className="font-medium">
                                            ${pricing.inputPrice.toFixed(4)}/M
                                        </span>
                                    </div>
                                )}

                                {pricing?.outputPrice !== undefined && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="text-sm">Output Price</span>
                                        </div>
                                        <span className="font-medium">
                                            ${pricing.outputPrice.toFixed(4)}/M
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">Last Updated</span>
                                    </div>
                                    <span className="font-medium text-sm">
                                        {formatDate(model.lastUpdated)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Market Metrics */}
                        {model.marketMetrics && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Market Metrics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Total Views</span>
                                        <span className="font-medium">
                                            {formatNumber(model.marketMetrics.totalViews)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">API Calls</span>
                                        <span className="font-medium">
                                            {formatNumber(model.marketMetrics.totalApiCalls)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Popularity Score</span>
                                        <span className="font-medium">
                                            {model.marketMetrics.popularity.toFixed(1)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Links */}
                        {links && Object.keys(links).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Links</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {links.website && (
                                        <a 
                                            href={links.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm hover:text-primary"
                                        >
                                            <Globe className="w-4 h-4" />
                                            Official Website
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                    {links.docs && (
                                        <a 
                                            href={links.docs}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm hover:text-primary"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            Documentation
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                    {links.api && (
                                        <a 
                                            href={links.api}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm hover:text-primary"
                                        >
                                            <Code className="w-4 h-4" />
                                            API Reference
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Similar Models */}
                {similarModels.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6">Similar Models from {model.provider}</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarModels.map((similar) => (
                                <Link key={similar.id} href={`/models/${similar.slug}`}>
                                    <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                                        <CardHeader>
                                            <CardTitle className="text-base">{similar.name}</CardTitle>
                                            <CardDescription>{similar.provider}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-1.5">
                                                {similar.modalities.slice(0, 3).map((m) => (
                                                    <Badge key={m} variant="secondary" className="text-xs">
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
                )}
            </main>

            <Footer />
        </div>
    )
}
