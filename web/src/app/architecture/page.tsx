'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cpu, Layers, Zap, Database, Brain, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react'

const MODELS = [
    {
        id: 'nbt_tlf',
        name: 'NBT-TLF',
        fullName: 'Neural Bradley-Terry with Temporal Latent Factors',
        type: 'Neural Network',
        complexity: 'High',
        auc: 0.950,
        description: 'Custom neural architecture for pairwise driver comparisons with temporal embeddings.',
        layers: [
            { name: 'Input Layer', nodes: 15, desc: 'Raw features (quali, form, etc.)' },
            { name: 'Driver Embedding', nodes: 32, desc: 'Learned driver representations' },
            { name: 'Constructor Embedding', nodes: 32, desc: 'Team strength encoding' },
            { name: 'Track Embedding', nodes: 32, desc: 'Circuit-specific factors' },
            { name: 'Temporal Encoder', nodes: 16, desc: 'Sinusoidal positional encoding' },
            { name: 'Hidden Layer 1', nodes: 64, desc: 'Feature combination' },
            { name: 'Hidden Layer 2', nodes: 32, desc: 'Abstraction' },
            { name: 'Output', nodes: 1, desc: 'Pairwise comparison score' },
        ]
    },
    {
        id: 'xgb',
        name: 'XGBoost',
        fullName: 'Extreme Gradient Boosting',
        type: 'Gradient Boosted Trees',
        complexity: 'Medium',
        auc: 0.983,
        description: 'Ensemble of decision trees with regularization and optimized hyperparameters.',
        params: [
            { name: 'n_estimators', value: 200 },
            { name: 'max_depth', value: 4 },
            { name: 'learning_rate', value: 0.05 },
            { name: 'subsample', value: 0.8 },
            { name: 'colsample_bytree', value: 0.8 },
            { name: 'reg_alpha', value: 0.1 },
            { name: 'reg_lambda', value: 1.0 },
        ]
    },
    {
        id: 'lr',
        name: 'Logistic Regression',
        fullName: 'L2-Regularized Logistic Regression',
        type: 'Linear Model',
        complexity: 'Low',
        auc: 0.987,
        description: 'Simple but effective baseline with strong regularization.',
        params: [
            { name: 'C', value: 0.5 },
            { name: 'class_weight', value: 'balanced' },
            { name: 'max_iter', value: 1000 },
        ]
    }
]

export default function ArchitecturePage() {
    const [selectedModel, setSelectedModel] = useState('nbt_tlf')
    const [expandedLayer, setExpandedLayer] = useState<number | null>(null)

    const model = MODELS.find(m => m.id === selectedModel)!

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Cpu className="w-10 h-10 text-blue-600" />
                    Model Architecture
                </h1>
                <p className="text-f1-gray-600">
                    Interactive visualization of our 8 ML model architectures
                </p>
            </div>

            {/* Model Selector */}
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
                {MODELS.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setSelectedModel(m.id)}
                        className={`px-6 py-3 rounded-lg font-medium transition ${selectedModel === m.id
                                ? 'bg-f1-gray-900 text-white'
                                : 'bg-white border border-f1-gray-300 hover:bg-f1-gray-50'
                            }`}
                    >
                        {m.name}
                        <span className="text-xs ml-2 opacity-75">AUC: {m.auc.toFixed(3)}</span>
                    </button>
                ))}
            </div>

            {/* Model Info */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 mb-8 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold">{model.fullName}</h2>
                        <p className="text-white/75 mt-1">{model.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-green-400">{model.auc.toFixed(3)}</div>
                        <div className="text-sm opacity-75">AUC Score</div>
                    </div>
                </div>
                <div className="flex gap-4 mt-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{model.type}</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Complexity: {model.complexity}</span>
                </div>
            </div>

            {/* Architecture Visualization */}
            {model.id === 'nbt_tlf' && model.layers && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-600" />
                        Neural Network Architecture
                    </h3>

                    {/* Visual Diagram */}
                    <div className="flex justify-center items-center gap-2 overflow-x-auto pb-4 mb-6">
                        {model.layers.map((layer, i) => (
                            <div key={i} className="flex items-center">
                                <div
                                    className="relative group cursor-pointer"
                                    onClick={() => setExpandedLayer(expandedLayer === i ? null : i)}
                                >
                                    <div
                                        className={`rounded-lg p-3 text-center transition-all ${expandedLayer === i
                                                ? 'bg-purple-600 text-white scale-110'
                                                : 'bg-f1-gray-100 hover:bg-purple-100'
                                            }`}
                                        style={{
                                            width: Math.max(60, layer.nodes * 1.5) + 'px',
                                            height: Math.max(40, layer.nodes * 0.8) + 'px',
                                        }}
                                    >
                                        <div className="text-xs font-bold">{layer.nodes}</div>
                                    </div>
                                    <div className="text-xs text-center mt-1 max-w-16 truncate">{layer.name.split(' ')[0]}</div>
                                </div>
                                {i < model.layers.length - 1 && (
                                    <ArrowRight className="w-4 h-4 text-f1-gray-400 mx-1" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Layer Details */}
                    <div className="space-y-2">
                        {model.layers.map((layer, i) => (
                            <div
                                key={i}
                                className={`border rounded-lg overflow-hidden transition-all ${expandedLayer === i ? 'border-purple-400' : 'border-f1-gray-200'
                                    }`}
                            >
                                <button
                                    onClick={() => setExpandedLayer(expandedLayer === i ? null : i)}
                                    className="w-full p-3 flex items-center justify-between hover:bg-f1-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                            {layer.nodes}
                                        </div>
                                        <span className="font-medium">{layer.name}</span>
                                    </div>
                                    {expandedLayer === i ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                                {expandedLayer === i && (
                                    <div className="p-3 bg-f1-gray-50 border-t text-sm text-f1-gray-600">
                                        {layer.desc}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tree Model Params */}
            {model.params && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Database className="w-5 h-5 text-green-600" />
                        Optimized Hyperparameters
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {model.params.map((param, i) => (
                            <div key={i} className="bg-f1-gray-50 rounded-lg p-4">
                                <div className="text-sm text-f1-gray-500 font-mono">{param.name}</div>
                                <div className="text-2xl font-bold text-green-600">{param.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Models Overview */}
            <div className="bg-f1-gray-100 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">All 8 Models</h3>
                <div className="grid md:grid-cols-4 gap-4">
                    {[
                        { name: 'LR', auc: 0.987, type: 'Linear' },
                        { name: 'RF', auc: 0.985, type: 'Ensemble' },
                        { name: 'CAT', auc: 0.985, type: 'Boosting' },
                        { name: 'XGB', auc: 0.983, type: 'Boosting' },
                        { name: 'QualiFreq', auc: 0.981, type: 'Baseline' },
                        { name: 'LGBM', auc: 0.975, type: 'Boosting' },
                        { name: 'NBT-TLF', auc: 0.950, type: 'Neural' },
                        { name: 'Elo', auc: 0.440, type: 'Baseline' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 text-center">
                            <div className="font-bold">{m.name}</div>
                            <div className="text-2xl font-bold text-green-600">{m.auc.toFixed(3)}</div>
                            <div className="text-xs text-f1-gray-500">{m.type}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/explainer" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                    SHAP Explainer
                </Link>
                <Link href="/backtest" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Backtest Results
                </Link>
            </div>
        </div>
    )
}
