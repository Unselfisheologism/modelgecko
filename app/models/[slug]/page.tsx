import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, Cpu, Calendar, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: { slug: string }
}

export default async function ModelDetailPage({ params }: PageProps) {
    const model = await prisma.model.findUnique({
        where: { slug: params.slug },
    })

    if (!model) {
        notFound()
    }

    const pricing = model.pricing as Record<string, number | string> | null
    const benchmarkScores = model.benchmarkScores as Record<string, number> | null
    const links = model.links as Record<string, string> | null

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

            <main className="container mx-auto px-4 py-8">
                <Link href="/models" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Models
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{model.name}</h1>
                                    <p className="text-lg text-muted-foreground">{model.provider}</p>
                                </div>
                                {links?.website && (
                                    <Button variant="outline" asChild>
                                        <a href={links.website} target="_blank" rel="noopener noreferrer">
                                            Website <ExternalLink className="w-4 h-4 ml-2" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {model.modalities.map((modality) => (
                                    <Badge key={modality} variant="secondary">
                                        {modality}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Capabilities */}
                        {model.capabilities && model.capabilities.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Capabilities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="grid md:grid-cols-2 gap-2">
                                        {model.capabilities.map((cap) => (
                                            <li key={cap} className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {cap}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Benchmark Scores */}
                        {benchmarkScores && Object.keys(benchmarkScores).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Benchmark Scores</CardTitle>
                                    <CardDescription>
                                        Performance across various evaluation benchmarks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(benchmarkScores).map(([benchmark, score]) => (
                                            <div key={benchmark} className="p-4 rounded-lg border">
                                                <p className="text-sm text-muted-foreground mb-1 uppercase">
                                                    {benchmark.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {typeof score === 'number' ? score.toFixed(1) : score}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {model.contextWindow && (
                                    <div className="flex items-center gap-3">
                                        <Cpu className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Context Window</p>
                                            <p className="font-medium">{model.contextWindow.toLocaleString()} tokens</p>
                                        </div>
                                    </div>
                                )}
                                {model.releaseDate && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Release Date</p>
                                            <p className="font-medium">
                                                {new Date(model.releaseDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pricing */}
                        {pricing && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        Pricing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {pricing.input !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Input</span>
                                            <span className="font-medium">
                                                ${typeof pricing.input === 'number' ? pricing.input.toFixed(4) : pricing.input}/M tokens
                                            </span>
                                        </div>
                                    )}
                                    {pricing.output !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Output</span>
                                            <span className="font-medium">
                                                ${typeof pricing.output === 'number' ? pricing.output.toFixed(4) : pricing.output}/M tokens
                                            </span>
                                        </div>
                                    )}
                                    {pricing.prompt && (
                                        <p className="text-sm text-muted-foreground pt-2 border-t">
                                            {pricing.prompt}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* API Access */}
                        <Card>
                            <CardHeader>
                                <CardTitle>API Access</CardTitle>
                                <CardDescription>
                                    Access this model via our API
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button asChild className="w-full">
                                    <Link href="/api-docs">
                                        View API Docs
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/dashboard">
                                        Get API Key
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
