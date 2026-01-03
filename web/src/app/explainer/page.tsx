'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, ArrowUp, ArrowDown, HelpCircle, Sparkles, ChevronRight } from 'lucide-react'

// Simulated SHAP values for demonstration
const SHAP_DATA: Record<string, Record<string, { features: { name: string; value: number; impact: number }[]; baseProb: number; finalProb: number }>> = {
    'VER': {
        '2024_01': {
            baseProb: 0.05,
            finalProb: 0.72,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.35 },
                { name: 'Driver Rolling Form', value: 2.1, impact: 0.18 },
                { name: 'Constructor Strength', value: 9.2, impact: 0.12 },
                { name: 'Track History (Bahrain)', value: 1.0, impact: 0.08 },
                { name: 'Reliability Risk', value: 0.02, impact: -0.02 },
                { name: 'Quali Delta to Pole', value: 0, impact: 0.04 },
                { name: 'DNF Rate (Historical)', value: 0.05, impact: -0.03 },
                { name: 'Constructor DNF Rate', value: 0.08, impact: -0.02 },
            ]
        },
        '2024_05': {
            baseProb: 0.05,
            finalProb: 0.58,
            features: [
                { name: 'Qualifying Position (P2)', value: 2, impact: 0.22 },
                { name: 'Driver Rolling Form', value: 2.3, impact: 0.15 },
                { name: 'Constructor Strength', value: 8.8, impact: 0.10 },
                { name: 'Track History (Monaco)', value: 3.0, impact: 0.04 },
                { name: 'Reliability Risk', value: 0.03, impact: -0.01 },
                { name: 'Quali Delta to Pole', value: 0.15, impact: 0.02 },
            ]
        }
    },
    'HAM': {
        '2024_01': {
            baseProb: 0.05,
            finalProb: 0.12,
            features: [
                { name: 'Qualifying Position (P5)', value: 5, impact: 0.04 },
                { name: 'Driver Rolling Form', value: 4.2, impact: 0.02 },
                { name: 'Constructor Strength', value: 6.5, impact: 0.01 },
                { name: 'Track History (Bahrain)', value: 1.5, impact: 0.02 },
                { name: 'Reliability Risk', value: 0.05, impact: -0.02 },
                { name: 'Quali Delta to Pole', value: 0.45, impact: -0.01 },
            ]
        }
    },
    'LEC': {
        '2024_01': {
            baseProb: 0.05,
            finalProb: 0.18,
            features: [
                { name: 'Qualifying Position (P3)', value: 3, impact: 0.08 },
                { name: 'Driver Rolling Form', value: 3.8, impact: 0.03 },
                { name: 'Constructor Strength', value: 7.2, impact: 0.02 },
                { name: 'Track History (Bahrain)', value: 2.0, impact: 0.01 },
                { name: 'Reliability Risk', value: 0.12, impact: -0.03 },
            ]
        }
    }
}

const DRIVERS = [
    { id: 'VER', name: 'Max Verstappen' },
    { id: 'HAM', name: 'Lewis Hamilton' },
    { id: 'LEC', name: 'Charles Leclerc' },
]

const RACES = [
    { id: '2024_01', name: 'Bahrain GP' },
    { id: '2024_05', name: 'Monaco GP' },
]

