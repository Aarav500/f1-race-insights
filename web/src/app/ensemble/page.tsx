'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Layers, ArrowRight, Brain, Target, Zap, ChevronDown, ChevronRight, TrendingUp, Sparkles, BarChart3, Activity, Cpu } from 'lucide-react'

// Base models in the ensemble
const BASE_MODELS = [
    { id: 'xgb', name: 'XGBoost', auc: 0.983, weight: 0.22, color: '#22C55E', type: 'Gradient Boosting' },
    { id: 'cat', name: 'CatBoost', auc: 0.985, weight: 0.20, color: '#3B82F6', type: 'Gradient Boosting' },
    { id: 'lgbm', name: 'LightGBM', auc: 0.975, weight: 0.15, color: '#8B5CF6', type: 'Gradient Boosting' },
    { id: 'rf', name: 'Random Forest', auc: 0.985, weight: 0.18, color: '#F59E0B', type: 'Bagging' },
    { id: 'lr', name: 'Logistic Reg', auc: 0.987, weight: 0.12, color: '#EF4444', type: 'Linear' },
    { id: 'nbt', name: 'NBT-TLF', auc: 0.950, weight: 0.08, color: '#EC4899', type: 'Neural' },
    { id: 'quali', name: 'QualiFreq', auc: 0.981, weight: 0.03, color: '#6B7280', type: 'Baseline' },
    { id: 'elo', name: 'Elo', auc: 0.440, weight: 0.02, color: '#374151', type: 'Baseline' },
]

const META_LEARNER = {
    name: 'Logistic Regression Meta-Learner',
    description: 'Learns optimal combination of base model predictions',
    features: ['Base model probabilities', 'Model confidence scores', 'Prediction variance'],
    auc: 0.991,
}

// Cross-validation scheme
const CV_FOLDS = [
    { fold: 1, train: '2016-2020', val: '2021', trainSize: 3200, valSize: 420 },
    { fold: 2, train: '2016-2021', val: '2022', trainSize: 3620, valSize: 440 },
    { fold: 3, train: '2016-2022', val: '2023', trainSize: 4060, valSize: 460 },
    { fold: 4, train: '2016-2023', val: '2024', trainSize: 4520, valSize: 480 },
    { fold: 5, train: '2016-2024', val: '2025', trainSize: 5000, valSize: 500 },
]

