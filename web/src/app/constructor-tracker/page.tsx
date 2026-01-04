'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building, TrendingUp, TrendingDown, Package, Calendar, BarChart3 } from 'lucide-react'

const CONSTRUCTORS = [
    {
        id: 'redbull',
        name: 'Red Bull Racing',
        color: '#1E41FF',
        points2024: 860,
        points2025: 245,
        upgrades: [
            { date: 'Pre-season', name: 'RB21 Launch', impact: 'Base package', points: 0 },
            { date: 'Bahrain', name: 'Floor edge update', impact: '+0.2s', points: 40 },
            { date: 'Japan', name: 'New rear wing', impact: '+0.1s', points: 35 },
            { date: 'Miami', name: 'Sidepod rework', impact: '+0.15s', points: 45 },
        ]
    },
    {
        id: 'mclaren',
        name: 'McLaren',
        color: '#FF8700',
        points2024: 666,
        points2025: 280,
        upgrades: [
            { date: 'Pre-season', name: 'MCL39 Launch', impact: 'Base package', points: 0 },
            { date: 'Australia', name: 'Major floor update', impact: '+0.3s', points: 50 },
            { date: 'Imola', name: 'Front wing revision', impact: '+0.1s', points: 38 },
            { date: 'Spain', name: 'Cooling upgrades', impact: '+0.05s', points: 42 },
        ]
    },
    {
        id: 'ferrari',
        name: 'Scuderia Ferrari',
        color: '#DC0000',
        points2024: 652,
        points2025: 220,
        upgrades: [
            { date: 'Pre-season', name: 'SF-25 Launch', impact: 'Base package', points: 0 },
            { date: 'Bahrain', name: 'Beam wing tweak', impact: '+0.1s', points: 35 },
            { date: 'Monaco', name: 'Low-speed aero', impact: '+0.2s', points: 43 },
            { date: 'Barcelona', name: 'Major update', impact: '+0.25s', points: 48 },
        ]
    },
    {
        id: 'mercedes',
        name: 'Mercedes-AMG',
        color: '#00D2BE',
        points2024: 468,
        points2025: 165,
        upgrades: [
            { date: 'Pre-season', name: 'W16 Launch', impact: 'Base package', points: 0 },
            { date: 'Australia', name: 'Floor concept B', impact: '+0.15s', points: 30 },
            { date: 'Miami', name: 'Sidepod inlet', impact: '+0.1s', points: 28 },
        ]
    },
    {
        id: 'astonmartin',
        name: 'Aston Martin',
        color: '#006F62',
        points2024: 94,
        points2025: 85,
        upgrades: [
            { date: 'Pre-season', name: 'AMR25 Launch', impact: 'Base package', points: 0 },
            { date: 'China', name: 'Floor edge fins', impact: '+0.1s', points: 18 },
        ]
    },
    {
        id: 'williams',
        name: 'Williams Racing',
        color: '#005AFF',
        points2024: 17,
        points2025: 42,
        upgrades: [
            { date: 'Pre-season', name: 'FW47 Launch', impact: 'Base package', points: 0 },
            { date: 'Bahrain', name: 'Bargeboard update', impact: '+0.1s', points: 8 },
            { date: 'Miami', name: 'Floor upgrade', impact: '+0.2s', points: 15 },
        ]
    },
]

