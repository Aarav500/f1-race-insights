'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { LineChart, TrendingUp, TrendingDown, Timer, Zap } from 'lucide-react'

const DRIVERS = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF', racePace: 0 },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700', racePace: 0.15 },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000', racePace: 0.18 },
    { id: 'HAM', name: 'Hamilton', team: 'Ferrari', color: '#DC0000', racePace: 0.22 },
    { id: 'PIA', name: 'Piastri', team: 'McLaren', color: '#FF8700', racePace: 0.20 },
    { id: 'RUS', name: 'Russell', team: 'Mercedes', color: '#00D2BE', racePace: 0.28 },
]

export default function GapEvolutionPage() {
    const [driver1, setDriver1] = useState('VER')
    const [driver2, setDriver2] = useState('NOR')
    const [totalLaps, setTotalLaps] = useState(57)
    const [currentGap, setCurrentGap] = useState(2.0)
    const [tireAge1, setTireAge1] = useState(10)
    const [tireAge2, setTireAge2] = useState(12)

    const gapEvolution = useMemo(() => {
        const d1 = DRIVERS.find(d => d.id === driver1)!
        const d2 = DRIVERS.find(d => d.id === driver2)!

        const laps = []
        let gap = currentGap
        let confidence = 90

        for (let lap = 1; lap <= totalLaps; lap++) {
            // Calculate pace delta per lap
            const baseDelta = d1.racePace - d2.racePace
            const tireDelta = (tireAge2 - tireAge1) * 0.02 // Tire age effect
            const randomVariance = (Math.random() - 0.5) * 0.1

            const lapDelta = baseDelta + tireDelta + randomVariance
            gap += lapDelta

            // Confidence decreases further into prediction
            confidence = Math.max(50, 90 - lap * 0.5)

            laps.push({
                lap,
                gap: gap,
                delta: lapDelta,
                confidence,
                upperBound: gap + (100 - confidence) * 0.05,
                lowerBound: gap - (100 - confidence) * 0.05,
            })
        }

        // Calculate key moments
        const crossoverLap = laps.find(l => l.gap <= 0 && currentGap > 0)?.lap ||
            laps.find(l => l.gap >= 0 && currentGap < 0)?.lap ||
            null
        const drsLap = laps.find(l => Math.abs(l.gap) <= 1)?.lap || null
        const overtakeLap = laps.find(l => l.gap < 0.5 && currentGap > 0.5)?.lap || null

        return {
            laps,
            finalGap: laps[laps.length - 1]?.gap.toFixed(2) || '0',
            crossoverLap,
            drsLap,
            overtakeLap,
            avgDelta: (laps.reduce((sum, l) => sum + l.delta, 0) / laps.length).toFixed(3),
            d1,
            d2,
        }
    }, [driver1, driver2, totalLaps, currentGap, tireAge1, tireAge2])

    const maxGap = Math.max(Math.abs(currentGap) + 5, ...gapEvolution.laps.map(l => Math.abs(l.upperBound)))

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <LineChart className="w-8 h-8" />
                        Gap Evolution Predictor
                    </h1>
                    <p className="text-white/80 mt-1">Lap-by-lap gap forecasting with confidence intervals</p>
                </div>
            </div>

            <div className="container mx-auto p-4 grid lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="space-y-4">
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Battle Setup</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Leader</label>
                                <select
                                    value={driver1}
                                    onChange={e => setDriver1(e.target.value)}
                                    className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                >
                                    {DRIVERS.map(d => <option key={d.id} value={d.id}>{d.name} ({d.team})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Chaser</label>
                                <select
                                    value={driver2}
                                    onChange={e => setDriver2(e.target.value)}
                                    className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                >
                                    {DRIVERS.map(d => <option key={d.id} value={d.id}>{d.name} ({d.team})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Current Gap: {currentGap.toFixed(1)}s</label>
                                <input
                                    type="range" min="0" max="10" step="0.1"
                                    value={currentGap}
                                    onChange={e => setCurrentGap(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Leader Tire Age: {tireAge1}</label>
                                    <input
                                        type="range" min="0" max="40"
                                        value={tireAge1}
                                        onChange={e => setTireAge1(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Chaser Tire Age: {tireAge2}</label>
                                    <input
                                        type="range" min="0" max="40"
                                        value={tireAge2}
                                        onChange={e => setTireAge2(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Race Length: {totalLaps} laps</label>
                                <input
                                    type="range" min="20" max="78"
                                    value={totalLaps}
                                    onChange={e => setTotalLaps(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Key Moments */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Key Moments
                        </h2>
                        <div className="space-y-3">
                            {gapEvolution.drsLap && (
                                <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/50">
                                    <div className="text-green-400 font-bold">DRS Range</div>
                                    <div className="text-white">Gap &lt;1s on lap {gapEvolution.drsLap}</div>
                                </div>
                            )}
                            {gapEvolution.crossoverLap && (
                                <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
                                    <div className="text-yellow-400 font-bold">Position Change</div>
                                    <div className="text-white">Expected lap {gapEvolution.crossoverLap}</div>
                                </div>
                            )}
                            <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/50">
                                <div className="text-blue-400 font-bold">Avg Pace Delta</div>
                                <div className="text-white">{parseFloat(gapEvolution.avgDelta) > 0 ? '+' : ''}{gapEvolution.avgDelta}s/lap</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="lg:col-span-2 bg-f1-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Gap Projection</h2>

                    {/* Chart Area */}
                    <div className="relative h-96 border-l border-b border-gray-600 ml-16">
                        {/* Y-axis labels */}
                        <div className="absolute -left-16 top-0 h-full flex flex-col justify-between text-xs text-gray-400 w-14 text-right">
                            <span>+{maxGap.toFixed(1)}s</span>
                            <span>+{(maxGap / 2).toFixed(1)}s</span>
                            <span>0s</span>
                            <span>-{(maxGap / 2).toFixed(1)}s</span>
                            <span>-{maxGap.toFixed(1)}s</span>
                        </div>

                        {/* Zero line */}
                        <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-500" />

                        {/* Confidence band */}
                        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${totalLaps * 10} 400`} preserveAspectRatio="none">
                            <path
                                d={
                                    gapEvolution.laps.map((l, i) => {
                                        const x = i * 10
                                        const y = 200 - (l.upperBound / maxGap) * 180
                                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                                    }).join(' ') +
                                    gapEvolution.laps.slice().reverse().map((l, i) => {
                                        const x = (totalLaps - 1 - i) * 10
                                        const y = 200 - (l.lowerBound / maxGap) * 180
                                        return `L ${x} ${y}`
                                    }).join(' ') + ' Z'
                                }
                                fill="rgba(59, 130, 246, 0.2)"
                            />
                            <path
                                d={gapEvolution.laps.map((l, i) => {
                                    const x = i * 10
                                    const y = 200 - (l.gap / maxGap) * 180
                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                                }).join(' ')}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                            />
                        </svg>

                        {/* DRS zone indicator */}
                        <div className="absolute left-0 right-0" style={{ top: `${50 - (1 / maxGap) * 45}%`, height: `${(2 / maxGap) * 90}%` }}>
                            <div className="h-full bg-green-500/10 border-y border-green-500/30" />
                        </div>
                    </div>

                    {/* X-axis */}
                    <div className="flex justify-between text-xs text-gray-400 ml-16 mt-2">
                        <span>Lap 1</span>
                        <span>Lap {Math.floor(totalLaps / 4)}</span>
                        <span>Lap {Math.floor(totalLaps / 2)}</span>
                        <span>Lap {Math.floor(3 * totalLaps / 4)}</span>
                        <span>Lap {totalLaps}</span>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-1 bg-blue-500 rounded" />
                            <span className="text-gray-400">Predicted Gap</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500/20 rounded" />
                            <span className="text-gray-400">Confidence Interval</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500/20 rounded" />
                            <span className="text-gray-400">DRS Zone (&lt;1s)</span>
                        </div>
                    </div>

                    {/* Final Gap Prediction */}
                    <div className="mt-6 flex items-center justify-center gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold" style={{ backgroundColor: gapEvolution.d1.color }}>
                                {driver1}
                            </div>
                            <div className="text-white font-bold">{gapEvolution.d1.name}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white">{gapEvolution.finalGap}s</div>
                            <div className="text-gray-400">Final Gap (Lap {totalLaps})</div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                {parseFloat(gapEvolution.avgDelta) > 0 ?
                                    <TrendingUp className="w-4 h-4 text-green-400" /> :
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                }
                                <span className={parseFloat(gapEvolution.avgDelta) > 0 ? 'text-green-400' : 'text-red-400'}>
                                    {gapEvolution.avgDelta}s/lap
                                </span>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold" style={{ backgroundColor: gapEvolution.d2.color }}>
                                {driver2}
                            </div>
                            <div className="text-white font-bold">{gapEvolution.d2.name}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-cyan-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
