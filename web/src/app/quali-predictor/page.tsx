'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Clock, AlertTriangle, CheckCircle, TrendingUp, Flag } from 'lucide-react'

const DRIVERS = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF', baseQPace: 0, form: 95 },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700', baseQPace: 0.15, form: 94 },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000', baseQPace: 0.18, form: 92 },
    { id: 'HAM', name: 'Hamilton', team: 'Ferrari', color: '#DC0000', baseQPace: 0.22, form: 88 },
    { id: 'PIA', name: 'Piastri', team: 'McLaren', color: '#FF8700', baseQPace: 0.25, form: 90 },
    { id: 'RUS', name: 'Russell', team: 'Mercedes', color: '#00D2BE', baseQPace: 0.28, form: 87 },
    { id: 'SAI', name: 'Sainz', team: 'Williams', color: '#005AFF', baseQPace: 0.32, form: 85 },
    { id: 'ALO', name: 'Alonso', team: 'Aston Martin', color: '#006F62', baseQPace: 0.35, form: 86 },
    { id: 'STR', name: 'Stroll', team: 'Aston Martin', color: '#006F62', baseQPace: 0.55, form: 78 },
    { id: 'HUL', name: 'Hulkenberg', team: 'Sauber', color: '#00E701', baseQPace: 0.60, form: 80 },
    { id: 'TSU', name: 'Tsunoda', team: 'RB', color: '#4E7C9B', baseQPace: 0.62, form: 82 },
    { id: 'RIC', name: 'Ricciardo', team: 'RB', color: '#4E7C9B', baseQPace: 0.65, form: 75 },
    { id: 'ALB', name: 'Albon', team: 'Williams', color: '#005AFF', baseQPace: 0.68, form: 83 },
    { id: 'GAS', name: 'Gasly', team: 'Alpine', color: '#0090FF', baseQPace: 0.70, form: 81 },
    { id: 'OCO', name: 'Ocon', team: 'Alpine', color: '#0090FF', baseQPace: 0.72, form: 79 },
    { id: 'ZHO', name: 'Zhou', team: 'Sauber', color: '#00E701', baseQPace: 0.85, form: 76 },
    { id: 'MAG', name: 'Magnussen', team: 'Haas', color: '#FFFFFF', baseQPace: 0.88, form: 74 },
    { id: 'BOT', name: 'Bottas', team: 'Sauber', color: '#00E701', baseQPace: 0.75, form: 77 },
    { id: 'SAR', name: 'Sargeant', team: 'Williams', color: '#005AFF', baseQPace: 1.10, form: 68 },
    { id: 'BEA', name: 'Bearman', team: 'Haas', color: '#FFFFFF', baseQPace: 0.95, form: 72 },
]

const TRACKS = [
    { id: 'bahrain', name: 'Bahrain', poleTime: 89.708, q1Cut: 1.5, q2Cut: 0.8 },
    { id: 'jeddah', name: 'Jeddah', poleTime: 87.275, q1Cut: 1.8, q2Cut: 1.0 },
    { id: 'melbourne', name: 'Melbourne', poleTime: 75.603, q1Cut: 1.4, q2Cut: 0.7 },
    { id: 'suzuka', name: 'Suzuka', poleTime: 90.983, q1Cut: 1.6, q2Cut: 0.9 },
    { id: 'monaco', name: 'Monaco', poleTime: 70.270, q1Cut: 1.2, q2Cut: 0.6 },
    { id: 'spa', name: 'Spa', poleTime: 105.525, q1Cut: 2.0, q2Cut: 1.1 },
    { id: 'monza', name: 'Monza', poleTime: 79.562, q1Cut: 1.3, q2Cut: 0.7 },
    { id: 'silverstone', name: 'Silverstone', poleTime: 85.492, q1Cut: 1.5, q2Cut: 0.8 },
]

