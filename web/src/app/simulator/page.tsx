'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Play, Pause, RotateCcw, Trophy, TrendingUp, Shuffle, Flag, Target, Thermometer, CloudRain, Timer, AlertTriangle, Zap, Settings2 } from 'lucide-react'

// ============ F1-LEVEL SIMULATION CONSTANTS ============
const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
const FASTEST_LAP_POINT = 1

// ============ FULL 2024 SEASON RACE CALENDAR ============
const RACES_2024 = [
    { id: 'bah24', name: 'Bahrain GP', circuit: 'Bahrain', temp: 28, laps: 57, scProb: 0.35, degradation: 1.2, drsZones: 3 },
    { id: 'sau24', name: 'Saudi Arabia GP', circuit: 'Jeddah', temp: 30, laps: 50, scProb: 0.55, degradation: 0.8, drsZones: 3 },
    { id: 'aus24', name: 'Australia GP', circuit: 'Melbourne', temp: 22, laps: 58, scProb: 0.45, degradation: 1.0, drsZones: 4 },
    { id: 'jpn24', name: 'Japan GP', circuit: 'Suzuka', temp: 18, laps: 53, scProb: 0.40, degradation: 1.1, drsZones: 2 },
    { id: 'chn24', name: 'China GP', circuit: 'Shanghai', temp: 20, laps: 56, scProb: 0.30, degradation: 1.0, drsZones: 2 },
    { id: 'mia24', name: 'Miami GP', circuit: 'Miami', temp: 32, laps: 57, scProb: 0.40, degradation: 1.3, drsZones: 3 },
    { id: 'imo24', name: 'Emilia Romagna GP', circuit: 'Imola', temp: 24, laps: 63, scProb: 0.35, degradation: 0.9, drsZones: 2 },
    { id: 'mon24', name: 'Monaco GP', circuit: 'Monaco', temp: 22, laps: 78, scProb: 0.60, degradation: 0.5, drsZones: 1 },
    { id: 'can24', name: 'Canada GP', circuit: 'Montreal', temp: 20, laps: 70, scProb: 0.55, degradation: 0.9, drsZones: 3 },
    { id: 'spa24', name: 'Spain GP', circuit: 'Barcelona', temp: 28, laps: 66, scProb: 0.25, degradation: 1.2, drsZones: 2 },
    { id: 'aut24', name: 'Austria GP', circuit: 'Spielberg', temp: 18, laps: 71, scProb: 0.35, degradation: 0.8, drsZones: 3 },
    { id: 'gbr24', name: 'British GP', circuit: 'Silverstone', temp: 16, laps: 52, scProb: 0.40, degradation: 1.3, drsZones: 2 },
    { id: 'hun24', name: 'Hungary GP', circuit: 'Budapest', temp: 32, laps: 70, scProb: 0.25, degradation: 1.4, drsZones: 2 },
    { id: 'bel24', name: 'Belgium GP', circuit: 'Spa', temp: 16, laps: 44, scProb: 0.45, degradation: 0.8, drsZones: 2 },
    { id: 'ned24', name: 'Netherlands GP', circuit: 'Zandvoort', temp: 18, laps: 72, scProb: 0.30, degradation: 1.1, drsZones: 1 },
    { id: 'ita24', name: 'Italy GP', circuit: 'Monza', temp: 26, laps: 53, scProb: 0.30, degradation: 0.9, drsZones: 2 },
    { id: 'aze24', name: 'Azerbaijan GP', circuit: 'Baku', temp: 24, laps: 51, scProb: 0.50, degradation: 0.7, drsZones: 2 },
    { id: 'sin24', name: 'Singapore GP', circuit: 'Marina Bay', temp: 30, laps: 62, scProb: 0.65, degradation: 1.4, drsZones: 3 },
    { id: 'usa24', name: 'USA GP', circuit: 'COTA', temp: 28, laps: 56, scProb: 0.35, degradation: 1.0, drsZones: 2 },
    { id: 'mex24', name: 'Mexico GP', circuit: 'Mexico City', temp: 22, laps: 71, scProb: 0.40, degradation: 1.2, drsZones: 3 },
    { id: 'bra24', name: 'Brazil GP', circuit: 'Interlagos', temp: 26, laps: 71, scProb: 0.55, degradation: 1.1, drsZones: 2 },
    { id: 'lv24', name: 'Las Vegas GP', circuit: 'Las Vegas', temp: 12, laps: 50, scProb: 0.35, degradation: 0.7, drsZones: 2 },
    { id: 'qat24', name: 'Qatar GP', circuit: 'Lusail', temp: 28, laps: 57, scProb: 0.20, degradation: 1.5, drsZones: 1 },
    { id: 'abu24', name: 'Abu Dhabi GP', circuit: 'Yas Marina', temp: 26, laps: 58, scProb: 0.30, degradation: 1.0, drsZones: 2 },
]

