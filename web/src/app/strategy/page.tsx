'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Timer, Fuel, Settings, TrendingUp, ArrowRight, AlertCircle, Target, Zap, MapPin, Building2 } from 'lucide-react'

// Tire compound data
const COMPOUNDS = [
    { id: 'soft', name: 'Soft', color: '#e10600', durability: 18, pace: 0, pitDegradation: 0.08 },
    { id: 'medium', name: 'Medium', color: '#fcd34d', durability: 28, pace: 0.4, pitDegradation: 0.05 },
    { id: 'hard', name: 'Hard', color: '#f5f5f5', durability: 42, pace: 0.9, pitDegradation: 0.03 },
]

// Race-specific strategy data
const RACE_STRATEGIES: Record<string, {
    name: string; laps: number; pitLaneTime: number; degradation: number;
    optimalStrategy: string; characteristics: string[];
}> = {
    'bahrain': {
        name: '🇧🇭 Bahrain GP', laps: 57, pitLaneTime: 21, degradation: 1.2,
        optimalStrategy: 'two-stop',
        characteristics: ['High rear degradation', 'Abrasive surface', 'Night race cooling']
    },
    'jeddah': {
        name: '🇸🇦 Saudi Arabian GP', laps: 50, pitLaneTime: 23, degradation: 0.8,
        optimalStrategy: 'one-stop',
        characteristics: ['Street circuit', 'Limited overtaking', 'Safety car likely']
    },
    'monaco': {
        name: '🇲🇨 Monaco GP', laps: 78, pitLaneTime: 27, degradation: 0.5,
        optimalStrategy: 'one-stop',
        characteristics: ['No overtaking', 'Track position crucial', 'Long pit lane']
    },
    'monza': {
        name: '🇮🇹 Italian GP', laps: 53, pitLaneTime: 25, degradation: 0.9,
        optimalStrategy: 'one-stop',
        characteristics: ['Low downforce', 'Slipstreaming', 'Tow important']
    },
    'silverstone': {
        name: '🇬🇧 British GP', laps: 52, pitLaneTime: 22, degradation: 1.3,
        optimalStrategy: 'two-stop',
        characteristics: ['High-speed corners', 'Front tire wear', 'Weather variable']
    },
    'suzuka': {
        name: '🇯🇵 Japanese GP', laps: 53, pitLaneTime: 24, degradation: 1.1,
        optimalStrategy: 'two-stop',
        characteristics: ['Technical esses', 'Balanced wear', 'Typhoon risk']
    },
    'spa': {
        name: '🇧🇪 Belgian GP', laps: 44, pitLaneTime: 21, degradation: 0.8,
        optimalStrategy: 'one-stop',
        characteristics: ['Longest circuit', 'Low degradation', 'Rain likely']
    },
    'singapore': {
        name: '🇸🇬 Singapore GP', laps: 62, pitLaneTime: 28, degradation: 1.4,
        optimalStrategy: 'two-stop',
        characteristics: ['Street circuit heat', 'Physical race', 'Safety car common']
    },
}

