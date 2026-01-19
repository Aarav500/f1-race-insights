'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Trophy, TrendingUp, Target, Zap, Flag, AlertTriangle, Calendar } from 'lucide-react'

// 2025 Final Constructor Data
const CONSTRUCTORS_2025 = [
    {
        id: 'mclaren',
        name: 'McLaren',
        color: '#FF8700',
        points: 756,
        wins: 12,
        podiums: 32,
        drivers: ['Norris 🏆', 'Piastri'],
        budget: 145,
        improvement: '+14%',
        trend: 'up',
        champProb: 100,
    },
    {
        id: 'ferrari',
        name: 'Ferrari',
        color: '#DC0000',
        points: 654,
        wins: 8,
        podiums: 28,
        drivers: ['Leclerc', 'Sainz'],
        budget: 145,
        improvement: '+5%',
        trend: 'up',
        champProb: 0,
    },
    {
        id: 'redbull',
        name: 'Red Bull Racing',
        color: '#1E41FF',
        points: 567,
        wins: 6,
        podiums: 20,
        drivers: ['Verstappen', 'Perez'],
        budget: 145,
        improvement: '-15%',
        trend: 'down',
        champProb: 0,
    },
    {
        id: 'mercedes',
        name: 'Mercedes',
        color: '#00D2BE',
        points: 479,
        wins: 3,
        podiums: 14,
        drivers: ['Hamilton', 'Russell'],
        budget: 145,
        improvement: '+8%',
        trend: 'up',
        champProb: 0,
    },
    {
        id: 'astonmartin',
        name: 'Aston Martin',
        color: '#006F62',
        points: 112,
        wins: 0,
        podiums: 2,
        drivers: ['Alonso', 'Stroll'],
        budget: 140,
        improvement: '-42%',
        trend: 'down',
        champProb: 0,
    },
]

// 2026 Constructor Projections (New Regulations)
const CONSTRUCTORS_2026 = [
    {
        id: 'mclaren',
        name: 'McLaren',
        color: '#FF8700',
        points: 0,
        wins: 0,
        podiums: 0,
        drivers: ['Norris 🏆', 'Piastri'],
        budget: 140,
        improvement: 'Defending',
        trend: 'up',
        champProb: 28,
    },
    {
        id: 'ferrari',
        name: 'Ferrari',
        color: '#DC0000',
        points: 0,
        wins: 0,
        podiums: 0,
        drivers: ['Hamilton 🆕', 'Leclerc'],
        budget: 140,
        improvement: 'HAM arrival',
        trend: 'up',
        champProb: 26,
    },
    {
        id: 'redbull',
        name: 'Red Bull Racing',
        color: '#1E41FF',
        points: 0,
        wins: 0,
        podiums: 0,
        drivers: ['Verstappen', 'Lawson'],
        budget: 140,
        improvement: 'Rebuild',
        trend: 'up',
        champProb: 22,
    },
    {
        id: 'mercedes',
        name: 'Mercedes',
        color: '#00D2BE',
        points: 0,
        wins: 0,
        podiums: 0,
        drivers: ['Russell', 'Antonelli 🆕'],
        budget: 140,
        improvement: 'Russell #1',
        trend: 'up',
        champProb: 18,
    },
    {
        id: 'williams',
        name: 'Williams',
        color: '#005AFF',
        points: 0,
        wins: 0,
        podiums: 0,
        drivers: ['Sainz 🆕', 'Albon'],
        budget: 135,
        improvement: 'SAI boost',
        trend: 'up',
        champProb: 3,
    },
    {
        id: 'astonmartin',
        name: 'Aston Martin',
        color: '#006F62',
        points: 0,
        wins: 0,
        podiums: 0,
        drivers: ['Alonso', 'Stroll'],
        budget: 140,
        improvement: 'New regs hope',
        trend: 'up',
        champProb: 2,
    },
]

export default function ConstructorsPage() {
    const [season, setSeason] = useState<'2025' | '2026'>('2025')
    const [selectedTeam, setSelectedTeam] = useState('mclaren')

    const constructors = season === '2025' ? CONSTRUCTORS_2025 : CONSTRUCTORS_2026
    const team = constructors.find(c => c.id === selectedTeam) || constructors[0]
    const maxPoints = Math.max(...constructors.map(c => c.points), 1)

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Building2 className="w-10 h-10 text-f1-red" />
                    Constructor Battle
                </h1>
                <p className="text-f1-gray-600">
                    Team championship analysis, driver lineups, and performance trends
                </p>
            </div>

            {/* Season Toggle */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-lg border border-f1-gray-300 overflow-hidden">
                    <button
                        onClick={() => setSeason('2025')}
                        className={`px-6 py-2 font-medium transition ${season === '2025' ? 'bg-orange-500 text-white' : 'bg-white'}`}
                    >
                        2025 Final Results
                    </button>
                    <button
                        onClick={() => setSeason('2026')}
                        className={`px-6 py-2 font-medium transition ${season === '2026' ? 'bg-orange-500 text-white' : 'bg-white'}`}
                    >
                        2026 Projections ⚠️
                    </button>
                </div>
            </div>

            {/* 2026 Warning */}
            {season === '2026' && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-8">
                    <div className="flex gap-3 items-start">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-yellow-800">⚠️ 2026 New Regulations - Major Changes</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                Key 2026 driver moves: <strong>Hamilton → Ferrari</strong>, <strong>Sainz → Williams</strong>,
                                <strong> Antonelli → Mercedes</strong>. Championship projections account for regulation changes
                                but carry high uncertainty.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Championship Standings */}
            <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
                <div className="p-4 bg-f1-gray-100 border-b font-bold text-xl flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {season} Constructors&apos; Championship {season === '2025' && '🏆'}
                </div>
                <div className="divide-y">
                    {constructors.map((constructor, i) => (
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
                                <div className="font-bold">{constructor.name} {constructor.champProb === 100 && '🏆'}</div>
                                <div className="text-sm text-f1-gray-500">{constructor.drivers.join(' • ')}</div>
                            </div>
                            <div className="w-48">
                                <div className="h-4 bg-f1-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: season === '2025'
                                                ? `${(constructor.points / maxPoints) * 100}%`
                                                : `${constructor.champProb * 2}%`,
                                            backgroundColor: constructor.color
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="w-20 text-right font-mono font-bold text-xl">
                                {season === '2025' ? constructor.points : `${constructor.champProb}%`}
                            </div>
                            <div className={`w-20 text-right font-bold ${constructor.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
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

            {/* Championship Probability */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    {season} Championship Probability
                </h3>
                <div className="space-y-4">
                    {constructors.slice(0, 4).map(c => (
                        <div key={c.id} className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: c.color }} />
                            <div className="w-28 font-bold">{c.name}</div>
                            <div className="flex-1">
                                <div className="h-6 bg-f1-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${c.champProb}%`,
                                            backgroundColor: c.color
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={`w-16 text-right font-bold ${c.champProb >= 50 ? 'text-green-600' : ''}`}>
                                {c.champProb}%
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-xs text-f1-gray-500">
                    {season === '2025'
                        ? 'Final 2025 results - McLaren secured their first title since 1998'
                        : 'Based on 10,000 Monte Carlo simulations including regulation uncertainty'
                    }
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
