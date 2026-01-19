'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TrendingUp, BarChart2, Activity, Clock, AlertTriangle, CheckCircle, Layers } from 'lucide-react'

// Sample Elo data with uncertainty
const DRIVERS = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF' },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700' },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000' },
    { id: 'HAM', name: 'Hamilton', team: 'Ferrari', color: '#DC0000' },
    { id: 'PIA', name: 'Piastri', team: 'McLaren', color: '#FF8700' },
    { id: 'RUS', name: 'Russell', team: 'Mercedes', color: '#00D2BE' },
    { id: 'SAI', name: 'Sainz', team: 'Williams', color: '#005AFF' },
    { id: 'ALO', name: 'Alonso', team: 'Aston Martin', color: '#006F62' },
]

// Generate Bayesian Elo with posterior distributions
function generateBayesianElo() {
    return DRIVERS.map((driver, idx) => {
        const baseMean = 2200 - idx * 80 + (Math.random() - 0.5) * 50
        const uncertainty = 30 + Math.random() * 40 // Standard deviation

        // Generate posterior samples
        const samples = Array.from({ length: 100 }, () =>
            baseMean + (Math.random() * 2 - 1) * uncertainty * 2
        ).sort((a, b) => a - b)

        return {
            driver: driver.id,
            mean: baseMean,
            std: uncertainty,
            p5: samples[4],
            p25: samples[24],
            p50: samples[49],
            p75: samples[74],
            p95: samples[94],
            samples,
            trend: Math.random() > 0.5 ? 'up' : 'down',
            trendValue: Math.floor(Math.random() * 30) - 15,
        }
    }).sort((a, b) => b.mean - a.mean)
}

// Feature importance over time
const FEATURE_IMPORTANCE_HISTORY = [
    { race: 'Bahrain', quali_pos: 0.35, driver_form: 0.22, team_form: 0.18, track_history: 0.12, weather: 0.08, other: 0.05 },
    { race: 'Saudi', quali_pos: 0.32, driver_form: 0.24, team_form: 0.19, track_history: 0.10, weather: 0.10, other: 0.05 },
    { race: 'Australia', quali_pos: 0.30, driver_form: 0.25, team_form: 0.20, track_history: 0.12, weather: 0.08, other: 0.05 },
    { race: 'Japan', quali_pos: 0.33, driver_form: 0.23, team_form: 0.17, track_history: 0.14, weather: 0.08, other: 0.05 },
    { race: 'China', quali_pos: 0.31, driver_form: 0.26, team_form: 0.18, track_history: 0.11, weather: 0.09, other: 0.05 },
    { race: 'Miami', quali_pos: 0.34, driver_form: 0.21, team_form: 0.20, track_history: 0.10, weather: 0.10, other: 0.05 },
    { race: 'Monaco', quali_pos: 0.42, driver_form: 0.18, team_form: 0.15, track_history: 0.15, weather: 0.05, other: 0.05 },
    { race: 'Canada', quali_pos: 0.28, driver_form: 0.22, team_form: 0.18, track_history: 0.12, weather: 0.15, other: 0.05 },
]

// Model drift metrics
const MODEL_DRIFT_DATA = {
    currentAUC: 0.912,
    baselineAUC: 0.924,
    drift: -0.012,
    driftStatus: 'warning', // 'ok', 'warning', 'critical'
    featureDrift: [
        { feature: 'quali_position', psi: 0.08, status: 'ok' },
        { feature: 'driver_rolling_avg', psi: 0.15, status: 'warning' },
        { feature: 'constructor_form', psi: 0.05, status: 'ok' },
        { feature: 'track_history', psi: 0.22, status: 'critical' },
        { feature: 'weather_impact', psi: 0.03, status: 'ok' },
    ],
    retrainRecommended: true,
    lastRetrain: '2025-12-01',
    dataPoints: 2640,
}

// Learning curves data
const LEARNING_CURVES = {
    trainingSizes: [500, 1000, 1500, 2000, 2500],
    trainScores: [0.98, 0.96, 0.94, 0.93, 0.925],
    validScores: [0.82, 0.86, 0.89, 0.905, 0.912],
}