export default function ConstructorTrackerPage() {
    const [selectedTeam, setSelectedTeam] = useState(CONSTRUCTORS[0])
    const [season, setSeason] = useState<'2024' | '2025'>('2025')

    const sortedTeams = [...CONSTRUCTORS].sort((a, b) =>
        season === '2025' ? b.points2025 - a.points2025 : b.points2024 - a.points2024
    )

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-600 to-zinc-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Building className="w-8 h-8" />
                        Constructor Development Tracker
                    </h1>
                    <p className="text-white/80 mt-1">Track upgrades • Performance impact • Points correlation</p>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Season Toggle */}
                <div className="flex justify-center mb-6">
                    <div className="bg-f1-gray-800 rounded-full p-1 flex gap-1">
                        <button
                            onClick={() => setSeason('2024')}
                            className={`px-6 py-2 rounded-full font-bold transition ${season === '2024' ? 'bg-f1-red text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            2024 Season
                        </button>
                        <button
                            onClick={() => setSeason('2025')}
                            className={`px-6 py-2 rounded-full font-bold transition ${season === '2025' ? 'bg-f1-red text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            2025 Season
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Standings */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-f1-red" />
                            Constructor Standings
                        </h2>
                        <div className="space-y-2">
                            {sortedTeams.map((team, idx) => {
                                const points = season === '2025' ? team.points2025 : team.points2024
                                const maxPoints = season === '2025' ? sortedTeams[0].points2025 : sortedTeams[0].points2024
                                return (
                                    <button
                                        key={team.id}
                                        onClick={() => setSelectedTeam(team)}
                                        className={`w-full p-3 rounded-lg flex items-center gap-3 transition ${selectedTeam.id === team.id
                                                ? 'bg-f1-gray-600 ring-2 ring-white/50'
                                                : 'bg-f1-gray-700 hover:bg-f1-gray-600'
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: team.color }}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-white font-medium text-sm">{team.name}</div>
                                            <div className="h-1.5 bg-f1-gray-500 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${(points / maxPoints) * 100}%`, backgroundColor: team.color }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-white font-bold">{points}</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Team Details */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Team Header */}
                        <div
                            className="rounded-xl p-6 border-l-4"
                            style={{ backgroundColor: `${selectedTeam.color}20`, borderLeftColor: selectedTeam.color }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedTeam.name}</h2>
                                    <div className="text-gray-400 mt-1">{season} Season Performance</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-white">
                                        {season === '2025' ? selectedTeam.points2025 : selectedTeam.points2024}
                                    </div>
                                    <div className="text-sm text-gray-400">Points</div>
                                </div>
                            </div>

                            {/* Season Comparison */}
                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {selectedTeam.points2025 > selectedTeam.points2024 * 0.4 ? (
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <TrendingDown className="w-5 h-5 text-red-400" />
                                    )}
                                    <span className="text-gray-400">
                                        vs 2024: {selectedTeam.points2024} pts final
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Upgrades Timeline */}
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-green-400" />
                                Development Timeline
                            </h3>
                            <div className="space-y-4">
                                {selectedTeam.upgrades.map((upgrade, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-20 text-right">
                                            <div className="text-sm text-gray-400">{upgrade.date}</div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTeam.color }} />
                                            {idx < selectedTeam.upgrades.length - 1 && (
                                                <div className="w-0.5 h-full bg-f1-gray-600 my-1" />
                                            )}
                                        </div>
                                        <div className="flex-1 bg-f1-gray-700 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-white font-bold">{upgrade.name}</div>
                                                    <div className="text-sm text-gray-400">{upgrade.impact}</div>
                                                </div>
                                                {upgrade.points > 0 && (
                                                    <div className="text-green-400 font-bold">+{upgrade.points} pts</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upgrade Stats */}
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Upgrade Statistics</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-f1-gray-700 rounded-lg p-4">
                                    <div className="text-3xl font-bold text-white">{selectedTeam.upgrades.length - 1}</div>
                                    <div className="text-sm text-gray-400">Major Updates</div>
                                </div>
                                <div className="bg-f1-gray-700 rounded-lg p-4">
                                    <div className="text-3xl font-bold text-green-400">
                                        +{selectedTeam.upgrades.filter(u => u.impact.includes('+')).reduce((sum, u) => {
                                            const match = u.impact.match(/\+(\d+\.?\d*)/);
                                            return sum + (match ? parseFloat(match[1]) : 0);
                                        }, 0).toFixed(2)}s
                                    </div>
                                    <div className="text-sm text-gray-400">Total Gain</div>
                                </div>
                                <div className="bg-f1-gray-700 rounded-lg p-4">
                                    <div className="text-3xl font-bold text-yellow-400">
                                        {selectedTeam.upgrades.reduce((sum, u) => sum + u.points, 0)}
                                    </div>
                                    <div className="text-sm text-gray-400">Points Post-Upgrade</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-gray-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
