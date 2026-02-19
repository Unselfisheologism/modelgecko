import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { Download, Info } from 'lucide-react'

export const dynamic = 'force-dynamic'

const benchmarks = [
    { id: 'mmlu', name: 'MMLU', description: 'Massive Multitask Language Understanding - tests knowledge across 57 subjects' },
    { id: 'gpqa', name: 'GPQA', description: 'Graduate-Level Google-Proof Q&A Benchmark' },
    { id: 'hellaswag', name: 'HellaSwag', description: 'Commonsense reasoning benchmark' },
    { id: 'humaneval', name: 'HumanEval', description: 'Code generation benchmark' },
    { id: 'mmlu_pro', name: 'MMLU-Pro', description: 'More challenging version of MMLU' },
    { id: 'math', name: 'MATH', description: 'Mathematical problem solving' },
]

async function getLeaderboardData(benchmark: string) {
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
            return { 
                slug: model.slug,
                name: model.name,
                provider: model.provider,
                score,
                modalities: model.modalities,
            }
        })
        .filter((model) => model.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((model, index) => ({ ...model, rank: index + 1 }))

    return leaderboard
}

export default async function LeaderboardPage({
    searchParams,
}: {
    searchParams: { benchmark?: string }
}) {
    const benchmarkId = searchParams.benchmark || 'mmlu'
    const currentBenchmark = benchmarks.find(b => b.id === benchmarkId) || benchmarks[0]
    
    const leaderboardData = await getLeaderboardData(benchmarkId)

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
                    <p className="text-muted-foreground">
                        Compare AI models across various benchmarks
                    </p>
                </div>

                {/* Benchmark Info */}
                <Card className="mb-8">
                    <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <h3 className="font-medium">{currentBenchmark.name}</h3>
                                <p className="text-sm text-muted-foreground">{currentBenchmark.description}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Benchmark Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {benchmarks.map((b) => (
                        <Link
                            key={b.id}
                            href={`/leaderboard?benchmark=${b.id}`}
                            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                                benchmarkId === b.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border hover:bg-muted'
                            }`}
                        >
                            {b.name}
                        </Link>
                    ))}
                </div>

                {/* Leaderboard */}
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Top Models by {currentBenchmark.name}</CardTitle>
                            <CardDescription>
                                {leaderboardData.length} models with scores
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <LeaderboardTable 
                            data={leaderboardData} 
                            benchmarkName={currentBenchmark.name}
                        />
                    </CardContent>
                </Card>

                {leaderboardData.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No benchmark data available for {currentBenchmark.name}.
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
