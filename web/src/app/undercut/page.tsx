'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Timer, AlertTriangle, CheckCircle } from 'lucide-react'
import { DRIVERS_2025, CALENDAR_2025, TIRE_COMPOUNDS, PIT_STOP_DATA } from '@/constants/f1-data'
import FeatureInfo from '@/components/FeatureInfo'

export default function UndercutPage() {
    const [yourDriver, setYourDriver] = useState('NOR')
    const [rivalDriver, setRivalDriver] = useState('VER')
    const [currentGap, setCurrentGap] = useState(2.5)
    const [currentLap, setCurrentLap] = useState(15)
    const [selectedTrack, setSelectedTrack] = useState(4) // Bahrain
    const [yourTireAge, setYourTireAge] = useState(12)
    const [rivalTireAge, setRivalTireAge] = useState(10)
    const [yourCompound, setYourCompound] = useState<'soft' | 'medium' | 'hard'>('medium')
    const [rivalCompound, setRivalCompound] = useState<'soft' | 'medium' | 'hard'>('medium')
    const [trackTemp, setTrackTemp] = useState(35)

    const track = CALENDAR_2025.find(t => t.round === selectedTrack) || CALENDAR_2025[3]

    const analysis = useMemo(() => {
        // Enhanced tire degradation based on compound and temperature
        const yourCompoundData = TIRE_COMPOUNDS[yourCompound]
        const rivalCompoundData = TIRE_COMPOUNDS[rivalCompound]

        // Temperature effect: +10% deg per 5°C above 30
        const tempFactor = 1 + Math.max(0, (trackTemp - 30) / 50)

        const yourDeg = yourTireAge * yourCompoundData.degradation * tempFactor
        const rivalDeg = rivalTireAge * rivalCompoundData.degradation * tempFactor

        // Fresh tire advantage varies by compound
        const freshTireAdvantage = yourCompound === 'soft' ? 2.0 : yourCompound === 'medium' ? 1.5 : 1.0

        // Pit lane time varies by track
        const pitLaneTime = track.type === 'street' ? 24 : track.type === 'semi-street' ? 22 : 20

        // Undercut calculation
        const undercutGain = freshTireAdvantage + rivalDeg - (pitLaneTime - currentGap)
        const undercutSuccess = undercutGain > 0

        // Overcut calculation
        const overcutGain = currentGap + yourDeg - rivalDeg - (pitLaneTime / 4)
        const overcutSuccess = overcutGain > 0

        // Tire cliff warning
        const yourLapsToCliff = yourCompoundData.cliff - yourTireAge
        const rivalLapsToCliff = rivalCompoundData.cliff - rivalTireAge
        const yourNearCliff = yourLapsToCliff < 5
        const rivalNearCliff = rivalLapsToCliff < 5

        // Enhanced recommendation logic
        let recommendation: 'undercut' | 'overcut' | 'stay' | 'cover' | 'pit_now'
        let confidence: number
        let explanation: string

        if (yourNearCliff && yourLapsToCliff < 3) {
            recommendation = 'pit_now'
            confidence = 95
            explanation = `CRITICAL: Your ${yourCompound}s are ${yourTireAge} laps old - only ${yourLapsToCliff} laps until cliff! Pit immediately.`
        } else if (currentGap < 1.5) {
            recommendation = 'undercut'
            confidence = Math.min(95, 70 + (1.5 - currentGap) * 20)
            explanation = `Gap of ${currentGap}s is within undercut window. Fresh ${yourCompound}s will give ~${freshTireAdvantage}s/lap advantage for 3-4 laps.`
        } else if (currentGap > 4 && rivalNearCliff) {
            recommendation = 'overcut'
            confidence = 80
            explanation = `Rival's ${rivalCompound}s are ${rivalTireAge} laps old, approaching cliff. Stay out and overcut when they pit.`
        } else if (currentGap > 3 && !yourNearCliff) {
            recommendation = 'stay'
            confidence = 65
            explanation = `Gap too large for undercut. Your ${yourCompound}s have ${yourLapsToCliff} laps until cliff. Wait for strategic opportunity.`
        } else {
            recommendation = 'cover'
            confidence = 75
            explanation = `Cover rival's pit stop to maintain track position. Gap is marginal at ${currentGap}s.`
        }

        return {
            undercutGain: undercutGain.toFixed(2),
            overcutGain: overcutGain.toFixed(2),
            undercutSuccess,
            overcutSuccess,
            recommendation,
            confidence,
            explanation,
            optimalPitWindow: Math.max(1, currentLap + 2) + '-' + Math.min(track.laps - 10, currentLap + 8),
            yourNearCliff,
            rivalNearCliff,
            yourLapsToCliff,
            rivalLapsToCliff,
            pitLaneTime,
        }
    }, [yourDriver, rivalDriver, currentGap, currentLap, yourTireAge, rivalTireAge, yourCompound, rivalCompound, trackTemp, track])

    const getDriver = (id: string) => DRIVERS_2025.find(d => d.id === id)!

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Timer className="w-8 h-8" />
                        Undercut/Overcut Calculator
                    </h1>
                    <p className="text-white/80 mt-1">Real-time pit strategy decision engine • Used by F1 strategists</p>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Feature Info */}
                <FeatureInfo
                    title="Undercut/Overcut Calculator"
                    description="Calculates the optimal pit stop timing by analyzing tire degradation, track position gaps, and the mechanical grip advantage from fresh tires. Determines whether pitting before (undercut) or after (overcut) a rival maximizes race position."
                    advantage="Understanding undercut windows can mean the difference between winning and losing a position. In the 2024 Bahrain GP, Verstappen's undercut on Leclerc gained him 3 positions in one stop cycle."
                    skills={['Real-time simulation', 'Game theory optimization', 'Multi-variable analysis', 'React state management', 'Tire degradation modeling']}
                    f1Context="Every F1 team has strategists running similar calculations in real-time during races. AWS provides 'Pit Strategy Battle' graphics that show simplified versions of this analysis."
                />

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Input Panel */}
                    <div className="space-y-4">
                        {/* Track Selection */}
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Track & Conditions</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Circuit</label>
                                    <select
                                        value={selectedTrack}
                                        onChange={e => setSelectedTrack(parseInt(e.target.value))}
                                        className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                    >
                                        {CALENDAR_2025.map(t => <option key={t.round} value={t.round}>{t.shortName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Track Temp: {trackTemp}°C</label>
                                    <input
                                        type="range" min="15" max="55"
                                        value={trackTemp}
                                        onChange={e => setTrackTemp(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {track.laps} laps • Pit loss: ~{track.type === 'street' ? '24' : track.type === 'semi-street' ? '22' : '20'}s
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                        {DRIVERS_2025.map(d => <option key={d.id} value={d.id}>{d.name} ({d.team})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Rival Driver</label>
                                    <select
                                        value={rivalDriver}
                                        onChange={e => setRivalDriver(e.target.value)}
                                        className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                    >
                                        {DRIVERS_2025.map(d => <option key={d.id} value={d.id}>{d.name} ({d.team})</option>)}
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
                                            type="number" min="1" max={track.laps}
                                            value={currentLap}
                                            onChange={e => setCurrentLap(parseInt(e.target.value))}
                                            className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Total Race Laps</label>
                                        <div className="w-full bg-f1-gray-700 text-white rounded-lg p-3 text-center">
                                            {track.laps}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Tire Status</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">
                                        Your Tires: {yourTireAge} laps
                                        {analysis.yourNearCliff && <span className="text-red-400 ml-2">⚠️ Near cliff!</span>}
                                    </label>
                                    <input
                                        type="range" min="0" max="50"
                                        value={yourTireAge}
                                        onChange={e => setYourTireAge(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <select
                                        value={yourCompound}
                                        onChange={e => setYourCompound(e.target.value as 'soft' | 'medium' | 'hard')}
                                        className="w-full bg-f1-gray-700 text-white rounded-lg p-2 mt-2"
                                    >
                                        <option value="soft">🔴 Soft</option>
                                        <option value="medium">🟡 Medium</option>
                                        <option value="hard">⚪ Hard</option>
                                    </select>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {analysis.yourLapsToCliff} laps to cliff
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">
                                        Rival Tires: {rivalTireAge} laps
                                        {analysis.rivalNearCliff && <span className="text-red-400 ml-2">⚠️ Near cliff!</span>}
                                    </label>
                                    <input
                                        type="range" min="0" max="50"
                                        value={rivalTireAge}
                                        onChange={e => setRivalTireAge(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <select
                                        value={rivalCompound}
                                        onChange={e => setRivalCompound(e.target.value as 'soft' | 'medium' | 'hard')}
                                        className="w-full bg-f1-gray-700 text-white rounded-lg p-2 mt-2"
                                    >
                                        <option value="soft">🔴 Soft</option>
                                        <option value="medium">🟡 Medium</option>
                                        <option value="hard">⚪ Hard</option>
                                    </select>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {analysis.rivalLapsToCliff} laps to cliff
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="space-y-4">
                        {/* Main Recommendation */}
                        <div className={`rounded-xl p-6 ${analysis.recommendation === 'pit_now' ? 'bg-gradient-to-r from-red-900 to-red-800 border border-red-500' :
                                analysis.recommendation === 'undercut' ? 'bg-gradient-to-r from-green-900 to-emerald-900 border border-green-500' :
                                    analysis.recommendation === 'overcut' ? 'bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-500' :
                                        analysis.recommendation === 'cover' ? 'bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-500' :
                                            'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600'
                            }`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white uppercase">{analysis.recommendation.replace('_', ' ')}</h2>
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
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-teal-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
