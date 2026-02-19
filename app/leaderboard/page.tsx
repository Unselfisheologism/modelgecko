import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

const benchmarks = [
    { id: 'mmlu', name: 'MMLU', description: 'Massive Multitask Language Understanding' },
    { id: 'mmlu_c0', name: 'MMLU-Pro', description: 'MMLU with more challenging options' },
    { id: 'gpqa', name: 'GPQA', description: 'Graduate-Level Google-Proof Q&A Benchmark' },
    { id: 'hellaswag', name: 'HellaSwag', description: 'Can a Machine Really Finish Your Sentence?' },
    { id: 'humaneval', name: 'HumanEval', description: 'HumanEval: Code Generation Benchmark' },
]

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage({
    searchParams,
}: {
    searchParams: { benchmark?: string }
}) {
    const benchmark = searchParams.benchmark || 'mmlu'

    const models = await prisma.model.findMany({
        where: {
            benchmarkScores: { not: Prisma.JsonNull },
        },
        orderBy: { name: 'asc' },
    })

    const leaderboard = models
        .map((model) => {
            const scores = model.benchmarkScores as Record<string, number> | null
            const score = scores?.[benchmark] || 0
            return { ...model, score }
        })
        .filter((model) => model.score > 0)
        .sort((a, b) => b.score - a.score)

    // Get current benchmark info
    const currentBenchmark = benchmarks.find(b => b.id === benchmark) || benchmarks[0]

    // Get top 3 for each benchmark for "Featured" section
    const featuredModels: Record<string, typeof models> = {}
    benchmarks.forEach(b => {
        const sorted = models
            .map(model => {
                const scores = model.benchmarkScores as Record<string, number> | null
                return { ...model, score: scores?.[b.id] || 0 }
            })
            .filter(m => m.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
        featuredModels[b.id] = sorted
    })

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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Leaderboard</h1>
                        <p className="text-muted-foreground mt-1">
                            Compare AI models across different benchmarks
                        </p>
                    </div>
                </div>

                {/* Featured Top Models */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {featuredModels[benchmark]?.map((model, index) => (
                        <Card key={model.id} className={index === 0 ? 'border-primary' : ''}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">
                                        <Link href={`/models/${model.slug}`} className="hover:underline">
                                            {model.name}
                                        </Link>
                                    </CardTitle>
                                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                                        #{index + 1}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-2">{model.provider}</p>
                                <p className="text-2xl font-bold">
                                    {(model.benchmarkScores as Record<string, number>)?.[benchmark]?.toFixed(1) || 'N/A'}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Benchmark Tabs */}
                <Tabs defaultValue={benchmark} className="mb-8">
                    <TabsList className="w-full justify-start overflow-x-auto">
                        {benchmarks.map((b) => (
                            <TabsTrigger key={b.id} value={b.id} asChild>
                                <Link href={`/leaderboard?benchmark=${b.id}`}>
                                    {b.name}
                                </Link>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {benchmarks.map((b) => (
                        <TabsContent key={b.id} value={b.id} className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{b.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{b.description}</p>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="rounded-lg border bg-card overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-medium w-16">Rank</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Model</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Provider</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Modalities</th>
                                                    <th className="px-4 py-3 text-right text-sm font-medium">{b.name}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaderboard.length > 0 ? (
                                                    leaderboard.map((model, index) => (
                                                        <tr key={model.id} className="border-t">
                                                            <td className="px-4 py-3 text-sm">
                                                                {index === 0 && <span className="text-yellow-500">🥇</span>}
                                                                {index === 1 && <span className="text-gray-400">🥈</span>}
                                                                {index === 2 && <span className="text-orange-400">🥉</span>}
                                                                {index > 2 && index + 1}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-medium">
                                                                <Link href={`/models/${model.slug}`} className="hover:text-primary">
                                                                    {model.name}
                                                                </Link>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-muted-foreground">{model.provider}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {model.modalities.slice(0, 2).map(m => (
                                                                        <Badge key={m} variant="outline" className="text-xs">
                                                                            {m}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-right font-mono font-bold">
                                                                {model.score.toFixed(1)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                                            No benchmark data available
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </main>
        </div>
    )
}
