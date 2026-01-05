'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Flag, ChevronDown, ExternalLink, Cpu, Brain, BarChart3, Activity, Layers, Target, Zap, Database, GitBranch, TrendingUp, Sparkles, HelpCircle, BookOpen } from 'lucide-react'
import LiveIndicator from './LiveIndicator'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [featuresOpen, setFeaturesOpen] = useState(false)
    const [techOpen, setTechOpen] = useState(false)

    // Clean main nav with Technical section - Getting Started FIRST
    const mainLinks = [
        { href: '/getting-started', label: '📚 Getting Started', highlight: true, isNew: true },
        { href: '/live', label: 'Live', highlight: false, hasIndicator: true },
        { href: '/simulator', label: 'Simulator', highlight: true },
        { href: '/championship', label: 'Championship' },
    ]

    // Technical/ML Features - NOW PROMINENT
    const technicalLinks = [
        { href: '/architecture', label: 'Model Architecture', desc: 'All 8 ML models', icon: Cpu, color: 'text-purple-400' },
        { href: '/ml-analytics', label: 'ML Analytics', desc: 'Bayesian Elo, drift', icon: TrendingUp, color: 'text-blue-400' },
        { href: '/technical', label: 'Infrastructure', desc: 'Pipeline, registry', icon: Database, color: 'text-green-400' },
        { href: '/ensemble', label: 'Ensemble Stacking', desc: 'Model pyramid', icon: Layers, color: 'text-pink-400' },
        { href: '/monitoring', label: 'Live Monitoring', desc: 'Real-time metrics', icon: Activity, color: 'text-orange-400' },
        { href: '/causal', label: 'Causal Inference', desc: 'What-if analysis', icon: GitBranch, color: 'text-yellow-400' },
        { href: '/explainer', label: 'SHAP Explainer', desc: 'Feature importance', icon: Brain, color: 'text-red-400' },
        { href: '/backtest', label: 'Backtest Results', desc: 'Historical accuracy', icon: BarChart3, color: 'text-cyan-400' },
    ]

    // Organized feature categories
    const featureCategories = [
        {
            title: 'Race Engineering',
            links: [
                { href: '/strategy', label: 'Pit Strategy', icon: '⏱️' },
                { href: '/undercut', label: 'Undercut Calculator', icon: '🔧' },
                { href: '/tire-deg', label: 'Tire Degradation', icon: '🛞' },
                { href: '/safety-car', label: 'Safety Car Model', icon: '🚗' },
                { href: '/gap-predictor', label: 'Gap Evolution', icon: '📈' },
                { href: '/fuel-optimizer', label: 'Fuel Optimizer', icon: '⛽' },
            ]
        },
        {
            title: 'Driver Analysis',
            links: [
                { href: '/driver-dna', label: 'Driver DNA Profile', icon: '🧬' },
                { href: '/quali-predictor', label: 'Quali Predictor', icon: '🏁' },
                { href: '/sector-analysis', label: 'Sector Analysis', icon: '🗺️' },
                { href: '/race-vs-quali', label: 'Race vs Quali', icon: '📊' },
                { href: '/head-to-head', label: 'Head to Head', icon: '⚔️' },
                { href: '/compare', label: 'Driver Compare', icon: '🔄' },
            ]
        },
        {
            title: 'Simulation',
            links: [
                { href: '/simulator', label: 'Season Simulator', icon: '🎮' },
                { href: '/counterfactual', label: 'What-If Lab', icon: '🔀' },
                { href: '/bayesian', label: 'Bayesian Engine', icon: '🧠' },
                { href: '/rl-strategy', label: 'RL Strategy Agent', icon: '🤖' },
                { href: '/strategy-chat', label: 'AI Strategy Chat', icon: '💬' },
            ]
        },
        {
            title: 'Data & Tracks',
            links: [
                { href: '/telemetry', label: 'Live Telemetry', icon: '📡' },
                { href: '/tracks', label: 'Track Profiles', icon: '🏟️' },
                { href: '/constructors', label: 'Constructors', icon: '🏭' },
                { href: '/fantasy', label: 'Fantasy F1', icon: '🏆' },
                { href: '/replay', label: 'Race Replay', icon: '⏪' },
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

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        <LiveIndicator />
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

                        {/* TECHNICAL MEGA MENU - NOW PROMINENT */}
                        <div className="relative">
                            <button
                                onClick={() => { setTechOpen(!techOpen); setFeaturesOpen(false) }}
                                className={`flex items-center gap-1 px-4 py-2 rounded-lg transition font-medium ${techOpen ? 'bg-purple-600' : 'bg-purple-600/20 hover:bg-purple-600/40'}`}
                            >
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                Technical
                                <ChevronDown className={`w-4 h-4 transition ${techOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {techOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setTechOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-[500px] bg-gradient-to-br from-f1-gray-900 to-f1-black text-white rounded-xl shadow-2xl p-4 z-50 border border-purple-500/30">
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-500/20">
                                            <Sparkles className="w-5 h-5 text-yellow-400" />
                                            <span className="font-bold text-lg">Technical Features</span>
                                            <span className="text-xs bg-purple-500/30 px-2 py-0.5 rounded-full text-purple-300">Beyond F1 Tools</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {technicalLinks.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/10 transition group"
                                                    onClick={() => setTechOpen(false)}
                                                >
                                                    <link.icon className={`w-5 h-5 ${link.color} mt-0.5 group-hover:scale-110 transition`} />
                                                    <div>
                                                        <div className="font-medium">{link.label}</div>
                                                        <div className="text-xs text-f1-gray-400">{link.desc}</div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Features Mega Menu */}
                        <div className="relative">
                            <button
                                onClick={() => { setFeaturesOpen(!featuresOpen); setTechOpen(false) }}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition font-medium"
                            >
                                Features <ChevronDown className={`w-4 h-4 transition ${featuresOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {featuresOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setFeaturesOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-[650px] bg-white text-f1-black rounded-xl shadow-2xl p-4 z-50 grid grid-cols-2 gap-4">
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

                        {/* Mobile Technical Section - Prominent */}
                        <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                <span className="font-bold text-purple-300">Technical Features</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {technicalLinks.slice(0, 6).map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-2 py-2 px-2 rounded hover:bg-white/10 transition text-sm"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <link.icon className={`w-4 h-4 ${link.color}`} />
                                        <span className="truncate">{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

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
