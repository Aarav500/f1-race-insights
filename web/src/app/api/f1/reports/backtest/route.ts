import { NextRequest } from 'next/server'

const API_URL = process.env.API_INTERNAL_URL || 'http://api:8000'

export async function GET() {
    const url = `${API_URL}/api/f1/reports/backtest`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            // 404 is acceptable - backtest may not have been run yet
            if (response.status === 404) {
                return Response.json(
                    { detail: "Backtest report not found. Run: python scripts/backtest.py" },
                    { status: 404 }
                )
            }
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