// Team-specific strategy profiles
const TEAM_STRATEGIES: Record<string, {
    name: string; color: string;
    tireMgmt: number; pitSpeed: number; strategyFlexibility: number;
    strengths: string[]; weaknesses: string[];
}> = {
    'mclaren': {
        name: 'McLaren', color: '#FF8700',
        tireMgmt: 9.2, pitSpeed: 2.1, strategyFlexibility: 9.0,
        strengths: ['Excellent tire management', 'Fast pit stops', 'Adaptive strategy'],
        weaknesses: ['Sometimes conservative']
    },
    'redbull': {
        name: 'Red Bull', color: '#1E41FF',
        tireMgmt: 8.8, pitSpeed: 2.0, strategyFlexibility: 8.5,
        strengths: ['Fastest pit crew', 'Aggressive undercuts', 'Data-driven'],
        weaknesses: ['Can overcommit to strategy']
    },
    'ferrari': {
        name: 'Ferrari', color: '#DC0000',
        tireMgmt: 8.0, pitSpeed: 2.5, strategyFlexibility: 7.5,
        strengths: ['Strong qualifying pace', 'Home race motivation'],
        weaknesses: ['Strategy errors', 'Pit stop consistency', 'Radio chaos']
    },
    'mercedes': {
        name: 'Mercedes', color: '#00D2BE',
        tireMgmt: 8.5, pitSpeed: 2.3, strategyFlexibility: 8.8,
        strengths: ['Strategic experience', 'Hamilton expertise', 'Tire temps'],
        weaknesses: ['W14/W15 specific issues']
    },
    'astonmartin': {
        name: 'Aston Martin', color: '#006F62',
        tireMgmt: 7.5, pitSpeed: 2.6, strategyFlexibility: 8.0,
        strengths: ['Alonso experience', 'Conservative approach'],
        weaknesses: ['Slower pit stops', 'Resource limitations']
    },
    'williams': {
        name: 'Williams', color: '#005AFF',
        tireMgmt: 7.0, pitSpeed: 2.8, strategyFlexibility: 7.5,
        strengths: ['Improving pit crew', 'No team orders issues'],
        weaknesses: ['Slower overall pace', 'Limited strategic options']
    },
}

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
        riskLevel: 'Low',
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
        riskLevel: 'Medium',
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
        riskLevel: 'High',
    },
]