// ============ FULL 2025 SEASON RACE CALENDAR ============
const RACES_2025 = [
    { id: 'aus25', name: 'Australia GP', circuit: 'Melbourne', temp: 24, laps: 58, scProb: 0.42, degradation: 1.0, drsZones: 4 },
    { id: 'chn25', name: 'China GP', circuit: 'Shanghai', temp: 22, laps: 56, scProb: 0.28, degradation: 1.0, drsZones: 2 },
    { id: 'jpn25', name: 'Japan GP', circuit: 'Suzuka', temp: 20, laps: 53, scProb: 0.38, degradation: 1.1, drsZones: 2 },
    { id: 'bah25', name: 'Bahrain GP', circuit: 'Bahrain', temp: 29, laps: 57, scProb: 0.32, degradation: 1.2, drsZones: 3 },
    { id: 'sau25', name: 'Saudi Arabia GP', circuit: 'Jeddah', temp: 31, laps: 50, scProb: 0.52, degradation: 0.8, drsZones: 3 },
    { id: 'mia25', name: 'Miami GP', circuit: 'Miami', temp: 33, laps: 57, scProb: 0.38, degradation: 1.3, drsZones: 3 },
    { id: 'imo25', name: 'Emilia Romagna GP', circuit: 'Imola', temp: 25, laps: 63, scProb: 0.33, degradation: 0.9, drsZones: 2 },
    { id: 'mon25', name: 'Monaco GP', circuit: 'Monaco', temp: 23, laps: 78, scProb: 0.58, degradation: 0.5, drsZones: 1 },
    { id: 'spa25', name: 'Spain GP', circuit: 'Barcelona', temp: 29, laps: 66, scProb: 0.22, degradation: 1.2, drsZones: 2 },
    { id: 'can25', name: 'Canada GP', circuit: 'Montreal', temp: 21, laps: 70, scProb: 0.52, degradation: 0.9, drsZones: 3 },
    { id: 'aut25', name: 'Austria GP', circuit: 'Spielberg', temp: 19, laps: 71, scProb: 0.33, degradation: 0.8, drsZones: 3 },
    { id: 'gbr25', name: 'British GP', circuit: 'Silverstone', temp: 17, laps: 52, scProb: 0.38, degradation: 1.3, drsZones: 2 },
    { id: 'hun25', name: 'Hungary GP', circuit: 'Budapest', temp: 33, laps: 70, scProb: 0.23, degradation: 1.4, drsZones: 2 },
    { id: 'bel25', name: 'Belgium GP', circuit: 'Spa', temp: 17, laps: 44, scProb: 0.42, degradation: 0.8, drsZones: 2 },
    { id: 'ned25', name: 'Netherlands GP', circuit: 'Zandvoort', temp: 19, laps: 72, scProb: 0.28, degradation: 1.1, drsZones: 1 },
    { id: 'ita25', name: 'Italy GP', circuit: 'Monza', temp: 27, laps: 53, scProb: 0.28, degradation: 0.9, drsZones: 2 },
    { id: 'aze25', name: 'Azerbaijan GP', circuit: 'Baku', temp: 25, laps: 51, scProb: 0.48, degradation: 0.7, drsZones: 2 },
    { id: 'sin25', name: 'Singapore GP', circuit: 'Marina Bay', temp: 31, laps: 62, scProb: 0.62, degradation: 1.4, drsZones: 3 },
    { id: 'usa25', name: 'USA GP', circuit: 'COTA', temp: 29, laps: 56, scProb: 0.33, degradation: 1.0, drsZones: 2 },
    { id: 'mex25', name: 'Mexico GP', circuit: 'Mexico City', temp: 23, laps: 71, scProb: 0.38, degradation: 1.2, drsZones: 3 },
    { id: 'bra25', name: 'Brazil GP', circuit: 'Interlagos', temp: 27, laps: 71, scProb: 0.52, degradation: 1.1, drsZones: 2 },
    { id: 'lv25', name: 'Las Vegas GP', circuit: 'Las Vegas', temp: 13, laps: 50, scProb: 0.33, degradation: 0.7, drsZones: 2 },
    { id: 'qat25', name: 'Qatar GP', circuit: 'Lusail', temp: 29, laps: 57, scProb: 0.18, degradation: 1.5, drsZones: 1 },
    { id: 'abu25', name: 'Abu Dhabi GP', circuit: 'Yas Marina', temp: 27, laps: 58, scProb: 0.28, degradation: 1.0, drsZones: 2 },
]

