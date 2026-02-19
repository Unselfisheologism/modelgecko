'use client'

import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'

export function Navigation() {
    const [session, setSession] = useState<{ user: { email: string } } | null>(null)
    const supabase = createBrowserClient()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-bold text-primary">
                        ModelGecko
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/models" className="text-sm font-medium hover:text-primary transition-colors">
                            Models
                        </Link>
                        <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
                            Leaderboard
                        </Link>
                        <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                            Pricing
                        </Link>
                        <Link href="/api-docs" className="text-sm font-medium hover:text-primary transition-colors">
                            API Docs
                        </Link>
                    </nav>
                </div>
                
                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {session.user.email}
                            </span>
                            <Link href="/dashboard">
                                <Button>Dashboard</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                                Sign In
                            </Link>
                            <Link href="/signup">
                                <Button>Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
