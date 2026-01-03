'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Trophy, Flag, Target, TrendingUp, Award, Medal, Star, Gauge } from 'lucide-react'

// Complete driver career data for all current grid
const DRIVERS = [
    {
        id: 'VER',
        name: 'Max Verstappen',
        team: 'Red Bull Racing',
        teamColor: '#1E41FF',
        nationality: '🇳🇱 Netherlands',
        age: 27,
        number: 1,
        championships: 4,
        careerWins: 69,
        careerPoles: 44,
        careerPodiums: 118,
        careerPoints: 3367,
        fastestLaps: 36,
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
            { year: 2025, team: 'Red Bull', wins: 6, poles: 4, podiums: 12, points: 389, position: 2 },
        ]
    },
    {
        id: 'HAM',
        name: 'Lewis Hamilton',
        team: 'Ferrari (2026)',
        teamColor: '#DC0000',
        nationality: '🇬🇧 United Kingdom',
        age: 40,
        number: 44,
        championships: 7,
        careerWins: 105,
        careerPoles: 104,
        careerPodiums: 207,
        careerPoints: 5074,
        fastestLaps: 69,
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
            { year: 2025, team: 'Mercedes', wins: 0, poles: 1, podiums: 5, points: 245, position: 6 },
        ]
    },
    {
        id: 'LEC',
        name: 'Charles Leclerc',
        team: 'Ferrari',
        teamColor: '#DC0000',
        nationality: '🇲🇨 Monaco',
        age: 27,
        number: 16,
        championships: 0,
        careerWins: 9,
        careerPoles: 26,
        careerPodiums: 45,
        careerPoints: 1432,
        fastestLaps: 10,
        seasons: [
            { year: 2018, team: 'Sauber', wins: 0, poles: 0, podiums: 0, points: 39, position: 13 },
            { year: 2019, team: 'Ferrari', wins: 2, poles: 7, podiums: 10, points: 264, position: 4 },
            { year: 2020, team: 'Ferrari', wins: 0, poles: 0, podiums: 2, points: 98, position: 8 },
            { year: 2021, team: 'Ferrari', wins: 0, poles: 0, podiums: 1, points: 159, position: 7 },
            { year: 2022, team: 'Ferrari', wins: 3, poles: 9, podiums: 11, points: 308, position: 2 },
            { year: 2023, team: 'Ferrari', wins: 0, poles: 3, podiums: 7, points: 206, position: 5 },
            { year: 2024, team: 'Ferrari', wins: 4, poles: 7, podiums: 11, points: 356, position: 3 },
        ]
    },
    {
        id: 'NOR',
        name: 'Lando Norris',
        team: 'McLaren',
        teamColor: '#FF8700',
        nationality: '🇬🇧 United Kingdom',
        age: 25,
        number: 4,
        championships: 1,
        careerWins: 12,
        careerPoles: 14,
        careerPodiums: 43,
        careerPoints: 1379,
        fastestLaps: 16,
        seasons: [
            { year: 2019, team: 'McLaren', wins: 0, poles: 0, podiums: 0, points: 49, position: 11 },
            { year: 2020, team: 'McLaren', wins: 0, poles: 0, podiums: 1, points: 97, position: 9 },
            { year: 2021, team: 'McLaren', wins: 0, poles: 1, podiums: 4, points: 160, position: 6 },
            { year: 2022, team: 'McLaren', wins: 0, poles: 0, podiums: 0, points: 122, position: 7 },
            { year: 2023, team: 'McLaren', wins: 0, poles: 1, podiums: 6, points: 205, position: 6 },
            { year: 2024, team: 'McLaren', wins: 4, poles: 7, podiums: 13, points: 374, position: 2 },
            { year: 2025, team: 'McLaren', wins: 8, poles: 5, podiums: 12, points: 412, position: 1 },
        ]
    },
    {
        id: 'PIA',
        name: 'Oscar Piastri',
        team: 'McLaren',
        teamColor: '#FF8700',
        nationality: '🇦🇺 Australia',
        age: 23,
        number: 81,
        championships: 0,
        careerWins: 2,
        careerPoles: 2,
        careerPodiums: 11,
        careerPoints: 409,
        fastestLaps: 3,
        seasons: [
            { year: 2023, team: 'McLaren', wins: 0, poles: 0, podiums: 2, points: 97, position: 8 },
            { year: 2024, team: 'McLaren', wins: 2, poles: 2, podiums: 9, points: 292, position: 4 },
        ]
    },
    {
        id: 'SAI',
        name: 'Carlos Sainz',
        team: 'Williams',
        teamColor: '#005AFF',
        nationality: '🇪🇸 Spain',
        age: 30,
        number: 55,
        championships: 0,
        careerWins: 4,
        careerPoles: 6,
        careerPodiums: 26,
        careerPoints: 1230,
        fastestLaps: 5,
        seasons: [
            { year: 2015, team: 'Toro Rosso', wins: 0, poles: 0, podiums: 0, points: 18, position: 15 },
            { year: 2016, team: 'Toro Rosso', wins: 0, poles: 0, podiums: 0, points: 46, position: 12 },
            { year: 2017, team: 'Renault', wins: 0, poles: 0, podiums: 0, points: 54, position: 9 },
            { year: 2018, team: 'Renault', wins: 0, poles: 0, podiums: 0, points: 53, position: 10 },
            { year: 2019, team: 'McLaren', wins: 0, poles: 0, podiums: 1, points: 96, position: 6 },
            { year: 2020, team: 'McLaren', wins: 0, poles: 0, podiums: 2, points: 105, position: 6 },
            { year: 2021, team: 'Ferrari', wins: 0, poles: 0, podiums: 4, points: 164, position: 5 },
            { year: 2022, team: 'Ferrari', wins: 1, poles: 3, podiums: 9, points: 246, position: 5 },
            { year: 2023, team: 'Ferrari', wins: 1, poles: 0, podiums: 4, points: 200, position: 6 },
            { year: 2024, team: 'Ferrari', wins: 2, poles: 3, podiums: 6, points: 290, position: 5 },
        ]
    },
    {
        id: 'RUS',
        name: 'George Russell',
        team: 'Mercedes',
        teamColor: '#00D2BE',
        nationality: '🇬🇧 United Kingdom',
        age: 26,
        number: 63,
        championships: 0,
        careerWins: 3,
        careerPoles: 5,
        careerPodiums: 18,
        careerPoints: 605,
        fastestLaps: 8,
        seasons: [
            { year: 2019, team: 'Williams', wins: 0, poles: 0, podiums: 0, points: 0, position: 20 },
            { year: 2020, team: 'Williams', wins: 0, poles: 0, podiums: 0, points: 3, position: 18 },
            { year: 2021, team: 'Williams', wins: 0, poles: 0, podiums: 1, points: 16, position: 15 },
            { year: 2022, team: 'Mercedes', wins: 1, poles: 1, podiums: 8, points: 275, position: 4 },
            { year: 2023, team: 'Mercedes', wins: 0, poles: 1, podiums: 2, points: 175, position: 8 },
            { year: 2024, team: 'Mercedes', wins: 2, poles: 3, podiums: 7, points: 245, position: 6 },
        ]
    },
    {
        id: 'PER',
        name: 'Sergio Perez',
        team: 'Red Bull Racing',
        teamColor: '#1E41FF',
        nationality: '🇲🇽 Mexico',
        age: 34,
        number: 11,
        championships: 0,
        careerWins: 6,
        careerPoles: 3,
        careerPodiums: 39,
        careerPoints: 1488,
        fastestLaps: 11,
        seasons: [
            { year: 2015, team: 'Force India', wins: 0, poles: 0, podiums: 0, points: 78, position: 9 },
            { year: 2016, team: 'Force India', wins: 0, poles: 0, podiums: 2, points: 101, position: 7 },
            { year: 2017, team: 'Force India', wins: 0, poles: 0, podiums: 0, points: 100, position: 7 },
            { year: 2018, team: 'Force India', wins: 0, poles: 0, podiums: 0, points: 62, position: 8 },
            { year: 2019, team: 'Racing Point', wins: 0, poles: 0, podiums: 0, points: 52, position: 10 },
            { year: 2020, team: 'Racing Point', wins: 1, poles: 0, podiums: 3, points: 125, position: 4 },
            { year: 2021, team: 'Red Bull', wins: 1, poles: 0, podiums: 5, points: 190, position: 5 },
            { year: 2022, team: 'Red Bull', wins: 2, poles: 1, podiums: 11, points: 305, position: 3 },
            { year: 2023, team: 'Red Bull', wins: 2, poles: 2, podiums: 12, points: 285, position: 2 },
            { year: 2024, team: 'Red Bull', wins: 0, poles: 0, podiums: 4, points: 152, position: 8 },
        ]
    },
    {
        id: 'ALO',
        name: 'Fernando Alonso',
        team: 'Aston Martin',
        teamColor: '#006F62',
        nationality: '🇪🇸 Spain',
        age: 43,
        number: 14,
        championships: 2,
        careerWins: 32,
        careerPoles: 22,
        careerPodiums: 106,
        careerPoints: 2321,
        fastestLaps: 24,
        seasons: [
            { year: 2015, team: 'McLaren', wins: 0, poles: 0, podiums: 0, points: 11, position: 17 },
            { year: 2016, team: 'McLaren', wins: 0, poles: 0, podiums: 0, points: 54, position: 10 },
            { year: 2017, team: 'McLaren', wins: 0, poles: 0, podiums: 0, points: 17, position: 15 },
            { year: 2018, team: 'McLaren', wins: 0, poles: 0, podiums: 0, points: 50, position: 11 },
            { year: 2021, team: 'Alpine', wins: 0, poles: 0, podiums: 1, points: 81, position: 10 },
            { year: 2022, team: 'Alpine', wins: 0, poles: 0, podiums: 0, points: 81, position: 9 },
            { year: 2023, team: 'Aston Martin', wins: 0, poles: 0, podiums: 8, points: 206, position: 4 },
            { year: 2024, team: 'Aston Martin', wins: 0, poles: 0, podiums: 0, points: 70, position: 9 },
        ]
    },
    {
        id: 'STR',
        name: 'Lance Stroll',
        team: 'Aston Martin',
        teamColor: '#006F62',
        nationality: '🇨🇦 Canada',
        age: 26,
        number: 18,
        championships: 0,
        careerWins: 0,
        careerPoles: 1,
        careerPodiums: 3,
        careerPoints: 309,
        fastestLaps: 1,
        seasons: [
            { year: 2017, team: 'Williams', wins: 0, poles: 0, podiums: 1, points: 40, position: 12 },
            { year: 2018, team: 'Williams', wins: 0, poles: 0, podiums: 0, points: 6, position: 18 },
            { year: 2019, team: 'Racing Point', wins: 0, poles: 0, podiums: 0, points: 21, position: 15 },
            { year: 2020, team: 'Racing Point', wins: 0, poles: 1, podiums: 2, points: 75, position: 11 },
            { year: 2021, team: 'Aston Martin', wins: 0, poles: 0, podiums: 0, points: 34, position: 13 },
            { year: 2022, team: 'Aston Martin', wins: 0, poles: 0, podiums: 0, points: 18, position: 15 },
            { year: 2023, team: 'Aston Martin', wins: 0, poles: 0, podiums: 0, points: 74, position: 10 },
            { year: 2024, team: 'Aston Martin', wins: 0, poles: 0, podiums: 0, points: 24, position: 13 },
        ]
    },
]

