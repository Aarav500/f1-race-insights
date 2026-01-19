/**
 * Complete F1 2025 Season Data
 * Used across all features for consistent driver, team, and race information
 */

// All 20 drivers for 2025 season
export const DRIVERS_2025 = [
    // Red Bull Racing
    { id: 'VER', number: 1, name: 'Max Verstappen', fullName: 'Max Verstappen', team: 'Red Bull Racing', teamId: 'RBR', color: '#3671C6', country: 'NED' },
    { id: 'LAW', number: 30, name: 'Lawson', fullName: 'Liam Lawson', team: 'Red Bull Racing', teamId: 'RBR', color: '#3671C6', country: 'NZL' },

    // Ferrari
    { id: 'LEC', number: 16, name: 'Leclerc', fullName: 'Charles Leclerc', team: 'Ferrari', teamId: 'FER', color: '#E8002D', country: 'MON' },
    { id: 'HAM', number: 44, name: 'Hamilton', fullName: 'Lewis Hamilton', team: 'Ferrari', teamId: 'FER', color: '#E8002D', country: 'GBR' },

    // McLaren
    { id: 'NOR', number: 4, name: 'Norris', fullName: 'Lando Norris', team: 'McLaren', teamId: 'MCL', color: '#FF8000', country: 'GBR' },
    { id: 'PIA', number: 81, name: 'Piastri', fullName: 'Oscar Piastri', team: 'McLaren', teamId: 'MCL', color: '#FF8000', country: 'AUS' },

    // Mercedes
    { id: 'RUS', number: 63, name: 'Russell', fullName: 'George Russell', team: 'Mercedes', teamId: 'MER', color: '#27F4D2', country: 'GBR' },
    { id: 'ANT', number: 12, name: 'Antonelli', fullName: 'Andrea Kimi Antonelli', team: 'Mercedes', teamId: 'MER', color: '#27F4D2', country: 'ITA' },

    // Aston Martin
    { id: 'ALO', number: 14, name: 'Alonso', fullName: 'Fernando Alonso', team: 'Aston Martin', teamId: 'AMR', color: '#229971', country: 'ESP' },
    { id: 'STR', number: 18, name: 'Stroll', fullName: 'Lance Stroll', team: 'Aston Martin', teamId: 'AMR', color: '#229971', country: 'CAN' },

    // Alpine
    { id: 'GAS', number: 10, name: 'Gasly', fullName: 'Pierre Gasly', team: 'Alpine', teamId: 'ALP', color: '#FF87BC', country: 'FRA' },
    { id: 'DOO', number: 7, name: 'Doohan', fullName: 'Jack Doohan', team: 'Alpine', teamId: 'ALP', color: '#FF87BC', country: 'AUS' },

    // Williams
    { id: 'SAI', number: 55, name: 'Sainz', fullName: 'Carlos Sainz', team: 'Williams', teamId: 'WIL', color: '#64C4FF', country: 'ESP' },
    { id: 'ALB', number: 23, name: 'Albon', fullName: 'Alexander Albon', team: 'Williams', teamId: 'WIL', color: '#64C4FF', country: 'THA' },

    // RB (Visa Cash App RB)
    { id: 'TSU', number: 22, name: 'Tsunoda', fullName: 'Yuki Tsunoda', team: 'RB', teamId: 'RB', color: '#6692FF', country: 'JPN' },
    { id: 'HAD', number: 6, name: 'Hadjar', fullName: 'Isack Hadjar', team: 'RB', teamId: 'RB', color: '#6692FF', country: 'FRA' },

    // Haas
    { id: 'OCO', number: 31, name: 'Ocon', fullName: 'Esteban Ocon', team: 'Haas', teamId: 'HAA', color: '#B6BABD', country: 'FRA' },
    { id: 'BEA', number: 87, name: 'Bearman', fullName: 'Oliver Bearman', team: 'Haas', teamId: 'HAA', color: '#B6BABD', country: 'GBR' },

    // Kick Sauber
    { id: 'HUL', number: 27, name: 'Hulkenberg', fullName: 'Nico Hulkenberg', team: 'Kick Sauber', teamId: 'SAU', color: '#52E252', country: 'GER' },
    { id: 'BOR', number: 5, name: 'Bortoleto', fullName: 'Gabriel Bortoleto', team: 'Kick Sauber', teamId: 'SAU', color: '#52E252', country: 'BRA' },
] as const

