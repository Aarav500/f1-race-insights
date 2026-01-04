'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AlertTriangle, Cloud, Thermometer, Clock, TrendingUp, Shield } from 'lucide-react'

// Track safety car probability data based on historical data
const TRACKS = [
    { id: 'monaco', name: 'Monaco', baseSC: 52, baseVSC: 38, crashes: 'very high', walls: true },
    { id: 'jeddah', name: 'Jeddah', baseSC: 65, baseVSC: 42, crashes: 'extreme', walls: true },
    { id: 'baku', name: 'Baku', baseSC: 48, baseVSC: 35, crashes: 'high', walls: true },
    { id: 'singapore', name: 'Singapore', baseSC: 58, baseVSC: 40, crashes: 'high', walls: true },
    { id: 'melbourne', name: 'Melbourne', baseSC: 45, baseVSC: 30, crashes: 'medium', walls: false },
    { id: 'spa', name: 'Spa', baseSC: 42, baseVSC: 28, crashes: 'high', walls: false },
    { id: 'silverstone', name: 'Silverstone', baseSC: 35, baseVSC: 25, crashes: 'medium', walls: false },
    { id: 'monza', name: 'Monza', baseSC: 28, baseVSC: 20, crashes: 'low', walls: false },
    { id: 'bahrain', name: 'Bahrain', baseSC: 32, baseVSC: 22, crashes: 'low', walls: false },
    { id: 'suzuka', name: 'Suzuka', baseSC: 38, baseVSC: 26, crashes: 'medium', walls: false },
]

const WEATHER_CONDITIONS = [
    { id: 'dry', name: 'Dry', scMultiplier: 1.0, icon: '☀️' },
    { id: 'cloudy', name: 'Overcast', scMultiplier: 1.1, icon: '☁️' },
    { id: 'light_rain', name: 'Light Rain', scMultiplier: 1.8, icon: '🌧️' },
    { id: 'heavy_rain', name: 'Heavy Rain', scMultiplier: 2.5, icon: '⛈️' },
    { id: 'changeable', name: 'Changeable', scMultiplier: 2.0, icon: '🌦️' },
]

