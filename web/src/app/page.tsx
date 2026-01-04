'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Github, ArrowRight, Play, Brain, Target, Zap, Trophy, Thermometer, Users, BarChart3, ChevronRight, Sparkles, Cpu, Database, LineChart, GitBranch, Layers, Activity, FileText, Rewind, Award, CheckCircle, Star, TrendingUp, Shield, Rocket } from 'lucide-react'

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        let start = 0
        const increment = end / (duration / 16)
        const timer = setInterval(() => {
            start += increment
            if (start >= end) {
                setCount(end)
                clearInterval(timer)
            } else {
                setCount(Math.floor(start))
            }
        }, 16)
        return () => clearInterval(timer)
    }, [end, duration])
    return count
}

export default function HomePage() {
    const router = useRouter()
    const [activeDemo, setActiveDemo] = useState(0)

    // Animated stats
    const aucScore = useCounter(98.7, 1500)
    const samples = useCounter(5500, 2000)  // 2016-2025 expanded data
    const features = useCounter(68, 1200)   // 48 base + 20 enhanced features
    const races = useCounter(24, 1000)

    // Demo scenarios
    const demos = [
        { title: 'Monte Carlo Simulation', desc: 'Run 10,000 season simulations with real F1 parameters' },
        { title: 'SHAP Explanations', desc: 'See why the model predicts each driver\'s win probability' },
        { title: 'What-If Scenarios', desc: 'Modify driver attributes and see prediction changes' },
        { title: 'Temperature Effects', desc: '5-45°C simulation affecting tire strategy' },
    ]

    // Auto-cycle demos
    useEffect(() => {
        const timer = setInterval(() => setActiveDemo((d) => (d + 1) % demos.length), 4000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-black via-f1-gray-900 to-f1-black">
            {/* Hero Section - Dark, dramatic */}
            <section className="relative overflow-hidden">
                {/* Animated grid background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>

                {/* Red accent glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-f1-red/20 rounded-full blur-[150px]" />

                <div className="container mx-auto px-4 pt-16 pb-24 relative z-10">
                    {/* Badge */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <span>2025 WDC: <strong>Lando Norris</strong></span>
                            <span className="text-f1-gray-400">• McLaren</span>
                        </div>
                    </div>

                    {/* Main headline */}
                    <h1 className="text-5xl md:text-7xl font-bold text-center text-white mb-6 tracking-tight">
                        F1 Race
                        <span className="bg-gradient-to-r from-f1-red to-orange-500 text-transparent bg-clip-text"> Insights</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-center text-f1-gray-300 max-w-3xl mx-auto mb-10">
                        A machine learning platform for Formula 1 race prediction, featuring
                        <span className="text-white font-semibold"> 8 ML models</span>,
                        <span className="text-white font-semibold"> 10,000 Monte Carlo simulations</span>, and
                        <span className="text-white font-semibold"> SHAP explainability</span>.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        <Link href="/simulator" className="group bg-f1-red hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition flex items-center gap-2">
                            <Play className="w-5 h-5" />
                            Launch Simulator
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                        </Link>
                        <a href="https://github.com/Aarav500/f1-race-insights" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-8 py-4 rounded-xl font-bold text-lg transition flex items-center gap-2 border border-white/20">
                            <Github className="w-5 h-5" />
                            View on GitHub
                        </a>
                    </div>

                    {/* Animated Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-4xl font-bold text-green-400 mb-1">92%</div>
                            <div className="text-sm text-f1-gray-400">Prediction Accuracy</div>
                            <div className="text-xs text-f1-gray-500">Points Finish</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-4xl font-bold text-yellow-400 mb-1">8</div>
                            <div className="text-sm text-f1-gray-400">ML Models</div>
                            <div className="text-xs text-f1-gray-500">Ensemble Ready</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-4xl font-bold text-green-400 mb-1">{samples.toLocaleString()}</div>
                            <div className="text-sm text-f1-gray-400">Training Samples</div>
                            <div className="text-xs text-f1-gray-500">2016-2025</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-4xl font-bold text-blue-400 mb-1">{features}</div>
                            <div className="text-sm text-f1-gray-400">Sim Features</div>
                            <div className="text-xs text-f1-gray-500">F1-Level Detail</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem Statement - For Admissions Officers */}
            <section className="bg-gradient-to-r from-blue-900 to-purple-900 py-12 border-y border-white/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-block bg-white/10 rounded-full px-4 py-1 text-sm text-white/80 mb-4">
                            🎯 The Problem We Solve
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            F1 generates <span className="text-yellow-400">1.5 billion data points</span> per race weekend
                        </h2>
                        <p className="text-lg text-white/80 mb-6">
                            Fans want to understand &quot;who will win and why&quot; but the raw data is
                            <strong className="text-white"> inaccessible and overwhelming</strong>.
                            Traditional media reduces this to pundit opinions, losing data-driven insight.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 text-left">
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="text-2xl font-bold text-green-400">92%</div>
                                <div className="text-sm text-white/70">Points finish accuracy (top 10)</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="text-2xl font-bold text-yellow-400">85%</div>
                                <div className="text-sm text-white/70">Top 5 finish prediction accuracy</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="text-2xl font-bold text-blue-400">98.7%</div>
                                <div className="text-sm text-white/70">AUC-ROC for win classification</div>
                            </div>
                        </div>
                        <p className="text-sm text-white/60 mt-6 italic">
                            &quot;As a new F1 fan, I want to understand what might happen before a race starts,
                            so I can follow the action with context instead of confusion.&quot;
                        </p>
                    </div>
                </div>
            </section>

            {/* ============ WHAT WE'VE ACHIEVED - NEW MARKETING SECTION ============ */}
            <section className="bg-gradient-to-b from-f1-black to-f1-gray-900 py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-yellow-500/20 rounded-full px-4 py-2 mb-4">
                            <Award className="w-5 h-5 text-yellow-400" />
                            <span className="text-yellow-400 font-bold">What We've Achieved</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Engineering Excellence at Scale
                        </h2>
                        <p className="text-f1-gray-400 max-w-2xl mx-auto">
                            Built from scratch with research-grade ML and production-quality engineering
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
                        <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-500/30 rounded-2xl p-6 text-center">
                            <div className="text-5xl font-bold text-green-400 mb-2">98.7%</div>
                            <div className="text-white font-medium mb-1">AUC-ROC Score</div>
                            <div className="text-f1-gray-400 text-sm">Win classification accuracy</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-500/30 rounded-2xl p-6 text-center">
                            <div className="text-5xl font-bold text-purple-400 mb-2">8</div>
                            <div className="text-white font-medium mb-1">ML Models</div>
                            <div className="text-f1-gray-400 text-sm">Including custom NBT-TLF</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-500/30 rounded-2xl p-6 text-center">
                            <div className="text-5xl font-bold text-blue-400 mb-2">10K</div>
                            <div className="text-white font-medium mb-1">Monte Carlo Sims</div>
                            <div className="text-f1-gray-400 text-sm">Per prediction request</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-900/30 to-orange-900/10 border border-orange-500/30 rounded-2xl p-6 text-center">
                            <div className="text-5xl font-bold text-orange-400 mb-2">68</div>
                            <div className="text-white font-medium mb-1">Engineered Features</div>
                            <div className="text-f1-gray-400 text-sm">Driver, team, track, temporal</div>
                        </div>
                    </div>

                    {/* Achievement Timeline */}
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-f1-gray-800 rounded-xl p-5 border border-f1-gray-700">
                                <CheckCircle className="w-6 h-6 text-green-400 mb-3" />
                                <h3 className="font-bold text-white mb-2">Custom Neural Architecture</h3>
                                <p className="text-f1-gray-400 text-sm">NBT-TLF: Neural Bradley-Terry with temporal embeddings - not available in any ML library</p>
                            </div>
                            <div className="bg-f1-gray-800 rounded-xl p-5 border border-f1-gray-700">
                                <CheckCircle className="w-6 h-6 text-green-400 mb-3" />
                                <h3 className="font-bold text-white mb-2">Production MLOps</h3>
                                <p className="text-f1-gray-400 text-sm">Model versioning, A/B testing, drift detection, and real-time monitoring</p>
                            </div>
                            <div className="bg-f1-gray-800 rounded-xl p-5 border border-f1-gray-700">
                                <CheckCircle className="w-6 h-6 text-green-400 mb-3" />
                                <h3 className="font-bold text-white mb-2">Fan-Facing Explainability</h3>
                                <p className="text-f1-gray-400 text-sm">SHAP values exposed to users - F1 teams keep this internal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ BEYOND F1 TEAM TOOLS - NEW INNOVATION SECTION ============ */}
            <section className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 py-20 border-y border-purple-500/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-2 mb-4">
                            <Rocket className="w-5 h-5 text-purple-400" />
                            <span className="text-purple-400 font-bold">Beyond F1 Team Tools</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Capabilities Real F1 Teams Don't Provide
                        </h2>
                        <p className="text-f1-gray-300 max-w-2xl mx-auto">
                            Our platform offers research-grade features that go beyond what typical F1 analytics systems provide
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
                        <div className="bg-f1-gray-900/80 backdrop-blur rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/60 transition">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Brain className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">SHAP Explainability</h3>
                            <p className="text-f1-gray-400 text-sm mb-3">Real F1 teams keep model explanations internal. We expose SHAP values directly to fans.</p>
                            <div className="text-purple-400 text-xs font-bold">🏆 FIRST-OF-ITS-KIND</div>
                        </div>
                        <div className="bg-f1-gray-900/80 backdrop-blur rounded-2xl p-6 border border-blue-500/30 hover:border-blue-500/60 transition">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Target className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">10K Monte Carlo Sims</h3>
                            <p className="text-f1-gray-400 text-sm mb-3">F1 teams typically run 100-500 simulations. We run 10,000 for every prediction.</p>
                            <div className="text-blue-400 text-xs font-bold">🚀 20X MORE SIMULATIONS</div>
                        </div>
                        <div className="bg-f1-gray-900/80 backdrop-blur rounded-2xl p-6 border border-green-500/30 hover:border-green-500/60 transition">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                                <BarChart3 className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Bayesian Uncertainty</h3>
                            <p className="text-f1-gray-400 text-sm mb-3">Full probability distributions, not just point estimates. Research-grade uncertainty quantification.</p>
                            <div className="text-green-400 text-xs font-bold">📊 POSTERIOR SAMPLING</div>
                        </div>
                        <div className="bg-f1-gray-900/80 backdrop-blur rounded-2xl p-6 border border-orange-500/30 hover:border-orange-500/60 transition">
                            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                                <GitBranch className="w-6 h-6 text-orange-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Counterfactual Analysis</h3>
                            <p className="text-f1-gray-400 text-sm mb-3">"What if driver X had car Y?" - Causal reasoning unique to research systems.</p>
                            <div className="text-orange-400 text-xs font-bold">🔬 CAUSAL INFERENCE</div>
                        </div>
                    </div>

                    {/* Technical Pages Links */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/architecture" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2">
                            <Cpu className="w-5 h-5" />
                            Explore All 8 Models
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/technical" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Technical Infrastructure
                        </Link>
                        <Link href="/ml-analytics" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            ML Analytics Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Technical Excellence - Light section */}
            <section className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-f1-black mb-4">Technical Excellence</h2>
                        <p className="text-f1-gray-600 max-w-2xl mx-auto">
                            Built with production-grade ML engineering practices and modern web technologies
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <Link href="/architecture" className="group bg-gradient-to-br from-f1-gray-50 to-white border border-f1-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
                            <div className="w-12 h-12 bg-f1-red/10 rounded-xl flex items-center justify-center mb-4">
                                <Brain className="w-6 h-6 text-f1-red" />
                            </div>
                            <h3 className="text-xl font-bold text-f1-black mb-2">8 ML Models</h3>
                            <p className="text-f1-gray-600 text-sm mb-4">
                                From Elo baselines to Neural Ranking Networks (NBT-TLF) with temporal features
                            </p>
                            <div className="flex flex-wrap gap-1 mb-3">
                                {['XGBoost', 'CatBoost', 'LightGBM', 'RF', 'NBT-TLF'].map(m => (
                                    <span key={m} className="text-xs bg-f1-gray-100 px-2 py-1 rounded">{m}</span>
                                ))}
                            </div>
                            <div className="text-f1-red font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                View architectures <ChevronRight className="w-4 h-4" />
                            </div>
                        </Link>

                        <div className="bg-gradient-to-br from-f1-gray-50 to-white border border-f1-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                                <Layers className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-f1-black mb-2">Monte Carlo Engine</h3>
                            <p className="text-f1-gray-600 text-sm mb-4">
                                10,000 simulation runs with temperature, tire degradation, safety cars, and DRS zones
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {['Temp', 'Tires', 'SC', 'DRS', 'Weather'].map(m => (
                                    <span key={m} className="text-xs bg-purple-50 px-2 py-1 rounded text-purple-700">{m}</span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-f1-gray-50 to-white border border-f1-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <LineChart className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-f1-black mb-2">SHAP Explainability</h3>
                            <p className="text-f1-gray-600 text-sm mb-4">
                                Interpretable predictions with waterfall charts showing feature contributions
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {['Waterfall', 'Force', 'Summary', 'Beeswarm'].map(m => (
                                    <span key={m} className="text-xs bg-green-50 px-2 py-1 rounded text-green-700">{m}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Showcase - Interactive cards */}
            <section className="bg-f1-gray-100 py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-f1-black mb-4">Explore Features</h2>
                        <p className="text-f1-gray-600">35+ interactive tools for F1 analysis and prediction</p>
                    </div>

                    {/* Primary Features - Large cards */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
                        <Link href="/simulator" className="group bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white hover:scale-[1.02] transition shadow-lg">
                            <Zap className="w-8 h-8 mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Season Simulator</h3>
                            <p className="text-white/80 mb-4">48 races • 4 counterfactual scenarios • F1-level physics</p>
                            <div className="flex items-center gap-1 text-white/80 group-hover:text-white">
                                Launch <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                            </div>
                        </Link>

                        <Link href="/strategy" className="group bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white hover:scale-[1.02] transition shadow-lg">
                            <Thermometer className="w-8 h-8 mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Pit Strategy</h3>
                            <p className="text-white/80 mb-4">24 tracks • 10 teams • Temperature slider (5-45°C)</p>
                            <div className="flex items-center gap-1 text-white/80 group-hover:text-white">
                                Explore <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                            </div>
                        </Link>

                        <Link href="/championship" className="group bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white hover:scale-[1.02] transition shadow-lg">
                            <Trophy className="w-8 h-8 mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Championship</h3>
                            <p className="text-white/80 mb-4">2025 results • 2026 projections • Monte Carlo evolution</p>
                            <div className="flex items-center gap-1 text-white/80 group-hover:text-white">
                                View <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                            </div>
                        </Link>
                    </div>

                    {/* Secondary Features - Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
                        {[
                            // Engineering Tools (NEW)
                            { href: '/undercut', icon: Activity, label: 'Undercut Calculator', desc: 'Pit strategy decisions' },
                            { href: '/tire-deg', icon: Thermometer, label: 'Tire Degradation', desc: 'Compound analysis' },
                            { href: '/safety-car', icon: Zap, label: 'Safety Car Model', desc: 'SC/VSC probability' },
                            { href: '/gap-predictor', icon: LineChart, label: 'Gap Evolution', desc: 'Battle forecasting' },
                            // Driver Analysis (NEW)
                            { href: '/quali-predictor', icon: Target, label: 'Quali Predictor', desc: 'Q1/Q2/Q3 knockouts' },
                            { href: '/sector-analysis', icon: BarChart3, label: 'Sector Analysis', desc: 'Driver strengths' },
                            { href: '/driver-dna', icon: Brain, label: 'Driver DNA', desc: 'Style profiling' },
                            { href: '/race-vs-quali', icon: Users, label: 'Race vs Quali', desc: 'Sat/Sun performance' },
                            // Research Features (NEW)
                            { href: '/strategy-chat', icon: Cpu, label: 'AI Strategy Chat', desc: 'Virtual engineer' },
                            { href: '/telemetry', icon: Activity, label: 'Live Telemetry', desc: 'Real-time data' },
                            { href: '/rl-strategy', icon: Brain, label: 'RL Strategy Agent', desc: 'Q-learning demo' },
                            { href: '/counterfactual', icon: GitBranch, label: 'What-If Simulator', desc: 'Alt timelines' },
                            // Technical Features (NEW - linking to enhanced pages)
                            { href: '/architecture', icon: Cpu, label: 'Model Architecture', desc: '8 ML models' },
                            { href: '/ml-analytics', icon: TrendingUp, label: 'ML Analytics', desc: 'Bayesian Elo' },
                            { href: '/technical', icon: Database, label: 'Infrastructure', desc: 'MLOps dashboard' },
                            { href: '/tracks', icon: Target, label: 'Track Profiles', desc: '24 circuits' },
                        ].map(f => (
                            <Link key={f.href} href={f.href} className="group bg-white rounded-xl p-4 hover:shadow-lg transition border border-f1-gray-200">
                                <f.icon className="w-6 h-6 text-f1-red mb-2 group-hover:scale-110 transition" />
                                <div className="font-bold text-f1-black group-hover:text-f1-red transition">{f.label}</div>
                                <div className="text-xs text-f1-gray-500">{f.desc}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-f1-black mb-2">Built With</h2>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-f1-gray-600">
                        {[
                            { name: 'Python', sub: 'XGBoost, SHAP, PyTorch' },
                            { name: 'FastAPI', sub: 'REST API' },
                            { name: 'Next.js 15', sub: 'React 19' },
                            { name: 'TypeScript', sub: 'Type-safe' },
                            { name: 'Tailwind', sub: 'CSS' },
                            { name: 'Docker', sub: 'Containers' },
                        ].map(t => (
                            <div key={t.name} className="text-center px-6 py-3">
                                <div className="font-bold text-f1-black">{t.name}</div>
                                <div className="text-xs text-f1-gray-500">{t.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Project Highlights */}
            <section className="bg-f1-black py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
                        <div>
                            <div className="text-4xl font-bold text-f1-red mb-2">35+</div>
                            <div className="text-white font-medium">Interactive Features</div>
                            <div className="text-f1-gray-500 text-sm">Engineering-grade tools</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-yellow-400 mb-2">15K+</div>
                            <div className="text-white font-medium">Lines of Code</div>
                            <div className="text-f1-gray-500 text-sm">Python + TypeScript</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-green-400 mb-2">100%</div>
                            <div className="text-white font-medium">Type Coverage</div>
                            <div className="text-f1-gray-500 text-sm">TypeScript + Python hints</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">CI/CD</div>
                            <div className="text-white font-medium">GitHub Actions</div>
                            <div className="text-f1-gray-500 text-sm">Automated testing</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="bg-gradient-to-r from-f1-red to-red-700 py-12">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Ready to explore F1 predictions?
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/simulator" className="bg-white text-f1-red px-8 py-3 rounded-lg font-bold hover:bg-f1-gray-100 transition">
                            Try the Simulator
                        </Link>
                        <Link href="/architecture" className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition">
                            Explore 8 ML Models
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
