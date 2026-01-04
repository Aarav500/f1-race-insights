'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Target, Zap, Shield, Cloud, Flame, Award } from 'lucide-react'
import { DRIVERS_2025, DRIVER_STATS } from '@/constants/f1-data'
import FeatureInfo from '@/components/FeatureInfo'

// Driver archetypes based on their traits
const ARCHETYPES = {
    'The Terminator': { description: 'Relentless, consistent, maximizes every opportunity', traits: ['consistency', 'racePace'] },
    'The Qualifier': { description: 'Lightning fast on Saturday, extracts maximum from the car', traits: ['qualiPace'] },
    'The Rainmaster': { description: 'Thrives in changing conditions, exceptional car control', traits: ['wetSkill'] },
    'The Opportunist': { description: 'Aggressive when it matters, capitalizes on chaos', traits: ['aggression'] },
    'The Veteran': { description: 'Experienced campaigner, rarely makes mistakes', traits: ['experience', 'consistency'] },
    'The Rising Star': { description: 'Raw talent, still learning but showing flashes of brilliance', traits: ['qualiPace', 'aggression'] },
} as const

// Assign archetypes to drivers
const DRIVER_ARCHETYPES: Record<string, keyof typeof ARCHETYPES> = {
    VER: 'The Terminator',
    HAM: 'The Veteran',
    ALO: 'The Veteran',
    NOR: 'The Rising Star',
    LEC: 'The Qualifier',
    RUS: 'The Qualifier',
    PIA: 'The Rising Star',
    SAI: 'The Opportunist',
    GAS: 'The Rainmaster',
    ANT: 'The Rising Star',
    LAW: 'The Opportunist',
    STR: 'The Opportunist',
    TSU: 'The Opportunist',
    ALB: 'The Rainmaster',
    OCO: 'The Veteran',
    HUL: 'The Veteran',
    DOO: 'The Rising Star',
    HAD: 'The Rising Star',
    BEA: 'The Rising Star',
    BOR: 'The Rising Star',
}

