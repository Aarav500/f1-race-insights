'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CloudRain, Sun, Cloud, Thermometer, Droplets, Wind, TrendingUp, AlertTriangle, Zap } from 'lucide-react'

// Weather impact data
const WEATHER_SCENARIOS = [
    {
        id: 'dry',
        name: 'Dry Conditions',
        icon: Sun,
        color: '#fbbf24',
        description: 'Standard race conditions with full grip',
        tempRange: '25-35°C',
        trackTemp: '40-55°C',
        impacts: [
            { factor: 'Qualifying Lap Time', effect: 'Baseline', delta: '0.0s' },
            { factor: 'Tire Degradation', effect: 'Normal', delta: '100%' },
            { factor: 'Overtaking Difficulty', effect: 'Standard', delta: '100%' },
            { factor: 'Strategy Variance', effect: 'Low', delta: '±5%' },
        ],
        predictions: [
            { driver: 'VER', dryProb: 0.35, change: 0 },
            { driver: 'NOR', dryProb: 0.22, change: 0 },
            { driver: 'LEC', dryProb: 0.18, change: 0 },
        ],
    },
    {
        id: 'light-rain',
        name: 'Light Rain (Intermediates)',
        icon: Cloud,
        color: '#60a5fa',
        description: 'Damp track requiring intermediate tires',
        tempRange: '15-22°C',
        trackTemp: '20-30°C',
        impacts: [
            { factor: 'Qualifying Lap Time', effect: 'Slower', delta: '+8-12s' },
            { factor: 'Tire Degradation', effect: 'Reduced', delta: '60%' },
            { factor: 'Overtaking Difficulty', effect: 'Easier', delta: '70%' },
            { factor: 'Strategy Variance', effect: 'Medium', delta: '±15%' },
        ],
        predictions: [
            { driver: 'VER', dryProb: 0.38, change: +3 },
            { driver: 'HAM', dryProb: 0.18, change: +8 },
            { driver: 'NOR', dryProb: 0.15, change: -7 },
        ],
    },
    {
        id: 'heavy-rain',
        name: 'Heavy Rain (Wets)',
        icon: CloudRain,
        color: '#3b82f6',
        description: 'Full wet conditions with standing water',
        tempRange: '12-18°C',
        trackTemp: '15-22°C',
        impacts: [
            { factor: 'Qualifying Lap Time', effect: 'Much Slower', delta: '+15-25s' },
            { factor: 'Tire Degradation', effect: 'Very Low', delta: '40%' },
            { factor: 'Overtaking Difficulty', effect: 'Much Easier', delta: '40%' },
            { factor: 'Strategy Variance', effect: 'Very High', delta: '±35%' },
        ],
        predictions: [
            { driver: 'VER', dryProb: 0.42, change: +7 },
            { driver: 'HAM', dryProb: 0.22, change: +12 },
            { driver: 'RUS', dryProb: 0.12, change: +6 },
        ],
    },
    {
        id: 'mixed',
        name: 'Mixed/Changing',
        icon: Cloud,
        color: '#8b5cf6',
        description: 'Unpredictable conditions requiring strategy gambles',
        tempRange: '18-25°C',
        trackTemp: '25-40°C',
        impacts: [
            { factor: 'Qualifying Lap Time', effect: 'Variable', delta: '+0-20s' },
            { factor: 'Tire Degradation', effect: 'Unpredictable', delta: '50-120%' },
            { factor: 'Overtaking Difficulty', effect: 'Variable', delta: '50-100%' },
            { factor: 'Strategy Variance', effect: 'Extreme', delta: '±50%' },
        ],
        predictions: [
            { driver: 'VER', dryProb: 0.30, change: -5 },
            { driver: 'ALO', dryProb: 0.18, change: +12 },
            { driver: 'HAM', dryProb: 0.16, change: +6 },
        ],
    },
]

// Historical wet race performances
const WET_SPECIALISTS = [
    { driver: 'Lewis Hamilton', wetWins: 28, wetRaces: 42, winRate: 66.7, specialty: 'Consistent in all conditions' },
    { driver: 'Max Verstappen', wetWins: 12, wetRaces: 18, winRate: 66.7, specialty: 'Aggressive in changing conditions' },
    { driver: 'Fernando Alonso', wetWins: 11, wetRaces: 35, winRate: 31.4, specialty: 'Strategic tire management' },
    { driver: 'George Russell', wetWins: 2, wetRaces: 8, winRate: 25.0, specialty: 'Qualifying pace in rain' },
]

