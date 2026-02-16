import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/search-input'

export default async function ModelsPage({
    searchParams,
}: {
    searchParams: { provider?: string; modality?: string; search?: string }
}) {
    const { provider, modality, search } = searchParams

    const where: any = {}

    if (provider) {
        where.provider = provider
    }

    if (modality) {
        where.modalities = { has: modality }
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { provider: { contains: search, mode: 'insensitive' } },
        ]
    }

    const models = await prisma.model.findMany({
        where,
        orderBy: { name: 'asc' },
    })

    // Get unique providers and modalities for filters
    const allModels = await prisma.model.findMany()
    const providers = Array.from(new Set(allModels.map((m) => m.provider))).sort()
    const modalities = Array.from(new Set(allModels.flatMap((m) => m.modalities))).sort()

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
                    <h1 className="text-3xl font-bold">AI Models</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <SearchInput placeholder="Search models..." defaultValue={search} />

                    <select
                        className="px-3 py-2 rounded-md border bg-background"
                        defaultValue={provider}
                        onChange={(e) => {
                            const url = new URL(window.location.href)
                            if (e.target.value) {
                                url.searchParams.set('provider', e.target.value)
                            } else {
                                url.searchParams.delete('provider')
                            }
                            window.location.href = url.toString()
                        }}
                    >
                        <option value="">All Providers</option>
                        {providers.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>

                    <select
                        className="px-3 py-2 rounded-md border bg-background"
                        defaultValue={modality}
                        onChange={(e) => {
                            const url = new URL(window.location.href)
                            if (e.target.value) {
                                url.searchParams.set('modality', e.target.value)
                            } else {
                                url.searchParams.delete('modality')
                            }
                            window.location.href = url.toString()
                        }}
                    >
                        <option value="">All Modalities</option>
                        {modalities.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Models Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {models.map((model) => (
                        <Link
                            key={model.id}
                            href={`/models/${model.slug}`}
                            className="block p-6 rounded-lg border bg-card hover:border-primary transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-lg">{model.name}</h3>
                                <span className="text-sm text-muted-foreground">{model.provider}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {model.modalities.map((m) => (
                                    <Badge key={m} variant="secondary">
                                        {m}
                                    </Badge>
                                ))}
                            </div>
                            {model.contextWindow && (
                                <p className="text-sm text-muted-foreground">
                                    Context: {model.contextWindow.toLocaleString()} tokens
                                </p>
                            )}
                            {model.pricing && (
                                <p className="text-sm text-muted-foreground">
                                    Input: ${(model.pricing as any).input}/M tokens
                                </p>
                            )}
                        </Link>
                    ))}
                </div>

                {models.length === 0 && (
                    <p className="text-center text-muted-foreground py-12">
                        No models found matching your criteria.
                    </p>
                )}
            </main>
        </div>
    )
}
