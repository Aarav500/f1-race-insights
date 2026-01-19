import { NextRequest } from 'next/server'

const API_URL = process.env.API_INTERNAL_URL || 'http://api:8000'

export async function GET(
    request: NextRequest,
    { params }: { params: { raceId: string } }
) {
    const { raceId } = params
    const searchParams = request.nextUrl.searchParams
    const driverId = searchParams.get('driver_id')
    const model = searchParams.get('model') || 'xgb'
    const topK = searchParams.get('top_k') || '10'

    const queryString = new URLSearchParams({
        driver_id: driverId || '',
        model,
        top_k: topK
    }).toString()

    const url = `${API_URL}/api/f1/explain/race/${raceId}?${queryString}`

    try {
        const response = await fetch(url)

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
