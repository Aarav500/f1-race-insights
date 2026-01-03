'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Flag, ChevronDown, ExternalLink } from 'lucide-react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [featuresOpen, setFeaturesOpen] = useState(false)

    // Clean 4-item main nav
    const mainLinks = [
        { href: '/simulator', label: 'Simulator', highlight: true },
        { href: '/championship', label: 'Championship' },
        { href: '/strategy', label: 'Strategy' },
    ]

    // Organized feature categories - now with advanced features
    const featureCategories = [
        {
            title: 'Advanced Analytics',
            links: [
                { href: '/live', label: 'Live Dashboard', icon: '🔴' },
                { href: '/fantasy', label: 'Fantasy F1', icon: '🏆' },
                { href: '/replay', label: 'Race Replay', icon: '⏪' },
                { href: '/uncertainty', label: 'Uncertainty Viz', icon: '📊' },
                { href: '/report', label: 'Race Reports', icon: '📝' },
            ]
        },
        {
            title: 'ML Insights',
            links: [
                { href: '/ml-analytics', label: 'ML Analytics', icon: '🧠' },
                { href: '/driver-compare', label: 'Driver Compare', icon: '👥' },
                { href: '/compare', label: 'Compare Models', icon: '📊' },
                { href: '/explainer', label: 'SHAP Explainer', icon: '🔮' },
            ]
        },
        {
            title: 'Race Intelligence',
            links: [
                { href: '/ticker', label: '2026 Ticker', icon: '⏱️' },
                { href: '/tracks', label: 'Track Profiles', icon: '🏁' },
                { href: '/weather', label: 'Weather Impact', icon: '🌧️' },
                { href: '/share', label: 'Share Cards', icon: '📤' },
            ]
        },
        {
            title: 'Technical',
            links: [
                { href: '/technical', label: 'Infrastructure', icon: '🏗️' },
                { href: '/architecture', label: 'Neural Network', icon: '⚙️' },
                { href: '/playground', label: 'API Playground', icon: '🔧' },
                { href: '/settings', label: 'Settings', icon: '⚙️' },
            ]
        },
    ]

    return (
        <nav className="bg-f1-black text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 font-bold text-lg group">
                        <div className="w-8 h-8 bg-f1-red rounded flex items-center justify-center group-hover:scale-110 transition">
                            <Flag className="w-5 h-5" />
                        </div>
                        <span className="hidden sm:inline">F1 Race Insights</span>
                    </Link>

                    {/* Desktop Navigation - Clean 4 items */}
                    <div className="hidden md:flex items-center space-x-1">
                        {mainLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg font-medium transition ${link.highlight
                                    ? 'bg-f1-red hover:bg-red-700'
                                    : 'hover:bg-white/10'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Features Mega Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setFeaturesOpen(!featuresOpen)}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition font-medium"
                            >
                                Features <ChevronDown className={`w-4 h-4 transition ${featuresOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {featuresOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setFeaturesOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-[600px] bg-white text-f1-black rounded-xl shadow-2xl p-4 z-50 grid grid-cols-2 gap-4">
                                        {featureCategories.map((cat) => (
                                            <div key={cat.title}>
                                                <div className="text-xs font-bold text-f1-gray-500 uppercase tracking-wider mb-2">{cat.title}</div>
                                                <div className="space-y-1">
                                                    {cat.links.map((link) => (
                                                        <Link
                                                            key={link.href}
                                                            href={link.href}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-f1-gray-100 transition text-sm"
                                                            onClick={() => setFeaturesOpen(false)}
                                                        >
                                                            <span>{link.icon}</span>
                                                            <span className="font-medium">{link.label}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* GitHub */}
                        <a
                            href="https://github.com/Aarav500/f1-race-insights"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span className="hidden lg:inline">GitHub</span>
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden pb-4 max-h-[80vh] overflow-y-auto">
                        {mainLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block py-3 px-4 rounded-lg transition ${link.highlight ? 'bg-f1-red' : 'hover:bg-white/10'}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {featureCategories.map((cat) => (
                            <div key={cat.title} className="mt-4">
                                <div className="text-xs text-f1-gray-400 uppercase px-4 mb-1">{cat.title}</div>
                                {cat.links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="block py-2 px-4 hover:bg-white/10 transition"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="mr-2">{link.icon}</span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}
