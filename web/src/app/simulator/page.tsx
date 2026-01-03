'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Pause, RotateCcw, Trophy, TrendingUp, Shuffle, Flag, Target } from 'lucide-react'

// Driver standings data
const INITIAL_STANDINGS = [
    { driver: 'VER', name: 'Verstappen', team: 'Red Bull', points: 437, color: '#1E41FF', avgPoints: 18.2 },
    { driver: 'NOR', name: 'Norris', team: 'McLaren', points: 374, color: '#FF8700', avgPoints: 15.6 },
    { driver: 'LEC', name: 'Leclerc', team: 'Ferrari', points: 356, color: '#DC0000', avgPoints: 14.8 },
    { driver: 'PIA', name: 'Piastri', team: 'McLaren', points: 292, color: '#FF8700', avgPoints: 12.2 },
    { driver: 'SAI', name: 'Sainz', team: 'Ferrari', points: 290, color: '#DC0000', avgPoints: 12.1 },
    { driver: 'RUS', name: 'Russell', team: 'Mercedes', points: 245, color: '#00D2BE', avgPoints: 10.2 },
    { driver: 'HAM', name: 'Hamilton', team: 'Mercedes', points: 223, color: '#00D2BE', avgPoints: 9.3 },
    { driver: 'PER', name: 'Perez', team: 'Red Bull', points: 152, color: '#1E41FF', avgPoints: 6.3 },
]

// Remaining races (simulated)
const REMAINING_RACES = [
    'Bahrain GP', 'Saudi Arabia GP', 'Australia GP', 'Japan GP', 'China GP',
]

// Point scoring system
const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]

