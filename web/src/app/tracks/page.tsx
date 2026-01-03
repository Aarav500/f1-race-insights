'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Gauge, Wind, Timer, Flag, ArrowRight, Zap, TrendingUp, Activity } from 'lucide-react'

// F1 Circuit Data
const CIRCUITS = [
    {
        id: 'bahrain',
        name: 'Bahrain International Circuit',
        country: '🇧🇭 Bahrain',
        location: 'Sakhir',
        length: 5.412,
        laps: 57,
        lapRecord: { time: '1:31.447', driver: 'Pedro de la Rosa', year: 2005 },
        drsZones: 3,
        turns: 15,
        sectors: [
            { name: 'S1', length: 1.89, type: 'Technical', color: '#e10600' },
            { name: 'S2', length: 1.76, type: 'High Speed', color: '#00d2be' },
            { name: 'S3', length: 1.75, type: 'Mixed', color: '#1e41ff' },
        ],
        characteristics: ['Night race', 'Heavy braking', 'Overtaking opportunities', 'Sand degradation'],
        topSpeed: 320,
        avgSpeed: 203,
        favoredTeams: ['Red Bull', 'Ferrari'],
    },
    {
        id: 'monaco',
        name: 'Circuit de Monaco',
        country: '🇲🇨 Monaco',
        location: 'Monte Carlo',
        length: 3.337,
        laps: 78,
        lapRecord: { time: '1:12.909', driver: 'Lewis Hamilton', year: 2021 },
        drsZones: 1,
        turns: 19,
        sectors: [
            { name: 'S1', length: 1.15, type: 'Ultra Tight', color: '#e10600' },
            { name: 'S2', length: 1.18, type: 'Tunnel/Chicane', color: '#00d2be' },
            { name: 'S3', length: 1.00, type: 'Swimming Pool', color: '#1e41ff' },
        ],
        characteristics: ['Street circuit', 'Qualifying crucial', 'No overtaking', 'Barrier close'],
        topSpeed: 290,
        avgSpeed: 158,
        favoredTeams: ['Ferrari', 'Red Bull'],
    },
    {
        id: 'monza',
        name: 'Autodromo Nazionale Monza',
        country: '🇮🇹 Italy',
        location: 'Monza',
        length: 5.793,
        laps: 53,
        lapRecord: { time: '1:21.046', driver: 'Rubens Barrichello', year: 2004 },
        drsZones: 2,
        turns: 11,
        sectors: [
            { name: 'S1', length: 2.05, type: 'Flat Out', color: '#e10600' },
            { name: 'S2', length: 1.99, type: 'Lesmo Corners', color: '#00d2be' },
            { name: 'S3', length: 1.75, type: 'Parabolica', color: '#1e41ff' },
        ],
        characteristics: ['Temple of Speed', 'Low downforce', 'Slipstreaming', 'Historic venue'],
        topSpeed: 362,
        avgSpeed: 264,
        favoredTeams: ['Mercedes', 'McLaren'],
    },
    {
        id: 'silverstone',
        name: 'Silverstone Circuit',
        country: '🇬🇧 Great Britain',
        location: 'Silverstone',
        length: 5.891,
        laps: 52,
        lapRecord: { time: '1:27.097', driver: 'Max Verstappen', year: 2020 },
        drsZones: 2,
        turns: 18,
        sectors: [
            { name: 'S1', length: 2.12, type: 'Maggotts-Becketts', color: '#e10600' },
            { name: 'S2', length: 1.95, type: 'Hangar Straight', color: '#00d2be' },
            { name: 'S3', length: 1.82, type: 'Stowe-Club', color: '#1e41ff' },
        ],
        characteristics: ['High downforce', 'Fast corners', 'Unpredictable weather', 'Iconic venue'],
        topSpeed: 322,
        avgSpeed: 235,
        favoredTeams: ['Mercedes', 'Red Bull'],
    },
    {
        id: 'spa',
        name: 'Circuit de Spa-Francorchamps',
        country: '🇧🇪 Belgium',
        location: 'Spa',
        length: 7.004,
        laps: 44,
        lapRecord: { time: '1:46.286', driver: 'Valtteri Bottas', year: 2018 },
        drsZones: 2,
        turns: 20,
        sectors: [
            { name: 'S1', length: 2.35, type: 'La Source/Raidillon', color: '#e10600' },
            { name: 'S2', length: 2.52, type: 'Kemmel/Pouhon', color: '#00d2be' },
            { name: 'S3', length: 2.13, type: 'Stavelot/Bus Stop', color: '#1e41ff' },
        ],
        characteristics: ['Longest circuit', 'Eau Rouge iconic', 'Variable weather', 'Power track'],
        topSpeed: 338,
        avgSpeed: 234,
        favoredTeams: ['Red Bull', 'Mercedes'],
    },
    {
        id: 'suzuka',
        name: 'Suzuka International Racing Course',
        country: '🇯🇵 Japan',
        location: 'Suzuka',
        length: 5.807,
        laps: 53,
        lapRecord: { time: '1:30.983', driver: 'Lewis Hamilton', year: 2019 },
        drsZones: 2,
        turns: 18,
        sectors: [
            { name: 'S1', length: 1.98, type: 'Esses', color: '#e10600' },
            { name: 'S2', length: 2.05, type: 'Degner/Hairpin', color: '#00d2be' },
            { name: 'S3', length: 1.77, type: 'Spoon/130R', color: '#1e41ff' },
        ],
        characteristics: ['Figure-8 layout', 'Drivers favorite', 'Technical challenge', '130R flat out'],
        topSpeed: 319,
        avgSpeed: 224,
        favoredTeams: ['Red Bull', 'McLaren'],
    },
]

