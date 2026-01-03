'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BarChart2, TrendingUp, AlertCircle, Target, Layers, Activity, Info } from 'lucide-react'

// Mock model predictions with uncertainty
const MODELS = ['XGBoost', 'LightGBM', 'CatBoost', 'Neural', 'Ensemble']

const DRIVERS = [
    { id: 'VER', name: 'Verstappen', color: '#1E41FF' },
    { id: 'NOR', name: 'Norris', color: '#FF8700' },
    { id: 'LEC', name: 'Leclerc', color: '#DC0000' },
    { id: 'HAM', name: 'Hamilton', color: '#DC0000' },
    { id: 'PIA', name: 'Piastri', color: '#FF8700' },
    { id: 'RUS', name: 'Russell', color: '#00D2BE' },
    { id: 'SAI', name: 'Sainz', color: '#005AFF' },
    { id: 'ALO', name: 'Alonso', color: '#006F62' },
]

// Generate mock predictions with confidence intervals
function generatePredictions() {
    return DRIVERS.map((driver, idx) => {
        const baseMean = Math.max(0.02, 0.35 - idx * 0.05 + (Math.random() - 0.5) * 0.05)

        // Generate per-model predictions
        const modelPreds = MODELS.map(model => ({
            model,
            prediction: Math.max(0.01, baseMean + (Math.random() - 0.5) * 0.08)
        }))

        // Calculate statistics
        const mean = modelPreds.reduce((sum, p) => sum + p.prediction, 0) / modelPreds.length
        const variance = modelPreds.reduce((sum, p) => sum + Math.pow(p.prediction - mean, 2), 0) / modelPreds.length
        const std = Math.sqrt(variance)

        return {
            driver: driver.id,
            mean,
            std,
            ci95Lower: Math.max(0, mean - 1.96 * std),
            ci95Upper: Math.min(1, mean + 1.96 * std),
            modelPreds,
            upsetProb: idx > 4 ? Math.min(0.3, 0.05 + Math.random() * 0.1) : 0,
        }
    })
}

// Championship Monte Carlo simulation data
const CHAMPIONSHIP_SIMS = [
    { driver: 'NOR', p10: 380, p25: 420, p50: 455, p75: 490, p90: 520, winProb: 0.72 },
    { driver: 'VER', p10: 340, p25: 380, p50: 415, p75: 450, p90: 480, winProb: 0.22 },
    { driver: 'LEC', p10: 280, p25: 320, p50: 355, p75: 390, p90: 420, winProb: 0.04 },
    { driver: 'HAM', p10: 250, p25: 290, p50: 325, p75: 360, p90: 390, winProb: 0.02 },
    { driver: 'PIA', p10: 220, p25: 260, p50: 295, p75: 330, p90: 360, winProb: 0.00 },
]

