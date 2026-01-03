'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Timer, Fuel, Thermometer, TrendingUp, ArrowRight, Target, Zap, MapPin, Building2, CloudRain, Wind, AlertTriangle } from 'lucide-react'

// ============ TIRE COMPOUND DATA ============
const COMPOUNDS = [
    { id: 'soft', name: 'Soft', color: '#e10600', durability: 18, pace: 0, pitDegradation: 0.08, heatSensitivity: 1.4 },
    { id: 'medium', name: 'Medium', color: '#fcd34d', durability: 28, pace: 0.4, pitDegradation: 0.05, heatSensitivity: 1.0 },
    { id: 'hard', name: 'Hard', color: '#f5f5f5', durability: 42, pace: 0.9, pitDegradation: 0.03, heatSensitivity: 0.7 },
    { id: 'inter', name: 'Intermediate', color: '#22c55e', durability: 35, pace: 3.0, pitDegradation: 0.02, heatSensitivity: 0.5 },
    { id: 'wet', name: 'Full Wet', color: '#3b82f6', durability: 40, pace: 6.0, pitDegradation: 0.01, heatSensitivity: 0.3 },
]

// ============ ALL 24 RACE TRACKS WITH FULL DATA ============
const ALL_RACES: Record<string, {
    name: string; country: string; laps: number; pitLaneTime: number; degradation: number;
    optimalStrategy: string; characteristics: string[];
    temp: number; humidity: number; altitude: number; trackLength: number;
    scProb: number; rainProb: number;
}> = {
    'bahrain': { name: '🇧🇭 Bahrain GP', country: 'Bahrain', laps: 57, pitLaneTime: 21, degradation: 1.2, optimalStrategy: 'two-stop', characteristics: ['High rear degradation', 'Abrasive surface', 'Night race cooling'], temp: 28, humidity: 45, altitude: 7, trackLength: 5.412, scProb: 0.35, rainProb: 0.02 },
    'jeddah': { name: '🇸🇦 Saudi Arabian GP', country: 'Saudi Arabia', laps: 50, pitLaneTime: 23, degradation: 0.8, optimalStrategy: 'one-stop', characteristics: ['Street circuit', 'High speed walls', 'Safety car likely'], temp: 30, humidity: 55, altitude: 15, trackLength: 6.174, scProb: 0.55, rainProb: 0.05 },
    'melbourne': { name: '🇦🇺 Australian GP', country: 'Australia', laps: 58, pitLaneTime: 22, degradation: 1.0, optimalStrategy: 'two-stop', characteristics: ['Street circuit', 'High grip', 'Overtaking zones'], temp: 22, humidity: 50, altitude: 5, trackLength: 5.278, scProb: 0.45, rainProb: 0.25 },
    'suzuka': { name: '🇯🇵 Japanese GP', country: 'Japan', laps: 53, pitLaneTime: 24, degradation: 1.1, optimalStrategy: 'two-stop', characteristics: ['Technical esses', 'Figure-8 layout', 'Typhoon risk'], temp: 18, humidity: 70, altitude: 45, trackLength: 5.807, scProb: 0.40, rainProb: 0.35 },
    'shanghai': { name: '🇨🇳 Chinese GP', country: 'China', laps: 56, pitLaneTime: 23, degradation: 1.0, optimalStrategy: 'two-stop', characteristics: ['Long back straight', 'Heavy braking', 'Variable weather'], temp: 20, humidity: 65, altitude: 4, trackLength: 5.451, scProb: 0.30, rainProb: 0.20 },
    'miami': { name: '🇺🇸 Miami GP', country: 'USA', laps: 57, pitLaneTime: 22, degradation: 1.3, optimalStrategy: 'two-stop', characteristics: ['Hot conditions', 'Street circuit', 'High degradation'], temp: 32, humidity: 75, altitude: 2, trackLength: 5.412, scProb: 0.40, rainProb: 0.15 },
    'imola': { name: '🇮🇹 Emilia Romagna GP', country: 'Italy', laps: 63, pitLaneTime: 21, degradation: 0.9, optimalStrategy: 'one-stop', characteristics: ['Old school layout', 'Limited overtaking', 'Kerb riding'], temp: 24, humidity: 55, altitude: 37, trackLength: 4.909, scProb: 0.35, rainProb: 0.25 },
    'monaco': { name: '🇲🇨 Monaco GP', country: 'Monaco', laps: 78, pitLaneTime: 27, degradation: 0.5, optimalStrategy: 'one-stop', characteristics: ['No overtaking', 'Track position crucial', 'Long pit lane'], temp: 22, humidity: 60, altitude: 10, trackLength: 3.337, scProb: 0.60, rainProb: 0.15 },
    'barcelona': { name: '🇪🇸 Spanish GP', country: 'Spain', laps: 66, pitLaneTime: 21, degradation: 1.2, optimalStrategy: 'two-stop', characteristics: ['Front-limited', 'High-speed S3', 'Reference circuit'], temp: 28, humidity: 45, altitude: 50, trackLength: 4.657, scProb: 0.25, rainProb: 0.10 },
    'montreal': { name: '🇨🇦 Canadian GP', country: 'Canada', laps: 70, pitLaneTime: 22, degradation: 0.9, optimalStrategy: 'one-stop', characteristics: ['Wall of Champions', 'Chicane braking', 'Changeable weather'], temp: 20, humidity: 60, altitude: 15, trackLength: 4.361, scProb: 0.55, rainProb: 0.30 },
    'spielberg': { name: '🇦🇹 Austrian GP', country: 'Austria', laps: 71, pitLaneTime: 20, degradation: 0.8, optimalStrategy: 'one-stop', characteristics: ['Short lap', 'High altitude', 'Sprint format'], temp: 18, humidity: 55, altitude: 677, trackLength: 4.318, scProb: 0.35, rainProb: 0.25 },
    'silverstone': { name: '🇬🇧 British GP', country: 'UK', laps: 52, pitLaneTime: 22, degradation: 1.3, optimalStrategy: 'two-stop', characteristics: ['High-speed corners', 'Front tire wear', 'Weather variable'], temp: 16, humidity: 70, altitude: 150, trackLength: 5.891, scProb: 0.40, rainProb: 0.40 },
    'budapest': { name: '🇭🇺 Hungarian GP', country: 'Hungary', laps: 70, pitLaneTime: 21, degradation: 1.4, optimalStrategy: 'two-stop', characteristics: ['Monaco without walls', 'Hot conditions', 'Overtaking difficult'], temp: 32, humidity: 50, altitude: 110, trackLength: 4.381, scProb: 0.25, rainProb: 0.15 },
    'spa': { name: '🇧🇪 Belgian GP', country: 'Belgium', laps: 44, pitLaneTime: 21, degradation: 0.8, optimalStrategy: 'one-stop', characteristics: ['Longest circuit', 'Eau Rouge/Raidillon', 'Rain likely'], temp: 16, humidity: 75, altitude: 400, trackLength: 7.004, scProb: 0.45, rainProb: 0.50 },
    'zandvoort': { name: '🇳🇱 Dutch GP', country: 'Netherlands', laps: 72, pitLaneTime: 21, degradation: 1.1, optimalStrategy: 'one-stop', characteristics: ['Banked corners', 'Track position crucial', 'Narrow'], temp: 18, humidity: 75, altitude: 3, trackLength: 4.259, scProb: 0.30, rainProb: 0.30 },
    'monza': { name: '🇮🇹 Italian GP', country: 'Italy', laps: 53, pitLaneTime: 25, degradation: 0.9, optimalStrategy: 'one-stop', characteristics: ['Low downforce', 'Slipstreaming', 'Temple of Speed'], temp: 26, humidity: 55, altitude: 160, trackLength: 5.793, scProb: 0.30, rainProb: 0.15 },
    'baku': { name: '🇦🇿 Azerbaijan GP', country: 'Azerbaijan', laps: 51, pitLaneTime: 23, degradation: 0.7, optimalStrategy: 'one-stop', characteristics: ['Longest straight', 'Castle section', 'Crash risk high'], temp: 24, humidity: 60, altitude: -28, trackLength: 6.003, scProb: 0.50, rainProb: 0.10 },
    'singapore': { name: '🇸🇬 Singapore GP', country: 'Singapore', laps: 62, pitLaneTime: 28, degradation: 1.4, optimalStrategy: 'two-stop', characteristics: ['Night race', 'High humidity', 'Physical'], temp: 30, humidity: 85, altitude: 15, trackLength: 4.940, scProb: 0.65, rainProb: 0.30 },
    'cota': { name: '🇺🇸 US GP', country: 'USA', laps: 56, pitLaneTime: 23, degradation: 1.0, optimalStrategy: 'two-stop', characteristics: ['Multi-apex Turn 1', 'Elevation changes', 'COTA esses'], temp: 28, humidity: 55, altitude: 220, trackLength: 5.513, scProb: 0.35, rainProb: 0.15 },
    'mexico': { name: '🇲🇽 Mexico GP', country: 'Mexico', laps: 71, pitLaneTime: 22, degradation: 1.2, optimalStrategy: 'two-stop', characteristics: ['Highest altitude', 'Low downforce', 'Thin air'], temp: 22, humidity: 35, altitude: 2285, trackLength: 4.304, scProb: 0.40, rainProb: 0.20 },
    'interlagos': { name: '🇧🇷 São Paulo GP', country: 'Brazil', laps: 71, pitLaneTime: 21, degradation: 1.1, optimalStrategy: 'two-stop', characteristics: ['Counter-clockwise', 'Sprint format', 'Weather chaos'], temp: 26, humidity: 65, altitude: 800, trackLength: 4.309, scProb: 0.55, rainProb: 0.40 },
    'lasvegas': { name: '🇺🇸 Las Vegas GP', country: 'USA', laps: 50, pitLaneTime: 24, degradation: 0.7, optimalStrategy: 'one-stop', characteristics: ['Night race', 'Cold conditions', '2am start'], temp: 12, humidity: 25, altitude: 620, trackLength: 6.201, scProb: 0.35, rainProb: 0.05 },
    'qatar': { name: '🇶🇦 Qatar GP', country: 'Qatar', laps: 57, pitLaneTime: 20, degradation: 1.5, optimalStrategy: 'two-stop', characteristics: ['Tire killer', 'Night race', 'MotoGP circuit'], temp: 28, humidity: 45, altitude: 20, trackLength: 5.419, scProb: 0.20, rainProb: 0.02 },
    'abudhabi': { name: '🇦🇪 Abu Dhabi GP', country: 'UAE', laps: 58, pitLaneTime: 22, degradation: 1.0, optimalStrategy: 'one-stop', characteristics: ['Season finale', 'Day-to-night', 'Hotel section'], temp: 26, humidity: 50, altitude: 5, trackLength: 5.281, scProb: 0.30, rainProb: 0.01 },
}

