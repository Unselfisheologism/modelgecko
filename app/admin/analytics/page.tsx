import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatNumber } from '@/lib/utils'
import { verifyAdmin } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { TrendingUp, Users, Database, Activity, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAnalytics() {
    const [
        totalModels,
        totalProviders,
        totalUsers,
        totalApiCalls,
        recentSearches,
        popularProviders,
    ] = await Promise.all([
        prisma.model.count(),
        prisma.model.groupBy({
            by: ['provider'],
            _count: true,
        }),
        prisma.apiUser.count(),
        prisma.usageLog.count(),
        prisma.searchAnalytics.findMany({
            orderBy: { timestamp: 'desc' },
            take: 10,
        }),
        prisma.model.groupBy({
            by: ['provider'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
        }),
    ])

    return {
        totalModels,
        totalProviders: totalProviders.length,
        totalUsers,
        totalApiCalls,
        recentSearches,
        popularProviders,
    }
}

export default async function AdminAnalyticsPage() {
    const isAdmin = await verifyAdmin()
    
    if (!isAdmin) {
        redirect('/login?redirectTo=/admin/analytics')
    }

    const analytics = await getAnalytics()

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Overview of platform metrics and usage
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Models</p>
                                    <p className="text-2xl font-bold">{formatNumber(analytics.totalModels)}</p>
                                </div>
                                <Database className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Providers</p>
                                    <p className="text-2xl font-bold">{analytics.totalProviders}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <p className="text-2xl font-bold">{formatNumber(analytics.totalUsers)}</p>
                                </div>
                                <Users className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">API Calls</p>
                                    <p className="text-2xl font-bold">{formatNumber(analytics.totalApiCalls)}</p>
                                </div>
                                <Activity className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Popular Providers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Models by Provider
                            </CardTitle>
                            <CardDescription>
                                Distribution of models across providers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analytics.popularProviders.map((provider) => (
                                    <div key={provider.provider} className="flex items-center justify-between">
                                        <span className="font-medium">{provider.provider}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{
                                                        width: `${(provider._count.id / analytics.totalModels) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm text-muted-foreground w-12 text-right">
                                                {provider._count.id}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Searches */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Recent Searches
                            </CardTitle>
                            <CardDescription>
                                What users are searching for
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analytics.recentSearches.length > 0 ? (
                                    analytics.recentSearches.map((search) => (
                                        <div key={search.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                            <code className="text-sm">{search.query}</code>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{search.results} results</span>
                                                <span>{formatDate(search.timestamp)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">
                                        No recent searches
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
