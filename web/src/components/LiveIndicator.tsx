'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Radio } from 'lucide-react'

interface LiveStatus {
    isLive: boolean
    sessionType: string | null
    sessionName: string | null
    currentRace: {
        name: string
        location: string
    } | null
    timeRemaining: string | null
}

export default function LiveIndicator() {
    const [status, setStatus] = useState<LiveStatus | null>(null)

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/live-status')
                const data = await res.json()
                setStatus(data)
            } catch (error) {
                console.error('Failed to fetch live status:', error)
            }
        }

        fetchStatus()
        const interval = setInterval(fetchStatus, 30000) // Update every 30s
        return () => clearInterval(interval)
    }, [])

    if (!status) return null

    if (status.isLive) {
        return (
            <Link
                href="/live"
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-full text-white text-sm font-bold animate-pulse"
            >
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                <Radio className="w-4 h-4" />
                <span className="hidden md:inline">
                    LIVE: {status.sessionType}
                </span>
                <span className="md:hidden">LIVE</span>
            </Link>
        )
    }

    return null // Don't show anything when not live
}

// Compact version for navbar
export function LiveBadge() {
    const [isLive, setIsLive] = useState(false)

    useEffect(() => {
        const checkLive = async () => {
            try {
                const res = await fetch('/api/live-status')
                const data = await res.json()
                setIsLive(data.isLive)
            } catch {
                setIsLive(false)
            }
        }

        checkLive()
        const interval = setInterval(checkLive, 30000)
        return () => clearInterval(interval)
    }, [])

    if (!isLive) return null

    return (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
    )
}