export default function TracksPage() {
    const [selectedTrack, setSelectedTrack] = useState('bahrain')

    const track = CIRCUITS.find(c => c.id === selectedTrack)!

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <MapPin className="w-10 h-10 text-f1-red" />
                    Track Profiles
                </h1>
                <p className="text-f1-gray-600">
                    Circuit layouts, sector analysis, and performance characteristics
                </p>
            </div>

            {/* Track Selector */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
                {CIRCUITS.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setSelectedTrack(c.id)}
                        className={`p-3 rounded-lg font-medium transition text-left ${selectedTrack === c.id
                                ? 'bg-f1-red text-white shadow-lg'
                                : 'bg-white border border-f1-gray-200 hover:shadow-md'
                            }`}
                    >
                        <div className="text-lg">{c.country.split(' ')[0]}</div>
                        <div className="text-xs opacity-75">{c.location}</div>
                    </button>
                ))}
            </div>

            {/* Track Header */}
            <div className="bg-gradient-to-r from-f1-gray-900 to-f1-gray-800 rounded-xl p-6 mb-8 text-white">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <div className="text-sm text-f1-gray-400 mb-1">{track.country}</div>
                        <h2 className="text-3xl font-bold mb-2">{track.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {track.characteristics.map((c, i) => (
                                <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-xs">
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-f1-gray-400">Lap Record</div>
                        <div className="text-2xl font-mono font-bold text-green-400">{track.lapRecord.time}</div>
                        <div className="text-sm text-f1-gray-400">{track.lapRecord.driver} ({track.lapRecord.year})</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <Gauge className="w-6 h-6 text-f1-red mx-auto mb-2" />
                    <div className="text-2xl font-bold">{track.length} km</div>
                    <div className="text-xs text-f1-gray-500">Track Length</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <Flag className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{track.laps}</div>
                    <div className="text-xs text-f1-gray-500">Laps</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{track.turns}</div>
                    <div className="text-xs text-f1-gray-500">Corners</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{track.drsZones}</div>
                    <div className="text-xs text-f1-gray-500">DRS Zones</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <Wind className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{track.topSpeed}</div>
                    <div className="text-xs text-f1-gray-500">Top Speed (km/h)</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{track.avgSpeed}</div>
                    <div className="text-xs text-f1-gray-500">Avg Speed (km/h)</div>
                </div>
            </div>

            {/* Sector Analysis */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-purple-600" />
                    Sector Breakdown
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {track.sectors.map((sector, i) => (
                        <div key={i} className="border-2 rounded-lg p-4" style={{ borderColor: sector.color }}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-2xl font-bold" style={{ color: sector.color }}>{sector.name}</span>
                                <span className="text-sm bg-f1-gray-100 px-2 py-1 rounded">{sector.type}</span>
                            </div>
                            <div className="text-3xl font-mono font-bold">{sector.length.toFixed(2)} km</div>
                            <div className="mt-3 h-2 bg-f1-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${(sector.length / track.length) * 100}%`,
                                        backgroundColor: sector.color
                                    }}
                                />
                            </div>
                            <div className="text-xs text-f1-gray-500 mt-1">
                                {((sector.length / track.length) * 100).toFixed(0)}% of lap
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Track Diagram Placeholder */}
            <div className="bg-gradient-to-br from-f1-gray-100 to-f1-gray-200 rounded-lg p-8 mb-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">🏎️</div>
                    <h3 className="text-xl font-bold mb-2">Track Layout</h3>
                    <p className="text-f1-gray-600 mb-4">
                        Interactive circuit map with sector highlights and DRS zones
                    </p>
                    <div className="flex justify-center gap-4">
                        {track.sectors.map((s, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: s.color }} />
                                <span className="text-sm">{s.name}: {s.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Favored Teams */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">Performance Prediction</h3>
                <p className="text-f1-gray-700 mb-4">
                    Based on historical data and car characteristics, these teams typically perform well at {track.name}:
                </p>
                <div className="flex gap-4">
                    {track.favoredTeams.map((team, i) => (
                        <div key={i} className="bg-white rounded-lg shadow px-6 py-3 font-bold">
                            {i === 0 ? '🥇' : '🥈'} {team}
                        </div>
                    ))}
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/whatif" className="bg-f1-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                    What-If Lab <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/history" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Historical Accuracy
                </Link>
            </div>
        </div>
    )
}
