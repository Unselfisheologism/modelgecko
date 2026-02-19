'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface UsageChartProps {
    data: {
        date: string
        requests: number
    }[]
    type?: 'bar' | 'line'
}

export function UsageChart({ data, type = 'bar' }: UsageChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No usage data available
            </div>
        )
    }

    if (type === 'line') {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                        dataKey="date" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem'
                        }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="requests" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                    }}
                />
                <Bar 
                    dataKey="requests" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

interface BenchmarkChartProps {
    data: {
        name: string
        score: number
    }[]
}

export function BenchmarkChart({ data }: BenchmarkChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No benchmark data available
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={80}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                    }}
                />
                <Bar 
                    dataKey="score" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
