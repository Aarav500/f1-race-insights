'use client'

import { useState, useEffect } from 'react'
import { getRacePrediction, PredictionResponse, getMetaModels } from '@/utils/api'
import { Loader2, TrendingUp, Award, Target } from 'lucide-react'

const ALL_MODELS = ['xgb', 'lgbm', 'cat', 'lr', 'rf', 'elo', 'quali_freq', 'nbt_tlf']

export default function ComparePage() {
    const [raceId, setRaceId] = useState('2024_01')
    const [predictions, setPredictions] = useState<Record<string, PredictionResponse>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Model performance from backtest
    const modelPerformance: Record<string, { auc: number; brier: number; ece: number }> = {
        'lr': { auc: 0.987, brier: 0.019, ece: 0.008 },
        'rf': { auc: 0.985, brier: 0.021, ece: 0.010 },
        'cat': { auc: 0.985, brier: 0.021, ece: 0.012 },
        'xgb': { auc: 0.983, brier: 0.024, ece: 0.016 },
        'quali_freq': { auc: 0.981, brier: 0.018, ece: 0.006 },
        'lgbm': { auc: 0.975, brier: 0.028, ece: 0.022 },
        'nbt_tlf': { auc: 0.95, brier: 0.030, ece: 0.015 },
        'elo': { auc: 0.440, brier: 0.048, ece: 0.000 },
    }

    const loadAllPredictions = async () => {
        setLoading(true)
        setError(null)
        const newPredictions: Record<string, PredictionResponse> = {}

        try {
            await Promise.all(
                ALL_MODELS.map(async (model) => {
                    try {
                        const pred = await getRacePrediction(raceId, model)
                        newPredictions[model] = pred
                    } catch (e: any) {
                        console.warn(`Failed to load ${model}:`, e.message)
                    }
                })
            )
            setPredictions(newPredictions)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAllPredictions()
    }, [raceId])

    // Get all unique drivers
    const allDrivers = [...new Set(
        Object.values(predictions).flatMap(p => Object.keys(p.win_prob || {}))
    )].sort((a, b) => {
        const avgA = Object.values(predictions).reduce((sum, p) => sum + (p.win_prob?.[a] || 0), 0) / Object.keys(predictions).length
        const avgB = Object.values(predictions).reduce((sum, p) => sum + (p.win_prob?.[b] || 0), 0) / Object.keys(predictions).length
        return avgB - avgA
    })

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-f1-black mb-2">Multi-Model Comparison</h1>
                <p className="text-f1-gray-600">Compare predictions from all 8 models side-by-side with accuracy metrics</p>
            </div>

            {/* Race Selector */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <label className="block text-sm font-medium mb-2">Select Race</label>
                <div className="flex gap-4">
                    <select
                        value={raceId}
                        onChange={(e) => setRaceId(e.target.value)}
                        className="flex-1 px-4 py-2 border border-f1-gray-300 rounded-lg"
                    >
                        <optgroup label="2024 Season">
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={`2024_${i + 1}`} value={`2024_${String(i + 1).padStart(2, '0')}`}>
                                    2024 Round {i + 1}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="2025 Season (Future)">
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={`2025_${i + 1}`} value={`2025_${String(i + 1).padStart(2, '0')}`}>
                                    2025 Round {i + 1}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="2026 Season (New Regulations)">
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={`2026_${i + 1}`} value={`2026_${String(i + 1).padStart(2, '0')}`}>
                                    2026 Round {i + 1}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                    <button
                        onClick={loadAllPredictions}
                        disabled={loading}
                        className="px-6 py-2 bg-f1-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Compare'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Model Accuracy Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                {Object.entries(modelPerformance)
                    .sort(([, a], [, b]) => b.auc - a.auc)
                    .map(([model, perf]) => (
                        <div key={model} className={`rounded-lg p-4 ${predictions[model] ? 'bg-white shadow' : 'bg-f1-gray-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg uppercase">{model}</h3>
                                {perf.auc > 0.9 && <Award className="w-5 h-5 text-yellow-500" />}
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-f1-gray-600">AUC</span>
                                    <span className="font-bold">{(perf.auc * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-f1-gray-600">Brier</span>
                                    <span>{perf.brier.toFixed(3)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-f1-gray-600">ECE</span>
                                    <span>{perf.ece.toFixed(3)}</span>
                                </div>
                            </div>
                            <div className="mt-2 h-2 bg-f1-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-f1-red"
                                    style={{ width: `${perf.auc * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
            </div>

            {/* Prediction Comparison Table */}
            {Object.keys(predictions).length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 bg-f1-gray-900 text-white">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Win Probability Comparison
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-f1-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Driver</th>
                                    {Object.keys(predictions).map(model => (
                                        <th key={model} className="px-4 py-3 text-center font-medium uppercase">
                                            {model}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center font-medium bg-f1-gray-200">Average</th>
                                    <th className="px-4 py-3 text-center font-medium bg-f1-gray-200">Std Dev</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {allDrivers.slice(0, 10).map(driver => {
                                    const probs = Object.values(predictions).map(p => p.win_prob?.[driver] || 0)
                                    const avg = probs.reduce((a, b) => a + b, 0) / probs.length
                                    const variance = probs.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / probs.length
                                    const stdDev = Math.sqrt(variance)

                                    return (
                                        <tr key={driver} className="hover:bg-f1-gray-50">
                                            <td className="px-4 py-3 font-bold">{driver}</td>
                                            {Object.entries(predictions).map(([model, pred]) => {
                                                const prob = pred.win_prob?.[driver] || 0
                                                const isMax = prob === Math.max(...probs)
                                                return (
                                                    <td
                                                        key={model}
                                                        className={`px-4 py-3 text-center ${isMax ? 'bg-green-50 font-bold text-green-700' : ''}`}
                                                    >
                                                        {(prob * 100).toFixed(1)}%
                                                    </td>
                                                )
                                            })}
                                            <td className="px-4 py-3 text-center font-bold bg-f1-gray-100">
                                                {(avg * 100).toFixed(1)}%
                                            </td>
                                            <td className="px-4 py-3 text-center bg-f1-gray-100">
                                                ±{(stdDev * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-f1-red" />
                </div>
            )}
        </div>
    )
}
