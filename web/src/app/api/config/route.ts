/**
 * Runtime configuration endpoint
 * Serves environment variables to the client at runtime
 * This allows the same Docker image to be used across different environments
 */

import { NextResponse } from 'next/server'

export async function GET() {
    // Server-side environment variables
    // These are available at runtime in the container
    const config = {
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    }

    return NextResponse.json(config, {
        headers: {
            'Cache-Control': 'public, max-age=60', // Cache for 60 seconds
        },
    })
}