// ============ ALL 10 TEAMS WITH DETAILED PROFILES ============
const ALL_TEAMS: Record<string, {
    name: string; color: string;
    tireMgmt: number; pitSpeed: number; strategyFlexibility: number;
    strengths: string[]; weaknesses: string[];
    drivers: string[];
    heatManagement: number; coldManagement: number;
}> = {
    'mclaren': { name: 'McLaren', color: '#FF8700', tireMgmt: 9.2, pitSpeed: 2.0, strategyFlexibility: 9.0, strengths: ['Excellent tire management', 'Fast pit stops', 'Adaptive strategy'], weaknesses: ['Sometimes conservative'], drivers: ['Norris', 'Piastri'], heatManagement: 9.0, coldManagement: 8.5 },
    'redbull': { name: 'Red Bull', color: '#1E41FF', tireMgmt: 8.8, pitSpeed: 1.9, strategyFlexibility: 8.5, strengths: ['Fastest pit crew', 'Aggressive undercuts', 'Data-driven'], weaknesses: ['Can overcommit'], drivers: ['Verstappen', 'Lawson'], heatManagement: 8.5, coldManagement: 9.0 },
    'ferrari': { name: 'Ferrari', color: '#DC0000', tireMgmt: 8.0, pitSpeed: 2.4, strategyFlexibility: 7.5, strengths: ['Strong pace', 'Home crowd energy'], weaknesses: ['Strategy errors', 'Pit mistakes', 'Radio confusion'], drivers: ['Hamilton', 'Leclerc'], heatManagement: 9.2, coldManagement: 7.5 },
    'mercedes': { name: 'Mercedes', color: '#00D2BE', tireMgmt: 8.5, pitSpeed: 2.2, strategyFlexibility: 8.8, strengths: ['Strategic depth', 'Tire temp management', 'Experience'], weaknesses: ['Cold tire issues'], drivers: ['Russell', 'Antonelli'], heatManagement: 8.0, coldManagement: 7.8 },
    'astonmartin': { name: 'Aston Martin', color: '#006F62', tireMgmt: 7.5, pitSpeed: 2.5, strategyFlexibility: 8.0, strengths: ['Alonso experience', 'Strategic flexibility'], weaknesses: ['Slower pit stops', 'Tire warm-up'], drivers: ['Alonso', 'Stroll'], heatManagement: 7.8, coldManagement: 8.0 },
    'williams': { name: 'Williams', color: '#005AFF', tireMgmt: 7.5, pitSpeed: 2.6, strategyFlexibility: 7.8, strengths: ['Improving trajectory', 'Low drag efficiency'], weaknesses: ['Limited resources'], drivers: ['Sainz', 'Albon'], heatManagement: 7.5, coldManagement: 7.5 },
    'alpine': { name: 'Alpine', color: '#0090FF', tireMgmt: 7.2, pitSpeed: 2.5, strategyFlexibility: 7.5, strengths: ['French engineering', 'Aggressive strategy'], weaknesses: ['Inconsistent execution'], drivers: ['Gasly', 'Doohan'], heatManagement: 7.2, coldManagement: 7.0 },
    'haas': { name: 'Haas', color: '#B6BABD', tireMgmt: 7.0, pitSpeed: 2.7, strategyFlexibility: 7.0, strengths: ['Ferrari partnership', 'Improving pit crew'], weaknesses: ['Resource limitations'], drivers: ['Ocon', 'Bearman'], heatManagement: 7.0, coldManagement: 7.0 },
    'sauber': { name: 'Sauber', color: '#52E252', tireMgmt: 6.8, pitSpeed: 2.6, strategyFlexibility: 7.2, strengths: ['Audi incoming', 'Development focus'], weaknesses: ['Midfield pace'], drivers: ['Hülkenberg', 'Bortoleto'], heatManagement: 6.8, coldManagement: 7.5 },
    'rb': { name: 'Racing Bulls', color: '#6692FF', tireMgmt: 7.3, pitSpeed: 2.4, strategyFlexibility: 7.5, strengths: ['Red Bull synergy', 'Young talent'], weaknesses: ['Identity crisis'], drivers: ['Tsunoda', 'Hadjar'], heatManagement: 7.5, coldManagement: 7.2 },
}