export default function ShapExplainerPage() {
    const [selectedDriver, setSelectedDriver] = useState('VER')
    const [selectedRace, setSelectedRace] = useState('2024_01')

    const shapData = SHAP_DATA[selectedDriver]?.[selectedRace]

    // Sort features by absolute impact
    const sortedFeatures = shapData?.features.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)) || []

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Brain className="w-10 h-10 text-purple-600" />
                    SHAP Explainer
                </h1>
                <p className="text-f1-gray-600">
                    Understand <em>why</em> our models make predictions using SHAP (SHapley Additive exPlanations)
                </p>
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
                <div className="flex gap-2 items-start">
                    <HelpCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-purple-800">How to Read SHAP Values</h3>
                        <p className="text-sm text-purple-700">
                            Each feature contribution shows how much it pushes the prediction up (green) or down (red)
                            from the base probability. The waterfall chart starts from the base ~5% and shows
                            cumulative effects to reach the final prediction.
                        </p>
                    </div>
                </div>
            </div>

            {/* Selectors */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium mb-2">Driver</label>
                    <select
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        className="w-full border rounded-lg p-3"
                    >
                        {DRIVERS.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Race</label>
                    <select
                        value={selectedRace}
                        onChange={(e) => setSelectedRace(e.target.value)}
                        className="w-full border rounded-lg p-3"
                    >
                        {RACES.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {shapData ? (
                <>
                    {/* Probability Summary */}
                    <div className="bg-gradient-to-r from-f1-gray-900 to-f1-gray-800 rounded-xl p-6 mb-8 text-white">
                        <div className="grid grid-cols-3 text-center">
                            <div>
                                <div className="text-sm opacity-75">Base Probability</div>
                                <div className="text-3xl font-bold">{(shapData.baseProb * 100).toFixed(1)}%</div>
                            </div>
                            <div className="flex items-center justify-center">
                                <ChevronRight className="w-8 h-8 text-f1-gray-500" />
                                <span className="text-sm px-2">SHAP</span>
                                <ChevronRight className="w-8 h-8 text-f1-gray-500" />
                            </div>
                            <div>
                                <div className="text-sm opacity-75">Final Prediction</div>
                                <div className="text-3xl font-bold text-green-400">{(shapData.finalProb * 100).toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Waterfall Chart */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-xl font-bold mb-6">Feature Contributions (Waterfall)</h2>

                        {/* Base */}
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                            <div className="w-48 text-sm text-f1-gray-600">Base Probability</div>
                            <div className="flex-1 relative h-8">
                                <div
                                    className="absolute h-full bg-f1-gray-300 rounded"
                                    style={{ width: `${shapData.baseProb * 100 * 3}%` }}
                                />
                            </div>
                            <div className="w-20 text-right font-mono">{(shapData.baseProb * 100).toFixed(1)}%</div>
                        </div>

                        {/* Features */}
                        {sortedFeatures.map((feature, i) => (
                            <div key={i} className="flex items-center gap-4 mb-3">
                                <div className="w-48 text-sm text-f1-gray-600 truncate" title={feature.name}>
                                    {feature.name}
                                </div>
                                <div className="flex-1 relative h-8 flex items-center">
                                    {feature.impact > 0 ? (
                                        <div
                                            className="h-full bg-green-500 rounded flex items-center justify-end pr-2"
                                            style={{ width: `${Math.abs(feature.impact) * 100 * 3}%` }}
                                        >
                                            <ArrowUp className="w-4 h-4 text-white" />
                                        </div>
                                    ) : (
                                        <div
                                            className="h-full bg-red-500 rounded flex items-center justify-end pr-2"
                                            style={{ width: `${Math.abs(feature.impact) * 100 * 3}%` }}
                                        >
                                            <ArrowDown className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className={`w-20 text-right font-mono ${feature.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {feature.impact > 0 ? '+' : ''}{(feature.impact * 100).toFixed(1)}%
                                </div>
                            </div>
                        ))}

                        {/* Final */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                            <div className="w-48 text-sm font-bold">Final Prediction</div>
                            <div className="flex-1 relative h-8">
                                <div
                                    className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded"
                                    style={{ width: `${shapData.finalProb * 100 * 1.2}%` }}
                                />
                            </div>
                            <div className="w-20 text-right font-mono font-bold text-purple-600">
                                {(shapData.finalProb * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Key Insight */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            Key Insight
                        </h3>
                        <p className="text-f1-gray-700">
                            The most influential feature for this prediction is <strong>{sortedFeatures[0]?.name}</strong>,
                            contributing <strong>{sortedFeatures[0]?.impact > 0 ? '+' : ''}{(sortedFeatures[0]?.impact * 100).toFixed(1)}%</strong> to
                            the win probability. {sortedFeatures[0]?.impact > 0
                                ? 'This significantly increases the driver\'s chances.'
                                : 'This slightly decreases the driver\'s chances.'}
                        </p>
                    </div>
                </>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <p className="text-yellow-800">No SHAP data available for this driver/race combination.</p>
                    <p className="text-sm text-yellow-600 mt-2">Try selecting VER + Bahrain GP for a demo.</p>
                </div>
            )}

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/head-to-head" className="bg-f1-gray-900 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-700 transition">
                    Head-to-Head
                </Link>
                <Link href="/whatif" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    What-If Lab
                </Link>
            </div>
        </div>
    )
}