// All 10 teams for 2025
export const TEAMS_2025 = [
    { id: 'RBR', name: 'Red Bull Racing', fullName: 'Oracle Red Bull Racing', color: '#3671C6', engine: 'Honda RBPT', base: 'Milton Keynes, UK', principal: 'Christian Horner' },
    { id: 'FER', name: 'Ferrari', fullName: 'Scuderia Ferrari', color: '#E8002D', engine: 'Ferrari', base: 'Maranello, Italy', principal: 'Frédéric Vasseur' },
    { id: 'MCL', name: 'McLaren', fullName: 'McLaren F1 Team', color: '#FF8000', engine: 'Mercedes', base: 'Woking, UK', principal: 'Andrea Stella' },
    { id: 'MER', name: 'Mercedes', fullName: 'Mercedes-AMG Petronas F1 Team', color: '#27F4D2', engine: 'Mercedes', base: 'Brackley, UK', principal: 'Toto Wolff' },
    { id: 'AMR', name: 'Aston Martin', fullName: 'Aston Martin Aramco F1 Team', color: '#229971', engine: 'Mercedes', base: 'Silverstone, UK', principal: 'Mike Krack' },
    { id: 'ALP', name: 'Alpine', fullName: 'BWT Alpine F1 Team', color: '#FF87BC', engine: 'Renault', base: 'Enstone, UK', principal: 'Oliver Oakes' },
    { id: 'WIL', name: 'Williams', fullName: 'Williams Racing', color: '#64C4FF', engine: 'Mercedes', base: 'Grove, UK', principal: 'James Vowles' },
    { id: 'RB', name: 'RB', fullName: 'Visa Cash App RB F1 Team', color: '#6692FF', engine: 'Honda RBPT', base: 'Faenza, Italy', principal: 'Laurent Mekies' },
    { id: 'HAA', name: 'Haas', fullName: 'MoneyGram Haas F1 Team', color: '#B6BABD', engine: 'Ferrari', base: 'Kannapolis, USA', principal: 'Ayao Komatsu' },
    { id: 'SAU', name: 'Kick Sauber', fullName: 'Stake F1 Team Kick Sauber', color: '#52E252', engine: 'Ferrari', base: 'Hinwil, Switzerland', principal: 'Mattia Binotto' },
] as const

