'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Flag, ChevronDown } from 'lucide-react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [moreOpen, setMoreOpen] = useState(false)

    const mainLinks = [
        { href: '/', label: 'Home' },
        { href: '/compare', label: 'Compare' },
        { href: '/whatif', label: 'What-If' },
        { href: '/backtest', label: 'Backtest' },
    ]

    const moreLinks = [
        { href: '/head-to-head', label: 'Head-to-Head', icon: '👥' },
        { href: '/explainer', label: 'SHAP Explainer', icon: '🧠' },
        { href: '/championship', label: 'Championship', icon: '🏆' },
        { href: '/ticker', label: 'Race Ticker', icon: '⏱️' },
        { href: '/career', label: 'Career Timeline', icon: '📈' },
        { href: '/tracks', label: 'Track Profiles', icon: '🏁' },
        { href: '/weather', label: 'Weather Impact', icon: '🌧️' },
        { href: '/strategy', label: 'Pit Strategy', icon: '⛽' },
        { href: '/simulator', label: 'Season Simulator', icon: '🎲' },
        { href: '/qualifying', label: 'Qualifying', icon: '⚡' },
        { href: '/constructors', label: 'Constructors', icon: '🏢' },
        { href: '/dashboard', label: 'Live Dashboard', icon: '📡' },
        { href: '/training', label: 'Training Viz', icon: '📉' },
        { href: '/abtesting', label: 'A/B Testing', icon: '🔬' },
        { href: '/architecture', label: 'Architecture', icon: '🏗️' },
        { href: '/playground', label: 'API Playground', icon: '🔧' },
        { href: '/history', label: 'Accuracy', icon: '📊' },
        { href: '/export', label: 'PDF Export', icon: '📄' },
        { href: '/2026', label: '2026 Regs', icon: '🚀' },
        { href: '/docs', label: 'Docs', icon: '📚' },
    ]

    return (
        <nav className="bg-f1-black text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
                        <Flag className="w-6 h-6 text-f1-red" />
                        <span>F1 Insights</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {mainLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="hover:text-f1-red transition"
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* More Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setMoreOpen(!moreOpen)}
                                className="flex items-center gap-1 hover:text-f1-red transition"
                            >
                                More <ChevronDown className={`w-4 h-4 transition ${moreOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {moreOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white text-f1-black rounded-lg shadow-lg py-2 z-50"
                                    onMouseLeave={() => setMoreOpen(false)}
                                >
                                    {moreLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="block px-4 py-2 hover:bg-f1-gray-100 transition"
                                            onClick={() => setMoreOpen(false)}
                                        >
                                            <span className="mr-2">{link.icon}</span>
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden pb-4">
                        {mainLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block py-2 hover:text-f1-red transition"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="border-t border-f1-gray-700 my-2" />
                        {moreLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block py-2 hover:text-f1-red transition"
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="mr-2">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}

