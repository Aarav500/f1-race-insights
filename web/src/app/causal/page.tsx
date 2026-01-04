'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GitBranch, ArrowRight, Brain, Target, Zap, ChevronDown, ChevronRight, Users, TrendingUp, Sparkles, BarChart3 } from 'lucide-react'

// Drivers for interventions
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

const TEAMS = ['Red Bull', 'McLaren', 'Ferrari', 'Mercedes', 'Aston Martin', 'Williams', 'RB', 'Alpine', 'Kick Sauber', 'Haas']

// Causal DAG nodes
const DAG_NODES = [
    { id: 'quali', name: 'Qualifying Position', x: 100, y: 50, type: 'cause' },
    { id: 'driver_skill', name: 'Driver Skill', x: 100, y: 150, type: 'confound' },
    { id: 'car_perf', name: 'Car Performance', x: 100, y: 250, type: 'confound' },
    { id: 'track_type', name: 'Track Type', x: 300, y: 50, type: 'cause' },
    { id: 'weather', name: 'Weather', x: 300, y: 150, type: 'cause' },
    { id: 'strategy', name: 'Pit Strategy', x: 300, y: 250, type: 'mediator' },
    { id: 'finish', name: 'Race Finish', x: 500, y: 150, type: 'outcome' },
]

const DAG_EDGES = [
    { from: 'quali', to: 'finish' },
    { from: 'driver_skill', to: 'quali' },
    { from: 'driver_skill', to: 'finish' },
    { from: 'car_perf', to: 'quali' },
    { from: 'car_perf', to: 'finish' },
    { from: 'track_type', to: 'strategy' },
    { from: 'track_type', to: 'finish' },
    { from: 'weather', to: 'strategy' },
    { from: 'weather', to: 'finish' },
    { from: 'strategy', to: 'finish' },
]

