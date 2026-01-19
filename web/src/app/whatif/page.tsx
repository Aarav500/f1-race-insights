'use client'

import { useState } from 'react'
import { postCounterfactual, CounterfactualResponse } from '@/utils/api'
import { Loader2, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Target, Award, Info } from 'lucide-react'
import Link from 'next/link'

// 2024 driver lineup (actual data in backend)
const DRIVERS_2024 = [
    { id: 'VER', name: 'Max Verstappen', team: 'Red Bull Racing' },
    { id: 'PER', name: 'Sergio Pérez', team: 'Red Bull Racing' },
    { id: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes' },
    { id: 'RUS', name: 'George Russell', team: 'Mercedes' },
    { id: 'LEC', name: 'Charles Leclerc', team: 'Ferrari' },
    { id: 'SAI', name: 'Carlos Sainz Jr.', team: 'Ferrari' },
    { id: 'NOR', name: 'Lando Norris', team: 'McLaren' },
    { id: 'PIA', name: 'Oscar Piastri', team: 'McLaren' },
    { id: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin' },
    { id: 'STR', name: 'Lance Stroll', team: 'Aston Martin' },
    { id: 'GAS', name: 'Pierre Gasly', team: 'Alpine' },
    { id: 'OCO', name: 'Esteban Ocon', team: 'Alpine' },
    { id: 'ALB', name: 'Alex Albon', team: 'Williams' },
    { id: 'SAR', name: 'Logan Sargeant', team: 'Williams' },
    { id: 'HUL', name: 'Nico Hülkenberg', team: 'Haas' },
    { id: 'MAG', name: 'Kevin Magnussen', team: 'Haas' },
    { id: 'TSU', name: 'Yuki Tsunoda', team: 'RB' },
    { id: 'RIC', name: 'Daniel Ricciardo', team: 'RB' },
    { id: 'BOT', name: 'Valtteri Bottas', team: 'Sauber' },
    { id: 'ZHO', name: 'Zhou Guanyu', team: 'Sauber' },
]

// 2024 races with actual data in backend
const RACES_2024 = [
    { id: '2024_01', name: 'Bahrain Grand Prix', round: 1 },
    { id: '2024_02', name: 'Saudi Arabian Grand Prix', round: 2 },
    { id: '2024_03', name: 'Australian Grand Prix', round: 3 },
    { id: '2024_04', name: 'Japanese Grand Prix', round: 4 },
    { id: '2024_05', name: 'Chinese Grand Prix', round: 5 },
    { id: '2024_06', name: 'Miami Grand Prix', round: 6 },
    { id: '2024_07', name: 'Emilia Romagna Grand Prix', round: 7 },
    { id: '2024_08', name: 'Monaco Grand Prix', round: 8 },
    { id: '2024_09', name: 'Canadian Grand Prix', round: 9 },
    { id: '2024_10', name: 'Spanish Grand Prix', round: 10 },
    { id: '2024_11', name: 'Austrian Grand Prix', round: 11 },
    { id: '2024_12', name: 'British Grand Prix', round: 12 },
    { id: '2024_13', name: 'Hungarian Grand Prix', round: 13 },
    { id: '2024_14', name: 'Belgian Grand Prix', round: 14 },
    { id: '2024_15', name: 'Dutch Grand Prix', round: 15 },
    { id: '2024_16', name: 'Italian Grand Prix', round: 16 },
    { id: '2024_17', name: 'Azerbaijan Grand Prix', round: 17 },
    { id: '2024_18', name: 'Singapore Grand Prix', round: 18 },
    { id: '2024_19', name: 'United States Grand Prix', round: 19 },
    { id: '2024_20', name: 'Mexican Grand Prix', round: 20 },
    { id: '2024_21', name: 'São Paulo Grand Prix', round: 21 },
    { id: '2024_22', name: 'Las Vegas Grand Prix', round: 22 },
    { id: '2024_23', name: 'Qatar Grand Prix', round: 23 },
    { id: '2024_24', name: 'Abu Dhabi Grand Prix', round: 24 },
]

// ALL 8 models with accuracy from backtest
const ALL_MODELS: Record<string, { auc: number; brier: number; type: string }> = {
    'lr': { auc: 0.987, brier: 0.019, type: 'Logistic Regression' },
    'rf': { auc: 0.985, brier: 0.021, type: 'Random Forest' },
    'cat': { auc: 0.985, brier: 0.021, type: 'CatBoost' },
    'xgb': { auc: 0.983, brier: 0.024, type: 'XGBoost' },
    'quali_freq': { auc: 0.981, brier: 0.018, type: 'Qualifying Frequency' },
    'lgbm': { auc: 0.975, brier: 0.028, type: 'LightGBM' },
    'nbt_tlf': { auc: 0.950, brier: 0.030, type: 'Neural Bradley-Terry' },
    'elo': { auc: 0.440, brier: 0.048, type: 'Elo Rating' },
}

export default function WhatIfLabPage() {
    const [selectedRace, setSelectedRace] = useState(RACES_2024[0].id)
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
        setResult(null)
        try {
            const changes: Record<string, number> = {}
            if (qualiDelta !== 0) changes.qualifying_position_delta = qualiDelta
            if (driverFormDelta !== 0) changes.driver_form_delta = driverFormDelta
            if (constructorFormDelta !== 0) changes.constructor_form_delta = constructorFormDelta
            if (reliabilityDelta !== 0) changes.reliability_risk_delta = reliabilityDelta

            const res = await postCounterfactual(selectedRace, selectedDriver, changes, selectedModel)
            setResult(res)
        } catch (e: any) {
            console.error('Counterfactual error:', e)
            setError(e.message || 'Failed to compute what-if scenario. Try a different model or driver.')
        } finally {
            setLoading(false)
        }
    }

    const selectedDriverInfo = DRIVERS_2024.find(d => d.id === selectedDriver)
    const selectedRaceInfo = RACES_2024.find(r => r.id === selectedRace)
    const modelInfo = ALL_MODELS[selectedModel]

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-f1-black mb-2 flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-f1-red" />
                    What-If Lab
                </h1>
                <p className="text-f1-gray-600">
                    Explore how changes to driver attributes affect win probability predictions
                </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex gap-2 items-start">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-blue-800">How It Works</h3>
                        <p className="text-sm text-blue-700">
                            Select a 2024 race and driver, then adjust the sliders to see how changes to
                            qualifying position, driver form, team form, and reliability affect win probability.
                            All 8 models are available for comparison.
                        </p>
                    </div>
                </div>
            </div>

            {/* F1 API Data Notice */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
                <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-orange-800">Why 2024 Races Only?</h3>
                        <p className="text-sm text-orange-700">
                            This project uses the official F1 API (Ergast/FastF1) which provides data through
                            <strong> 2024 only</strong>. Even though 2025 races have occurred, the API has not released that data yet.
                            What-If analysis requires actual race features which are only available for 2020-2024.
                        </p>
                    </div>
                </div>
            </div>

            {/* Selection Panel */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">1. Select Race, Driver & Model</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Race Selector */}
                    <div>
                        <label className="block text-sm font-medium mb-1">2024 Race</label>
                        <select
                            value={selectedRace}
                            onChange={(e) => setSelectedRace(e.target.value)}
                            className="w-full px-4 py-2 border border-f1-gray-300 rounded-lg"
                        >
                            {RACES_2024.map(race => (
                                <option key={race.id} value={race.id}>
                                    R{race.round}: {race.name}
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
                            {DRIVERS_2024.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.name} ({driver.team})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Model Selector - ALL 8 MODELS */}
                    <div>
                        <label className="block text-sm font-medium mb-1">ML Model (All 8)</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-4 py-2 border border-f1-gray-300 rounded-lg"
                        >
                            {Object.entries(ALL_MODELS)
                                .sort(([, a], [, b]) => b.auc - a.auc)
                                .map(([model, info]) => (
                                    <option key={model} value={model}>
                                        {model.toUpperCase()} - {info.type} (AUC: {(info.auc * 100).toFixed(1)}%)
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                {/* Model Accuracy Badge */}
                {modelInfo && (
                    <div className="mt-4 flex gap-3 flex-wrap">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            AUC: {(modelInfo.auc * 100).toFixed(1)}%
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            Brier: {modelInfo.brier.toFixed(3)}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {modelInfo.type}
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
                            Qualifying Position Delta: <span className="font-bold text-f1-red">{qualiDelta > 0 ? `+${qualiDelta}` : qualiDelta}</span>
                        </label>
                        <input
                            type="range"
                            min={-10}
                            max={10}
                            value={qualiDelta}
                            onChange={(e) => setQualiDelta(parseInt(e.target.value))}
                            className="w-full accent-f1-red"
                        />
                        <div className="flex justify-between text-xs text-f1-gray-500">
                            <span>10 places better</span>
                            <span>10 places worse</span>
                        </div>
                    </div>

                    {/* Driver Form */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Driver Form Improvement: <span className="font-bold text-f1-red">{(driverFormDelta * 100).toFixed(0)}%</span>
                        </label>
                        <input
                            type="range"
                            min={-50}
                            max={50}
                            value={driverFormDelta * 100}
                            onChange={(e) => setDriverFormDelta(parseInt(e.target.value) / 100)}
                            className="w-full accent-f1-red"
                        />
                        <div className="flex justify-between text-xs text-f1-gray-500">
                            <span>-50% (worse)</span>
                            <span>+50% (better)</span>
                        </div>
                    </div>

                    {/* Constructor Form */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Constructor Form Improvement: <span className="font-bold text-f1-red">{(constructorFormDelta * 100).toFixed(0)}%</span>
                        </label>
                        <input
                            type="range"
                            min={-50}
                            max={50}
                            value={constructorFormDelta * 100}
                            onChange={(e) => setConstructorFormDelta(parseInt(e.target.value) / 100)}
                            className="w-full accent-f1-red"
                        />
                        <div className="flex justify-between text-xs text-f1-gray-500">
                            <span>-50% (worse)</span>
                            <span>+50% (better)</span>
                        </div>
                    </div>

                    {/* Reliability Risk */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Reliability Risk Delta: <span className="font-bold text-f1-red">{(reliabilityDelta * 100).toFixed(0)}%</span>
                        </label>
                        <input
                            type="range"
                            min={-20}
                            max={20}
                            value={reliabilityDelta * 100}
                            onChange={(e) => setReliabilityDelta(parseInt(e.target.value) / 100)}
                            className="w-full accent-f1-red"
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
                    className="mt-6 w-full px-6 py-3 bg-f1-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 font-bold"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                    Compute What-If Scenario
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                    <div className="flex gap-2 items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <p className="text-red-700 font-medium">Error</p>
                            <p className="text-red-600 text-sm">{error}</p>
                            <p className="text-red-500 text-xs mt-1">Try a different model (e.g., XGB or LR) or check if the driver participated in this race.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                    <div className="bg-f1-gray-900 text-white p-4">
                        <h2 className="text-xl font-bold">
                            Results: {selectedDriverInfo?.name} at {selectedRaceInfo?.name}
                        </h2>
                        <p className="text-sm text-f1-gray-300">Model: {selectedModel.toUpperCase()} ({modelInfo?.type})</p>
                    </div>
                    <div className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Win Probability */}
                            <div className="text-center p-4 bg-f1-gray-50 rounded-lg">
                                <p className="text-sm text-f1-gray-600 mb-1">Win Probability</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-3xl font-bold">
                                        {((result.counterfactual?.win_prob || 0) * 100).toFixed(1)}%
                                    </span>
                                    {result.delta && (
                                        <span className={`flex items-center ${result.delta.win_prob >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.delta.win_prob >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {(result.delta.win_prob * 100).toFixed(2)}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-f1-gray-500 mt-1">
                                    Baseline: {((result.baseline?.win_prob || 0) * 100).toFixed(1)}%
                                </p>
                            </div>

                            {/* Podium Probability */}
                            <div className="text-center p-4 bg-f1-gray-50 rounded-lg">
                                <p className="text-sm text-f1-gray-600 mb-1">Podium Probability</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-3xl font-bold">
                                        {((result.counterfactual?.podium_prob || 0) * 100).toFixed(1)}%
                                    </span>
                                    {result.delta && (
                                        <span className={`flex items-center ${result.delta.podium_prob >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.delta.podium_prob >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {(result.delta.podium_prob * 100).toFixed(2)}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-f1-gray-500 mt-1">
                                    Baseline: {((result.baseline?.podium_prob || 0) * 100).toFixed(1)}%
                                </p>
                            </div>

                            {/* Expected Finish */}
                            <div className="text-center p-4 bg-f1-gray-50 rounded-lg">
                                <p className="text-sm text-f1-gray-600 mb-1">Expected Finish</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-3xl font-bold">
                                        P{(result.counterfactual?.expected_finish || 0).toFixed(1)}
                                    </span>
                                    {result.delta && (
                                        <span className={`flex items-center ${result.delta.expected_finish <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.delta.expected_finish <= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {result.delta.expected_finish.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-f1-gray-500 mt-1">
                                    Baseline: P{(result.baseline?.expected_finish || 0).toFixed(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* All Models Reference */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">All 8 Models Available</h2>
                <div className="grid md:grid-cols-4 gap-4">
                    {Object.entries(ALL_MODELS)
                        .sort(([, a], [, b]) => b.auc - a.auc)
                        .map(([model, info]) => (
                            <div
                                key={model}
                                className={`p-3 rounded-lg border ${selectedModel === model ? 'border-f1-red bg-red-50' : 'border-f1-gray-200'}`}
                            >
                                <div className="font-bold">{model.toUpperCase()}</div>
                                <div className="text-xs text-f1-gray-600">{info.type}</div>
                                <div className="text-sm mt-1">AUC: {(info.auc * 100).toFixed(1)}%</div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 flex-wrap">
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
                <Link
                    href="/backtest"
                    className="px-4 py-2 border border-f1-gray-300 rounded-lg hover:bg-f1-gray-100"
                >
                    View Backtest Results →
                </Link>
            </div>
        </div>
    )
}
