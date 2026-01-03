'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PlayCircle, Rewind, FastForward, GitBranch, AlertTriangle, Flag, RefreshCw, Gauge } from 'lucide-react'

// Historical race scenarios
const HISTORICAL_RACES = [
    // Classic iconic races
    { id: 'brazil_2008', name: '2008 Brazil GP', winner: 'HAM', laps: 71, highlight: '🏆 Hamilton wins WDC on last corner!' },
    { id: 'abudhabi_2021', name: '2021 Abu Dhabi GP', winner: 'VER', laps: 58, highlight: '⚠️ Controversial SC restart' },
    { id: 'monaco_1996', name: '1996 Monaco GP', winner: 'VER', laps: 75, highlight: '🌧️ Only 3 cars finish in rain' },
    { id: 'silverstone_2008', name: '2008 British GP', winner: 'HAM', laps: 60, highlight: '🌧️ Hamilton masterclass in rain' },
    { id: 'germany_2019', name: '2019 German GP', winner: 'VER', laps: 64, highlight: '🎢 Chaos at Hockenheim' },
    // 2024 Season
    { id: 'bahrain_2024', name: '2024 Bahrain GP', winner: 'VER', laps: 57, highlight: 'Season opener dominance' },
    { id: 'monaco_2024', name: '2024 Monaco GP', winner: 'LEC', laps: 78, highlight: '🏠 Leclerc finally wins at home' },
    { id: 'silverstone_2024', name: '2024 British GP', winner: 'HAM', laps: 52, highlight: '🏆 104 GP wins record' },
    { id: 'brazil_2024', name: '2024 Brazilian GP', winner: 'VER', laps: 71, highlight: 'Sprint weekend thriller' },
    { id: 'abudhabi_2024', name: '2024 Abu Dhabi GP', winner: 'NOR', laps: 58, highlight: '🏆 Norris clinches WDC' },
    // 2025 Season (predictions)
    { id: 'australia_2025', name: '2025 Australian GP', winner: 'NOR', laps: 58, highlight: 'Champion starts in style' },
    { id: 'miami_2025', name: '2025 Miami GP', winner: 'LEC', laps: 57, highlight: '🔥 Hamilton/Leclerc 1-2' },
]

const DRIVERS = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF' },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700' },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000' },
    { id: 'HAM', name: 'Hamilton', team: 'Ferrari', color: '#DC0000' },
    { id: 'PIA', name: 'Piastri', team: 'McLaren', color: '#FF8700' },
    { id: 'RUS', name: 'Russell', team: 'Mercedes', color: '#00D2BE' },
    { id: 'SAI', name: 'Sainz', team: 'Williams', color: '#005AFF' },
    { id: 'ALO', name: 'Alonso', team: 'Aston Martin', color: '#006F62' },
]

interface WhatIfScenario {
    id: string
    description: string
    driver: string
    lap: number
    action: string
    impact: string
}

const WHAT_IF_SCENARIOS: WhatIfScenario[] = [
    { id: 'ver_pit_35', description: 'Verstappen pits on lap 35', driver: 'VER', lap: 35, action: 'pit', impact: 'Lost 2 positions, regained 1' },
    { id: 'ham_no_sc', description: 'No safety car on lap 42', driver: 'HAM', lap: 42, action: 'no_sc', impact: 'Hamilton wins by 3.2s' },
    { id: 'lec_tire_deg', description: 'Leclerc manages tires better', driver: 'LEC', lap: 1, action: 'tire_mgmt', impact: '+0.3s per lap advantage' },
    { id: 'nor_overtake', description: 'Norris aggressive overtake L28', driver: 'NOR', lap: 28, action: 'overtake', impact: 'Gains P2, risks collision' },
]

