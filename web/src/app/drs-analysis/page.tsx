'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Zap, TrendingUp, Users, ArrowRight } from 'lucide-react'

const TRACKS = [
    { id: 'monza', name: 'Monza', drsZones: 2, drsEffect: 12, overtakeRate: 'high' },
    { id: 'spa', name: 'Spa', drsZones: 2, drsEffect: 14, overtakeRate: 'high' },
    { id: 'bahrain', name: 'Bahrain', drsZones: 3, drsEffect: 11, overtakeRate: 'high' },
    { id: 'jeddah', name: 'Jeddah', drsZones: 3, drsEffect: 13, overtakeRate: 'very high' },
    { id: 'miami', name: 'Miami', drsZones: 3, drsEffect: 10, overtakeRate: 'medium' },
    { id: 'silverstone', name: 'Silverstone', drsZones: 2, drsEffect: 9, overtakeRate: 'medium' },
    { id: 'monaco', name: 'Monaco', drsZones: 1, drsEffect: 4, overtakeRate: 'very low' },
    { id: 'singapore', name: 'Singapore', drsZones: 3, drsEffect: 7, overtakeRate: 'low' },
    { id: 'hungaroring', name: 'Hungaroring', drsZones: 2, drsEffect: 5, overtakeRate: 'very low' },
]

const DRIVERS = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF', drsSuccess: 78 },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700', drsSuccess: 72 },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000', drsSuccess: 70 },
    { id: 'HAM', name: 'Hamilton', team: 'Ferrari', color: '#DC0000', drsSuccess: 75 },
    { id: 'PIA', name: 'Piastri', team: 'McLaren', color: '#FF8700', drsSuccess: 68 },
    { id: 'RUS', name: 'Russell', team: 'Mercedes', color: '#00D2BE', drsSuccess: 65 },
]

