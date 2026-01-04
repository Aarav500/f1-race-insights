'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Bot, Play, Pause, RotateCcw, TrendingUp, Zap, Timer, Trophy } from 'lucide-react'

interface RLState {
    lap: number
    tireAge: number
    compound: 'soft' | 'medium' | 'hard'
    position: number
    gapAhead: number
    gapBehind: number
    fuelLoad: number
}

interface RLAction {
    action: 'stay' | 'pit_soft' | 'pit_medium' | 'pit_hard'
    qValue: number
}

export default function RLStrategyPage() {
    const [isRunning, setIsRunning] = useState(false)
    const [totalLaps, setTotalLaps] = useState(57)
    const [state, setState] = useState<RLState>({
        lap: 1,
        tireAge: 0,
        compound: 'medium',
        position: 3,
        gapAhead: 2.5,
        gapBehind: 1.8,
        fuelLoad: 100,
    })
    const [history, setHistory] = useState<{ lap: number, action: string, reward: number }[]>([])
    const [episodeReward, setEpisodeReward] = useState(0)

    // Simple Q-learning agent simulation
    const getQValues = (state: RLState): RLAction[] => {
        const tireCliff = state.compound === 'soft' ? 15 : state.compound === 'medium' ? 28 : 45
        const lapsRemaining = totalLaps - state.lap
        const tireNearCliff = state.tireAge > tireCliff - 3

        // Simulate Q-values based on heuristics (would be learned in real RL)
        const stayQ = tireNearCliff ? -5 : 2 + (state.position * -0.5)
        const pitSoftQ = lapsRemaining < 20 ? 3 : -2
        const pitMedQ = lapsRemaining > 15 && lapsRemaining < 40 ? 4 : 0
        const pitHardQ = lapsRemaining > 30 ? 3 : -3

        return [
            { action: 'stay', qValue: stayQ + Math.random() * 0.5 },
            { action: 'pit_soft', qValue: pitSoftQ + Math.random() * 0.5 },
            { action: 'pit_medium', qValue: pitMedQ + Math.random() * 0.5 },
            { action: 'pit_hard', qValue: pitHardQ + Math.random() * 0.5 },
        ].sort((a, b) => b.qValue - a.qValue) as RLAction[]
    }

    const step = () => {
        if (state.lap >= totalLaps) {
            setIsRunning(false)
            return
        }

        const qValues = getQValues(state)
        const bestAction = qValues[0]

        let reward = 0
        let newState = { ...state, lap: state.lap + 1 }

        if (bestAction.action === 'stay') {
            newState.tireAge++
            newState.fuelLoad = Math.max(0, newState.fuelLoad - (100 / totalLaps))

            // Tire degradation affects position
            const tireCliff = state.compound === 'soft' ? 15 : state.compound === 'medium' ? 28 : 45
            if (state.tireAge > tireCliff) {
                reward -= 2 // Penalty for worn tires
                if (Math.random() > 0.7) {
                    newState.position = Math.min(20, newState.position + 1)
                }
            } else {
                reward += 1 // Reward for staying on good tires
            }
        } else {
            // Pit stop
            newState.tireAge = 0
            reward -= 3 // Pit stop time penalty

            if (bestAction.action === 'pit_soft') newState.compound = 'soft'
            else if (bestAction.action === 'pit_medium') newState.compound = 'medium'
            else newState.compound = 'hard'

            // Position loss from pit
            newState.position = Math.min(20, newState.position + 2)
        }

        // Race position rewards
        if (newState.position === 1) reward += 5
        else if (newState.position <= 3) reward += 3
        else if (newState.position <= 10) reward += 1

        // Update gaps (simplified)
        newState.gapAhead = Math.max(0, newState.gapAhead + (Math.random() - 0.5) * 0.5)
        newState.gapBehind = Math.max(0, newState.gapBehind + (Math.random() - 0.5) * 0.5)

        setState(newState)
        setHistory(prev => [...prev, { lap: state.lap, action: bestAction.action, reward }])
        setEpisodeReward(prev => prev + reward)
    }

    useEffect(() => {
        if (!isRunning) return
        const interval = setInterval(step, 500)
        return () => clearInterval(interval)
    }, [isRunning, state])

    const reset = () => {
        setState({
            lap: 1,
            tireAge: 0,
            compound: 'medium',
            position: 3,
            gapAhead: 2.5,
            gapBehind: 1.8,
            fuelLoad: 100,
        })
        setHistory([])
        setEpisodeReward(0)
        setIsRunning(false)
    }

    const qValues = useMemo(() => getQValues(state), [state])

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bot className="w-8 h-8" />
                        RL Strategy Agent
                    </h1>
                    <p className="text-white/80 mt-1">Reinforcement Learning pit strategy optimization • Q-Learning demo</p>
                </div>
            </div>

            <div className="container mx-auto p-4 grid lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="space-y-4">
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Episode Controls</h2>
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setIsRunning(!isRunning)}
                                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${isRunning ? 'bg-yellow-600' : 'bg-green-600'
                                    } text-white`}
                            >
                                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                {isRunning ? 'Pause' : 'Run'}
                            </button>
                            <button
                                onClick={reset}
                                className="px-4 py-3 rounded-lg bg-f1-gray-700 text-white hover:bg-f1-gray-600"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Race Length: {totalLaps} laps</label>
                            <input
                                type="range" min="30" max="78"
                                value={totalLaps}
                                onChange={e => setTotalLaps(parseInt(e.target.value))}
                                className="w-full"
                                disabled={isRunning}
                            />
                        </div>
                    </div>

                    {/* Current State */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Current State
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Lap</span>
                                <span className="text-white font-bold">{state.lap} / {totalLaps}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Position</span>
                                <span className="text-white font-bold">P{state.position}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Compound</span>
                                <span className={`font-bold ${state.compound === 'soft' ? 'text-red-400' :
                                        state.compound === 'medium' ? 'text-yellow-400' : 'text-white'
                                    }`}>{state.compound.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Tire Age</span>
                                <span className="text-white font-bold">{state.tireAge} laps</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Fuel</span>
                                <span className="text-white font-bold">{state.fuelLoad.toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Episode Stats */}
                    <div className="bg-gradient-to-br from-purple-900/50 to-violet-900/50 rounded-xl p-6 border border-purple-500/30">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            Episode Stats
                        </h2>
                        <div className="text-center">
                            <div className="text-5xl font-bold text-white">{episodeReward.toFixed(1)}</div>
                            <div className="text-gray-400">Total Reward</div>
                        </div>
                        <div className="mt-4 text-center">
                            <div className="text-2xl font-bold text-purple-400">{history.filter(h => h.action !== 'stay').length}</div>
                            <div className="text-gray-400">Pit Stops</div>
                        </div>
                    </div>
                </div>

                {/* Q-Values & Visualization */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Q-Value Display */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Q-Values (Action Values)</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {qValues.map((q, idx) => (
                                <div
                                    key={q.action}
                                    className={`p-4 rounded-lg text-center transition ${idx === 0 ? 'bg-green-600 ring-2 ring-green-400' : 'bg-f1-gray-700'
                                        }`}
                                >
                                    <div className="text-white font-bold text-sm uppercase">{q.action.replace('_', ' ')}</div>
                                    <div className={`text-2xl font-bold ${idx === 0 ? 'text-white' : 'text-gray-300'}`}>
                                        {q.qValue.toFixed(2)}
                                    </div>
                                    {idx === 0 && <div className="text-xs text-green-200 mt-1">SELECTED</div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress Visualization */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Race Progress</h2>
                        <div className="relative h-12 bg-f1-gray-700 rounded-lg overflow-hidden mb-4">
                            <div
                                className="absolute h-full bg-gradient-to-r from-purple-600 to-violet-600 transition-all duration-300"
                                style={{ width: `${(state.lap / totalLaps) * 100}%` }}
                            />
                            {history.filter(h => h.action !== 'stay').map((pit, idx) => (
                                <div
                                    key={idx}
                                    className="absolute top-0 bottom-0 w-1 bg-yellow-400"
                                    style={{ left: `${(pit.lap / totalLaps) * 100}%` }}
                                    title={`Pit lap ${pit.lap}`}
                                />
                            ))}
                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                Lap {state.lap} / {totalLaps}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-purple-600 rounded" />
                                <span className="text-gray-400">Progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-yellow-400 rounded" />
                                <span className="text-gray-400">Pit Stops</span>
                            </div>
                        </div>
                    </div>

                    {/* Action History */}
                    <div className="bg-f1-gray-800 rounded-xl p-6 max-h-64 overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Timer className="w-5 h-5 text-blue-400" />
                            Action Log
                        </h2>
                        {history.length === 0 ? (
                            <div className="text-gray-400 text-center py-8">Press Run to start the episode</div>
                        ) : (
                            <div className="space-y-2">
                                {history.slice().reverse().slice(0, 20).map((h, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-f1-gray-700 rounded-lg text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">Lap {h.lap}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${h.action === 'stay' ? 'bg-gray-600 text-gray-300' :
                                                    h.action.includes('soft') ? 'bg-red-600 text-white' :
                                                        h.action.includes('medium') ? 'bg-yellow-600 text-black' :
                                                            'bg-white text-black'
                                                }`}>
                                                {h.action.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <span className={h.reward >= 0 ? 'text-green-400' : 'text-red-400'}>
                                            {h.reward >= 0 ? '+' : ''}{h.reward.toFixed(1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-purple-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
