'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Map, Gauge, TrendingUp, Zap } from 'lucide-react'

const DRIVERS = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF', s1: 95, s2: 97, s3: 94 },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700', s1: 96, s2: 93, s3: 97 },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000', s1: 94, s2: 96, s3: 95 },
    { id: 'HAM', name: 'Hamilton', team: 'Ferrari', color: '#DC0000', s1: 93, s2: 95, s3: 96 },
    { id: 'PIA', name: 'Piastri', team: 'McLaren', color: '#FF8700', s1: 92, s2: 94, s3: 93 },
    { id: 'RUS', name: 'Russell', team: 'Mercedes', color: '#00D2BE', s1: 91, s2: 92, s3: 91 },
    { id: 'SAI', name: 'Sainz', team: 'Williams', color: '#005AFF', s1: 90, s2: 91, s3: 92 },
    { id: 'ALO', name: 'Alonso', team: 'Aston Martin', color: '#006F62', s1: 89, s2: 93, s3: 88 },
]

const TRACKS = [
    { id: 'spa', name: 'Spa', s1Length: 6.2, s2Length: 4.1, s3Length: 3.5, s1Type: 'straights', s2Type: 'technical', s3Type: 'mixed' },
    { id: 'monza', name: 'Monza', s1Length: 2.1, s2Length: 3.2, s3Length: 2.5, s1Type: 'straights', s2Type: 'straights', s3Type: 'technical' },
    { id: 'monaco', name: 'Monaco', s1Length: 1.1, s2Length: 1.3, s3Length: 1.0, s1Type: 'technical', s2Type: 'technical', s3Type: 'technical' },
    { id: 'silverstone', name: 'Silverstone', s1Length: 2.0, s2Length: 2.8, s3Length: 1.9, s1Type: 'mixed', s2Type: 'high-speed', s3Type: 'mixed' },
    { id: 'suzuka', name: 'Suzuka', s1Length: 2.2, s2Length: 2.5, s3Length: 1.8, s1Type: 'technical', s2Type: 'high-speed', s3Type: 'mixed' },
]

