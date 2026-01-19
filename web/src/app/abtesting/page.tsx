'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GitBranch, TrendingUp, TrendingDown, CheckCircle, XCircle, BarChart3, Target, Zap, AlertTriangle } from 'lucide-react'

// A/B Test configurations
const AB_TESTS = [
    {
        id: 'ensemble-v2',
        name: 'Ensemble v2 vs v1',
        status: 'running',
        startDate: '2024-12-01',
        traffic: { control: 50, treatment: 50 },
        description: 'Testing new stacking ensemble with calibrated probabilities',
        control: {
            name: 'Ensemble v1',
            version: '1.3.2',
            auc: 0.978,
            brier: 0.032,
            logLoss: 0.145,
            accuracy: 0.891,
        },
        treatment: {
            name: 'Ensemble v2',
            version: '2.0.0-beta',
            auc: 0.987,
            brier: 0.024,
            logLoss: 0.112,
            accuracy: 0.912,
        },
        sampleSize: { control: 1245, treatment: 1198 },
        pValue: 0.023,
        significant: true,
    },
    {
        id: 'weather-features',
        name: 'Weather Feature Enhancement',
        status: 'completed',
        startDate: '2024-11-15',
        traffic: { control: 50, treatment: 50 },
        description: 'Adding detailed weather conditions as input features',
        control: {
            name: 'Without Weather',
            version: '1.2.0',
            auc: 0.965,
            brier: 0.041,
            logLoss: 0.178,
            accuracy: 0.875,
        },
        treatment: {
            name: 'With Weather',
            version: '1.3.0',
            auc: 0.978,
            brier: 0.032,
            logLoss: 0.145,
            accuracy: 0.891,
        },
        sampleSize: { control: 2500, treatment: 2478 },
        pValue: 0.001,
        significant: true,
    },
    {
        id: 'lr-vs-rf',
        name: 'LR vs Random Forest',
        status: 'completed',
        startDate: '2024-10-20',
        traffic: { control: 50, treatment: 50 },
        description: 'Comparing Logistic Regression baseline to Random Forest',
        control: {
            name: 'Logistic Regression',
            version: '1.0.0',
            auc: 0.842,
            brier: 0.098,
            logLoss: 0.312,
            accuracy: 0.782,
        },
        treatment: {
            name: 'Random Forest',
            version: '1.0.0',
            auc: 0.923,
            brier: 0.056,
            logLoss: 0.198,
            accuracy: 0.854,
        },
        sampleSize: { control: 3200, treatment: 3180 },
        pValue: 0.0001,
        significant: true,
    },
]

const METRICS = ['auc', 'brier', 'logLoss', 'accuracy'] as const
const METRIC_LABELS: Record<string, string> = {
    auc: 'AUC Score',
    brier: 'Brier Score',
    logLoss: 'Log Loss',
    accuracy: 'Accuracy',
}
const HIGHER_BETTER: Record<string, boolean> = {
    auc: true,
    brier: false,
    logLoss: false,
    accuracy: true,
}

