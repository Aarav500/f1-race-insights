'use client'

import { useState, useEffect } from 'react'
import { getRacePrediction, PredictionResponse, getModels, ModelInfo } from '@/utils/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function RaceExplorerPage() {
    const [raceId, setRaceId] = useState('2024_01')
    const [model, setModel] = useState('xgb')
    const [models, setModels] = useState<ModelInfo[]>([])
    const [modelsLoading, setModelsLoading] = useState(true)
    const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadModels()
    }, [])

    const loadModels = async () => {
        try {
            const data = await getModels()
            setModels(data.models)
        } catch (err) {
            console.error('Failed to load models:', err)
            // Fallback to hardcoded list
            setModels([
                { id: 'xgb', name: 'XGBoost', type: 'gradient_boosting', description: '', supports_shap: true, supports_counterfactual: true },
                { id: 'lgbm', name: 'LightGBM', type: 'gradient_boosting', description: '', supports_shap: true, supports_counterfactual: true },
                { id: 'cat', name: 'CatBoost', type: 'gradient_boosting', description: '', supports_shap: true, supports_counterfactual: true },
                { id: 'nbt_tlf', name: 'NBT-TLF', type: 'neural_ranking', description: '', supports_shap: false, supports_counterfactual: true },
                { id: 'lr', name: 'Logistic Regression', type: 'linear', description: '', supports_shap: false, supports_counterfactual: true },
                { id: 'rf', name: 'Random Forest', type: 'ensemble', description: '', supports_shap: true, supports_counterfactual: true },
                { id: 'quali_freq', name: 'Qualifying Frequency', type: 'baseline', description: '', supports_shap: false, supports_counterfactual: false },
                { id: 'elo', name: 'Elo Rating', type: 'baseline', description: '', supports_shap: false, supports_counterfactual: false },
            ])
        } finally {
            setModelsLoading(false)
        }
    }

    const handlePredict = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getRacePrediction(raceId, model)
            setPrediction(data)
        } catch (err: any) {
            setError(err.message || 'Failed to load predictions')
        } finally {
            setLoading(false)
        }
    }

    // Prepare chart data
    const chartData = prediction
        ? Object.entries(prediction.win_prob)
            .map(([driver, winProb]) => ({
                driver,
                winProb: (winProb * 100).toFixed(1),
                podiumProb: ((prediction.podium_prob[driver] || 0) * 100).toFixed(1),
            }))
            .sort((a, b) => parseFloat(b.winProb) - parseFloat(a.winProb))
        : []

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-f1-black">Race Explorer</h1>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-f1-gray-700">
                            Race ID
                        </label>
                        <input
                            type="text"
                            value={raceId}
                            onChange={(e) => setRaceId(e.target.value)}
                            className="w-full px-4 py-2 border border-f1-gray-300 rounded-lg focus:ring-2 focus:ring-f1-red focus:border-transparent"
                            placeholder="e.g., 2024_01"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-f1-gray-700">
                            Model
                        </label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            disabled={modelsLoading}
                            className="w-full px-4 py-2 border border-f1-gray-300 rounded-lg focus:ring-2 focus:ring-f1-red focus:border-transparent disabled:bg-f1-gray-100"
                        >
                            {modelsLoading ? (
                                <option>Loading models...</option>
                            ) : (
                                models.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handlePredict}
                            disabled={loading}
                            className="w-full bg-f1-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:bg-f1-gray-400"
                        >
                            {loading ? 'Loading...' : 'Get Predictions'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
                    {error}
                </div>
            )}

            {/* Results */}
            {prediction && (
                <div className="space-y-8">
                    {/* Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold mb-4 text-f1-black">Win & Podium Probabilities</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="driver" />
                                <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="winProb" fill="#E10600" name="Win Probability" />
                                <Bar dataKey="podiumProb" fill="#15151E" name="Podium Probability" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-f1-gray-900 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left">Driver</th>
                                    <th className="px-6 py-3 text-right">Win Prob</th>
                                    <th className="px-6 py-3 text-right">Podium Prob</th>
                                    <th className="px-6 py-3 text-right">Expected Finish</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-f1-gray-200">
                                {chartData.map((row) => (
                                    <tr key={row.driver} className="hover:bg-f1-gray-50">
                                        <td className="px-6 py-4 font-medium">{row.driver}</td>
                                        <td className="px-6 py-4 text-right">{row.winProb}%</td>
                                        <td className="px-6 py-4 text-right">{row.podiumProb}%</td>
                                        <td className="px-6 py-4 text-right">
                                            {prediction.expected_finish[row.driver]?.toFixed(1) || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Metadata */}
                    <div className="bg-f1-gray-100 rounded-lg p-4 text-sm text-f1-gray-700">
                        <p><strong>Race ID:</strong> {prediction.race_id}</p>
                        <p><strong>Model:</strong> {prediction.model_name}</p>
                        <p><strong>Generated:</strong> {new Date(prediction.generated_at).toLocaleString()}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
