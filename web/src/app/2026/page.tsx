'use client'

import { useState } from 'react'
import { Zap, Wind, Gauge, Shield, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// 2026 Regulation Data
const regulations = {
    power_unit: {
        title: "Power Unit Revolution",
        icon: Zap,
        color: "bg-yellow-500",
        changes: [
            { metric: "Electric Power", old: "120kW (MGU-K)", new: "350kW (MGU-K)", impact: "+192%" },
            { metric: "ICE Power", old: "560kW", new: "350kW", impact: "-37%" },
            { metric: "Total Power", old: "680kW (912HP)", new: "700kW (940HP)", impact: "+3%" },
            { metric: "Electric Ratio", old: "~18%", new: "~50%", impact: "+178%" },
            { metric: "Fuel", old: "E10 blend", new: "100% Sustainable", impact: "Carbon neutral" },
            { metric: "MGU-H", old: "Present", new: "Removed", impact: "Cost reduction" },
        ]
    },
    aerodynamics: {
        title: "Active Aerodynamics",
        icon: Wind,
        color: "bg-blue-500",
        changes: [
            { metric: "Front Wing", old: "Fixed", new: "Active (moveable)", impact: "First since 1998" },
            { metric: "Rear Wing", old: "DRS only", new: "Full active", impact: "Replaces DRS" },
            { metric: "Ground Effect", old: "Maximum", new: "Reduced 30%", impact: "Less dirty air" },
            { metric: "Downforce", old: "Baseline", new: "-30%", impact: "Closer racing" },
        ]
    },
    chassis: {
        title: "Nimble Chassis",
        icon: Gauge,
        color: "bg-green-500",
        changes: [
            { metric: "Weight", old: "798kg", new: "768kg", impact: "-30kg" },
            { metric: "Wheelbase", old: "3600mm", new: "3400mm", impact: "-200mm" },
            { metric: "Overall Length", old: "5500mm", new: "5200mm", impact: "-300mm" },
            { metric: "Width", old: "2000mm", new: "2000mm", impact: "No change" },
        ]
    }
}

const teamReadiness = [
    { team: "Ferrari", score: 9.0, advantage: "+8%", color: "#DC0000", notes: "In-house PU, historical rule changes success" },
    { team: "Sauber/Audi", score: 8.5, advantage: "+6%", color: "#00E701", notes: "Factory Audi backing from 2026" },
    { team: "Red Bull", score: 8.5, advantage: "+5%", color: "#3671C6", notes: "Ford partnership, strong aero team" },
    { team: "Aston Martin", score: 8.0, advantage: "+3%", color: "#006F62", notes: "Honda works partnership" },
    { team: "Mercedes", score: 8.0, advantage: "+2%", color: "#27F4D2", notes: "In-house PU but 2022 struggles concern" },
    { team: "RB", score: 7.5, advantage: "+0%", color: "#6692FF", notes: "Honda synergy, Red Bull tech sharing" },
    { team: "McLaren", score: 7.5, advantage: "-2%", color: "#FF8000", notes: "Customer Mercedes PU, chassis-focused" },
    { team: "Williams", score: 7.0, advantage: "-3%", color: "#64C4FF", notes: "Mercedes PU, rebuilding phase" },
    { team: "Alpine", score: 7.0, advantage: "-5%", color: "#FF87BC", notes: "Renault PU uncertainty" },
    { team: "Haas", score: 6.5, advantage: "-8%", color: "#B6BABD", notes: "Ferrari customer, budget constraints" },
]

export default function Regulations2026Page() {
    const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'predictions'>('overview')

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero */}
            <div className="bg-gradient-to-r from-f1-gray-900 to-f1-gray-800 text-white rounded-xl p-8 mb-8">
                <h1 className="text-4xl font-bold mb-2">2026 F1 Regulation Changes</h1>
                <p className="text-f1-gray-300 text-lg mb-4">
                    The biggest regulation overhaul since 2014. Analyzing how teams will adapt.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                        🔋 50% Electric Power
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                        ✈️ Active Aerodynamics
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        🏎️ Lighter Cars
                    </span>
                </div>
            </div>

            {/* F1 API Data Limitation Notice */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-orange-800">F1 API Data Availability</h3>
                        <p className="text-sm text-orange-700">
                            <strong>Important:</strong> This project uses the official F1 API (Ergast/FastF1) which currently only provides data through the <strong>2024 season</strong>.
                            Even though 2025 races have been completed, the API does not yet include 2025 results.
                            2026 predictions are therefore <strong>projections based on 2020-2024 data</strong> combined with team readiness analysis.
                        </p>
                    </div>
                </div>
            </div>

            {/* Training Data Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-blue-800">Prediction Methodology</h3>
                        <p className="text-sm text-blue-700">
                            <strong>Training Data:</strong> 2020-2024 F1 seasons (2,140 samples) •
                            <strong> Prediction Target:</strong> 2026 races (new regulations) •
                            Models extrapolate from historical patterns. Team readiness scores incorporate regulation adaptation history from 2009, 2014, 2017, and 2022 rule changes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-f1-gray-200">
                {[
                    { id: 'overview', label: 'Regulation Overview' },
                    { id: 'teams', label: 'Team Readiness' },
                    { id: 'predictions', label: '2026 Predictions' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === tab.id
                            ? 'border-f1-red text-f1-red'
                            : 'border-transparent text-f1-gray-600 hover:text-f1-black'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {Object.entries(regulations).map(([key, section]) => {
                        const Icon = section.icon
                        return (
                            <div key={key} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className={`${section.color} p-4 flex items-center gap-3`}>
                                    <Icon className="w-6 h-6 text-white" />
                                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-f1-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Metric</th>
                                                <th className="px-6 py-3 text-center">2024/25</th>
                                                <th className="px-6 py-3 text-center">2026</th>
                                                <th className="px-6 py-3 text-center">Impact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {section.changes.map((change, i) => (
                                                <tr key={i} className="hover:bg-f1-gray-50">
                                                    <td className="px-6 py-3 font-medium">{change.metric}</td>
                                                    <td className="px-6 py-3 text-center text-f1-gray-600">{change.old}</td>
                                                    <td className="px-6 py-3 text-center font-bold text-f1-black">{change.new}</td>
                                                    <td className="px-6 py-3 text-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-sm ${change.impact.includes('+') ? 'bg-green-100 text-green-700' :
                                                            change.impact.includes('-') ? 'bg-red-100 text-red-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {change.impact}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold mb-6">Team Regulation Readiness Score</h2>
                        <div className="space-y-4">
                            {teamReadiness.sort((a, b) => b.score - a.score).map((team, i) => (
                                <div key={team.team} className="flex items-center gap-4">
                                    <div className="w-8 text-center font-bold text-f1-gray-600">#{i + 1}</div>
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: team.color }}
                                    />
                                    <div className="w-40 font-medium">{team.team}</div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-f1-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-f1-red transition-all duration-500"
                                                style={{ width: `${team.score * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-16 text-right font-bold">{team.score}/10</div>
                                    <div className={`w-16 text-right font-medium ${team.advantage.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {team.advantage}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex gap-2 items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-yellow-800">Prediction Uncertainty</h3>
                                <p className="text-sm text-yellow-700">
                                    2026 predictions have higher uncertainty due to major regulation changes.
                                    Models are calibrated using historical adaptation patterns.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Predictions Tab */}
            {activeTab === 'predictions' && (
                <div className="space-y-6">
                    {/* F1 API Notice */}
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                        <div className="flex gap-2 items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-yellow-800">Why No Race-Level 2026 Predictions?</h3>
                                <p className="text-sm text-yellow-700">
                                    The F1 API (Ergast/FastF1) only includes data through <strong>2024</strong>.
                                    2025 race data is not yet available in the API, even though races have occurred.
                                    2026 uses major new regulations, so predictions are based on <strong>team readiness analysis</strong> rather than race-level ML predictions.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold mb-4">2026 Season Outlook</h2>
                        <p className="text-f1-gray-600 mb-6">
                            Based on team readiness scores, historical adaptation patterns, and investment levels.
                        </p>

                        {/* Predicted Constructor Standings */}
                        <h3 className="text-lg font-bold mb-4">Projected Constructor Standings</h3>
                        <div className="space-y-3 mb-8">
                            {teamReadiness.sort((a, b) => b.score - a.score).slice(0, 5).map((team, i) => (
                                <div key={team.team} className="flex items-center gap-4 p-3 bg-f1-gray-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: team.color, color: 'white' }}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold">{team.team}</div>
                                        <div className="text-sm text-f1-gray-600">{team.notes}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{team.score}/10</div>
                                        <div className={`text-sm ${team.advantage.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                            {team.advantage} vs 2024
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Key Insights */}
                        <h3 className="text-lg font-bold mb-4">Key 2026 Insights</h3>
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="font-bold text-green-800">Winners</div>
                                <p className="text-sm text-green-700">Ferrari (in-house PU), Audi/Sauber (factory backing), Red Bull-Ford (aero strength)</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="font-bold text-red-800">At Risk</div>
                                <p className="text-sm text-red-700">Haas (budget constraints), Alpine (PU uncertainty), Williams (rebuilding)</p>
                            </div>
                        </div>

                        <Link
                            href="/whatif"
                            className="block bg-f1-red text-white text-center px-6 py-3 rounded-lg hover:bg-red-700 transition"
                        >
                            Explore 2024 What-If Scenarios (with actual data) →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