export default function ABTestingPage() {
    const [selectedTest, setSelectedTest] = useState('ensemble-v2')

    const test = AB_TESTS.find(t => t.id === selectedTest)!

    const getImprovementColor = (control: number, treatment: number, higherBetter: boolean) => {
        const improved = higherBetter ? treatment > control : treatment < control
        return improved ? 'text-green-600' : 'text-red-600'
    }

    const getImprovement = (control: number, treatment: number, higherBetter: boolean) => {
        const diff = treatment - control
        const pctChange = ((diff / control) * 100).toFixed(1)
        const improved = higherBetter ? diff > 0 : diff < 0
        return { diff: diff.toFixed(4), pct: pctChange, improved }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <GitBranch className="w-10 h-10 text-indigo-600" />
                    A/B Model Testing
                </h1>
                <p className="text-f1-gray-600">
                    Compare model versions with statistical rigor
                </p>
            </div>

            {/* Test Selector */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                {AB_TESTS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setSelectedTest(t.id)}
                        className={`p-4 rounded-lg text-left transition ${selectedTest === t.id
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white border border-f1-gray-200 hover:shadow-md'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-bold">{t.name}</div>
                            <div className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'running'
                                    ? (selectedTest === t.id ? 'bg-white/20' : 'bg-green-100 text-green-800')
                                    : (selectedTest === t.id ? 'bg-white/20' : 'bg-gray-100 text-gray-600')
                                }`}>
                                {t.status === 'running' ? '● Running' : '✓ Complete'}
                            </div>
                        </div>
                        <div className={`text-sm ${selectedTest === t.id ? 'opacity-75' : 'text-f1-gray-500'}`}>
                            {t.description}
                        </div>
                    </button>
                ))}
            </div>

            {/* Test Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">{test.name}</h2>
                        <p className="opacity-75 mt-1">{test.description}</p>
                        <div className="flex gap-4 mt-3 text-sm">
                            <span>Started: {test.startDate}</span>
                            <span>•</span>
                            <span>Traffic: {test.traffic.control}/{test.traffic.treatment}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-75">p-value</div>
                        <div className="text-3xl font-mono font-bold">{test.pValue.toFixed(4)}</div>
                        <div className={`text-sm ${test.pValue < 0.05 ? 'text-green-300' : 'text-yellow-300'}`}>
                            {test.pValue < 0.05 ? '✓ Statistically Significant' : '○ Not Significant'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Comparison */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="p-4 bg-f1-gray-100 border-b">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        Metrics Comparison
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-f1-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-left">Metric</th>
                                <th className="p-4 text-center">Control<br /><span className="text-xs font-normal text-f1-gray-500">{test.control.name}</span></th>
                                <th className="p-4 text-center">Treatment<br /><span className="text-xs font-normal text-f1-gray-500">{test.treatment.name}</span></th>
                                <th className="p-4 text-center">Improvement</th>
                                <th className="p-4 text-center">Winner</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {METRICS.map(metric => {
                                const control = test.control[metric]
                                const treatment = test.treatment[metric]
                                const higherBetter = HIGHER_BETTER[metric]
                                const improvement = getImprovement(control, treatment, higherBetter)

                                return (
                                    <tr key={metric}>
                                        <td className="p-4 font-bold">{METRIC_LABELS[metric]}</td>
                                        <td className="p-4 text-center font-mono">{control.toFixed(4)}</td>
                                        <td className="p-4 text-center font-mono">{treatment.toFixed(4)}</td>
                                        <td className={`p-4 text-center font-bold ${getImprovementColor(control, treatment, higherBetter)}`}>
                                            {improvement.improved ? (
                                                <span className="flex items-center justify-center gap-1">
                                                    <TrendingUp className="w-4 h-4" />
                                                    {improvement.pct}%
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-1">
                                                    <TrendingDown className="w-4 h-4" />
                                                    {improvement.pct}%
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {improvement.improved ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sample Size */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Sample Distribution
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Control ({test.control.name})</span>
                                <span className="font-bold">{test.sampleSize.control.toLocaleString()} samples</span>
                            </div>
                            <div className="h-4 bg-f1-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${(test.sampleSize.control / (test.sampleSize.control + test.sampleSize.treatment)) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Treatment ({test.treatment.name})</span>
                                <span className="font-bold">{test.sampleSize.treatment.toLocaleString()} samples</span>
                            </div>
                            <div className="h-4 bg-f1-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: `${(test.sampleSize.treatment / (test.sampleSize.control + test.sampleSize.treatment)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Recommendation
                    </h3>
                    {test.significant ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-800 font-bold mb-2">
                                <CheckCircle className="w-5 h-5" />
                                Promote to Production
                            </div>
                            <p className="text-sm text-green-700">
                                The treatment model ({test.treatment.name}) shows statistically significant
                                improvements across all key metrics with p-value = {test.pValue.toFixed(4)}.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-yellow-800 font-bold mb-2">
                                <AlertTriangle className="w-5 h-5" />
                                Continue Experiment
                            </div>
                            <p className="text-sm text-yellow-700">
                                Results not yet statistically significant. Continue collecting data
                                before making a decision.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/training" className="bg-f1-gray-900 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-700 transition">
                    Training Viz
                </Link>
                <Link href="/compare" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Compare All Models
                </Link>
            </div>
        </div>
    )
}
