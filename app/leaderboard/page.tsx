import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

const benchmarks = [
    { id: 'mmlu', name: 'MMLU', description: 'Massive Multitask Language Understanding' },
    { id: 'gpqa', name: 'GPQA', description: 'Graduate-Level Google-Proof Q&A Benchmark' },
    { id: 'hellaswag', name: 'HellaSwag', description: 'HellaSwag: Can a Machine Really Finish Your Sentence?' },
    { id: 'humaneval', name: 'HumanEval', description: 'HumanEval: Code Generation Benchmark' },
]

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage({
    searchParams,
}: {
    searchParams: { benchmark?: string }
}) {
    const benchmark = searchParams.benchmark || 'mmlu'

    let models: any[] = []
    let leaderboard: any[] = []

    try {
        models = await prisma.model.findMany({
            where: {
                benchmarkScores: { not: Prisma.JsonNull },
            },
            orderBy: { name: 'asc' },
        })

        leaderboard = models
            .map((model) => {
                const scores = model.benchmarkScores as Record<string, number> | null
                const score = scores?.[benchmark] || 0
                return { ...model, score }
            })
            .filter((model) => model.score > 0)
            .sort((a, b) => b.score - a.score)
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        leaderboard = []
    }

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
                <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

                {/* Benchmark Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto">
                    {benchmarks.map((b) => (
                        <Link
                            key={b.id}
                            href={`/leaderboard?benchmark=${b.id}`}
                            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${benchmark === b.id
                                ? 'bg-primary text-primary-foreground'
                                : 'border hover:bg-muted'
                                }`}
                        >
                            {b.name}
                        </Link>
                    ))}
                </div>

                <div className="rounded-lg border bg-card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Model</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Provider</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">
                                    {benchmarks.find((b) => b.id === benchmark)?.name}
                                </th>
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

                {leaderboard.length === 0 && (
                    <p className="text-center text-muted-foreground py-12">
                        No benchmark data available for this metric.
                    </p>
                )}
            </main>
        </div>
    )
}
