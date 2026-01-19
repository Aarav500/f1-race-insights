'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Users, Trophy, TrendingUp, Target, Percent, Clock, Zap } from 'lucide-react'

// Driver data for comparison
const DRIVERS_DATA = [
    {
        id: 'VER', name: 'Max Verstappen', team: 'Red Bull', color: '#1E41FF',
        stats: { wins: 61, poles: 43, podiums: 112, championships: 4, fastestLaps: 33, avgFinish: 2.1, qualiAvg: 1.8, dnfRate: 0.08 }
    },
    {
        id: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#FF8700',
        stats: { wins: 5, poles: 8, podiums: 28, championships: 1, fastestLaps: 8, avgFinish: 4.2, qualiAvg: 3.5, dnfRate: 0.12 }
    },
    {
        id: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#DC0000',
        stats: { wins: 8, poles: 26, podiums: 42, championships: 0, fastestLaps: 9, avgFinish: 4.8, qualiAvg: 3.2, dnfRate: 0.15 }
    },
    {
        id: 'HAM', name: 'Lewis Hamilton', team: 'Ferrari', color: '#DC0000',
        stats: { wins: 105, poles: 104, podiums: 202, championships: 7, fastestLaps: 67, avgFinish: 2.8, qualiAvg: 2.4, dnfRate: 0.09 }
    },
    {
        id: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#FF8700',
        stats: { wins: 3, poles: 2, podiums: 16, championships: 0, fastestLaps: 4, avgFinish: 5.2, qualiAvg: 4.8, dnfRate: 0.10 }
    },
    {
        id: 'RUS', name: 'George Russell', team: 'Mercedes', color: '#00D2BE',
        stats: { wins: 3, poles: 5, podiums: 18, championships: 0, fastestLaps: 8, avgFinish: 5.5, qualiAvg: 4.2, dnfRate: 0.11 }
    },
    {
        id: 'SAI', name: 'Carlos Sainz', team: 'Williams', color: '#005AFF',
        stats: { wins: 4, poles: 6, podiums: 25, championships: 0, fastestLaps: 5, avgFinish: 5.8, qualiAvg: 5.0, dnfRate: 0.13 }
    },
    {
        id: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', color: '#006F62',
        stats: { wins: 32, poles: 22, podiums: 106, championships: 2, fastestLaps: 26, avgFinish: 6.2, qualiAvg: 5.5, dnfRate: 0.10 }
    },
]

const STAT_CONFIG = [
    { key: 'wins', label: 'Race Wins', icon: Trophy, format: (v: number) => v.toString(), higherBetter: true },
    { key: 'poles', label: 'Pole Positions', icon: Zap, format: (v: number) => v.toString(), higherBetter: true },
    { key: 'podiums', label: 'Podium Finishes', icon: Target, format: (v: number) => v.toString(), higherBetter: true },
    { key: 'championships', label: 'World Titles', icon: Trophy, format: (v: number) => v.toString(), higherBetter: true },
    { key: 'fastestLaps', label: 'Fastest Laps', icon: Clock, format: (v: number) => v.toString(), higherBetter: true },
    { key: 'avgFinish', label: 'Avg Finish Pos', icon: TrendingUp, format: (v: number) => v.toFixed(1), higherBetter: false },
    { key: 'qualiAvg', label: 'Avg Quali Pos', icon: Zap, format: (v: number) => v.toFixed(1), higherBetter: false },
    { key: 'dnfRate', label: 'DNF Rate', icon: Percent, format: (v: number) => `${(v * 100).toFixed(0)}%`, higherBetter: false },
]

