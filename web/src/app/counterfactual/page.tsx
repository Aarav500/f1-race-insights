'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { GitBranch, ArrowRight, RotateCcw, History, TrendingUp, TrendingDown } from 'lucide-react'

const HISTORICAL_SCENARIOS = [
    {
        id: 'abu2021',
        name: 'Abu Dhabi 2021',
        description: 'Hamilton vs Verstappen title decider',
        original: { winner: 'VER', p2: 'HAM', result: 'Verstappen wins title' },
        factors: [
            { id: 'sc', name: 'Safety Car decision', options: ['Lapped cars unlap', 'No unlapping', 'Red flag'] },
            { id: 'tire', name: 'Hamilton pit under SC', options: ['Stay out (actual)', 'Pit for softs'] },
        ]
    },
    {
        id: 'brazil2008',
        name: 'Brazil 2008',
        description: 'Hamilton vs Massa title finale',
        original: { winner: 'MAS', p2: 'ALO', result: 'Hamilton wins title P5' },
        factors: [
            { id: 'rain', name: 'Rain timing', options: ['Late rain (actual)', 'No rain', 'Early rain'] },
            { id: 'glock', name: 'Glock pit decision', options: ['Stay out on drys (actual)', 'Pit for wets'] },
        ]
    },
    {
        id: 'monaco2022',
        name: 'Monaco 2022',
        description: 'Ferrari strategy disaster',
        original: { winner: 'PER', p2: 'SAI', result: 'Leclerc P4 from pole' },
        factors: [
            { id: 'charles', name: 'Leclerc pit timing', options: ['Double stack (actual)', 'Pit first', 'Stay out longer'] },
            { id: 'compound', name: 'Tire compound', options: ['Intermediates (actual)', 'Slicks gamble'] },
        ]
    },
    {
        id: 'hungary2019',
        name: 'Hungary 2019',
        description: 'Hamilton undercut masterclass',
        original: { winner: 'HAM', p2: 'VER', result: 'Mercedes strategy win' },
        factors: [
            { id: 'strategy', name: 'Mercedes strategy', options: ['2-stop (actual)', '1-stop conservative'] },
            { id: 'redbull', name: 'Red Bull response', options: ['Cover (actual)', 'Overcut attempt'] },
        ]
    },
]

interface CounterfactualResult {
    winner: string
    p2: string
    p3: string
    narrative: string
    probability: number
}

