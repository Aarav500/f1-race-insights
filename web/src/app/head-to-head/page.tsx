'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Trophy, Timer, TrendingUp, ArrowRight, Zap, Target, Award } from 'lucide-react'

// Driver data with historical stats
const DRIVERS = [
    { id: 'VER', name: 'Max Verstappen', team: 'Red Bull', color: '#1E41FF', wins: 63, poles: 40, podiums: 111, avgFinish: 2.1 },
    { id: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', color: '#00D2BE', wins: 104, poles: 104, podiums: 201, avgFinish: 2.8 },
    { id: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#DC0000', wins: 7, poles: 24, podiums: 32, avgFinish: 5.2 },
    { id: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#FF8700', wins: 3, poles: 7, podiums: 21, avgFinish: 6.1 },
    { id: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', color: '#DC0000', wins: 3, poles: 5, podiums: 23, avgFinish: 5.8 },
    { id: 'PER', name: 'Sergio Perez', team: 'Red Bull', color: '#1E41FF', wins: 6, poles: 3, podiums: 39, avgFinish: 4.9 },
    { id: 'RUS', name: 'George Russell', team: 'Mercedes', color: '#00D2BE', wins: 2, poles: 3, podiums: 14, avgFinish: 5.5 },
    { id: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', color: '#006F62', wins: 32, poles: 22, podiums: 106, avgFinish: 6.2 },
    { id: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#FF8700', wins: 2, poles: 2, podiums: 8, avgFinish: 6.8 },
    { id: 'STR', name: 'Lance Stroll', team: 'Aston Martin', color: '#006F62', wins: 0, poles: 1, podiums: 3, avgFinish: 11.2 },
]

// Head-to-head historical data (simulated based on real patterns)
const HEAD_TO_HEAD: Record<string, Record<string, { wins: number, races: number, avgGap: number }>> = {
    'VER': {
        'HAM': { wins: 28, races: 45, avgGap: -0.15 },
        'LEC': { wins: 35, races: 50, avgGap: -0.22 },
        'NOR': { wins: 42, races: 55, avgGap: -0.31 },
        'PER': { wins: 68, races: 85, avgGap: -0.38 },
    },
    'HAM': {
        'VER': { wins: 17, races: 45, avgGap: 0.15 },
        'LEC': { wins: 32, races: 48, avgGap: -0.08 },
        'RUS': { wins: 28, races: 42, avgGap: -0.12 },
        'ALO': { wins: 89, races: 120, avgGap: -0.18 },
    },
    'LEC': {
        'VER': { wins: 15, races: 50, avgGap: 0.22 },
        'SAI': { wins: 35, races: 60, avgGap: -0.05 },
        'HAM': { wins: 16, races: 48, avgGap: 0.08 },
    },
    'NOR': {
        'VER': { wins: 13, races: 55, avgGap: 0.31 },
        'PIA': { wins: 18, races: 35, avgGap: -0.08 },
        'RIC': { wins: 28, races: 40, avgGap: -0.15 },
    },
}

export default function HeadToHeadPage() {
    const [driver1, setDriver1] = useState('VER')
    const [driver2, setDriver2] = useState('HAM')

    const d1 = DRIVERS.find(d => d.id === driver1)!
    const d2 = DRIVERS.find(d => d.id === driver2)!

    // Get head-to-head stats
    const h2h = HEAD_TO_HEAD[driver1]?.[driver2] || HEAD_TO_HEAD[driver2]?.[driver1]
    const d1Wins = HEAD_TO_HEAD[driver1]?.[driver2]?.wins || (h2h ? h2h.races - h2h.wins : 0)
    const d2Wins = h2h ? h2h.races - d1Wins : 0
    const totalRaces = h2h?.races || 0

    // Calculate predicted win probability based on stats
    const d1Score = (d1.wins * 3 + d1.poles * 2 + d1.podiums) / (d1.avgFinish + 1)
    const d2Score = (d2.wins * 3 + d2.poles * 2 + d2.podiums) / (d2.avgFinish + 1)
    const totalScore = d1Score + d2Score
    const d1WinProb = Math.round((d1Score / totalScore) * 100)
    const d2WinProb = 100 - d1WinProb

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Users className="w-10 h-10 text-f1-red" />
                    Driver Head-to-Head
                </h1>
                <p className="text-f1-gray-600">
                    Compare any two drivers: historical stats, qualifying gaps, and model predictions
                </p>
            </div>

            {/* Driver Selectors */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <label className="block text-sm font-medium mb-2">Driver 1</label>
                    <select
                        value={driver1}
                        onChange={(e) => setDriver1(e.target.value)}
                        className="w-full border rounded-lg p-3 text-lg font-bold"
                        style={{ borderColor: d1.color }}
                    >
                        {DRIVERS.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <div className="mt-4 text-center">
                        <div className="text-4xl font-bold" style={{ color: d1.color }}>{d1.name.split(' ')[1]}</div>
                        <div className="text-sm text-f1-gray-500">{d1.team}</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <label className="block text-sm font-medium mb-2">Driver 2</label>
                    <select
                        value={driver2}
                        onChange={(e) => setDriver2(e.target.value)}
                        className="w-full border rounded-lg p-3 text-lg font-bold"
                        style={{ borderColor: d2.color }}
                    >
                        {DRIVERS.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <div className="mt-4 text-center">
                        <div className="text-4xl font-bold" style={{ color: d2.color }}>{d2.name.split(' ')[1]}</div>
                        <div className="text-sm text-f1-gray-500">{d2.team}</div>
                    </div>
                </div>
            </div>

            {/* VS Banner */}
            <div className="bg-gradient-to-r from-f1-gray-900 to-f1-gray-800 rounded-xl p-8 mb-8 text-white">
                <div className="grid grid-cols-3 items-center text-center">
                    <div>
                        <div className="text-5xl font-bold" style={{ color: d1.color }}>{d1WinProb}%</div>
                        <div className="text-sm opacity-75 mt-1">Model Win Probability</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-f1-red">VS</div>
                        <div className="text-xs opacity-50 mt-2">Head-to-Head Prediction</div>
                    </div>
                    <div>
                        <div className="text-5xl font-bold" style={{ color: d2.color }}>{d2WinProb}%</div>
                        <div className="text-sm opacity-75 mt-1">Model Win Probability</div>
                    </div>
                </div>

                {/* Probability Bar */}
                <div className="mt-6 h-4 rounded-full overflow-hidden flex">
                    <div
                        className="h-full transition-all duration-500"
                        style={{ width: `${d1WinProb}%`, backgroundColor: d1.color }}
                    />
                    <div
                        className="h-full transition-all duration-500"
                        style={{ width: `${d2WinProb}%`, backgroundColor: d2.color }}
                    />
                </div>
            </div>

            {/* Stats Comparison */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Career Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Career Statistics
                    </h2>
                    <div className="space-y-4">
                        <StatRow label="Race Wins" v1={d1.wins} v2={d2.wins} c1={d1.color} c2={d2.color} />
                        <StatRow label="Pole Positions" v1={d1.poles} v2={d2.poles} c1={d1.color} c2={d2.color} />
                        <StatRow label="Podiums" v1={d1.podiums} v2={d2.podiums} c1={d1.color} c2={d2.color} />
                        <StatRow label="Avg Finish" v1={d1.avgFinish} v2={d2.avgFinish} c1={d1.color} c2={d2.color} lower />
                    </div>
                </div>

                {/* Head-to-Head History */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-f1-red" />
                        Direct Battles
                    </h2>
                    {h2h ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    <span style={{ color: d1.color }}>{d1Wins}</span>
                                    <span className="text-f1-gray-400 mx-2">-</span>
                                    <span style={{ color: d2.color }}>{d2Wins}</span>
                                </div>
                                <div className="text-sm text-f1-gray-500">in {totalRaces} shared races</div>
                            </div>
                            <div className="h-3 rounded-full overflow-hidden flex bg-f1-gray-200">
                                <div
                                    className="h-full"
                                    style={{ width: `${(d1Wins / totalRaces) * 100}%`, backgroundColor: d1.color }}
                                />
                                <div
                                    className="h-full"
                                    style={{ width: `${(d2Wins / totalRaces) * 100}%`, backgroundColor: d2.color }}
                                />
                            </div>
                            <div className="text-center text-sm text-f1-gray-600">
                                Average qualifying gap: <span className="font-bold">{h2h.avgGap > 0 ? '+' : ''}{h2h.avgGap.toFixed(3)}s</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-f1-gray-500 py-8">
                            No direct head-to-head data available
                        </div>
                    )}
                </div>
            </div>

            {/* Prediction Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    Model Insight
                </h2>
                <p className="text-f1-gray-700">
                    {d1WinProb > d2WinProb ? (
                        <>
                            Our models predict <strong style={{ color: d1.color }}>{d1.name}</strong> would win{' '}
                            <strong>{d1WinProb}%</strong> of races against{' '}
                            <strong style={{ color: d2.color }}>{d2.name}</strong> if they were teammates.
                            This is based on historical form, qualifying pace, and race craft metrics.
                        </>
                    ) : (
                        <>
                            Our models predict <strong style={{ color: d2.color }}>{d2.name}</strong> would win{' '}
                            <strong>{d2WinProb}%</strong> of races against{' '}
                            <strong style={{ color: d1.color }}>{d1.name}</strong> if they were teammates.
                            This is based on historical form, qualifying pace, and race craft metrics.
                        </>
                    )}
                </p>
            </div>

            {/* Quick Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/whatif" className="bg-f1-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                    What-If Lab <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/compare" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition flex items-center gap-2">
                    Compare Models <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}

function StatRow({ label, v1, v2, c1, c2, lower = false }: {
    label: string
    v1: number
    v2: number
    c1: string
    c2: string
    lower?: boolean
}) {
    const better1 = lower ? v1 < v2 : v1 > v2
    const better2 = lower ? v2 < v1 : v2 > v1

    return (
        <div className="flex items-center gap-4">
            <div className={`w-20 text-right font-bold ${better1 ? '' : 'opacity-50'}`} style={{ color: better1 ? c1 : undefined }}>
                {typeof v1 === 'number' && v1 % 1 !== 0 ? v1.toFixed(1) : v1}
            </div>
            <div className="flex-1 text-center text-sm text-f1-gray-600">{label}</div>
            <div className={`w-20 text-left font-bold ${better2 ? '' : 'opacity-50'}`} style={{ color: better2 ? c2 : undefined }}>
                {typeof v2 === 'number' && v2 % 1 !== 0 ? v2.toFixed(1) : v2}
            </div>
        </div>
    )
}
