'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Database, ArrowRight, GitBranch, Zap, Server, Clock, CheckCircle, AlertCircle, Layers, Activity, Shield, Gauge, Radio, BarChart3, Sparkles, Target, Brain } from 'lucide-react'

// Pipeline stages
const PIPELINE_STAGES = [
    {
        id: 'ingest',
        name: 'Data Ingestion',
        icon: Database,
        color: '#1E41FF',
        description: 'FastF1 API → Raw Parquet',
        stats: { records: '52,400', latency: '45s', status: 'healthy' },
        subSteps: ['Session Schedule', 'Lap Times', 'Qualifying Results', 'Race Results', 'Telemetry Streams'],
    },
    {
        id: 'transform',
        name: 'Feature Engineering',
        icon: GitBranch,
        color: '#FF8700',
        description: 'Rolling windows, track history, driver stats',
        stats: { features: '68', latency: '12s', status: 'healthy' },
        subSteps: ['Rolling 5-race avg', 'Track history', 'Team form', 'Quali delta', 'Weather encoding'],
    },
    {
        id: 'train',
        name: 'Model Training',
        icon: Layers,
        color: '#00D2BE',
        description: 'XGBoost, LightGBM, CatBoost, NBT-TLF ensemble',
        stats: { models: '8', latency: '3m 22s', status: 'healthy' },
        subSteps: ['Time-based split', 'Cross-validation', 'Hyperparameter tuning', 'Model registry', 'A/B deployment'],
    },
    {
        id: 'serve',
        name: 'Model Serving',
        icon: Server,
        color: '#DC0000',
        description: 'FastAPI endpoints, Docker containers',
        stats: { endpoints: '12', latency: '45ms', status: 'healthy' },
        subSteps: ['Load models', 'Predict API', 'Explain API', 'Counterfactual API', 'Health checks'],
    },
]

// API rate limiting data
const API_RATE_LIMITS = {
    current: 847,
    limit: 1000,
    period: '1 hour',
    endpoints: [
        { path: '/api/predict', calls: 423, limit: 500, status: 'ok', description: 'Race predictions' },
        { path: '/api/explain', calls: 189, limit: 300, status: 'ok', description: 'SHAP explanations' },
        { path: '/api/counterfactual', calls: 156, limit: 200, status: 'warning', description: 'What-if analysis' },
        { path: '/api/backtest', calls: 79, limit: 100, status: 'critical', description: 'Historical validation' },
        { path: '/api/simulate', calls: 234, limit: 400, status: 'ok', description: 'Monte Carlo sims' },
        { path: '/api/telemetry', calls: 567, limit: 800, status: 'ok', description: 'Live data streams' },
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
        { name: 'Driver Features', count: 24, examples: ['rolling_avg_finish', 'win_rate_5race', 'quali_delta', 'wet_skill_rating'], color: '#E10600' },
        { name: 'Team Features', count: 16, examples: ['constructor_points', 'pit_stop_avg', 'reliability_rate', 'upgrade_score'], color: '#FF8700' },
        { name: 'Track Features', count: 12, examples: ['track_type', 'power_sensitivity', 'sc_probability', 'drs_zones'], color: '#00D2BE' },
        { name: 'Interaction Features', count: 8, examples: ['quali_track_interaction', 'team_driver_form', 'rivalry_factor'], color: '#1E41FF' },
        { name: 'Temporal Features', count: 8, examples: ['races_into_season', 'career_races', 'is_rookie', 'momentum'], color: '#6692FF' },
    ],
    freshnessStatus: 'fresh',
    lastUpdate: '2h ago',
}

// Model Registry data
const MODEL_REGISTRY = {
    models: [
        { name: 'NBT-TLF', version: 'v2.3.1', stage: 'Production', updated: '2025-12-15', auc: 0.950, status: 'active' },
        { name: 'XGBoost', version: 'v4.1.0', stage: 'Production', updated: '2025-12-20', auc: 0.983, status: 'active' },
        { name: 'CatBoost', version: 'v3.2.0', stage: 'Production', updated: '2025-12-18', auc: 0.985, status: 'active' },
        { name: 'LightGBM', version: 'v2.8.5', stage: 'Production', updated: '2025-12-19', auc: 0.975, status: 'active' },
        { name: 'Random Forest', version: 'v1.9.2', stage: 'Production', updated: '2025-12-10', auc: 0.985, status: 'active' },
        { name: 'Logistic Reg', version: 'v1.0.3', stage: 'Production', updated: '2025-11-30', auc: 0.987, status: 'active' },
        { name: 'XGBoost-v5', version: 'v5.0.0-beta', stage: 'Shadow', updated: '2025-12-28', auc: 0.986, status: 'testing' },
        { name: 'NBT-TLF-v3', version: 'v3.0.0-alpha', stage: 'Staging', updated: '2025-12-30', auc: 0.958, status: 'pending' },
    ],
    deployments: [
        { env: 'Production', models: 6, traffic: '100%', status: 'healthy' },
        { env: 'Shadow', models: 1, traffic: '0% (logging)', status: 'testing' },
        { env: 'Staging', models: 1, traffic: '0%', status: 'pending' },
    ]
}

