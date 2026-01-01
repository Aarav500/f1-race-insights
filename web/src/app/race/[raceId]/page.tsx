'use client'

import { useState, useEffect } from 'react'
import { getRacePrediction, PredictionResponse, getMetaModels, MetaModelInfo } from '@/utils/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RacePage({ params }: { params: { raceId: string } }) {
    const { raceId } = params
    const [model, setModel] = useState('xgb')
    const [models, setModels] = useState<MetaModelInfo[]>([])
    const [modelsLoading, setModelsLoading] = useState(true)
    const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadModels()
    }, [])

    useEffect(() => {
        loadPrediction()
    }, [raceId, model])

    const loadModels = async () => {
        try {
            const data = await getMetaModels()
            setModels(data.models)
        } catch (err) {
            console.error('Failed to load models:', err)
            // Fallback to hardcoded list if API fails
            setModels([
                { model_id: 'xgb', display_name: 'XGBoost', type: 'Gradient Boosting', interpretable: '✓ (SHAP)', speed: 'Fast', metrics: { overall: { accuracy: 0.72, logloss: 0.85, brier: 0.18 }, win: null, podium: null } },
                { model_id: 'lgbm', display_name: 'LightGBM', type: 'Gradient Boosting', interpretable: '✓ (SHAP)', speed: 'Fast', metrics: { overall: { accuracy: 0.71, logloss: 0.87, brier: 0.19 }, win: null, podium: null } },
            ])
        } finally {
            setModelsLoading(false)
        }
    }

    const loadPrediction = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getRacePrediction(raceId, model)
            setPrediction(data)
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to load predictions')
        } finally {
            setLoading(false)
        }
    }

    // Sort drivers by win probability
    const sortedDrivers = prediction
        ? Object.entries(prediction.win_prob)
            .map(([driver, winProb]) => ({
                driver,
                winProb: winProb * 100,
                podiumProb: (prediction.podium_prob[driver] || 0) * 100,
                expectedFinish: prediction.expected_finish[driver] || 0,
            }))
            .sort((a, b) => b.winProb - a.winProb)
        : []

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link href="/" className="text-f1-red hover:underline flex items-center gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
                <h1 className="text-4xl font-bold text-f1-black">Race Predictions</h1>
                <p className="text-f1-gray-600">Race ID: {raceId}</p>
            </div>

            {/* Model Selector */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <label className="block text-sm font-medium mb-2 text-f1-gray-700">
                    Select Model
                </label>
                <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={modelsLoading}
                    className="w-full md:w-64 px-4 py-2 border border-f1-gray-300 rounded-lg focus:ring-2 focus:ring-f1-red focus:border-transparent disabled:bg-f1-gray-100"
                >
                    {modelsLoading ? (
                        <option>Loading models...</option>
                    ) : (
                        models.map((m) => (
                            <option key={m.model_id} value={m.model_id}>{m.display_name}</option>
                        ))
                    )}
                </select>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-f1-red" />
                    <span className="ml-3 text-f1-gray-600">Loading predictions...</span>
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
            {!loading && !error && prediction && (
                <div className="space-y-6">
                    {/* Win Probability Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold mb-4 text-f1-black">Win Probability</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={sortedDrivers}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="driver" />
                                <YAxis label={{ value: '%', angle: 0, position: 'insideTopLeft' }} />
                                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                                <Legend />
                                <Bar dataKey="winProb" fill="#E10600" name="Win Probability (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Podium Probability Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold mb-4 text-f1-black">Podium Probability</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={sortedDrivers}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="driver" />
                                <YAxis label={{ value: '%', angle: 0, position: 'insideTopLeft' }} />
                                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                                <Legend />
                                <Bar dataKey="podiumProb" fill="#15151E" name="Podium Probability (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Expected Finish Table (Sorted) */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <h2 className="text-2xl font-bold p-6 pb-4 text-f1-black">Expected Finish Positions</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-f1-gray-900 text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Rank</th>
                                        <th className="px-6 py-3 text-left">Driver</th>
                                        <th className="px-6 py-3 text-right">Win Prob</th>
                                        <th className="px-6 py-3 text-right">Podium Prob</th>
                                        <th className="px-6 py-3 text-right">Expected Finish</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-f1-gray-200">
                                    {sortedDrivers.map((row, idx) => (
                                        <tr key={row.driver} className="hover:bg-f1-gray-50">
                                            <td className="px-6 py-4 font-medium">{idx + 1}</td>
                                            <td className="px-6 py-4 font-bold">{row.driver}</td>
                                            <td className="px-6 py-4 text-right">{row.winProb.toFixed(2)}%</td>
                                            <td className="px-6 py-4 text-right">{row.podiumProb.toFixed(2)}%</td>
                                            <td className="px-6 py-4 text-right">{row.expectedFinish.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-f1-gray-100 rounded-lg p-4 text-sm">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <span className="font-medium">Race ID:</span> {prediction.race_id}
                            </div>
                            <div>
                                <span className="font-medium">Model:</span> {prediction.model_name}
                            </div>
                            <div>
                                <span className="font-medium">Generated:</span> {new Date(prediction.generated_at).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Action Links */}
                    <div className="flex gap-4">
                        <Link
                            href={`/explain/${raceId}`}
                            className="bg-f1-black text-white px-6 py-3 rounded-lg hover:bg-f1-gray-800 transition"
                        >
                            View Explanations
                        </Link>
                        <Link
                            href={`/counterfactual/${raceId}/${sortedDrivers[0]?.driver || 'VER'}`}
                            className="border border-f1-gray-300 text-f1-black px-6 py-3 rounded-lg hover:bg-f1-gray-100 transition"
                        >
                            Counterfactual Analysis
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
