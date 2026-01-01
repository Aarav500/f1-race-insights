'use client'

import { useState, useEffect } from 'react'
import { postCounterfactual, CounterfactualResponse, getMetaModels, MetaModelInfo } from '@/utils/api'
import { ArrowLeft, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CounterfactualPage({ params }: { params: { raceId: string; driverId: string } }) {
    const { raceId, driverId } = params
    const [model, setModel] = useState('xgb')
    const [models, setModels] = useState<MetaModelInfo[]>([])
    const [modelsLoading, setModelsLoading] = useState(true)
    const [changes, setChanges] = useState({
        qualifying_position_delta: 0,
        driver_form_delta: 0,
        constructor_form_delta: 0,
        reliability_risk_delta: 0,
    })
    const [result, setResult] = useState<CounterfactualResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch available models on mount
    useEffect(() => {
        loadModels()
    }, [])

    const loadModels = async () => {
        try {
            const data = await getMetaModels()
            // Filter for models that are likely to support counterfactuals (tree-based and neural models)
            const counterfactualModels = data.models.filter(m =>
                !m.type.includes('Baseline')
            )
            setModels(counterfactualModels)
        } catch (err) {
            console.error('Failed to load models:', err)
            setModels([
                { model_id: 'xgb', display_name: 'XGBoost', type: 'Gradient Boosting', interpretable: '✓ (SHAP)', speed: 'Fast', metrics: { overall: { accuracy: 0.72, logloss: 0.85, brier: 0.18 }, win: null, podium: null } },
                { model_id: 'lgbm', display_name: 'LightGBM', type: 'Gradient Boosting', interpretable: '✓ (SHAP)', speed: 'Fast', metrics: { overall: { accuracy: 0.71, logloss: 0.87, brier: 0.19 }, win: null, podium: null } },
            ])
        } finally {
            setModelsLoading(false)
        }
    }

    const handleSubmit = async () => {
        // Only send non-zero changes
        const activeChanges = Object.fromEntries(
            Object.entries(changes).filter(([_, value]) => value !== 0)
        )

        if (Object.keys(activeChanges).length === 0) {
            setError('Please make at least one change')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const data = await postCounterfactual(raceId, driverId, activeChanges, model)
            setResult(data)
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to compute counterfactual')
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
                <h1 className="text-4xl font-bold text-f1-black">Counterfactual Analysis</h1>
                <p className="text-f1-gray-600">What-if scenario for {driverId} in {raceId}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Controls */}
                <div className="space-y-6">
                    {/* Model Selector */}
                    <div className="bg-white rounded-lg shadow p-6">
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
                                    <option key={m.model_id} value={m.model_id}>{m.display_name}</option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Change Controls */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 text-f1-black">Modify Features</h2>
                        <div className="space-y-4">
                            <SliderControl
                                label="Qualifying Position Delta"
                                hint="Negative = improvement"
                                value={changes.qualifying_position_delta}
                                onChange={(v) => setChanges({ ...changes, qualifying_position_delta: v })}
                                min={-10}
                                max={10}
                                step={1}
                            />

                            <SliderControl
                                label="Driver Form Delta"
                                hint="0.1 = 10% improvement"
                                value={changes.driver_form_delta}
                                onChange={(v) => setChanges({ ...changes, driver_form_delta: v })}
                                min={-0.5}
                                max={0.5}
                                step={0.1}
                            />

                            <SliderControl
                                label="Constructor Form Delta"
                                hint="Team performance change"
                                value={changes.constructor_form_delta}
                                onChange={(v) => setChanges({ ...changes, constructor_form_delta: v })}
                                min={-0.5}
                                max={0.5}
                                step={0.1}
                            />

                            <SliderControl
                                label="Reliability Risk Delta"
                                hint="± DNF probability"
                                value={changes.reliability_risk_delta}
                                onChange={(v) => setChanges({ ...changes, reliability_risk_delta: v })}
                                min={-0.2}
                                max={0.2}
                                step={0.01}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full mt-6 bg-f1-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:bg-f1-gray-400 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Computing...
                                </>
                            ) : (
                                <>
                                    Compute Counterfactual
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-900 font-medium">Error</p>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {result && (
                        <>
                            {/* Comparison */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold mb-4 text-f1-black">Baseline vs Counterfactual</h2>
                                <div className="space-y-4">
                                    <ComparisonRow
                                        label="Win Probability"
                                        baseline={result.baseline.win_prob * 100}
                                        counterfactual={result.counterfactual.win_prob * 100}
                                        delta={result.delta.win_prob * 100}
                                    />
                                    <ComparisonRow
                                        label="Podium Probability"
                                        baseline={result.baseline.podium_prob * 100}
                                        counterfactual={result.counterfactual.podium_prob * 100}
                                        delta={result.delta.podium_prob * 100}
                                    />
                                    <ComparisonRow
                                        label="Expected Finish"
                                        baseline={result.baseline.expected_finish}
                                        counterfactual={result.counterfactual.expected_finish}
                                        delta={result.delta.expected_finish}
                                    />
                                </div>
                            </div>

                            {/* Changes Applied */}
                            <div className="bg-f1-gray-100 rounded-lg p-4">
                                <h3 className="font-bold mb-2 text-f1-black">Changes Applied</h3>
                                <div className="space-y-1 text-sm">
                                    {Object.entries(result.changes).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-f1-gray-700">{key.replace(/_/g, ' ')}:</span>
                                            <span className="font-medium text-f1-black">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function SliderControl({ label, hint, value, onChange, min, max, step }: {
    label: string
    hint: string
    value: number
    onChange: (value: number) => void
    min: number
    max: number
    step: number
}) {
    return (
        <div>
            <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-f1-gray-700">{label}</label>
                <span className="text-sm font-bold text-f1-black">{value.toFixed(step < 1 ? 2 : 0)}</span>
            </div>
            <input
                type="range"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                min={min}
                max={max}
                step={step}
                className="w-full h-2 bg-f1-gray-200 rounded-lg appearance-none cursor-pointer accent-f1-red"
            />
            <p className="text-xs text-f1-gray-500 mt-1">{hint}</p>
        </div>
    )
}

function ComparisonRow({ label, baseline, counterfactual, delta }: {
    label: string
    baseline: number
    counterfactual: number
    delta: number
}) {
    const isPositive = delta > 0
    const deltaColor = isPositive ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-f1-gray-600'

    return (
        <div className="border-b border-f1-gray-200 pb-3 last:border-0">
            <div className="font-medium text-f1-black mb-2">{label}</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                    <div className="text-f1-gray-600">Baseline</div>
                    <div className="font-bold">{baseline.toFixed(2)}{label.includes('Probability') ? '%' : ''}</div>
                </div>
                <div>
                    <div className="text-f1-gray-600">Counterfactual</div>
                    <div className="font-bold">{counterfactual.toFixed(2)}{label.includes('Probability') ? '%' : ''}</div>
                </div>
                <div>
                    <div className="text-f1-gray-600">Delta</div>
                    <div className={`font-bold ${deltaColor}`}>
                        {isPositive && '+'}{delta.toFixed(2)}{label.includes('Probability') ? '%' : ''}
                    </div>
                </div>
            </div>
        </div>
    )
}
