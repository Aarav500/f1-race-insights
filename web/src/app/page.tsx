'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, FileText, Github, BookOpen, Cpu, Trophy, Timer, Zap, Target, Brain, Shuffle, Thermometer, Flag, CloudRain } from 'lucide-react'
import RacePicker from '@/components/RacePicker'

export default function HomePage() {
    const router = useRouter()

    const handleRaceSelect = (raceId: string, raceName: string) => {
        router.push(`/race/${raceId}`)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 2025 Champion Banner */}
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 rounded-xl p-6 mb-8 text-white relative overflow-hidden">
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-9xl opacity-20">🏆</div>
                <div className="relative z-10">
                    <div className="text-sm opacity-80 uppercase tracking-wider">2025 World Champion</div>
                    <div className="text-4xl font-bold mb-1">Lando Norris • McLaren</div>
                    <div className="text-sm opacity-80">412 points • 8 wins • First British champion since Hamilton 2020</div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold mb-4 text-f1-black">
                    F1 Race Insights
                </h1>
                <p className="text-xl text-f1-gray-600 mb-6 max-w-3xl mx-auto">
                    F1-level predictive modeling and simulation for Formula 1 race outcomes,
                    featuring Monte Carlo season simulation, SHAP explanations, and counterfactual analysis.
                </p>

                {/* Race Picker */}
                <div className="max-w-2xl mx-auto mb-6">
                    <RacePicker
                        onRaceSelect={handleRaceSelect}
                        label="Try Predictions - Select a Race"
                    />
                </div>

                <div className="flex gap-4 justify-center flex-wrap">
                    <a
                        href="https://github.com/Aarav500/f1-race-insights"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-f1-gray-300 text-f1-black px-6 py-3 rounded-lg hover:bg-f1-gray-100 transition flex items-center gap-2"
                    >
                        <Github className="w-5 h-5" />
                        GitHub
                    </a>
                </div>
            </div>

            {/* Stats Banner - Updated for 2025 */}
            <div className="bg-gradient-to-r from-f1-gray-900 to-f1-gray-800 text-white rounded-xl p-6 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                        <div className="text-3xl font-bold text-f1-red">98.7%</div>
                        <div className="text-xs text-f1-gray-300">AUC Score</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-yellow-400">8</div>
                        <div className="text-xs text-f1-gray-300">ML Models</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-green-400">2,640</div>
                        <div className="text-xs text-f1-gray-300">Training Samples</div>
                        <div className="text-[10px] text-f1-gray-500">2020-2025</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-blue-400">24</div>
                        <div className="text-xs text-f1-gray-300">Races/Season</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-orange-400">48</div>
                        <div className="text-xs text-f1-gray-300">Simulated Features</div>
                        <div className="text-[10px] text-f1-gray-500">Temp, Tire, SC, DRS</div>
                    </div>
                </div>
            </div>

            {/* Featured: F1-Level Simulator */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-8 text-white">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Shuffle className="w-6 h-6" />
                            <span className="text-sm opacity-80 uppercase tracking-wider">New Feature</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-3">F1-Level Season Simulator</h2>
                        <p className="opacity-90 mb-4">
                            Full 24-race season simulation with real F1 features: temperature effects,
                            tire degradation, safety car probability, DRS zones, wet weather skills,
                            reliability DNFs, and strategic counterfactual &quot;what-if&quot; scenarios.
                        </p>
                        <Link href="/simulator" className="bg-white text-purple-700 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition inline-flex items-center gap-2">
                            <Target className="w-5 h-5" /> Launch Simulator
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 rounded-lg p-3">
                            <Thermometer className="w-5 h-5 mb-1" />
                            <div className="text-sm font-bold">Temperature</div>
                            <div className="text-xs opacity-70">12°C - 33°C range effects</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                            <CloudRain className="w-5 h-5 mb-1" />
                            <div className="text-sm font-bold">Weather</div>
                            <div className="text-xs opacity-70">Wet skill simulation</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                            <Flag className="w-5 h-5 mb-1" />
                            <div className="text-sm font-bold">Safety Cars</div>
                            <div className="text-xs opacity-70">18-65% probability/track</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                            <Zap className="w-5 h-5 mb-1" />
                            <div className="text-sm font-bold">What-If</div>
                            <div className="text-xs opacity-70">4 counterfactual scenarios</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Features - 2 Rows of 4 */}
            <div className="grid md:grid-cols-4 gap-4 mb-4">
                <Link href="/compare" className="bg-white border-2 border-f1-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-f1-red transition text-center group">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-bold group-hover:text-f1-red transition">Compare Models</div>
                    <div className="text-xs text-f1-gray-500">8 models side-by-side</div>
                </Link>
                <Link href="/whatif" className="bg-white border-2 border-f1-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-f1-red transition text-center group">
                    <div className="text-2xl mb-2">🔮</div>
                    <div className="font-bold group-hover:text-f1-red transition">What-If Lab</div>
                    <div className="text-xs text-f1-gray-500">Counterfactual analysis</div>
                </Link>
                <Link href="/head-to-head" className="bg-white border-2 border-f1-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-f1-red transition text-center group">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-bold group-hover:text-f1-red transition">Head-to-Head</div>
                    <div className="text-xs text-f1-gray-500">Driver battles</div>
                </Link>
                <Link href="/explainer" className="bg-white border-2 border-f1-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-f1-red transition text-center group">
                    <div className="text-2xl mb-2">🧠</div>
                    <div className="font-bold group-hover:text-f1-red transition">SHAP Explainer</div>
                    <div className="text-xs text-f1-gray-500">2025/2026 data</div>
                </Link>
            </div>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Link href="/championship" className="bg-white border-2 border-f1-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-f1-red transition text-center group">
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="font-bold group-hover:text-f1-red transition">Championship</div>
                    <div className="text-xs text-f1-gray-500">2025 results + 2026</div>
                </Link>
                <Link href="/strategy" className="bg-white border-2 border-f1-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-f1-red transition text-center group">
                    <div className="text-2xl mb-2">⛽</div>
                    <div className="font-bold group-hover:text-f1-red transition">Pit Strategy</div>
                    <div className="text-xs text-f1-gray-500">8 tracks, 6 teams</div>
                </Link>
                <Link href="/ticker" className="bg-white border-2 border-f1-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-f1-red transition text-center group">
                    <div className="text-2xl mb-2">⏱️</div>
                    <div className="font-bold group-hover:text-f1-red transition">2026 Ticker</div>
                    <div className="text-xs text-f1-gray-500">New regs countdown</div>
                </Link>
                <Link href="/career" className="bg-white border-2 border-f1-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-f1-red transition text-center group">
                    <div className="text-2xl mb-2">📈</div>
                    <div className="font-bold group-hover:text-f1-red transition">Career Timeline</div>
                    <div className="text-xs text-f1-gray-500">10 drivers, all stats</div>
                </Link>
            </div>

            {/* What This System Does */}
            <div className="bg-gradient-to-r from-f1-red to-red-700 text-white rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">What This System Does</h2>
                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <h3 className="font-bold mb-1">🎯 Prediction</h3>
                        <p className="text-white/80 text-sm">
                            Win probability, podium odds, expected finish using 8 ML models.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-1">🔍 Interpretation</h3>
                        <p className="text-white/80 text-sm">
                            SHAP values and feature importance for transparent predictions.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-1">🔮 Counterfactuals</h3>
                        <p className="text-white/80 text-sm">
                            What-if analysis: modify features, observe prediction changes.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-1">📊 Simulation</h3>
                        <p className="text-white/80 text-sm">
                            Monte Carlo season simulation with F1-level parameters.
                        </p>
                    </div>
                </div>
            </div>

            {/* Model Types */}
            <div className="bg-f1-gray-100 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-f1-black">8 Model Types</h2>
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="font-bold mb-2">Baselines</h3>
                        <ul className="text-sm text-f1-gray-700 space-y-1">
                            <li>• Qualifying Freq</li>
                            <li>• Elo Rating</li>
                        </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="font-bold mb-2">Tree Models</h3>
                        <ul className="text-sm text-f1-gray-700 space-y-1">
                            <li>• XGBoost</li>
                            <li>• LightGBM</li>
                            <li>• CatBoost</li>
                        </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="font-bold mb-2">Linear</h3>
                        <ul className="text-sm text-f1-gray-700 space-y-1">
                            <li>• Logistic Reg</li>
                            <li>• Random Forest</li>
                        </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="font-bold mb-2">Neural</h3>
                        <ul className="text-sm text-f1-gray-700 space-y-1">
                            <li>• NBT-TLF</li>
                            <li className="text-f1-red">⭐ Best AUC</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* More Features Grid */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">More Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Link href="/constructors" className="bg-white border rounded-lg p-3 hover:shadow transition text-center">
                        <span className="text-lg">🏢</span>
                        <div className="text-sm font-bold">Constructors</div>
                    </Link>
                    <Link href="/dashboard" className="bg-white border rounded-lg p-3 hover:shadow transition text-center">
                        <span className="text-lg">📡</span>
                        <div className="text-sm font-bold">Dashboard</div>
                    </Link>
                    <Link href="/training" className="bg-white border rounded-lg p-3 hover:shadow transition text-center">
                        <span className="text-lg">📉</span>
                        <div className="text-sm font-bold">Training Viz</div>
                    </Link>
                    <Link href="/abtesting" className="bg-white border rounded-lg p-3 hover:shadow transition text-center">
                        <span className="text-lg">🔬</span>
                        <div className="text-sm font-bold">A/B Testing</div>
                    </Link>
                    <Link href="/2026" className="bg-white border rounded-lg p-3 hover:shadow transition text-center">
                        <span className="text-lg">🚀</span>
                        <div className="text-sm font-bold">2026 Regs</div>
                    </Link>
                </div>
            </div>

            {/* Technical Resources */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-4">
                    <BookOpen className="w-6 h-6 text-f1-red mt-1" />
                    <div>
                        <h3 className="font-bold mb-1">Technical Paper</h3>
                        <p className="text-f1-gray-600 text-sm mb-2">
                            Paper-ready documentation with model formulations, evaluation protocol, and results.
                        </p>
                        <a
                            href="https://github.com/Aarav500/f1-race-insights/blob/main/docs/F1.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-f1-red hover:underline font-medium text-sm"
                        >
                            Read Paper →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