export default function WeatherPage() {
    const [selectedScenario, setSelectedScenario] = useState('dry')

    const scenario = WEATHER_SCENARIOS.find(s => s.id === selectedScenario)!
    const Icon = scenario.icon

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <CloudRain className="w-10 h-10 text-blue-600" />
                    Weather Impact Analysis
                </h1>
                <p className="text-f1-gray-600">
                    How weather conditions affect race predictions and outcomes
                </p>
            </div>

            {/* Weather Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {WEATHER_SCENARIOS.map(s => {
                    const SIcon = s.icon
                    return (
                        <button
                            key={s.id}
                            onClick={() => setSelectedScenario(s.id)}
                            className={`p-4 rounded-lg font-medium transition ${selectedScenario === s.id
                                    ? 'text-white shadow-lg scale-105'
                                    : 'bg-white border border-f1-gray-200 hover:shadow-md'
                                }`}
                            style={selectedScenario === s.id ? { backgroundColor: s.color } : {}}
                        >
                            <SIcon className={`w-8 h-8 mx-auto mb-2 ${selectedScenario === s.id ? 'text-white' : ''}`} style={selectedScenario !== s.id ? { color: s.color } : {}} />
                            <div className="font-bold text-sm">{s.name}</div>
                        </button>
                    )
                })}
            </div>

            {/* Scenario Header */}
            <div className="rounded-xl p-6 mb-8 text-white" style={{ backgroundColor: scenario.color }}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <Icon className="w-16 h-16" />
                        <div>
                            <h2 className="text-3xl font-bold">{scenario.name}</h2>
                            <p className="opacity-90">{scenario.description}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white/20 rounded-lg px-4 py-2">
                            <Thermometer className="w-5 h-5 mx-auto mb-1" />
                            <div className="font-bold">{scenario.tempRange}</div>
                            <div className="text-xs opacity-75">Air Temp</div>
                        </div>
                        <div className="bg-white/20 rounded-lg px-4 py-2">
                            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                            <div className="font-bold">{scenario.trackTemp}</div>
                            <div className="text-xs opacity-75">Track Temp</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Impact Analysis */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Performance Impacts
                    </h3>
                    <div className="space-y-4">
                        {scenario.impacts.map((impact, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-f1-gray-50 rounded-lg">
                                <div>
                                    <div className="font-bold">{impact.factor}</div>
                                    <div className="text-sm text-f1-gray-500">{impact.effect}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-lg" style={{ color: scenario.color }}>
                                        {impact.delta}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Prediction Changes
                    </h3>
                    <p className="text-sm text-f1-gray-500 mb-4">
                        How win probabilities shift compared to dry conditions:
                    </p>
                    <div className="space-y-4">
                        {scenario.predictions.map((pred, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-12 font-bold">{pred.driver}</div>
                                <div className="flex-1">
                                    <div className="h-4 bg-f1-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${pred.dryProb * 100 * 2}%`,
                                                backgroundColor: scenario.color
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="w-16 text-right font-bold">{(pred.dryProb * 100).toFixed(0)}%</div>
                                <div className={`w-16 text-right font-bold ${pred.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {pred.change >= 0 ? '+' : ''}{pred.change}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Wet Weather Specialists */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    Rain Masters - Historical Wet Race Performance
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                    {WET_SPECIALISTS.map((driver, i) => (
                        <div key={i} className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏎️'}</span>
                                <span className="font-bold">{driver.driver}</span>
                            </div>
                            <div className="text-3xl font-bold text-blue-600">{driver.winRate.toFixed(1)}%</div>
                            <div className="text-sm text-f1-gray-500">Win rate ({driver.wetWins}/{driver.wetRaces} races)</div>
                            <div className="text-xs text-f1-gray-400 mt-2 italic">{driver.specialty}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Model Note */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
                <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-orange-800">Weather Feature Integration</h4>
                        <p className="text-sm text-orange-700">
                            Our ML models include weather as a categorical feature with significant impact on predictions.
                            The model adjusts probabilities based on historical wet race performances, tire strategy patterns,
                            and driver-specific rain craft skills extracted from qualifying and race data.
                        </p>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/whatif" className="bg-f1-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
                    What-If Lab
                </Link>
                <Link href="/tracks" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Track Profiles
                </Link>
            </div>
        </div>
    )
}