export default function EnsemblePage() {
    const [selectedMethod, setSelectedMethod] = useState<'stacking' | 'averaging' | 'voting'>('stacking')
    const [showWeights, setShowWeights] = useState(true)

    const totalWeight = BASE_MODELS.reduce((sum, m) => sum + m.weight, 0)

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Layers className="w-8 h-8" />
                        Ensemble Stacking Visualization
                    </h1>
                    <p className="text-white/80 mt-1">
                        Model Pyramid • Weight Distribution • Meta-Learner Architecture
                    </p>
                </div>
            </div>

            {/* Beyond F1 Banner */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-y border-purple-500/30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                        <div>
                            <span className="text-yellow-400 font-bold">State-of-the-Art Ensemble:</span>
                            <span className="text-white/80 ml-2">Two-layer stacking with meta-learner achieves 0.991 AUC - higher than any individual model.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Ensemble Method Selector */}
                <div className="flex gap-4 mb-8 justify-center">
                    {[
                        { id: 'stacking', label: 'Stacking', desc: 'Meta-learner on predictions' },
                        { id: 'averaging', label: 'Averaging', desc: 'Weighted mean' },
                        { id: 'voting', label: 'Voting', desc: 'Majority vote' },
                    ].map(method => (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id as typeof selectedMethod)}
                            className={`px-6 py-4 rounded-xl transition ${selectedMethod === method.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-f1-gray-800 text-f1-gray-400 hover:bg-f1-gray-700'
                                }`}
                        >
                            <div className="font-bold">{method.label}</div>
                            <div className="text-xs opacity-70">{method.desc}</div>
                        </button>
                    ))}
                </div>

                {/* Stacking Pyramid Visualization */}
                <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-400" />
                        Stacking Architecture
                    </h2>

                    <div className="relative">
                        {/* Meta-Learner (Top) */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-center w-72">
                                <div className="text-2xl font-bold text-white">Meta-Learner</div>
                                <div className="text-white/80 text-sm">{META_LEARNER.name}</div>
                                <div className="text-3xl font-bold text-white mt-2">{META_LEARNER.auc.toFixed(3)}</div>
                                <div className="text-white/60 text-xs">Final AUC</div>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center mb-4">
                            <div className="flex flex-col items-center text-f1-gray-500">
                                <div className="text-xs mb-1">Combines Predictions</div>
                                <ChevronDown className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Base Models (Bottom) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {BASE_MODELS.map(model => (
                                <div
                                    key={model.id}
                                    className="bg-f1-gray-700 rounded-xl p-4 border border-f1-gray-600 hover:border-purple-500/50 transition"
                                    style={{ borderLeftColor: model.color, borderLeftWidth: '4px' }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-white">{model.name}</div>
                                        <div className="text-xs bg-f1-gray-600 px-2 py-0.5 rounded text-f1-gray-300">{model.type}</div>
                                    </div>
                                    <div className="text-2xl font-bold text-green-400">{model.auc.toFixed(3)}</div>
                                    <div className="text-xs text-f1-gray-500 mb-2">AUC Score</div>
                                    {showWeights && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-f1-gray-400">Weight</span>
                                                <span className="text-purple-400 font-bold">{(model.weight * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 bg-f1-gray-600 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{ width: `${(model.weight / 0.25) * 100}%`, backgroundColor: model.color }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Weight Distribution Chart */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            Model Weight Distribution
                        </h3>
                        <div className="space-y-3">
                            {[...BASE_MODELS].sort((a, b) => b.weight - a.weight).map(model => (
                                <div key={model.id} className="flex items-center gap-3">
                                    <div className="w-20 text-sm text-white font-medium">{model.name}</div>
                                    <div className="flex-1 h-6 bg-f1-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full flex items-center justify-end pr-2 text-xs text-white font-bold"
                                            style={{ width: `${(model.weight / 0.25) * 100}%`, backgroundColor: model.color }}
                                        >
                                            {(model.weight * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-f1-gray-700/50 rounded-lg text-sm text-f1-gray-400">
                            <strong className="text-white">Note:</strong> Weights are learned via cross-validation to minimize ensemble error
                        </div>
                    </div>

                    <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-400" />
                            Performance Comparison
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-4 border border-yellow-500/30">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-white">Stacked Ensemble</div>
                                        <div className="text-xs text-f1-gray-400">Meta-learner combination</div>
                                    </div>
                                    <div className="text-3xl font-bold text-yellow-400">{META_LEARNER.auc.toFixed(3)}</div>
                                </div>
                            </div>
                            <div className="bg-f1-gray-700 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-white">Best Single Model (LR)</div>
                                        <div className="text-xs text-f1-gray-400">Logistic Regression alone</div>
                                    </div>
                                    <div className="text-3xl font-bold text-green-400">0.987</div>
                                </div>
                            </div>
                            <div className="bg-f1-gray-700 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-white">Simple Average</div>
                                        <div className="text-xs text-f1-gray-400">Equal weight combination</div>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-400">0.985</div>
                                </div>
                            </div>
                            <div className="text-center text-sm text-green-400 font-bold">
                                Stacking provides +0.4% improvement over best single model
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cross-Validation Scheme */}
                <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700 mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        Time-Series Cross-Validation Scheme
                    </h3>
                    <p className="text-f1-gray-400 text-sm mb-4">
                        We use expanding window validation to prevent data leakage and respect temporal ordering
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-f1-gray-700">
                                    <th className="py-3 px-4 text-f1-gray-400">Fold</th>
                                    <th className="py-3 px-4 text-f1-gray-400">Training Period</th>
                                    <th className="py-3 px-4 text-f1-gray-400">Validation Year</th>
                                    <th className="py-3 px-4 text-f1-gray-400">Train Size</th>
                                    <th className="py-3 px-4 text-f1-gray-400">Val Size</th>
                                    <th className="py-3 px-4 text-f1-gray-400">Visualization</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CV_FOLDS.map(fold => (
                                    <tr key={fold.fold} className="border-b border-f1-gray-700/50">
                                        <td className="py-3 px-4 font-bold text-white">Fold {fold.fold}</td>
                                        <td className="py-3 px-4 text-green-400">{fold.train}</td>
                                        <td className="py-3 px-4 text-blue-400">{fold.val}</td>
                                        <td className="py-3 px-4 text-f1-gray-400">{fold.trainSize.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-f1-gray-400">{fold.valSize}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex h-4 rounded overflow-hidden">
                                                <div className="bg-green-500" style={{ width: `${(fold.trainSize / 5500) * 100}%` }} />
                                                <div className="bg-blue-500" style={{ width: `${(fold.valSize / 5500) * 100}%` }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex gap-4 mt-4 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500" />
                            <span className="text-sm text-f1-gray-400">Training Data</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500" />
                            <span className="text-sm text-f1-gray-400">Validation Data</span>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="flex gap-4 justify-center">
                    <Link href="/architecture" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-bold">
                        View All 8 Models
                    </Link>
                    <Link href="/ml-analytics" className="border border-f1-gray-500 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-800 transition font-bold">
                        ML Analytics
                    </Link>
                    <Link href="/" className="text-f1-gray-400 px-6 py-3 hover:text-white transition">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
