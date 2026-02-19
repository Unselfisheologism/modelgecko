import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          ModelGecko
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/models" className="text-sm font-medium hover:text-primary">
            Models
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium hover:text-primary">
            Leaderboard
          </Link>
          <Link href="/api-docs" className="text-sm font-medium hover:text-primary">
            API
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm font-medium hover:text-primary"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
