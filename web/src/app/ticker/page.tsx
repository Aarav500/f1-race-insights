'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Timer, Flag, TrendingUp, Calendar, MapPin, AlertTriangle, Trophy, Zap } from 'lucide-react'

// 2026 Race Calendar - New Regulations Era
const RACES_2026 = [
    { round: 1, name: 'Bahrain Grand Prix', circuit: 'Bahrain International Circuit', location: 'Sakhir, Bahrain', date: new Date('2026-03-08T15:00:00Z') },
    { round: 2, name: 'Saudi Arabian Grand Prix', circuit: 'Jeddah Corniche Circuit', location: 'Jeddah, Saudi Arabia', date: new Date('2026-03-22T17:00:00Z') },
    { round: 3, name: 'Australian Grand Prix', circuit: 'Albert Park Circuit', location: 'Melbourne, Australia', date: new Date('2026-04-05T05:00:00Z') },
    { round: 4, name: 'Japanese Grand Prix', circuit: 'Suzuka International Racing Course', location: 'Suzuka, Japan', date: new Date('2026-04-19T05:00:00Z') },
    { round: 5, name: 'Chinese Grand Prix', circuit: 'Shanghai International Circuit', location: 'Shanghai, China', date: new Date('2026-04-26T07:00:00Z') },
    { round: 6, name: 'Miami Grand Prix', circuit: 'Miami International Autodrome', location: 'Miami, USA', date: new Date('2026-05-03T19:00:00Z') },
    { round: 7, name: 'Monaco Grand Prix', circuit: 'Circuit de Monaco', location: 'Monte Carlo, Monaco', date: new Date('2026-05-24T13:00:00Z') },
    { round: 8, name: 'Spanish Grand Prix', circuit: 'Circuit de Barcelona-Catalunya', location: 'Barcelona, Spain', date: new Date('2026-06-07T13:00:00Z') },
]

// 2026 Predictions accounting for new regulations uncertainty
// Note: 2026 brings major regulation changes - predictions are highly uncertain
const PREDICTIONS_2026 = [
    { driver: 'NOR', name: 'Lando Norris', team: 'McLaren', prob: 0.22, color: '#FF8700', note: '2025 WDC - Defending Champion' },
    { driver: 'VER', name: 'Max Verstappen', team: 'Red Bull', prob: 0.20, color: '#1E41FF', note: '4x WDC - Strong under new regs' },
    { driver: 'HAM', name: 'Lewis Hamilton', team: 'Ferrari', prob: 0.18, color: '#DC0000', note: 'New team, new regulations' },
    { driver: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', prob: 0.16, color: '#DC0000', note: 'Home team advantage' },
    { driver: 'RUS', name: 'George Russell', team: 'Mercedes', prob: 0.10, color: '#00D2BE', note: 'Lead driver after Hamilton exit' },
    { driver: 'PIA', name: 'Oscar Piastri', team: 'McLaren', prob: 0.08, color: '#FF8700', note: 'Strong #2 at champions team' },
]

// 2025 Season Final Results
const SEASON_2025_RESULTS = {
    wdc: { name: 'Lando Norris', team: 'McLaren', points: 412 },
    wcc: { name: 'McLaren', points: 756 },
    races: 24,
}

function calculateTimeRemaining(targetDate: Date) {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isPast: false
    }
}

// Find next race
function getNextRace() {
    const now = new Date()
    for (const race of RACES_2026) {
        if (race.date.getTime() > now.getTime()) {
            return race
        }
    }
    return RACES_2026[0] // Default to first race if all past
}