export default function StrategyPage() {
    const [selectedRace, setSelectedRace] = useState('bahrain')
    const [selectedTeam, setSelectedTeam] = useState('mclaren')
    const [selectedStrategy, setSelectedStrategy] = useState('two-stop')

    const race = RACE_STRATEGIES[selectedRace]
    const team = TEAM_STRATEGIES[selectedTeam]
    const strategy = STRATEGIES.find(s => s.id === selectedStrategy)!

    // Calculate estimated race time for each strategy based on race/team
    const calculateRaceTime = (strat: typeof strategy) => {
        let totalTime = 0
        const laps = race.laps
        const teamPitPenalty = team.pitSpeed - 2.0 // Baseline 2.0s

        strat.stints.forEach(stint => {
            const compound = COMPOUNDS.find(c => c.id === stint.compound)!
            const stintLaps = Math.min(stint.endLap, laps) - stint.startLap + 1
            for (let lap = 0; lap < stintLaps; lap++) {
                const lapDegradation = compound.pitDegradation * lap * race.degradation * (1 - team.tireMgmt / 20)
                totalTime += 90 + compound.pace + lapDegradation
            }
        })
        // Add pit stop time (with team-specific penalty)
        totalTime += (strat.stints.length - 1) * (race.pitLaneTime + teamPitPenalty)
        return totalTime
    }

    const strategyTimes = STRATEGIES.map(s => ({
        ...s,
        estimatedTime: calculateRaceTime(s),
    })).sort((a, b) => a.estimatedTime - b.estimatedTime)

    const fastestTime = strategyTimes[0].estimatedTime
    const optimalStrategy = race.optimalStrategy

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Timer className="w-10 h-10 text-orange-600" />
                    Pit Strategy Simulator
                </h1>
                <p className="text-f1-gray-600">
                    Race-specific and team-specific strategy analysis
                </p>
            </div>

            {/* Selectors */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Select Race
                    </label>
                    <select
                        value={selectedRace}
                        onChange={(e) => setSelectedRace(e.target.value)}
                        className="w-full border rounded-lg p-3 font-bold"
                    >
                        {Object.entries(RACE_STRATEGIES).map(([id, r]) => (
                            <option key={id} value={id}>{r.name} ({r.laps} laps)</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Select Team
                    </label>
                    <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full border rounded-lg p-3 font-bold"
                        style={{ borderColor: team.color }}
                    >
                        {Object.entries(TEAM_STRATEGIES).map(([id, t]) => (
                            <option key={id} value={id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Race Characteristics */}
            <div className="rounded-xl p-6 mb-8 text-white" style={{ backgroundColor: team.color }}>
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">{race.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {race.characteristics.map((c, i) => (
                                <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-sm">{c}</span>
                            ))}
                        </div>
                        <div className="mt-3 text-sm opacity-90">
                            Optimal Strategy: <strong>{race.optimalStrategy.toUpperCase().replace('-', ' ')}</strong>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-black/20 rounded-lg px-4 py-2">
                            <div className="text-2xl font-bold">{race.laps}</div>
                            <div className="text-xs opacity-75">Laps</div>
                        </div>
                        <div className="bg-black/20 rounded-lg px-4 py-2">
                            <div className="text-2xl font-bold">{race.pitLaneTime}s</div>
                            <div className="text-xs opacity-75">Pit Lane</div>
                        </div>
                        <div className="bg-black/20 rounded-lg px-4 py-2">
                            <div className="text-2xl font-bold">{race.degradation.toFixed(1)}x</div>
                            <div className="text-xs opacity-75">Deg Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Profile */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" style={{ color: team.color }} />
                    {team.name} Strategy Profile
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-f1-gray-50 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: team.color }}>{team.tireMgmt}/10</div>
                        <div className="text-sm text-f1-gray-500">Tire Management</div>
                    </div>
                    <div className="text-center p-3 bg-f1-gray-50 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: team.color }}>{team.pitSpeed}s</div>
                        <div className="text-sm text-f1-gray-500">Avg Pit Stop</div>
                    </div>
                    <div className="text-center p-3 bg-f1-gray-50 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: team.color }}>{team.strategyFlexibility}/10</div>
                        <div className="text-sm text-f1-gray-500">Strategy Flexibility</div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-bold text-green-700 mb-2">✓ Strengths</h4>
                        <ul className="text-sm text-f1-gray-600 space-y-1">
                            {team.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-red-700 mb-2">✗ Weaknesses</h4>
                        <ul className="text-sm text-f1-gray-600 space-y-1">
                            {team.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Strategy Comparison */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {strategyTimes.map((strat, rank) => {
                    const isOptimal = strat.id === optimalStrategy
                    return (
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
                                        {isOptimal && ' ⭐'}
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
                                {rank === 0 ? 'Fastest for this combo' : `+${(strat.estimatedTime - fastestTime).toFixed(1)}s`}
                            </div>
                            <div className="flex gap-1">
                                {strat.stints.map((stint, i) => {
                                    const compound = COMPOUNDS.find(c => c.id === stint.compound)!
                                    return (
                                        <div
                                            key={i}
                                            className="flex-1 h-3 rounded"
                                            style={{ backgroundColor: compound.color, border: stint.compound === 'hard' ? '1px solid #ccc' : 'none' }}
                                            title={`${compound.name}: Laps ${stint.startLap}-${Math.min(stint.endLap, race.laps)}`}
                                        />
                                    )
                                })}
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Key Insight */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Strategy Recommendation for {team.name} at {race.name}
                </h3>
                <p className="text-f1-gray-700">
                    {selectedStrategy === optimalStrategy ? (
                        <>
                            <strong>{strategy.name}</strong> is the optimal choice for this race.
                            {team.tireMgmt >= 8.5
                                ? ` ${team.name}'s excellent tire management (${team.tireMgmt}/10) makes this sustainable.`
                                : ` ${team.name} may need to be careful with tire wear during the stint.`
                            }
                        </>
                    ) : (
                        <>
                            Consider switching to <strong>{optimalStrategy.replace('-', ' ')}</strong> which is usually optimal at {race.name}.
                            Your selected {strategy.name} is {strategyTimes.find(s => s.id === selectedStrategy)?.estimatedTime! > fastestTime
                                ? `${(strategyTimes.find(s => s.id === selectedStrategy)?.estimatedTime! - fastestTime).toFixed(1)}s slower`
                                : 'still competitive'
                            } for this race/team combination.
                        </>
                    )}
                </p>
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
