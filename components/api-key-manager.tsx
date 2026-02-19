'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Key, Copy, Eye, EyeOff, RefreshCw, Trash2 } from 'lucide-react'

interface ApiKeyManagerProps {
    initialKeyData?: {
        keyId: string
        key?: string
        credits: number
        usage: {
            total: number
            remaining: number
            limit: number
        }
        plan: string
    }
}

export function ApiKeyManager({ initialKeyData }: ApiKeyManagerProps) {
    const [keyData, setKeyData] = useState(initialKeyData)
    const [showKey, setShowKey] = useState(false)
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleCreateKey = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: 'free' }),
            })

            if (response.ok) {
                const data = await response.json()
                setKeyData(data)
            }
        } catch (error) {
            console.error('Error creating API key:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRevokeKey = async () => {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
            return
        }
        
        setLoading(true)
        try {
            const response = await fetch('/api/keys', {
                method: 'DELETE',
            })

            if (response.ok) {
                setKeyData(undefined)
            }
        } catch (error) {
            console.error('Error revoking API key:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        if (keyData?.key) {
            navigator.clipboard.writeText(keyData.key)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (!keyData?.key) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No API Key</h3>
                    <p className="text-muted-foreground mb-6">
                        Get started by creating your first API key.
                    </p>
                    <Button onClick={handleCreateKey} disabled={loading}>
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                        Create API Key
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5" />
                            API Key
                        </CardTitle>
                        <CardDescription>
                            Use this key to authenticate API requests
                        </CardDescription>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm bg-secondary capitalize">
                        {keyData.plan}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-muted rounded-md font-mono text-sm overflow-x-auto">
                        {showKey ? keyData.key : '•'.repeat(24)}
                    </code>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowKey(!showKey)}
                    >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopy}
                    >
                        {copied ? '✓' : <Copy className="w-4 h-4" />}
                    </Button>
                </div>

                <p className="text-sm text-destructive">
                    Make sure to copy your API key now. You won&apos;t be able to see it again!
                </p>

                <div className="flex items-center gap-2 pt-4">
                    <Button variant="outline" onClick={handleRevokeKey} disabled={loading}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Revoke Key
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
