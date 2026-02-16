import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'ModelGecko - AI Model Rankings & Benchmarks',
    description: 'Track, compare, and discover AI models. Real-time rankings, benchmarks, pricing, and capabilities for LLMs, image, video, audio, and multimodal models.',
    keywords: ['AI models', 'LLM', 'machine learning', 'benchmarks', 'rankings', 'GPT', 'Claude', 'Gemini'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn(
                'min-h-screen bg-background font-sans antialiased',
                inter.className
            )}>
                {children}
            </body>
        </html>
    )
}