export default function RaceTickerPage() {
    const [nextRace, setNextRace] = useState(getNextRace())
    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(nextRace.date))
    const [animate, setAnimate] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            const race = getNextRace()
            setNextRace(race)
            setTimeRemaining(calculateTimeRemaining(race.date))
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
                    2026 Season Ticker
                </h1>
                <p className="text-f1-gray-600">
                    Countdown to the next race in the <strong>New Regulations Era</strong>
                </p>
            </div>

            {/* 2025 Champion Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 mb-8 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <Trophy className="w-12 h-12" />
                        <div>
                            <div className="text-sm opacity-75">2025 World Champion</div>
                            <div className="text-3xl font-bold">{SEASON_2025_RESULTS.wdc.name}</div>
                            <div className="text-sm">{SEASON_2025_RESULTS.wdc.team} • {SEASON_2025_RESULTS.wdc.points} points</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-75">Constructor Champion</div>
                        <div className="text-2xl font-bold">{SEASON_2025_RESULTS.wcc.name}</div>
                        <div className="text-sm">{SEASON_2025_RESULTS.wcc.points} points</div>
                    </div>
                </div>
            </div>

            {/* New Regulations Warning */}
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8">
                <div className="flex gap-3 items-start">
                    <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-yellow-800 text-lg">⚠️ 2026 New Regulations Era</h3>
                        <p className="text-yellow-700 mt-1">
                            <strong>Major changes ahead:</strong> 2026 brings revolutionary technical regulations including
                            new aerodynamics, increased electrical power, and active aero systems. Our ML models are trained
                            on 2024-2025 data and <strong>predictions carry significant uncertainty</strong> due to:
                        </p>
                        <ul className="text-yellow-700 mt-2 list-disc list-inside text-sm">
                            <li>Completely new car designs and power units</li>
                            <li>Driver lineup changes (Hamilton → Ferrari)</li>
                            <li>Unknown team performance under new rules</li>
                            <li>Historical data may not be predictive</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-gradient-to-r from-f1-gray-900 to-f1-gray-800 rounded-xl p-8 mb-8 text-white">
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Flag className="w-6 h-6 text-f1-red" />
                        <span className="text-xl font-bold">Round {nextRace.round} • 2026 Season</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-1">{nextRace.name}</h2>
                    <div className="flex items-center justify-center gap-4 text-f1-gray-300 text-sm">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {nextRace.location}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> {nextRace.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
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
                    2026 Season Win Probability (High Uncertainty)
                </h2>
                <p className="text-sm text-f1-gray-500 mb-4">
                    Based on 2025 performance extrapolated to new regulations. <strong>Use with caution.</strong>
                </p>

                <div className="space-y-4">
                    {PREDICTIONS_2026.map((pred, i) => (
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
                                            width: `${pred.prob * 100 * 2.5}%`,
                                            backgroundColor: pred.color
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-f1-gray-500 mt-1">
                                    <span>{pred.team}</span>
                                    <span className="italic">{pred.note}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Races */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    2026 Race Calendar (First 8 Rounds)
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {RACES_2026.map(race => {
                        const isPast = race.date.getTime() < new Date().getTime()
                        const isNext = race.round === nextRace.round
                        return (
                            <div
                                key={race.round}
                                className={`p-3 rounded-lg border ${isNext ? 'border-f1-red bg-red-50' :
                                        isPast ? 'border-gray-200 bg-gray-50 opacity-60' :
                                            'border-gray-200'
                                    }`}
                            >
                                <div className="text-xs text-f1-gray-500">Round {race.round}</div>
                                <div className="font-bold text-sm">{race.name.replace(' Grand Prix', ' GP')}</div>
                                <div className="text-xs text-f1-gray-500">{race.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                {isNext && <span className="text-xs text-f1-red font-bold">NEXT →</span>}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Data Sources Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex gap-2 items-start">
                    <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-blue-800">Data Sources</h3>
                        <p className="text-sm text-blue-700">
                            Historical data sourced from <strong>Ergast F1 API</strong> and <strong>OpenF1 API</strong>.
                            2025 season results are final. 2026 predictions are ML-extrapolated projections
                            with high uncertainty due to regulation changes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/2026" className="bg-f1-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
                    2026 Regulations Deep Dive
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
