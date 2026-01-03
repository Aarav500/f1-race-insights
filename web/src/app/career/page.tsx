'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Trophy, Flag, Target, TrendingUp, Award } from 'lucide-react'

// Driver career data
const DRIVERS = [
    {
        id: 'VER',
        name: 'Max Verstappen',
        team: 'Red Bull Racing',
        teamColor: '#1E41FF',
        nationality: 'Netherlands',
        age: 27,
        championships: 4,
        careerWins: 63,
        careerPoles: 40,
        careerPodiums: 112,
        seasons: [
            { year: 2015, team: 'Toro Rosso', wins: 0, poles: 0, podiums: 0, points: 49, position: 12 },
            { year: 2016, team: 'Red Bull', wins: 1, poles: 0, podiums: 7, points: 204, position: 5 },
            { year: 2017, team: 'Red Bull', wins: 2, poles: 0, podiums: 4, points: 168, position: 6 },
            { year: 2018, team: 'Red Bull', wins: 2, poles: 0, podiums: 11, points: 249, position: 4 },
            { year: 2019, team: 'Red Bull', wins: 3, poles: 2, podiums: 9, points: 278, position: 3 },
            { year: 2020, team: 'Red Bull', wins: 2, poles: 1, podiums: 11, points: 214, position: 3 },
            { year: 2021, team: 'Red Bull', wins: 10, poles: 10, podiums: 18, points: 395, position: 1 },
            { year: 2022, team: 'Red Bull', wins: 15, poles: 7, podiums: 17, points: 454, position: 1 },
            { year: 2023, team: 'Red Bull', wins: 19, poles: 12, podiums: 21, points: 575, position: 1 },
            { year: 2024, team: 'Red Bull', wins: 9, poles: 8, podiums: 14, points: 437, position: 1 },
        ]
    },
    {
        id: 'HAM',
        name: 'Lewis Hamilton',
        team: 'Ferrari',
        teamColor: '#DC0000',
        nationality: 'United Kingdom',
        age: 40,
        championships: 7,
        careerWins: 105,
        careerPoles: 104,
        careerPodiums: 202,
        seasons: [
            { year: 2015, team: 'Mercedes', wins: 10, poles: 11, podiums: 17, points: 381, position: 1 },
            { year: 2016, team: 'Mercedes', wins: 10, poles: 12, podiums: 17, points: 380, position: 2 },
            { year: 2017, team: 'Mercedes', wins: 9, poles: 11, podiums: 13, points: 363, position: 1 },
            { year: 2018, team: 'Mercedes', wins: 11, poles: 11, podiums: 17, points: 408, position: 1 },
            { year: 2019, team: 'Mercedes', wins: 11, poles: 5, podiums: 17, points: 413, position: 1 },
            { year: 2020, team: 'Mercedes', wins: 11, poles: 10, podiums: 14, points: 347, position: 1 },
            { year: 2021, team: 'Mercedes', wins: 8, poles: 5, podiums: 17, points: 387, position: 2 },
            { year: 2022, team: 'Mercedes', wins: 0, poles: 0, podiums: 9, points: 240, position: 6 },
            { year: 2023, team: 'Mercedes', wins: 0, poles: 0, podiums: 6, points: 234, position: 3 },
            { year: 2024, team: 'Mercedes', wins: 2, poles: 0, podiums: 5, points: 223, position: 7 },
        ]
    },
    {
        id: 'LEC',
        name: 'Charles Leclerc',
        team: 'Ferrari',
        teamColor: '#DC0000',
        nationality: 'Monaco',
        age: 27,
        championships: 0,
        careerWins: 9,
        careerPoles: 26,
        careerPodiums: 45,
        seasons: [
            { year: 2019, team: 'Ferrari', wins: 2, poles: 7, podiums: 10, points: 264, position: 4 },
            { year: 2020, team: 'Ferrari', wins: 0, poles: 0, podiums: 2, points: 98, position: 8 },
            { year: 2021, team: 'Ferrari', wins: 0, poles: 0, podiums: 1, points: 159, position: 7 },
            { year: 2022, team: 'Ferrari', wins: 3, poles: 9, podiums: 11, points: 308, position: 2 },
            { year: 2023, team: 'Ferrari', wins: 0, poles: 3, podiums: 7, points: 206, position: 5 },
            { year: 2024, team: 'Ferrari', wins: 4, poles: 7, podiums: 11, points: 356, position: 3 },
        ]
    },
]