export default function MLAnalyticsPage() {
    const [activeTab, setActiveTab] = useState<'elo' | 'importance' | 'drift' | 'curves'>('elo')
    const bayesianElo = useMemo(() => generateBayesianElo(), [])

    const getDriver = (id: string) => DRIVERS.find(d => d.id === id)!
    const featureColors: Record<string, string> = {
        quali_pos: '#E10600',
        driver_form: '#FF8700',
        team_form: '#00D2BE',
        track_history: '#1E41FF',
        weather: '#6692FF',
        other: '#666666',
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BarChart2 className="w-8 h-8" />
                        ML Analytics Dashboard
                    </h1>
                    <p className="text-white/80 mt-1">Bayesian Elo • Feature Importance • Model Drift • Learning Curves</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 pt-4">
                <div className="flex gap-2 bg-f1-gray-800 p-1 rounded-xl w-fit">
                    {[
                        { id: 'elo', label: 'Bayesian Elo', icon: TrendingUp },
                        { id: 'importance', label: 'Feature Importance', icon: Layers },
                        { id: 'drift', label: 'Model Drift', icon: AlertTriangle },
                        { id: 'curves', label: 'Learning Curves', icon: Activity },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Bayesian Elo Tab */}
                {activeTab === 'elo' && (
                    <div className="space-y-6">
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Bayesian Elo Ratings with Uncertainty</h2>
                            <p className="text-gray-400 text-sm mb-6">Posterior distributions from MCMC sampling. Wider bars indicate higher uncertainty.</p>
                            <div className="space-y-4">
                                {bayesianElo.map((elo, idx) => {
                                    const driver = getDriver(elo.driver)
                                    const range = elo.p95 - elo.p5
                                    return (
                                        <div key={elo.driver} className="flex items-center gap-4">
                                            <div className="w-6 text-gray-400 text-sm">{idx + 1}</div>
                                            <div className="w-12 font-bold text-white">{elo.driver}</div>
                                            <div className="flex-1 relative h-8 bg-f1-gray-700 rounded">
                                                {/* P5-P95 range */}
                                                <div
                                                    className="absolute inset-y-1 rounded opacity-30"
                                                    style={{
                                                        left: `${((elo.p5 - 1600) / 800) * 100}%`,
                                                        width: `${(range / 800) * 100}%`,
                                                        backgroundColor: driver.color,
                                                    }}
                                                />
                                                {/* P25-P75 range */}
                                                <div
                                                    className="absolute inset-y-2 rounded opacity-60"
                                                    style={{
                                                        left: `${((elo.p25 - 1600) / 800) * 100}%`,
                                                        width: `${((elo.p75 - elo.p25) / 800) * 100}%`,
                                                        backgroundColor: driver.color,
                                                    }}
                                                />
                                                {/* Median marker */}
                                                <div
                                                    className="absolute top-0 bottom-0 w-1"
                                                    style={{
                                                        left: `${((elo.p50 - 1600) / 800) * 100}%`,
                                                        backgroundColor: driver.color,
                                                    }}
                                                />
                                            </div>
                                            <div className="w-24 text-right">
                                                <span className="font-bold text-white">{Math.round(elo.mean)}</span>
                                                <span className="text-gray-400 text-sm"> ±{Math.round(elo.std)}</span>
                                            </div>
                                            <div className={`w-16 text-right text-sm ${elo.trendValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {elo.trendValue > 0 ? '+' : ''}{elo.trendValue}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Feature Importance Tab */}
                {activeTab === 'importance' && (
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Feature Importance Over Time</h2>
                        <p className="text-gray-400 text-sm mb-6">How model feature weights evolve across races</p>

                        <div className="space-y-3">
                            {FEATURE_IMPORTANCE_HISTORY.map((race, idx) => (
                                <div key={race.race} className="flex items-center gap-4">
                                    <div className="w-20 text-gray-400 text-sm">{race.race}</div>
                                    <div className="flex-1 h-8 flex rounded overflow-hidden">
                                        <div style={{ width: `${race.quali_pos * 100}%`, backgroundColor: featureColors.quali_pos }} title={`Quali: ${(race.quali_pos * 100).toFixed(0)}%`} />
                                        <div style={{ width: `${race.driver_form * 100}%`, backgroundColor: featureColors.driver_form }} title={`Driver Form: ${(race.driver_form * 100).toFixed(0)}%`} />
                                        <div style={{ width: `${race.team_form * 100}%`, backgroundColor: featureColors.team_form }} title={`Team Form: ${(race.team_form * 100).toFixed(0)}%`} />
                                        <div style={{ width: `${race.track_history * 100}%`, backgroundColor: featureColors.track_history }} title={`Track History: ${(race.track_history * 100).toFixed(0)}%`} />
                                        <div style={{ width: `${race.weather * 100}%`, backgroundColor: featureColors.weather }} title={`Weather: ${(race.weather * 100).toFixed(0)}%`} />
                                        <div style={{ width: `${race.other * 100}%`, backgroundColor: featureColors.other }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-6">
                            {Object.entries(featureColors).map(([key, color]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                                    <span className="text-sm text-gray-400">{key.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Model Drift Tab */}
                {activeTab === 'drift' && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className={`rounded-xl p-6 ${MODEL_DRIFT_DATA.driftStatus === 'ok' ? 'bg-green-900/30 border border-green-500/30' : MODEL_DRIFT_DATA.driftStatus === 'warning' ? 'bg-yellow-900/30 border border-yellow-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
                                <div className="text-sm text-gray-400 mb-1">Current AUC</div>
                                <div className="text-3xl font-bold text-white">{MODEL_DRIFT_DATA.currentAUC.toFixed(3)}</div>
                            </div>
                            <div className="bg-f1-gray-800 rounded-xl p-6">
                                <div className="text-sm text-gray-400 mb-1">Baseline AUC</div>
                                <div className="text-3xl font-bold text-white">{MODEL_DRIFT_DATA.baselineAUC.toFixed(3)}</div>
                            </div>
                            <div className={`rounded-xl p-6 ${MODEL_DRIFT_DATA.drift < -0.02 ? 'bg-red-900/30' : MODEL_DRIFT_DATA.drift < 0 ? 'bg-yellow-900/30' : 'bg-green-900/30'}`}>
                                <div className="text-sm text-gray-400 mb-1">Drift</div>
                                <div className={`text-3xl font-bold ${MODEL_DRIFT_DATA.drift < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {MODEL_DRIFT_DATA.drift > 0 ? '+' : ''}{(MODEL_DRIFT_DATA.drift * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-4">Feature Drift (PSI Scores)</h3>
                            <div className="space-y-3">
                                {MODEL_DRIFT_DATA.featureDrift.map(f => (
                                    <div key={f.feature} className="flex items-center gap-4">
                                        <div className="w-40 text-gray-300">{f.feature}</div>
                                        <div className="flex-1 h-4 bg-f1-gray-700 rounded overflow-hidden">
                                            <div
                                                className={`h-full ${f.status === 'ok' ? 'bg-green-500' : f.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${Math.min(f.psi * 200, 100)}%` }}
                                            />
                                        </div>
                                        <div className="w-16 text-right font-mono text-gray-400">{f.psi.toFixed(2)}</div>
                                        <div className={`w-20 text-right text-sm ${f.status === 'ok' ? 'text-green-400' : f.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {f.status === 'ok' ? <CheckCircle className="inline w-4 h-4" /> : <AlertTriangle className="inline w-4 h-4" />} {f.status}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {MODEL_DRIFT_DATA.retrainRecommended && (
                                <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                                    <div>
                                        <div className="font-bold text-yellow-400">Retraining Recommended</div>
                                        <div className="text-sm text-gray-400">Last retrain: {MODEL_DRIFT_DATA.lastRetrain} • {MODEL_DRIFT_DATA.dataPoints} data points</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Learning Curves Tab */}
                {activeTab === 'curves' && (
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Learning Curves</h2>
                        <p className="text-gray-400 text-sm mb-6">Model performance vs training data size</p>

                        <div className="relative h-64 bg-f1-gray-700/50 rounded-lg p-4">
                            {/* Y-axis labels */}
                            <div className="absolute left-2 top-4 text-xs text-gray-400">1.0</div>
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">0.9</div>
                            <div className="absolute left-2 bottom-4 text-xs text-gray-400">0.8</div>

                            {/* Grid lines */}
                            <div className="absolute left-8 right-4 top-1/4 border-t border-dashed border-gray-600" />
                            <div className="absolute left-8 right-4 top-1/2 border-t border-dashed border-gray-600" />
                            <div className="absolute left-8 right-4 top-3/4 border-t border-dashed border-gray-600" />

                            {/* Lines visualization */}
                            <svg className="absolute left-12 right-8 top-4 bottom-8" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {/* Training curve */}
                                <polyline
                                    fill="none"
                                    stroke="#FF8700"
                                    strokeWidth="2"
                                    points={LEARNING_CURVES.trainingSizes.map((size, i) =>
                                        `${(i / (LEARNING_CURVES.trainingSizes.length - 1)) * 100},${(1 - LEARNING_CURVES.trainScores[i]) * 500}`
                                    ).join(' ')}
                                />
                                {/* Validation curve */}
                                <polyline
                                    fill="none"
                                    stroke="#00D2BE"
                                    strokeWidth="2"
                                    points={LEARNING_CURVES.trainingSizes.map((size, i) =>
                                        `${(i / (LEARNING_CURVES.trainingSizes.length - 1)) * 100},${(1 - LEARNING_CURVES.validScores[i]) * 500}`
                                    ).join(' ')}
                                />
                            </svg>

                            {/* X-axis labels */}
                            <div className="absolute bottom-1 left-12 right-8 flex justify-between text-xs text-gray-400">
                                {LEARNING_CURVES.trainingSizes.map(size => (
                                    <span key={size}>{size}</span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-6 mt-4 justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-1 bg-[#FF8700] rounded" />
                                <span className="text-sm text-gray-400">Training Score</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-1 bg-[#00D2BE] rounded" />
                                <span className="text-sm text-gray-400">Validation Score</span>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-900/20 rounded-lg">
                            <div className="text-sm text-gray-400">
                                <strong className="text-white">Interpretation:</strong> The gap between training and validation is narrowing,
                                indicating the model is learning well without severe overfitting. More data would continue to improve validation performance.
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-blue-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