export default function DRSAnalysisPage() {
    const [selectedTrack, setSelectedTrack] = useState(TRACKS[0])
    const [gap, setGap] = useState(0.5)
    const [attackDriver, setAttackDriver] = useState(DRIVERS[1])
    const [defendDriver, setDefendDriver] = useState(DRIVERS[0])
    const [tireAdvantage, setTireAdvantage] = useState(0)

    const analysis = useMemo(() => {
        // Calculate overtake probability
        let baseProb = 30 // Base probability

        // DRS effect contribution
        baseProb += selectedTrack.drsEffect * 2

        // Gap effect (closer = higher prob)
        baseProb += Math.max(0, (1 - gap) * 30)

        // Driver skill
        baseProb += (attackDriver.drsSuccess - 70) * 0.5
        baseProb -= (defendDriver.drsSuccess - 70) * 0.3

        // Tire advantage
        baseProb += tireAdvantage * 5

        // Track overtaking character
        if (selectedTrack.overtakeRate === 'very high') baseProb += 15
        else if (selectedTrack.overtakeRate === 'high') baseProb += 10
        else if (selectedTrack.overtakeRate === 'medium') baseProb += 5
        else if (selectedTrack.overtakeRate === 'low') baseProb -= 5
        else if (selectedTrack.overtakeRate === 'very low') baseProb -= 15

        baseProb = Math.min(95, Math.max(5, baseProb))

        // Speed delta from DRS
        const drsSpeedGain = selectedTrack.drsEffect + Math.random() * 2

        // Defending difficulty
        const defendDifficulty = selectedTrack.drsZones * 20 + selectedTrack.drsEffect

        return {
            overtakeProb: baseProb.toFixed(1),
            drsSpeedGain: drsSpeedGain.toFixed(0),
            defendDifficulty,
            recommendedZone: selectedTrack.drsZones > 1 ? 'Zone 2' : 'Zone 1',
            verdict: baseProb > 60 ? 'ATTACK' : baseProb > 40 ? 'PRESSURE' : 'WAIT',
        }
    }, [selectedTrack, gap, attackDriver, defendDriver, tireAdvantage])

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Zap className="w-8 h-8" />
                        DRS Effect Analyzer
                    </h1>
                    <p className="text-white/80 mt-1">Overtaking probability • Zone effectiveness analysis</p>
                </div>
            </div>

            <div className="container mx-auto p-4 grid lg:grid-cols-2 gap-6">
                {/* Controls */}
                <div className="space-y-4">
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Battle Setup</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Circuit</label>
                                <select
                                    value={selectedTrack.id}
                                    onChange={e => setSelectedTrack(TRACKS.find(t => t.id === e.target.value)!)}
                                    className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                >
                                    {TRACKS.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.drsZones} DRS zones)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Attacking Driver</label>
                                    <select
                                        value={attackDriver.id}
                                        onChange={e => setAttackDriver(DRIVERS.find(d => d.id === e.target.value)!)}
                                        className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                    >
                                        {DRIVERS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Defending Driver</label>
                                    <select
                                        value={defendDriver.id}
                                        onChange={e => setDefendDriver(DRIVERS.find(d => d.id === e.target.value)!)}
                                        className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                    >
                                        {DRIVERS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Gap at DRS Detection: {gap.toFixed(2)}s</label>
                                <input
                                    type="range" min="0" max="1" step="0.01"
                                    value={gap}
                                    onChange={e => setGap(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Tire Advantage: {tireAdvantage > 0 ? '+' : ''}{tireAdvantage} laps fresher</label>
                                <input
                                    type="range" min="-10" max="10"
                                    value={tireAdvantage}
                                    onChange={e => setTireAdvantage(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Track DRS Profile */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Track DRS Profile</h2>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-f1-gray-700 rounded-lg p-4">
                                <div className="text-3xl font-bold text-green-400">{selectedTrack.drsZones}</div>
                                <div className="text-xs text-gray-400">DRS Zones</div>
                            </div>
                            <div className="bg-f1-gray-700 rounded-lg p-4">
                                <div className="text-3xl font-bold text-white">+{selectedTrack.drsEffect}</div>
                                <div className="text-xs text-gray-400">km/h Gain</div>
                            </div>
                            <div className="bg-f1-gray-700 rounded-lg p-4">
                                <div className="text-3xl font-bold text-yellow-400 capitalize">{selectedTrack.overtakeRate}</div>
                                <div className="text-xs text-gray-400">Overtake Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {/* Main Verdict */}
                    <div className={`rounded-xl p-8 text-center ${analysis.verdict === 'ATTACK' ? 'bg-gradient-to-br from-green-900 to-emerald-900 border-2 border-green-500' :
                            analysis.verdict === 'PRESSURE' ? 'bg-gradient-to-br from-yellow-900 to-orange-900 border-2 border-yellow-500' :
                                'bg-gradient-to-br from-red-900 to-rose-900 border-2 border-red-500'
                        }`}>
                        <div className="text-sm text-white/70 mb-2">Recommended Action</div>
                        <div className="text-5xl font-bold text-white mb-4">{analysis.verdict}</div>
                        <div className="text-6xl font-bold text-white">{analysis.overtakeProb}%</div>
                        <div className="text-white/70 mt-2">Overtake Success Probability</div>
                    </div>

                    {/* Battle Visualization */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Battle Scenario</h3>
                        <div className="flex items-center justify-center gap-4">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl border-2 border-dashed border-gray-500" style={{ backgroundColor: defendDriver.color }}>
                                    {defendDriver.id}
                                </div>
                                <div className="text-white font-bold">{defendDriver.name}</div>
                                <div className="text-sm text-gray-400">Defending</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-2xl font-bold text-white">{gap.toFixed(2)}s</div>
                                <ArrowRight className="w-8 h-8 text-green-400 my-2" />
                                <div className="text-xs text-gray-400">DRS Active</div>
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl animate-pulse" style={{ backgroundColor: attackDriver.color }}>
                                    {attackDriver.id}
                                </div>
                                <div className="text-white font-bold">{attackDriver.name}</div>
                                <div className="text-sm text-gray-400">Attacking</div>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Details */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Analysis Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-f1-gray-700 rounded-lg">
                                <span className="text-gray-400">DRS Speed Advantage</span>
                                <span className="text-green-400 font-bold">+{analysis.drsSpeedGain} km/h</span>
                            </div>
                            <div className="flex justify-between p-3 bg-f1-gray-700 rounded-lg">
                                <span className="text-gray-400">Defense Difficulty</span>
                                <span className="text-yellow-400 font-bold">{analysis.defendDifficulty}%</span>
                            </div>
                            <div className="flex justify-between p-3 bg-f1-gray-700 rounded-lg">
                                <span className="text-gray-400">Best Attack Zone</span>
                                <span className="text-white font-bold">{analysis.recommendedZone}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-f1-gray-700 rounded-lg">
                                <span className="text-gray-400">Attacker DRS Rating</span>
                                <span className="text-white font-bold">{attackDriver.drsSuccess}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-emerald-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