export default function CareerTimelinePage() {
    const [selectedDriver, setSelectedDriver] = useState('VER')

    const driver = DRIVERS.find(d => d.id === selectedDriver)!
    const maxPoints = Math.max(...driver.seasons.map(s => s.points))
    const maxWins = Math.max(...driver.seasons.map(s => s.wins))

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <User className="w-10 h-10 text-blue-600" />
                    Driver Career Timeline
                </h1>
                <p className="text-f1-gray-600">
                    Interactive chart of career progression and statistics
                </p>
            </div>

            {/* Driver Selector */}
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
                {DRIVERS.map(d => (
                    <button
                        key={d.id}
                        onClick={() => setSelectedDriver(d.id)}
                        className={`px-6 py-3 rounded-lg font-medium transition ${selectedDriver === d.id
                                ? 'text-white'
                                : 'bg-white border border-f1-gray-300 hover:bg-f1-gray-50'
                            }`}
                        style={selectedDriver === d.id ? { backgroundColor: d.teamColor } : {}}
                    >
                        {d.name}
                    </button>
                ))}
            </div>

            {/* Driver Profile */}
            <div className="bg-gradient-to-r from-f1-gray-900 to-f1-gray-800 rounded-xl p-6 mb-8 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold">{driver.name}</h2>
                        <div className="flex items-center gap-2 text-f1-gray-300 mt-1">
                            <span>{driver.nationality}</span>
                            <span>•</span>
                            <span>{driver.age} years old</span>
                            <span>•</span>
                            <span style={{ color: driver.teamColor }}>{driver.team}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400">{driver.championships}</div>
                            <div className="text-xs text-f1-gray-400">Championships</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">{driver.careerWins}</div>
                            <div className="text-xs text-f1-gray-400">Wins</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400">{driver.careerPoles}</div>
                            <div className="text-xs text-f1-gray-400">Poles</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">{driver.careerPodiums}</div>
                            <div className="text-xs text-f1-gray-400">Podiums</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Chart - Points */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Season Points Progression
                </h3>
                <div className="flex items-end gap-2 h-48">
                    {driver.seasons.map((season, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                                className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer group relative"
                                style={{
                                    height: `${(season.points / maxPoints) * 100}%`,
                                    backgroundColor: season.position === 1 ? '#FFD700' : driver.teamColor,
                                    minHeight: '20px'
                                }}
                            >
                                {season.position === 1 && (
                                    <Trophy className="w-4 h-4 text-yellow-800 absolute -top-5 left-1/2 transform -translate-x-1/2" />
                                )}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                    {season.points} pts (P{season.position})
                                </div>
                            </div>
                            <div className="text-xs mt-1 text-f1-gray-600">{season.year}</div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded" />
                        <span>Champion</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: driver.teamColor }} />
                        <span>Non-champion</span>
                    </div>
                </div>
            </div>

            {/* Timeline Chart - Wins */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-green-600" />
                    Race Wins by Season
                </h3>
                <div className="flex items-end gap-2 h-40">
                    {driver.seasons.map((season, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                                className="w-full bg-green-500 rounded-t transition-all hover:opacity-80 cursor-pointer group relative"
                                style={{
                                    height: maxWins > 0 ? `${(season.wins / maxWins) * 100}%` : '0%',
                                    minHeight: season.wins > 0 ? '20px' : '4px',
                                    backgroundColor: season.wins > 0 ? '#22c55e' : '#d1d5db'
                                }}
                            >
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                    {season.wins} wins
                                </div>
                            </div>
                            <div className="text-xs mt-1 text-f1-gray-600">{season.year}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Season Details Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="p-4 bg-f1-gray-100 border-b font-bold">Season-by-Season Details</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-f1-gray-50 border-b">
                            <tr>
                                <th className="p-3 text-left">Year</th>
                                <th className="p-3 text-left">Team</th>
                                <th className="p-3 text-center">Position</th>
                                <th className="p-3 text-center">Points</th>
                                <th className="p-3 text-center">Wins</th>
                                <th className="p-3 text-center">Poles</th>
                                <th className="p-3 text-center">Podiums</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {driver.seasons.map((season, i) => (
                                <tr key={i} className={season.position === 1 ? 'bg-yellow-50' : ''}>
                                    <td className="p-3 font-bold">{season.year}</td>
                                    <td className="p-3">{season.team}</td>
                                    <td className="p-3 text-center">
                                        {season.position === 1 ? (
                                            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                                                🏆 P1
                                            </span>
                                        ) : (
                                            <span>P{season.position}</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center font-bold">{season.points}</td>
                                    <td className="p-3 text-center text-green-600 font-bold">{season.wins}</td>
                                    <td className="p-3 text-center text-purple-600">{season.poles}</td>
                                    <td className="p-3 text-center text-blue-600">{season.podiums}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/head-to-head" className="bg-f1-gray-900 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-700 transition">
                    Head-to-Head
                </Link>
                <Link href="/history" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Historical Accuracy
                </Link>
            </div>
        </div>
    )
}
