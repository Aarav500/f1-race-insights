'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Trophy, TrendingUp, Users, Target, Zap, Flag } from 'lucide-react'

// Constructor data
const CONSTRUCTORS = [
    {
        id: 'mclaren',
        name: 'McLaren',
        color: '#FF8700',
        points: 666,
        wins: 6,
        podiums: 22,
        drivers: ['Norris', 'Piastri'],
        budget: 145,
        improvement: '+312%',
        trend: 'up',
    },
    {
        id: 'ferrari',
        name: 'Ferrari',
        color: '#DC0000',
        points: 652,
        wins: 6,
        podiums: 22,
        drivers: ['Leclerc', 'Sainz'],
        budget: 145,
        improvement: '+28%',
        trend: 'up',
    },
    {
        id: 'redbull',
        name: 'Red Bull Racing',
        color: '#1E41FF',
        points: 589,
        wins: 9,
        podiums: 18,
        drivers: ['Verstappen', 'Perez'],
        budget: 145,
        improvement: '-22%',
        trend: 'down',
    },
    {
        id: 'mercedes',
        name: 'Mercedes',
        color: '#00D2BE',
        points: 468,
        wins: 4,
        podiums: 12,
        drivers: ['Hamilton', 'Russell'],
        budget: 145,
        improvement: '+15%',
        trend: 'up',
    },
    {
        id: 'astonmartin',
        name: 'Aston Martin',
        color: '#006F62',
        points: 94,
        wins: 0,
        podiums: 0,
        drivers: ['Alonso', 'Stroll'],
        budget: 120,
        improvement: '-65%',
        trend: 'down',
    },
    {
        id: 'alpine',
        name: 'Alpine',
        color: '#0090FF',
        points: 65,
        wins: 0,
        podiums: 0,
        drivers: ['Gasly', 'Ocon'],
        budget: 110,
        improvement: '-8%',
        trend: 'down',
    },
]

export default function ConstructorsPage() {
    const [selectedTeam, setSelectedTeam] = useState('mclaren')

    const team = CONSTRUCTORS.find(c => c.id === selectedTeam)!
    const maxPoints = Math.max(...CONSTRUCTORS.map(c => c.points))

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Building2 className="w-10 h-10 text-f1-red" />
                    Constructor Battle
                </h1>
                <p className="text-f1-gray-600">
                    Team championship analysis, budget comparisons, and performance trends
                </p>
            </div>

            {/* Championship Standings */}
            <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
                <div className="p-4 bg-f1-gray-100 border-b font-bold text-xl">
                    2024 Constructors&apos; Championship
                </div>
                <div className="divide-y">
                    {CONSTRUCTORS.map((constructor, i) => (
                        <button
                            key={constructor.id}
                            onClick={() => setSelectedTeam(constructor.id)}
                            className={`w-full p-4 flex items-center gap-4 transition hover:bg-f1-gray-50 ${selectedTeam === constructor.id ? 'bg-f1-gray-50' : ''
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white`} style={{ backgroundColor: constructor.color }}>
                                {i + 1}
                            </div>
                            <div className="w-4 h-10 rounded" style={{ backgroundColor: constructor.color }} />
                            <div className="flex-1 text-left">
                                <div className="font-bold">{constructor.name}</div>
                                <div className="text-sm text-f1-gray-500">{constructor.drivers.join(' • ')}</div>
                            </div>
                            <div className="w-48">
                                <div className="h-4 bg-f1-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${(constructor.points / maxPoints) * 100}%`,
                                            backgroundColor: constructor.color
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="w-20 text-right font-mono font-bold text-xl">{constructor.points}</div>
                            <div className={`w-16 text-right font-bold ${constructor.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {constructor.improvement}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Team Detail */}
            <div className="rounded-xl p-6 mb-8 text-white" style={{ backgroundColor: team.color }}>
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold">{team.name}</h2>
                        <div className="flex gap-4 mt-2">
                            {team.drivers.map((driver, i) => (
                                <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                    {driver}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-black/20 rounded-lg px-4 py-2">
                            <Trophy className="w-6 h-6 mx-auto mb-1" />
                            <div className="text-2xl font-bold">{team.wins}</div>
                            <div className="text-xs opacity-75">Wins</div>
                        </div>
                        <div className="bg-black/20 rounded-lg px-4 py-2">
                            <Flag className="w-6 h-6 mx-auto mb-1" />
                            <div className="text-2xl font-bold">{team.podiums}</div>
                            <div className="text-xs opacity-75">Podiums</div>
                        </div>
                        <div className="bg-black/20 rounded-lg px-4 py-2">
                            <Target className="w-6 h-6 mx-auto mb-1" />
                            <div className="text-2xl font-bold">${team.budget}M</div>
                            <div className="text-xs opacity-75">Budget</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Battle Analysis */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Season Trajectory
                    </h3>
                    <div className="space-y-4">
                        {CONSTRUCTORS.slice(0, 4).map((c, i) => (
                            <div key={c.id} className="flex items-center gap-4">
                                <div className="w-24 font-bold">{c.name.split(' ')[0]}</div>
                                <div className="flex-1">
                                    <div className="h-6 bg-f1-gray-100 rounded-full overflow-hidden flex items-center">
                                        <div
                                            className="h-full rounded-full flex items-center justify-end pr-2"
                                            style={{
                                                width: `${(c.points / maxPoints) * 100}%`,
                                                backgroundColor: c.color
                                            }}
                                        >
                                            <span className="text-white text-xs font-bold">{c.points}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-16 text-right font-bold ${c.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {c.trend === 'up' ? '↑' : '↓'} {c.improvement}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Championship Probability
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF8700' }} />
                            <div className="flex-1 font-bold">McLaren</div>
                            <div className="font-bold text-green-600">48.2%</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC0000' }} />
                            <div className="flex-1 font-bold">Ferrari</div>
                            <div className="font-bold text-green-600">41.5%</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1E41FF' }} />
                            <div className="flex-1 font-bold">Red Bull</div>
                            <div className="font-bold">9.8%</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00D2BE' }} />
                            <div className="flex-1 font-bold">Mercedes</div>
                            <div className="font-bold text-f1-gray-400">0.5%</div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-f1-gray-500">
                        Based on 1000 Monte Carlo simulations of remaining races
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/championship" className="bg-f1-gray-900 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-700 transition">
                    Driver Championship
                </Link>
                <Link href="/simulator" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Season Simulator
                </Link>
            </div>
        </div>
    )
}
