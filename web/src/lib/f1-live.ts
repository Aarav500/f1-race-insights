/**
 * F1 Live Data Service
 * Integrates with OpenF1 API for real-time race data
 */

const OPENF1_BASE = 'https://api.openf1.org/v1'

export interface Session {
    session_key: number
    session_name: string
    session_type: 'Race' | 'Qualifying' | 'Sprint' | 'Practice 1' | 'Practice 2' | 'Practice 3'
    date_start: string
    date_end: string
    meeting_key: number
}

export interface Meeting {
    meeting_key: number
    meeting_name: string
    meeting_official_name: string
    location: string
    country_name: string
    date_start: string
}

export interface Position {
    driver_number: number
    position: number
    date: string
}

export interface Interval {
    driver_number: number
    gap_to_leader: number | null
    interval: number | null
    date: string
}

export interface DriverInfo {
    driver_number: number
    broadcast_name: string
    full_name: string
    team_name: string
    team_colour: string
    acronym: string
}

export interface LiveStatus {
    isLive: boolean
    sessionType: string | null
    sessionName: string | null
    currentRace: {
        name: string
        location: string
        round: number
    } | null
    lastRace: {
        name: string
        location: string
        winner: string
        date: string
    } | null
    timeRemaining: string | null
}

// Cache for API responses
const cache: { [key: string]: { data: unknown; timestamp: number } } = {}
const CACHE_TTL = 10000 // 10 seconds

async function fetchWithCache<T>(endpoint: string): Promise<T | null> {
    const cacheKey = endpoint
    const now = Date.now()

    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
        return cache[cacheKey].data as T
    }

    try {
        const response = await fetch(`${OPENF1_BASE}${endpoint}`, {
            next: { revalidate: 10 },
        })

        if (!response.ok) {
            console.error(`OpenF1 API error: ${response.status}`)
            return null
        }

        const data = await response.json()
        cache[cacheKey] = { data, timestamp: now }
        return data as T
    } catch (error) {
        console.error('OpenF1 fetch error:', error)
        return null
    }
}

/**
 * Get the latest/current session
 */
export async function getLatestSession(): Promise<Session | null> {
    const sessions = await fetchWithCache<Session[]>('/sessions?session_key=latest')
    return sessions?.[0] || null
}

/**
 * Get all sessions for current year
 */
export async function getSessions(): Promise<Session[]> {
    const year = new Date().getFullYear()
    return (await fetchWithCache<Session[]>(`/sessions?year=${year}`)) || []
}

/**
 * Get meeting (race weekend) info
 */
export async function getMeeting(meetingKey: number): Promise<Meeting | null> {
    const meetings = await fetchWithCache<Meeting[]>(`/meetings?meeting_key=${meetingKey}`)
    return meetings?.[0] || null
}

/**
 * Get all meetings for current year
 */
export async function getMeetings(): Promise<Meeting[]> {
    const year = new Date().getFullYear()
    return (await fetchWithCache<Meeting[]>(`/meetings?year=${year}`)) || []
}

/**
 * Get live positions for a session
 */
export async function getLivePositions(sessionKey?: number): Promise<Position[]> {
    const key = sessionKey || 'latest'
    return (await fetchWithCache<Position[]>(`/position?session_key=${key}`)) || []
}

/**
 * Get intervals (gaps) for a session
 */
export async function getLiveIntervals(sessionKey?: number): Promise<Interval[]> {
    const key = sessionKey || 'latest'
    return (await fetchWithCache<Interval[]>(`/intervals?session_key=${key}`)) || []
}

/**
 * Get driver information
 */
export async function getDrivers(sessionKey?: number): Promise<DriverInfo[]> {
    const key = sessionKey || 'latest'
    return (await fetchWithCache<DriverInfo[]>(`/drivers?session_key=${key}`)) || []
}

/**
 * Check if a session is currently live
 */
export function isSessionLive(session: Session | null): boolean {
    if (!session) return false

    const now = new Date()
    const start = new Date(session.date_start)
    const end = new Date(session.date_end)

    // Session is live if current time is between start and end
    // Add 30 min buffer after scheduled end for delays
    const endWithBuffer = new Date(end.getTime() + 30 * 60 * 1000)

    return now >= start && now <= endWithBuffer
}

/**
 * Calculate time remaining in session
 */
export function getTimeRemaining(session: Session): string | null {
    const now = new Date()
    const end = new Date(session.date_end)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return null

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
        return `${hours}h ${mins}m`
    }
    return `${mins}m`
}

/**
 * Get comprehensive live status
 */
