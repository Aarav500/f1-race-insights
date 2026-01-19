'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Brain, TrendingUp, Zap, RefreshCw, Play, Pause } from 'lucide-react'
import { DRIVERS_2025, CALENDAR_2025 } from '@/constants/f1-data'
import FeatureInfo from '@/components/FeatureInfo'

// Events that can occur during a race
const RACE_EVENTS = [
    { type: 'pit_stop', description: 'Pit stop', priorChange: -0.05 },
    { type: 'overtake', description: 'Successful overtake', priorChange: 0.08 },
    { type: 'overtaken', description: 'Lost position', priorChange: -0.08 },
    { type: 'safety_car', description: 'Safety car deployed', priorChange: 0.03 },
    { type: 'fastest_lap', description: 'Set fastest lap', priorChange: 0.04 },
    { type: 'drs_pass', description: 'DRS overtake', priorChange: 0.05 },
    { type: 'lockup', description: 'Tire lockup', priorChange: -0.02 },
    { type: 'track_limits', description: 'Track limits warning', priorChange: -0.01 },
    { type: 'clear_air', description: 'Running in clear air', priorChange: 0.02 },
    { type: 'traffic', description: 'Stuck in traffic', priorChange: -0.03 },
] as const

interface EventLog {
    lap: number
    driver: string
    event: typeof RACE_EVENTS[number]
    priorBefore: number
    priorAfter: number
}

