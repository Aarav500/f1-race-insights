import { NextResponse } from 'next/server'
import { getLiveStatus, getNextRace, getLastCompletedRace } from '@/lib/f1-live'

export const dynamic = 'force-dynamic'
export const revalidate = 10

export async function GET() {
    try {
        // Try to get live status from OpenF1
        const liveStatus = await getLiveStatus()

        // Fallback to calendar if API unavailable
        const nextRace = getNextRace()
        const lastRace = getLastCompletedRace()

        return NextResponse.json({
            ...liveStatus,
            nextRace,
            lastCompletedRace: lastRace,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Live status error:', error)

        // Return fallback data
        const nextRace = getNextRace()
        const lastRace = getLastCompletedRace()

        return NextResponse.json({
            isLive: false,
            sessionType: null,
            sessionName: null,
            currentRace: null,
            lastRace: lastRace
                ? {
                    name: lastRace.name,
                    location: lastRace.location,
                    winner: 'Results pending',
                    date: lastRace.date,
                }
                : null,
            nextRace,
            lastCompletedRace: lastRace,
            timestamp: new Date().toISOString(),
            error: 'API unavailable, using cached calendar',
        })
    }
}
