import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { SearchInput } from '@/components/search-input'
import { formatNumber } from '@/lib/utils'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 24

export default async function ModelsPage({
    searchParams,
}: {
    searchParams: { 
        provider?: string
        modality?: string
        search?: string
        sortBy?: string
        page?: string
    }
}) {
    const { provider, modality, search, sortBy = 'name', page = '1' } = searchParams
    const currentPage = parseInt(page) || 1
    const offset = (currentPage - 1) * ITEMS_PER_PAGE

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

    // Build orderBy
    let orderBy: any = { name: 'asc' }
    if (sortBy === 'releaseDate_desc') {
        orderBy = { releaseDate: 'desc' }
    } else if (sortBy === 'releaseDate') {
        orderBy = { releaseDate: 'asc' }
    } else if (sortBy === 'contextWindow_desc') {
        orderBy = { contextWindow: 'desc' }
    } else if (sortBy === 'name_desc') {
        orderBy = { name: 'desc' }
    }

    const [models, total] = await Promise.all([
        prisma.model.findMany({
            where,
            orderBy,
            take: ITEMS_PER_PAGE,
            skip: offset,
        }),
        prisma.model.count({ where }),
    ])

    // Get unique providers and modalities for filters
    const allModels = await prisma.model.findMany({
        select: { provider: true, modalities: true },
    })
    const providers = Array.from(new Set(allModels.map((m) => m.provider))).sort()
    const modalities = Array.from(new Set(allModels.flatMap((m) => m.modalities))).sort()

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">AI Models</h1>
                    <p className="text-muted-foreground">
                        Browse and compare {total} AI models from {providers.length} providers
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8 p-4 rounded-lg border bg-card">
                    <div className="flex-1 min-w-[200px]">
                        <form action="/models" method="GET">
                            <input type="hidden" name="provider" value={provider || ''} />
                            <input type="hidden" name="modality" value={modality || ''} />
                            <input type="hidden" name="sortBy" value={sortBy} />
                            <SearchInput 
                                placeholder="Search models..." 
                                defaultValue={search}
                                name="search"
                            />
                        </form>
                    </div>

                    <form action="/models" method="GET" className="flex flex-wrap gap-4">
                        <input type="hidden" name="search" value={search || ''} />
                        <input type="hidden" name="sortBy" value={sortBy} />
                        
                        <select
                            name="provider"
                            className="px-3 py-2 rounded-md border bg-background min-w-[150px]"
                            defaultValue={provider}
                            onChange={(e) => e.target.form?.submit()}
                        >
                            <option value="">All Providers</option>
                            {providers.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>

                        <select
                            name="modality"
                            className="px-3 py-2 rounded-md border bg-background min-w-[150px]"
                            defaultValue={modality}
                            onChange={(e) => e.target.form?.submit()}
                        >
                            <option value="">All Modalities</option>
                            {modalities.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>

                        <select
                            name="sortBy"
                            className="px-3 py-2 rounded-md border bg-background min-w-[150px]"
                            defaultValue={sortBy}
                            onChange={(e) => e.target.form?.submit()}
                        >
                            <option value="name">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                            <option value="releaseDate_desc">Newest First</option>
                            <option value="releaseDate">Oldest First</option>
                            <option value="contextWindow_desc">Largest Context</option>
                        </select>

                        {(provider || modality || search) && (
                            <Link href="/models">
                                <Button variant="ghost" type="button">Clear Filters</Button>
                            </Link>
                        )}
                    </form>
                </div>

                {/* Models Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {models.map((model) => {
                        const pricing = model.pricing as Record<string, any> | null
                        const inputPrice = pricing?.inputPrice ?? pricing?.input
                        
                        return (
                            <Link
                                key={model.id}
                                href={`/models/${model.slug}`}
                                className="block"
                            >
                                <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <CardTitle className="text-base">{model.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{model.provider}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {model.modalities.map((m) => (
                                                <Badge key={m} variant="secondary" className="text-xs">
                                                    {m}
                                                </Badge>
                                            ))}
                                        </div>
                                        
                                        <div className="space-y-1.5 text-sm">
                                            {model.contextWindow && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>Context</span>
                                                    <span className="font-medium text-foreground">
                                                        {formatNumber(model.contextWindow)}
                                                    </span>
                                                </div>
                                            )}
                                            {inputPrice !== undefined && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>Input</span>
                                                    <span className="font-medium text-foreground">
                                                        ${typeof inputPrice === 'number' ? inputPrice.toFixed(4) : inputPrice}/M
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>

                {models.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">No models found matching your criteria.</p>
                        <Link href="/models">
                            <Button variant="outline">Clear Filters</Button>
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {currentPage > 1 && (
                            <Link
                                href={`/models?${new URLSearchParams({
                                    ...(provider && { provider }),
                                    ...(modality && { modality }),
                                    ...(search && { search }),
                                    ...(sortBy && { sortBy }),
                                    page: (currentPage - 1).toString(),
                                }).toString()}`}
                            >
                                <Button variant="outline" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Previous
                                </Button>
                            </Link>
                        )}
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number
                                if (totalPages <= 5) {
                                    pageNum = i + 1
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i
                                } else {
                                    pageNum = currentPage - 2 + i
                                }

                                return (
                                    <Link
                                        key={pageNum}
                                        href={`/models?${new URLSearchParams({
                                            ...(provider && { provider }),
                                            ...(modality && { modality }),
                                            ...(search && { search }),
                                            ...(sortBy && { sortBy }),
                                            page: pageNum.toString(),
                                        }).toString()}`}
                                    >
                                        <Button
                                            variant={currentPage === pageNum ? 'default' : 'outline'}
                                            size="icon"
                                        >
                                            {pageNum}
                                        </Button>
                                    </Link>
                                )
                            })}
                        </div>

                        {currentPage < totalPages && (
                            <Link
                                href={`/models?${new URLSearchParams({
                                    ...(provider && { provider }),
                                    ...(modality && { modality }),
                                    ...(search && { search }),
                                    ...(sortBy && { sortBy }),
                                    page: (currentPage + 1).toString(),
                                }).toString()}`}
                            >
                                <Button variant="outline" className="gap-2">
                                    Next
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