export default function BayesianEnginePage() {
    const [selectedTrack, setSelectedTrack] = useState(4)
    const [isRunning, setIsRunning] = useState(false)
    const [currentLap, setCurrentLap] = useState(1)
    const [eventLog, setEventLog] = useState<EventLog[]>([])

    const track = CALENDAR_2025.find(t => t.round === selectedTrack) || CALENDAR_2025[3]

    // Initialize priors based on driver quality (inverse of qualiPace gap)
    const [priors, setPriors] = useState<Record<string, number>>(() => {
        const initialPriors: Record<string, number> = {}
        DRIVERS_2025.forEach((d, i) => {
            // Top drivers get higher initial probability
            initialPriors[d.id] = Math.max(0.01, 0.35 - i * 0.015)
        })
        // Normalize
        const total = Object.values(initialPriors).reduce((a, b) => a + b, 0)
        Object.keys(initialPriors).forEach(k => initialPriors[k] /= total)
        return initialPriors
    })

    // Bayesian update function
    const bayesianUpdate = (currentPriors: Record<string, number>, driverId: string, likelihood: number) => {
        const newPriors = { ...currentPriors }

        // Apply likelihood to the specific driver
        newPriors[driverId] *= (1 + likelihood)

        // Normalize all probabilities to sum to 1
        const total = Object.values(newPriors).reduce((a, b) => a + b, 0)
        Object.keys(newPriors).forEach(k => {
            newPriors[k] = Math.max(0.001, Math.min(0.95, newPriors[k] / total))
        })

        return newPriors
    }

    // Simulate race events
    useEffect(() => {
        if (!isRunning || currentLap > track.laps) return

        const interval = setInterval(() => {
            setCurrentLap(prev => {
                if (prev >= track.laps) {
                    setIsRunning(false)
                    return prev
                }
                return prev + 1
            })

            // Generate random event for a random driver
            const randomDriver = DRIVERS_2025[Math.floor(Math.random() * 8)].id // Focus on top 8
            const randomEvent = RACE_EVENTS[Math.floor(Math.random() * RACE_EVENTS.length)]

            setPriors(prev => {
                const priorBefore = prev[randomDriver]
                const newPriors = bayesianUpdate(prev, randomDriver, randomEvent.priorChange)

                setEventLog(log => [{
                    lap: currentLap,
                    driver: randomDriver,
                    event: randomEvent,
                    priorBefore,
                    priorAfter: newPriors[randomDriver],
                }, ...log.slice(0, 19)])

                return newPriors
            })
        }, 800)

        return () => clearInterval(interval)
    }, [isRunning, currentLap, track.laps])

    // Sort drivers by probability
    const sortedDrivers = useMemo(() => {
        return DRIVERS_2025
            .map(d => ({ ...d, prob: priors[d.id] || 0 }))
            .sort((a, b) => b.prob - a.prob)
    }, [priors])

    const resetSimulation = () => {
        setCurrentLap(1)
        setEventLog([])
        setIsRunning(false)
        const initialPriors: Record<string, number> = {}
        DRIVERS_2025.forEach((d, i) => {
            initialPriors[d.id] = Math.max(0.01, 0.35 - i * 0.015)
        })
        const total = Object.values(initialPriors).reduce((a, b) => a + b, 0)
        Object.keys(initialPriors).forEach(k => initialPriors[k] /= total)
        setPriors(initialPriors)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Brain className="w-8 h-8" />
                        Bayesian Race Outcome Engine
                    </h1>
                    <p className="text-white/80 mt-1">Real-time probability updates with Bayes' theorem • Beyond F1 team capabilities</p>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Feature Info */}
                <FeatureInfo
                    title="Bayesian Race Outcome Engine"
                    description="Uses Bayes' theorem to continuously update win probabilities based on race events. Each overtake, pit stop, safety car, or mistake adjusts the probability distribution across all drivers in real-time."
                    advantage="Unlike static pre-race predictions, Bayesian inference captures how probabilities shift dynamically. This is more accurate than simple position-based predictions because it accounts for the significance of each event."
                    skills={['Bayesian statistics', 'Probability theory', 'Real-time computation', 'Event-driven architecture', 'State management']}
                    f1Context="F1 teams use Bayesian methods internally but don't share this publicly. AWS F1 Insights shows simplified win probability but doesn't explain the underlying Bayesian updates. This visualization makes the math transparent."
                />

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Control Panel */}
                    <div className="space-y-4">
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Simulation Controls</h2>

                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-2">Race</label>
                                <select
                                    value={selectedTrack}
                                    onChange={e => {
                                        setSelectedTrack(parseInt(e.target.value))
                                        resetSimulation()
                                    }}
                                    className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                    disabled={isRunning}
                                >
                                    {CALENDAR_2025.map(t => (
                                        <option key={t.round} value={t.round}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsRunning(!isRunning)}
                                    className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${isRunning
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    {isRunning ? 'Pause' : 'Start'}
                                </button>
                                <button
                                    onClick={resetSimulation}
                                    className="px-4 py-3 bg-f1-gray-600 hover:bg-f1-gray-500 rounded-lg"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mt-4 text-center">
                                <div className="text-4xl font-bold text-white font-mono">
                                    Lap {currentLap}/{track.laps}
                                </div>
                                <div className="text-gray-400">
                                    {((currentLap / track.laps) * 100).toFixed(0)}% Complete
                                </div>
                            </div>
                        </div>

                        {/* Event Log */}
                        <div className="bg-f1-gray-800 rounded-xl p-6 max-h-96 overflow-y-auto">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                Event Log
                            </h3>
                            <div className="space-y-2">
                                {eventLog.length === 0 ? (
                                    <div className="text-gray-500 text-center py-4">
                                        Start simulation to see events
                                    </div>
                                ) : (
                                    eventLog.map((event, i) => (
                                        <div
                                            key={i}
                                            className={`p-2 rounded text-sm ${event.event.priorChange > 0
                                                    ? 'bg-green-900/30 border-l-2 border-green-500'
                                                    : 'bg-red-900/30 border-l-2 border-red-500'
                                                }`}
                                        >
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">L{event.lap}</span>
                                                <span className="text-white font-bold">{event.driver}</span>
                                            </div>
                                            <div className="text-gray-300">{event.event.description}</div>
                                            <div className={`text-xs ${event.event.priorChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {(event.priorBefore * 100).toFixed(1)}% → {(event.priorAfter * 100).toFixed(1)}%
                                                ({event.event.priorChange > 0 ? '+' : ''}{(event.event.priorChange * 100).toFixed(0)}%)
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Win Probability Chart */}
                    <div className="lg:col-span-2 bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            Win Probability Distribution
                        </h2>

                        <div className="space-y-2">
                            {sortedDrivers.slice(0, 10).map((driver, i) => {
                                const prevProb = eventLog.find(e => e.driver === driver.id)?.priorBefore || driver.prob
                                const isUp = driver.prob > prevProb
                                const isDown = driver.prob < prevProb

                                return (
                                    <div key={driver.id} className="flex items-center gap-3">
                                        <div className="w-8 text-center font-bold text-gray-400">
                                            {i + 1}
                                        </div>
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: driver.color }}
                                        >
                                            {driver.id}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-white font-medium">{driver.name}</span>
                                                <span className={`font-bold font-mono ${isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-white'
                                                    }`}>
                                                    {(driver.prob * 100).toFixed(1)}%
                                                    {isUp && ' ↑'}
                                                    {isDown && ' ↓'}
                                                </span>
                                            </div>
                                            <div className="h-4 bg-f1-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${Math.min(100, driver.prob * 200)}%`,
                                                        backgroundColor: driver.color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Bayesian Formula */}
                        <div className="mt-6 p-4 bg-f1-gray-700 rounded-lg">
                            <h3 className="text-sm font-bold text-cyan-400 mb-2">Bayes' Theorem Applied</h3>
                            <div className="font-mono text-sm text-gray-300">
                                P(Win|Event) = P(Event|Win) × P(Win) / P(Event)
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Each event updates the posterior probability. Positive events (overtakes, fastest laps)
                                increase probability, while negative events (lockups, track limits) decrease it.
                            </p>
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