export async function getLiveStatus(): Promise<LiveStatus> {
    try {
        const session = await getLatestSession()
        const isLive = isSessionLive(session)

        let currentRace = null
        let lastRace = null

        if (session) {
            const meeting = await getMeeting(session.meeting_key)
            if (meeting) {
                currentRace = {
                    name: meeting.meeting_name,
                    location: meeting.location,
                    round: 0, // Would need race calendar to get round
                }
            }
        }

        // Get last completed race from meetings
        const meetings = await getMeetings()
        const now = new Date()
        const pastMeetings = meetings.filter((m) => new Date(m.date_start) < now)
        const lastMeeting = pastMeetings[pastMeetings.length - 1]

        if (lastMeeting) {
            lastRace = {
                name: lastMeeting.meeting_name,
                location: lastMeeting.location,
                winner: 'TBD', // Would need results API
                date: lastMeeting.date_start,
            }
        }

        return {
            isLive,
            sessionType: session?.session_type || null,
            sessionName: session?.session_name || null,
            currentRace,
            lastRace,
            timeRemaining: session && isLive ? getTimeRemaining(session) : null,
        }
    } catch (error) {
        console.error('Error getting live status:', error)
        return {
            isLive: false,
            sessionType: null,
            sessionName: null,
            currentRace: null,
            lastRace: null,
            timeRemaining: null,
        }
    }
}

// 2025/2026 F1 Calendar fallback (when API unavailable)
export const F1_CALENDAR_2025 = [
    { round: 1, name: 'Bahrain Grand Prix', location: 'Sakhir', date: '2025-03-02' },
    { round: 2, name: 'Saudi Arabian Grand Prix', location: 'Jeddah', date: '2025-03-09' },
    { round: 3, name: 'Australian Grand Prix', location: 'Melbourne', date: '2025-03-23' },
    { round: 4, name: 'Japanese Grand Prix', location: 'Suzuka', date: '2025-04-06' },
    { round: 5, name: 'Chinese Grand Prix', location: 'Shanghai', date: '2025-04-20' },
    { round: 6, name: 'Miami Grand Prix', location: 'Miami', date: '2025-05-04' },
    { round: 7, name: 'Emilia Romagna Grand Prix', location: 'Imola', date: '2025-05-18' },
    { round: 8, name: 'Monaco Grand Prix', location: 'Monaco', date: '2025-05-25' },
    { round: 9, name: 'Spanish Grand Prix', location: 'Barcelona', date: '2025-06-01' },
    { round: 10, name: 'Canadian Grand Prix', location: 'Montreal', date: '2025-06-15' },
    { round: 11, name: 'Austrian Grand Prix', location: 'Spielberg', date: '2025-06-29' },
    { round: 12, name: 'British Grand Prix', location: 'Silverstone', date: '2025-07-06' },
    { round: 13, name: 'Belgian Grand Prix', location: 'Spa', date: '2025-07-27' },
    { round: 14, name: 'Hungarian Grand Prix', location: 'Budapest', date: '2025-08-03' },
    { round: 15, name: 'Dutch Grand Prix', location: 'Zandvoort', date: '2025-08-31' },
    { round: 16, name: 'Italian Grand Prix', location: 'Monza', date: '2025-09-07' },
    { round: 17, name: 'Azerbaijan Grand Prix', location: 'Baku', date: '2025-09-21' },
    { round: 18, name: 'Singapore Grand Prix', location: 'Singapore', date: '2025-10-05' },
    { round: 19, name: 'United States Grand Prix', location: 'Austin', date: '2025-10-19' },
    { round: 20, name: 'Mexico City Grand Prix', location: 'Mexico City', date: '2025-10-26' },
    { round: 21, name: 'São Paulo Grand Prix', location: 'São Paulo', date: '2025-11-09' },
    { round: 22, name: 'Las Vegas Grand Prix', location: 'Las Vegas', date: '2025-11-22' },
    { round: 23, name: 'Qatar Grand Prix', location: 'Lusail', date: '2025-11-30' },
    { round: 24, name: 'Abu Dhabi Grand Prix', location: 'Yas Marina', date: '2025-12-07' },
]

/**
 * Get next upcoming race from calendar
 */
export function getNextRace() {
    const now = new Date()
    return F1_CALENDAR_2025.find((race) => new Date(race.date) > now) || F1_CALENDAR_2025[0]
}

/**
 * Get last completed race from calendar
 */
export function getLastCompletedRace() {
    const now = new Date()
    const past = F1_CALENDAR_2025.filter((race) => new Date(race.date) < now)
    return past[past.length - 1] || null
}
