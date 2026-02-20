import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { verifyAdmin } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getUsers() {
    const users = await prisma.apiUser.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
    })
    return users
}

export default async function AdminUsersPage() {
    const isAdmin = await verifyAdmin()
    
    if (!isAdmin) {
        redirect('/login?redirectTo=/admin/users')
    }

    const users = await getUsers()

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Manage Users</h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage user accounts
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">Total Users</p>
                            <p className="text-2xl font-bold">{users.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">Free Users</p>
                            <p className="text-2xl font-bold">
                                {users.filter(u => u.plan === 'free').length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">Pro Users</p>
                            <p className="text-2xl font-bold">
                                {users.filter(u => u.plan === 'pro').length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">Verified</p>
                            <p className="text-2xl font-bold">
                                {users.filter(u => u.emailVerified).length}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Users ({users.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Credits</TableHead>
                                    <TableHead>API Key</TableHead>
                                    <TableHead>Verified</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{user.email}</p>
                                                {user.name && (
                                                    <p className="text-xs text-muted-foreground">{user.name}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="capitalize">{user.plan}</Badge>
                                        </TableCell>
                                        <TableCell>{user.credits.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {user.unkeyKeyId ? (
                                                <Badge variant="outline">Active</Badge>
                                            ) : (
                                                <Badge variant="secondary">None</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.emailVerified ? (
                                                <Badge variant="outline" className="text-green-500 border-green-500">
                                                    Yes
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">No</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(user.createdAt)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {users.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                No users found.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
