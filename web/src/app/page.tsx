'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, FileText, Github, BookOpen, Cpu } from 'lucide-react'
import RacePicker from '@/components/RacePicker'

export default function HomePage() {
    const router = useRouter()

    const handleRaceSelect = (raceId: string, raceName: string) => {
        router.push(`/race/${raceId}`)
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold mb-4 text-f1-black">
                    F1 Race Insights
                </h1>
                <p className="text-xl text-f1-gray-600 mb-8 max-w-3xl mx-auto">
                    A comprehensive machine learning system for Formula 1 race outcome prediction,
                    featuring 8 models from simple baselines to neural ranking networks with
                    interpretability and counterfactual analysis.
                </p>

                {/* Race Picker for quick navigation */}
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

            {/* What This System Does */}
            <div className="bg-gradient-to-r from-f1-red to-red-700 text-white rounded-lg p-8 mb-16">
                <h2 className="text-3xl font-bold mb-4">What This System Does</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold text-lg mb-2">🎯 Prediction</h3>
                        <p className="text-white/90">
                            Predict race outcomes (win probability, podium probability, expected finish)
                            using historical data and machine learning models trained on temporal features.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">🔍 Interpretation</h3>
                        <p className="text-white/90">
                            Explain predictions using SHAP values, permutation importance, and component
                            ablation to understand which factors drive outcomes.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">🔮 Counterfactuals</h3>
                        <p className="text-white/90">
                            Answer "what-if" questions by modifying driver features (qualifying position,
                            form, reliability) and observing prediction changes.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">📊 Evaluation</h3>
                        <p className="text-white/90">
                            Rigorous walk-forward backtesting with proper calibration, multiple metrics
                            (AUC, Brier, ECE), and comparison across 8 different models.
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <FeatureCard
                    icon={<BarChart3 className="w-8 h-8 text-f1-red" />}
                    title="Race Predictions"
                    description="Interactive predictions for any race with model selection and visual probability distributions."
                    href="/race-explorer"
                />
                <FeatureCard
                    icon={<TrendingUp className="w-8 h-8 text-f1-red" />}
                    title="Model Comparison"
                    description="Compare 8 models: baselines (Elo, quali freq), tree models (XGB, LGBM, CAT), and neural ranking (NBT-TLF)."
                    href="/backtest"
                />
                <FeatureCard
                    icon={<Cpu className="w-8 h-8 text-f1-red" />}
                    title="Counterfactual Analysis"
                    description="Explore what-if scenarios by adjusting driver attributes and observing prediction impacts."
                    href="/race-explorer"
                />
            </div>

            {/* Models */}
            <div className="bg-f1-gray-100 rounded-lg p-8 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-f1-black">8 Model Types</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ModelCard title="Baselines" models={['Qualifying Freq', 'Elo Rating']} />
                    <ModelCard title="Tree Models" models={['XGBoost', 'LightGBM', 'CatBoost']} />
                    <ModelCard title="Linear" models={['Logistic Reg', 'Random Forest']} />
                    <ModelCard title="Neural" models={['NBT-TLF']} />
                </div>
            </div>

            {/* Technical Resources */}
            <div className="grid md:grid-cols-1 gap-8 mb-16">
                <ResourceCard
                    icon={<BookOpen className="w-6 h-6 text-f1-red" />}
                    title="Technical Paper"
                    description="Paper-ready documentation with model formulations, evaluation protocol, and results."
                    href="https://github.com/Aarav500/f1-race-insights/blob/main/docs/F1.md"
                    label="Read Paper"
                />
            </div>

            {/* Quick Start */}
            <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold mb-4 text-f1-black">Quick Start</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold mb-2">1. Get Predictions</h3>
                        <code className="block bg-f1-gray-900 text-white p-3 rounded text-sm overflow-x-auto">
                            curl "http://localhost:8000/api/f1/predict/race/2024_01?model=xgb"
                        </code>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">2. Get Explanations</h3>
                        <code className="block bg-f1-gray-900 text-white p-3 rounded text-sm overflow-x-auto">
                            curl "http://localhost:8000/api/f1/explain/race/2024_01?driver_id=VER&model=xgb"
                        </code>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">3. Explore UI</h3>
                        <p className="text-f1-gray-700">
                            Use the navigation above to explore predictions, explanations, and counterfactuals interactively.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeatureCard({ icon, title, description, href }: {
    icon: React.ReactNode
    title: string
    description: string
    href: string
}) {
    return (
        <Link href={href} className="block">
            <div className="bg-white border border-f1-gray-200 rounded-lg p-6 hover:shadow-lg transition h-full">
                <div className="mb-4">{icon}</div>
                <h3 className="text-xl font-bold mb-2 text-f1-black">{title}</h3>
                <p className="text-f1-gray-600">{description}</p>
            </div>
        </Link>
    )
}

function ModelCard({ title, models }: { title: string; models: string[] }) {
    return (
        <div className="bg-white p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-f1-black">{title}</h3>
            <ul className="space-y-1">
                {models.map((model) => (
                    <li key={model} className="text-sm text-f1-gray-700">• {model}</li>
                ))}
            </ul>
        </div>
    )
}

function ResourceCard({ icon, title, description, href, label }: {
    icon: React.ReactNode
    title: string
    description: string
    href: string
    label: string
}) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-4">
                <div className="mt-1">{icon}</div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-f1-black">{title}</h3>
                    <p className="text-f1-gray-600 mb-4">{description}</p>
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-f1-red hover:underline font-medium"
                    >
                        {label} →
                    </a>
                </div>
            </div>
        </div>
    )
}
