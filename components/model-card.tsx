import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface Model {
    slug: string
    name: string
    provider: string
    contextWindow?: number | null
    modalities: string[]
    benchmarkScores?: Record<string, number> | null
    pricing?: Record<string, any> | null
    releaseDate?: Date | string | null
}

interface ModelCardProps {
    model: Model
    showBenchmark?: boolean
    benchmarkKey?: string
}

export function ModelCard({ model, showBenchmark = false, benchmarkKey = 'mmlu' }: ModelCardProps) {
    const benchmarkScore = model.benchmarkScores?.[benchmarkKey]
    const inputPrice = model.pricing?.inputPrice ?? model.pricing?.input
    const outputPrice = model.pricing?.outputPrice ?? model.pricing?.output

    return (
        <Link href={`/models/${model.slug}`}>
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-lg">{model.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{model.provider}</p>
                        </div>
                        {benchmarkScore !== undefined && benchmarkScore > 0 && (
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                    {benchmarkScore.toFixed(1)}
                                </p>
                                <p className="text-xs text-muted-foreground uppercase">{benchmarkKey}</p>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {model.modalities.map((m) => (
                            <Badge key={m} variant="secondary" className="text-xs">
                                {m}
                            </Badge>
                        ))}
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                        {model.contextWindow && (
                            <div className="flex justify-between">
                                <span>Context</span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(model.contextWindow)} tokens
                                </span>
                            </div>
                        )}

                        {inputPrice !== undefined && (
                            <div className="flex justify-between">
                                <span>Input</span>
                                <span className="font-medium text-foreground">
                                    ${typeof inputPrice === 'number' ? inputPrice.toFixed(4) : inputPrice}/M
                                </span>
                            </div>
                        )}

                        {outputPrice !== undefined && (
                            <div className="flex justify-between">
                                <span>Output</span>
                                <span className="font-medium text-foreground">
                                    ${typeof outputPrice === 'number' ? outputPrice.toFixed(4) : outputPrice}/M
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
