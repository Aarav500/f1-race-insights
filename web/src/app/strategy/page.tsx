'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Timer, Fuel, Settings, TrendingUp, ArrowRight, AlertCircle, Target, Zap } from 'lucide-react'

// Tire compound data
const COMPOUNDS = [
    { id: 'soft', name: 'Soft', color: '#e10600', durability: 18, pace: 0, pitDegradation: 0.08 },
    { id: 'medium', name: 'Medium', color: '#fcd34d', durability: 28, pace: 0.4, pitDegradation: 0.05 },
    { id: 'hard', name: 'Hard', color: '#f5f5f5', durability: 42, pace: 0.9, pitDegradation: 0.03 },
]

// Strategy presets
const STRATEGIES = [
    {
        id: 'one-stop',
        name: '1-Stop Strategy',
        description: 'Aggressive tire management, minimal time loss',
        stints: [
            { compound: 'medium', startLap: 1, endLap: 30 },
            { compound: 'hard', startLap: 31, endLap: 57 },
        ],
        totalPitTime: 22,
        riskLevel: 'Low',
        fuelSaving: 'High',
    },
    {
        id: 'two-stop',
        name: '2-Stop Strategy',
        description: 'Balance of pace and tire life',
        stints: [
            { compound: 'soft', startLap: 1, endLap: 18 },
            { compound: 'medium', startLap: 19, endLap: 38 },
            { compound: 'soft', startLap: 39, endLap: 57 },
        ],
        totalPitTime: 44,
        riskLevel: 'Medium',
        fuelSaving: 'Medium',
    },
    {
        id: 'three-stop',
        name: '3-Stop Strategy',
        description: 'Maximum attack, fresh tires throughout',
        stints: [
            { compound: 'soft', startLap: 1, endLap: 14 },
            { compound: 'soft', startLap: 15, endLap: 28 },
            { compound: 'medium', startLap: 29, endLap: 42 },
            { compound: 'soft', startLap: 43, endLap: 57 },
        ],
        totalPitTime: 66,
        riskLevel: 'High',
        fuelSaving: 'Low',
    },
]