export default function DriverDNAPage() {
    const [selectedDriver, setSelectedDriver] = useState('VER')
    const [compareDriver, setCompareDriver] = useState<string | null>(null)

    const driver = DRIVERS_2025.find(d => d.id === selectedDriver)!
    const stats = DRIVER_STATS[selectedDriver as keyof typeof DRIVER_STATS]
    const archetype = DRIVER_ARCHETYPES[selectedDriver] || 'The Rising Star'

    const compareDriverData = compareDriver ? DRIVERS_2025.find(d => d.id === compareDriver) : null
    const compareStats = compareDriver ? DRIVER_STATS[compareDriver as keyof typeof DRIVER_STATS] : null

    // Calculate DNA traits for radar chart
    const traits = [
        { name: 'Qualifying', value: 100 - stats.qualiPace * 100, icon: Zap },
        { name: 'Race Pace', value: 100 - stats.racePace * 100, icon: Flame },
        { name: 'Consistency', value: stats.consistency, icon: Target },
        { name: 'Wet Skill', value: stats.wetSkill, icon: Cloud },
        { name: 'Aggression', value: stats.aggression, icon: Shield },
        { name: 'Experience', value: stats.experience, icon: Award },
    ]

    // Radar chart points
    const radarPoints = traits.map((trait, i) => {
        const angle = (Math.PI * 2 * i) / traits.length - Math.PI / 2
        const radius = (trait.value / 100) * 120
        return {
            x: 150 + radius * Math.cos(angle),
            y: 150 + radius * Math.sin(angle),
            labelX: 150 + 145 * Math.cos(angle),
            labelY: 150 + 145 * Math.sin(angle),
            ...trait,
        }
    })

    const comparePoints = compareStats ? traits.map((trait, i) => {
        const compareValue = trait.name === 'Qualifying' ? 100 - (compareStats.qualiPace || 0) * 100 :
            trait.name === 'Race Pace' ? 100 - (compareStats.racePace || 0) * 100 :
                trait.name === 'Consistency' ? compareStats.consistency :
                    trait.name === 'Wet Skill' ? compareStats.wetSkill :
                        trait.name === 'Aggression' ? compareStats.aggression :
                            compareStats.experience
        const angle = (Math.PI * 2 * i) / traits.length - Math.PI / 2
        const radius = (compareValue / 100) * 120
        return {
            x: 150 + radius * Math.cos(angle),
            y: 150 + radius * Math.sin(angle),
        }
    }) : []

    const polygonPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
    const comparePolygonPath = comparePoints.length ? comparePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z' : ''

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <User className="w-8 h-8" />
                        Driver DNA Profile
                    </h1>
                    <p className="text-white/80 mt-1">AI-powered driving style analysis • Personality classification</p>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Feature Info */}
                <FeatureInfo
                    title="Driver DNA Profile"
                    description="Analyzes each driver's unique characteristics across 6 key dimensions: qualifying pace, race pace, consistency, wet weather skill, aggression, and experience. Uses historical data to classify drivers into archetypes."
                    advantage="Understanding a driver's DNA helps predict their performance in different conditions. A 'Rainmaster' will likely outperform in wet races, while a 'Qualifier' may struggle to convert pole positions to wins."
                    skills={['Data clustering', 'Radar chart visualization', 'Driver profiling', 'Performance analytics', 'SVG graphics']}
                    f1Context="Teams use driver profiling extensively for recruitment and development. Red Bull's junior program famously profiles drivers on aggression and adaptability."
                />

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Driver Selection */}
                    <div className="space-y-4">
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Select Drivers</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Primary Driver</label>
                                    <select
                                        value={selectedDriver}
                                        onChange={e => setSelectedDriver(e.target.value)}
                                        className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                    >
                                        {DRIVERS_2025.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.team})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Compare With</label>
                                    <select
                                        value={compareDriver || ''}
                                        onChange={e => setCompareDriver(e.target.value || null)}
                                        className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                                    >
                                        <option value="">None</option>
                                        {DRIVERS_2025.filter(d => d.id !== selectedDriver).map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.team})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Driver Card */}
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                                    style={{ backgroundColor: driver.color }}
                                >
                                    {driver.number}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{driver.fullName}</h2>
                                    <div className="text-gray-400">{driver.team}</div>
                                    <div className="text-sm text-gray-500 mt-1">🏁 {driver.country}</div>
                                </div>
                            </div>

                            {/* Archetype */}
                            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 mb-6">
                                <div className="text-sm text-purple-400 mb-1">Driver Archetype</div>
                                <div className="text-xl font-bold text-white">{archetype}</div>
                                <div className="text-sm text-gray-400 mt-1">{ARCHETYPES[archetype].description}</div>
                            </div>

                            {/* Trait Bars */}
                            <div className="space-y-3">
                                {traits.map(trait => (
                                    <div key={trait.name}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400 flex items-center gap-2">
                                                <trait.icon className="w-4 h-4" />
                                                {trait.name}
                                            </span>
                                            <span className="text-white font-bold">{trait.value.toFixed(0)}</span>
                                        </div>
                                        <div className="h-2 bg-f1-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                                style={{ width: `${trait.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Radar Chart */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">DNA Radar</h2>
                        <div className="flex justify-center">
                            <svg viewBox="0 0 300 300" className="w-full max-w-lg">
                                {/* Grid lines */}
                                {[20, 40, 60, 80, 100].map(level => {
                                    const r = (level / 100) * 120
                                    const points = traits.map((_, i) => {
                                        const angle = (Math.PI * 2 * i) / traits.length - Math.PI / 2
                                        return `${150 + r * Math.cos(angle)},${150 + r * Math.sin(angle)}`
                                    }).join(' ')
                                    return (
                                        <polygon
                                            key={level}
                                            points={points}
                                            fill="none"
                                            stroke="#374151"
                                            strokeWidth="1"
                                        />
                                    )
                                })}

                                {/* Axis lines */}
                                {traits.map((_, i) => {
                                    const angle = (Math.PI * 2 * i) / traits.length - Math.PI / 2
                                    return (
                                        <line
                                            key={i}
                                            x1="150"
                                            y1="150"
                                            x2={150 + 120 * Math.cos(angle)}
                                            y2={150 + 120 * Math.sin(angle)}
                                            stroke="#374151"
                                            strokeWidth="1"
                                        />
                                    )
                                })}

                                {/* Compare driver polygon */}
                                {comparePolygonPath && (
                                    <path
                                        d={comparePolygonPath}
                                        fill={`${compareDriverData?.color}33`}
                                        stroke={compareDriverData?.color}
                                        strokeWidth="2"
                                    />
                                )}

                                {/* Main driver polygon */}
                                <path
                                    d={polygonPath}
                                    fill={`${driver.color}44`}
                                    stroke={driver.color}
                                    strokeWidth="2"
                                />

                                {/* Points */}
                                {radarPoints.map((point, i) => (
                                    <circle
                                        key={i}
                                        cx={point.x}
                                        cy={point.y}
                                        r="4"
                                        fill={driver.color}
                                    />
                                ))}

                                {/* Labels */}
                                {radarPoints.map((point, i) => (
                                    <text
                                        key={i}
                                        x={point.labelX}
                                        y={point.labelY}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="fill-gray-400 text-xs"
                                    >
                                        {point.name}
                                    </text>
                                ))}
                            </svg>
                        </div>

                        {/* Legend */}
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: driver.color }} />
                                <span className="text-white text-sm">{driver.name}</span>
                            </div>
                            {compareDriverData && (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: compareDriverData.color }} />
                                    <span className="text-white text-sm">{compareDriverData.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* All Drivers Grid */}
                <div className="mt-6 bg-f1-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">2025 Grid - Driver Archetypes</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {DRIVERS_2025.map(d => {
                            const dArchetype = DRIVER_ARCHETYPES[d.id] || 'The Rising Star'
                            return (
                                <button
                                    key={d.id}
                                    onClick={() => setSelectedDriver(d.id)}
                                    className={`p-3 rounded-lg text-left transition ${selectedDriver === d.id
                                            ? 'bg-purple-600 ring-2 ring-purple-400'
                                            : 'bg-f1-gray-700 hover:bg-f1-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                            style={{ backgroundColor: d.color }}
                                        >
                                            {d.number}
                                        </div>
                                        <span className="text-white font-medium text-sm">{d.name}</span>
                                    </div>
                                    <div className="text-xs text-purple-400">{dArchetype}</div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-purple-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
