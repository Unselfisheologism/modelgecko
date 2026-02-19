'use client'

import { AlertCircle, Database, RefreshCw } from 'lucide-react'

export function DatabaseUnavailable() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-2xl font-semibold">Database Unavailable</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        We can't connect to the database right now.
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Common causes:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• The database is paused due to inactivity</li>
                                <li>• The connection credentials have changed</li>
                                <li>• The database service is temporarily unavailable</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-2">To fix this:</p>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Check your Supabase dashboard</li>
                            <li>Ensure the database is active and not paused</li>
                            <li>Verify DATABASE_URL in your .env file</li>
                            <li>Redeploy to Vercel with updated credentials</li>
                        </ol>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </button>

                <p className="text-xs text-center text-muted-foreground">
                    If the problem persists, please contact support.
                </p>
            </div>
        </div>
    )
}