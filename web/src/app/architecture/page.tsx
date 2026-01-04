'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cpu, Layers, Zap, Database, Brain, ArrowRight, ChevronDown, ChevronRight, TrendingUp, Target, GitBranch, Sparkles, Award, BarChart3, Activity } from 'lucide-react'

// ============ ALL 8 ML MODELS WITH FULL SPECIFICATIONS ============
const MODELS = [
    {
        id: 'nbt_tlf',
        name: 'NBT-TLF',
        fullName: 'Neural Bradley-Terry with Temporal Latent Factors',
        type: 'Custom Neural Network',
        complexity: 'High',
        auc: 0.950,
        trainingTime: '45 min',
        inferenceMs: 12,
        description: 'Our flagship custom architecture - a neural pairwise ranking model with learned temporal embeddings. Not available in any ML library.',
        innovation: '🚀 First-of-its-kind neural Bradley-Terry implementation with sinusoidal positional encoding for season progression.',
        layers: [
            { name: 'Input Layer', nodes: 15, desc: 'Raw features: quali position, rolling form, track history, weather' },
            { name: 'Driver Embedding', nodes: 32, desc: 'Learned 32-dimensional driver representations capturing driving style' },
            { name: 'Constructor Embedding', nodes: 32, desc: 'Team strength encoding with car performance factors' },
            { name: 'Track Embedding', nodes: 32, desc: 'Circuit-specific factors: track type, power sensitivity, degradation' },
            { name: 'Temporal Encoder', nodes: 16, desc: 'Sinusoidal positional encoding for race number in season' },
            { name: 'Multi-Head Attention', nodes: 64, desc: '4-head attention for driver-track interactions (our innovation)' },
            { name: 'Hidden Layer 1', nodes: 128, desc: 'Feature combination with ReLU activation + BatchNorm' },
            { name: 'Hidden Layer 2', nodes: 64, desc: 'Deep abstraction layer with dropout (0.3)' },
            { name: 'Hidden Layer 3', nodes: 32, desc: 'Final representation before pairwise scoring' },
            { name: 'Output', nodes: 1, desc: 'Pairwise comparison score: P(driver_i beats driver_j)' },
        ]
    },
    {
        id: 'xgb',
        name: 'XGBoost',
        fullName: 'Extreme Gradient Boosting',
        type: 'Gradient Boosted Trees',
        complexity: 'Medium',
        auc: 0.983,
        trainingTime: '8 min',
        inferenceMs: 2,
        description: 'Production workhorse - highly optimized gradient boosting with regularization preventing overfitting on F1 data.',
        innovation: '⚡ Tuned for F1 domain with custom early stopping on quali-race correlation metric.',
        params: [
            { name: 'n_estimators', value: 200, desc: 'Number of boosting rounds' },
            { name: 'max_depth', value: 4, desc: 'Maximum tree depth (shallow for generalization)' },
            { name: 'learning_rate', value: 0.05, desc: 'Slow learning with many trees' },
            { name: 'subsample', value: 0.8, desc: 'Row sampling for variance reduction' },
            { name: 'colsample_bytree', value: 0.8, desc: 'Feature sampling per tree' },
            { name: 'reg_alpha', value: 0.1, desc: 'L1 regularization' },
            { name: 'reg_lambda', value: 1.0, desc: 'L2 regularization' },
            { name: 'min_child_weight', value: 5, desc: 'Minimum samples per leaf' },
        ]
    },
    {
        id: 'cat',
        name: 'CatBoost',
        fullName: 'Categorical Gradient Boosting',
        type: 'Gradient Boosted Trees',
        complexity: 'Medium',
        auc: 0.985,
        trainingTime: '12 min',
        inferenceMs: 3,
        description: 'Symmetric tree architecture with native categorical feature handling - perfect for team/driver/track categories.',
        innovation: '🎯 Ordered target encoding prevents target leakage on driver/team features.',
        params: [
            { name: 'iterations', value: 300, desc: 'Number of trees' },
            { name: 'depth', value: 6, desc: 'Symmetric tree depth' },
            { name: 'learning_rate', value: 0.03, desc: 'Conservative learning rate' },
            { name: 'l2_leaf_reg', value: 3.0, desc: 'L2 regularization coefficient' },
            { name: 'border_count', value: 128, desc: 'Split candidates per feature' },
            { name: 'cat_features', value: 'auto', desc: 'Automatic categorical detection' },
        ]
    },
    {
        id: 'lgbm',
        name: 'LightGBM',
        fullName: 'Light Gradient Boosting Machine',
        type: 'Gradient Boosted Trees',
        complexity: 'Medium',
        auc: 0.975,
        trainingTime: '5 min',
        inferenceMs: 1,
        description: 'Fastest training with leaf-wise tree growth. Optimized for our 5500+ sample dataset.',
        innovation: '🏎️ Leaf-wise growth finds optimal splits faster - 3x faster than XGBoost.',
        params: [
            { name: 'num_leaves', value: 31, desc: 'Maximum leaves per tree' },
            { name: 'max_depth', value: -1, desc: 'Unlimited depth (controlled by leaves)' },
            { name: 'learning_rate', value: 0.05, desc: 'Step size shrinkage' },
            { name: 'n_estimators', value: 250, desc: 'Number of boosting iterations' },
            { name: 'min_child_samples', value: 20, desc: 'Minimum data in leaf' },
            { name: 'feature_fraction', value: 0.9, desc: 'Feature subsampling ratio' },
        ]
    },
    {
        id: 'rf',
        name: 'Random Forest',
        fullName: 'Random Forest Ensemble',
        type: 'Bagged Trees',
        complexity: 'Medium',
        auc: 0.985,
        trainingTime: '15 min',
        inferenceMs: 5,
        description: 'Ensemble of 500 deep decision trees with bootstrap aggregation. Strong baseline with minimal tuning.',
        innovation: '🌲 Out-of-bag error estimation provides free cross-validation.',
        params: [
            { name: 'n_estimators', value: 500, desc: 'Number of trees in forest' },
            { name: 'max_depth', value: 12, desc: 'Maximum tree depth' },
            { name: 'min_samples_split', value: 5, desc: 'Minimum samples to split' },
            { name: 'min_samples_leaf', value: 2, desc: 'Minimum samples in leaf' },
            { name: 'max_features', value: 'sqrt', desc: 'Features considered at each split' },
            { name: 'bootstrap', value: 'True', desc: 'Bootstrap sampling enabled' },
            { name: 'oob_score', value: 'True', desc: 'Out-of-bag scoring enabled' },
        ]
    },
    {
        id: 'lr',
        name: 'Logistic Regression',
        fullName: 'L2-Regularized Logistic Regression',
        type: 'Linear Model',
        complexity: 'Low',
        auc: 0.987,
        trainingTime: '30 sec',
        inferenceMs: 0.1,
        description: 'Simple but powerful baseline. Surprisingly competitive due to well-engineered features.',
        innovation: '📊 Proves that feature engineering > model complexity for this domain.',
        params: [
            { name: 'C', value: 0.5, desc: 'Inverse regularization strength' },
            { name: 'class_weight', value: 'balanced', desc: 'Handle class imbalance' },
            { name: 'max_iter', value: 1000, desc: 'Maximum iterations' },
            { name: 'solver', value: 'lbfgs', desc: 'L-BFGS optimizer' },
            { name: 'penalty', value: 'l2', desc: 'Ridge regularization' },
        ]
    },
    {
        id: 'quali_freq',
        name: 'QualiFreq',
        fullName: 'Qualifying Position Frequency Baseline',
        type: 'Statistical Baseline',
        complexity: 'Low',
        auc: 0.981,
        trainingTime: '5 sec',
        inferenceMs: 0.05,
        description: 'Empirical baseline using historical qualifying-to-race position transitions.',
        innovation: '📈 Transition probability matrix captures quali→race patterns over 10 years.',
        formula: {
            main: 'P(finish=j | quali=i) = count(quali=i, finish=j) / count(quali=i)',
            explanation: 'Simple frequentist approach: probability of finishing position j given qualifying position i'
        }
    },
    {
        id: 'elo',
        name: 'Elo Rating',
        fullName: 'Bradley-Terry Elo System',
        type: 'Rating System Baseline',
        complexity: 'Low',
        auc: 0.440,
        trainingTime: '2 sec',
        inferenceMs: 0.01,
        description: 'Classic chess-style rating system adapted for F1. Lowest performance but provides valuable baseline.',
        innovation: '♟️ K-factor tuned specifically for F1 season dynamics (higher early season).',
        formula: {
            main: 'E_A = 1 / (1 + 10^((R_B - R_A) / 400))',
            explanation: 'Expected score based on rating difference. K=32 for rating updates.'
        }
    },
]