export default function UncertaintyPage() {
    const [selectedDriver, setSelectedDriver] = useState('VER')
    const predictions = useMemo(() => generatePredictions(), [])

    const selectedPrediction = predictions.find(p => p.driver === selectedDriver)!
    const getDriver = (id: string) => DRIVERS.find(d => d.id === id)!

    // Model disagreement (coefficient of variation)
    const modelDisagreement = (selectedPrediction.std / selectedPrediction.mean) * 100

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BarChart2 className="w-8 h-8" />
                        Model Uncertainty Visualization
                    </h1>
                    <p className="text-white/80 mt-1">Confidence intervals • Model disagreement • Upset probabilities</p>
                </div>
            </div>

            <div className="container mx-auto p-4 space-y-6">
                {/* Win Probability with Confidence Intervals */}
                <div className="bg-f1-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-teal-400" />
                        Win Probability with 95% Confidence Intervals
                    </h2>
                    <div className="space-y-4">
                        {predictions.slice(0, 6).map(pred => {
                            const driver = getDriver(pred.driver)
                            const isSelected = pred.driver === selectedDriver
                            return (
                                <button
                                    key={pred.driver}
                                    onClick={() => setSelectedDriver(pred.driver)}
                                    className={`w-full text-left transition ${isSelected ? 'scale-102' : 'opacity-75 hover:opacity-100'}`}
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-16 font-bold text-white">{pred.driver}</div>
                                        <div className="flex-1">
                                            {/* Confidence interval bar */}
                                            <div className="relative h-8 bg-f1-gray-700 rounded">
                                                {/* 95% CI range */}
                                                <div
                                                    className="absolute h-full rounded opacity-30"
                                                    style={{
                                                        left: `${pred.ci95Lower * 100}%`,
                                                        width: `${(pred.ci95Upper - pred.ci95Lower) * 100}%`,
                                                        backgroundColor: driver.color,
                                                    }}
                                                />
                                                {/* Mean line */}
                                                <div
                                                    className="absolute h-full w-1 rounded"
                                                    style={{
                                                        left: `${pred.mean * 100}%`,
                                                        backgroundColor: driver.color,
                                                    }}
                                                />
                                                {/* CI markers */}
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 w-2 h-4 rounded"
                                                    style={{
                                                        left: `${pred.ci95Lower * 100}%`,
                                                        backgroundColor: driver.color,
                                                    }}
                                                />
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 w-2 h-4 rounded"
                                                    style={{
                                                        left: `${pred.ci95Upper * 100}%`,
                                                        backgroundColor: driver.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-32 text-right">
                                            <span className="font-bold text-white">{(pred.mean * 100).toFixed(1)}%</span>
                                            <span className="text-gray-400 text-sm"> ± {(pred.std * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                    <div className="mt-4 p-3 bg-f1-gray-700/50 rounded-lg text-sm text-gray-400 flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Bars show the 95% confidence interval. Wider bars indicate higher model uncertainty for that prediction.</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Model Disagreement */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-400" />
                            Model Agreement: {selectedDriver}
                        </h2>
                        <div className="space-y-3">
                            {selectedPrediction.modelPreds.map(mp => (
                                <div key={mp.model} className="flex items-center gap-3">
                                    <div className="w-24 text-gray-300">{mp.model}</div>
                                    <div className="flex-1">
                                        <div className="h-6 bg-f1-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${mp.prediction * 100}%`,
                                                    backgroundColor: getDriver(selectedDriver).color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-16 text-right font-mono text-white">
                                        {(mp.prediction * 100).toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${modelDisagreement > 30 ? 'bg-red-500/20 text-red-400' :
                                modelDisagreement > 15 ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                            }`}>
                            <Activity className="w-5 h-5" />
                            <span>
                                Model Disagreement: <strong>{modelDisagreement.toFixed(1)}%</strong>
                                {modelDisagreement > 30 ? ' (High uncertainty)' :
                                    modelDisagreement > 15 ? ' (Moderate)' : ' (Models agree)'}
                            </span>
                        </div>
                    </div>

                    {/* Upset Probability */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-400" />
                            Upset Probability
                        </h2>
                        <p className="text-gray-400 text-sm mb-4">Probability of a surprise podium from lower-ranked drivers</p>
                        <div className="space-y-3">
                            {predictions.filter(p => p.upsetProb > 0).map(pred => {
                                const driver = getDriver(pred.driver)
                                return (
                                    <div key={pred.driver} className="flex items-center gap-3 bg-f1-gray-700 rounded-lg p-3">
                                        <div className="w-3 h-10 rounded" style={{ backgroundColor: driver.color }} />
                                        <div className="flex-1">
                                            <div className="font-bold text-white">{driver.name}</div>
                                            <div className="text-xs text-gray-400">Potential upset candidate</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-orange-400">{(pred.upsetProb * 100).toFixed(1)}%</div>
                                            <div className="text-xs text-gray-400">upset chance</div>
                                        </div>
                                    </div>
                                )
                            })}
                            {predictions.filter(p => p.upsetProb > 0).length === 0 && (
                                <div className="text-gray-500 text-center py-4">No significant upset candidates detected</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Championship Monte Carlo Fan Chart */}
                <div className="bg-f1-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Championship Monte Carlo Projections (1000 simulations)
                    </h2>
                    <div className="space-y-4">
                        {CHAMPIONSHIP_SIMS.map(sim => {
                            const driver = getDriver(sim.driver)
                            const range = sim.p90 - sim.p10
                            return (
                                <div key={sim.driver} className="flex items-center gap-4">
                                    <div className="w-16 font-bold text-white">{sim.driver}</div>
                                    <div className="flex-1 relative h-10">
                                        {/* Fan chart background */}
                                        <div className="absolute inset-y-0 bg-f1-gray-700 rounded" style={{ left: 0, right: 0 }} />

                                        {/* 10-90 percentile range */}
                                        <div
                                            className="absolute inset-y-1 rounded opacity-20"
                                            style={{
                                                left: `${(sim.p10 / 600) * 100}%`,
                                                width: `${(range / 600) * 100}%`,
                                                backgroundColor: driver.color
                                            }}
                                        />

                                        {/* 25-75 percentile range */}
                                        <div
                                            className="absolute inset-y-2 rounded opacity-40"
                                            style={{
                                                left: `${(sim.p25 / 600) * 100}%`,
                                                width: `${((sim.p75 - sim.p25) / 600) * 100}%`,
                                                backgroundColor: driver.color
                                            }}
                                        />

                                        {/* Median marker */}
                                        <div
                                            className="absolute top-0 bottom-0 w-1 rounded"
                                            style={{
                                                left: `${(sim.p50 / 600) * 100}%`,
                                                backgroundColor: driver.color
                                            }}
                                        />
                                    </div>
                                    <div className="w-20 text-right">
                                        <div className="font-bold text-white">{sim.p50} pts</div>
                                        <div className="text-xs text-gray-400">{sim.p10}-{sim.p90}</div>
                                    </div>
                                    <div className="w-20 text-right">
                                        <div className={`font-bold ${sim.winProb > 0.5 ? 'text-green-400' : sim.winProb > 0.1 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                            {(sim.winProb * 100).toFixed(0)}%
                                        </div>
                                        <div className="text-xs text-gray-400">WDC prob</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="mt-4 text-sm text-gray-400">
                        <span className="inline-block w-4 h-2 bg-gray-500 opacity-20 rounded mr-1"></span> P10-P90
                        <span className="inline-block w-4 h-2 bg-gray-500 opacity-40 rounded mx-1 ml-4"></span> P25-P75
                        <span className="inline-block w-4 h-1 bg-gray-500 rounded mx-1 ml-4"></span> Median
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="container mx-auto p-4">
                <Link href="/" className="text-teal-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
