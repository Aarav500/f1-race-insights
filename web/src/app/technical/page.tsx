'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Database, ArrowRight, GitBranch, Zap, Server, Clock, CheckCircle, AlertCircle, Layers } from 'lucide-react'

// Pipeline stages
const PIPELINE_STAGES = [
    {
        id: 'ingest',
        name: 'Data Ingestion',
        icon: Database,
        color: '#1E41FF',
        description: 'FastF1 API → Raw Parquet',
        stats: { records: '52,400', latency: '45s', status: 'healthy' },
        subSteps: ['Session Schedule', 'Lap Times', 'Qualifying Results', 'Race Results'],
    },
    {
        id: 'transform',
        name: 'Feature Engineering',
        icon: GitBranch,
        color: '#FF8700',
        description: 'Rolling windows, track history, driver stats',
        stats: { features: '68', latency: '12s', status: 'healthy' },
        subSteps: ['Rolling 5-race avg', 'Track history', 'Team form', 'Quali delta'],
    },
    {
        id: 'train',
        name: 'Model Training',
        icon: Layers,
        color: '#00D2BE',
        description: 'XGBoost, LightGBM, CatBoost ensemble',
        stats: { models: '8', latency: '3m 22s', status: 'healthy' },
        subSteps: ['Time-based split', 'Cross-validation', 'Hyperparameter tuning', 'Model registry'],
    },
    {
        id: 'serve',
        name: 'Model Serving',
        icon: Server,
        color: '#DC0000',
        description: 'FastAPI endpoints, Docker containers',
        stats: { endpoints: '6', latency: '45ms', status: 'healthy' },
        subSteps: ['Load models', 'Predict API', 'Explain API', 'Health checks'],
    },
]

// API rate limiting data
const API_RATE_LIMITS = {
    current: 847,
    limit: 1000,
    period: '1 hour',
    endpoints: [
        { path: '/api/predict', calls: 423, limit: 500, status: 'ok' },
        { path: '/api/explain', calls: 189, limit: 300, status: 'ok' },
        { path: '/api/counterfactual', calls: 156, limit: 200, status: 'warning' },
        { path: '/api/backtest', calls: 79, limit: 100, status: 'critical' },
    ],
}

// Inference latency data
const LATENCY_HISTORY = [
    { time: '12:00', p50: 42, p95: 89, p99: 156 },
    { time: '12:15', p50: 45, p95: 92, p99: 168 },
    { time: '12:30', p50: 38, p95: 78, p99: 134 },
    { time: '12:45', p50: 41, p95: 85, p99: 145 },
    { time: '13:00', p50: 44, p95: 90, p99: 162 },
    { time: '13:15', p50: 39, p95: 82, p99: 138 },
    { time: '13:30', p50: 43, p95: 88, p99: 152 },
    { time: '13:45', p50: 46, p95: 95, p99: 178 },
]

// Feature store data
const FEATURE_STORE = {
    totalFeatures: 68,
    categories: [
        { name: 'Driver Features', count: 24, examples: ['rolling_avg_finish', 'win_rate_5race', 'quali_delta'] },
        { name: 'Team Features', count: 16, examples: ['constructor_points', 'pit_stop_avg', 'reliability'] },
        { name: 'Track Features', count: 12, examples: ['track_type', 'power_sensitivity', 'sc_probability'] },
        { name: 'Interaction Features', count: 8, examples: ['quali_track_interaction', 'team_driver_form'] },
        { name: 'Temporal Features', count: 8, examples: ['races_into_season', 'career_races', 'is_rookie'] },
    ],
    freshnessStatus: 'fresh',
    lastUpdate: '2h ago',
}

