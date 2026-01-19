'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Activity, Clock, AlertTriangle, Flag, TrendingUp, TrendingDown, Radio, Gauge, Timer, Calendar, MapPin, Trophy } from 'lucide-react'

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

interface LiveStatus {
    isLive: boolean
    sessionType: string | null
    sessionName: string | null
    currentRace: { name: string; location: string } | null
    lastRace: { name: string; location: string; winner: string; date: string } | null
    nextRace: { round: number; name: string; location: string; date: string } | null
    lastCompletedRace: { round: number; name: string; location: string; date: string } | null
}

interface LiveState {
    lap: number
    totalLaps: number
    positions: { id: string; gap: number; prob: number; delta: number }[]
    safetyCar: boolean
    weather: 'dry' | 'damp' | 'wet'
    lastUpdate: Date
}

export default function LiveDashboardPage() {
    const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null)
    const [isSimulating, setIsSimulating] = useState(false)
    const [liveState, setLiveState] = useState<LiveState>({
        lap: 0,
        totalLaps: 57,
        positions: DRIVERS.map((d, i) => ({ id: d.id, gap: i * 1.5, prob: Math.max(0.4 - i * 0.08, 0.02), delta: 0 })),
        safetyCar: false,
        weather: 'dry',
        lastUpdate: new Date(),
    })
    const [history, setHistory] = useState<{ lap: number; probs: Record<string, number> }[]>([])

    // Fetch live status from API
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/live-status')
                const data = await res.json()
                setLiveStatus(data)
            } catch (error) {
                console.error('Failed to fetch live status:', error)
            }
        }
        fetchStatus()
        const interval = setInterval(fetchStatus, 30000)
        return () => clearInterval(interval)
    }, [])

    // Simulate live updates
    const simulateLap = useCallback(() => {
        setLiveState(prev => {
            if (prev.lap >= prev.totalLaps) return prev

            const newLap = prev.lap + 1
            const safetyCar = Math.random() < 0.05
            const weather = Math.random() < 0.02 ? (prev.weather === 'dry' ? 'damp' : 'dry') : prev.weather

            const newPositions = prev.positions.map((p) => {
                const newProb = Math.max(0.01, Math.min(0.95, p.prob + (Math.random() - 0.5) * 0.05 + (safetyCar ? 0.03 : 0)))
                return {
                    ...p,
                    gap: Math.max(0, p.gap + (Math.random() - 0.5) * 0.5),
                    prob: newProb,
                    delta: newProb - p.prob,
                }
            }).sort((a, b) => a.gap - b.gap)

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
        if (!isSimulating) return
        const interval = setInterval(simulateLap, 2000)
        return () => clearInterval(interval)
    }, [isSimulating, simulateLap])

    const getDriver = (id: string) => DRIVERS.find(d => d.id === id)!

    const isActuallyLive = liveStatus?.isLive || false

    // No Live Session UI
    if (!isActuallyLive && !isSimulating) {
        return (
            <div className="min-h-screen bg-f1-black text-white">
                {/* Header */}
                <div className="bg-gradient-to-r from-f1-gray-800 to-f1-gray-900 p-6">
                    <div className="container mx-auto">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-8 h-8 text-gray-400" />
                            <h1 className="text-2xl font-bold">Live Race Dashboard</h1>
                        </div>
                        <p className="text-gray-400">Real-time probability updates during F1 sessions</p>
                    </div>
                </div>

                {/* No Live Session Banner */}
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-y border-blue-500/30 py-8">
                    <div className="container mx-auto text-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Radio className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">No Live Session Available</h2>
                        <p className="text-gray-400 mb-6">There is no F1 session currently in progress</p>

                        <button
                            onClick={() => setIsSimulating(true)}
                            className="px-8 py-3 bg-f1-red hover:bg-red-700 rounded-lg font-bold transition inline-flex items-center gap-2"
                        >
                            ▶️ Start Simulation Mode
                        </button>
                    </div>
                </div>

                <div className="container mx-auto p-6 grid md:grid-cols-2 gap-6">
                    {/* Last Completed Race */}
                    <div className="bg-f1-gray-900 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            Last Completed Race
                        </h3>
                        {liveStatus?.lastCompletedRace ? (
                            <div className="space-y-4">
                                <div className="text-2xl font-bold text-white">{liveStatus.lastCompletedRace.name}</div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    {liveStatus.lastCompletedRace.location}
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(liveStatus.lastCompletedRace.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                                <div className="pt-4 border-t border-gray-700">
                                    <div className="text-sm text-gray-400 mb-2">Round {liveStatus.lastCompletedRace.round} of 24</div>
                                    <div className="flex gap-2">
                                        <Link href="/championship" className="px-4 py-2 bg-f1-gray-700 hover:bg-f1-gray-600 rounded-lg text-sm">
                                            View Standings
                                        </Link>
                                        <Link href="/replay" className="px-4 py-2 bg-f1-gray-700 hover:bg-f1-gray-600 rounded-lg text-sm">
                                            Race Replay
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500">Loading...</div>
                        )}
                    </div>

                    {/* Next Race */}
                    <div className="bg-f1-gray-900 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-400" />
                            Next Race
                        </h3>
                        {liveStatus?.nextRace ? (
                            <div className="space-y-4">
                                <div className="text-2xl font-bold text-white">{liveStatus.nextRace.name}</div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    {liveStatus.nextRace.location}
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(liveStatus.nextRace.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                                <div className="pt-4 border-t border-gray-700">
                                    <div className="text-sm text-gray-400 mb-2">Round {liveStatus.nextRace.round} of 24</div>
                                    <CountdownTimer targetDate={liveStatus.nextRace.date} />
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500">Loading...</div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-2 bg-f1-gray-900 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">While You Wait...</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/simulator" className="p-4 bg-f1-gray-800 hover:bg-f1-gray-700 rounded-lg text-center transition">
                                <div className="text-2xl mb-2">🎮</div>
                                <div className="font-medium">Season Simulator</div>
                            </Link>
                            <Link href="/championship" className="p-4 bg-f1-gray-800 hover:bg-f1-gray-700 rounded-lg text-center transition">
                                <div className="text-2xl mb-2">🏆</div>
                                <div className="font-medium">Championship</div>
                            </Link>
                            <Link href="/strategy-chat" className="p-4 bg-f1-gray-800 hover:bg-f1-gray-700 rounded-lg text-center transition">
                                <div className="text-2xl mb-2">🤖</div>
                                <div className="font-medium">AI Strategy Chat</div>
                            </Link>
                            <Link href="/counterfactual" className="p-4 bg-f1-gray-800 hover:bg-f1-gray-700 rounded-lg text-center transition">
                                <div className="text-2xl mb-2">🔀</div>
                                <div className="font-medium">What-If Simulator</div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto p-4">
                    <Link href="/" className="text-f1-red hover:underline">← Back to Home</Link>
                </div>
            </div>
        )
    }

    // Live/Simulation Dashboard
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
                            onClick={() => setIsSimulating(!isSimulating)}
                            className={`px-6 py-3 rounded-lg font-bold transition ${isSimulating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {isSimulating ? '⏹ Stop' : '▶️ Start Simulation'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mode Banner */}
            <div className={`py-3 px-4 ${isActuallyLive ? 'bg-red-900/50 border-red-500/30' : 'bg-blue-900/50 border-blue-500/30'} border-y`}>
                <div className="container mx-auto flex items-center justify-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${isActuallyLive ? 'bg-red-400' : 'bg-blue-400'}`} />
                    <span className={isActuallyLive ? 'text-red-200' : 'text-blue-200'}>
                        {isActuallyLive ? (
                            <>🔴 LIVE • {liveStatus?.currentRace?.name || 'F1 Session'} ({liveStatus?.sessionType})</>
                        ) : (
                            <>📡 SIMULATION MODE • Bahrain GP 2025 (57 Laps)</>
                        )}
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

            <div className="container mx-auto p-4">
                <Link href="/" className="text-f1-red hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}

// Countdown timer component
function CountdownTimer({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date()
            const target = new Date(targetDate)
            const diff = target.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeLeft('Starting soon!')
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            setTimeLeft(`${days}d ${hours}h ${mins}m`)
        }

        calculateTime()
        const interval = setInterval(calculateTime, 60000)
        return () => clearInterval(interval)
    }, [targetDate])

    return (
        <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-mono font-bold">{timeLeft}</span>
        </div>
    )
}
