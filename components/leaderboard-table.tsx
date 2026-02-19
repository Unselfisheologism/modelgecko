import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface LeaderboardEntry {
    slug: string
    name: string
    provider: string
    score: number
    rank: number
    modalities?: string[]
}

interface LeaderboardTableProps {
    data: LeaderboardEntry[]
    benchmarkName: string
    showRank?: boolean
}

export function LeaderboardTable({ data, benchmarkName, showRank = true }: LeaderboardTableProps) {
    return (
        <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        {showRank && (
                            <TableHead className="w-16 text-center">Rank</TableHead>
                        )}
                        <TableHead>Model</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead className="text-right">{benchmarkName}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((entry, index) => (
                        <TableRow key={entry.slug} className="group">
                            {showRank && (
                                <TableCell className="text-center font-medium">
                                    {entry.rank || index + 1}
                                </TableCell>
                            )}
                            <TableCell>
                                <Link 
                                    href={`/models/${entry.slug}`}
                                    className="font-medium group-hover:text-primary transition-colors"
                                >
                                    {entry.name}
                                </Link>
                                {entry.modalities && entry.modalities.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {entry.modalities.slice(0, 3).map((m) => (
                                            <Badge key={m} variant="secondary" className="text-xs">
                                                {m}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {entry.provider}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {entry.score.toFixed(1)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {data.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                    No benchmark data available
                </div>
            )}
        </div>
    )
}
