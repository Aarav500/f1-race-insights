'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dna, Shield, Zap, Target, Brain, Heart } from 'lucide-react'

const DRIVERS = [
    {
        id: 'VER',
        name: 'Max Verstappen',
        team: 'Red Bull',
        color: '#1E41FF',
        style: 'Aggressive Calculator',
        traits: {
            aggression: 92,
            consistency: 95,
            raceIQ: 98,
            wetSkill: 90,
            tireMgmt: 88,
            defending: 85,
            overtaking: 95,
            qualifying: 94,
            pressure: 97,
            experience: 88,
        },
        strengths: ['Race craft', 'Wet weather', 'Mental fortitude'],
        weaknesses: ['Occasional over-aggression'],
        archetypes: ['Senna', 'Schumacher'],
    },
    {
        id: 'HAM',
        name: 'Lewis Hamilton',
        team: 'Ferrari',
        color: '#DC0000',
        style: 'Calculated Predator',
        traits: {
            aggression: 75,
            consistency: 92,
            raceIQ: 96,
            wetSkill: 95,
            tireMgmt: 94,
            defending: 90,
            overtaking: 88,
            qualifying: 92,
            pressure: 90,
            experience: 100,
        },
        strengths: ['Tire management', 'Experience', 'Wet weather'],
        weaknesses: ['Age-related reaction time'],
        archetypes: ['Prost', 'Fangio'],
    },
    {
        id: 'NOR',
        name: 'Lando Norris',
        team: 'McLaren',
        color: '#FF8700',
        style: 'Raw Talent',
        traits: {
            aggression: 78,
            consistency: 82,
            raceIQ: 88,
            wetSkill: 85,
            tireMgmt: 80,
            defending: 75,
            overtaking: 82,
            qualifying: 90,
            pressure: 72,
            experience: 65,
        },
        strengths: ['Natural speed', 'Qualifying', 'Adaptability'],
        weaknesses: ['Pressure moments', 'Championship experience'],
        archetypes: ['Leclerc', 'Gasly'],
    },
    {
        id: 'LEC',
        name: 'Charles Leclerc',
        team: 'Ferrari',
        color: '#DC0000',
        style: 'Emotional Charger',
        traits: {
            aggression: 85,
            consistency: 78,
            raceIQ: 84,
            wetSkill: 80,
            tireMgmt: 75,
            defending: 82,
            overtaking: 88,
            qualifying: 96,
            pressure: 80,
            experience: 70,
        },
        strengths: ['Qualifying pace', 'Single lap speed', 'Street circuits'],
        weaknesses: ['Error under pressure', 'Tire degradation'],
        archetypes: ['Alonso (young)', 'Vettel'],
    },
    {
        id: 'ALO',
        name: 'Fernando Alonso',
        team: 'Aston Martin',
        color: '#006F62',
        style: 'Tactical Genius',
        traits: {
            aggression: 80,
            consistency: 90,
            raceIQ: 98,
            wetSkill: 92,
            tireMgmt: 95,
            defending: 98,
            overtaking: 85,
            qualifying: 85,
            pressure: 95,
            experience: 100,
        },
        strengths: ['Wheel-to-wheel racing', 'Defense', 'Strategic thinking'],
        weaknesses: ['Car setup dependency'],
        archetypes: ['Schumacher', 'Prost'],
    },
]

