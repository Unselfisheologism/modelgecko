import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { verifyAdmin } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getModels() {
    const models = await prisma.model.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 50,
    })
    return models
}

export default async function AdminModelsPage() {
    const isAdmin = await verifyAdmin()
    
    if (!isAdmin) {
        redirect('/login?redirectTo=/admin/models')
    }

    const models = await getModels()

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Manage Models</h1>
                        <p className="text-muted-foreground mt-1">
                            Add, edit, and manage AI model data
                        </p>
                    </div>
                    <Link href="/admin/models/new">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Model
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Models ({models.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Modalities</TableHead>
                                    <TableHead>Context</TableHead>
                                    <TableHead>Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {models.map((model) => (
                                    <TableRow key={model.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{model.name}</p>
                                                <p className="text-xs text-muted-foreground">{model.slug}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{model.provider}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {model.modalities.slice(0, 2).map((m) => (
                                                    <Badge key={m} variant="secondary" className="text-xs">
                                                        {m}
                                                    </Badge>
                                                ))}
                                                {model.modalities.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{model.modalities.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {model.contextWindow?.toLocaleString() || '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(model.updatedAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/models/${model.slug}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/models/${model.id}/edit`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" className="text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {models.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                No models found. Add your first model to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
