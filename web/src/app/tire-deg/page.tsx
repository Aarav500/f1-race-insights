'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Activity, TrendingDown, Timer, Thermometer } from 'lucide-react'

// Tire degradation data based on real F1 patterns
const TRACKS = [
    { id: 'bahrain', name: 'Bahrain', abrasion: 'high', temp: 28, lapTime: 93 },
    { id: 'spa', name: 'Spa', abrasion: 'medium', temp: 18, lapTime: 106 },
    { id: 'monaco', name: 'Monaco', abrasion: 'low', temp: 22, lapTime: 74 },
    { id: 'silverstone', name: 'Silverstone', abrasion: 'high', temp: 20, lapTime: 88 },
    { id: 'monza', name: 'Monza', abrasion: 'low', temp: 24, lapTime: 81 },
    { id: 'suzuka', name: 'Suzuka', abrasion: 'high', temp: 22, lapTime: 91 },
    { id: 'singapore', name: 'Singapore', abrasion: 'high', temp: 30, lapTime: 102 },
    { id: 'austin', name: 'COTA', abrasion: 'medium', temp: 26, lapTime: 96 },
]

const COMPOUNDS = [
    { id: 'soft', name: 'Soft', color: '#e10600', baseDeg: 0.12, peakLap: 1, cliffLap: 15 },
    { id: 'medium', name: 'Medium', color: '#fcd34d', baseDeg: 0.07, peakLap: 3, cliffLap: 28 },
    { id: 'hard', name: 'Hard', color: '#f5f5f5', baseDeg: 0.04, peakLap: 5, cliffLap: 45 },
]

export default function TireDegPage() {
    const [selectedTrack, setSelectedTrack] = useState(TRACKS[0])
    const [temperature, setTemperature] = useState(28)
    const [fuelLoad, setFuelLoad] = useState(100)

    const degradationData = useMemo(() => {
        const abrasionMultiplier = selectedTrack.abrasion === 'high' ? 1.3 : selectedTrack.abrasion === 'medium' ? 1.0 : 0.7
        const tempMultiplier = 1 + (temperature - 25) * 0.02
        const fuelMultiplier = 1 + (fuelLoad / 100) * 0.1

        return COMPOUNDS.map(compound => {
            const laps = []
            let lapTime = selectedTrack.lapTime
            let totalDeg = 0

            for (let lap = 1; lap <= 50; lap++) {
                // Calculate degradation per lap
                let degRate = compound.baseDeg * abrasionMultiplier * tempMultiplier * fuelMultiplier

                // Pre-cliff: linear degradation
                if (lap < compound.cliffLap) {
                    totalDeg += degRate
                } else {
                    // Post-cliff: exponential degradation
                    totalDeg += degRate * (1 + (lap - compound.cliffLap) * 0.15)
                }

                // Peak performance after 1-5 laps (scrub-in)
                const peakBonus = lap < compound.peakLap ? (compound.peakLap - lap) * 0.1 : 0

                const adjustedLapTime = lapTime + totalDeg + peakBonus
                const fuelEffect = ((100 - fuelLoad) / 100) * lap * 0.03 // Fuel burn effect

                laps.push({
                    lap,
                    time: (adjustedLapTime - fuelEffect).toFixed(2),
                    deg: totalDeg.toFixed(2),
                    isCliff: lap === compound.cliffLap,
                })
            }

            return {
                ...compound,
                laps,
                optimalLife: compound.cliffLap - 3,
                maxLife: compound.cliffLap + 5,
            }
        })
    }, [selectedTrack, temperature, fuelLoad])

    const maxDeg = Math.max(...degradationData.flatMap(c => c.laps.map(l => parseFloat(l.deg))))

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Activity className="w-8 h-8" />
                        Tire Degradation Curves
                    </h1>
                    <p className="text-white/80 mt-1">AWS-style visualization • Pirelli compound analysis</p>
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
                                    <option key={t.id} value={t.id}>{t.name} ({t.abrasion} abrasion)</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                                <Thermometer className="w-4 h-4" /> Track Temp: {temperature}°C
                            </label>
                            <input
                                type="range" min="10" max="50"
                                value={temperature}
                                onChange={e => setTemperature(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Fuel Load: {fuelLoad}%</label>
                            <input
                                type="range" min="0" max="100"
                                value={fuelLoad}
                                onChange={e => setFuelLoad(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Degradation Chart */}
                <div className="bg-f1-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-400" />
                        Lap Time Degradation
                    </h2>

                    {/* Chart Area */}
                    <div className="relative h-80 border-b border-l border-gray-600 ml-10 mb-6">
                        {/* Y-axis labels */}
                        <div className="absolute -left-10 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
                            <span>+{maxDeg.toFixed(1)}s</span>
                            <span>+{(maxDeg / 2).toFixed(1)}s</span>
                            <span>0s</span>
                        </div>

                        {/* Chart lines */}
                        {degradationData.map(compound => (
                            <svg key={compound.id} className="absolute inset-0 w-full h-full" viewBox="0 0 500 300" preserveAspectRatio="none">
                                <path
                                    d={compound.laps.map((lap, i) => {
                                        const x = (i / 50) * 500
                                        const y = 300 - (parseFloat(lap.deg) / maxDeg) * 280
                                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                                    }).join(' ')}
                                    fill="none"
                                    stroke={compound.color}
                                    strokeWidth="3"
                                />
                                {/* Cliff marker */}
                                <circle
                                    cx={(compound.cliffLap / 50) * 500}
                                    cy={300 - (parseFloat(compound.laps[compound.cliffLap - 1]?.deg || '0') / maxDeg) * 280}
                                    r="6"
                                    fill={compound.color}
                                    stroke="#fff"
                                    strokeWidth="2"
                                />
                            </svg>
                        ))}
                    </div>

                    {/* X-axis */}
                    <div className="flex justify-between text-xs text-gray-400 ml-10">
                        <span>Lap 1</span>
                        <span>Lap 10</span>
                        <span>Lap 20</span>
                        <span>Lap 30</span>
                        <span>Lap 40</span>
                        <span>Lap 50</span>
                    </div>
                </div>

                {/* Compound Cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {degradationData.map(compound => (
                        <div
                            key={compound.id}
                            className="bg-f1-gray-800 rounded-xl p-6 border-l-4"
                            style={{ borderLeftColor: compound.color }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: compound.color }} />
                                <div>
                                    <div className="font-bold text-white text-lg">{compound.name}</div>
                                    <div className="text-sm text-gray-400">{compound.baseDeg * 100}s/lap base deg</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-green-400">{compound.optimalLife}</div>
                                    <div className="text-xs text-gray-400">Optimal Life</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-400">{compound.cliffLap}</div>
                                    <div className="text-xs text-gray-400">Cliff Lap</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-red-400">{compound.maxLife}</div>
                                    <div className="text-xs text-gray-400">Max Life</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{compound.laps[compound.optimalLife - 1]?.deg}s</div>
                                    <div className="text-xs text-gray-400">Total Deg</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Track Info */}
                <div className="bg-f1-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Track Characteristics: {selectedTrack.name}</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{selectedTrack.abrasion}</div>
                            <div className="text-sm text-gray-400">Surface Abrasion</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{selectedTrack.temp}°C</div>
                            <div className="text-sm text-gray-400">Avg Track Temp</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{selectedTrack.lapTime}s</div>
                            <div className="text-sm text-gray-400">Avg Lap Time</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{Math.round(selectedTrack.lapTime * 0.35)}s</div>
                            <div className="text-sm text-gray-400">Est. Pit Loss</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-orange-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