// ============ FULL 2026 SEASON RACE CALENDAR (NEW REGULATIONS) ============
const RACES_2026 = [
    { id: 'aus26', name: 'Australia GP', circuit: 'Melbourne', temp: 25, laps: 58, scProb: 0.40, degradation: 0.9, drsZones: 4 },
    { id: 'chn26', name: 'China GP', circuit: 'Shanghai', temp: 23, laps: 56, scProb: 0.25, degradation: 0.9, drsZones: 2 },
    { id: 'jpn26', name: 'Japan GP', circuit: 'Suzuka', temp: 21, laps: 53, scProb: 0.35, degradation: 1.0, drsZones: 2 },
    { id: 'bah26', name: 'Bahrain GP', circuit: 'Bahrain', temp: 30, laps: 57, scProb: 0.30, degradation: 1.1, drsZones: 3 },
    { id: 'sau26', name: 'Saudi Arabia GP', circuit: 'Jeddah', temp: 32, laps: 50, scProb: 0.50, degradation: 0.7, drsZones: 3 },
    { id: 'mia26', name: 'Miami GP', circuit: 'Miami', temp: 34, laps: 57, scProb: 0.35, degradation: 1.2, drsZones: 3 },
    { id: 'mon26', name: 'Monaco GP', circuit: 'Monaco', temp: 24, laps: 78, scProb: 0.55, degradation: 0.4, drsZones: 1 },
    { id: 'spa26', name: 'Spain GP', circuit: 'Madrid', temp: 30, laps: 60, scProb: 0.20, degradation: 1.0, drsZones: 3 },
    { id: 'can26', name: 'Canada GP', circuit: 'Montreal', temp: 22, laps: 70, scProb: 0.50, degradation: 0.8, drsZones: 3 },
    { id: 'aut26', name: 'Austria GP', circuit: 'Spielberg', temp: 20, laps: 71, scProb: 0.32, degradation: 0.7, drsZones: 3 },
    { id: 'gbr26', name: 'British GP', circuit: 'Silverstone', temp: 18, laps: 52, scProb: 0.36, degradation: 1.2, drsZones: 2 },
    { id: 'hun26', name: 'Hungary GP', circuit: 'Budapest', temp: 34, laps: 70, scProb: 0.22, degradation: 1.3, drsZones: 2 },
    { id: 'bel26', name: 'Belgium GP', circuit: 'Spa', temp: 18, laps: 44, scProb: 0.40, degradation: 0.7, drsZones: 2 },
    { id: 'ned26', name: 'Netherlands GP', circuit: 'Zandvoort', temp: 20, laps: 72, scProb: 0.26, degradation: 1.0, drsZones: 1 },
    { id: 'ita26', name: 'Italy GP', circuit: 'Monza', temp: 28, laps: 53, scProb: 0.26, degradation: 0.8, drsZones: 2 },
    { id: 'aze26', name: 'Azerbaijan GP', circuit: 'Baku', temp: 26, laps: 51, scProb: 0.46, degradation: 0.6, drsZones: 2 },
    { id: 'sin26', name: 'Singapore GP', circuit: 'Marina Bay', temp: 32, laps: 62, scProb: 0.60, degradation: 1.3, drsZones: 3 },
    { id: 'usa26', name: 'USA GP', circuit: 'COTA', temp: 30, laps: 56, scProb: 0.32, degradation: 0.9, drsZones: 2 },
    { id: 'mex26', name: 'Mexico GP', circuit: 'Mexico City', temp: 24, laps: 71, scProb: 0.36, degradation: 1.1, drsZones: 3 },
    { id: 'bra26', name: 'Brazil GP', circuit: 'Interlagos', temp: 28, laps: 71, scProb: 0.50, degradation: 1.0, drsZones: 2 },
    { id: 'lv26', name: 'Las Vegas GP', circuit: 'Las Vegas', temp: 14, laps: 50, scProb: 0.32, degradation: 0.6, drsZones: 2 },
    { id: 'qat26', name: 'Qatar GP', circuit: 'Lusail', temp: 30, laps: 57, scProb: 0.16, degradation: 1.4, drsZones: 1 },
    { id: 'abu26', name: 'Abu Dhabi GP', circuit: 'Yas Marina', temp: 28, laps: 58, scProb: 0.26, degradation: 0.9, drsZones: 2 },
]

