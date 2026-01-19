import { NextRequest } from 'next/server'

const API_URL = process.env.API_INTERNAL_URL || 'http://api:8000'

export async function GET(
    request: NextRequest,
    { params }: { params: { raceId: string } }
) {
    const { raceId } = params
    const searchParams = request.nextUrl.searchParams
    const model = searchParams.get('model') || 'xgb'

    const url = `${API_URL}/api/f1/predict/race/${raceId}?model=${model}`

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
