'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Activity, ArrowRight, Brain, Target, Zap, AlertTriangle, CheckCircle, TrendingUp, Sparkles, BarChart3, Radio, Shield, Clock, RefreshCw } from 'lucide-react'

// Live prediction stream (simulated)
const generatePrediction = () => {
    const drivers = ['VER', 'NOR', 'LEC', 'HAM', 'PIA', 'RUS', 'SAI', 'ALO']
    const driver = drivers[Math.floor(Math.random() * drivers.length)]
    const prob = 0.3 + Math.random() * 0.5
    const confidence = 0.7 + Math.random() * 0.25
    return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        driver,
        prediction: prob > 0.5 ? 'WIN' : 'NO_WIN',
        probability: prob,
        confidence,
        latency: Math.floor(20 + Math.random() * 80),
        model: ['XGBoost', 'CatBoost', 'LightGBM', 'Ensemble'][Math.floor(Math.random() * 4)],
    }
}

// Feature drift data
const FEATURE_DRIFT = [
    { feature: 'quali_position', current: 0.08, baseline: 0.10, status: 'ok', psi: 0.08 },
    { feature: 'driver_rolling_avg', current: 0.12, baseline: 0.10, status: 'warning', psi: 0.15 },
    { feature: 'constructor_form', current: 0.09, baseline: 0.10, status: 'ok', psi: 0.05 },
    { feature: 'track_history', current: 0.06, baseline: 0.10, status: 'critical', psi: 0.22 },
    { feature: 'weather_impact', current: 0.11, baseline: 0.10, status: 'ok', psi: 0.03 },
    { feature: 'tire_management', current: 0.10, baseline: 0.10, status: 'ok', psi: 0.04 },
]

// Model health metrics
const MODEL_HEALTH = {
    overall: 'healthy',
    uptime: '99.97%',
    lastIncident: '14 days ago',
    predictions24h: 12847,
    avgLatency: 42,
    p99Latency: 156,
    errorRate: 0.02,
}

// Alert configuration
const ALERTS = [
    { id: 1, type: 'warning', message: 'Feature drift detected: track_history PSI > 0.2', time: '2h ago', acknowledged: false },
    { id: 2, type: 'info', message: 'Model NBT-TLF v3.0 deployed to shadow', time: '6h ago', acknowledged: true },
    { id: 3, type: 'success', message: 'Scheduled retraining completed successfully', time: '1d ago', acknowledged: true },
]