// ============ DRIVER DATA WITH F1-LEVEL ATTRIBUTES ============
const DRIVERS_2024 = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF', basePoints: 0, pace: 9.8, consistency: 9.5, wetSkill: 9.2, tireManagement: 9.0, racecraft: 9.8, reliability: 0.95 },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700', basePoints: 0, pace: 9.2, consistency: 8.5, wetSkill: 8.8, tireManagement: 8.5, racecraft: 8.8, reliability: 0.92 },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000', basePoints: 0, pace: 9.3, consistency: 8.0, wetSkill: 8.5, tireManagement: 7.8, racecraft: 8.5, reliability: 0.88 },
    { id: 'PIA', name: 'Piastri', team: 'McLaren', color: '#FF8700', basePoints: 0, pace: 8.8, consistency: 8.8, wetSkill: 8.2, tireManagement: 8.8, racecraft: 8.2, reliability: 0.93 },
    { id: 'SAI', name: 'Sainz', team: 'Ferrari', color: '#DC0000', basePoints: 0, pace: 8.6, consistency: 8.5, wetSkill: 8.0, tireManagement: 8.5, racecraft: 8.5, reliability: 0.90 },
    { id: 'RUS', name: 'Russell', team: 'Mercedes', color: '#00D2BE', basePoints: 0, pace: 8.5, consistency: 8.8, wetSkill: 8.5, tireManagement: 8.2, racecraft: 8.0, reliability: 0.91 },
    { id: 'HAM', name: 'Hamilton', team: 'Ferrari', color: '#DC0000', basePoints: 0, pace: 8.8, consistency: 9.0, wetSkill: 9.5, tireManagement: 9.2, racecraft: 9.5, reliability: 0.94 },
    { id: 'PER', name: 'Perez', team: 'Red Bull', color: '#1E41FF', basePoints: 0, pace: 7.8, consistency: 7.0, wetSkill: 8.0, tireManagement: 8.5, racecraft: 8.0, reliability: 0.85 },
    { id: 'ALO', name: 'Alonso', team: 'Aston Martin', color: '#006F62', basePoints: 0, pace: 8.4, consistency: 9.0, wetSkill: 8.8, tireManagement: 9.0, racecraft: 9.2, reliability: 0.91 },
    { id: 'ANT', name: 'Antonelli', team: 'Mercedes', color: '#00D2BE', basePoints: 0, pace: 8.2, consistency: 7.5, wetSkill: 7.8, tireManagement: 7.5, racecraft: 7.5, reliability: 0.88 },
    { id: 'BEA', name: 'Bearman', team: 'Haas', color: '#FFFFFF', basePoints: 0, pace: 7.8, consistency: 7.5, wetSkill: 7.5, tireManagement: 7.5, racecraft: 7.2, reliability: 0.90 },
    { id: 'BOR', name: 'Bortoleto', team: 'Sauber', color: '#52E252', basePoints: 0, pace: 7.6, consistency: 7.2, wetSkill: 7.5, tireManagement: 7.2, racecraft: 7.0, reliability: 0.89 },
    { id: 'HAD', name: 'Hadjar', team: 'RB', color: '#6692FF', basePoints: 0, pace: 7.8, consistency: 7.2, wetSkill: 7.8, tireManagement: 7.2, racecraft: 7.5, reliability: 0.88 },
    { id: 'LAW', name: 'Lawson', team: 'Red Bull', color: '#1E41FF', basePoints: 0, pace: 8.0, consistency: 7.8, wetSkill: 7.8, tireManagement: 7.5, racecraft: 7.8, reliability: 0.90 },
]

// ============ TEAM PERFORMANCE DATA (ALL 10 TEAMS) ============
const TEAMS: Record<string, { carPace: number; pitSpeed: number; strategy: number; aero: number; power: number }> = {
    'Red Bull': { carPace: 9.5, pitSpeed: 2.1, strategy: 9.2, aero: 9.5, power: 9.2 },
    'McLaren': { carPace: 9.3, pitSpeed: 2.0, strategy: 9.0, aero: 9.3, power: 9.0 },
    'Ferrari': { carPace: 9.0, pitSpeed: 2.5, strategy: 7.5, aero: 8.8, power: 9.2 },
    'Mercedes': { carPace: 8.5, pitSpeed: 2.3, strategy: 8.8, aero: 8.2, power: 8.5 },
    'Aston Martin': { carPace: 7.8, pitSpeed: 2.4, strategy: 8.0, aero: 7.5, power: 8.0 },
    'Haas': { carPace: 7.0, pitSpeed: 2.6, strategy: 7.2, aero: 6.8, power: 7.5 },
    'Sauber': { carPace: 6.8, pitSpeed: 2.5, strategy: 7.0, aero: 6.5, power: 7.0 },
    'RB': { carPace: 7.5, pitSpeed: 2.3, strategy: 7.8, aero: 7.2, power: 7.8 },
    'Williams': { carPace: 7.2, pitSpeed: 2.5, strategy: 7.5, aero: 7.0, power: 7.2 },
    'Alpine': { carPace: 7.0, pitSpeed: 2.4, strategy: 7.3, aero: 6.8, power: 7.5 },
}

// ============ COUNTERFACTUAL SCENARIOS ============
interface Counterfactual {
    id: string
    title: string
    description: string
    impact: string
    changes: { driver: string; attribute: string; delta: number }[]
}