// ============ STRATEGY PRESETS ============
const STRATEGIES = [
    { id: 'one-stop', name: '1-Stop', description: 'Tire management focus', stints: [{ compound: 'medium', pct: 55 }, { compound: 'hard', pct: 45 }], riskLevel: 'Low', accuracy: 72, historicalWins: 156 },
    { id: 'two-stop', name: '2-Stop', description: 'Balanced approach', stints: [{ compound: 'soft', pct: 32 }, { compound: 'medium', pct: 36 }, { compound: 'soft', pct: 32 }], riskLevel: 'Medium', accuracy: 81, historicalWins: 203 },
    { id: 'three-stop', name: '3-Stop', description: 'Maximum attack', stints: [{ compound: 'soft', pct: 25 }, { compound: 'soft', pct: 25 }, { compound: 'medium', pct: 25 }, { compound: 'soft', pct: 25 }], riskLevel: 'High', accuracy: 58, historicalWins: 45 },
    { id: 'alternate', name: 'Alternate', description: 'Soft-Hard-Soft', stints: [{ compound: 'soft', pct: 30 }, { compound: 'hard', pct: 45 }, { compound: 'soft', pct: 25 }], riskLevel: 'Medium', accuracy: 67, historicalWins: 89 },
]

export default function StrategyPage() {
    const [selectedRace, setSelectedRace] = useState('bahrain')
    const [selectedTeam, setSelectedTeam] = useState('mclaren')
    const [temperature, setTemperature] = useState<number | null>(null) // null = use track default
    const [showAllRaces, setShowAllRaces] = useState(false)
    const [showAllTeams, setShowAllTeams] = useState(false)

    const race = ALL_RACES[selectedRace]
    const team = ALL_TEAMS[selectedTeam]
    const effectiveTemp = temperature ?? race.temp

    // Temperature effect on tire performance
    const tempEffect = useMemo(() => {
        const idealTemp = 25
        const delta = Math.abs(effectiveTemp - idealTemp)
        const isHot = effectiveTemp > idealTemp

        return {
            softPenalty: isHot ? delta * 0.15 : delta * 0.08,
            hardBonus: isHot ? delta * 0.05 : -delta * 0.12,
            teamBonus: isHot ? (team.heatManagement - 7) * 0.3 : (team.coldManagement - 7) * 0.3,
            recommendation: isHot
                ? 'Hot conditions favor harder compounds. Consider earlier pit stops.'
                : 'Cold conditions make tire warm-up critical. Soft tires may struggle in early laps.',
        }
    }, [effectiveTemp, team])

    // Calculate strategy times
    const calculateRaceTime = (strat: typeof STRATEGIES[0]) => {
        let totalTime = 0
        const laps = race.laps
        const pitStops = strat.stints.length - 1

        strat.stints.forEach((stint, idx) => {
            const compound = COMPOUNDS.find(c => c.id === stint.compound)!
            const stintLaps = Math.floor(laps * stint.pct / 100)

            for (let lap = 0; lap < stintLaps; lap++) {
                // Base lap time + compound pace delta
                let lapTime = 90 + compound.pace

                // Tire degradation
                const degradation = compound.pitDegradation * lap * race.degradation * (1 - team.tireMgmt / 20)
                lapTime += degradation

                // Temperature effect
                if (stint.compound === 'soft') lapTime += tempEffect.softPenalty * 0.05
                if (stint.compound === 'hard') lapTime -= tempEffect.hardBonus * 0.05

                // Team heat/cold management
                lapTime -= tempEffect.teamBonus * 0.02

                totalTime += lapTime
            }
        })

        // Pit stop time
        totalTime += pitStops * (race.pitLaneTime + (team.pitSpeed - 2.0))

        return totalTime
    }

    const strategyTimes = STRATEGIES.map(s => ({
        ...s,
        estimatedTime: calculateRaceTime(s),
    })).sort((a, b) => a.estimatedTime - b.estimatedTime)

    const fastestTime = strategyTimes[0].estimatedTime

    // All races strategy overview
    const allRacesOverview = useMemo(() => {
        return Object.entries(ALL_RACES).map(([id, r]) => ({
            id,
            ...r,
            optimalStrategyName: STRATEGIES.find(s => s.id === r.optimalStrategy)?.name || '1-Stop',
        }))
    }, [])

    // All teams comparison
    const allTeamsComparison = useMemo(() => {
        return Object.entries(ALL_TEAMS).map(([id, t]) => ({
            id,
            ...t,
            overallScore: (t.tireMgmt + (10 - t.pitSpeed) + t.strategyFlexibility + t.heatManagement + t.coldManagement) / 5,
        })).sort((a, b) => b.overallScore - a.overallScore)
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Timer className="w-10 h-10 text-orange-600" />
                    F1 Pit Strategy Simulator
                </h1>
                <p className="text-f1-gray-600">
                    All 24 races • All 10 teams • Temperature effects • Real-time strategy calculation
                </p>
            </div>

            {/* Selectors */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Race ({Object.keys(ALL_RACES).length} tracks)
                    </label>
                    <select value={selectedRace} onChange={(e) => { setSelectedRace(e.target.value); setTemperature(null) }} className="w-full border rounded-lg p-3 font-bold">
                        {Object.entries(ALL_RACES).map(([id, r]) => (
                            <option key={id} value={id}>{r.name} ({r.laps} laps)</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Team ({Object.keys(ALL_TEAMS).length} teams)
                    </label>
                    <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="w-full border rounded-lg p-3 font-bold" style={{ borderColor: team.color }}>
                        {Object.entries(ALL_TEAMS).map(([id, t]) => (
                            <option key={id} value={id}>{t.name} ({t.drivers.join(' / ')})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Thermometer className="w-4 h-4" /> Temperature ({effectiveTemp}°C)
                    </label>
                    <input
                        type="range" min="5" max="45" value={effectiveTemp}
                        onChange={(e) => setTemperature(parseInt(e.target.value))}
                        className="w-full h-10"
                    />
                    <div className="flex justify-between text-xs text-f1-gray-500">
                        <span>5°C Cold</span>
                        <span className="font-bold">{effectiveTemp}°C</span>
                        <span>45°C Hot</span>
                    </div>
                </div>
            </div>

            {/* Temperature Effects Warning */}
            <div className={`rounded-lg p-4 mb-6 ${effectiveTemp > 30 ? 'bg-red-50 border border-red-200' : effectiveTemp < 18 ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-start gap-3">
                    <Thermometer className={`w-5 h-5 flex-shrink-0 ${effectiveTemp > 30 ? 'text-red-600' : effectiveTemp < 18 ? 'text-blue-600' : 'text-green-600'}`} />
                    <div>
                        <h4 className="font-bold text-sm">Temperature Impact: {effectiveTemp}°C {effectiveTemp > 30 ? '🔥 Hot' : effectiveTemp < 18 ? '❄️ Cold' : '✅ Optimal'}</h4>
                        <p className="text-sm">{tempEffect.recommendation}</p>
                        <div className="text-xs mt-1 text-f1-gray-600">
                            {team.name} advantage: {tempEffect.teamBonus > 0 ? '+' : ''}{tempEffect.teamBonus.toFixed(2)}s/lap ({effectiveTemp > 25 ? `Heat mgmt: ${team.heatManagement}/10` : `Cold mgmt: ${team.coldManagement}/10`})
                        </div>
                    </div>
                </div>
            </div>

            {/* Race Info Card */}
            <div className="rounded-xl p-6 mb-6 text-white" style={{ backgroundColor: team.color }}>
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">{race.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {race.characteristics.map((c, i) => (
                                <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-sm">{c}</span>
                            ))}
                        </div>
                        <div className="mt-3 text-sm opacity-90">
                            Optimal: <strong>{race.optimalStrategy.toUpperCase().replace('-', ' ')}</strong> •
                            SC Risk: {Math.round(race.scProb * 100)}% •
                            Rain: {Math.round(race.rainProb * 100)}%
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="bg-black/20 rounded-lg px-3 py-2">
                            <div className="text-xl font-bold">{race.laps}</div>
                            <div className="text-xs opacity-75">Laps</div>
                        </div>
                        <div className="bg-black/20 rounded-lg px-3 py-2">
                            <div className="text-xl font-bold">{race.pitLaneTime}s</div>
                            <div className="text-xs opacity-75">Pit Lane</div>
                        </div>
                        <div className="bg-black/20 rounded-lg px-3 py-2">
                            <div className="text-xl font-bold">{race.degradation.toFixed(1)}x</div>
                            <div className="text-xs opacity-75">Deg Rate</div>
                        </div>
                        <div className="bg-black/20 rounded-lg px-3 py-2">
                            <div className="text-xl font-bold">{race.trackLength.toFixed(1)}km</div>
                            <div className="text-xs opacity-75">Length</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategy Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
                {strategyTimes.map((strat, rank) => (
                    <div key={strat.id} className={`p-4 rounded-lg ${rank === 0 ? 'bg-green-50 border-2 border-green-500' : 'bg-white border border-f1-gray-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs">{['🥇', '🥈', '🥉', '4th'][rank]} {strat.id === race.optimalStrategy && '⭐'}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${strat.riskLevel === 'Low' ? 'bg-green-100 text-green-800' : strat.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {strat.riskLevel}
                            </span>
                        </div>
                        <div className="text-lg font-bold">{strat.name}</div>
                        <div className="text-2xl font-mono font-bold mb-2">
                            {Math.floor(strat.estimatedTime / 60)}:{String(Math.floor(strat.estimatedTime % 60)).padStart(2, '0')}
                        </div>
                        <div className="text-xs text-f1-gray-500 mb-2">
                            {rank === 0 ? 'Fastest' : `+${(strat.estimatedTime - fastestTime).toFixed(1)}s`}
                        </div>
                        <div className="text-xs mb-2">
                            <span className="text-green-600 font-bold">{strat.accuracy}% accuracy</span>
                            <span className="text-f1-gray-400"> • {strat.historicalWins} wins</span>
                        </div>
                        <div className="flex gap-0.5">
                            {strat.stints.map((stint, i) => {
                                const compound = COMPOUNDS.find(c => c.id === stint.compound)!
                                return <div key={i} className="h-2 rounded" style={{ width: `${stint.pct}%`, backgroundColor: compound.color, border: stint.compound === 'hard' ? '1px solid #ccc' : 'none' }} />
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Team Profile */}
            <div className="bg-white rounded-lg shadow p-5 mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5" style={{ color: team.color }} />
                    {team.name} Profile • {team.drivers.join(' & ')}
                </h3>
                <div className="grid grid-cols-5 gap-2 mb-4">
                    <div className="text-center p-2 bg-f1-gray-50 rounded">
                        <div className="text-xl font-bold" style={{ color: team.color }}>{team.tireMgmt}/10</div>
                        <div className="text-xs text-f1-gray-500">Tire Mgmt</div>
                    </div>
                    <div className="text-center p-2 bg-f1-gray-50 rounded">
                        <div className="text-xl font-bold" style={{ color: team.color }}>{team.pitSpeed}s</div>
                        <div className="text-xs text-f1-gray-500">Pit Stop</div>
                    </div>
                    <div className="text-center p-2 bg-f1-gray-50 rounded">
                        <div className="text-xl font-bold" style={{ color: team.color }}>{team.strategyFlexibility}/10</div>
                        <div className="text-xs text-f1-gray-500">Flexibility</div>
                    </div>
                    <div className="text-center p-2 bg-f1-gray-50 rounded">
                        <div className="text-xl font-bold" style={{ color: team.color }}>{team.heatManagement}/10</div>
                        <div className="text-xs text-f1-gray-500">🔥 Heat</div>
                    </div>
                    <div className="text-center p-2 bg-f1-gray-50 rounded">
                        <div className="text-xl font-bold" style={{ color: team.color }}>{team.coldManagement}/10</div>
                        <div className="text-xs text-f1-gray-500">❄️ Cold</div>
                    </div>
                </div>
            </div>

            {/* All Races Overview */}
            <div className="bg-white rounded-lg shadow p-5 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-f1-red" />
                        All 24 Race Strategies
                    </h3>
                    <button onClick={() => setShowAllRaces(!showAllRaces)} className="text-sm text-blue-600 hover:underline">
                        {showAllRaces ? 'Hide' : 'Show All'}
                    </button>
                </div>
                <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 ${showAllRaces ? '' : 'max-h-32 overflow-hidden'}`}>
                    {allRacesOverview.map(r => (
                        <button key={r.id} onClick={() => setSelectedRace(r.id)} className={`text-left p-2 rounded border text-xs ${r.id === selectedRace ? 'border-f1-red bg-red-50' : 'border-f1-gray-200 hover:bg-f1-gray-50'}`}>
                            <div className="font-bold truncate">{r.name.slice(0, 15)}</div>
                            <div className="text-f1-gray-500">{r.optimalStrategyName} • {r.temp}°C</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* All Teams Comparison */}
            <div className="bg-white rounded-lg shadow p-5 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-f1-red" />
                        All 10 Teams Strategy Ranking
                    </h3>
                    <button onClick={() => setShowAllTeams(!showAllTeams)} className="text-sm text-blue-600 hover:underline">
                        {showAllTeams ? 'Hide Details' : 'Show Details'}
                    </button>
                </div>
                <div className="space-y-2">
                    {allTeamsComparison.slice(0, showAllTeams ? 10 : 5).map((t, i) => (
                        <button key={t.id} onClick={() => setSelectedTeam(t.id)} className={`w-full flex items-center gap-2 p-2 rounded ${t.id === selectedTeam ? 'bg-f1-gray-100' : 'hover:bg-f1-gray-50'}`}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: t.color }}>{i + 1}</div>
                            <div className="flex-1 text-left text-sm font-bold">{t.name}</div>
                            <div className="text-xs text-f1-gray-500">{t.drivers.join('/')}</div>
                            <div className="w-20 h-3 bg-f1-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${t.overallScore * 10}%`, backgroundColor: t.color }} />
                            </div>
                            <div className="text-sm font-bold" style={{ color: t.color }}>{t.overallScore.toFixed(1)}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tire Compounds */}
            <div className="bg-white rounded-lg shadow p-5 mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-f1-red" />
                    Tire Compounds @ {effectiveTemp}°C
                </h3>
                <div className="grid md:grid-cols-5 gap-3">
                    {COMPOUNDS.map(c => (
                        <div key={c.id} className="border rounded-lg p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: c.color, border: c.id === 'hard' ? '2px solid #ccc' : 'none' }} />
                            <div>
                                <div className="font-bold text-sm">{c.name}</div>
                                <div className="text-xs text-f1-gray-500">~{c.durability} laps</div>
                                <div className="text-xs text-f1-gray-500">+{c.pace.toFixed(1)}s/lap</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/simulator" className="bg-f1-red text-white px-5 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                    Season Simulator <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/tracks" className="border border-f1-gray-300 px-5 py-2 rounded-lg hover:bg-f1-gray-50 transition">
                    Track Profiles
                </Link>
            </div>
        </div>
    )
}
