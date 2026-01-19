import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const apiUrl = process.env.API_INTERNAL_URL || 'http://localhost:8000'
    const searchParams = request.nextUrl.searchParams
    const season = searchParams.get('season') || '2026'
    const next = searchParams.get('next') || ''
    const limit = searchParams.get('limit') || '50'

    try {
        const url = new URL(`${apiUrl}/meta/races`)
        url.searchParams.set('season', season)
        if (next) url.searchParams.set('next', next)
        url.searchParams.set('limit', limit)

        const response = await fetch(url.toString())

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch races' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