export default function CounterfactualPage() {
    const [selectedScenario, setSelectedScenario] = useState(HISTORICAL_SCENARIOS[0])
    const [selections, setSelections] = useState<Record<string, number>>({})
    const [showResult, setShowResult] = useState(false)

    const handleFactorChange = (factorId: string, optionIndex: number) => {
        setSelections(prev => ({ ...prev, [factorId]: optionIndex }))
        setShowResult(false)
    }

    const result = useMemo((): CounterfactualResult => {
        if (selectedScenario.id === 'abu2021') {
            const sc = selections['sc'] ?? 0
            const tire = selections['tire'] ?? 0

            if (sc === 1) { // No unlapping
                return {
                    winner: 'HAM', p2: 'VER', p3: 'SAI',
                    narrative: 'Without lapped cars unlapping, Hamilton maintains 12-second gap and wins 8th title.',
                    probability: 95,
                }
            }
            if (sc === 2) { // Red flag
                return {
                    winner: 'VER', p2: 'HAM', p3: 'SAI',
                    narrative: 'Red flag restart on equal tires. Verstappen\'s start advantage prevails.',
                    probability: 60,
                }
            }
            if (tire === 1) { // Hamilton pits
                return {
                    winner: 'HAM', p2: 'VER', p3: 'SAI',
                    narrative: 'Hamilton on fresh softs easily defends from Verstappen on the restart.',
                    probability: 85,
                }
            }
        }

        if (selectedScenario.id === 'brazil2008') {
            const rain = selections['rain'] ?? 0
            const glock = selections['glock'] ?? 0

            if (rain === 1) { // No rain
                return {
                    winner: 'MAS', p2: 'ALO', p3: 'RAI',
                    narrative: 'Massa wins home race AND title! Hamilton finishes P6.',
                    probability: 90,
                }
            }
            if (glock === 1) { // Glock pits
                return {
                    winner: 'MAS', p2: 'ALO', p3: 'VET',
                    narrative: 'Glock pitting keeps him ahead of Hamilton. Massa wins title at home!',
                    probability: 75,
                }
            }
        }

        if (selectedScenario.id === 'monaco2022') {
            const charles = selections['charles'] ?? 0
            const compound = selections['compound'] ?? 0

            if (charles === 1) { // Pit first
                return {
                    winner: 'LEC', p2: 'SAI', p3: 'PER',
                    narrative: 'Leclerc pits first into clear air. Ferrari 1-2 at Monaco!',
                    probability: 80,
                }
            }
            if (charles === 2) { // Stay out longer
                return {
                    winner: 'LEC', p2: 'PER', p3: 'SAI',
                    narrative: 'Extended stint allows track to dry. Leclerc overcuts everyone.',
                    probability: 55,
                }
            }
            if (compound === 1) { // Slicks gamble
                return {
                    winner: 'LEC', p2: 'PER', p3: 'SAI',
                    narrative: 'Risky slick gamble pays off as track dries faster than expected.',
                    probability: 35,
                }
            }
        }

        if (selectedScenario.id === 'hungary2019') {
            const strategy = selections['strategy'] ?? 0
            const rb = selections['rb'] ?? 0

            if (strategy === 1) { // 1-stop
                return {
                    winner: 'VER', p2: 'HAM', p3: 'LEC',
                    narrative: 'Verstappen with tire advantage in final laps. First victory!',
                    probability: 70,
                }
            }
            if (rb === 1) { // Overcut
                return {
                    winner: 'VER', p2: 'HAM', p3: 'LEC',
                    narrative: 'Overcut onto fresh tires gives Verstappen track position.',
                    probability: 60,
                }
            }
        }

        // Default: original result
        return {
            winner: selectedScenario.original.winner,
            p2: selectedScenario.original.p2,
            p3: 'SAI',
            narrative: 'Original outcome: ' + selectedScenario.original.result,
            probability: 100,
        }
    }, [selectedScenario, selections])

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600 to-red-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <GitBranch className="w-8 h-8" />
                        Counterfactual Race Simulator
                    </h1>
                    <p className="text-white/80 mt-1">&quot;What if...?&quot; scenarios • Causal inference analysis</p>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Scenario Selection */}
                <div className="bg-f1-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <History className="w-5 h-5 text-yellow-400" />
                        Select Historical Race
                    </h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        {HISTORICAL_SCENARIOS.map(scenario => (
                            <button
                                key={scenario.id}
                                onClick={() => {
                                    setSelectedScenario(scenario)
                                    setSelections({})
                                    setShowResult(false)
                                }}
                                className={`p-4 rounded-lg text-left transition ${selectedScenario.id === scenario.id
                                        ? 'bg-f1-red text-white ring-2 ring-red-400'
                                        : 'bg-f1-gray-700 text-white hover:bg-f1-gray-600'
                                    }`}
                            >
                                <div className="font-bold">{scenario.name}</div>
                                <div className="text-sm opacity-80">{scenario.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Original Outcome */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Original Outcome</h2>
                        <div className="bg-f1-gray-700 rounded-lg p-6">
                            <div className="flex items-center justify-center gap-8 mb-4">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-yellow-400">🥇</div>
                                    <div className="text-2xl font-bold text-white">{selectedScenario.original.winner}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-400">🥈</div>
                                    <div className="text-xl font-bold text-gray-300">{selectedScenario.original.p2}</div>
                                </div>
                            </div>
                            <div className="text-center text-gray-400">{selectedScenario.original.result}</div>
                        </div>
                    </div>

                    {/* What-If Controls */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Change Factors</h2>
                        <div className="space-y-4">
                            {selectedScenario.factors.map(factor => (
                                <div key={factor.id}>
                                    <div className="text-gray-400 text-sm mb-2">{factor.name}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {factor.options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleFactorChange(factor.id, idx)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${(selections[factor.id] ?? 0) === idx
                                                        ? 'bg-f1-red text-white'
                                                        : 'bg-f1-gray-700 text-gray-300 hover:bg-f1-gray-600'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowResult(true)}
                            className="w-full mt-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:from-rose-500 hover:to-red-500 transition"
                        >
                            <GitBranch className="w-5 h-5" />
                            Simulate Alternate Timeline
                        </button>
                    </div>
                </div>

                {/* Result */}
                {showResult && (
                    <div className="mt-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-4">
                            <ArrowRight className="w-6 h-6 text-purple-400" />
                            <h2 className="text-xl font-bold text-white">Alternate Timeline Result</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center justify-center gap-8 mb-4">
                                    <div className="text-center">
                                        <div className="text-5xl">🥇</div>
                                        <div className="text-3xl font-bold text-white">{result.winner}</div>
                                        {result.winner !== selectedScenario.original.winner && (
                                            <div className="text-green-400 text-sm flex items-center justify-center gap-1">
                                                <TrendingUp className="w-4 h-4" /> CHANGED
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl">🥈</div>
                                        <div className="text-2xl font-bold text-gray-300">{result.p2}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl">🥉</div>
                                        <div className="text-xl font-bold text-gray-400">{result.p3}</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="bg-f1-gray-800 rounded-lg p-4">
                                    <div className="text-white mb-2">{result.narrative}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">Confidence:</span>
                                        <div className="flex-1 h-2 bg-f1-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-500"
                                                style={{ width: `${result.probability}%` }}
                                            />
                                        </div>
                                        <span className="text-purple-400 font-bold">{result.probability}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-rose-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
