'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Timer, Target, TrendingUp, Zap, ChevronRight, Trophy, AlertCircle } from 'lucide-react'

// Driver qualifying data
const DRIVERS = [
    { id: 'VER', name: 'Max Verstappen', team: 'Red Bull', color: '#1E41FF', avgQ1: 0.92, avgQ2: 0.95, avgQ3: 0.98, poles: 40 },
    { id: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#DC0000', avgQ1: 0.88, avgQ2: 0.90, avgQ3: 0.94, poles: 26 },
    { id: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#FF8700', avgQ1: 0.85, avgQ2: 0.88, avgQ3: 0.91, poles: 9 },
    { id: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', color: '#00D2BE', avgQ1: 0.82, avgQ2: 0.85, avgQ3: 0.88, poles: 104 },
    { id: 'RUS', name: 'George Russell', team: 'Mercedes', color: '#00D2BE', avgQ1: 0.80, avgQ2: 0.83, avgQ3: 0.86, poles: 5 },
    { id: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', color: '#DC0000', avgQ1: 0.78, avgQ2: 0.80, avgQ3: 0.82, poles: 6 },
    { id: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#FF8700', avgQ1: 0.75, avgQ2: 0.78, avgQ3: 0.80, poles: 2 },
    { id: 'PER', name: 'Sergio Perez', team: 'Red Bull', color: '#1E41FF', avgQ1: 0.70, avgQ2: 0.72, avgQ3: 0.74, poles: 3 },
    { id: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', color: '#006F62', avgQ1: 0.68, avgQ2: 0.70, avgQ3: 0.65, poles: 22 },
    { id: 'STR', name: 'Lance Stroll', team: 'Aston Martin', color: '#006F62', avgQ1: 0.55, avgQ2: 0.45, avgQ3: 0.30, poles: 1 },
]

// Simulated qualifying predictions
const generatePredictions = () => {
    const q1 = [...DRIVERS]
        .map(d => ({ ...d, prob: d.avgQ1 + (Math.random() - 0.5) * 0.1 }))
        .sort((a, b) => b.prob - a.prob)

    const q2Drivers = q1.slice(0, 15)
    const q2 = q2Drivers
        .map(d => ({ ...d, prob: d.avgQ2 + (Math.random() - 0.5) * 0.1 }))
        .sort((a, b) => b.prob - a.prob)

    const q3Drivers = q2.slice(0, 10)
    const q3 = q3Drivers
        .map(d => ({ ...d, prob: d.avgQ3 + (Math.random() - 0.5) * 0.1 }))
        .sort((a, b) => b.prob - a.prob)

    return { q1, q2, q3 }
}

export default function QualifyingPage() {
    const [predictions, setPredictions] = useState(generatePredictions())
    const [selectedSession, setSelectedSession] = useState<'q1' | 'q2' | 'q3'>('q3')

    const refreshPredictions = () => setPredictions(generatePredictions())

    const currentSession = predictions[selectedSession]
    const poleCandidate = predictions.q3[0]

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Timer className="w-10 h-10 text-purple-600" />
                    Qualifying Predictor
                </h1>
                <p className="text-f1-gray-600">
                    Session-by-session predictions for Q1, Q2, and Q3
                </p>
            </div>

            {/* Pole Probability Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-8 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="text-sm opacity-75">Predicted Pole Position</div>
                        <div className="text-4xl font-bold">{poleCandidate.name}</div>
                        <div className="text-sm opacity-75">{poleCandidate.team}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-bold">{(poleCandidate.prob * 100).toFixed(0)}%</div>
                        <div className="text-sm opacity-75">Pole probability</div>
                    </div>
                </div>
                <div className="mt-4 flex gap-2">
                    {predictions.q3.slice(0, 5).map((d, i) => (
                        <div key={d.id} className="bg-white/20 rounded-lg px-3 py-2 text-center flex-1">
                            <div className="text-xs opacity-75">P{i + 1}</div>
                            <div className="font-bold">{d.name.split(' ')[1]}</div>
                            <div className="text-xs">{(d.prob * 100).toFixed(0)}%</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Session Tabs */}
            <div className="flex justify-center gap-4 mb-8">
                {(['q1', 'q2', 'q3'] as const).map(session => (
                    <button
                        key={session}
                        onClick={() => setSelectedSession(session)}
                        className={`px-8 py-4 rounded-lg font-bold transition ${selectedSession === session
                                ? 'bg-f1-gray-900 text-white'
                                : 'bg-white border border-f1-gray-200 hover:shadow-md'
                            }`}
                    >
                        <div className="text-2xl">{session.toUpperCase()}</div>
                        <div className="text-xs opacity-75">
                            {session === 'q1' ? '20 → 15 advance' : session === 'q2' ? '15 → 10 advance' : 'Top 10 shootout'}
                        </div>
                    </button>
                ))}
            </div>

            {/* Session Predictions */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="p-4 bg-f1-gray-100 border-b flex justify-between items-center">
                    <h3 className="font-bold text-xl">{selectedSession.toUpperCase()} Predictions</h3>
                    <button
                        onClick={refreshPredictions}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4" />
                        Refresh Predictions
                    </button>
                </div>
                <div className="divide-y">
                    {currentSession.map((driver, i) => {
                        const isEliminated = selectedSession === 'q1' && i >= 15 || selectedSession === 'q2' && i >= 10
                        const isAdvancing = selectedSession === 'q1' && i < 15 || selectedSession === 'q2' && i < 10 || selectedSession === 'q3'

                        return (
                            <div
                                key={driver.id}
                                className={`p-4 flex items-center gap-4 ${isEliminated ? 'bg-red-50 opacity-60' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-yellow-400 text-yellow-900' :
                                        i === 1 ? 'bg-gray-300 text-gray-700' :
                                            i === 2 ? 'bg-orange-300 text-orange-800' :
                                                'bg-f1-gray-100'
                                    }`}>
                                    P{i + 1}
                                </div>
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: driver.color }} />
                                <div className="flex-1">
                                    <div className="font-bold">{driver.name}</div>
                                    <div className="text-sm text-f1-gray-500">{driver.team}</div>
                                </div>
                                <div className="w-32">
                                    <div className="h-3 bg-f1-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${driver.prob * 100}%`, backgroundColor: driver.color }}
                                        />
                                    </div>
                                </div>
                                <div className="w-16 text-right font-mono font-bold">{(driver.prob * 100).toFixed(0)}%</div>
                                <div className="w-24 text-right">
                                    {isAdvancing ? (
                                        <span className="text-green-600 font-bold flex items-center justify-end gap-1">
                                            Advances <ChevronRight className="w-4 h-4" />
                                        </span>
                                    ) : (
                                        <span className="text-red-600 font-bold">Eliminated</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Key Factors */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Key Qualifying Factors
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl mb-2">🏎️</div>
                        <div className="font-bold">Car Performance</div>
                        <div className="text-sm text-f1-gray-500">One-lap pace, downforce levels, tire warm-up characteristics</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl mb-2">⚡</div>
                        <div className="font-bold">Driver Skill</div>
                        <div className="text-sm text-f1-gray-500">Historical qualifying form, track specialization, clutch factor</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl mb-2">🌡️</div>
                        <div className="font-bold">Conditions</div>
                        <div className="text-sm text-f1-gray-500">Track temperature, wind, evolving grip levels</div>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/whatif" className="bg-f1-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
                    What-If Lab
                </Link>
                <Link href="/tracks" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Track Profiles
                </Link>
            </div>
        </div>
    )
}
