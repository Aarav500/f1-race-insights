'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Timer, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'

const DRIVERS = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF' },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700' },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000' },
    { id: 'HAM', name: 'Hamilton', team: 'Ferrari', color: '#DC0000' },
    { id: 'PIA', name: 'Piastri', team: 'McLaren', color: '#FF8700' },
    { id: 'RUS', name: 'Russell', team: 'Mercedes', color: '#00D2BE' },
]

const COMPOUNDS = [
    { id: 'soft', name: 'Soft', color: '#e10600', pitDelta: 0, avgLife: 18 },
    { id: 'medium', name: 'Medium', color: '#fcd34d', pitDelta: 0.4, avgLife: 28 },
    { id: 'hard', name: 'Hard', color: '#f5f5f5', pitDelta: 0.9, avgLife: 42 },
]

export default function UndercutPage() {
    const [yourDriver, setYourDriver] = useState('NOR')
    const [rivalDriver, setRivalDriver] = useState('VER')
    const [currentGap, setCurrentGap] = useState(2.5)
    const [currentLap, setCurrentLap] = useState(15)
    const [totalLaps, setTotalLaps] = useState(57)
    const [yourTireAge, setYourTireAge] = useState(12)
    const [rivalTireAge, setRivalTireAge] = useState(10)
    const [yourCompound, setYourCompound] = useState('medium')
    const [rivalCompound, setRivalCompound] = useState('medium')
    const [pitLaneTime, setPitLaneTime] = useState(22)

    const analysis = useMemo(() => {
        // Undercut calculation
        // Key factors: tire deg advantage, pit lane time, traffic, tire delta
        const yourDeg = yourTireAge * 0.05 // 0.05s per lap of deg
        const rivalDeg = rivalTireAge * 0.05
        const freshTireAdvantage = 1.5 // Fresh tires are ~1.5s faster initially

        // Time gained from undercut = fresh tire advantage - pit time cost + rival deg
        const undercutGain = freshTireAdvantage + rivalDeg - (pitLaneTime - currentGap)
        const undercutSuccess = undercutGain > 0

        // Overcut calculation
        // Stay out while rival pits, gain track position, pit later with gap
        const overcutGain = currentGap + yourDeg - rivalDeg
        const overcutSuccess = overcutGain > pitLaneTime - 5 // Need enough gap to stay ahead

        // Recommendation
        let recommendation: 'undercut' | 'overcut' | 'stay' | 'cover'
        let confidence: number
        let explanation: string

        if (currentGap < 1.5) {
            recommendation = 'undercut'
            confidence = 85
            explanation = `Gap of ${currentGap}s is within undercut window. Fresh tires will give ~1.5s/lap advantage.`
        } else if (currentGap > 4 && rivalTireAge > yourTireAge) {
            recommendation = 'overcut'
            confidence = 70
            explanation = `Large gap and fresher tires suggest overcut. Rival's tires are ${rivalTireAge - yourTireAge} laps older.`
        } else if (currentGap > 3) {
            recommendation = 'stay'
            confidence = 60
            explanation = `Gap too large for undercut. Maintain position and wait for strategic opportunity.`
        } else {
            recommendation = 'cover'
            confidence = 75
            explanation = `Cover rival's pit stop to maintain track position. Gap is marginal.`
        }

        return {
            undercutGain: undercutGain.toFixed(2),
            overcutGain: overcutGain.toFixed(2),
            undercutSuccess,
            overcutSuccess,
            recommendation,
            confidence,
            explanation,
            optimalPitWindow: Math.max(1, currentLap + 3) + '-' + Math.min(totalLaps - 10, currentLap + 8),
        }
    }, [yourDriver, rivalDriver, currentGap, currentLap, totalLaps, yourTireAge, rivalTireAge, yourCompound, rivalCompound, pitLaneTime])

    const getDriver = (id: string) => DRIVERS.find(d => d.id === id)!

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Timer className="w-8 h-8" />
                        Undercut/Overcut Calculator
                    </h1>
                    <p className="text-white/80 mt-1">Real-time pit strategy decision tool used by F1 strategists</p>
                </div>
            </div>

            <div className="container mx-auto p-4 grid lg:grid-cols-2 gap-6">
                {/* Input Panel */}
                <div className="space-y-4">
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Race Situation</h2>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Your Driver</label>
                                <select
                                    value={yourDriver}
                                    onChange={e => setYourDriver(e.target.value)}
                                    className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                >
                                    {DRIVERS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Rival Driver</label>
                                <select
                                    value={rivalDriver}
                                    onChange={e => setRivalDriver(e.target.value)}
                                    className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                >
                                    {DRIVERS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Gap to Rival: {currentGap}s</label>
                                <input
                                    type="range" min="0" max="10" step="0.1"
                                    value={currentGap}
                                    onChange={e => setCurrentGap(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Current Lap</label>
                                    <input
                                        type="number" min="1" max={totalLaps}
                                        value={currentLap}
                                        onChange={e => setCurrentLap(parseInt(e.target.value))}
                                        className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Total Laps</label>
                                    <input
                                        type="number" min="20" max="78"
                                        value={totalLaps}
                                        onChange={e => setTotalLaps(parseInt(e.target.value))}
                                        className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Tire Status</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Your Tire Age: {yourTireAge} laps</label>
                                <input
                                    type="range" min="0" max="40"
                                    value={yourTireAge}
                                    onChange={e => setYourTireAge(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <select
                                    value={yourCompound}
                                    onChange={e => setYourCompound(e.target.value)}
                                    className="w-full bg-f1-gray-700 text-white rounded-lg p-2 mt-2"
                                >
                                    {COMPOUNDS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Rival Tire Age: {rivalTireAge} laps</label>
                                <input
                                    type="range" min="0" max="40"
                                    value={rivalTireAge}
                                    onChange={e => setRivalTireAge(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <select
                                    value={rivalCompound}
                                    onChange={e => setRivalCompound(e.target.value)}
                                    className="w-full bg-f1-gray-700 text-white rounded-lg p-2 mt-2"
                                >
                                    {COMPOUNDS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="space-y-4">
                    {/* Main Recommendation */}
                    <div className={`rounded-xl p-6 ${analysis.recommendation === 'undercut' ? 'bg-gradient-to-r from-green-900 to-emerald-900 border border-green-500' :
                            analysis.recommendation === 'overcut' ? 'bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-500' :
                                analysis.recommendation === 'cover' ? 'bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-500' :
                                    'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-white uppercase">{analysis.recommendation}</h2>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{analysis.confidence}%</div>
                                <div className="text-sm text-gray-400">Confidence</div>
                            </div>
                        </div>
                        <p className="text-white/80">{analysis.explanation}</p>
                        <div className="mt-4 text-sm text-gray-400">
                            Optimal pit window: Lap <span className="text-white font-bold">{analysis.optimalPitWindow}</span>
                        </div>
                    </div>

                    {/* Strategy Comparison */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Strategy Comparison</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-f1-gray-700">
                                <div className="flex items-center gap-3">
                                    {analysis.undercutSuccess ?
                                        <CheckCircle className="w-6 h-6 text-green-400" /> :
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    }
                                    <div>
                                        <div className="font-bold text-white">Undercut</div>
                                        <div className="text-sm text-gray-400">Pit before rival</div>
                                    </div>
                                </div>
                                <div className={`text-2xl font-bold ${parseFloat(analysis.undercutGain) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {parseFloat(analysis.undercutGain) > 0 ? '+' : ''}{analysis.undercutGain}s
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-f1-gray-700">
                                <div className="flex items-center gap-3">
                                    {analysis.overcutSuccess ?
                                        <CheckCircle className="w-6 h-6 text-green-400" /> :
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    }
                                    <div>
                                        <div className="font-bold text-white">Overcut</div>
                                        <div className="text-sm text-gray-400">Pit after rival</div>
                                    </div>
                                </div>
                                <div className={`text-2xl font-bold ${parseFloat(analysis.overcutGain) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {parseFloat(analysis.overcutGain) > 0 ? '+' : ''}{analysis.overcutGain}s
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Battle Info */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Battle Summary</h3>
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: getDriver(yourDriver).color }}>
                                    {yourDriver}
                                </div>
                                <div className="text-white font-bold">{getDriver(yourDriver).name}</div>
                                <div className="text-sm text-gray-400">{getDriver(yourDriver).team}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{currentGap}s</div>
                                <div className="text-gray-400">Gap</div>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: getDriver(rivalDriver).color }}>
                                    {rivalDriver}
                                </div>
                                <div className="text-white font-bold">{getDriver(rivalDriver).name}</div>
                                <div className="text-sm text-gray-400">{getDriver(rivalDriver).team}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-teal-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
