'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Save, RefreshCw } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface UserData {
    id: string
    email: string
    name?: string
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null)
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()
    const supabase = createBrowserClient()

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push('/login?redirectTo=/profile')
                return
            }

            setUser({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
            })
            setName(session.user.user_metadata?.name || '')
            setLoading(false)
        }

        init()
    }, [router, supabase])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')

        try {
            const { error } = await supabase.auth.updateUser({
                data: { name },
            })

            if (error) throw error

            setMessage('Profile updated successfully!')
            setUser(prev => prev ? { ...prev, name } : null)
        } catch (error) {
            setMessage('Failed to update profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Account Information
                            </CardTitle>
                            <CardDescription>
                                Update your account details and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">
                                        Display Name
                                    </label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Email cannot be changed. Contact support if needed.
                                    </p>
                                </div>

                                {message && (
                                    <div className={`p-3 rounded-md text-sm ${
                                        message.includes('success') 
                                            ? 'bg-green-500/10 text-green-500' 
                                            : 'bg-destructive/10 text-destructive'
                                    }`}>
                                        {message}
                                    </div>
                                )}

                                <Button type="submit" disabled={saving}>
                                    {saving ? (
                                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Danger Zone</CardTitle>
                            <CardDescription>
                                Irreversible actions for your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive">
                                Delete Account
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    )
}
