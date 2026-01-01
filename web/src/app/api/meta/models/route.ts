import { NextResponse } from 'next/server'

export async function GET() {
    const apiUrl = process.env.API_INTERNAL_URL || 'http://localhost:8000'

    try {
        const response = await fetch(`${apiUrl}/meta/models`)

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch models' },
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