export default function TechnicalPage() {
    const [activeTab, setActiveTab] = useState<'pipeline' | 'api' | 'latency' | 'features'>('pipeline')
    const [animatedStage, setAnimatedStage] = useState(0)

    // Animate data flow
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedStage(prev => (prev + 1) % 4)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Server className="w-8 h-8" />
                        Technical Infrastructure
                    </h1>
                    <p className="text-white/80 mt-1">Data Pipeline • API Monitoring • Latency Metrics • Feature Store</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 pt-4">
                <div className="flex gap-2 bg-f1-gray-800 p-1 rounded-xl w-fit flex-wrap">
                    {[
                        { id: 'pipeline', label: 'Data Pipeline', icon: GitBranch },
                        { id: 'api', label: 'API Rate Limits', icon: Zap },
                        { id: 'latency', label: 'Inference Latency', icon: Clock },
                        { id: 'features', label: 'Feature Store', icon: Database },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === tab.id ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Data Pipeline Tab */}
                {activeTab === 'pipeline' && (
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">ETL Data Pipeline Visualization</h2>

                        <div className="flex flex-col md:flex-row gap-4 items-stretch">
                            {PIPELINE_STAGES.map((stage, idx) => (
                                <div key={stage.id} className="flex-1 flex flex-col">
                                    <div className={`relative bg-f1-gray-700 rounded-xl p-4 flex-1 border-2 transition-all ${animatedStage === idx ? 'border-white/50 scale-105' : 'border-transparent'}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stage.color }}>
                                                <stage.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{stage.name}</div>
                                                <div className="text-xs text-gray-400">{stage.description}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-xs mb-3">
                                            {stage.subSteps.map((step, i) => (
                                                <div key={i} className="flex items-center gap-2 text-gray-400">
                                                    <CheckCircle className={`w-3 h-3 ${animatedStage >= idx ? 'text-green-400' : 'text-gray-600'}`} />
                                                    {step}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2 text-xs">
                                            {Object.entries(stage.stats).map(([key, val]) => (
                                                <div key={key} className="bg-f1-gray-600 px-2 py-1 rounded">
                                                    <span className="text-gray-400">{key}: </span>
                                                    <span className="text-white">{val}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Animated flow indicator */}
                                        {animatedStage === idx && (
                                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-white animate-pulse">
                                                <ArrowRight className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>

                                    {idx < PIPELINE_STAGES.length - 1 && (
                                        <div className="hidden md:block h-4 flex justify-center">
                                            <ArrowRight className={`w-6 h-6 ${animatedStage > idx ? 'text-green-400' : 'text-gray-600'}`} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* API Rate Limits Tab */}
                {activeTab === 'api' && (
                    <div className="space-y-4">
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">API Rate Limiting Dashboard</h2>
                                <div className="text-sm text-gray-400">Period: {API_RATE_LIMITS.period}</div>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Total API Calls</span>
                                    <span className="font-bold text-white">{API_RATE_LIMITS.current} / {API_RATE_LIMITS.limit}</span>
                                </div>
                                <div className="h-4 bg-f1-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${API_RATE_LIMITS.current / API_RATE_LIMITS.limit > 0.9 ? 'bg-red-500' : API_RATE_LIMITS.current / API_RATE_LIMITS.limit > 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                        style={{ width: `${(API_RATE_LIMITS.current / API_RATE_LIMITS.limit) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {API_RATE_LIMITS.endpoints.map(endpoint => (
                                    <div key={endpoint.path} className="flex items-center gap-4 bg-f1-gray-700 rounded-lg p-3">
                                        <div className={`w-3 h-3 rounded-full ${endpoint.status === 'ok' ? 'bg-green-500' : endpoint.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                        <code className="flex-1 text-sm text-gray-300">{endpoint.path}</code>
                                        <div className="w-32 h-2 bg-f1-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${endpoint.status === 'ok' ? 'bg-green-500' : endpoint.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${(endpoint.calls / endpoint.limit) * 100}%` }}
                                            />
                                        </div>
                                        <div className="w-24 text-right text-sm">
                                            <span className="text-white">{endpoint.calls}</span>
                                            <span className="text-gray-400">/{endpoint.limit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Inference Latency Tab */}
                {activeTab === 'latency' && (
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Inference Latency Metrics</h2>

                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
                                <div className="text-sm text-gray-400">P50 Latency</div>
                                <div className="text-3xl font-bold text-green-400">42ms</div>
                            </div>
                            <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-500/30">
                                <div className="text-sm text-gray-400">P95 Latency</div>
                                <div className="text-3xl font-bold text-yellow-400">88ms</div>
                            </div>
                            <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/30">
                                <div className="text-sm text-gray-400">P99 Latency</div>
                                <div className="text-3xl font-bold text-red-400">152ms</div>
                            </div>
                        </div>

                        <div className="relative h-48 bg-f1-gray-700/50 rounded-lg p-4">
                            <div className="absolute left-2 top-4 text-xs text-gray-400">200ms</div>
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">100ms</div>
                            <div className="absolute left-2 bottom-4 text-xs text-gray-400">0ms</div>

                            <svg className="absolute left-12 right-4 top-4 bottom-8" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {/* P99 area */}
                                <polyline
                                    fill="rgba(239, 68, 68, 0.2)"
                                    stroke="#EF4444"
                                    strokeWidth="1"
                                    points={`0,100 ${LATENCY_HISTORY.map((d, i) => `${(i / (LATENCY_HISTORY.length - 1)) * 100},${100 - d.p99 / 2}`).join(' ')} 100,100`}
                                />
                                {/* P95 area */}
                                <polyline
                                    fill="rgba(234, 179, 8, 0.2)"
                                    stroke="#EAB308"
                                    strokeWidth="1"
                                    points={`0,100 ${LATENCY_HISTORY.map((d, i) => `${(i / (LATENCY_HISTORY.length - 1)) * 100},${100 - d.p95 / 2}`).join(' ')} 100,100`}
                                />
                                {/* P50 line */}
                                <polyline
                                    fill="none"
                                    stroke="#22C55E"
                                    strokeWidth="2"
                                    points={LATENCY_HISTORY.map((d, i) => `${(i / (LATENCY_HISTORY.length - 1)) * 100},${100 - d.p50 / 2}`).join(' ')}
                                />
                            </svg>

                            <div className="absolute bottom-1 left-12 right-4 flex justify-between text-xs text-gray-400">
                                {LATENCY_HISTORY.map(d => <span key={d.time}>{d.time}</span>)}
                            </div>
                        </div>

                        <div className="flex gap-6 mt-4 justify-center">
                            <div className="flex items-center gap-2"><div className="w-4 h-1 bg-green-500" /><span className="text-sm text-gray-400">P50</span></div>
                            <div className="flex items-center gap-2"><div className="w-4 h-1 bg-yellow-500" /><span className="text-sm text-gray-400">P95</span></div>
                            <div className="flex items-center gap-2"><div className="w-4 h-1 bg-red-500" /><span className="text-sm text-gray-400">P99</span></div>
                        </div>
                    </div>
                )}

                {/* Feature Store Tab */}
                {activeTab === 'features' && (
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-f1-gray-800 rounded-xl p-6">
                                <div className="text-sm text-gray-400 mb-1">Total Features</div>
                                <div className="text-4xl font-bold text-white">{FEATURE_STORE.totalFeatures}</div>
                            </div>
                            <div className="bg-f1-gray-800 rounded-xl p-6">
                                <div className="text-sm text-gray-400 mb-1">Categories</div>
                                <div className="text-4xl font-bold text-white">{FEATURE_STORE.categories.length}</div>
                            </div>
                            <div className={`rounded-xl p-6 ${FEATURE_STORE.freshnessStatus === 'fresh' ? 'bg-green-900/30' : 'bg-yellow-900/30'}`}>
                                <div className="text-sm text-gray-400 mb-1">Last Update</div>
                                <div className="text-2xl font-bold text-white flex items-center gap-2">
                                    {FEATURE_STORE.freshnessStatus === 'fresh' ? <CheckCircle className="w-6 h-6 text-green-400" /> : <AlertCircle className="w-6 h-6 text-yellow-400" />}
                                    {FEATURE_STORE.lastUpdate}
                                </div>
                            </div>
                        </div>

                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Feature Store Architecture</h2>
                            <div className="space-y-4">
                                {FEATURE_STORE.categories.map(cat => (
                                    <div key={cat.name} className="bg-f1-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-white">{cat.name}</span>
                                            <span className="text-sm text-gray-400">{cat.count} features</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {cat.examples.map(ex => (
                                                <code key={ex} className="text-xs bg-f1-gray-600 px-2 py-1 rounded text-gray-300">{ex}</code>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-gray-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
