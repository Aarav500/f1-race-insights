import Link from 'next/link'
import { Github } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-f1-gray-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">F1 Race Insights</h3>
                        <p className="text-f1-gray-400">
                            Predictive modeling and analysis for Formula 1 race outcomes using machine learning.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-f1-gray-400 hover:text-white transition">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/race-explorer" className="text-f1-gray-400 hover:text-white transition">
                                    Race Explorer
                                </Link>
                            </li>
                            <li>
                                <Link href="/backtest" className="text-f1-gray-400 hover:text-white transition">
                                    Backtest Results
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs" className="text-f1-gray-400 hover:text-white transition">
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="http://localhost:8000/docs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-f1-gray-400 hover:text-white transition"
                                >
                                    API Documentation
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/Aarav500/f1-race-insights"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-f1-gray-400 hover:text-white transition flex items-center gap-2"
                                >
                                    <Github className="w-4 h-4" />
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-f1-gray-700 mt-8 pt-6 text-center text-f1-gray-400">
                    <p>&copy; {currentYear} F1 Race Insights. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
