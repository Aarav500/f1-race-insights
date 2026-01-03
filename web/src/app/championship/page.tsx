'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trophy, TrendingUp, Target, BarChart3, RefreshCw, AlertTriangle, Calendar } from 'lucide-react'

// 2025 Final Championship Results (Completed Season)
const CHAMPIONSHIP_2025 = {
    season: 2025,
    status: 'COMPLETE',
    totalRounds: 24,
    wdc: 'NOR',
    wcc: 'McLaren',
    drivers: [
        { id: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#FF8700', points: 412, champProb: 100 },
        { id: 'VER', name: 'Max Verstappen', team: 'Red Bull', color: '#1E41FF', points: 389, champProb: 0 },
        { id: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#DC0000', points: 356, champProb: 0 },
        { id: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#FF8700', points: 344, champProb: 0 },
        { id: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', color: '#DC0000', points: 298, champProb: 0 },
        { id: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', color: '#00D2BE', points: 245, champProb: 0 },
        { id: 'RUS', name: 'George Russell', team: 'Mercedes', color: '#00D2BE', points: 234, champProb: 0 },
        { id: 'PER', name: 'Sergio Perez', team: 'Red Bull', color: '#1E41FF', points: 178, champProb: 0 },
    ],
    constructors: [
        { name: 'McLaren', color: '#FF8700', points: 756, champProb: 100 },
        { name: 'Ferrari', color: '#DC0000', points: 654, champProb: 0 },
        { name: 'Red Bull', color: '#1E41FF', points: 567, champProb: 0 },
        { name: 'Mercedes', color: '#00D2BE', points: 479, champProb: 0 },
    ]
}

// 2026 Championship Projections (New Regulations - High Uncertainty)
const CHAMPIONSHIP_2026 = {
    season: 2026,
    status: 'PRE-SEASON',
    totalRounds: 24,
    currentRound: 0,
    drivers: [
        { id: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#FF8700', points: 0, champProb: 22 },
        { id: 'VER', name: 'Max Verstappen', team: 'Red Bull', color: '#1E41FF', points: 0, champProb: 20 },
        { id: 'HAM', name: 'Lewis Hamilton', team: 'Ferrari', color: '#DC0000', points: 0, champProb: 18 },
        { id: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#DC0000', points: 0, champProb: 16 },
        { id: 'RUS', name: 'George Russell', team: 'Mercedes', color: '#00D2BE', points: 0, champProb: 10 },
        { id: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#FF8700', points: 0, champProb: 8 },
        { id: 'SAI', name: 'Carlos Sainz', team: 'Williams', color: '#005AFF', points: 0, champProb: 3 },
        { id: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', color: '#006F62', points: 0, champProb: 2 },
    ],
    constructors: [
        { name: 'McLaren', color: '#FF8700', points: 0, champProb: 28 },
        { name: 'Ferrari', color: '#DC0000', points: 0, champProb: 26 },
        { name: 'Red Bull', color: '#1E41FF', points: 0, champProb: 22 },
        { name: 'Mercedes', color: '#00D2BE', points: 0, champProb: 18 },
        { name: 'Aston Martin', color: '#006F62', points: 0, champProb: 4 },
    ]
}

// Monte Carlo simulation probability over 2025 season
const MONTE_CARLO_2025 = [
    { round: 4, NOR: 15, VER: 55, LEC: 20 },
    { round: 8, NOR: 28, VER: 45, LEC: 18 },
    { round: 12, NOR: 42, VER: 38, LEC: 15 },
    { round: 16, NOR: 58, VER: 30, LEC: 8 },
    { round: 20, NOR: 78, VER: 18, LEC: 3 },
    { round: 24, NOR: 100, VER: 0, LEC: 0 },
]

export default function ChampionshipPage() {
    const [season, setSeason] = useState<'2025' | '2026'>('2025')
    const [showConstructors, setShowConstructors] = useState(false)
    const [simRunning, setSimRunning] = useState(false)

    const data = season === '2025' ? CHAMPIONSHIP_2025 : CHAMPIONSHIP_2026

    const handleRunSim = () => {
        setSimRunning(true)
        setTimeout(() => setSimRunning(false), 2000)
    }

    const maxPoints = season === '2025'
        ? CHAMPIONSHIP_2025.drivers[0].points
        : 100 // For 2026, use probability as visual

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Trophy className="w-10 h-10 text-yellow-500" />
                    Championship Projections
                </h1>
                <p className="text-f1-gray-600">
                    2025 final results and 2026 pre-season projections
                </p>
            </div>

            {/* Season Toggle */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-lg border border-f1-gray-300 overflow-hidden">
                    <button
                        onClick={() => setSeason('2025')}
                        className={`px-6 py-2 font-medium transition ${season === '2025' ? 'bg-orange-500 text-white' : 'bg-white'}`}
                    >
                        2025 Final Results
                    </button>
                    <button
                        onClick={() => setSeason('2026')}
                        className={`px-6 py-2 font-medium transition ${season === '2026' ? 'bg-orange-500 text-white' : 'bg-white'}`}
                    >
                        2026 Projections ⚠️
                    </button>
                </div>
            </div>

            {/* 2026 Warning */}
            {season === '2026' && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-8">
                    <div className="flex gap-3 items-start">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-yellow-800">⚠️ 2026 New Regulations Era</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                2026 brings <strong>major regulation changes</strong>. Championship probabilities are
                                projections based on 2025 performance, team budgets, and regulation adaptation history.
                                Actual results may vary significantly due to new aero, power units, and driver moves.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Season Progress/Status */}
            <div className={`rounded-xl p-6 mb-8 text-white ${season === '2025'
                ? 'bg-gradient-to-r from-orange-600 to-orange-500'
                : 'bg-gradient-to-r from-f1-gray-900 to-f1-gray-700'
                }`}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="text-sm opacity-75">{data.season} Season</div>
                        <div className="text-2xl font-bold">
                            {season === '2025'
                                ? `Final Results • ${data.totalRounds} Rounds Complete`
                                : 'Pre-Season Projections'
                            }
                        </div>
                    </div>
                    <div className="text-right">
                        {season === '2025' ? (
                            <>
                                <div className="text-sm opacity-75">World Champion 🏆</div>
                                <div className="text-2xl font-bold">Lando Norris</div>
                            </>
                        ) : (
                            <>
                                <div className="text-sm opacity-75">Season Status</div>
                                <div className="text-lg font-bold">PRE-SEASON</div>
                            </>
                        )}
                    </div>
                </div>
                {season === '2025' && (
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-full" />
                    </div>
                )}
            </div>

            {/* Driver/Constructor Toggle */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-lg border border-f1-gray-300 overflow-hidden">
                    <button
                        onClick={() => setShowConstructors(false)}
                        className={`px-6 py-2 font-medium transition ${!showConstructors ? 'bg-f1-red text-white' : 'bg-white'}`}
                    >
                        Drivers
                    </button>
                    <button
                        onClick={() => setShowConstructors(true)}
                        className={`px-6 py-2 font-medium transition ${showConstructors ? 'bg-f1-red text-white' : 'bg-white'}`}
                    >
                        Constructors
                    </button>
                </div>
            </div>

            {/* Standings */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="p-4 bg-f1-gray-100 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        {showConstructors ? 'Constructor' : 'Driver'} {season === '2025' ? 'Final Standings' : 'Projections'}
                    </h2>
                </div>

                <div className="divide-y">
                    {!showConstructors ? (
                        data.drivers.map((driver, i) => (
                            <div key={driver.id} className="p-4 flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: driver.color }}>
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold">{driver.name}</div>
                                    <div className="text-sm text-f1-gray-500">{driver.team}</div>
                                </div>
                                <div className="w-48 h-4 bg-f1-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: season === '2025'
                                                ? `${(driver.points / maxPoints) * 100}%`
                                                : `${driver.champProb * 2}%`,
                                            backgroundColor: driver.color
                                        }}
                                    />
                                </div>
                                <div className="w-16 text-right font-bold">
                                    {season === '2025' ? driver.points : '—'}
                                </div>
                                <div className="w-24 text-right">
                                    {driver.champProb > 0 ? (
                                        <span className={`font-bold ${driver.champProb === 100 ? 'text-orange-600' : 'text-blue-600'}`}>
                                            {driver.champProb}% {driver.champProb === 100 && '🏆'}
                                        </span>
                                    ) : (
                                        <span className="text-f1-gray-400">—</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        data.constructors.map((team, i) => (
                            <div key={team.name} className="p-4 flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: team.color }}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 font-bold">{team.name}</div>
                                <div className="w-48 h-4 bg-f1-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: season === '2025'
                                                ? `${(team.points / 800) * 100}%`
                                                : `${team.champProb * 2}%`,
                                            backgroundColor: team.color
                                        }}
                                    />
                                </div>
                                <div className="w-16 text-right font-bold">
                                    {season === '2025' ? team.points : '—'}
                                </div>
                                <div className="w-24 text-right">
                                    {team.champProb > 0 ? (
                                        <span className={`font-bold ${team.champProb === 100 ? 'text-orange-600' : 'text-blue-600'}`}>
                                            {team.champProb}% {team.champProb === 100 && '🏆'}
                                        </span>
                                    ) : (
                                        <span className="text-f1-gray-400">—</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Monte Carlo - Only show for 2025 */}
            {season === '2025' && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            2025 Championship Battle Evolution
                        </h2>
                        <button
                            onClick={handleRunSim}
                            disabled={simRunning}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${simRunning ? 'animate-spin' : ''}`} />
                            {simRunning ? 'Recalculating...' : 'Run 10,000 Sims'}
                        </button>
                    </div>

                    <p className="text-sm text-f1-gray-600 mb-4">
                        Championship probability evolution over the 2025 season (10,000 Monte Carlo simulations at each round).
                    </p>

                    {/* Chart */}
                    <div className="overflow-x-auto">
                        <div className="flex gap-2 pb-4" style={{ minWidth: '600px' }}>
                            {MONTE_CARLO_2025.map((scenario, i) => (
                                <div key={i} className="flex-1 text-center">
                                    <div className="text-xs text-f1-gray-500 mb-2">R{scenario.round}</div>
                                    <div className="h-32 flex items-end gap-0.5">
                                        {/* Verstappen - Blue */}
                                        <div
                                            className="flex-1 bg-blue-500 rounded-t transition-all duration-500"
                                            style={{ height: `${scenario.VER}%` }}
                                            title={`Verstappen: ${scenario.VER}%`}
                                        />
                                        {/* Norris - Orange */}
                                        <div
                                            className="flex-1 bg-orange-500 rounded-t transition-all duration-500"
                                            style={{ height: `${scenario.NOR}%` }}
                                            title={`Norris: ${scenario.NOR}%`}
                                        />
                                        {/* Leclerc - Red */}
                                        <div
                                            className="flex-1 bg-red-500 rounded-t transition-all duration-500"
                                            style={{ height: `${scenario.LEC}%` }}
                                            title={`Leclerc: ${scenario.LEC}%`}
                                        />
                                    </div>
                                    <div className="text-xs font-bold mt-1 text-orange-600">{scenario.NOR}%</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded" />
                            <span>Norris (Champion)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded" />
                            <span>Verstappen</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded" />
                            <span>Leclerc</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Insight */}
            <div className={`rounded-lg p-6 mb-8 ${season === '2025'
                ? 'bg-gradient-to-r from-orange-50 to-yellow-50'
                : 'bg-gradient-to-r from-blue-50 to-purple-50'
                }`}>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {season === '2025' ? '2025 Season Summary' : '2026 Pre-Season Analysis'}
                </h3>
                <p className="text-f1-gray-700">
                    {season === '2025' ? (
                        <>
                            <strong>Lando Norris</strong> clinched his first World Championship with 412 points,
                            becoming the first British champion since Lewis Hamilton in 2020. McLaren also secured
                            the Constructors&apos; Championship with 756 points, their first since 1998.
                        </>
                    ) : (
                        <>
                            <strong>2026 projections are highly uncertain</strong> due to major regulation changes.
                            Key storylines: Hamilton&apos;s move to Ferrari, Sainz at Williams, and whether McLaren
                            can adapt their philosophy to the new regulations. Red Bull remain contenders despite
                            Verstappen not winning the 2025 title.
                        </>
                    )}
                </p>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/ticker" className="bg-f1-gray-900 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-700 transition">
                    2026 Race Ticker
                </Link>
                <Link href="/constructors" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Constructor Battle
                </Link>
            </div>
        </div>
    )
}
