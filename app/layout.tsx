import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'ModelGecko - AI Model Rankings & API',
    description: 'Track and compare AI models. Real-time rankings, benchmarks, pricing, and capabilities for LLMs and multimodal models.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={inter.className}>
                    {children}
                </body>
            </html>
        </ClerkProvider>
    )
}
