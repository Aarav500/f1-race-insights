const API_URL = process.env.API_INTERNAL_URL || 'http://api:8000'

export async function GET() {
    try {
        const url = `${API_URL}/health`
        const response = await fetch(url)
        const data = await response.json()
        return Response.json(data, { status: response.status })
    } catch (error: any) {
        return Response.json(
            { status: 'error', message: error.message },
            { status: 503 }
        )
    }
}
