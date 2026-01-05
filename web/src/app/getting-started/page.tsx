'use client'

import Link from 'next/link'
import { Flag, Rocket, Brain, BarChart3, Target, Zap, Users, Trophy, Clock, Info, ChevronRight, Lightbulb, Code, Database, Star, CheckCircle, Play } from 'lucide-react'

// Key features with non-F1 explanations
const CORE_FEATURES = [
    {
        title: 'Season Simulator',
        href: '/simulator',
        icon: Play,
        color: 'bg-purple-600',
        whatItDoes: 'Simulates entire racing seasons using machine learning',
        plainEnglish: 'Like predicting who wins the Super Bowl, but for 24 car races in a season. We run 10,000 simulations to see all possible outcomes.',
        techDemo: 'Monte Carlo simulation, probabilistic modeling, what-if analysis',
    },
    {
        title: 'Model Architecture',
        href: '/architecture',
        icon: Brain,
        color: 'bg-blue-600',
        whatItDoes: 'Shows all 8 machine learning models used for predictions',
        plainEnglish: 'We built 8 different AI systems that each predict race winners in their own way, then compare their accuracy.',
        techDemo: 'XGBoost, Neural Networks, Ensemble methods, model comparison',
    },
    {
        title: 'SHAP Explainer',
        href: '/explainer',
        icon: Lightbulb,
        color: 'bg-green-600',
        whatItDoes: 'Explains WHY the AI made each prediction',
        plainEnglish: 'Most AI is a "black box" - you don\'t know why it decided something. Our system shows exactly which factors influenced each prediction.',
        techDemo: 'SHAP values, feature importance, model interpretability',
    },
    {
        title: 'What-If Lab',
        href: '/counterfactual',
        icon: Target,
        color: 'bg-red-600',
        whatItDoes: 'Changes historical events to see alternate outcomes',
        plainEnglish: 'What if a controversial decision in a famous race went differently? This tool rewrites history to show what could have happened.',
        techDemo: 'Causal inference, counterfactual analysis, domain simulation',
    },
    {
        title: 'Live Predictions',
        href: '/live',
        icon: Zap,
        color: 'bg-orange-600',
        whatItDoes: 'Real-time race predictions as events unfold',
        plainEnglish: 'Like a sports prediction app that updates every second during a game, adjusting odds based on what\'s happening.',
        techDemo: 'Real-time inference, streaming data, live probability updates',
    },
    {
        title: 'Backtest Results',
        href: '/backtest',
        icon: BarChart3,
        color: 'bg-cyan-600',
        whatItDoes: 'Tests how accurate our predictions are on past data',
        plainEnglish: 'We test our AI against races that already happened (without cheating by using future data) to prove it actually works.',
        techDemo: 'Walk-forward validation, AUC-ROC, cross-validation',
    },
]

// Technical achievements explained for non-technical reviewers
const ACHIEVEMENTS = [
    { metric: '98.7%', label: 'AUC-ROC Score', explanation: 'Our models correctly rank winners 98.7% of the time (random chance would be 50%)' },
    { metric: '8', label: 'ML Models', explanation: 'We built 8 different prediction systems and compared their performance' },
    { metric: '10,000', label: 'Simulations', explanation: 'We run 10,000 possible season outcomes to estimate championship probabilities' },
    { metric: '68', label: 'Features', explanation: 'Our AI considers 68 different factors when making each prediction' },
]

// F1 basics for completely new users
const F1_BASICS = [
    { term: 'Formula 1 (F1)', definition: 'The world\'s most prestigious car racing series - 20 drivers, 10 teams, 24 races per year' },
    { term: 'Grand Prix', definition: 'A single race in the F1 calendar, held in different countries (like playoffs in other sports)' },
    { term: 'Championship', definition: 'Season-long competition where drivers earn points in each race; most points wins' },
    { term: 'Pit Stop', definition: 'When a car briefly stops during a race to change tires or make repairs' },
    { term: 'Machine Learning', definition: 'Teaching computers to find patterns in data and make predictions automatically' },
]

