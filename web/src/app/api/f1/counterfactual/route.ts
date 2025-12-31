import { NextRequest } from 'next/server'

const API_URL = process.env.API_INTERNAL_URL || 'http://api:8000'

export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const model = searchParams.get('model') || 'xgb'
    const body = await request.json()

    const url = `${API_URL}/api/f1/counterfactual?model=${model}`

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            return Response.json(
                { detail: `Backend error: ${response.statusText}` },
                { status: response.status }
            )
        }

        const data = await response.json()
        return Response.json(data)
    } catch (error: any) {
        return Response.json(
            { detail: `Failed to connect to backend: ${error.message}` },
            { status: 502 }
        )
    }
}