export default function DriverDNAPage() {
    const [selectedDriver, setSelectedDriver] = useState(DRIVERS[0])

    const traitLabels: Record<string, { icon: typeof Zap, color: string }> = {
        aggression: { icon: Zap, color: 'text-red-400' },
        consistency: { icon: Target, color: 'text-green-400' },
        raceIQ: { icon: Brain, color: 'text-purple-400' },
        wetSkill: { icon: Shield, color: 'text-blue-400' },
        tireMgmt: { icon: Heart, color: 'text-pink-400' },
        defending: { icon: Shield, color: 'text-yellow-400' },
        overtaking: { icon: Zap, color: 'text-orange-400' },
        qualifying: { icon: Target, color: 'text-cyan-400' },
        pressure: { icon: Brain, color: 'text-indigo-400' },
        experience: { icon: Heart, color: 'text-emerald-400' },
    }

    const avgTrait = Object.values(selectedDriver.traits).reduce((a, b) => a + b, 0) / Object.values(selectedDriver.traits).length

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Dna className="w-8 h-8" />
                        Driver DNA Profile
                    </h1>
                    <p className="text-white/80 mt-1">Personality-based driving style classification • AI clustering analysis</p>
                </div>
            </div>

            <div className="container mx-auto p-4 grid lg:grid-cols-3 gap-6">
                {/* Driver Selection */}
                <div className="bg-f1-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Select Driver</h2>
                    <div className="space-y-2">
                        {DRIVERS.map(driver => (
                            <button
                                key={driver.id}
                                onClick={() => setSelectedDriver(driver)}
                                className={`w-full p-4 rounded-lg flex items-center gap-3 transition ${selectedDriver.id === driver.id
                                        ? 'ring-2 ring-white/50'
                                        : 'bg-f1-gray-700 hover:bg-f1-gray-600'
                                    }`}
                                style={{
                                    backgroundColor: selectedDriver.id === driver.id ? `${driver.color}40` : undefined,
                                    borderLeft: `4px solid ${driver.color}`
                                }}
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: driver.color }}>
                                    {driver.id}
                                </div>
                                <div className="text-left">
                                    <div className="text-white font-bold">{driver.name}</div>
                                    <div className="text-gray-400 text-sm">{driver.team}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Profile */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Driver Header */}
                    <div
                        className="rounded-xl p-6 border-l-4"
                        style={{ backgroundColor: `${selectedDriver.color}20`, borderLeftColor: selectedDriver.color }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: selectedDriver.color }}>
                                {selectedDriver.id}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedDriver.name}</h2>
                                <div className="text-gray-400">{selectedDriver.team}</div>
                                <div className="mt-1 inline-block px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                                    {selectedDriver.style}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">{avgTrait.toFixed(0)}</div>
                                <div className="text-sm text-gray-400">Overall Rating</div>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-gray-400 mb-1">Compared to: {selectedDriver.archetypes.join(', ')}</div>
                                <div className="flex gap-1">
                                    {selectedDriver.archetypes.map(arch => (
                                        <span key={arch} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white">{arch}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trait Breakdown */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Trait Analysis</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {Object.entries(selectedDriver.traits).map(([trait, value]) => {
                                const config = traitLabels[trait]
                                const Icon = config.icon
                                return (
                                    <div key={trait} className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 ${config.color}`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-400 capitalize">{trait.replace(/([A-Z])/g, ' $1')}</span>
                                                <span className="text-white font-bold">{value}</span>
                                            </div>
                                            <div className="h-2 bg-f1-gray-600 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${value}%`,
                                                        backgroundColor: value >= 90 ? '#22c55e' : value >= 80 ? '#eab308' : value >= 70 ? '#f97316' : '#ef4444'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-green-900/30 rounded-xl p-6 border border-green-500/30">
                            <h3 className="text-lg font-bold text-green-400 mb-3">Strengths</h3>
                            <ul className="space-y-2">
                                {selectedDriver.strengths.map((s, i) => (
                                    <li key={i} className="flex items-center gap-2 text-white">
                                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-red-900/30 rounded-xl p-6 border border-red-500/30">
                            <h3 className="text-lg font-bold text-red-400 mb-3">Areas to Improve</h3>
                            <ul className="space-y-2">
                                {selectedDriver.weaknesses.map((w, i) => (
                                    <li key={i} className="flex items-center gap-2 text-white">
                                        <span className="w-2 h-2 bg-red-400 rounded-full" />
                                        {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Radar Chart Placeholder */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Performance Radar</h3>
                        <div className="relative h-64 flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Simplified radar visualization */}
                                <div className="relative w-48 h-48">
                                    {[100, 80, 60, 40, 20].map(ring => (
                                        <div
                                            key={ring}
                                            className="absolute border border-gray-600 rounded-full"
                                            style={{
                                                width: `${ring * 2}%`,
                                                height: `${ring * 2}%`,
                                                top: `${50 - ring}%`,
                                                left: `${50 - ring}%`
                                            }}
                                        />
                                    ))}
                                    {/* Driver profile overlay */}
                                    <div
                                        className="absolute rounded-full opacity-50"
                                        style={{
                                            width: `${avgTrait * 2}%`,
                                            height: `${avgTrait * 2}%`,
                                            top: `${50 - avgTrait}%`,
                                            left: `${50 - avgTrait}%`,
                                            backgroundColor: selectedDriver.color
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="text-center z-10">
                                <div className="text-5xl font-bold text-white">{avgTrait.toFixed(0)}</div>
                                <div className="text-gray-400">Overall</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-purple-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
