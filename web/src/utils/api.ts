import axios from 'axios'

// Runtime configuration cache
let cachedApiBaseUrl: string | null = null

/**
 * Fetch runtime configuration from the server
 * This allows the API URL to be set at container startup time
 */
async function getApiBaseUrl(): Promise<string> {
    // Return cached value if available
    if (cachedApiBaseUrl) {
        return cachedApiBaseUrl
    }

    // In browser environment, fetch from config endpoint
    if (typeof window !== 'undefined') {
        try {
            const response = await fetch('/api/config')
            const config = await response.json()
            cachedApiBaseUrl = config.apiBaseUrl
            return cachedApiBaseUrl || 'http://localhost:8000'
        } catch (error) {
            console.warn('Failed to fetch runtime config, using fallback:', error)
            // Fallback to environment variable or localhost
            const fallback = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
            cachedApiBaseUrl = fallback
            return fallback
        }
    }

    // Server-side: use environment variable directly
    const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    cachedApiBaseUrl = serverUrl
    return serverUrl
}

// Create API client with initial config
export const api = axios.create({
    baseURL: 'http://localhost:8000', // Default, will be updated
    headers: {
        'Content-Type': 'application/json',
    },
})

// Initialize API client with runtime config (browser only)
if (typeof window !== 'undefined') {
    getApiBaseUrl().then((baseURL) => {
        api.defaults.baseURL = baseURL
    })
}

// Types
export interface PredictionResponse {
    race_id: string
    model_name: string
    win_prob: Record<string, number>
    podium_prob: Record<string, number>
    expected_finish: Record<string, number>
    generated_at: string
}

export interface FeatureImpact {
    name: string
    value: number
    impact: number
}

export interface ExplainResponse {
    race_id: string
    driver_id: string
    model_name: string
    top_features: FeatureImpact[]
}

export interface PredictionOutcome {
    win_prob: number
    podium_prob: number
    expected_finish: number
}

export interface CounterfactualResponse {
    race_id: string
    driver_id: string
    model_name: string
    baseline: PredictionOutcome
    counterfactual: PredictionOutcome
    delta: PredictionOutcome
    changes: Record<string, number>
}

export interface BacktestResults {
    run_timestamp: string
    config: Record<string, any>
    results: Record<string, any>
}

// API functions
export async function getRacePrediction(
    raceId: string,
    model: string = 'xgb'
): Promise<PredictionResponse> {
    const response = await api.get(`/api/f1/predict/race/${raceId}`, {
        params: { model },
    })
    return response.data
}

export async function getExplanation(
    raceId: string,
    driverId: string,
    model: string = 'xgb',
    topK: number = 10
): Promise<ExplainResponse> {
    const response = await api.get(`/api/f1/explain/race/${raceId}`, {
        params: { driver_id: driverId, model, top_k: topK },
    })
    return response.data
}

export async function postCounterfactual(
    raceId: string,
    driverId: string,
    changes: Record<string, number>,
    model: string = 'xgb'
): Promise<CounterfactualResponse> {
    const response = await api.post(
        `/api/f1/counterfactual`,
        {
            race_id: raceId,
            driver_id: driverId,
            changes,
        },
        {
            params: { model },
        }
    )
    return response.data
}

export async function getBacktestResults(): Promise<BacktestResults> {
    // Try to fetch from reports endpoint if available
    // Fallback to static file
    try {
        const response = await api.get('/reports/backtest.json')
        return response.data
    } catch (error) {
        // If endpoint doesn't exist, return placeholder
        throw new Error('Backtest results not available. Run: python scripts/backtest.py')
    }
}

export async function getHealthCheck(): Promise<{ status: string }> {
    const response = await api.get('/health')
    return response.data
}
