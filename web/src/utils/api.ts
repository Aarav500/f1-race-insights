import axios from 'axios'

// Create API client using relative paths (same-origin)
// All API calls will go through Next.js API routes which proxy to the backend
export const api = axios.create({
    baseURL: '', // Empty = same origin, uses Next.js proxy routes at /api/*
    headers: {
        'Content-Type': 'application/json',
    },
})

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

export interface ModelInfo {
    id: string
    name: string
    type: string
    description: string
    supports_shap: boolean
    supports_counterfactual: boolean
}

export interface ModelsResponse {
    models: ModelInfo[]
    count: number
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

export async function getModels(): Promise<ModelsResponse> {
    const response = await api.get('/api/f1/models')
    return response.data
}

export async function getBacktestResults(): Promise<BacktestResults> {
    const response = await api.get('/api/f1/reports/backtest')
    return response.data
}

export async function getHealthCheck(): Promise<{ status: string }> {
    const response = await api.get('/api/health')
    return response.data
}