export default function MonitoringPage() {
    const [predictions, setPredictions] = useState<ReturnType<typeof generatePrediction>[]>([])
    const [isLive, setIsLive] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)

    // Generate live predictions
    useEffect(() => {
        if (!isLive) return
        const interval = setInterval(() => {
            setPredictions(prev => [generatePrediction(), ...prev].slice(0, 20))
        }, 1500)
        return () => clearInterval(interval)
    }, [isLive])

    // Confidence distribution histogram
    const confidenceDistribution = [
        { range: '0.70-0.75', count: 12 },
        { range: '0.75-0.80', count: 28 },
        { range: '0.80-0.85', count: 45 },
        { range: '0.85-0.90', count: 38 },
        { range: '0.90-0.95', count: 22 },
        { range: '0.95-1.00', count: 8 },
    ]
    const maxCount = Math.max(...confidenceDistribution.map(d => d.count))

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Activity className="w-8 h-8" />
                                Real-Time Model Monitoring
                            </h1>
                            <p className="text-white/80 mt-1">
                                Live Predictions • Drift Detection • Health Metrics • Alerts
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsLive(!isLive)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${isLive ? 'bg-green-500 text-white' : 'bg-f1-gray-700 text-f1-gray-300'}`}
                            >
                                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-f1-gray-500'}`} />
                                {isLive ? 'LIVE' : 'PAUSED'}
                            </button>
                            <button
                                onClick={() => setRefreshKey(k => k + 1)}
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                            >
                                <RefreshCw className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Status Bar */}
            <div className="bg-f1-gray-800 border-b border-f1-gray-700">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                {MODEL_HEALTH.overall === 'healthy' ? (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                )}
                                <span className="text-green-400 font-bold">All Systems Healthy</span>
                            </div>
                            <div className="text-white">
                                <span className="text-f1-gray-400">Uptime:</span>
                                <span className="font-bold ml-2">{MODEL_HEALTH.uptime}</span>
                            </div>
                            <div className="text-white">
                                <span className="text-f1-gray-400">24h Predictions:</span>
                                <span className="font-bold ml-2 text-blue-400">{MODEL_HEALTH.predictions24h.toLocaleString()}</span>
                            </div>
                            <div className="text-white">
                                <span className="text-f1-gray-400">Error Rate:</span>
                                <span className="font-bold ml-2 text-green-400">{MODEL_HEALTH.errorRate}%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-f1-gray-400" />
                            <span className="text-f1-gray-400 text-sm">Last incident: {MODEL_HEALTH.lastIncident}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Live Prediction Stream */}
                    <div className="lg:col-span-2 bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Radio className="w-5 h-5 text-green-400" />
                            Live Prediction Stream
                            {isLive && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
                        </h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {predictions.length === 0 ? (
                                <div className="text-center text-f1-gray-500 py-8">
                                    Waiting for predictions...
                                </div>
                            ) : (
                                predictions.map(pred => (
                                    <div key={pred.id} className="flex items-center gap-4 bg-f1-gray-700/50 rounded-lg p-3 text-sm">
                                        <div className={`w-2 h-2 rounded-full ${pred.prediction === 'WIN' ? 'bg-green-400' : 'bg-blue-400'}`} />
                                        <div className="w-12 font-bold text-white">{pred.driver}</div>
                                        <div className={`w-16 font-mono ${pred.prediction === 'WIN' ? 'text-green-400' : 'text-blue-400'}`}>
                                            {(pred.probability * 100).toFixed(1)}%
                                        </div>
                                        <div className="flex-1 h-2 bg-f1-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${pred.prediction === 'WIN' ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: `${pred.probability * 100}%` }}
                                            />
                                        </div>
                                        <div className="w-20 text-f1-gray-400">{pred.model}</div>
                                        <div className="w-16 text-right text-f1-gray-500">{pred.latency}ms</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Confidence Distribution */}
                    <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                            Confidence Distribution
                        </h2>
                        <div className="space-y-3">
                            {confidenceDistribution.map(bucket => (
                                <div key={bucket.range} className="flex items-center gap-3">
                                    <div className="w-20 text-xs text-f1-gray-400 font-mono">{bucket.range}</div>
                                    <div className="flex-1 h-6 bg-f1-gray-700 rounded overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-end pr-2"
                                            style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                                        >
                                            <span className="text-xs text-white font-bold">{bucket.count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-f1-gray-700/50 rounded-lg text-xs text-f1-gray-400">
                            Distribution of model confidence scores over last 24 hours
                        </div>
                    </div>
                </div>

                {/* Feature Drift Detection */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-400" />
                            Feature Drift Detection (PSI)
                        </h2>
                        <div className="space-y-3">
                            {FEATURE_DRIFT.map(feature => (
                                <div key={feature.feature} className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${feature.status === 'ok' ? 'bg-green-500' : feature.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                    <div className="w-40 text-sm text-white font-mono">{feature.feature}</div>
                                    <div className="flex-1 h-3 bg-f1-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${feature.status === 'ok' ? 'bg-green-500' : feature.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min(feature.psi * 200, 100)}%` }}
                                        />
                                    </div>
                                    <div className="w-12 text-right font-mono text-f1-gray-400">{feature.psi.toFixed(2)}</div>
                                    <div className={`w-16 text-right text-sm ${feature.status === 'ok' ? 'text-green-400' : feature.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {feature.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-f1-gray-400">PSI &lt; 0.1 (OK)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span className="text-f1-gray-400">0.1-0.2 (Warning)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-f1-gray-400">&gt; 0.2 (Critical)</span>
                            </div>
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            Recent Alerts
                        </h2>
                        <div className="space-y-3">
                            {ALERTS.map(alert => (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-lg border ${alert.type === 'warning'
                                        ? 'bg-yellow-900/20 border-yellow-500/30'
                                        : alert.type === 'success'
                                            ? 'bg-green-900/20 border-green-500/30'
                                            : 'bg-blue-900/20 border-blue-500/30'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />}
                                            {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />}
                                            {alert.type === 'info' && <Zap className="w-5 h-5 text-blue-400 mt-0.5" />}
                                            <div>
                                                <div className="text-white text-sm">{alert.message}</div>
                                                <div className="text-f1-gray-500 text-xs mt-1">{alert.time}</div>
                                            </div>
                                        </div>
                                        {!alert.acknowledged && (
                                            <button className="text-xs bg-f1-gray-700 text-white px-2 py-1 rounded hover:bg-f1-gray-600 transition">
                                                ACK
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Latency Metrics */}
                <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Latency Metrics
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30 text-center">
                            <div className="text-3xl font-bold text-green-400">{MODEL_HEALTH.avgLatency}ms</div>
                            <div className="text-f1-gray-400 text-sm">Average Latency</div>
                        </div>
                        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30 text-center">
                            <div className="text-3xl font-bold text-yellow-400">88ms</div>
                            <div className="text-f1-gray-400 text-sm">P95 Latency</div>
                        </div>
                        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30 text-center">
                            <div className="text-3xl font-bold text-red-400">{MODEL_HEALTH.p99Latency}ms</div>
                            <div className="text-f1-gray-400 text-sm">P99 Latency</div>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="flex gap-4 justify-center">
                    <Link href="/technical" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-bold">
                        Technical Infrastructure
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
