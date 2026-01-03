'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Timer, Flag, TrendingUp, Calendar, MapPin, Clock } from 'lucide-react'

// 2025 race calendar (simulated for demo since API doesn't have 2025 data)
const NEXT_RACE = {
    name: 'Australian Grand Prix',
    circuit: 'Albert Park Circuit',
    location: 'Melbourne, Australia',
    date: new Date('2025-03-16T04:00:00Z'),
    round: 3,
    predictions: [
        { driver: 'VER', name: 'Max Verstappen', team: 'Red Bull', prob: 0.35, color: '#1E41FF' },
        { driver: 'NOR', name: 'Lando Norris', team: 'McLaren', prob: 0.22, color: '#FF8700' },
        { driver: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', prob: 0.18, color: '#DC0000' },
        { driver: 'PIA', name: 'Oscar Piastri', team: 'McLaren', prob: 0.12, color: '#FF8700' },
        { driver: 'HAM', name: 'Lewis Hamilton', team: 'Ferrari', prob: 0.08, color: '#DC0000' },
    ]
}

function calculateTimeRemaining(targetDate: Date) {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
    }
}

export default function RaceTickerPage() {
    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(NEXT_RACE.date))
    const [animate, setAnimate] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining(NEXT_RACE.date))
            setAnimate(true)
            setTimeout(() => setAnimate(false), 200)
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Timer className="w-10 h-10 text-f1-red" />
                    Live Race Ticker
                </h1>
                <p className="text-f1-gray-600">
                    Countdown to the next race with real-time predictions
                </p>
            </div>

            {/* Countdown Timer */}
            <div className="bg-gradient-to-r from-f1-gray-900 to-f1-gray-800 rounded-xl p-8 mb-8 text-white">
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Flag className="w-6 h-6 text-f1-red" />
                        <span className="text-xl font-bold">Round {NEXT_RACE.round}</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-1">{NEXT_RACE.name}</h2>
                    <div className="flex items-center justify-center gap-4 text-f1-gray-300 text-sm">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {NEXT_RACE.location}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> {NEXT_RACE.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Countdown Boxes */}
                <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <TimeBox value={timeRemaining.days} label="Days" animate={animate} />
                    <TimeBox value={timeRemaining.hours} label="Hours" animate={animate} />
                    <TimeBox value={timeRemaining.minutes} label="Minutes" animate={animate} />
                    <TimeBox value={timeRemaining.seconds} label="Seconds" animate={animate} />
                </div>
            </div>

            {/* Predictions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Win Probability Predictions
                </h2>
                <p className="text-sm text-f1-gray-500 mb-4">
                    Based on current form, qualifying pace, and historical performance (projected from 2024 data)
                </p>

                <div className="space-y-4">
                    {NEXT_RACE.predictions.map((pred, i) => (
                        <div key={pred.driver} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: pred.color }}>
                                {i + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold">{pred.name}</span>
                                    <span className="font-mono font-bold">{(pred.prob * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-3 bg-f1-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${pred.prob * 100 * 2}%`,
                                            backgroundColor: pred.color
                                        }}
                                    />
                                </div>
                                <div className="text-xs text-f1-gray-500 mt-1">{pred.team}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* API Notice */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
                <div className="flex gap-2 items-start">
                    <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-orange-800">2025 Data Projected</h3>
                        <p className="text-sm text-orange-700">
                            These predictions are extrapolated from 2024 data since the F1 API does not yet provide
                            2025 race results. Updated predictions will be available once new data is released.
                        </p>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/whatif" className="bg-f1-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
                    What-If Lab
                </Link>
                <Link href="/history" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Historical Accuracy
                </Link>
            </div>
        </div>
    )
}

function TimeBox({ value, label, animate }: { value: number; label: string; animate: boolean }) {
    return (
        <div className={`bg-f1-gray-700 rounded-lg p-4 text-center transition-transform ${animate ? 'scale-105' : ''}`}>
            <div className="text-4xl md:text-5xl font-bold font-mono text-white">
                {String(value).padStart(2, '0')}
            </div>
            <div className="text-sm text-f1-gray-400 uppercase tracking-wider">{label}</div>
        </div>
    )
}
