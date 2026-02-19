import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            }>
                <SignUp 
                    appearance={{
                        elements: {
                            rootBox: {
                                width: '100%',
                                maxWidth: '400px',
                            },
                        },
                    }}
                    redirectUrl="/dashboard"
                />
            </Suspense>
        </div>
    )
}
