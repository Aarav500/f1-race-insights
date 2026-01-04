'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Timer, TrendingUp, TrendingDown, Gauge, Users } from 'lucide-react'

const DRIVERS = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF', qualiPace: 0, racePace: 0.05, consistency: 95 },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700', qualiPace: 0.15, racePace: 0.12, consistency: 88 },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000', qualiPace: 0.08, racePace: 0.22, consistency: 82 },
    { id: 'HAM', name: 'Hamilton', team: 'Ferrari', color: '#DC0000', qualiPace: 0.18, racePace: 0.10, consistency: 92 },
    { id: 'PIA', name: 'Piastri', team: 'McLaren', color: '#FF8700', qualiPace: 0.22, racePace: 0.18, consistency: 85 },
    { id: 'RUS', name: 'Russell', team: 'Mercedes', color: '#00D2BE', qualiPace: 0.12, racePace: 0.25, consistency: 80 },
    { id: 'SAI', name: 'Sainz', team: 'Williams', color: '#005AFF', qualiPace: 0.25, racePace: 0.20, consistency: 90 },
    { id: 'ALO', name: 'Alonso', team: 'Aston Martin', color: '#006F62', qualiPace: 0.30, racePace: 0.15, consistency: 93 },
]

const RACES = [
    { id: 'bhr', name: 'Bahrain', type: 'Standard' },
    { id: 'jed', name: 'Jeddah', type: 'Street' },
    { id: 'mel', name: 'Melbourne', type: 'Standard' },
    { id: 'suz', name: 'Suzuka', type: 'Technical' },
    { id: 'mon', name: 'Monaco', type: 'Street' },
    { id: 'spa', name: 'Spa', type: 'Power' },
    { id: 'mon', name: 'Monza', type: 'Power' },
    { id: 'sin', name: 'Singapore', type: 'Street' },
]