export default function GettingStartedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-100 to-white">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-f1-red to-red-700 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Flag className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">F1 Race Insights</h1>
                            <p className="text-xl text-white/80">Machine Learning for Formula 1 Predictions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* What Is This? - Plain English */}
            <div className="bg-white shadow-lg">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-2 text-f1-red font-bold mb-4">
                            <Info className="w-5 h-5" />
                            WHAT IS THIS PROJECT?
                        </div>
                        <h2 className="text-3xl font-bold text-f1-black mb-4">
                            An AI System That Predicts Race Outcomes
                        </h2>
                        <p className="text-lg text-f1-gray-700 leading-relaxed mb-6">
                            This is a <strong>machine learning application</strong> that predicts winners of Formula 1 car races.
                            Think of it like a sports betting algorithm, but for racing. The system analyzes historical data
                            from thousands of past races to predict future outcomes with <strong>98.7% accuracy</strong>.
                        </p>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                            <p className="text-blue-800">
                                <strong>No F1 knowledge required!</strong> This page explains everything you need to understand
                                what this project demonstrates technically.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Achievements - At a Glance */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold text-center mb-8">Technical Achievements</h2>
                <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {ACHIEVEMENTS.map(a => (
                        <div key={a.label} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
                            <div className="text-4xl font-bold text-f1-red mb-2">{a.metric}</div>
                            <div className="font-bold text-f1-black mb-2">{a.label}</div>
                            <div className="text-sm text-f1-gray-600">{a.explanation}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Core Features - With Plain English Explanations */}
            <div className="bg-f1-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-2">Key Features to Explore</h2>
                    <p className="text-center text-white/60 mb-8">Each feature is explained in plain English - no F1 knowledge needed</p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {CORE_FEATURES.map(feature => (
                            <Link
                                key={feature.href}
                                href={feature.href}
                                className="bg-f1-gray-800 rounded-xl p-6 hover:bg-f1-gray-700 transition group"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">{feature.title}</h3>
                                </div>
                                <p className="text-white/80 mb-3">{feature.whatItDoes}</p>
                                <div className="bg-white/10 rounded-lg p-3 mb-3">
                                    <div className="text-xs text-yellow-400 font-bold mb-1">💡 Plain English:</div>
                                    <p className="text-sm text-white/70">{feature.plainEnglish}</p>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-f1-red">
                                    <Code className="w-4 h-4" />
                                    <span>{feature.techDemo}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-white/50 mt-2 group-hover:text-white transition">
                                    Explore feature <ChevronRight className="w-4 h-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* F1 Basics - Optional Learning */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Quick F1 Glossary (Optional)
                    </h2>
                    <p className="text-f1-gray-600 mb-6">
                        If you want to understand some F1 terminology you might see in the app:
                    </p>
                    <div className="grid gap-4">
                        {F1_BASICS.map(item => (
                            <div key={item.term} className="bg-white rounded-lg shadow p-4 flex gap-4">
                                <div className="w-8 h-8 bg-f1-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 text-f1-red" />
                                </div>
                                <div>
                                    <div className="font-bold text-f1-black">{item.term}</div>
                                    <div className="text-f1-gray-600">{item.definition}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Technical Skills Demonstrated */}
            <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-400" />
                            Technical Skills Demonstrated
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-pink-400" />
                                    Machine Learning
                                </h3>
                                <ul className="space-y-2 text-white/80">
                                    <li>• 8 different ML models (XGBoost, CatBoost, Neural Networks)</li>
                                    <li>• Custom neural architecture (NBT-TLF)</li>
                                    <li>• Feature engineering with 68 predictors</li>
                                    <li>• SHAP explainability</li>
                                    <li>• Monte Carlo simulations</li>
                                </ul>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-cyan-400" />
                                    Data Engineering
                                </h3>
                                <ul className="space-y-2 text-white/80">
                                    <li>• ETL pipeline for F1 race data</li>
                                    <li>• Real-time data streaming</li>
                                    <li>• Walk-forward backtesting</li>
                                    <li>• Feature store implementation</li>
                                    <li>• API rate limiting and caching</li>
                                </ul>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Code className="w-5 h-5 text-green-400" />
                                    Full-Stack Development
                                </h3>
                                <ul className="space-y-2 text-white/80">
                                    <li>• Next.js 14 with React</li>
                                    <li>• TypeScript throughout</li>
                                    <li>• Python ML backend (FastAPI)</li>
                                    <li>• Responsive, accessible UI</li>
                                    <li>• Interactive data visualizations</li>
                                </ul>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Rocket className="w-5 h-5 text-orange-400" />
                                    MLOps & DevOps
                                </h3>
                                <ul className="space-y-2 text-white/80">
                                    <li>• Model versioning and registry</li>
                                    <li>• A/B testing infrastructure</li>
                                    <li>• Model drift monitoring</li>
                                    <li>• Docker containerization</li>
                                    <li>• CI/CD pipeline</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Explore?</h2>
                <p className="text-f1-gray-600 mb-6">Start with the Season Simulator to see ML predictions in action</p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                        href="/simulator"
                        className="bg-f1-red text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2"
                    >
                        <Play className="w-5 h-5" />
                        Start Simulating
                    </Link>
                    <Link
                        href="/architecture"
                        className="bg-f1-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-f1-gray-700 transition flex items-center gap-2"
                    >
                        <Brain className="w-5 h-5" />
                        View ML Models
                    </Link>
                    <Link
                        href="/"
                        className="border-2 border-f1-gray-300 text-f1-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-f1-gray-50 transition"
                    >
                        Browse All Features
                    </Link>
                </div>
            </div>
        </div>
    )
}