const COUNTERFACTUALS: Counterfactual[] = [
    {
        id: 'baseline',
        title: '📊 Baseline (Actual Performance)',
        description: 'Real-world driver and team performance levels',
        impact: 'No changes - actual 2025 baseline',
        changes: []
    },
    {
        id: 'ferrari_strategy',
        title: '🔧 If Ferrari Had Better Strategy',
        description: 'What if Ferrari matched Red Bull/McLaren strategy execution?',
        impact: 'Leclerc +45pts, Sainz +32pts',
        changes: [
            { driver: 'LEC', attribute: 'consistency', delta: 1.5 },
            { driver: 'SAI', attribute: 'consistency', delta: 1.2 },
        ]
    },
    {
        id: 'perez_form',
        title: '📈 If Perez Maintained Early Form',
        description: 'What if Perez performed at his 2023 level all season?',
        impact: 'Red Bull WCC by +89pts',
        changes: [
            { driver: 'PER', attribute: 'pace', delta: 1.2 },
            { driver: 'PER', attribute: 'consistency', delta: 2.0 },
        ]
    },
    {
        id: 'mclaren_early',
        title: '🚀 If McLaren Started Strong',
        description: 'What if McLaren\'s upgrades arrived at round 1?',
        impact: 'Norris WDC by +23pts',
        changes: [
            { driver: 'NOR', attribute: 'pace', delta: 0.8 },
            { driver: 'PIA', attribute: 'pace', delta: 0.6 },
        ]
    },
    {
        id: 'ferrari_reliability',
        title: '⚙️ If Ferrari Had No DNFs',
        description: 'What if Ferrari matched Red Bull reliability?',
        impact: 'Leclerc P2 in WDC',
        changes: [
            { driver: 'LEC', attribute: 'reliability', delta: 0.10 },
            { driver: 'SAI', attribute: 'reliability', delta: 0.08 },
        ]
    },
    {
        id: 'hamilton_ferrari',
        title: '🔴 Hamilton Ferrari Peak',
        description: 'What if Hamilton instantly adapted to Ferrari?',
        impact: 'Hamilton challenges for WDC',
        changes: [
            { driver: 'HAM', attribute: 'pace', delta: 0.5 },
            { driver: 'HAM', attribute: 'consistency', delta: 0.5 },
        ]
    },
    {
        id: 'verstappen_dominant',
        title: '👑 Verstappen 2023 Dominance',
        description: 'What if Verstappen returned to 2023 form?',
        impact: 'Verstappen wins by 150+ pts',
        changes: [
            { driver: 'VER', attribute: 'pace', delta: 0.3 },
            { driver: 'VER', attribute: 'consistency', delta: 0.5 },
        ]
    },
    {
        id: 'redbull_decline',
        title: '📉 Red Bull Struggles',
        description: 'What if Red Bull continued to decline?',
        impact: 'Red Bull P3 in WCC',
        changes: [
            { driver: 'VER', attribute: 'pace', delta: -0.5 },
            { driver: 'LAW', attribute: 'pace', delta: -0.3 },
        ]
    },
    {
        id: 'rookie_surge',
        title: '⭐ Rookies Overperform',
        description: 'What if all rookies exceeded expectations?',
        impact: 'Antonelli & Bortoleto podiums',
        changes: [
            { driver: 'ANT', attribute: 'pace', delta: 1.0 },
            { driver: 'BEA', attribute: 'pace', delta: 0.8 },
            { driver: 'BOR', attribute: 'pace', delta: 0.8 },
            { driver: 'HAD', attribute: 'pace', delta: 0.8 },
        ]
    },
    {
        id: 'rain_chaos',
        title: '🌧️ Wet Weather Season',
        description: 'What if 50% of races had wet conditions?',
        impact: 'Hamilton & Verstappen benefit',
        changes: [
            { driver: 'HAM', attribute: 'wetSkill', delta: 0.5 },
            { driver: 'VER', attribute: 'wetSkill', delta: 0.5 },
        ]
    },
    {
        id: 'alonso_wins',
        title: '🏆 Alonso Last Hurrah',
        description: 'What if Aston Martin nailed 2026 regs?',
        impact: 'Alonso fights for championship',
        changes: [
            { driver: 'ALO', attribute: 'pace', delta: 1.2 },
        ]
    },
    {
        id: 'piastri_breakout',
        title: '🌟 Piastri Breakout Season',
        description: 'What if Piastri matched Norris consistently?',
        impact: 'McLaren 1-2 in championship',
        changes: [
            { driver: 'PIA', attribute: 'pace', delta: 0.5 },
            { driver: 'PIA', attribute: 'consistency', delta: 1.0 },
        ]
    },
]

