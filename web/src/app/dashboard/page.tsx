'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Activity, Play, Pause, Timer, Flag, Zap, TrendingUp, AlertCircle } from 'lucide-react'

// Initial race positions
const INITIAL_DRIVERS = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF', position: 1, gap: 0, status: 'racing' },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700', position: 2, gap: 2.4, status: 'racing' },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000', position: 3, gap: 5.1, status: 'racing' },
    { id: 'PIA', name: 'Piastri', team: 'McLaren', color: '#FF8700', position: 4, gap: 8.7, status: 'racing' },
    { id: 'HAM', name: 'Hamilton', team: 'Mercedes', color: '#00D2BE', position: 5, gap: 12.3, status: 'racing' },
    { id: 'SAI', name: 'Sainz', team: 'Ferrari', color: '#DC0000', position: 6, gap: 15.8, status: 'racing' },
    { id: 'RUS', name: 'Russell', team: 'Mercedes', color: '#00D2BE', position: 7, gap: 19.2, status: 'racing' },
    { id: 'PER', name: 'Perez', team: 'Red Bull', color: '#1E41FF', position: 8, gap: 24.5, status: 'racing' },
    { id: 'ALO', name: 'Alonso', team: 'Aston Martin', color: '#006F62', position: 9, gap: 28.1, status: 'racing' },
    { id: 'STR', name: 'Stroll', team: 'Aston Martin', color: '#006F62', position: 10, gap: 32.7, status: 'racing' },
]

const RACE_EVENTS = [
    { lap: 2, type: 'overtake', message: 'NOR overtakes VER! McLaren leads!' },
    { lap: 5, type: 'pit', message: 'PER pits for mediums' },
    { lap: 8, type: 'fastest', message: '🟣 VER sets fastest lap: 1:32.456' },
    { lap: 12, type: 'drs', message: 'DRS enabled, multiple battles forming' },
    { lap: 15, type: 'overtake', message: 'HAM passes PIA for P4!' },
    { lap: 18, type: 'incident', message: '⚠️ Track limits warning: SAI' },
    { lap: 22, type: 'pit', message: 'Leaders pitting: VER, NOR, LEC' },
    { lap: 25, type: 'fastest', message: '🟣 LEC sets fastest lap: 1:31.892' },
]

export default function DashboardPage() {
    const [isLive, setIsLive] = useState(false)
    const [currentLap, setCurrentLap] = useState(1)
    const [totalLaps] = useState(57)
    const [drivers, setDrivers] = useState([...INITIAL_DRIVERS])
    const [events, setEvents] = useState<typeof RACE_EVENTS>([])
    const [fastestLap, setFastestLap] = useState('1:33.245')

    // Simulate race progression
    useEffect(() => {
        if (!isLive) return
        if (currentLap >= totalLaps) {
            setIsLive(false)
            return
        }

        const timer = setInterval(() => {
            setCurrentLap(prev => {
                const newLap = prev + 1

                // Check for events
                const lapEvents = RACE_EVENTS.filter(e => e.lap === newLap)
                if (lapEvents.length > 0) {
                    setEvents(prev => [...lapEvents, ...prev].slice(0, 5))
                }

                // Randomly adjust gaps
                setDrivers(prevDrivers =>
                    prevDrivers.map(d => ({
                        ...d,
                        gap: d.position === 1 ? 0 : Math.max(0.5, d.gap + (Math.random() - 0.5) * 1.5)
                    })).sort((a, b) => a.gap - b.gap).map((d, i) => ({ ...d, position: i + 1 }))
                )

                return newLap
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isLive, currentLap, totalLaps])

    const resetRace = () => {
        setCurrentLap(1)
        setDrivers([...INITIAL_DRIVERS])
        setEvents([])
        setIsLive(false)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Activity className="w-10 h-10 text-green-600" />
                    Real-Time Dashboard
                </h1>
                <p className="text-f1-gray-600">
                    Live race position tracking with gap analysis
                </p>
            </div>

            {/* Race Status Bar */}
            <div className="bg-gradient-to-r from-f1-gray-900 to-f1-gray-800 rounded-xl p-4 mb-8 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {isLive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            {isLive ? 'Pause' : 'Start Race'}
                        </button>
                        <button
                            onClick={resetRace}
                            className="bg-f1-gray-600 px-4 py-3 rounded-lg hover:bg-f1-gray-500 transition"
                        >
                            Reset
                        </button>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-mono font-bold">LAP {currentLap}/{totalLaps}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm opacity-75">Fastest Lap</div>
                            <div className="text-xl font-mono text-purple-400">{fastestLap}</div>
                        </div>
                        <div className={`px-4 py-2 rounded-full ${isLive ? 'bg-red-600 animate-pulse' : 'bg-f1-gray-600'}`}>
                            {isLive ? '● LIVE' : '○ Paused'}
                        </div>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4 h-2 bg-f1-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${(currentLap / totalLaps) * 100}%` }}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* Live Positions */}
                <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 bg-f1-gray-100 border-b font-bold flex items-center gap-2">
                        <Flag className="w-5 h-5 text-green-600" />
                        Live Positions
                    </div>
                    <div className="divide-y">
                        {drivers.map((driver, i) => (
                            <div
                                key={driver.id}
                                className={`p-3 flex items-center gap-4 transition-all ${driver.status === 'pit' ? 'bg-yellow-50' : ''
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${i === 0 ? 'bg-yellow-500' :
                                        i === 1 ? 'bg-gray-400' :
                                            i === 2 ? 'bg-orange-400' :
                                                'bg-f1-gray-300'
                                    }`}>
                                    {driver.position}
                                </div>
                                <div className="w-3 h-8 rounded" style={{ backgroundColor: driver.color }} />
                                <div className="flex-1">
                                    <div className="font-bold">{driver.name}</div>
                                    <div className="text-xs text-f1-gray-500">{driver.team}</div>
                                </div>
                                <div className="w-24 text-right font-mono">
                                    {driver.position === 1 ? (
                                        <span className="text-green-600 font-bold">LEADER</span>
                                    ) : (
                                        <span className="text-f1-gray-600">+{driver.gap.toFixed(1)}s</span>
                                    )}
                                </div>
                                <div className="w-16">
                                    <div className="h-2 bg-f1-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${Math.max(10, 100 - driver.gap * 2)}%`,
                                                backgroundColor: driver.color
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Race Events */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 bg-f1-gray-100 border-b font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Live Events
                    </div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                        {events.length === 0 ? (
                            <div className="p-8 text-center text-f1-gray-500">
                                Race events will appear here...
                            </div>
                        ) : (
                            events.map((event, i) => (
                                <div key={i} className="p-3">
                                    <div className="text-xs text-f1-gray-500">Lap {event.lap}</div>
                                    <div className={`font-medium ${event.type === 'overtake' ? 'text-green-600' :
                                            event.type === 'fastest' ? 'text-purple-600' :
                                                event.type === 'incident' ? 'text-orange-600' :
                                                    'text-f1-gray-700'
                                        }`}>
                                        {event.message}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex gap-2 items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-800">Simulation Mode</h4>
                        <p className="text-sm text-blue-700">
                            This dashboard simulates race progression with randomized gap changes.
                            In production, this would integrate with the F1 Live Timing API for real-time data.
                        </p>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/ticker" className="bg-f1-gray-900 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-700 transition">
                    Race Ticker
                </Link>
                <Link href="/strategy" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Pit Strategy
                </Link>
            </div>
        </div>
    )
}
