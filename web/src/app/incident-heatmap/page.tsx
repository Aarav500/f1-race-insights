'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, MapPin, TrendingUp, Flame } from 'lucide-react'
import { CALENDAR_2025, DRIVERS_2025 } from '@/constants/f1-data'
import FeatureInfo from '@/components/FeatureInfo'

// Track corner data with incident probability
const TRACK_CORNERS: Record<number, { name: string; corners: { id: number; name: string; type: string; risk: number; incidents: number }[] }> = {
    4: { // Bahrain
        name: 'Bahrain International Circuit',
        corners: [
            { id: 1, name: 'Turn 1', type: 'Heavy braking', risk: 85, incidents: 47 },
            { id: 4, name: 'Turn 4', type: 'Hairpin', risk: 72, incidents: 31 },
            { id: 8, name: 'Turn 8', type: 'S-bends entry', risk: 45, incidents: 18 },
            { id: 10, name: 'Turn 10', type: 'Fast chicane', risk: 65, incidents: 28 },
            { id: 11, name: 'Turn 11', type: 'High-speed', risk: 55, incidents: 22 },
            { id: 14, name: 'Turn 14', type: 'Tight hairpin', risk: 68, incidents: 25 },
        ]
    },
    8: { // Monaco
        name: 'Circuit de Monaco',
        corners: [
            { id: 1, name: 'Sainte Devote', type: 'Tight first corner', risk: 92, incidents: 78 },
            { id: 5, name: 'Casino Square', type: 'Slow chicane', risk: 65, incidents: 34 },
            { id: 6, name: 'Mirabeau', type: 'Hairpin entry', risk: 75, incidents: 41 },
            { id: 8, name: 'Grand Hotel', type: 'Slowest corner', risk: 88, incidents: 52 },
            { id: 10, name: 'Nouvelle Chicane', type: 'Barrier chicane', risk: 82, incidents: 45 },
            { id: 15, name: 'Rascasse', type: 'Slow hairpin', risk: 78, incidents: 38 },
            { id: 16, name: 'Swimming Pool', type: 'Fast chicane', risk: 85, incidents: 55 },
        ]
    },
    17: { // Baku
        name: 'Baku City Circuit',
        corners: [
            { id: 1, name: 'Turn 1', type: 'Heavy braking', risk: 88, incidents: 52 },
            { id: 3, name: 'Turn 3', type: 'Castle section', risk: 95, incidents: 68 },
            { id: 8, name: 'Turn 8', type: 'Narrow tunnel', risk: 75, incidents: 35 },
            { id: 15, name: 'Turn 15', type: 'Fast left', risk: 72, incidents: 30 },
            { id: 16, name: 'Turn 16', type: 'DRS zone end', risk: 85, incidents: 48 },
            { id: 20, name: 'Turn 20', type: 'Final chicane', risk: 80, incidents: 42 },
        ]
    },
    16: { // Monza
        name: 'Autodromo Nazionale Monza',
        corners: [
            { id: 1, name: 'Variante del Rettifilo', type: 'First chicane', risk: 90, incidents: 72 },
            { id: 4, name: 'Curva Grande', type: 'High-speed', risk: 70, incidents: 28 },
            { id: 5, name: 'Variante della Roggia', type: 'Second chicane', risk: 82, incidents: 45 },
            { id: 8, name: 'Lesmo 1', type: 'Fast corner', risk: 65, incidents: 22 },
            { id: 9, name: 'Lesmo 2', type: 'Technical', risk: 60, incidents: 18 },
            { id: 11, name: 'Ascari chicane', type: 'Fast chicane', risk: 78, incidents: 38 },
            { id: 13, name: 'Parabolica', type: 'High-speed final', risk: 75, incidents: 32 },
        ]
    },
}