export default function StrategyPage() {
    const [selectedStrategy, setSelectedStrategy] = useState('two-stop')
    const [raceLaps, setRaceLaps] = useState(57)
    const [pitLaneTime, setPitLaneTime] = useState(22)
    const [degradationRate, setDegradationRate] = useState(1.0)

    const strategy = STRATEGIES.find(s => s.id === selectedStrategy)!

    // Calculate estimated race time for each strategy
    const calculateRaceTime = (strat: typeof strategy) => {
        let totalTime = 0
        strat.stints.forEach(stint => {
            const compound = COMPOUNDS.find(c => c.id === stint.compound)!
            const stintLaps = stint.endLap - stint.startLap + 1
            // Base lap time + compound penalty + degradation
            for (let lap = 0; lap < stintLaps; lap++) {
                const lapDegradation = compound.pitDegradation * lap * degradationRate
                totalTime += 90 + compound.pace + lapDegradation
            }
        })
        // Add pit stop time
        totalTime += (strat.stints.length - 1) * pitLaneTime
        return totalTime
    }

    const strategyTimes = STRATEGIES.map(s => ({
        ...s,
        estimatedTime: calculateRaceTime(s),
    })).sort((a, b) => a.estimatedTime - b.estimatedTime)

    const fastestTime = strategyTimes[0].estimatedTime

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Timer className="w-10 h-10 text-orange-600" />
                    Pit Strategy Simulator
                </h1>
                <p className="text-f1-gray-600">
                    Compare 1-stop, 2-stop, and 3-stop strategies with interactive parameters
                </p>
            </div>

            {/* Parameters */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    Race Parameters
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Race Distance (laps)</label>
                        <input
                            type="range"
                            min={40}
                            max={78}
                            value={raceLaps}
                            onChange={(e) => setRaceLaps(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-center font-bold text-2xl mt-2">{raceLaps}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Pit Lane Time (sec)</label>
                        <input
                            type="range"
                            min={18}
                            max={30}
                            value={pitLaneTime}
                            onChange={(e) => setPitLaneTime(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-center font-bold text-2xl mt-2">{pitLaneTime}s</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Tire Degradation Rate</label>
                        <input
                            type="range"
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            value={degradationRate}
                            onChange={(e) => setDegradationRate(parseFloat(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-center font-bold text-2xl mt-2">{degradationRate.toFixed(1)}x</div>
                    </div>
                </div>
            </div>

            {/* Strategy Comparison */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {strategyTimes.map((strat, rank) => (
                    <button
                        key={strat.id}
                        onClick={() => setSelectedStrategy(strat.id)}
                        className={`p-6 rounded-lg text-left transition ${selectedStrategy === strat.id
                                ? 'bg-f1-gray-900 text-white shadow-xl scale-105'
                                : 'bg-white border border-f1-gray-200 hover:shadow-lg'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-sm opacity-75">
                                    {rank === 0 ? '🥇 Fastest' : rank === 1 ? '🥈 Second' : '🥉 Third'}
                                </div>
                                <div className="text-xl font-bold">{strat.name}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold ${strat.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                                    strat.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                }`}>
                                {strat.riskLevel} Risk
                            </div>
                        </div>
                        <div className="text-3xl font-mono font-bold mb-2">
                            {Math.floor(strat.estimatedTime / 60)}:{String(Math.floor(strat.estimatedTime % 60)).padStart(2, '0')}
                        </div>
                        <div className="text-sm opacity-75 mb-4">
                            {rank === 0 ? 'Fastest strategy' : `+${(strat.estimatedTime - fastestTime).toFixed(1)}s`}
                        </div>
                        <div className="flex gap-1">
                            {strat.stints.map((stint, i) => {
                                const compound = COMPOUNDS.find(c => c.id === stint.compound)!
                                return (
                                    <div
                                        key={i}
                                        className="flex-1 h-3 rounded"
                                        style={{ backgroundColor: compound.color, border: stint.compound === 'hard' ? '1px solid #ccc' : 'none' }}
                                        title={`${compound.name}: Laps ${stint.startLap}-${stint.endLap}`}
                                    />
                                )
                            })}
                        </div>
                    </button>
                ))}
            </div>

            {/* Selected Strategy Detail */}
            <div className="bg-gradient-to-r from-f1-gray-900 to-f1-gray-800 rounded-xl p-6 mb-8 text-white">
                <h3 className="text-xl font-bold mb-4">{strategy.name} - Stint Breakdown</h3>
                <div className="grid md:grid-cols-4 gap-4">
                    {strategy.stints.map((stint, i) => {
                        const compound = COMPOUNDS.find(c => c.id === stint.compound)!
                        const stintLength = stint.endLap - stint.startLap + 1
                        return (
                            <div key={i} className="bg-black/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: compound.color, border: stint.compound === 'hard' ? '2px solid #ccc' : 'none' }} />
                                    <span className="font-bold">Stint {i + 1}</span>
                                </div>
                                <div className="text-2xl font-bold">{stintLength} laps</div>
                                <div className="text-sm opacity-75">Laps {stint.startLap} → {stint.endLap}</div>
                                <div className="text-xs mt-2" style={{ color: compound.color }}>{compound.name}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Tire Compounds Legend */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-f1-red" />
                    Tire Compound Characteristics
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {COMPOUNDS.map(compound => (
                        <div key={compound.id} className="border rounded-lg p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: compound.color, border: compound.id === 'hard' ? '2px solid #ccc' : 'none' }} />
                            <div>
                                <div className="font-bold">{compound.name}</div>
                                <div className="text-sm text-f1-gray-500">
                                    Durability: ~{compound.durability} laps
                                </div>
                                <div className="text-sm text-f1-gray-500">
                                    Pace delta: +{compound.pace.toFixed(1)}s/lap
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Insight */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Strategy Insight
                </h3>
                <p className="text-f1-gray-700">
                    {selectedStrategy === 'one-stop' && 'The 1-stop strategy minimizes time lost in the pit lane but requires excellent tire management. Best suited for tracks with low degradation like Monaco or Hungary.'}
                    {selectedStrategy === 'two-stop' && 'The 2-stop strategy offers the best balance between fresh tire pace and pit stop time loss. Most commonly used strategy in modern F1.'}
                    {selectedStrategy === 'three-stop' && 'The 3-stop strategy maximizes pace with fresh tires but loses significant time to extra pit stops. Only viable at high-degradation circuits or when significantly faster than rivals.'}
                </p>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/whatif" className="bg-f1-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                    What-If Lab <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/tracks" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Track Profiles
                </Link>
            </div>
        </div>
    )
}
