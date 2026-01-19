'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cpu, Brain, TrendingUp, Database, Activity, Layers, GitBranch, BarChart3, Zap, X, ChevronRight, Sparkles } from 'lucide-react'

// Quick access items - most important features
const quickAccessItems = [
    { href: '/simulator', label: 'Season Simulator', icon: Zap, color: 'bg-f1-red', desc: 'Run 10K Monte Carlo sims' },
    { href: '/architecture', label: 'Model Architecture', icon: Cpu, color: 'bg-purple-600', desc: 'All 8 ML models' },
    { href: '/explainer', label: 'SHAP Explainer', icon: Brain, color: 'bg-green-600', desc: 'Feature importance' },
    { href: '/ml-analytics', label: 'ML Analytics', icon: TrendingUp, color: 'bg-blue-600', desc: 'Bayesian Elo, drift' },
    { href: '/technical', label: 'Infrastructure', icon: Database, color: 'bg-cyan-600', desc: 'Pipeline, registry' },
    { href: '/monitoring', label: 'Live Monitoring', icon: Activity, color: 'bg-orange-600', desc: 'Real-time metrics' },
    { href: '/ensemble', label: 'Ensemble Stacking', icon: Layers, color: 'bg-pink-600', desc: 'Model pyramid' },
    { href: '/causal', label: 'Causal Inference', icon: GitBranch, color: 'bg-yellow-600', desc: 'What-if analysis' },
]

export default function QuickAccessPanel() {
    const [isOpen, setIsOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    // Show panel after scrolling down a bit
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Don't render on SSR
    if (typeof window === 'undefined') return null

    if (!isVisible && !isOpen) return null

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'bg-f1-gray-800 rotate-45' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-110'
                    }`}
                aria-label="Quick Access"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Sparkles className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel Content */}
                    <div className="fixed bottom-20 right-6 z-50 w-80 bg-f1-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 border-b border-purple-500/20">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                <span className="font-bold text-white">Quick Access</span>
                                <span className="text-xs bg-purple-500/30 px-2 py-0.5 rounded-full text-purple-300">Technical</span>
                            </div>
                            <p className="text-xs text-f1-gray-400 mt-1">Jump to any feature instantly</p>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {quickAccessItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition group border-b border-f1-gray-800"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition`}>
                                        <item.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white truncate">{item.label}</div>
                                        <div className="text-xs text-f1-gray-400 truncate">{item.desc}</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-f1-gray-500 group-hover:text-white group-hover:translate-x-1 transition" />
                                </Link>
                            ))}
                        </div>

                        <div className="p-3 bg-f1-gray-800/50 text-center">
                            <Link
                                href="/docs"
                                className="text-xs text-purple-400 hover:text-purple-300 transition"
                                onClick={() => setIsOpen(false)}
                            >
                                View all documentation →
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