export default function QualiPredictorPage() {
    const [selectedTrack, setSelectedTrack] = useState(TRACKS[0])
    const [sessionProgress, setSessionProgress] = useState(0) // 0-100
    const [trackEvolution, setTrackEvolution] = useState(0.3) // seconds improvement

    const predictions = useMemo(() => {
        // Add some randomness for realism
        const results = DRIVERS.map(driver => {
            const formFactor = (100 - driver.form) * 0.01
            const evolutionBonus = trackEvolution * (Math.random() * 0.5)
            const gap = driver.baseQPace + formFactor - evolutionBonus + (Math.random() - 0.5) * 0.1
            const time = selectedTrack.poleTime + gap

            return {
                ...driver,
                gap: gap,
                time: time,
                timeStr: formatTime(time),
            }
        }).sort((a, b) => a.time - b.time)

        // Determine session cutoffs
        const q1Cutoff = results[14]?.time || 0 // P15 is last into Q2
        const q2Cutoff = results[9]?.time || 0  // P10 is last into Q3

        return results.map((driver, position) => {
            let session: 'Q3' | 'Q2' | 'Q1'
            let eliminated = false
            let marginToSafe = 0

            if (position < 10) {
                session = 'Q3'
                marginToSafe = q2Cutoff - driver.time
            } else if (position < 15) {
                session = 'Q2'
                marginToSafe = q1Cutoff - driver.time
                eliminated = position >= 10
            } else {
                session = 'Q1'
                eliminated = true
                marginToSafe = q1Cutoff - driver.time
            }

            return {
                ...driver,
                position: position + 1,
                session,
                eliminated,
                marginToSafe,
                atRisk: Math.abs(marginToSafe) < 0.15,
            }
        })
    }, [selectedTrack, trackEvolution])

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60)
        const secs = (seconds % 60).toFixed(3)
        return `${mins}:${secs.padStart(6, '0')}`
    }

    const q1Eliminated = predictions.filter(d => d.position > 15)
    const q2Eliminated = predictions.filter(d => d.position > 10 && d.position <= 15)
    const q3Qualifiers = predictions.filter(d => d.position <= 10)

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Clock className="w-8 h-8" />
                        Qualifying Predictor
                    </h1>
                    <p className="text-white/80 mt-1">Q1/Q2/Q3 knockout predictions • Session analysis</p>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Controls */}
                <div className="bg-f1-gray-800 rounded-xl p-6 mb-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Circuit</label>
                            <select
                                value={selectedTrack.id}
                                onChange={e => setSelectedTrack(TRACKS.find(t => t.id === e.target.value)!)}
                                className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                            >
                                {TRACKS.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Track Evolution: -{trackEvolution.toFixed(2)}s</label>
                            <input
                                type="range" min="0" max="1" step="0.05"
                                value={trackEvolution}
                                onChange={e => setTrackEvolution(parseFloat(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-400 mb-2">Reference Pole Time</div>
                            <div className="text-3xl font-mono font-bold text-white">{formatTime(selectedTrack.poleTime)}</div>
                        </div>
                    </div>
                </div>

                {/* Session Breakdown */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Q3 */}
                    <div className="bg-gradient-to-b from-green-900/50 to-f1-gray-800 rounded-xl p-6 border border-green-600">
                        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Q3 Qualifiers
                        </h3>
                        <div className="space-y-2">
                            {q3Qualifiers.map(driver => (
                                <div key={driver.id} className="flex items-center justify-between p-2 bg-f1-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: driver.color }}>
                                            P{driver.position}
                                        </div>
                                        <span className="text-white font-medium">{driver.name}</span>
                                    </div>
                                    <span className="text-green-400 font-mono text-sm">{driver.timeStr}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Q2 */}
                    <div className="bg-gradient-to-b from-yellow-900/50 to-f1-gray-800 rounded-xl p-6 border border-yellow-600">
                        <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Q2 Eliminated
                        </h3>
                        <div className="space-y-2">
                            {q2Eliminated.map(driver => (
                                <div key={driver.id} className="flex items-center justify-between p-2 bg-f1-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: driver.color }}>
                                            P{driver.position}
                                        </div>
                                        <span className="text-white font-medium">{driver.name}</span>
                                        {driver.atRisk && <span className="text-xs bg-yellow-500 text-black px-1 rounded">AT RISK</span>}
                                    </div>
                                    <span className="text-yellow-400 font-mono text-sm">{driver.timeStr}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Q1 */}
                    <div className="bg-gradient-to-b from-red-900/50 to-f1-gray-800 rounded-xl p-6 border border-red-600">
                        <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                            <Flag className="w-5 h-5" /> Q1 Eliminated
                        </h3>
                        <div className="space-y-2">
                            {q1Eliminated.map(driver => (
                                <div key={driver.id} className="flex items-center justify-between p-2 bg-f1-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: driver.color }}>
                                            P{driver.position}
                                        </div>
                                        <span className="text-white font-medium">{driver.name}</span>
                                    </div>
                                    <span className="text-red-400 font-mono text-sm">{driver.timeStr}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Full Grid */}
                <div className="bg-f1-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Predicted Qualifying Order</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead>
                                <tr className="text-gray-400 text-sm border-b border-gray-700">
                                    <th className="text-left p-2">Pos</th>
                                    <th className="text-left p-2">Driver</th>
                                    <th className="text-left p-2">Team</th>
                                    <th className="text-right p-2">Time</th>
                                    <th className="text-right p-2">Gap</th>
                                    <th className="text-center p-2">Session</th>
                                    <th className="text-right p-2">Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {predictions.map(driver => (
                                    <tr key={driver.id} className={`border-b border-gray-700/50 ${driver.atRisk ? 'bg-yellow-900/20' : ''}`}>
                                        <td className="p-2">
                                            <div className="w-8 h-8 rounded flex items-center justify-center font-bold" style={{ backgroundColor: driver.color }}>
                                                {driver.position}
                                            </div>
                                        </td>
                                        <td className="p-2 font-medium">{driver.name}</td>
                                        <td className="p-2 text-gray-400">{driver.team}</td>
                                        <td className="p-2 text-right font-mono">{driver.timeStr}</td>
                                        <td className="p-2 text-right font-mono text-gray-400">
                                            {driver.position === 1 ? '-' : `+${driver.gap.toFixed(3)}`}
                                        </td>
                                        <td className="p-2 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${driver.session === 'Q3' ? 'bg-green-600' :
                                                    driver.session === 'Q2' ? 'bg-yellow-600' : 'bg-red-600'
                                                }`}>
                                                {driver.session}
                                            </span>
                                        </td>
                                        <td className={`p-2 text-right font-mono ${driver.marginToSafe > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {driver.marginToSafe > 0 ? '+' : ''}{driver.marginToSafe.toFixed(3)}s
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-purple-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