export default function CareerTimelinePage() {
    const [selectedDriver, setSelectedDriver] = useState('VER')
    const [compareDriver, setCompareDriver] = useState<string | null>(null)

    const driver = DRIVERS.find(d => d.id === selectedDriver)!
    const compDriver = compareDriver ? DRIVERS.find(d => d.id === compareDriver) : null
    const maxPoints = Math.max(...driver.seasons.map(s => s.points), ...(compDriver?.seasons.map(s => s.points) || []))
    const maxWins = Math.max(...driver.seasons.map(s => s.wins), ...(compDriver?.seasons.map(s => s.wins) || []), 1)

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <User className="w-10 h-10 text-blue-600" />
                    Driver Career Timeline
                </h1>
                <p className="text-f1-gray-600">
                    Interactive career progression for all {DRIVERS.length} drivers
                </p>
            </div>

            {/* Driver Selector Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                {DRIVERS.map(d => (
                    <button
                        key={d.id}
                        onClick={() => setSelectedDriver(d.id)}
                        className={`p-3 rounded-lg font-medium transition text-left ${selectedDriver === d.id
                            ? 'text-white shadow-lg scale-105'
                            : 'bg-white border border-f1-gray-200 hover:shadow-md'
                            }`}
                        style={selectedDriver === d.id ? { backgroundColor: d.teamColor } : {}}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold opacity-50">#{d.number}</span>
                            <div>
                                <div className="font-bold text-sm">{d.name.split(' ')[1]}</div>
                                <div className="text-xs opacity-75">{d.team.split(' ')[0]}</div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Driver Profile Card */}
            <div className="bg-gradient-to-r from-f1-gray-900 to-f1-gray-800 rounded-xl p-6 mb-8 text-white">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl font-bold opacity-30">#{driver.number}</span>
                            <div>
                                <h2 className="text-3xl font-bold">{driver.name}</h2>
                                <div className="flex items-center gap-2 text-f1-gray-300 mt-1">
                                    <span>{driver.nationality}</span>
                                    <span>•</span>
                                    <span>{driver.age} years</span>
                                    <span>•</span>
                                    <span style={{ color: driver.teamColor }}>{driver.team}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                        <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                        <div className="text-3xl font-bold text-yellow-400">{driver.championships}</div>
                        <div className="text-xs text-f1-gray-400">Championships</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                        <Flag className="w-6 h-6 text-green-400 mx-auto mb-1" />
                        <div className="text-3xl font-bold text-green-400">{driver.careerWins}</div>
                        <div className="text-xs text-f1-gray-400">Race Wins</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                        <Target className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                        <div className="text-3xl font-bold text-purple-400">{driver.careerPoles}</div>
                        <div className="text-xs text-f1-gray-400">Pole Positions</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                        <Medal className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                        <div className="text-3xl font-bold text-blue-400">{driver.careerPodiums}</div>
                        <div className="text-xs text-f1-gray-400">Podiums</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                        <Star className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                        <div className="text-3xl font-bold text-orange-400">{driver.careerPoints.toLocaleString()}</div>
                        <div className="text-xs text-f1-gray-400">Career Points</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                        <Gauge className="w-6 h-6 text-red-400 mx-auto mb-1" />
                        <div className="text-3xl font-bold text-red-400">{driver.fastestLaps}</div>
                        <div className="text-xs text-f1-gray-400">Fastest Laps</div>
                    </div>
                </div>
            </div>

            {/* Compare Mode Toggle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="font-bold text-blue-800">Compare with another driver</h3>
                        <p className="text-sm text-blue-600">Select a second driver to overlay on the charts</p>
                    </div>
                    <select
                        value={compareDriver || ''}
                        onChange={(e) => setCompareDriver(e.target.value || null)}
                        className="border border-blue-300 rounded-lg px-4 py-2 bg-white"
                    >
                        <option value="">None</option>
                        {DRIVERS.filter(d => d.id !== selectedDriver).map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Timeline Chart - Points */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Season Points Progression
                </h3>
                <div className="flex items-end gap-2 h-56">
                    {driver.seasons.map((season, i) => {
                        const compSeason = compDriver?.seasons.find(s => s.year === season.year)
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center">
                                <div className="w-full flex gap-1 items-end justify-center" style={{ height: '100%' }}>
                                    {/* Primary driver bar */}
                                    <div
                                        className="flex-1 rounded-t transition-all hover:opacity-80 cursor-pointer group relative"
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
                                            {driver.name.split(' ')[1]}: {season.points} pts (P{season.position})
                                        </div>
                                    </div>
                                    {/* Compare driver bar */}
                                    {compDriver && compSeason && (
                                        <div
                                            className="flex-1 rounded-t transition-all hover:opacity-80 cursor-pointer group relative border-2 border-dashed border-white"
                                            style={{
                                                height: `${(compSeason.points / maxPoints) * 100}%`,
                                                backgroundColor: compSeason.position === 1 ? '#FFD700' : compDriver.teamColor,
                                                minHeight: '20px'
                                            }}
                                        >
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                                {compDriver.name.split(' ')[1]}: {compSeason.points} pts (P{compSeason.position})
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs mt-1 text-f1-gray-600">{season.year}</div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex items-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: driver.teamColor }} />
                        <span>{driver.name.split(' ')[1]}</span>
                    </div>
                    {compDriver && (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border-2 border-dashed" style={{ backgroundColor: compDriver.teamColor }} />
                            <span>{compDriver.name.split(' ')[1]}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-400 rounded" />
                        <span>Champion</span>
                    </div>
                </div>
            </div>

            {/* Timeline Chart - Wins */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-green-600" />
                    Race Wins by Season
                </h3>
                <div className="flex items-end gap-2 h-48">
                    {driver.seasons.map((season, i) => {
                        const compSeason = compDriver?.seasons.find(s => s.year === season.year)
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center">
                                <div className="w-full flex gap-1 items-end justify-center" style={{ height: '100%' }}>
                                    <div
                                        className="flex-1 rounded-t transition-all hover:opacity-80 cursor-pointer group relative"
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
                                    {compDriver && compSeason && (
                                        <div
                                            className="flex-1 rounded-t transition-all hover:opacity-80 cursor-pointer group relative border-2 border-dashed border-white"
                                            style={{
                                                height: maxWins > 0 ? `${(compSeason.wins / maxWins) * 100}%` : '0%',
                                                minHeight: compSeason.wins > 0 ? '20px' : '4px',
                                                backgroundColor: compSeason.wins > 0 ? '#3b82f6' : '#d1d5db'
                                            }}
                                        >
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                                {compSeason.wins} wins
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs mt-1 text-f1-gray-600">{season.year}</div>
                            </div>
                        )
                    })}
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
                                <th className="p-3 text-center">Pos</th>
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
                    Head-to-Head Battle
                </Link>
                <Link href="/history" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Historical Accuracy
                </Link>
            </div>
        </div>
    )
}