export default function SectorAnalysisPage() {
    const [selectedTrack, setSelectedTrack] = useState(TRACKS[0])
    const [selectedDrivers, setSelectedDrivers] = useState(['VER', 'NOR', 'LEC'])

    const analysis = useMemo(() => {
        return selectedDrivers.map(driverId => {
            const driver = DRIVERS.find(d => d.id === driverId)!

            // Calculate sector times based on performance
            const s1Time = (30 - driver.s1 * 0.1 + Math.random() * 0.5).toFixed(3)
            const s2Time = (28 - driver.s2 * 0.1 + Math.random() * 0.5).toFixed(3)
            const s3Time = (25 - driver.s3 * 0.1 + Math.random() * 0.5).toFixed(3)

            return {
                ...driver,
                s1Time,
                s2Time,
                s3Time,
                totalTime: (parseFloat(s1Time) + parseFloat(s2Time) + parseFloat(s3Time)).toFixed(3),
                s1Rank: 0,
                s2Rank: 0,
                s3Rank: 0,
            }
        }).sort((a, b) => parseFloat(a.totalTime) - parseFloat(b.totalTime))
            .map((driver, idx, arr) => {
                // Calculate sector rankings
                const s1Sorted = [...arr].sort((a, b) => parseFloat(a.s1Time) - parseFloat(b.s1Time))
                const s2Sorted = [...arr].sort((a, b) => parseFloat(a.s2Time) - parseFloat(b.s2Time))
                const s3Sorted = [...arr].sort((a, b) => parseFloat(a.s3Time) - parseFloat(b.s3Time))

                return {
                    ...driver,
                    s1Rank: s1Sorted.findIndex(d => d.id === driver.id) + 1,
                    s2Rank: s2Sorted.findIndex(d => d.id === driver.id) + 1,
                    s3Rank: s3Sorted.findIndex(d => d.id === driver.id) + 1,
                }
            })
    }, [selectedDrivers])

    const toggleDriver = (id: string) => {
        if (selectedDrivers.includes(id)) {
            if (selectedDrivers.length > 1) {
                setSelectedDrivers(selectedDrivers.filter(d => d !== id))
            }
        } else {
            setSelectedDrivers([...selectedDrivers, id])
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Map className="w-8 h-8" />
                        Sector Time Analysis
                    </h1>
                    <p className="text-white/80 mt-1">Driver strengths by track section • Performance breakdown</p>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Controls */}
                <div className="bg-f1-gray-800 rounded-xl p-6 mb-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Circuit</label>
                            <select
                                value={selectedTrack.id}
                                onChange={e => setSelectedTrack(TRACKS.find(t => t.id === e.target.value)!)}
                                className="w-full bg-f1-gray-700 text-white rounded-lg p-3"
                            >
                                {TRACKS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Compare Drivers</label>
                            <div className="flex flex-wrap gap-2">
                                {DRIVERS.map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => toggleDriver(d.id)}
                                        className={`px-3 py-1 rounded-full text-sm font-bold transition ${selectedDrivers.includes(d.id)
                                                ? 'text-white'
                                                : 'bg-f1-gray-700 text-gray-400 hover:text-white'
                                            }`}
                                        style={{ backgroundColor: selectedDrivers.includes(d.id) ? d.color : undefined }}
                                    >
                                        {d.id}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Track Overview */}
                <div className="bg-f1-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Track Sector Profile: {selectedTrack.name}</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-purple-400 font-bold">Sector 1</span>
                                <span className="text-white font-mono">{selectedTrack.s1Length}km</span>
                            </div>
                            <div className="text-sm text-gray-400 capitalize">{selectedTrack.s1Type}</div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-yellow-400 font-bold">Sector 2</span>
                                <span className="text-white font-mono">{selectedTrack.s2Length}km</span>
                            </div>
                            <div className="text-sm text-gray-400 capitalize">{selectedTrack.s2Type}</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 rounded-lg p-4 border border-green-500/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-green-400 font-bold">Sector 3</span>
                                <span className="text-white font-mono">{selectedTrack.s3Length}km</span>
                            </div>
                            <div className="text-sm text-gray-400 capitalize">{selectedTrack.s3Type}</div>
                        </div>
                    </div>
                </div>

                {/* Sector Comparison */}
                <div className="bg-f1-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Driver Sector Performance</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-gray-400 text-sm border-b border-gray-700">
                                    <th className="text-left p-3">Driver</th>
                                    <th className="text-center p-3">S1 <span className="text-purple-400">●</span></th>
                                    <th className="text-center p-3">S2 <span className="text-yellow-400">●</span></th>
                                    <th className="text-center p-3">S3 <span className="text-green-400">●</span></th>
                                    <th className="text-right p-3">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysis.map((driver, idx) => (
                                    <tr key={driver.id} className="border-b border-gray-700/50">
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-8 rounded" style={{ backgroundColor: driver.color }} />
                                                <div>
                                                    <div className="text-white font-bold">{driver.name}</div>
                                                    <div className="text-xs text-gray-400">{driver.team}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center p-3">
                                            <span className={`font-mono ${driver.s1Rank === 1 ? 'text-purple-400 font-bold' : 'text-white'}`}>
                                                {driver.s1Time}
                                            </span>
                                            {driver.s1Rank === 1 && <span className="text-purple-400 ml-1">★</span>}
                                        </td>
                                        <td className="text-center p-3">
                                            <span className={`font-mono ${driver.s2Rank === 1 ? 'text-yellow-400 font-bold' : 'text-white'}`}>
                                                {driver.s2Time}
                                            </span>
                                            {driver.s2Rank === 1 && <span className="text-yellow-400 ml-1">★</span>}
                                        </td>
                                        <td className="text-center p-3">
                                            <span className={`font-mono ${driver.s3Rank === 1 ? 'text-green-400 font-bold' : 'text-white'}`}>
                                                {driver.s3Time}
                                            </span>
                                            {driver.s3Rank === 1 && <span className="text-green-400 ml-1">★</span>}
                                        </td>
                                        <td className="text-right p-3">
                                            <span className={`font-mono font-bold ${idx === 0 ? 'text-f1-red' : 'text-white'}`}>
                                                {driver.totalTime}
                                            </span>
                                            {idx === 0 && <span className="text-f1-red ml-1">P1</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Strength Heatmap */}
                <div className="bg-f1-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Driver Strength Profile
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {analysis.map(driver => (
                            <div key={driver.id} className="bg-f1-gray-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: driver.color }} />
                                    <span className="text-white font-bold">{driver.name}</span>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-purple-400">S1</span>
                                            <span className="text-white">{driver.s1}%</span>
                                        </div>
                                        <div className="h-2 bg-f1-gray-600 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500" style={{ width: `${driver.s1}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-yellow-400">S2</span>
                                            <span className="text-white">{driver.s2}%</span>
                                        </div>
                                        <div className="h-2 bg-f1-gray-600 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-500" style={{ width: `${driver.s2}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-green-400">S3</span>
                                            <span className="text-white">{driver.s3}%</span>
                                        </div>
                                        <div className="h-2 bg-f1-gray-600 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${driver.s3}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-violet-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