export default function ReplayPage() {
    const [selectedRace, setSelectedRace] = useState(HISTORICAL_RACES[0])
    const [currentLap, setCurrentLap] = useState(1)
    const [isPlaying, setIsPlaying] = useState(false)
    const [appliedScenarios, setAppliedScenarios] = useState<string[]>([])
    const [timeline, setTimeline] = useState<{ lap: number; positions: string[]; event?: string }[]>([])

    // Generate base timeline for selected race
    const baseTimeline = useMemo(() => {
        const result = []
        let positions = [...DRIVERS.map(d => d.id)]

        for (let lap = 1; lap <= selectedRace.laps; lap++) {
            // Simulate some position changes
            if (lap % 10 === 0 && Math.random() > 0.5) {
                const swapIdx = Math.floor(Math.random() * 5)
                if (swapIdx < positions.length - 1) {
                    [positions[swapIdx], positions[swapIdx + 1]] = [positions[swapIdx + 1], positions[swapIdx]]
                }
            }

            let event: string | undefined
            if (lap === 15) event = 'Pit window opens'
            if (lap === 20) event = 'VER pits - undercut attempt'
            if (lap === 25) event = 'NOR pits - covers VER'
            if (lap === 42) event = '⚠️ Safety car deployed'

            result.push({ lap, positions: [...positions], event })
        }

        return result
    }, [selectedRace])

    // Apply what-if scenarios
    const modifiedTimeline = useMemo(() => {
        let positions = [...DRIVERS.map(d => d.id)]

        return baseTimeline.map((lapData, idx) => {
            let event = lapData.event
            let newPositions = [...lapData.positions]

            // Apply scenarios
            for (const scenarioId of appliedScenarios) {
                const scenario = WHAT_IF_SCENARIOS.find(s => s.id === scenarioId)
                if (scenario && lapData.lap >= scenario.lap) {
                    const driverIdx = newPositions.indexOf(scenario.driver)

                    if (scenario.action === 'pit' && driverIdx > 0) {
                        // Move driver back 2 positions temporarily
                        newPositions.splice(driverIdx, 1)
                        newPositions.splice(Math.min(driverIdx + 2, newPositions.length), 0, scenario.driver)
                        if (lapData.lap === scenario.lap) event = `🔧 ${scenario.description}`
                    }

                    if (scenario.action === 'no_sc' && lapData.lap >= 42) {
                        // Remove safety car event
                        event = event?.replace('⚠️ Safety car deployed', '(No SC in this timeline)')
                    }

                    if (scenario.action === 'tire_mgmt' && driverIdx > 0 && lapData.lap > 30) {
                        // Leclerc gains positions late race
                        if (driverIdx > 0) {
                            newPositions.splice(driverIdx, 1)
                            newPositions.splice(Math.max(0, driverIdx - 1), 0, scenario.driver)
                        }
                    }

                    if (scenario.action === 'overtake' && lapData.lap >= scenario.lap) {
                        // Norris overtakes
                        if (driverIdx > 1) {
                            newPositions.splice(driverIdx, 1)
                            newPositions.splice(driverIdx - 1, 0, scenario.driver)
                            if (lapData.lap === scenario.lap) event = `⚔️ ${scenario.description}`
                        }
                    }
                }
            }

            return { ...lapData, positions: newPositions, event }
        })
    }, [baseTimeline, appliedScenarios])

    const currentLapData = modifiedTimeline[currentLap - 1] || modifiedTimeline[0]
    const getDriver = (id: string) => DRIVERS.find(d => d.id === id)!

    const toggleScenario = (id: string) => {
        if (appliedScenarios.includes(id)) {
            setAppliedScenarios(appliedScenarios.filter(s => s !== id))
        } else {
            setAppliedScenarios([...appliedScenarios, id])
        }
    }

    return (
        <div className="min-h-screen bg-f1-black text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <GitBranch className="w-8 h-8" />
                        Race Replay Simulator
                    </h1>
                    <p className="text-white/80 mt-1">Explore alternate timelines • What-if analysis</p>
                </div>
            </div>

            <div className="container mx-auto p-4 grid lg:grid-cols-4 gap-6">
                {/* Race Selection */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <h2 className="font-bold mb-3 flex items-center gap-2">
                            <Flag className="w-5 h-5 text-f1-red" />
                            Select Race
                        </h2>
                        <div className="space-y-2">
                            {HISTORICAL_RACES.map(race => (
                                <button
                                    key={race.id}
                                    onClick={() => { setSelectedRace(race); setCurrentLap(1); }}
                                    className={`w-full text-left p-3 rounded-lg transition ${selectedRace.id === race.id
                                        ? 'bg-indigo-600'
                                        : 'bg-f1-gray-700 hover:bg-f1-gray-600'
                                        }`}
                                >
                                    <div className="font-medium">{race.name}</div>
                                    <div className="text-xs text-gray-400">Winner: {race.winner} • {race.laps} laps</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* What-If Scenarios */}
                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <h2 className="font-bold mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            What-If Scenarios
                        </h2>
                        <div className="space-y-2">
                            {WHAT_IF_SCENARIOS.map(scenario => (
                                <button
                                    key={scenario.id}
                                    onClick={() => toggleScenario(scenario.id)}
                                    className={`w-full text-left p-3 rounded-lg transition ${appliedScenarios.includes(scenario.id)
                                        ? 'bg-yellow-600/30 border border-yellow-500'
                                        : 'bg-f1-gray-700 hover:bg-f1-gray-600 border border-transparent'
                                        }`}
                                >
                                    <div className="font-medium text-sm">{scenario.description}</div>
                                    <div className="text-xs text-gray-400">Lap {scenario.lap} • {scenario.impact}</div>
                                </button>
                            ))}
                        </div>
                        {appliedScenarios.length > 0 && (
                            <button
                                onClick={() => setAppliedScenarios([])}
                                className="w-full mt-3 text-sm text-gray-400 hover:text-white flex items-center justify-center gap-1"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reset to original
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Race View */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Lap Slider */}
                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => setCurrentLap(Math.max(1, currentLap - 5))}
                                className="p-2 bg-f1-gray-700 rounded-lg hover:bg-f1-gray-600"
                            >
                                <Rewind className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`p-3 rounded-lg ${isPlaying ? 'bg-red-600' : 'bg-green-600'} hover:opacity-90`}
                            >
                                <PlayCircle className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setCurrentLap(Math.min(selectedRace.laps, currentLap + 5))}
                                className="p-2 bg-f1-gray-700 rounded-lg hover:bg-f1-gray-600"
                            >
                                <FastForward className="w-5 h-5" />
                            </button>
                            <div className="flex-1">
                                <input
                                    type="range"
                                    min={1}
                                    max={selectedRace.laps}
                                    value={currentLap}
                                    onChange={e => setCurrentLap(parseInt(e.target.value))}
                                    className="w-full accent-indigo-500"
                                />
                            </div>
                            <div className="text-2xl font-mono font-bold w-32 text-right">
                                Lap {currentLap}/{selectedRace.laps}
                            </div>
                        </div>

                        {/* Event Banner */}
                        {currentLapData.event && (
                            <div className="bg-yellow-500/20 text-yellow-400 p-3 rounded-lg mb-4 text-center font-medium">
                                {currentLapData.event}
                            </div>
                        )}

                        {/* Positions Grid */}
                        <div className="space-y-2">
                            {currentLapData.positions.slice(0, 8).map((driverId, position) => {
                                const driver = getDriver(driverId)
                                const basePosition = baseTimeline[currentLap - 1]?.positions.indexOf(driverId) ?? position
                                const positionChange = basePosition - position

                                return (
                                    <div
                                        key={driverId}
                                        className="flex items-center gap-3 bg-f1-gray-700 rounded-lg p-3 transition-all"
                                        style={{ transform: `translateY(${position * 0}px)` }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg"
                                            style={{ backgroundColor: driver.color }}
                                        >
                                            {position + 1}
                                        </div>
                                        <div className="w-16 font-mono font-bold text-lg">{driverId}</div>
                                        <div className="flex-1 text-gray-300">{driver.name}</div>
                                        <div className="text-sm text-gray-400">{driver.team}</div>
                                        {appliedScenarios.length > 0 && positionChange !== 0 && (
                                            <div className={`px-2 py-1 rounded text-sm font-bold ${positionChange > 0 ? 'bg-green-600/30 text-green-400' : 'bg-red-600/30 text-red-400'
                                                }`}>
                                                {positionChange > 0 ? `+${positionChange}` : positionChange}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Alternate Timeline Comparison */}
                    {appliedScenarios.length > 0 && (
                        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-4 border border-indigo-500/30">
                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                <GitBranch className="w-5 h-5 text-indigo-400" />
                                Alternate Timeline Active
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-400 mb-1">Original Winner</div>
                                    <div className="font-bold text-lg">{getDriver(baseTimeline[baseTimeline.length - 1]?.positions[0] || 'VER').name}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 mb-1">Alternate Winner</div>
                                    <div className="font-bold text-lg text-indigo-400">{getDriver(modifiedTimeline[modifiedTimeline.length - 1]?.positions[0] || 'VER').name}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="container mx-auto p-4">
                <Link href="/" className="text-indigo-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
