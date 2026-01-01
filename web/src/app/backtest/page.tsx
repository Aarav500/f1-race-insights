'use client'

import { useState, useEffect } from 'react'
import { getBacktestResults, BacktestResults } from '@/utils/api'

export default function BacktestPage() {
    const [results, setResults] = useState<BacktestResults | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadBacktest()
    }, [])

    const loadBacktest = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getBacktestResults()
            setResults(data)
        } catch (err: any) {
            const status = err.response?.status
            if (status === 404) {
                setError('No backtest report found. Run: python scripts/backtest.py --models all --task win')
            } else {
                setError(err.message || 'Failed to load backtest results')
            }
        } finally {
            setLoading(false)
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8 text-f1-black">Backtest Results</h1>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-f1-gray-700">Loading backtest results...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8 text-f1-black">Backtest Results</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <p className="text-f1-gray-700 mb-4">
                        View comprehensive backtest results comparing all models using walk-forward validation.
                    </p>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-900 font-medium mb-2">❌ {error}</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-900 font-medium mb-2">📊 To Generate Backtest Report</p>
                        <p className="text-blue-700 text-sm mb-2">
                            Run the backtest script to generate reports:
                        </p>
                        <code className="block bg-f1-gray-900 text-white p-3 rounded text-sm">
                            python scripts/backtest.py --models all --task win
                        </code>
                    </div>
                </div>

                <ModelInfo />
                <MetricsInfo />
            </div>
        )
    }

    // Success state with results
    const modelResults = results?.results || {}
    const config = results?.config || {}

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-f1-black">Backtest Results</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <p className="text-f1-gray-700 mb-4">
                    Comprehensive backtest results comparing all models using walk-forward validation.
                </p>
                <div className="text-sm text-f1-gray-600 space-y-1">
                    <p><strong>Generated:</strong> {new Date(results?.run_timestamp || '').toLocaleString()}</p>
                    {config.task && <p><strong>Task:</strong> {config.task}</p>}
                    {config.min_train_races && <p><strong>Min Training Races:</strong> {config.min_train_races}</p>}
                </div>
            </div>

            {/* Model Comparison Table */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-f1-black">Model Comparison</h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-f1-gray-900 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left">Model</th>
                                <th className="px-6 py-3 text-center">Accuracy</th>
                                <th className="px-6 py-3 text-center">AUC</th>
                                <th className="px-6 py-3 text-center">Log Loss</th>
                                <th className="px-6 py-3 text-center">Brier Score</th>
                                <th className="px-6 py-3 text-center">Races</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-f1-gray-200">
                            {Object.entries(modelResults).map(([modelName, metrics]: [string, any]) => (
                                <ModelResultRow key={modelName} name={modelName} metrics={metrics} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModelInfo />
            <MetricsInfo />
        </div>
    )
}

function ModelResultRow({ name, metrics }: { name: string; metrics: any }) {
    const formatMetric = (value: number | null | undefined, decimals: number = 3): string => {
        if (value === null || value === undefined || isNaN(value)) return 'N/A'
        return value.toFixed(decimals)
    }

    return (
        <tr className="hover:bg-f1-gray-50">
            <td className="px-6 py-4 font-medium">{name}</td>
            <td className="px-6 py-4 text-center">{formatMetric(metrics.accuracy)}</td>
            <td className="px-6 py-4 text-center">{formatMetric(metrics.auc)}</td>
            <td className="px-6 py-4 text-center">{formatMetric(metrics.logloss)}</td>
            <td className="px-6 py-4 text-center">{formatMetric(metrics.brier)}</td>
            <td className="px-6 py-4 text-center">{metrics.n_races || 'N/A'}</td>
        </tr>
    )
}

function ModelInfo() {
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-f1-black">8 Model Types</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModelCard title="Baselines" models={['Qualifying Freq', 'Elo Rating']} />
                <ModelCard title="Tree Models" models={['XGBoost', 'LightGBM', 'CatBoost']} />
                <ModelCard title="Linear/Ensemble" models={['Logistic Reg', 'Random Forest']} />
                <ModelCard title="Neural" models={['NBT-TLF']} />
            </div>
        </div>
    )
}

function ModelCard({ title, models }: { title: string; models: string[] }) {
    return (
        <div className="bg-f1-gray-100 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-f1-black">{title}</h3>
            <ul className="space-y-1">
                {models.map((model) => (
                    <li key={model} className="text-sm text-f1-gray-700">• {model}</li>
                ))}
            </ul>
        </div>
    )
}

function MetricsInfo() {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-f1-black">Evaluation Metrics</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <MetricCard
                    name="Accuracy"
                    description="Percentage of correct predictions (higher is better, baseline ~0.05 for 20-driver field)"
                />
                <MetricCard
                    name="AUC (ROC)"
                    description="Area Under the ROC Curve - measures discrimination (0.5=random, 1=perfect)"
                />
                <MetricCard
                    name="Log Loss"
                    description="Proper scoring rule for probabilistic predictions (lower is better, penalizes confident mistakes)"
                />
                <MetricCard
                    name="Brier Score"
                    description="Mean squared error of probability forecasts (0=perfect, 1=worst, lower is better)"
                />
            </div>
        </div>
    )
}

function MetricCard({ name, description }: { name: string; description: string }) {
    return (
        <div className="border border-f1-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2 text-f1-black">{name}</h3>
            <p className="text-f1-gray-700 text-sm">{description}</p>
        </div>
    )
}