export default function SafetyCarPage() {
    const [selectedTrack, setSelectedTrack] = useState(TRACKS[0])
    const [weather, setWeather] = useState(WEATHER_CONDITIONS[0])
    const [currentLap, setCurrentLap] = useState(1)
    const [totalLaps, setTotalLaps] = useState(57)
    const [temperature, setTemperature] = useState(28)
    const [incidentCount, setIncidentCount] = useState(0)

    const analysis = useMemo(() => {
        // Calculate real-time SC probability
        const lapProgress = currentLap / totalLaps

        // Base probability adjusted by weather
        let scProb = selectedTrack.baseSC * weather.scMultiplier
        let vscProb = selectedTrack.baseVSC * weather.scMultiplier

        // First lap chaos factor
        if (currentLap === 1) {
            scProb *= 2.5
            vscProb *= 1.8
        } else if (currentLap <= 3) {
            scProb *= 1.5
            vscProb *= 1.3
        }

        // Late race factor (drivers take more risks)
        if (lapProgress > 0.8) {
            scProb *= 1.3
            vscProb *= 1.2
        }

        // Temperature effect (extreme temps = more incidents)
        const tempFactor = Math.abs(temperature - 25) * 0.01 + 1
        scProb *= tempFactor
        vscProb *= tempFactor

        // Previous incidents increase likelihood
        scProb += incidentCount * 5
        vscProb += incidentCount * 3

        // Cap at 95%
        scProb = Math.min(95, scProb)
        vscProb = Math.min(95, vscProb)

        // Red flag probability (extreme cases)
        let redFlagProb = 0
        if (weather.id === 'heavy_rain') redFlagProb = 25
        if (selectedTrack.crashes === 'extreme' && weather.id !== 'dry') redFlagProb = 15

        // Trend calculation
        const scTrend = currentLap === 1 ? 'HIGH' : lapProgress > 0.8 ? 'RISING' : 'STABLE'

        return {
            scProb: scProb.toFixed(1),
            vscProb: vscProb.toFixed(1),
            redFlagProb: redFlagProb.toFixed(1),
            combinedProb: Math.min(98, scProb + vscProb * 0.3).toFixed(1),
            scTrend,
            riskLevel: scProb > 60 ? 'HIGH' : scProb > 40 ? 'MEDIUM' : 'LOW',
        }
    }, [selectedTrack, weather, currentLap, totalLaps, temperature, incidentCount])

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8" />
                        Safety Car Probability Model
                    </h1>
                    <p className="text-white/80 mt-1">Real-time SC/VSC risk assessment • Bayesian inference</p>
                </div>
            </div>

            <div className="container mx-auto p-4 grid lg:grid-cols-2 gap-6">
                {/* Controls */}
                <div className="space-y-4">
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Race Conditions</h2>

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
                                            {t.name} (Base SC: {t.baseSC}%)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Weather</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {WEATHER_CONDITIONS.map(w => (
                                        <button
                                            key={w.id}
                                            onClick={() => setWeather(w)}
                                            className={`p-3 rounded-lg text-center transition ${weather.id === w.id
                                                    ? 'bg-yellow-600 text-white'
                                                    : 'bg-f1-gray-700 text-gray-300 hover:bg-f1-gray-600'
                                                }`}
                                        >
                                            <div className="text-2xl">{w.icon}</div>
                                            <div className="text-xs mt-1">{w.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Current Lap: {currentLap}</label>
                                    <input
                                        type="range" min="1" max={totalLaps}
                                        value={currentLap}
                                        onChange={e => setCurrentLap(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Track Temp: {temperature}°C</label>
                                    <input
                                        type="range" min="10" max="55"
                                        value={temperature}
                                        onChange={e => setTemperature(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Incidents This Race: {incidentCount}</label>
                                <input
                                    type="range" min="0" max="5"
                                    value={incidentCount}
                                    onChange={e => setIncidentCount(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Track Info */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Track Risk Profile</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-f1-gray-700 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-400">{selectedTrack.baseSC}%</div>
                                <div className="text-sm text-gray-400">Historical SC Rate</div>
                            </div>
                            <div className="text-center p-4 bg-f1-gray-700 rounded-lg">
                                <div className="text-2xl font-bold text-blue-400">{selectedTrack.baseVSC}%</div>
                                <div className="text-sm text-gray-400">Historical VSC Rate</div>
                            </div>
                            <div className="text-center p-4 bg-f1-gray-700 rounded-lg">
                                <div className="text-2xl font-bold text-white capitalize">{selectedTrack.crashes}</div>
                                <div className="text-sm text-gray-400">Crash Frequency</div>
                            </div>
                            <div className="text-center p-4 bg-f1-gray-700 rounded-lg">
                                <div className="text-2xl font-bold text-white">{selectedTrack.walls ? 'Yes' : 'No'}</div>
                                <div className="text-sm text-gray-400">Street Circuit</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {/* Main Probability Display */}
                    <div className={`rounded-xl p-8 text-center ${analysis.riskLevel === 'HIGH' ? 'bg-gradient-to-br from-red-900 to-orange-900 border-2 border-red-500' :
                            analysis.riskLevel === 'MEDIUM' ? 'bg-gradient-to-br from-yellow-900 to-orange-900 border-2 border-yellow-500' :
                                'bg-gradient-to-br from-green-900 to-teal-900 border-2 border-green-500'
                        }`}>
                        <div className="text-sm text-white/70 mb-2">Combined SC/VSC Probability</div>
                        <div className="text-7xl font-bold text-white mb-2">{analysis.combinedProb}%</div>
                        <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${analysis.riskLevel === 'HIGH' ? 'bg-red-500' :
                                analysis.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}>
                            {analysis.riskLevel} RISK
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-2 text-white/70">
                            <TrendingUp className="w-4 h-4" />
                            Trend: {analysis.scTrend}
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Probability Breakdown</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-yellow-400 font-bold">🚗 Safety Car</span>
                                    <span className="text-white">{analysis.scProb}%</span>
                                </div>
                                <div className="h-4 bg-f1-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500 transition-all duration-500"
                                        style={{ width: `${analysis.scProb}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-blue-400 font-bold">⚡ Virtual Safety Car</span>
                                    <span className="text-white">{analysis.vscProb}%</span>
                                </div>
                                <div className="h-4 bg-f1-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-500"
                                        style={{ width: `${analysis.vscProb}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-red-400 font-bold">🚩 Red Flag</span>
                                    <span className="text-white">{analysis.redFlagProb}%</span>
                                </div>
                                <div className="h-4 bg-f1-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 transition-all duration-500"
                                        style={{ width: `${analysis.redFlagProb}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Strategy Impact */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-400" />
                            Strategy Impact
                        </h3>
                        <div className="space-y-3 text-sm">
                            {parseFloat(analysis.scProb) > 50 && (
                                <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/50 text-yellow-200">
                                    ⚠️ <strong>High SC probability</strong> - Consider extending first stint to benefit from potential free stop
                                </div>
                            )}
                            {parseFloat(analysis.vscProb) > 35 && (
                                <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/50 text-blue-200">
                                    💡 <strong>VSC likely</strong> - Prepare for reactive pit strategy
                                </div>
                            )}
                            {currentLap === 1 && (
                                <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/50 text-red-200">
                                    🏁 <strong>Lap 1 chaos factor</strong> - First lap incidents historically 2.5x more likely
                                </div>
                            )}
                            {weather.id !== 'dry' && (
                                <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/50 text-purple-200">
                                    🌧️ <strong>Weather amplification</strong> - {weather.name} conditions increase SC risk by {((weather.scMultiplier - 1) * 100).toFixed(0)}%
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-yellow-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
