import Link from 'next/link'
import { Globe, Github, Twitter } from 'lucide-react'

export function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Globe className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-lg">ModelGecko</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Real-time rankings, benchmarks, pricing, and capabilities for AI models.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/models" className="hover:text-foreground transition-colors">
                                    All Models
                                </Link>
                            </li>
                            <li>
                                <Link href="/leaderboard" className="hover:text-foreground transition-colors">
                                    Leaderboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="hover:text-foreground transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/api-docs" className="hover:text-foreground transition-colors">
                                    API Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/api-docs#getting-started" className="hover:text-foreground transition-colors">
                                    Getting Started
                                </Link>
                            </li>
                            <li>
                                <Link href="/api-docs#authentication" className="hover:text-foreground transition-colors">
                                    Authentication
                                </Link>
                            </li>
                            <li>
                                <Link href="/api-docs#endpoints" className="hover:text-foreground transition-colors">
                                    API Endpoints
                                </Link>
                            </li>
                            <li>
                                <a href="https://github.com" className="hover:text-foreground transition-colors flex items-center gap-2">
                                    <Github className="w-4 h-4" />
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/about" className="hover:text-foreground transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} ModelGecko. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="https://twitter.com" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