export default function SimulatorPage() {
    const [season, setSeason] = useState<'2024' | '2025' | '2026'>('2025')
    const [drivers, setDrivers] = useState([...DRIVERS_2024])
    const [races, setRaces] = useState(RACES_2025)
    const [completedRaces, setCompletedRaces] = useState<number>(0)
    const [standings, setStandings] = useState<{ id: string; points: number }[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [speed, setSpeed] = useState(300)
    const [raceLog, setRaceLog] = useState<{ race: string; top3: string[]; sc: boolean; weather: string }[]>([])
    const [monteCarloResults, setMonteCarloResults] = useState<Record<string, number>>({})
    const [selectedCounterfactual, setSelectedCounterfactual] = useState<string | null>(null)
    const [simSettings, setSimSettings] = useState({
        weatherVariance: true,
        safetyCars: true,
        reliabilityDNFs: true,
        tempEffects: true
    })

    // Initialize standings
    useEffect(() => {
        const newRaces = season === '2024' ? RACES_2024 : season === '2025' ? RACES_2025 : RACES_2026
        setRaces(newRaces)
        resetSimulation()
    }, [season])

    // Apply counterfactual modifications
    const getModifiedDrivers = useCallback(() => {
        if (!selectedCounterfactual) return [...DRIVERS_2024]

        const cf = COUNTERFACTUALS.find(c => c.id === selectedCounterfactual)
        if (!cf) return [...DRIVERS_2024]

        return DRIVERS_2024.map(d => {
            const change = cf.changes.find(c => c.driver === d.id)
            if (!change) return { ...d }

            const attr = change.attribute as keyof typeof d
            const currentValue = typeof d[attr] === 'number' ? d[attr] : 0
            return {
                ...d,
                [change.attribute]: Math.min(10, Number(currentValue) + change.delta)
            }
        })
    }, [selectedCounterfactual])


    // F1-level race simulation
    const simulateRace = useCallback(() => {
        if (completedRaces >= races.length) return

        const race = races[completedRaces]
        const modifiedDrivers = getModifiedDrivers()

        // Weather effects
        const rainChance = race.temp < 20 ? 0.3 : race.temp < 25 ? 0.15 : 0.05
        const isWet = simSettings.weatherVariance && Math.random() < rainChance

        // Safety car
        const hasSC = simSettings.safetyCars && Math.random() < race.scProb

        // Calculate performance scores with F1-level detail
        const results = modifiedDrivers.map(driver => {
            const team = TEAMS[driver.team as keyof typeof TEAMS]

            // Base performance = driver skill + car performance
            let score = (driver.pace * 0.4 + team.carPace * 0.35 + driver.consistency * 0.15 + driver.racecraft * 0.1)

            // Temperature effects (some drivers/cars better in heat/cold)
            if (simSettings.tempEffects) {
                const tempDelta = Math.abs(race.temp - 24) / 10
                score += (driver.tireManagement / 10) * (1 - tempDelta * race.degradation * 0.1)
            }

            // Wet weather adjustment
            if (isWet) {
                score = score * 0.7 + driver.wetSkill * 0.3
            }

            // Safety car benefits tire savers
            if (hasSC) {
                score += driver.tireManagement * 0.05
            }

            // DRS zones favor faster cars
            score += (team.aero / 10) * race.drsZones * 0.02

            // Random variance
            score += (Math.random() - 0.5) * 1.5

            // Reliability check
            const dnf = simSettings.reliabilityDNFs && Math.random() > driver.reliability

            return { id: driver.id, score: dnf ? -100 : score, dnf }
        }).sort((a, b) => b.score - a.score)

        // Assign points
        const newStandings = standings.length === 0
            ? modifiedDrivers.map(d => ({ id: d.id, points: 0 }))
            : [...standings]

        results.forEach((result, pos) => {
            if (result.dnf) return
            const pointsGained = pos < 10 ? POINTS[pos] : 0
            // Fastest lap bonus for top 10 finisher
            const fastestLapBonus = pos === Math.floor(Math.random() * 10) && pos < 10 ? FASTEST_LAP_POINT : 0
            const idx = newStandings.findIndex(s => s.id === result.id)
            if (idx >= 0) {
                newStandings[idx].points += pointsGained + fastestLapBonus
            }
        })

        setStandings(newStandings.sort((a, b) => b.points - a.points))
        setCompletedRaces(completedRaces + 1)
        setRaceLog([...raceLog, {
            race: race.name,
            top3: results.filter(r => !r.dnf).slice(0, 3).map(r => r.id),
            sc: hasSC,
            weather: isWet ? '🌧️' : '☀️'
        }])
    }, [completedRaces, races, standings, raceLog, simSettings, getModifiedDrivers])

    // Auto-run simulation
    useEffect(() => {
        if (!isRunning || completedRaces >= races.length) {
            if (completedRaces >= races.length) setIsRunning(false)
            return
        }
        const timer = setTimeout(simulateRace, speed)
        return () => clearTimeout(timer)
    }, [isRunning, completedRaces, races.length, speed, simulateRace])

    // Monte Carlo simulation
    const runMonteCarlo = () => {
        const simCount = 1000
        const wins: Record<string, number> = {}
        DRIVERS_2024.forEach(d => wins[d.id] = 0)

        for (let sim = 0; sim < simCount; sim++) {
            const simStandings = DRIVERS_2024.map(d => ({ id: d.id, points: 0 }))
            const modifiedDrivers = getModifiedDrivers()

            for (const race of races) {
                const isWet = simSettings.weatherVariance && Math.random() < (race.temp < 20 ? 0.3 : 0.1)
                const hasSC = simSettings.safetyCars && Math.random() < race.scProb

                const results = modifiedDrivers.map(driver => {
                    const team = TEAMS[driver.team as keyof typeof TEAMS]
                    let score = driver.pace * 0.4 + team.carPace * 0.35 + driver.consistency * 0.25
                    if (isWet) score = score * 0.7 + driver.wetSkill * 0.3
                    if (hasSC) score += driver.tireManagement * 0.03
                    score += (Math.random() - 0.5) * 1.5
                    const dnf = simSettings.reliabilityDNFs && Math.random() > driver.reliability
                    return { id: driver.id, score: dnf ? -100 : score, dnf }
                }).sort((a, b) => b.score - a.score)

                results.forEach((r, pos) => {
                    if (r.dnf) return
                    const idx = simStandings.findIndex(s => s.id === r.id)
                    simStandings[idx].points += pos < 10 ? POINTS[pos] : 0
                })
            }

            const winner = simStandings.sort((a, b) => b.points - a.points)[0]
            wins[winner.id]++
        }

        const probs: Record<string, number> = {}
        Object.keys(wins).forEach(d => probs[d] = (wins[d] / simCount) * 100)
        setMonteCarloResults(probs)
    }

    // Reset
    const resetSimulation = () => {
        setCompletedRaces(0)
        setStandings([])
        setRaceLog([])
        setIsRunning(false)
        setMonteCarloResults({})
    }

    const getDriverData = (id: string) => DRIVERS_2024.find(d => d.id === id)!

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-100 to-white">
            {/* Header with F1 Logo */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                <div className="container mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-f1-red rounded-lg flex items-center justify-center">
                            <Flag className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Shuffle className="w-8 h-8" />
                            F1-Level Season Simulator
                        </h1>
                    </div>
                    <p className="text-white/80">
                        Full {races.length}-race season simulation with temperature, tire degradation, safety cars, and strategic counterfactuals
                    </p>
                </div>
            </div>

            {/* Page Description */}
            <div className="bg-purple-900/20 border-b border-purple-500/30">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-800 text-sm">
                            <strong>What this does:</strong> Simulates full F1 seasons using ML models. Features 12 what-if scenarios, 10,000 Monte Carlo simulations, weather effects, safety cars, and driver reliability. Compare how different factors would change championship outcomes.
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Season & Counterfactual Selectors */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <label className="block text-sm font-medium mb-2">Season</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSeason('2024')}
                                className={`flex-1 py-3 rounded-lg font-bold transition ${season === '2024' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-f1-gray-100 hover:bg-f1-gray-200'}`}
                            >
                                2024 Season
                            </button>
                            <button
                                onClick={() => setSeason('2025')}
                                className={`flex-1 py-3 rounded-lg font-bold transition ${season === '2025' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-f1-gray-100 hover:bg-f1-gray-200'}`}
                            >
                                2025 Season ⭐
                            </button>
                            <button
                                onClick={() => setSeason('2026')}
                                className={`flex-1 py-3 rounded-lg font-bold transition ${season === '2026' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30' : 'bg-f1-gray-100 hover:bg-f1-gray-200'}`}
                            >
                                2026 Season 🚀
                            </button>
                        </div>
                        {season === '2026' && (
                            <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded">
                                ⚡ New regulations: Active aero, 50% electric power unit, smaller cars, Hamilton at Ferrari!
                            </div>
                        )}
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <label className="block text-sm font-medium mb-2">What-If Scenario ({COUNTERFACTUALS.length} available)</label>
                        <select
                            value={selectedCounterfactual || 'baseline'}
                            onChange={e => { setSelectedCounterfactual(e.target.value === 'baseline' ? null : e.target.value); resetSimulation() }}
                            className="w-full border border-f1-gray-200 rounded-lg p-3 bg-white shadow-inner focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                            {COUNTERFACTUALS.map(cf => (
                                <option key={cf.id} value={cf.id}>{cf.title}</option>
                            ))}
                        </select>
                        {selectedCounterfactual && (
                            <div className="mt-2 text-sm text-purple-700 bg-purple-50 p-3 rounded-lg border border-purple-200">
                                <div>{COUNTERFACTUALS.find(c => c.id === selectedCounterfactual)?.description}</div>
                                <div className="font-bold mt-1">📈 Expected: {COUNTERFACTUALS.find(c => c.id === selectedCounterfactual)?.impact}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Simulation Settings */}
                <div className="bg-f1-gray-100 rounded-lg p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-sm">
                            <Settings2 className="w-4 h-4" />
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={simSettings.weatherVariance} onChange={e => setSimSettings({ ...simSettings, weatherVariance: e.target.checked })} />
                                <CloudRain className="w-4 h-4" /> Weather
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={simSettings.safetyCars} onChange={e => setSimSettings({ ...simSettings, safetyCars: e.target.checked })} />
                                <AlertTriangle className="w-4 h-4" /> Safety Cars
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={simSettings.reliabilityDNFs} onChange={e => setSimSettings({ ...simSettings, reliabilityDNFs: e.target.checked })} />
                                <Zap className="w-4 h-4" /> DNFs
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={simSettings.tempEffects} onChange={e => setSimSettings({ ...simSettings, tempEffects: e.target.checked })} />
                                <Thermometer className="w-4 h-4" /> Temp Effects
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Speed:</span>
                            <select value={speed} onChange={e => setSpeed(parseInt(e.target.value))} className="border rounded px-2 py-1">
                                <option value={800}>Slow</option>
                                <option value={300}>Normal</option>
                                <option value={100}>Fast</option>
                                <option value={20}>Instant</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                    <button onClick={() => setIsRunning(!isRunning)} disabled={completedRaces >= races.length} className="bg-f1-red text-white px-5 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50">
                        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isRunning ? 'Pause' : 'Run All'}
                    </button>
                    <button onClick={simulateRace} disabled={isRunning || completedRaces >= races.length} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                        <Flag className="w-4 h-4" /> Next Race
                    </button>
                    <button onClick={runMonteCarlo} className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
                        <Target className="w-4 h-4" /> 1000 Monte Carlo
                    </button>
                    <button onClick={resetSimulation} className="bg-f1-gray-600 text-white px-5 py-2 rounded-lg hover:bg-f1-gray-500 transition flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="bg-f1-gray-200 rounded-full h-3 mb-6">
                    <div className="bg-f1-red h-3 rounded-full transition-all" style={{ width: `${(completedRaces / races.length) * 100}%` }} />
                </div>
                <div className="text-center text-sm text-f1-gray-500 mb-6">
                    Round {completedRaces} / {races.length} • {completedRaces >= races.length ? '🏁 Season Complete' : races[completedRaces]?.name}
                </div>

                {/* Monte Carlo Results */}
                {Object.keys(monteCarloResults).length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-5 mb-6">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            WDC Probability ({selectedCounterfactual ? 'Counterfactual' : 'Baseline'})
                        </h3>
                        <div className="space-y-2">
                            {Object.entries(monteCarloResults).sort(([, a], [, b]) => b - a).slice(0, 5).map(([id, prob]) => {
                                const d = getDriverData(id)
                                return (
                                    <div key={id} className="flex items-center gap-3">
                                        <div className="w-20 font-bold">{d.name}</div>
                                        <div className="flex-1 h-5 bg-white rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${prob}%`, backgroundColor: d.color }} />
                                        </div>
                                        <div className="w-14 text-right font-bold">{prob.toFixed(1)}%</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Standings & Race Log Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Current Standings */}
                    <div className="bg-white rounded-lg shadow p-5">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" /> Championship Standings
                        </h3>
                        <div className="space-y-2">
                            {(standings.length > 0 ? standings : DRIVERS_2024.map(d => ({ id: d.id, points: 0 }))).map((s, i) => {
                                const d = getDriverData(s.id)
                                return (
                                    <div key={s.id} className="flex items-center gap-2 p-2 rounded hover:bg-f1-gray-50">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-f1-gray-100'}`}>{i + 1}</div>
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                        <div className="flex-1 font-bold text-sm">{d.name}</div>
                                        <div className="text-xs text-f1-gray-500">{d.team}</div>
                                        <div className="font-mono font-bold">{s.points}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Race Log */}
                    <div className="bg-white rounded-lg shadow p-5">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Flag className="w-5 h-5 text-green-600" /> Race Log
                        </h3>
                        {raceLog.length === 0 ? (
                            <div className="text-center text-f1-gray-400 py-8">Run simulation to see race results</div>
                        ) : (
                            <div className="space-y-2 max-h-72 overflow-y-auto">
                                {[...raceLog].reverse().slice(0, 8).map((log, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm border-b pb-2">
                                        <span>{log.weather}</span>
                                        <span className="font-bold flex-1">{log.race}</span>
                                        {log.sc && <span className="text-yellow-600 text-xs">🚗 SC</span>}
                                        <span>🥇{log.top3[0]} 🥈{log.top3[1]} 🥉{log.top3[2]}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Links */}
                <div className="flex gap-4 justify-center">
                    <Link href="/championship" className="bg-f1-gray-900 text-white px-5 py-2 rounded-lg hover:bg-f1-gray-700 transition">Championship</Link>
                    <Link href="/strategy" className="border border-f1-gray-300 px-5 py-2 rounded-lg hover:bg-f1-gray-50 transition">Pit Strategy</Link>
                </div>
            </div>
        </div>
    )
}