// Complete 2025 F1 Calendar (24 races)
export const CALENDAR_2025 = [
    { round: 1, name: 'Australian Grand Prix', shortName: 'Australia', circuit: 'Albert Park', location: 'Melbourne', country: 'AUS', date: '2025-03-16', laps: 58, length: 5.278, type: 'street' },
    { round: 2, name: 'Chinese Grand Prix', shortName: 'China', circuit: 'Shanghai International', location: 'Shanghai', country: 'CHN', date: '2025-03-23', laps: 56, length: 5.451, type: 'permanent', sprint: true },
    { round: 3, name: 'Japanese Grand Prix', shortName: 'Japan', circuit: 'Suzuka', location: 'Suzuka', country: 'JPN', date: '2025-04-06', laps: 53, length: 5.807, type: 'permanent' },
    { round: 4, name: 'Bahrain Grand Prix', shortName: 'Bahrain', circuit: 'Bahrain International', location: 'Sakhir', country: 'BHR', date: '2025-04-13', laps: 57, length: 5.412, type: 'permanent' },
    { round: 5, name: 'Saudi Arabian Grand Prix', shortName: 'Saudi Arabia', circuit: 'Jeddah Corniche', location: 'Jeddah', country: 'SAU', date: '2025-04-20', laps: 50, length: 6.174, type: 'street' },
    { round: 6, name: 'Miami Grand Prix', shortName: 'Miami', circuit: 'Miami International', location: 'Miami', country: 'USA', date: '2025-05-04', laps: 57, length: 5.412, type: 'street', sprint: true },
    { round: 7, name: 'Emilia Romagna Grand Prix', shortName: 'Imola', circuit: 'Autodromo Enzo e Dino Ferrari', location: 'Imola', country: 'ITA', date: '2025-05-18', laps: 63, length: 4.909, type: 'permanent' },
    { round: 8, name: 'Monaco Grand Prix', shortName: 'Monaco', circuit: 'Circuit de Monaco', location: 'Monte Carlo', country: 'MON', date: '2025-05-25', laps: 78, length: 3.337, type: 'street' },
    { round: 9, name: 'Spanish Grand Prix', shortName: 'Spain', circuit: 'Circuit de Barcelona-Catalunya', location: 'Barcelona', country: 'ESP', date: '2025-06-01', laps: 66, length: 4.657, type: 'permanent' },
    { round: 10, name: 'Canadian Grand Prix', shortName: 'Canada', circuit: 'Circuit Gilles Villeneuve', location: 'Montreal', country: 'CAN', date: '2025-06-15', laps: 70, length: 4.361, type: 'semi-street' },
    { round: 11, name: 'Austrian Grand Prix', shortName: 'Austria', circuit: 'Red Bull Ring', location: 'Spielberg', country: 'AUT', date: '2025-06-29', laps: 71, length: 4.318, type: 'permanent', sprint: true },
    { round: 12, name: 'British Grand Prix', shortName: 'Britain', circuit: 'Silverstone', location: 'Silverstone', country: 'GBR', date: '2025-07-06', laps: 52, length: 5.891, type: 'permanent' },
    { round: 13, name: 'Belgian Grand Prix', shortName: 'Belgium', circuit: 'Spa-Francorchamps', location: 'Spa', country: 'BEL', date: '2025-07-27', laps: 44, length: 7.004, type: 'permanent', sprint: true },
    { round: 14, name: 'Hungarian Grand Prix', shortName: 'Hungary', circuit: 'Hungaroring', location: 'Budapest', country: 'HUN', date: '2025-08-03', laps: 70, length: 4.381, type: 'permanent' },
    { round: 15, name: 'Dutch Grand Prix', shortName: 'Netherlands', circuit: 'Zandvoort', location: 'Zandvoort', country: 'NED', date: '2025-08-31', laps: 72, length: 4.259, type: 'permanent' },
    { round: 16, name: 'Italian Grand Prix', shortName: 'Italy', circuit: 'Monza', location: 'Monza', country: 'ITA', date: '2025-09-07', laps: 53, length: 5.793, type: 'permanent' },
    { round: 17, name: 'Azerbaijan Grand Prix', shortName: 'Azerbaijan', circuit: 'Baku City Circuit', location: 'Baku', country: 'AZE', date: '2025-09-21', laps: 51, length: 6.003, type: 'street' },
    { round: 18, name: 'Singapore Grand Prix', shortName: 'Singapore', circuit: 'Marina Bay', location: 'Singapore', country: 'SGP', date: '2025-10-05', laps: 62, length: 4.940, type: 'street' },
    { round: 19, name: 'United States Grand Prix', shortName: 'USA', circuit: 'Circuit of the Americas', location: 'Austin', country: 'USA', date: '2025-10-19', laps: 56, length: 5.513, type: 'permanent', sprint: true },
    { round: 20, name: 'Mexico City Grand Prix', shortName: 'Mexico', circuit: 'Autódromo Hermanos Rodríguez', location: 'Mexico City', country: 'MEX', date: '2025-10-26', laps: 71, length: 4.304, type: 'permanent' },
    { round: 21, name: 'São Paulo Grand Prix', shortName: 'Brazil', circuit: 'Interlagos', location: 'São Paulo', country: 'BRA', date: '2025-11-09', laps: 71, length: 4.309, type: 'permanent', sprint: true },
    { round: 22, name: 'Las Vegas Grand Prix', shortName: 'Las Vegas', circuit: 'Las Vegas Strip', location: 'Las Vegas', country: 'USA', date: '2025-11-22', laps: 50, length: 6.201, type: 'street' },
    { round: 23, name: 'Qatar Grand Prix', shortName: 'Qatar', circuit: 'Lusail International', location: 'Lusail', country: 'QAT', date: '2025-11-30', laps: 57, length: 5.419, type: 'permanent' },
    { round: 24, name: 'Abu Dhabi Grand Prix', shortName: 'Abu Dhabi', circuit: 'Yas Marina', location: 'Abu Dhabi', country: 'UAE', date: '2025-12-07', laps: 58, length: 5.281, type: 'permanent' },
] as const

// Tire compounds with characteristics
export const TIRE_COMPOUNDS = {
    soft: { name: 'Soft', color: '#FF0000', degradation: 0.12, peakGrip: 1.0, optimalLaps: 15, cliff: 18 },
    medium: { name: 'Medium', color: '#FFD700', degradation: 0.07, peakGrip: 0.95, optimalLaps: 28, cliff: 35 },
    hard: { name: 'Hard', color: '#FFFFFF', degradation: 0.04, peakGrip: 0.88, optimalLaps: 45, cliff: 55 },
    intermediate: { name: 'Intermediate', color: '#00FF00', degradation: 0.09, peakGrip: 0.92, optimalLaps: 30, cliff: 40 },
    wet: { name: 'Wet', color: '#0066FF', degradation: 0.06, peakGrip: 0.85, optimalLaps: 50, cliff: 60 },
} as const

