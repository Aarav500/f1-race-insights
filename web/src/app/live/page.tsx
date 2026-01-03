'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Activity, Zap, Clock, AlertTriangle, Flag, TrendingUp, TrendingDown, Radio, Gauge, Timer } from 'lucide-react'

// Simulated live race data
const DRIVERS = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF' },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700' },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000' },
    { id: 'HAM', name: 'Hamilton', team: 'Ferrari', color: '#DC0000' },
    { id: 'PIA', name: 'Piastri', team: 'McLaren', color: '#FF8700' },
    { id: 'RUS', name: 'Russell', team: 'Mercedes', color: '#00D2BE' },
    { id: 'SAI', name: 'Sainz', team: 'Williams', color: '#005AFF' },
    { id: 'ALO', name: 'Alonso', team: 'Aston Martin', color: '#006F62' },
]

interface LiveState {
    lap: number
    totalLaps: number
    positions: { id: string; gap: number; prob: number; delta: number }[]
    safetyCar: boolean
    weather: 'dry' | 'damp' | 'wet'
    lastUpdate: Date
}

export default function LiveDashboardPage() {
    const [isLive, setIsLive] = useState(false)
    const [liveState, setLiveState] = useState<LiveState>({
        lap: 0,
        totalLaps: 57,
        positions: DRIVERS.map((d, i) => ({ id: d.id, gap: i * 1.5, prob: Math.max(0.4 - i * 0.08, 0.02), delta: 0 })),
        safetyCar: false,
        weather: 'dry',
        lastUpdate: new Date(),
    })
    const [history, setHistory] = useState<{ lap: number; probs: Record<string, number> }[]>([])

    // Simulate live updates
    const simulateLap = useCallback(() => {
        setLiveState(prev => {
            if (prev.lap >= prev.totalLaps) return prev

            const newLap = prev.lap + 1
            const safetyCar = Math.random() < 0.05
            const weather = Math.random() < 0.02 ? (prev.weather === 'dry' ? 'damp' : 'dry') : prev.weather

            // Randomize positions slightly
            const newPositions = prev.positions.map((p, i) => {
                const posChange = Math.random() < 0.1 ? (Math.random() < 0.5 ? 1 : -1) : 0
                const newProb = Math.max(0.01, Math.min(0.95, p.prob + (Math.random() - 0.5) * 0.05 + (safetyCar ? 0.03 : 0)))
                return {
                    ...p,
                    gap: Math.max(0, p.gap + (Math.random() - 0.5) * 0.5),
                    prob: newProb,
                    delta: newProb - p.prob,
                }
            }).sort((a, b) => a.gap - b.gap)

            // Normalize probabilities
            const totalProb = newPositions.reduce((sum, p) => sum + p.prob, 0)
            newPositions.forEach(p => p.prob = p.prob / totalProb)

            return {
                lap: newLap,
                totalLaps: prev.totalLaps,
                positions: newPositions,
                safetyCar,
                weather,
                lastUpdate: new Date(),
            }
        })

        setHistory(prev => [...prev, {
            lap: liveState.lap + 1,
            probs: Object.fromEntries(liveState.positions.map(p => [p.id, p.prob]))
        }])
    }, [liveState])

    useEffect(() => {
        if (!isLive) return
        const interval = setInterval(simulateLap, 2000)
        return () => clearInterval(interval)
    }, [isLive, simulateLap])

    const getDriver = (id: string) => DRIVERS.find(d => d.id === id)!

    return (
        <div className="min-h-screen bg-f1-black text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-f1-red to-red-700 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Activity className="w-8 h-8 animate-pulse" />
                        <div>
                            <h1 className="text-2xl font-bold">Live Race Dashboard</h1>
                            <p className="text-sm opacity-80">Real-time probability updates</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-3xl font-mono font-bold">Lap {liveState.lap}/{liveState.totalLaps}</div>
                            <div className="text-sm opacity-80">{liveState.weather === 'dry' ? '☀️ Dry' : liveState.weather === 'damp' ? '🌧️ Damp' : '🌧️ Wet'}</div>
                        </div>
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={`px-6 py-3 rounded-lg font-bold transition ${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {isLive ? '⏹ Stop' : '▶️ Start Simulation'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Simulation Mode Banner */}
            <div className="bg-blue-900/50 border-y border-blue-500/30 py-3 px-4">
                <div className="container mx-auto flex items-center justify-center gap-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-blue-200 font-medium">
                        📡 SIMULATION MODE • Bahrain GP 2025 (57 Laps)
                    </span>
                    <span className="text-blue-400 text-sm">
                        No live race currently in progress
                    </span>
                </div>
            </div>

            {/* Safety Car Alert */}
            {liveState.safetyCar && (
                <div className="bg-yellow-500 text-black py-2 px-4 flex items-center justify-center gap-2 animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold">SAFETY CAR DEPLOYED</span>
                </div>
            )}

            <div className="container mx-auto p-4 grid lg:grid-cols-3 gap-4">
                {/* Live Standings */}
                <div className="lg:col-span-2 bg-f1-gray-900 rounded-xl p-4">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Flag className="w-5 h-5 text-f1-red" />
                        Live Standings & Win Probability
                    </h2>
                    <div className="space-y-2">
                        {liveState.positions.map((pos, i) => {
                            const driver = getDriver(pos.id)
                            return (
                                <div key={pos.id} className="flex items-center gap-3 bg-f1-gray-800 rounded-lg p-3">
                                    <div className="w-8 h-8 flex items-center justify-center font-bold text-lg" style={{ color: driver.color }}>
                                        {i + 1}
                                    </div>
                                    <div className="w-16 font-mono font-bold">{pos.id}</div>
                                    <div className="flex-1">
                                        <div className="h-6 bg-f1-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pos.prob * 100}%`, backgroundColor: driver.color }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-20 text-right font-mono font-bold text-lg">
                                        {(pos.prob * 100).toFixed(1)}%
                                    </div>
                                    <div className={`w-16 text-right text-sm ${pos.delta > 0 ? 'text-green-400' : pos.delta < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                        {pos.delta > 0 ? <TrendingUp className="inline w-4 h-4" /> : pos.delta < 0 ? <TrendingDown className="inline w-4 h-4" /> : null}
                                        {pos.delta !== 0 && `${pos.delta > 0 ? '+' : ''}${(pos.delta * 100).toFixed(1)}`}
                                    </div>
                                    <div className="w-20 text-right text-sm text-gray-400">
                                        {i === 0 ? 'Leader' : `+${pos.gap.toFixed(1)}s`}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                    {/* Momentum Chart */}
                    <div className="bg-f1-gray-900 rounded-xl p-4">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Gauge className="w-5 h-5 text-yellow-400" />
                            Momentum (Last 10 Laps)
                        </h3>
                        <div className="h-32 flex items-end gap-1">
                            {history.slice(-10).map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col gap-0.5">
                                    {Object.entries(h.probs).slice(0, 3).map(([id, prob]) => (
                                        <div
                                            key={id}
                                            className="rounded-t"
                                            style={{
                                                height: `${prob * 120}px`,
                                                backgroundColor: getDriver(id)?.color || '#666',
                                            }}
                                            title={`${id}: ${(prob * 100).toFixed(1)}%`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-center text-gray-500 mt-2">Top 3 drivers probability evolution</div>
                    </div>

                    {/* Race Events */}
                    <div className="bg-f1-gray-900 rounded-xl p-4">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Radio className="w-5 h-5 text-blue-400" />
                            Race Events
                        </h3>
                        <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                            {liveState.safetyCar && (
                                <div className="bg-yellow-500/20 text-yellow-400 p-2 rounded">⚠️ Safety car deployed</div>
                            )}
                            <div className="text-gray-400 p-2">Lap {liveState.lap}: All running normally</div>
                            {liveState.lap > 15 && <div className="text-gray-400 p-2">Lap 15: First pit window opens</div>}
                            {liveState.lap > 10 && <div className="text-gray-400 p-2">Lap 10: DRS enabled</div>}
                            <div className="text-green-400 p-2">Race started</div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-f1-gray-900 rounded-xl p-4">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Timer className="w-5 h-5 text-green-400" />
                            Race Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-f1-gray-800 p-2 rounded">
                                <div className="text-gray-400">Laps Remaining</div>
                                <div className="font-bold text-lg">{liveState.totalLaps - liveState.lap}</div>
                            </div>
                            <div className="bg-f1-gray-800 p-2 rounded">
                                <div className="text-gray-400">% Complete</div>
                                <div className="font-bold text-lg">{Math.round((liveState.lap / liveState.totalLaps) * 100)}%</div>
                            </div>
                            <div className="bg-f1-gray-800 p-2 rounded">
                                <div className="text-gray-400">Leader</div>
                                <div className="font-bold text-lg">{liveState.positions[0]?.id}</div>
                            </div>
                            <div className="bg-f1-gray-800 p-2 rounded">
                                <div className="text-gray-400">Gap P1-P2</div>
                                <div className="font-bold text-lg">{liveState.positions[1]?.gap.toFixed(1)}s</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="container mx-auto p-4">
                <Link href="/" className="text-f1-red hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
