'use client'

import { useState, useEffect } from 'react'
import { getExplanation, getRacePrediction, ExplainResponse, PredictionResponse } from '@/utils/api'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ExplainPage({ params }: { params: { raceId: string } }) {
    const { raceId } = params
    const [model, setModel] = useState('xgb')
    const [driverId, setDriverId] = useState('VER')
    const [drivers, setDrivers] = useState<string[]>([])
    const [explanation, setExplanation] = useState<ExplainResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load available drivers from prediction
    useEffect(() => {
        loadDrivers()
    }, [raceId])

    // Load explanation when driver or model changes
    useEffect(() => {
        if (driverId) {
            loadExplanation()
        }
    }, [raceId, driverId, model])

    const loadDrivers = async () => {
        try {
            const prediction = await getRacePrediction(raceId, 'xgb')
            const driverList = Object.keys(prediction.win_prob)
            setDrivers(driverList)
            if (driverList.length > 0 && !driverId) {
                setDriverId(driverList[0])
            }
        } catch (err) {
            // Ignore error, will show in explanation load
        }
    }

    const loadExplanation = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getExplanation(raceId, driverId, model, 10)
            setExplanation(data)
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to load explanation')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link href={`/race/${raceId}`} className="text-f1-red hover:underline flex items-center gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Race Predictions
                </Link>
                <h1 className="text-4xl font-bold text-f1-black">Prediction Explanation</h1>
                <p className="text-f1-gray-600">Race ID: {raceId}</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-f1-gray-700">
                            Driver
                        </label>
                        <select
                            value={driverId}
                            onChange={(e) => setDriverId(e.target.value)}
                            className="w-full px-4 py-2 border border-f1-gray-300 rounded-lg focus:ring-2 focus:ring-f1-red focus:border-transparent"
                        >
                            {drivers.map((driver) => (
                                <option key={driver} value={driver}>{driver}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-f1-gray-700">
                            Model
                        </label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-4 py-2 border border-f1-gray-300 rounded-lg focus:ring-2 focus:ring-f1-red focus:border-transparent"
                        >
                            <option value="xgb">XGBoost (SHAP)</option>
                            <option value="lgbm">LightGBM (SHAP)</option>
                            <option value="cat">CatBoost (SHAP)</option>
                            <option value="lr">Logistic Regression</option>
                            <option value="rf">Random Forest</option>
                            <option value="nbt_tlf">NBT-TLF (Ablation)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-f1-red" />
                    <span className="ml-3 text-f1-gray-600">Loading explanation...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-900 font-medium">Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* Results */}
            {!loading && !error && explanation && (
                <div className="space-y-6">
                    {/* Explanation Info */}
                    <div className="bg-f1-gray-100 rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-2 text-f1-black">
                            Explaining prediction for {explanation.driver_id}
                        </h2>
                        <p className="text-f1-gray-700 text-sm">
                            {model === 'nbt_tlf'
                                ? 'Using component ablation to measure embedding contributions'
                                : model in ['xgb', 'lgbm', 'cat']
                                    ? 'Using SHAP (Shapley Additive exPlanations) values'
                                    : 'Using permutation importance'}
                        </p>
                    </div>

                    {/* Top Features */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold mb-4 text-f1-black">Top Contributing Features</h2>
                        <div className="space-y-3">
                            {explanation.top_features.map((feature, idx) => (
                                <FeatureBar
                                    key={idx}
                                    rank={idx + 1}
                                    name={feature.name}
                                    value={feature.value}
                                    impact={feature.impact}
                                    maxImpact={explanation.top_features[0]?.impact || 1}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-f1-gray-100 rounded-lg p-4 text-sm">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <span className="font-medium">Race ID:</span> {explanation.race_id}
                            </div>
                            <div>
                                <span className="font-medium">Driver:</span> {explanation.driver_id}
                            </div>
                            <div>
                                <span className="font-medium">Model:</span> {explanation.model_name}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function FeatureBar({ rank, name, value, impact, maxImpact }: {
    rank: number
    name: string
    value: number
    impact: number
    maxImpact: number
}) {
    const percentage = (impact / maxImpact) * 100

    return (
        <div className="border border-f1-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-f1-gray-500">#{rank}</span>
                    <span className="font-medium text-f1-black">{name}</span>
                </div>
                <div className="text-sm text-f1-gray-600">
                    Value: {typeof value === 'number' ? value.toFixed(2) : value}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex-1 bg-f1-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-f1-red h-full transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="text-sm font-medium text-f1-black w-20 text-right">
                    {impact.toFixed(4)}
                </span>
            </div>
        </div>
    )
}