// Points system
export const POINTS_SYSTEM = {
    race: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], // P1-P10
    sprint: [8, 7, 6, 5, 4, 3, 2, 1], // P1-P8
    fastestLap: 1, // Only if in top 10
} as const

// Pit stop time components
export const PIT_STOP_DATA = {
    pitLaneLoss: 20, // Average time lost in pit lane (seconds)
    wheelChangeTime: 2.5, // Average wheel change time
    reactionTime: 0.3, // Driver reaction to pit call
    trackPositionFactor: 1.5, // Seconds lost per position in traffic
} as const

// Helper functions
export function getDriverById(id: string) {
    return DRIVERS_2025.find(d => d.id === id)
}

export function getDriversByTeam(teamId: string) {
    return DRIVERS_2025.filter(d => d.teamId === teamId)
}

export function getTeamById(id: string) {
    return TEAMS_2025.find(t => t.id === id)
}

export function getRaceByRound(round: number) {
    return CALENDAR_2025.find(r => r.round === round)
}

export function getNextRace() {
    const now = new Date()
    return CALENDAR_2025.find(r => new Date(r.date) > now) || CALENDAR_2025[0]
}

export function getLastRace() {
    const now = new Date()
    const past = CALENDAR_2025.filter(r => new Date(r.date) < now)
    return past[past.length - 1] || null
}

// Driver statistics for analysis features
export const DRIVER_STATS = {
    VER: { qualiPace: 0.00, racePace: 0.05, consistency: 95, wetSkill: 90, aggression: 92, experience: 88 },
    LEC: { qualiPace: 0.08, racePace: 0.22, consistency: 82, wetSkill: 80, aggression: 85, experience: 70 },
    NOR: { qualiPace: 0.15, racePace: 0.12, consistency: 88, wetSkill: 85, aggression: 78, experience: 65 },
    HAM: { qualiPace: 0.18, racePace: 0.10, consistency: 92, wetSkill: 95, aggression: 75, experience: 100 },
    PIA: { qualiPace: 0.22, racePace: 0.18, consistency: 85, wetSkill: 78, aggression: 76, experience: 55 },
    RUS: { qualiPace: 0.12, racePace: 0.25, consistency: 80, wetSkill: 82, aggression: 72, experience: 62 },
    SAI: { qualiPace: 0.25, racePace: 0.20, consistency: 90, wetSkill: 83, aggression: 70, experience: 72 },
    ALO: { qualiPace: 0.30, racePace: 0.15, consistency: 93, wetSkill: 92, aggression: 80, experience: 100 },
    LAW: { qualiPace: 0.35, racePace: 0.30, consistency: 75, wetSkill: 75, aggression: 82, experience: 45 },
    ANT: { qualiPace: 0.40, racePace: 0.38, consistency: 70, wetSkill: 72, aggression: 78, experience: 30 },
    STR: { qualiPace: 0.45, racePace: 0.42, consistency: 72, wetSkill: 68, aggression: 65, experience: 60 },
    GAS: { qualiPace: 0.42, racePace: 0.40, consistency: 78, wetSkill: 80, aggression: 74, experience: 68 },
    DOO: { qualiPace: 0.50, racePace: 0.48, consistency: 68, wetSkill: 65, aggression: 70, experience: 25 },
    ALB: { qualiPace: 0.48, racePace: 0.45, consistency: 82, wetSkill: 78, aggression: 68, experience: 58 },
    TSU: { qualiPace: 0.52, racePace: 0.50, consistency: 74, wetSkill: 70, aggression: 85, experience: 52 },
    HAD: { qualiPace: 0.55, racePace: 0.52, consistency: 72, wetSkill: 68, aggression: 75, experience: 20 },
    OCO: { qualiPace: 0.50, racePace: 0.48, consistency: 76, wetSkill: 74, aggression: 72, experience: 65 },
    BEA: { qualiPace: 0.58, racePace: 0.55, consistency: 70, wetSkill: 65, aggression: 78, experience: 22 },
    HUL: { qualiPace: 0.55, racePace: 0.52, consistency: 80, wetSkill: 82, aggression: 70, experience: 85 },
    BOR: { qualiPace: 0.60, racePace: 0.58, consistency: 68, wetSkill: 62, aggression: 72, experience: 18 },
} as const

export type DriverId = typeof DRIVERS_2025[number]['id']
export type TeamId = typeof TEAMS_2025[number]['id']
export type RaceRound = typeof CALENDAR_2025[number]['round']