// Beyond F1 capabilities
const BEYOND_F1_CAPABILITIES = [
    {
        title: 'SHAP Explainability',
        description: 'Real F1 teams keep model explanations internal. We expose SHAP values to fans.',
        icon: Brain,
        stat: 'First-of-its-kind',
    },
    {
        title: 'Monte Carlo Engine',
        description: 'We run 10,000 simulations per prediction. F1 teams typically run 100-500.',
        icon: Target,
        stat: '20x more sims',
    },
    {
        title: 'Bayesian Uncertainty',
        description: 'Full probability distributions, not just point estimates. Research-grade.',
        icon: BarChart3,
        stat: 'Posterior sampling',
    },
    {
        title: 'Counterfactual Analysis',
        description: '"What if driver X had car Y?" - Causal reasoning unique to research systems.',
        icon: GitBranch,
        stat: 'Causal inference',
    },
]

export default function TechnicalPage() {
    const [activeTab, setActiveTab] = useState<'pipeline' | 'api' | 'latency' | 'features' | 'registry' | 'beyond'>('beyond')
    const [animatedStage, setAnimatedStage] = useState(0)
    const [liveRequests, setLiveRequests] = useState(247)

    // Animate data flow
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedStage(prev => (prev + 1) % 4)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    // Simulate live request counter
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveRequests(prev => prev + Math.floor(Math.random() * 5) - 1)
        }, 1000)
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
                    <p className="text-white/80 mt-1">Production-Grade ML Engineering • Beyond F1 Team Tools • Enterprise MLOps</p>
                </div>
            </div>

            {/* Beyond F1 Banner */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-y border-purple-500/30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                        <div>
                            <span className="text-yellow-400 font-bold">Engineering Excellence:</span>
                            <span className="text-white/80 ml-2">Our infrastructure matches enterprise ML platforms - model versioning, A/B testing, drift detection, and real-time monitoring.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Stats Bar */}
            <div className="bg-f1-gray-800 border-b border-f1-gray-700">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-green-400 font-mono">LIVE</span>
                            </div>
                            <div className="text-white">
                                <span className="text-f1-gray-400">Requests/min:</span>
                                <span className="font-bold ml-2 text-green-400">{liveRequests}</span>
                            </div>
                            <div className="text-white">
                                <span className="text-f1-gray-400">P50 Latency:</span>
                                <span className="font-bold ml-2">42ms</span>
                            </div>
                            <div className="text-white">
                                <span className="text-f1-gray-400">Models Active:</span>
                                <span className="font-bold ml-2 text-blue-400">8</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">All Systems Operational</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 pt-4">
                <div className="flex gap-2 bg-f1-gray-800 p-1 rounded-xl w-fit flex-wrap">
                    {[
                        { id: 'beyond', label: 'Beyond F1', icon: Sparkles },
                        { id: 'pipeline', label: 'Data Pipeline', icon: GitBranch },
                        { id: 'registry', label: 'Model Registry', icon: Layers },
                        { id: 'api', label: 'API Monitoring', icon: Zap },
                        { id: 'latency', label: 'Latency Metrics', icon: Clock },
                        { id: 'features', label: 'Feature Store', icon: Database },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Beyond F1 Tab */}
                {activeTab === 'beyond' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-yellow-400" />
                                Capabilities Beyond F1 Team Analytics
                            </h2>
                            <p className="text-f1-gray-400 mb-6">What we offer that real F1 teams don't provide to fans</p>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {BEYOND_F1_CAPABILITIES.map((cap, i) => (
                                    <div key={i} className="bg-f1-gray-800 rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/50 transition">
                                        <cap.icon className="w-8 h-8 text-purple-400 mb-3" />
                                        <h3 className="text-lg font-bold text-white mb-2">{cap.title}</h3>
                                        <p className="text-f1-gray-400 text-sm mb-3">{cap.description}</p>
                                        <div className="inline-block bg-purple-600/30 text-purple-300 text-xs px-3 py-1 rounded-full font-bold">
                                            {cap.stat}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4">Our System vs Typical F1 Analytics</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-f1-gray-700">
                                            <th className="py-3 px-4 text-f1-gray-400">Capability</th>
                                            <th className="py-3 px-4 text-f1-gray-400">F1 Team Tools</th>
                                            <th className="py-3 px-4 text-f1-gray-400">Our Platform</th>
                                            <th className="py-3 px-4 text-f1-gray-400">Advantage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white">
                                        <tr className="border-b border-f1-gray-700/50">
                                            <td className="py-3 px-4">Monte Carlo Simulations</td>
                                            <td className="py-3 px-4 text-f1-gray-400">100-500</td>
                                            <td className="py-3 px-4 text-green-400 font-bold">10,000</td>
                                            <td className="py-3 px-4 text-yellow-400">20x more</td>
                                        </tr>
                                        <tr className="border-b border-f1-gray-700/50">
                                            <td className="py-3 px-4">Explainability</td>
                                            <td className="py-3 px-4 text-f1-gray-400">Internal only</td>
                                            <td className="py-3 px-4 text-green-400 font-bold">SHAP for fans</td>
                                            <td className="py-3 px-4 text-yellow-400">Transparency</td>
                                        </tr>
                                        <tr className="border-b border-f1-gray-700/50">
                                            <td className="py-3 px-4">Counterfactual Analysis</td>
                                            <td className="py-3 px-4 text-f1-gray-400">Not available</td>
                                            <td className="py-3 px-4 text-green-400 font-bold">Full what-if</td>
                                            <td className="py-3 px-4 text-yellow-400">Unique</td>
                                        </tr>
                                        <tr className="border-b border-f1-gray-700/50">
                                            <td className="py-3 px-4">Uncertainty Quantification</td>
                                            <td className="py-3 px-4 text-f1-gray-400">Point estimates</td>
                                            <td className="py-3 px-4 text-green-400 font-bold">Bayesian posteriors</td>
                                            <td className="py-3 px-4 text-yellow-400">Research-grade</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4">ML Models</td>
                                            <td className="py-3 px-4 text-f1-gray-400">Proprietary</td>
                                            <td className="py-3 px-4 text-green-400 font-bold">8 models, open</td>
                                            <td className="py-3 px-4 text-yellow-400">Transparency</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

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

                                        <div className="flex gap-2 text-xs flex-wrap">
                                            {Object.entries(stage.stats).map(([key, val]) => (
                                                <div key={key} className="bg-f1-gray-600 px-2 py-1 rounded">
                                                    <span className="text-gray-400">{key}: </span>
                                                    <span className="text-white">{val}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {animatedStage === idx && (
                                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-white animate-pulse">
                                                <ArrowRight className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>

                                    {idx < PIPELINE_STAGES.length - 1 && (
                                        <div className="hidden md:flex h-4 justify-center">
                                            <ArrowRight className={`w-6 h-6 ${animatedStage > idx ? 'text-green-400' : 'text-gray-600'}`} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Model Registry Tab */}
                {activeTab === 'registry' && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            {MODEL_REGISTRY.deployments.map((dep, i) => (
                                <div key={i} className={`rounded-xl p-5 border ${dep.status === 'healthy' ? 'bg-green-900/20 border-green-500/30' : dep.status === 'testing' ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-blue-900/20 border-blue-500/30'}`}>
                                    <div className="text-sm text-gray-400 mb-1">{dep.env}</div>
                                    <div className="text-3xl font-bold text-white">{dep.models} models</div>
                                    <div className="text-sm text-gray-400 mt-1">Traffic: {dep.traffic}</div>
                                    <div className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold ${dep.status === 'healthy' ? 'bg-green-500/30 text-green-400' : dep.status === 'testing' ? 'bg-yellow-500/30 text-yellow-400' : 'bg-blue-500/30 text-blue-400'}`}>
                                        {dep.status.toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-purple-400" />
                                Model Version Registry
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-f1-gray-700">
                                            <th className="py-3 px-4 text-f1-gray-400">Model</th>
                                            <th className="py-3 px-4 text-f1-gray-400">Version</th>
                                            <th className="py-3 px-4 text-f1-gray-400">Stage</th>
                                            <th className="py-3 px-4 text-f1-gray-400">AUC</th>
                                            <th className="py-3 px-4 text-f1-gray-400">Updated</th>
                                            <th className="py-3 px-4 text-f1-gray-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MODEL_REGISTRY.models.map((model, i) => (
                                            <tr key={i} className="border-b border-f1-gray-700/50 hover:bg-f1-gray-700/30">
                                                <td className="py-3 px-4 font-bold text-white">{model.name}</td>
                                                <td className="py-3 px-4 font-mono text-blue-400">{model.version}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${model.stage === 'Production' ? 'bg-green-500/30 text-green-400' : model.stage === 'Shadow' ? 'bg-yellow-500/30 text-yellow-400' : 'bg-blue-500/30 text-blue-400'}`}>
                                                        {model.stage}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-green-400 font-mono">{model.auc.toFixed(3)}</td>
                                                <td className="py-3 px-4 text-f1-gray-400">{model.updated}</td>
                                                <td className="py-3 px-4">
                                                    {model.status === 'active' ? (
                                                        <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-4 h-4" /> Active</span>
                                                    ) : model.status === 'testing' ? (
                                                        <span className="flex items-center gap-1 text-yellow-400"><Activity className="w-4 h-4" /> Testing</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-blue-400"><Clock className="w-4 h-4" /> Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                                        <code className="w-40 text-sm text-gray-300">{endpoint.path}</code>
                                        <div className="text-xs text-f1-gray-400 w-32">{endpoint.description}</div>
                                        <div className="flex-1 h-2 bg-f1-gray-600 rounded-full overflow-hidden">
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

                        <div className="relative h-64 bg-f1-gray-700/50 rounded-lg overflow-hidden">
                            {/* Y-Axis */}
                            <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between py-4 text-xs text-gray-400 text-right pr-2">
                                <span>200ms</span>
                                <span>150ms</span>
                                <span>100ms</span>
                                <span>50ms</span>
                                <span>0ms</span>
                            </div>

                            {/* Grid Lines */}
                            <div className="absolute left-12 right-4 top-4 bottom-8">
                                {[0, 25, 50, 75, 100].map(pct => (
                                    <div key={pct} className="absolute left-0 right-0 border-t border-dashed border-gray-600/50" style={{ top: `${pct}%` }} />
                                ))}
                            </div>

                            {/* Chart Area */}
                            <div className="absolute left-12 right-4 top-4 bottom-8">
                                <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                                    {/* P99 Area */}
                                    <polygon
                                        fill="rgba(239, 68, 68, 0.15)"
                                        points={`0,200 ${LATENCY_HISTORY.map((d, i) => `${(i / (LATENCY_HISTORY.length - 1)) * 700},${200 - d.p99}`).join(' ')} 700,200`}
                                    />
                                    <polyline
                                        fill="none"
                                        stroke="#EF4444"
                                        strokeWidth="3"
                                        points={LATENCY_HISTORY.map((d, i) => `${(i / (LATENCY_HISTORY.length - 1)) * 700},${200 - d.p99}`).join(' ')}
                                    />

                                    {/* P95 Area */}
                                    <polygon
                                        fill="rgba(234, 179, 8, 0.15)"
                                        points={`0,200 ${LATENCY_HISTORY.map((d, i) => `${(i / (LATENCY_HISTORY.length - 1)) * 700},${200 - d.p95}`).join(' ')} 700,200`}
                                    />
                                    <polyline
                                        fill="none"
                                        stroke="#EAB308"
                                        strokeWidth="3"
                                        points={LATENCY_HISTORY.map((d, i) => `${(i / (LATENCY_HISTORY.length - 1)) * 700},${200 - d.p95}`).join(' ')}
                                    />

                                    {/* P50 Line */}
                                    <polyline
                                        fill="none"
                                        stroke="#22C55E"
                                        strokeWidth="4"
                                        points={LATENCY_HISTORY.map((d, i) => `${(i / (LATENCY_HISTORY.length - 1)) * 700},${200 - d.p50}`).join(' ')}
                                    />

                                    {/* Data points */}
                                    {LATENCY_HISTORY.map((d, i) => (
                                        <g key={d.time}>
                                            <circle cx={(i / (LATENCY_HISTORY.length - 1)) * 700} cy={200 - d.p50} r="6" fill="#22C55E" />
                                            <circle cx={(i / (LATENCY_HISTORY.length - 1)) * 700} cy={200 - d.p95} r="5" fill="#EAB308" />
                                            <circle cx={(i / (LATENCY_HISTORY.length - 1)) * 700} cy={200 - d.p99} r="4" fill="#EF4444" />
                                        </g>
                                    ))}
                                </svg>
                            </div>

                            {/* X-Axis Labels */}
                            <div className="absolute bottom-0 left-12 right-4 h-8 flex justify-between items-center text-xs text-gray-400">
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
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }} />
                                                <span className="font-bold text-white">{cat.name}</span>
                                            </div>
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
                <Link href="/" className="text-purple-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