export default function RacePacePage() {
    const [selectedDrivers, setSelectedDrivers] = useState(['VER', 'NOR', 'LEC', 'HAM'])

    const analysis = useMemo(() => {
        return selectedDrivers.map(driverId => {
            const driver = DRIVERS.find(d => d.id === driverId)!

            // Calculate Saturday vs Sunday performance delta
            const deltaQtoR = driver.racePace - driver.qualiPace
            const isSaturdayDriver = deltaQtoR > 0 // Better in quali than race
            const isSundayDriver = deltaQtoR < 0 // Better in race than quali

            return {
                ...driver,
                deltaQtoR,
                isSaturdayDriver,
                isSundayDriver,
                qualiRank: 0,
                raceRank: 0,
                overallRank: 0,
            }
        }).sort((a, b) => (a.qualiPace + a.racePace) / 2 - (b.qualiPace + b.racePace) / 2)
            .map((driver, idx, arr) => {
                const qualiSorted = [...arr].sort((a, b) => a.qualiPace - b.qualiPace)
                const raceSorted = [...arr].sort((a, b) => a.racePace - b.racePace)

                return {
                    ...driver,
                    qualiRank: qualiSorted.findIndex(d => d.id === driver.id) + 1,
                    raceRank: raceSorted.findIndex(d => d.id === driver.id) + 1,
                    overallRank: idx + 1,
                }
            })
    }, [selectedDrivers])

    const toggleDriver = (id: string) => {
        if (selectedDrivers.includes(id)) {
            if (selectedDrivers.length > 2) {
                setSelectedDrivers(selectedDrivers.filter(d => d !== id))
            }
        } else {
            setSelectedDrivers([...selectedDrivers, id])
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Timer className="w-8 h-8" />
                        Race Pace vs Qualifying Pace
                    </h1>
                    <p className="text-white/80 mt-1">Saturday vs Sunday performance • Driver strength analysis</p>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Driver Selection */}
                <div className="bg-f1-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Compare Drivers
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {DRIVERS.map(d => (
                            <button
                                key={d.id}
                                onClick={() => toggleDriver(d.id)}
                                className={`px-4 py-2 rounded-lg font-bold transition ${selectedDrivers.includes(d.id)
                                        ? 'text-white'
                                        : 'bg-f1-gray-700 text-gray-400 hover:text-white'
                                    }`}
                                style={{ backgroundColor: selectedDrivers.includes(d.id) ? d.color : undefined }}
                            >
                                {d.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comparison Chart */}
                <div className="bg-f1-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Pace Comparison</h2>

                    <div className="space-y-6">
                        {analysis.map(driver => (
                            <div key={driver.id} className="border-l-4 rounded-lg p-4 bg-f1-gray-700" style={{ borderLeftColor: driver.color }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: driver.color }}>
                                            {driver.id}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-lg">{driver.name}</div>
                                            <div className="text-gray-400 text-sm">{driver.team}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {driver.isSaturdayDriver && (
                                            <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-bold">SATURDAY DRIVER</span>
                                        )}
                                        {driver.isSundayDriver && (
                                            <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full font-bold">SUNDAY DRIVER</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-purple-400">Qualifying Pace</span>
                                            <span className="text-white">+{driver.qualiPace.toFixed(2)}s (P{driver.qualiRank})</span>
                                        </div>
                                        <div className="h-3 bg-f1-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-500"
                                                style={{ width: `${Math.max(5, 100 - driver.qualiPace * 200)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-green-400">Race Pace</span>
                                            <span className="text-white">+{driver.racePace.toFixed(2)}s (P{driver.raceRank})</span>
                                        </div>
                                        <div className="h-3 bg-f1-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${Math.max(5, 100 - driver.racePace * 200)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Gauge className="w-4 h-4 text-yellow-400" />
                                        <span className="text-gray-400">Consistency: </span>
                                        <span className="text-white font-bold">{driver.consistency}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {driver.deltaQtoR > 0 ? (
                                            <TrendingDown className="w-4 h-4 text-red-400" />
                                        ) : (
                                            <TrendingUp className="w-4 h-4 text-green-400" />
                                        )}
                                        <span className="text-gray-400">Quali→Race: </span>
                                        <span className={driver.deltaQtoR > 0 ? 'text-red-400' : 'text-green-400'}>
                                            {driver.deltaQtoR > 0 ? '+' : ''}{driver.deltaQtoR.toFixed(2)}s
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary Table */}
                <div className="bg-f1-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Driver Classification</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 bg-purple-400 rounded-full" />
                                Saturday Specialists (Better in Quali)
                            </h3>
                            <div className="space-y-2">
                                {analysis.filter(d => d.isSaturdayDriver).map(driver => (
                                    <div key={driver.id} className="flex items-center justify-between p-2 bg-f1-gray-700 rounded-lg">
                                        <span className="text-white">{driver.name}</span>
                                        <span className="text-purple-400 font-mono">
                                            +{driver.deltaQtoR.toFixed(2)}s race deficit
                                        </span>
                                    </div>
                                ))}
                                {analysis.filter(d => d.isSaturdayDriver).length === 0 && (
                                    <div className="text-gray-400 text-sm">No Saturday specialists in selection</div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-400 rounded-full" />
                                Sunday Specialists (Better in Race)
                            </h3>
                            <div className="space-y-2">
                                {analysis.filter(d => d.isSundayDriver).map(driver => (
                                    <div key={driver.id} className="flex items-center justify-between p-2 bg-f1-gray-700 rounded-lg">
                                        <span className="text-white">{driver.name}</span>
                                        <span className="text-green-400 font-mono">
                                            {driver.deltaQtoR.toFixed(2)}s race advantage
                                        </span>
                                    </div>
                                ))}
                                {analysis.filter(d => d.isSundayDriver).length === 0 && (
                                    <div className="text-gray-400 text-sm">No Sunday specialists in selection</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-pink-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