export default function SimulatorPage() {
    const [standings, setStandings] = useState([...INITIAL_STANDINGS])
    const [completedRaces, setCompletedRaces] = useState<string[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [simulationSpeed, setSimulationSpeed] = useState(1000)
    const [championshipProbs, setChampionshipProbs] = useState<Record<string, number>>({})
    const [raceResults, setRaceResults] = useState<{ race: string; results: typeof INITIAL_STANDINGS }[]>([])

    // Simulate a race
    const simulateRace = () => {
        if (completedRaces.length >= REMAINING_RACES.length) return

        const race = REMAINING_RACES[completedRaces.length]

        // Randomly shuffle drivers weighted by avg performance
        const shuffled = [...standings]
            .map(d => ({ ...d, random: Math.random() * d.avgPoints }))
            .sort((a, b) => b.random - a.random)

        // Assign points
        const newStandings = standings.map(driver => {
            const position = shuffled.findIndex(d => d.driver === driver.driver)
            const pointsGained = position < 10 ? POINTS[position] : 0
            return { ...driver, points: driver.points + pointsGained }
        }).sort((a, b) => b.points - a.points)

        setStandings(newStandings)
        setCompletedRaces([...completedRaces, race])
        setRaceResults([...raceResults, { race, results: shuffled.slice(0, 10) }])
    }

    // Run simulation automatically
    useEffect(() => {
        if (!isRunning) return
        if (completedRaces.length >= REMAINING_RACES.length) {
            setIsRunning(false)
            return
        }

        const timer = setTimeout(simulateRace, simulationSpeed)
        return () => clearTimeout(timer)
    }, [isRunning, completedRaces.length, simulationSpeed])

    // Run Monte Carlo for probabilities
    const runMonteCarlo = () => {
        const simCount = 1000
        const wins: Record<string, number> = {}

        INITIAL_STANDINGS.forEach(d => wins[d.driver] = 0)

        for (let i = 0; i < simCount; i++) {
            const simStandings = [...INITIAL_STANDINGS]

            for (let r = 0; r < REMAINING_RACES.length; r++) {
                const shuffled = simStandings
                    .map(d => ({ ...d, random: Math.random() * d.avgPoints }))
                    .sort((a, b) => b.random - a.random)

                simStandings.forEach((driver, idx) => {
                    const position = shuffled.findIndex(d => d.driver === driver.driver)
                    simStandings[idx] = {
                        ...driver,
                        points: driver.points + (position < 10 ? POINTS[position] : 0)
                    }
                })
            }

            const winner = simStandings.sort((a, b) => b.points - a.points)[0]
            wins[winner.driver]++
        }

        const probs: Record<string, number> = {}
        Object.keys(wins).forEach(d => probs[d] = (wins[d] / simCount) * 100)
        setChampionshipProbs(probs)
    }

    // Reset simulation
    const resetSimulation = () => {
        setStandings([...INITIAL_STANDINGS])
        setCompletedRaces([])
        setRaceResults([])
        setIsRunning(false)
        setChampionshipProbs({})
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Shuffle className="w-10 h-10 text-purple-600" />
                    Season Simulator
                </h1>
                <p className="text-f1-gray-600">
                    Monte Carlo simulation of remaining races with probability analysis
                </p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        disabled={completedRaces.length >= REMAINING_RACES.length}
                        className="bg-f1-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        {isRunning ? 'Pause' : 'Run Simulation'}
                    </button>
                    <button
                        onClick={simulateRace}
                        disabled={isRunning || completedRaces.length >= REMAINING_RACES.length}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Flag className="w-5 h-5" />
                        Next Race
                    </button>
                    <button
                        onClick={runMonteCarlo}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                    >
                        <Target className="w-5 h-5" />
                        Run 1000 Sims
                    </button>
                    <button
                        onClick={resetSimulation}
                        className="bg-f1-gray-700 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-600 transition flex items-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Reset
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Speed:</span>
                        <select
                            value={simulationSpeed}
                            onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                            className="border rounded px-3 py-2"
                        >
                            <option value={2000}>Slow</option>
                            <option value={1000}>Normal</option>
                            <option value={500}>Fast</option>
                            <option value={100}>Instant</option>
                        </select>
                    </div>
                </div>
                <div className="text-center mt-4 text-f1-gray-500">
                    Races completed: {completedRaces.length} / {REMAINING_RACES.length}
                </div>
            </div>

            {/* Monte Carlo Results */}
            {Object.keys(championshipProbs).length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Championship Win Probability (1000 simulations)
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(championshipProbs)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([driver, prob]) => {
                                const d = INITIAL_STANDINGS.find(s => s.driver === driver)!
                                return (
                                    <div key={driver} className="flex items-center gap-4">
                                        <div className="w-20 font-bold">{d.name}</div>
                                        <div className="flex-1">
                                            <div className="h-6 bg-white rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${prob}%`, backgroundColor: d.color }}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-16 text-right font-bold">{prob.toFixed(1)}%</div>
                                    </div>
                                )
                            })}
                    </div>
                </div>
            )}

            {/* Current Standings */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Current Standings
                    </h3>
                    <div className="space-y-2">
                        {standings.slice(0, 8).map((driver, i) => (
                            <div key={driver.driver} className="flex items-center gap-3 p-2 rounded-lg hover:bg-f1-gray-50">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-f1-gray-100'}`}>
                                    {i + 1}
                                </div>
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: driver.color }} />
                                <div className="flex-1 font-bold">{driver.name}</div>
                                <div className="text-sm text-f1-gray-500">{driver.team}</div>
                                <div className="font-mono font-bold">{driver.points}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Race Results */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Flag className="w-5 h-5 text-green-600" />
                        Race Results
                    </h3>
                    {raceResults.length === 0 ? (
                        <div className="text-center text-f1-gray-500 py-8">
                            No races simulated yet. Click &quot;Run Simulation&quot; or &quot;Next Race&quot; to start.
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                            {[...raceResults].reverse().slice(0, 3).map((race, rIdx) => (
                                <div key={rIdx} className="border-b pb-3 last:border-0">
                                    <div className="font-bold text-sm text-f1-gray-500 mb-2">{race.race}</div>
                                    <div className="flex gap-2">
                                        {race.results.slice(0, 3).map((d, i) => (
                                            <div key={i} className="flex items-center gap-1 text-sm">
                                                <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                                <span className="font-bold">{d.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/championship" className="bg-f1-gray-900 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-700 transition">
                    Championship Projections
                </Link>
                <Link href="/history" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Historical Accuracy
                </Link>
            </div>
        </div>
    )
}