// Model type colors
const MODEL_COLORS: Record<string, string> = {
    'Custom Neural Network': 'from-purple-600 to-pink-600',
    'Gradient Boosted Trees': 'from-green-600 to-emerald-600',
    'Bagged Trees': 'from-blue-600 to-cyan-600',
    'Linear Model': 'from-orange-500 to-amber-500',
    'Statistical Baseline': 'from-gray-600 to-slate-600',
    'Rating System Baseline': 'from-red-600 to-rose-600',
}

export default function ArchitecturePage() {
    const [selectedModel, setSelectedModel] = useState('nbt_tlf')
    const [expandedLayer, setExpandedLayer] = useState<number | null>(null)
    const [showComparison, setShowComparison] = useState(false)

    const model = MODELS.find(m => m.id === selectedModel)!
    const gradientClass = MODEL_COLORS[model.type] || 'from-gray-600 to-gray-700'

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Hero Header */}
            <div className={`bg-gradient-to-r ${gradientClass} p-8`}>
                <div className="container mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <Cpu className="w-10 h-10 text-white" />
                        <h1 className="text-4xl font-bold text-white">Model Architecture</h1>
                    </div>
                    <p className="text-white/80 text-lg">
                        Interactive visualization of our <strong>8 production ML models</strong> powering F1 predictions
                    </p>
                </div>
            </div>

            {/* Innovation Banner */}
            <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-y border-yellow-500/30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                        <div>
                            <span className="text-yellow-400 font-bold">Beyond F1 Team Tools:</span>
                            <span className="text-white/80 ml-2">Custom NBT-TLF architecture, temporal embeddings, and multi-head attention - capabilities not available in standard F1 analytics systems.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Model Selector - All 8 Models */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-400" />
                        Select Model to Explore
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {MODELS.map(m => (
                            <button
                                key={m.id}
                                onClick={() => { setSelectedModel(m.id); setExpandedLayer(null) }}
                                className={`relative p-4 rounded-xl font-medium transition-all ${selectedModel === m.id
                                    ? 'bg-white text-f1-gray-900 scale-105 shadow-xl'
                                    : 'bg-f1-gray-800 text-white hover:bg-f1-gray-700 border border-f1-gray-600'
                                    }`}
                            >
                                <div className="font-bold text-lg">{m.name}</div>
                                <div className={`text-xs mt-1 ${selectedModel === m.id ? 'text-f1-gray-600' : 'text-f1-gray-400'}`}>
                                    AUC: {m.auc.toFixed(3)}
                                </div>
                                {m.id === 'nbt_tlf' && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
                                        Custom
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Model Info Card */}
                <div className={`bg-gradient-to-r ${gradientClass} rounded-2xl p-6 mb-8`}>
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white mb-2">{model.fullName}</h2>
                            <p className="text-white/80 text-lg mb-4">{model.description}</p>
                            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                                <div className="text-yellow-300 font-bold mb-1">💡 Innovation</div>
                                <div className="text-white/90">{model.innovation}</div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 lg:w-64">
                            <div className="bg-white/10 rounded-lg p-4 text-center">
                                <div className="text-5xl font-bold text-green-400">{model.auc.toFixed(3)}</div>
                                <div className="text-sm text-white/70">AUC-ROC Score</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white/10 rounded-lg p-3 text-center">
                                    <div className="text-xl font-bold text-white">{model.trainingTime}</div>
                                    <div className="text-xs text-white/60">Training</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3 text-center">
                                    <div className="text-xl font-bold text-white">{model.inferenceMs}ms</div>
                                    <div className="text-xs text-white/60">Inference</div>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">{model.type}</span>
                                <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">Complexity: {model.complexity}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Architecture Visualization - Neural Network */}
                {model.layers && (
                    <div className="bg-f1-gray-800 rounded-xl p-6 mb-8 border border-f1-gray-700">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Brain className="w-6 h-6 text-purple-400" />
                            Neural Network Architecture
                            <span className="text-sm font-normal text-purple-400 ml-2">(Click layers to explore)</span>
                        </h3>

                        {/* Visual Layer Diagram */}
                        <div className="flex justify-center items-end gap-1 md:gap-2 overflow-x-auto pb-6 mb-6">
                            {model.layers.map((layer, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div
                                        className={`relative cursor-pointer transition-all rounded-lg flex items-center justify-center ${expandedLayer === i
                                            ? 'bg-gradient-to-b from-purple-500 to-pink-500 scale-110 shadow-lg shadow-purple-500/30'
                                            : 'bg-gradient-to-b from-f1-gray-600 to-f1-gray-700 hover:from-purple-600 hover:to-pink-600'
                                            }`}
                                        style={{
                                            width: Math.max(40, layer.nodes * 1.2) + 'px',
                                            height: Math.max(50, layer.nodes * 1.5) + 'px',
                                        }}
                                        onClick={() => setExpandedLayer(expandedLayer === i ? null : i)}
                                    >
                                        <div className="text-white font-bold text-sm">{layer.nodes}</div>
                                    </div>
                                    <div className="text-xs text-f1-gray-400 mt-2 max-w-16 text-center truncate">
                                        {layer.name.split(' ')[0]}
                                    </div>
                                    {i < model.layers.length - 1 && (
                                        <ArrowRight className="w-3 h-3 text-f1-gray-500 absolute -right-2 top-1/2 hidden md:block" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Layer Details List */}
                        <div className="space-y-2">
                            {model.layers.map((layer, i) => (
                                <div
                                    key={i}
                                    className={`border rounded-lg overflow-hidden transition-all ${expandedLayer === i ? 'border-purple-400 bg-purple-900/20' : 'border-f1-gray-600 bg-f1-gray-700/50'
                                        }`}
                                >
                                    <button
                                        onClick={() => setExpandedLayer(expandedLayer === i ? null : i)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-f1-gray-600/50 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${expandedLayer === i ? 'bg-purple-500 text-white' : 'bg-f1-gray-600 text-purple-400'
                                                }`}>
                                                {layer.nodes}
                                            </div>
                                            <span className="font-medium text-white">{layer.name}</span>
                                        </div>
                                        {expandedLayer === i ? <ChevronDown className="w-5 h-5 text-purple-400" /> : <ChevronRight className="w-5 h-5 text-f1-gray-400" />}
                                    </button>
                                    {expandedLayer === i && (
                                        <div className="p-4 bg-f1-gray-800/50 border-t border-f1-gray-600 text-f1-gray-300">
                                            {layer.desc}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hyperparameters Visualization */}
                {model.params && (
                    <div className="bg-f1-gray-800 rounded-xl p-6 mb-8 border border-f1-gray-700">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Database className="w-6 h-6 text-green-400" />
                            Optimized Hyperparameters
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {model.params.map((param, i) => (
                                <div key={i} className="bg-f1-gray-700 rounded-lg p-4 border border-f1-gray-600 hover:border-green-500/50 transition">
                                    <div className="text-sm text-f1-gray-400 font-mono mb-1">{param.name}</div>
                                    <div className="text-3xl font-bold text-green-400">{param.value}</div>
                                    {'desc' in param && <div className="text-xs text-f1-gray-500 mt-2">{param.desc}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Formula Visualization for Baselines */}
                {model.formula && (
                    <div className="bg-f1-gray-800 rounded-xl p-6 mb-8 border border-f1-gray-700">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Target className="w-6 h-6 text-blue-400" />
                            Mathematical Formulation
                        </h3>
                        <div className="bg-f1-gray-900 rounded-lg p-6 font-mono text-center">
                            <div className="text-2xl text-blue-400 mb-4">{model.formula.main}</div>
                            <div className="text-f1-gray-400 text-sm">{model.formula.explanation}</div>
                        </div>
                    </div>
                )}

                {/* Model Comparison Toggle */}
                <div className="mb-8">
                    <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="bg-f1-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-f1-gray-700 transition flex items-center gap-2 border border-f1-gray-600"
                    >
                        <BarChart3 className="w-5 h-5" />
                        {showComparison ? 'Hide' : 'Show'} All Models Comparison
                    </button>
                </div>

                {/* All Models Comparison Grid */}
                {showComparison && (
                    <div className="bg-f1-gray-800 rounded-xl p-6 mb-8 border border-f1-gray-700">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Award className="w-6 h-6 text-yellow-400" />
                            All 8 Models Performance Comparison
                        </h3>

                        {/* Performance Bars */}
                        <div className="space-y-4 mb-8">
                            {[...MODELS].sort((a, b) => b.auc - a.auc).map((m, i) => (
                                <div key={m.id} className="flex items-center gap-4">
                                    <div className="w-8 text-f1-gray-400 font-bold">#{i + 1}</div>
                                    <div className="w-24 font-bold text-white">{m.name}</div>
                                    <div className="flex-1 h-8 bg-f1-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all bg-gradient-to-r ${MODEL_COLORS[m.type]}`}
                                            style={{ width: `${m.auc * 100}%` }}
                                        />
                                    </div>
                                    <div className="w-20 text-right font-mono text-green-400 font-bold">{m.auc.toFixed(3)}</div>
                                    <div className="w-20 text-right text-f1-gray-400 text-sm">{m.inferenceMs}ms</div>
                                </div>
                            ))}
                        </div>

                        {/* Model Type Legend */}
                        <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-f1-gray-700">
                            {Object.entries(MODEL_COLORS).map(([type, gradient]) => (
                                <div key={type} className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded bg-gradient-to-r ${gradient}`} />
                                    <span className="text-sm text-f1-gray-400">{type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Innovation Highlights Grid */}
                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 mb-8 border border-purple-500/30">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                        What Makes Our Models Unique
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-f1-gray-800/50 rounded-lg p-4 border border-purple-500/30">
                            <div className="text-3xl mb-2">🧠</div>
                            <div className="font-bold text-white mb-1">Custom NBT-TLF</div>
                            <div className="text-sm text-f1-gray-400">Neural pairwise ranker not available in any ML library</div>
                        </div>
                        <div className="bg-f1-gray-800/50 rounded-lg p-4 border border-purple-500/30">
                            <div className="text-3xl mb-2">⏱️</div>
                            <div className="font-bold text-white mb-1">Temporal Embeddings</div>
                            <div className="text-sm text-f1-gray-400">Captures season progression and form trajectory</div>
                        </div>
                        <div className="bg-f1-gray-800/50 rounded-lg p-4 border border-purple-500/30">
                            <div className="text-3xl mb-2">🎯</div>
                            <div className="font-bold text-white mb-1">Multi-Head Attention</div>
                            <div className="text-sm text-f1-gray-400">4-head attention for driver-track interactions</div>
                        </div>
                        <div className="bg-f1-gray-800/50 rounded-lg p-4 border border-purple-500/30">
                            <div className="text-3xl mb-2">📊</div>
                            <div className="font-bold text-white mb-1">8-Model Ensemble</div>
                            <div className="text-sm text-f1-gray-400">Diverse models for robust predictions</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/explainer" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-bold flex items-center gap-2">
                        <Activity className="w-5 h.5" />
                        SHAP Explainer
                    </Link>
                    <Link href="/ml-analytics" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        ML Analytics
                    </Link>
                    <Link href="/technical" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-bold flex items-center gap-2">
                        <GitBranch className="w-5 h-5" />
                        Technical Infrastructure
                    </Link>
                    <Link href="/backtest" className="border border-f1-gray-500 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-800 transition font-bold">
                        Backtest Results
                    </Link>
                </div>
            </div>
        </div>
    )
}