export default function DriverComparisonPage() {
    const [driver1, setDriver1] = useState('VER')
    const [driver2, setDriver2] = useState('NOR')

    const d1 = DRIVERS_DATA.find(d => d.id === driver1) || DRIVERS_DATA[0]
    const d2 = DRIVERS_DATA.find(d => d.id === driver2) || DRIVERS_DATA[1]

    const getWinner = (stat: typeof STAT_CONFIG[0]) => {
        const v1 = d1.stats[stat.key as keyof typeof d1.stats]
        const v2 = d2.stats[stat.key as keyof typeof d2.stats]
        if (stat.higherBetter) {
            return v1 > v2 ? 1 : v2 > v1 ? 2 : 0
        } else {
            return v1 < v2 ? 1 : v2 < v1 ? 2 : 0
        }
    }

    const score = useMemo(() => {
        let s1 = 0, s2 = 0
        STAT_CONFIG.forEach(stat => {
            const winner = getWinner(stat)
            if (winner === 1) s1++
            else if (winner === 2) s2++
        })
        return { s1, s2 }
    }, [driver1, driver2])

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="w-8 h-8" />
                        Driver Comparison Overlay
                    </h1>
                    <p className="text-white/80 mt-1">Side-by-side stats • Head-to-head comparison</p>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Driver Selectors */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <label className="block text-gray-400 text-sm mb-2">Driver 1</label>
                        <select
                            value={driver1}
                            onChange={e => setDriver1(e.target.value)}
                            className="w-full bg-f1-gray-700 text-white rounded-lg p-3 font-bold"
                        >
                            {DRIVERS_DATA.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: d1.color }} />
                            <span className="text-gray-400">{d1.team}</span>
                        </div>
                    </div>
                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <label className="block text-gray-400 text-sm mb-2">Driver 2</label>
                        <select
                            value={driver2}
                            onChange={e => setDriver2(e.target.value)}
                            className="w-full bg-f1-gray-700 text-white rounded-lg p-3 font-bold"
                        >
                            {DRIVERS_DATA.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: d2.color }} />
                            <span className="text-gray-400">{d2.team}</span>
                        </div>
                    </div>
                </div>

                {/* Score Banner */}
                <div className="bg-f1-gray-800 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                            <div className="text-4xl font-bold" style={{ color: d1.color }}>{d1.id}</div>
                            <div className="text-gray-400">{d1.name}</div>
                        </div>
                        <div className="text-center px-8">
                            <div className="text-5xl font-bold text-white">{score.s1} - {score.s2}</div>
                            <div className="text-sm text-gray-400 mt-1">Categories Won</div>
                        </div>
                        <div className="text-center flex-1">
                            <div className="text-4xl font-bold" style={{ color: d2.color }}>{d2.id}</div>
                            <div className="text-gray-400">{d2.name}</div>
                        </div>
                    </div>
                </div>

                {/* Stats Comparison */}
                <div className="bg-f1-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Detailed Comparison</h2>
                    <div className="space-y-4">
                        {STAT_CONFIG.map(stat => {
                            const v1 = d1.stats[stat.key as keyof typeof d1.stats]
                            const v2 = d2.stats[stat.key as keyof typeof d2.stats]
                            const winner = getWinner(stat)
                            const maxVal = stat.higherBetter ? Math.max(v1, v2) : 1
                            const w1 = stat.higherBetter ? (v1 / maxVal) * 100 : (1 - v1) * 100
                            const w2 = stat.higherBetter ? (v2 / maxVal) * 100 : (1 - v2) * 100

                            return (
                                <div key={stat.key}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className={`font-bold ${winner === 1 ? 'text-white' : 'text-gray-400'}`}>
                                            {stat.format(v1)}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <stat.icon className="w-4 h-4" />
                                            <span className="text-sm">{stat.label}</span>
                                        </div>
                                        <div className={`font-bold ${winner === 2 ? 'text-white' : 'text-gray-400'}`}>
                                            {stat.format(v2)}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 h-3">
                                        <div className="flex-1 flex justify-end">
                                            <div
                                                className={`h-full rounded-l ${winner === 1 ? 'opacity-100' : 'opacity-50'}`}
                                                style={{ width: `${w1}%`, backgroundColor: d1.color }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div
                                                className={`h-full rounded-r ${winner === 2 ? 'opacity-100' : 'opacity-50'}`}
                                                style={{ width: `${w2}%`, backgroundColor: d2.color }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-purple-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