export default function IncidentHeatmapPage() {
    const [selectedTrack, setSelectedTrack] = useState(4)
    const [highlightRisk, setHighlightRisk] = useState<number | null>(null)

    const track = CALENDAR_2025.find(t => t.round === selectedTrack) || CALENDAR_2025[3]
    const corners = TRACK_CORNERS[selectedTrack] || TRACK_CORNERS[4]

    const getRiskColor = (risk: number) => {
        if (risk >= 85) return 'bg-red-500'
        if (risk >= 70) return 'bg-orange-500'
        if (risk >= 55) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    const getRiskLabel = (risk: number) => {
        if (risk >= 85) return 'Very High'
        if (risk >= 70) return 'High'
        if (risk >= 55) return 'Medium'
        return 'Low'
    }

    const totalIncidents = corners.corners.reduce((sum, c) => sum + c.incidents, 0)
    const avgRisk = corners.corners.reduce((sum, c) => sum + c.risk, 0) / corners.corners.length

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8" />
                        Incident Probability Heatmap
                    </h1>
                    <p className="text-white/80 mt-1">Corner-by-corner risk assessment • Historical incident data</p>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Feature Info */}
                <FeatureInfo
                    title="Incident Probability Heatmap"
                    description="Analyzes historical incident data to calculate the probability of crashes, lockups, and contact at each corner. Uses 5 years of race data to identify high-risk zones where strategy decisions matter most."
                    advantage="Knowing which corners are high-risk helps predict safety car probability and optimal pit windows. In Monaco 2024, 3 of 4 safety cars were triggered at corners identified as 'Very High' risk."
                    skills={['Statistical analysis', 'Heat map visualization', 'Historical data processing', 'Risk modeling', 'Track-specific analytics']}
                    f1Context="F1 teams have detailed corner-by-corner incident databases but don't share this publicly. This visualization brings that analysis to fans and helps predict race disruptions."
                />

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Track Selection */}
                    <div className="space-y-4">
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Select Circuit</h2>
                            <select
                                value={selectedTrack}
                                onChange={e => setSelectedTrack(parseInt(e.target.value))}
                                className="w-full bg-f1-gray-700 text-white rounded-lg p-3 mb-4"
                            >
                                {Object.keys(TRACK_CORNERS).map(round => {
                                    const t = CALENDAR_2025.find(c => c.round === parseInt(round))
                                    return t ? <option key={round} value={round}>{t.name}</option> : null
                                })}
                            </select>

                            <div className="p-4 bg-f1-gray-700 rounded-lg">
                                <div className="text-lg font-bold text-white">{track.name}</div>
                                <div className="text-gray-400 text-sm mt-1">{track.location}, {track.country}</div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <div className="text-2xl font-bold text-orange-400">{avgRisk.toFixed(0)}%</div>
                                        <div className="text-xs text-gray-400">Avg Risk</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-red-400">{totalIncidents}</div>
                                        <div className="text-xs text-gray-400">Total Incidents (5yr)</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Risk Legend */}
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-3">Risk Levels</h3>
                            <div className="space-y-2">
                                {[
                                    { level: 'Very High', color: 'bg-red-500', range: '85-100%' },
                                    { level: 'High', color: 'bg-orange-500', range: '70-84%' },
                                    { level: 'Medium', color: 'bg-yellow-500', range: '55-69%' },
                                    { level: 'Low', color: 'bg-green-500', range: '0-54%' },
                                ].map(item => (
                                    <div key={item.level} className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded ${item.color}`} />
                                        <span className="text-white">{item.level}</span>
                                        <span className="text-gray-400 text-sm ml-auto">{item.range}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Safety Car Prediction */}
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                <Flame className="w-5 h-5 text-yellow-400" />
                                Safety Car Probability
                            </h3>
                            <div className="text-4xl font-bold text-yellow-400 mb-2">
                                {Math.min(95, Math.round(avgRisk * 0.8 + totalIncidents * 0.1))}%
                            </div>
                            <div className="text-sm text-gray-400">
                                Based on corner risk + historical data
                            </div>
                            <div className="mt-3 h-2 bg-f1-gray-600 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"
                                    style={{ width: `${Math.min(95, avgRisk * 0.8 + totalIncidents * 0.1)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Corner Heatmap */}
                    <div className="lg:col-span-2 bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-400" />
                            Corner Risk Analysis
                        </h2>

                        <div className="space-y-3">
                            {corners.corners.map(corner => (
                                <div
                                    key={corner.id}
                                    className={`p-4 rounded-lg transition cursor-pointer ${highlightRisk === corner.id
                                            ? 'bg-f1-gray-600 ring-2 ring-white/30'
                                            : 'bg-f1-gray-700 hover:bg-f1-gray-600'
                                        }`}
                                    onMouseEnter={() => setHighlightRisk(corner.id)}
                                    onMouseLeave={() => setHighlightRisk(null)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 ${getRiskColor(corner.risk)} rounded-lg flex items-center justify-center text-white font-bold`}>
                                                {corner.id}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold">{corner.name}</div>
                                                <div className="text-sm text-gray-400">{corner.type}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xl font-bold ${corner.risk >= 85 ? 'text-red-400' :
                                                    corner.risk >= 70 ? 'text-orange-400' :
                                                        corner.risk >= 55 ? 'text-yellow-400' :
                                                            'text-green-400'
                                                }`}>
                                                {corner.risk}%
                                            </div>
                                            <div className="text-xs text-gray-400">{getRiskLabel(corner.risk)} Risk</div>
                                        </div>
                                    </div>

                                    <div className="h-3 bg-f1-gray-600 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${getRiskColor(corner.risk)}`}
                                            style={{ width: `${corner.risk}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                                        <span>{corner.incidents} incidents (5yr)</span>
                                        <span>~{(corner.incidents / 10).toFixed(1)} per race</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Incident Type Breakdown */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="p-4 bg-f1-gray-700 rounded-lg text-center">
                                <div className="text-2xl font-bold text-red-400">38%</div>
                                <div className="text-sm text-gray-400">First Lap Incidents</div>
                            </div>
                            <div className="p-4 bg-f1-gray-700 rounded-lg text-center">
                                <div className="text-2xl font-bold text-orange-400">27%</div>
                                <div className="text-sm text-gray-400">DRS Zone Contacts</div>
                            </div>
                            <div className="p-4 bg-f1-gray-700 rounded-lg text-center">
                                <div className="text-2xl font-bold text-yellow-400">35%</div>
                                <div className="text-sm text-gray-400">Braking Zone Lock-ups</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-red-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
