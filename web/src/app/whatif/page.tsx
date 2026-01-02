'use client'

import { useState, useEffect } from 'react'
import { postCounterfactual, CounterfactualResponse } from '@/utils/api'
import { Loader2, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Target, Award } from 'lucide-react'
import Link from 'next/link'

// 2025 driver lineup
const DRIVERS_2025 = [
    { id: 'VER', name: 'Max Verstappen', team: 'Red Bull Racing' },
    { id: 'LAW', name: 'Liam Lawson', team: 'Red Bull Racing' },
    { id: 'HAM', name: 'Lewis Hamilton', team: 'Scuderia Ferrari' },
    { id: 'LEC', name: 'Charles Leclerc', team: 'Scuderia Ferrari' },
    { id: 'RUS', name: 'George Russell', team: 'Mercedes-AMG Petronas' },
    { id: 'ANT', name: 'Andrea Kimi Antonelli', team: 'Mercedes-AMG Petronas' },
    { id: 'NOR', name: 'Lando Norris', team: 'McLaren' },
    { id: 'PIA', name: 'Oscar Piastri', team: 'McLaren' },
    { id: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin' },
    { id: 'STR', name: 'Lance Stroll', team: 'Aston Martin' },
    { id: 'GAS', name: 'Pierre Gasly', team: 'Alpine' },
    { id: 'DOO', name: 'Jack Doohan', team: 'Alpine' },
    { id: 'ALB', name: 'Alex Albon', team: 'Williams' },
    { id: 'SAI', name: 'Carlos Sainz Jr.', team: 'Williams' },
    { id: 'OCO', name: 'Esteban Ocon', team: 'Haas' },
    { id: 'BEA', name: 'Oliver Bearman', team: 'Haas' },
    { id: 'TSU', name: 'Yuki Tsunoda', team: 'RB' },
    { id: 'HAD', name: 'Isack Hadjar', team: 'RB' },
    { id: 'HUL', name: 'Nico Hülkenberg', team: 'Stake F1 (Sauber)' },
    { id: 'BOR', name: 'Gabriel Bortoleto', team: 'Stake F1 (Sauber)' },
]

// 2025 races
const RACES_2025 = [
    { id: '2025_01', name: 'Bahrain Grand Prix', date: '2025-03-02' },
    { id: '2025_02', name: 'Saudi Arabian Grand Prix', date: '2025-03-09' },
    { id: '2025_03', name: 'Australian Grand Prix', date: '2025-03-23' },
    { id: '2025_04', name: 'Japanese Grand Prix', date: '2025-04-06' },
    { id: '2025_05', name: 'Chinese Grand Prix', date: '2025-04-20' },
    { id: '2025_06', name: 'Miami Grand Prix', date: '2025-05-04' },
    { id: '2025_07', name: 'Emilia Romagna Grand Prix', date: '2025-05-18' },
    { id: '2025_08', name: 'Monaco Grand Prix', date: '2025-05-25' },
    { id: '2025_09', name: 'Spanish Grand Prix', date: '2025-06-01' },
    { id: '2025_10', name: 'Canadian Grand Prix', date: '2025-06-15' },
    { id: '2025_11', name: 'Austrian Grand Prix', date: '2025-06-29' },
    { id: '2025_12', name: 'British Grand Prix', date: '2025-07-06' },
    { id: '2025_13', name: 'Belgian Grand Prix', date: '2025-07-27' },
    { id: '2025_14', name: 'Hungarian Grand Prix', date: '2025-08-03' },
    { id: '2025_15', name: 'Dutch Grand Prix', date: '2025-08-31' },
    { id: '2025_16', name: 'Italian Grand Prix', date: '2025-09-07' },
    { id: '2025_17', name: 'Azerbaijan Grand Prix', date: '2025-09-21' },
    { id: '2025_18', name: 'Singapore Grand Prix', date: '2025-10-05' },
    { id: '2025_19', name: 'United States Grand Prix', date: '2025-10-19' },
    { id: '2025_20', name: 'Mexican Grand Prix', date: '2025-10-26' },
    { id: '2025_21', name: 'São Paulo Grand Prix', date: '2025-11-09' },
    { id: '2025_22', name: 'Las Vegas Grand Prix', date: '2025-11-22' },
    { id: '2025_23', name: 'Qatar Grand Prix', date: '2025-11-30' },
    { id: '2025_24', name: 'Abu Dhabi Grand Prix', date: '2025-12-07' },
]

// Model accuracy from backtest
const MODEL_ACCURACY: Record<string, { auc: number; brier: number }> = {
    'lr': { auc: 0.987, brier: 0.019 },
    'rf': { auc: 0.985, brier: 0.021 },
    'cat': { auc: 0.985, brier: 0.021 },
    'xgb': { auc: 0.983, brier: 0.024 },
    'quali_freq': { auc: 0.981, brier: 0.018 },
    'lgbm': { auc: 0.975, brier: 0.028 },
}

export default function WhatIfLabPage() {
    const [selectedRace, setSelectedRace] = useState(RACES_2025[0].id)
    const [selectedDriver, setSelectedDriver] = useState('VER')
    const [selectedModel, setSelectedModel] = useState('xgb')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<CounterfactualResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Sliders
    const [qualiDelta, setQualiDelta] = useState(0)
    const [driverFormDelta, setDriverFormDelta] = useState(0)
    const [constructorFormDelta, setConstructorFormDelta] = useState(0)
    const [reliabilityDelta, setReliabilityDelta] = useState(0)

    const computeWhatIf = async () => {
        setLoading(true)
        setError(null)
        try {
            const changes: Record<string, number> = {}
            if (qualiDelta !== 0) changes.qualifying_position_delta = qualiDelta
            if (driverFormDelta !== 0) changes.driver_form_delta = driverFormDelta
            if (constructorFormDelta !== 0) changes.constructor_form_delta = constructorFormDelta
            if (reliabilityDelta !== 0) changes.reliability_risk_delta = reliabilityDelta

            const res = await postCounterfactual(selectedRace, selectedDriver, changes, selectedModel)
            setResult(res)
        } catch (e: any) {
            setError(e.message || 'Failed to compute what-if scenario')
        } finally {
            setLoading(false)
        }
    }

    const selectedDriverInfo = DRIVERS_2025.find(d => d.id === selectedDriver)
    const selectedRaceInfo = RACES_2025.find(r => r.id === selectedRace)
    const modelAccuracy = MODEL_ACCURACY[selectedModel]

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-f1-black mb-2 flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-f1-red" />
                    What-If Lab (2025 Season)
                </h1>
                <p className="text-f1-gray-600">
                    Explore how changes to driver attributes affect win probability predictions
                </p>
            </div>

            {/* Important Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-yellow-800">Prediction Notice</h3>
                        <p className="text-sm text-yellow-700">
                            <strong>Training Data:</strong> 2020-2024 seasons (2,140 samples) •
                            <strong> Prediction Target:</strong> 2025 future races •
                            Models are extrapolating beyond training distribution. Accuracy metrics shown are from historical backtest.
                        </p>
                    </div>
                </div>
            </div>

            {/* Selection Panel */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">1. Select Race & Driver</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Race Selector */}
                    <div>
                        <label className="block text-sm font-medium mb-1">2025 Race</label>
                        <select
                            value={selectedRace}
                            onChange={(e) => setSelectedRace(e.target.value)}
                            className="w-full px-4 py-2 border border-f1-gray-300 rounded-lg"
                        >
                            {RACES_2025.map(race => (
                                <option key={race.id} value={race.id}>
                                    {race.name} ({race.date})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Driver Selector */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Driver</label>
                        <select
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                            className="w-full px-4 py-2 border border-f1-gray-300 rounded-lg"
                        >
                            {DRIVERS_2025.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.name} ({driver.team})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Model Selector */}
                    <div>
                        <label className="block text-sm font-medium mb-1">ML Model</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-4 py-2 border border-f1-gray-300 rounded-lg"
                        >
                            {Object.entries(MODEL_ACCURACY).map(([model, acc]) => (
                                <option key={model} value={model}>
                                    {model.toUpperCase()} (AUC: {(acc.auc * 100).toFixed(1)}%)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Model Accuracy Badge */}
                {modelAccuracy && (
                    <div className="mt-4 flex gap-3">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            AUC: {(modelAccuracy.auc * 100).toFixed(1)}%
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            Brier: {modelAccuracy.brier.toFixed(3)}
                        </span>
                    </div>
                )}
            </div>

            {/* What-If Sliders */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">2. Adjust Scenario</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Qualifying Position */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Qualifying Position Delta: <span className="font-bold">{qualiDelta > 0 ? `+${qualiDelta}` : qualiDelta}</span>
                        </label>
                        <input
                            type="range"
                            min={-10}
                            max={10}
                            value={qualiDelta}
                            onChange={(e) => setQualiDelta(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-f1-gray-500">
                            <span>10 places better</span>
                            <span>10 places worse</span>
                        </div>
                    </div>

                    {/* Driver Form */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Driver Form Improvement: <span className="font-bold">{(driverFormDelta * 100).toFixed(0)}%</span>
                        </label>
                        <input
                            type="range"
                            min={-50}
                            max={50}
                            value={driverFormDelta * 100}
                            onChange={(e) => setDriverFormDelta(parseInt(e.target.value) / 100)}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-f1-gray-500">
                            <span>-50% (worse)</span>
                            <span>+50% (better)</span>
                        </div>
                    </div>

                    {/* Constructor Form */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Constructor Form Improvement: <span className="font-bold">{(constructorFormDelta * 100).toFixed(0)}%</span>
                        </label>
                        <input
                            type="range"
                            min={-50}
                            max={50}
                            value={constructorFormDelta * 100}
                            onChange={(e) => setConstructorFormDelta(parseInt(e.target.value) / 100)}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-f1-gray-500">
                            <span>-50% (worse)</span>
                            <span>+50% (better)</span>
                        </div>
                    </div>

                    {/* Reliability Risk */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Reliability Risk Delta: <span className="font-bold">{(reliabilityDelta * 100).toFixed(0)}%</span>
                        </label>
                        <input
                            type="range"
                            min={-20}
                            max={20}
                            value={reliabilityDelta * 100}
                            onChange={(e) => setReliabilityDelta(parseInt(e.target.value) / 100)}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-f1-gray-500">
                            <span>More reliable</span>
                            <span>Less reliable</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={computeWhatIf}
                    disabled={loading}
                    className="mt-6 w-full px-6 py-3 bg-f1-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                    Compute What-If Scenario
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-f1-gray-900 text-white p-4">
                        <h2 className="text-xl font-bold">
                            Results: {selectedDriverInfo?.name} at {selectedRaceInfo?.name}
                        </h2>
                        <p className="text-sm text-f1-gray-300">Model: {selectedModel.toUpperCase()}</p>
                    </div>
                    <div className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Win Probability */}
                            <div className="text-center">
                                <p className="text-sm text-f1-gray-600 mb-1">Win Probability</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-3xl font-bold">
                                        {((result.counterfactual?.win_prob || 0) * 100).toFixed(1)}%
                                    </span>
                                    {result.delta && (
                                        <span className={`flex items-center ${result.delta.win_prob >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.delta.win_prob >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {(result.delta.win_prob * 100).toFixed(1)}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-f1-gray-500">
                                    Baseline: {((result.baseline?.win_prob || 0) * 100).toFixed(1)}%
                                </p>
                            </div>

                            {/* Podium Probability */}
                            <div className="text-center">
                                <p className="text-sm text-f1-gray-600 mb-1">Podium Probability</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-3xl font-bold">
                                        {((result.counterfactual?.podium_prob || 0) * 100).toFixed(1)}%
                                    </span>
                                    {result.delta && (
                                        <span className={`flex items-center ${result.delta.podium_prob >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.delta.podium_prob >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {(result.delta.podium_prob * 100).toFixed(1)}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-f1-gray-500">
                                    Baseline: {((result.baseline?.podium_prob || 0) * 100).toFixed(1)}%
                                </p>
                            </div>

                            {/* Expected Finish */}
                            <div className="text-center">
                                <p className="text-sm text-f1-gray-600 mb-1">Expected Finish</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-3xl font-bold">
                                        P{(result.counterfactual?.expected_finish || 0).toFixed(1)}
                                    </span>
                                    {result.delta && (
                                        <span className={`flex items-center ${result.delta.expected_finish <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.delta.expected_finish <= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {result.delta.expected_finish.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-f1-gray-500">
                                    Baseline: P{(result.baseline?.expected_finish || 0).toFixed(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Links */}
            <div className="mt-8 flex gap-4 flex-wrap">
                <Link
                    href="/compare"
                    className="px-4 py-2 border border-f1-gray-300 rounded-lg hover:bg-f1-gray-100"
                >
                    Compare All Models →
                </Link>
                <Link
                    href="/2026"
                    className="px-4 py-2 border border-f1-gray-300 rounded-lg hover:bg-f1-gray-100"
                >
                    2026 Regulations →
                </Link>
            </div>
        </div>
    )
}
