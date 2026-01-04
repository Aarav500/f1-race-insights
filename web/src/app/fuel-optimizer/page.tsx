'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Fuel, Scale, TrendingDown, Timer, Gauge } from 'lucide-react'

export default function FuelOptimizerPage() {
    const [raceLength, setRaceLength] = useState(57)
    const [lapTime, setLapTime] = useState(93)
    const [fuelPerLap, setFuelPerLap] = useState(1.8)
    const [tankCapacity, setTankCapacity] = useState(110)
    const [weightEffect, setWeightEffect] = useState(0.035) // seconds per kg
    const [safetyMargin, setSafetyMargin] = useState(2)

    const analysis = useMemo(() => {
        // Calculate fuel requirements
        const totalFuelNeeded = raceLength * fuelPerLap + safetyMargin
        const canComplete = totalFuelNeeded <= tankCapacity

        // Calculate lap times with fuel load
        const laps = []
        let currentFuel = Math.min(totalFuelNeeded, tankCapacity)
        let totalTime = 0

        for (let lap = 1; lap <= raceLength; lap++) {
            const fuelWeight = currentFuel // kg
            const timePenalty = fuelWeight * weightEffect
            const adjustedLapTime = lapTime + timePenalty - (lap * 0.01) // slight improvement as fuel burns

            totalTime += adjustedLapTime
            laps.push({
                lap,
                fuel: currentFuel.toFixed(1),
                lapTime: adjustedLapTime.toFixed(3),
                totalTime: totalTime.toFixed(1),
                weight: (fuelWeight).toFixed(1),
            })

            currentFuel -= fuelPerLap
        }

        // Calculate optimal scenarios
        const minFuel = raceLength * fuelPerLap * 0.98 // absolute minimum
        const optimalFuel = raceLength * fuelPerLap + 1.5 // slight margin

        const firstLapPenalty = (totalFuelNeeded * weightEffect).toFixed(2)
        const lastLapTime = laps[laps.length - 1]?.lapTime || String(lapTime)
        const improvement = (parseFloat(laps[0]?.lapTime || '0') - parseFloat(lastLapTime)).toFixed(2)

        const formatTime = (seconds: number) => {
            const hours = Math.floor(seconds / 3600)
            const mins = Math.floor((seconds % 3600) / 60)
            const secs = Math.floor(seconds % 60)
            return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` : `${mins}:${secs.toString().padStart(2, '0')}`
        }

        return {
            laps,
            totalFuelNeeded: totalFuelNeeded.toFixed(1),
            canComplete,
            minFuel: minFuel.toFixed(1),
            optimalFuel: optimalFuel.toFixed(1),
            firstLapPenalty,
            improvement,
            totalRaceTime: formatTime(totalTime),
            avgLapTime: (totalTime / raceLength).toFixed(3),
        }
    }, [raceLength, lapTime, fuelPerLap, tankCapacity, weightEffect, safetyMargin])

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Fuel className="w-8 h-8" />
                        Fuel Load Optimizer
                    </h1>
                    <p className="text-white/80 mt-1">Weight vs. pace tradeoff calculator • Power unit engineering</p>
                </div>
            </div>

            <div className="container mx-auto p-4 grid lg:grid-cols-2 gap-6">
                {/* Controls */}
                <div className="space-y-4">
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Race Parameters</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Race Length: {raceLength} laps</label>
                                <input
                                    type="range" min="20" max="78"
                                    value={raceLength}
                                    onChange={e => setRaceLength(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Base Lap Time: {lapTime}s</label>
                                <input
                                    type="range" min="60" max="120" step="0.5"
                                    value={lapTime}
                                    onChange={e => setLapTime(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Fuel Consumption: {fuelPerLap} kg/lap</label>
                                <input
                                    type="range" min="1.2" max="2.5" step="0.1"
                                    value={fuelPerLap}
                                    onChange={e => setFuelPerLap(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Tank Capacity: {tankCapacity} kg</label>
                                <input
                                    type="range" min="90" max="120"
                                    value={tankCapacity}
                                    onChange={e => setTankCapacity(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Weight Effect: {(weightEffect * 1000).toFixed(0)}ms per kg</label>
                                <input
                                    type="range" min="0.020" max="0.050" step="0.001"
                                    value={weightEffect}
                                    onChange={e => setWeightEffect(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Safety Margin: {safetyMargin} kg</label>
                                <input
                                    type="range" min="0" max="5" step="0.5"
                                    value={safetyMargin}
                                    onChange={e => setSafetyMargin(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className={`rounded-xl p-6 ${analysis.canComplete ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            {analysis.canComplete ?
                                <Gauge className="w-8 h-8 text-green-400" /> :
                                <Scale className="w-8 h-8 text-red-400" />
                            }
                            <div>
                                <div className={`text-xl font-bold ${analysis.canComplete ? 'text-green-400' : 'text-red-400'}`}>
                                    {analysis.canComplete ? 'VIABLE' : 'INSUFFICIENT FUEL'}
                                </div>
                                <div className="text-sm text-gray-400">
                                    {analysis.canComplete ? 'Race distance achievable' : 'Cannot complete race distance'}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-white">{analysis.totalFuelNeeded}kg</div>
                                <div className="text-xs text-gray-400">Required Fuel</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{tankCapacity}kg</div>
                                <div className="text-xs text-gray-400">Tank Capacity</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {/* Summary */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Race Summary</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-f1-gray-700 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white font-mono">{analysis.totalRaceTime}</div>
                                <div className="text-sm text-gray-400">Total Race Time</div>
                            </div>
                            <div className="bg-f1-gray-700 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white font-mono">{analysis.avgLapTime}s</div>
                                <div className="text-sm text-gray-400">Average Lap Time</div>
                            </div>
                            <div className="bg-f1-gray-700 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-yellow-400">+{analysis.firstLapPenalty}s</div>
                                <div className="text-sm text-gray-400">Lap 1 Weight Penalty</div>
                            </div>
                            <div className="bg-f1-gray-700 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-green-400">{analysis.improvement}s</div>
                                <div className="text-sm text-gray-400">Improvement (L1→Last)</div>
                            </div>
                        </div>
                    </div>

                    {/* Fuel Burn Chart */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-orange-400" />
                            Fuel Burn Profile
                        </h2>
                        <div className="relative h-48 border-l border-b border-gray-600 ml-10">
                            {/* Y-axis */}
                            <div className="absolute -left-10 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
                                <span>{tankCapacity}kg</span>
                                <span>{Math.round(tankCapacity / 2)}kg</span>
                                <span>0kg</span>
                            </div>

                            {/* Fuel curve */}
                            <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${raceLength} ${tankCapacity}`} preserveAspectRatio="none">
                                <path
                                    d={analysis.laps.map((lap, i) => {
                                        const x = i
                                        const y = tankCapacity - parseFloat(lap.fuel)
                                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#f97316"
                                    strokeWidth="0.5"
                                />
                                <path
                                    d={`M 0 ${tankCapacity} ` + analysis.laps.map((lap, i) => {
                                        const x = i
                                        const y = tankCapacity - parseFloat(lap.fuel)
                                        return `L ${x} ${y}`
                                    }).join(' ') + ` L ${raceLength - 1} ${tankCapacity} Z`}
                                    fill="rgba(249, 115, 22, 0.2)"
                                />
                            </svg>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 ml-10 mt-2">
                            <span>Lap 1</span>
                            <span>Lap {Math.floor(raceLength / 2)}</span>
                            <span>Lap {raceLength}</span>
                        </div>
                    </div>

                    {/* Optimal Strategies */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Fuel Strategies</h2>
                        <div className="space-y-3">
                            <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/50">
                                <div className="flex justify-between">
                                    <span className="text-red-400 font-bold">Minimum (Risky)</span>
                                    <span className="text-white font-mono">{analysis.minFuel}kg</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">No margin for safety car or lift-and-coast</div>
                            </div>
                            <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/50">
                                <div className="flex justify-between">
                                    <span className="text-green-400 font-bold">Optimal</span>
                                    <span className="text-white font-mono">{analysis.optimalFuel}kg</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Balanced performance with safety margin</div>
                            </div>
                            <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/50">
                                <div className="flex justify-between">
                                    <span className="text-blue-400 font-bold">Current Selection</span>
                                    <span className="text-white font-mono">{analysis.totalFuelNeeded}kg</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">With {safetyMargin}kg safety margin</div>
                            </div>
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
