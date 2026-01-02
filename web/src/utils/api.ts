import axios from 'axios'

// Create API client with configurable backend URL
// In production: uses NEXT_PUBLIC_API_BASE_URL (should be set to http://IP:8000)
// In development: defaults to http://localhost:8000
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
    baseURL: apiBaseURL,
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
    delta: {
        win_prob: number
        podium_prob: number
        expected_finish: number
    }
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

export interface ModelMetrics {
    accuracy: number
    logloss: number | null
    brier: number | null
}

export interface MetaModelInfo {
    model_id: string
    display_name: string
    type: string
    interpretable: string
    speed: string
    metrics: {
        overall: ModelMetrics
        win: ModelMetrics | null
        podium: ModelMetrics | null
    }
}

export interface MetaModelsResponse {
    models: MetaModelInfo[]
}

export interface RaceInfo {
    race_id: string
    name: string
    date: string
    season: number
    round: number
}

export interface RacesResponse {
    races: RaceInfo[]
}

export interface SeasonsResponse {
    seasons: number[]
    latest: number
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

export async function getMetaModels(): Promise<MetaModelsResponse> {
    const response = await api.get('/meta/models')
    return response.data
}

export async function getSeasons(): Promise<SeasonsResponse> {
    const response = await api.get('/meta/seasons')
    return response.data
}

export async function getRaces(season?: number, limit: number = 50): Promise<RacesResponse> {
    const params: any = { limit }
    if (season) {
        params.season = season
    }
    const response = await api.get('/meta/races', { params })
    return response.data
}

export async function getBacktestResults(): Promise<BacktestResults> {
    const response = await api.get('/api/f1/reports/backtest')
    return response.data
}

export async function getHealthCheck(): Promise<{ status: string }> {
    const response = await api.get('/health')
    return response.data
}