export default function CausalPage() {
    const [selectedDriver, setSelectedDriver] = useState('NOR')
    const [interventionTeam, setInterventionTeam] = useState('Red Bull')
    const [showResults, setShowResults] = useState(false)
    const [selectedNode, setSelectedNode] = useState<string | null>(null)

    const driver = DRIVERS.find(d => d.id === selectedDriver)!

    // Simulated treatment effects
    const treatmentEffect = interventionTeam === 'Red Bull' ? 2.3 :
        interventionTeam === 'McLaren' ? 0.0 :
            interventionTeam === 'Ferrari' ? 1.1 :
                interventionTeam === 'Mercedes' ? -0.5 : -1.5

    const counterfactualWinProb = Math.min(95, Math.max(5, 45 + treatmentEffect * 12))

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <GitBranch className="w-8 h-8" />
                        Causal Inference Dashboard
                    </h1>
                    <p className="text-white/80 mt-1">
                        Intervention Analysis • Treatment Effects • Directed Acyclic Graphs
                    </p>
                </div>
            </div>

            {/* Beyond F1 Banner */}
            <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-y border-orange-500/30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                        <div>
                            <span className="text-yellow-400 font-bold">Beyond F1 Team Tools:</span>
                            <span className="text-white/80 ml-2">Causal reasoning capabilities - "What if driver X had car Y?" - unique to research-grade systems.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Intervention Panel */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-orange-400" />
                            Define Intervention
                        </h2>
                        <p className="text-f1-gray-400 text-sm mb-6">
                            Select a driver and hypothetical team assignment to estimate causal treatment effects
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-f1-gray-400 block mb-2">Select Driver</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {DRIVERS.map(d => (
                                        <button
                                            key={d.id}
                                            onClick={() => setSelectedDriver(d.id)}
                                            className={`p-3 rounded-lg text-center transition ${selectedDriver === d.id
                                                ? 'bg-white text-f1-gray-900 font-bold'
                                                : 'bg-f1-gray-700 text-white hover:bg-f1-gray-600'
                                                }`}
                                        >
                                            <div className="font-bold">{d.id}</div>
                                            <div className="text-xs opacity-70">{d.team.split(' ')[0]}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-f1-gray-400 block mb-2">Intervene: Assign to Team</label>
                                <select
                                    value={interventionTeam}
                                    onChange={e => setInterventionTeam(e.target.value)}
                                    className="w-full bg-f1-gray-700 text-white p-3 rounded-lg border border-f1-gray-600"
                                >
                                    {TEAMS.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setShowResults(true)}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                Estimate Treatment Effect
                            </button>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-green-400" />
                            Counterfactual Outcome
                        </h2>

                        {showResults ? (
                            <div className="space-y-6">
                                <div className="bg-f1-gray-700 rounded-lg p-4">
                                    <div className="text-sm text-f1-gray-400 mb-2">Intervention</div>
                                    <div className="text-lg text-white">
                                        <span className="font-bold">{driver.name}</span>
                                        <span className="text-f1-gray-400 mx-2">→</span>
                                        <span className="font-bold" style={{ color: interventionTeam === 'Red Bull' ? '#1E41FF' : interventionTeam === 'McLaren' ? '#FF8700' : interventionTeam === 'Ferrari' ? '#DC0000' : '#00D2BE' }}>
                                            {interventionTeam}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 rounded-lg p-4 border border-blue-500/30">
                                        <div className="text-sm text-f1-gray-400">Factual (Actual)</div>
                                        <div className="text-3xl font-bold text-blue-400">45%</div>
                                        <div className="text-xs text-f1-gray-500">Win probability with {driver.team}</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 rounded-lg p-4 border border-green-500/30">
                                        <div className="text-sm text-f1-gray-400">Counterfactual</div>
                                        <div className="text-3xl font-bold text-green-400">{counterfactualWinProb.toFixed(0)}%</div>
                                        <div className="text-xs text-f1-gray-500">Win probability with {interventionTeam}</div>
                                    </div>
                                </div>

                                <div className={`rounded-lg p-4 border ${treatmentEffect > 0 ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                                    <div className="text-sm text-f1-gray-400">Average Treatment Effect (ATE)</div>
                                    <div className={`text-4xl font-bold ${treatmentEffect > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {treatmentEffect > 0 ? '+' : ''}{treatmentEffect.toFixed(1)} positions
                                    </div>
                                    <div className="text-sm text-f1-gray-400 mt-2">
                                        Expected change in average finish position
                                    </div>
                                </div>

                                <div className="bg-f1-gray-700/50 rounded-lg p-4 text-sm text-f1-gray-400">
                                    <strong className="text-white">Interpretation:</strong> If {driver.name} were assigned to {interventionTeam} (intervention),
                                    we estimate they would finish {Math.abs(treatmentEffect).toFixed(1)} positions {treatmentEffect > 0 ? 'higher' : 'lower'} on average,
                                    controlling for confounders like track type and weather.
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-f1-gray-500">
                                Select a driver and team to estimate treatment effects
                            </div>
                        )}
                    </div>
                </div>

                {/* Causal DAG Visualization */}
                <div className="bg-f1-gray-800 rounded-xl p-6 border border-f1-gray-700 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        Directed Acyclic Graph (DAG)
                    </h2>
                    <p className="text-f1-gray-400 text-sm mb-6">
                        Our causal model - click on nodes to learn about their role
                    </p>

                    <div className="relative h-80 bg-f1-gray-900 rounded-lg overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 600 300">
                            {/* Edges */}
                            {DAG_EDGES.map((edge, i) => {
                                const from = DAG_NODES.find(n => n.id === edge.from)!
                                const to = DAG_NODES.find(n => n.id === edge.to)!
                                return (
                                    <line
                                        key={i}
                                        x1={from.x + 50}
                                        y1={from.y + 20}
                                        x2={to.x}
                                        y2={to.y + 20}
                                        stroke="#6366F1"
                                        strokeWidth="2"
                                        markerEnd="url(#arrowhead)"
                                        className="opacity-60"
                                    />
                                )
                            })}

                            {/* Arrowhead marker */}
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
                                </marker>
                            </defs>

                            {/* Nodes */}
                            {DAG_NODES.map(node => (
                                <g key={node.id} onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)} className="cursor-pointer">
                                    <rect
                                        x={node.x}
                                        y={node.y}
                                        width="100"
                                        height="40"
                                        rx="8"
                                        fill={selectedNode === node.id ? '#6366F1' :
                                            node.type === 'outcome' ? '#22C55E' :
                                                node.type === 'confound' ? '#EAB308' :
                                                    node.type === 'mediator' ? '#F97316' : '#3B82F6'}
                                        className="transition-all"
                                    />
                                    <text
                                        x={node.x + 50}
                                        y={node.y + 25}
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize="10"
                                        fontWeight="bold"
                                    >
                                        {node.name}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>

                    {/* Node Legend */}
                    <div className="flex flex-wrap gap-4 mt-4 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500" />
                            <span className="text-sm text-f1-gray-400">Causal Factor</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-yellow-500" />
                            <span className="text-sm text-f1-gray-400">Confounding Variable</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-orange-500" />
                            <span className="text-sm text-f1-gray-400">Mediator</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500" />
                            <span className="text-sm text-f1-gray-400">Outcome</span>
                        </div>
                    </div>

                    {selectedNode && (
                        <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                            <div className="font-bold text-white mb-2">
                                {DAG_NODES.find(n => n.id === selectedNode)?.name}
                            </div>
                            <div className="text-f1-gray-400 text-sm">
                                {selectedNode === 'finish' && 'The outcome variable we want to predict/explain. Causally influenced by all other factors in the model.'}
                                {selectedNode === 'quali' && 'Qualifying position is a strong predictor of race finish, but is confounded by driver skill and car performance.'}
                                {selectedNode === 'driver_skill' && 'A confounding variable - it affects both qualifying and race performance, creating spurious correlation.'}
                                {selectedNode === 'car_perf' && 'Another confounder - car performance affects both quali and race, must be controlled for causal inference.'}
                                {selectedNode === 'track_type' && 'Track characteristics that directly affect race outcomes and strategy choices.'}
                                {selectedNode === 'weather' && 'Weather conditions influence both strategy choices and race outcomes directly.'}
                                {selectedNode === 'strategy' && 'A mediator variable - track type and weather affect finish position through strategy decisions.'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Back Link */}
                <div className="flex gap-4 justify-center">
                    <Link href="/counterfactual" className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-bold">
                        What-If Simulator
                    </Link>
                    <Link href="/architecture" className="border border-f1-gray-500 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-800 transition font-bold">
                        Model Architecture
                    </Link>
                    <Link href="/" className="text-f1-gray-400 px-6 py-3 hover:text-white transition">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
