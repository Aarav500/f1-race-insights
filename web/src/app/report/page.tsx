'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FileText, Download, Share2, Trophy, TrendingUp, AlertTriangle, Zap, CheckCircle } from 'lucide-react'

// Sample race data
const RACE_DATA = {
    name: '2024 Abu Dhabi Grand Prix',
    date: 'December 8, 2024',
    laps: 58,
    winner: 'NOR',
    podium: ['NOR', 'HAM', 'LEC'],
    fastestLap: 'VER',
    safetyCarLaps: [23, 24, 25],
    keyMoments: [
        { lap: 1, event: 'Clean start, VER leads from pole' },
        { lap: 15, event: 'NOR undercuts VER during pit window' },
        { lap: 23, event: 'Safety car for debris on track' },
        { lap: 26, event: 'Restart: NOR defends from VER' },
        { lap: 45, event: 'HAM overtakes LEC for P2' },
        { lap: 52, event: 'VER pits for softs, goes for fastest lap' },
        { lap: 58, event: 'NOR takes checkered flag - 2024 WDC!' },
    ],
}

const DRIVERS = {
    VER: { name: 'Max Verstappen', team: 'Red Bull', color: '#1E41FF' },
    NOR: { name: 'Lando Norris', team: 'McLaren', color: '#FF8700' },
    HAM: { name: 'Lewis Hamilton', team: 'Ferrari', color: '#DC0000' },
    LEC: { name: 'Charles Leclerc', team: 'Ferrari', color: '#DC0000' },
    PIA: { name: 'Oscar Piastri', team: 'McLaren', color: '#FF8700' },
}

// AI-generated insights
const AI_INSIGHTS = {
    topFactors: [
        { factor: 'Pit Strategy Undercut', impact: 'Critical', description: 'Norris gained track position on lap 15 by pitting 2 laps before Verstappen' },
        { factor: 'Safety Car Timing', impact: 'High', description: 'SC on lap 23 bunched the field but Norris defended restart perfectly' },
        { factor: 'Tire Management', impact: 'Medium', description: 'McLaren\'s superior tire deg in final stint sealed the victory' },
    ],
    counterfactuals: [
        { scenario: 'No Safety Car', result: 'Norris wins by 8.2 seconds (actual: 2.4s)', probability: 0.65 },
        { scenario: 'VER undercuts NOR', result: 'Verstappen likely wins, NOR P2', probability: 0.72 },
        { scenario: 'Rain at lap 40', result: 'Hamilton potential winner (wet specialist)', probability: 0.45 },
    ],
    driverGrades: [
        { driver: 'NOR', grade: 'A+', notes: 'Faultless drive, perfect tire management, championship secured' },
        { driver: 'HAM', grade: 'A', notes: 'Excellent overtake on Leclerc, strong final stint' },
        { driver: 'LEC', grade: 'B+', notes: 'Good pace but lost P2, Ferrari strategy suboptimal' },
        { driver: 'VER', grade: 'B', notes: 'Outstrategized, fastest lap consolation' },
    ],
}

export default function ReportPage() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)

    const handleGenerate = () => {
        setIsGenerating(true)
        setTimeout(() => setIsGenerating(false), 2000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-8 h-8" />
                        Race Report Generator
                    </h1>
                    <p className="text-white/80 mt-1">AI-powered post-race analysis • Exportable insights</p>
                </div>
            </div>

            <div className="container mx-auto p-4 space-y-6">
                {/* Race Header */}
                <div className="bg-f1-gray-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{RACE_DATA.name}</h2>
                        <p className="text-gray-400">{RACE_DATA.date} • {RACE_DATA.laps} laps</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition"
                        >
                            <Zap className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? 'Generating...' : 'Regenerate Report'}
                        </button>
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="bg-f1-gray-700 hover:bg-f1-gray-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition"
                        >
                            <Share2 className="w-5 h-5" />
                            Share
                        </button>
                        <button className="bg-f1-gray-700 hover:bg-f1-gray-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition">
                            <Download className="w-5 h-5" />
                            PDF
                        </button>
                    </div>
                </div>

                {/* Podium */}
                <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 rounded-xl p-6 border border-yellow-500/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        Podium
                    </h3>
                    <div className="flex justify-center gap-8">
                        {RACE_DATA.podium.map((driverId, idx) => {
                            const driver = DRIVERS[driverId as keyof typeof DRIVERS]
                            const positions = ['🥇', '🥈', '🥉']
                            return (
                                <div key={driverId} className="text-center">
                                    <div className="text-4xl mb-2">{positions[idx]}</div>
                                    <div className="w-4 h-1 mx-auto rounded mb-2" style={{ backgroundColor: driver.color, width: '60%' }} />
                                    <div className="font-bold text-white">{driver.name}</div>
                                    <div className="text-sm text-gray-400">{driver.team}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Top 3 Deciding Factors */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                            Top 3 Factors That Decided This Race
                        </h3>
                        <div className="space-y-4">
                            {AI_INSIGHTS.topFactors.map((factor, idx) => (
                                <div key={idx} className="bg-f1-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-white">{idx + 1}. {factor.factor}</div>
                                        <span className={`text-xs px-2 py-1 rounded ${factor.impact === 'Critical' ? 'bg-red-500/30 text-red-400' :
                                            factor.impact === 'High' ? 'bg-orange-500/30 text-orange-400' :
                                                'bg-yellow-500/30 text-yellow-400'
                                            }`}>
                                            {factor.impact}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{factor.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Counterfactual Analysis */}
                    <div className="bg-f1-gray-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-yellow-400" />
                            What If? Counterfactual Scenarios
                        </h3>
                        <div className="space-y-4">
                            {AI_INSIGHTS.counterfactuals.map((cf, idx) => (
                                <div key={idx} className="bg-f1-gray-700 rounded-lg p-4">
                                    <div className="font-bold text-white mb-1">&ldquo;{cf.scenario}&rdquo;</div>
                                    <p className="text-gray-400 text-sm mb-2">{cf.result}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-f1-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-500 rounded-full"
                                                style={{ width: `${cf.probability * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-400">{(cf.probability * 100).toFixed(0)}% confident</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Driver Grades */}
                <div className="bg-f1-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-blue-400" />
                        AI Driver Performance Grades
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {AI_INSIGHTS.driverGrades.map(dg => {
                            const driver = DRIVERS[dg.driver as keyof typeof DRIVERS]
                            const gradeColor = dg.grade.startsWith('A') ? 'text-green-400' :
                                dg.grade.startsWith('B') ? 'text-yellow-400' :
                                    dg.grade.startsWith('C') ? 'text-orange-400' : 'text-red-400'
                            return (
                                <div key={dg.driver} className="bg-f1-gray-700 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-3 h-12 rounded" style={{ backgroundColor: driver.color }} />
                                        <div>
                                            <div className="font-bold text-white">{driver.name}</div>
                                            <div className="text-xs text-gray-400">{driver.team}</div>
                                        </div>
                                        <div className={`ml-auto text-3xl font-bold ${gradeColor}`}>{dg.grade}</div>
                                    </div>
                                    <p className="text-gray-400 text-sm">{dg.notes}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Race Timeline */}
                <div className="bg-f1-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Race Timeline</h3>
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-f1-gray-600" />
                        <div className="space-y-4 pl-10">
                            {RACE_DATA.keyMoments.map((moment, idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-10 top-1 w-6 h-6 rounded-full bg-f1-gray-700 border-2 border-rose-500 flex items-center justify-center text-xs text-white">
                                        {moment.lap}
                                    </div>
                                    <div className="bg-f1-gray-700 rounded-lg p-3">
                                        <div className="text-gray-400 text-xs mb-1">Lap {moment.lap}</div>
                                        <div className="text-white">{moment.event}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-f1-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-white mb-4">Share Race Report</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href)
                                    alert('Link copied to clipboard!')
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold"
                            >
                                📋 Copy Link to Clipboard
                            </button>
                            <button
                                onClick={() => {
                                    const text = `Race Report: ${RACE_DATA.name}\nWinner: ${DRIVERS[RACE_DATA.winner as keyof typeof DRIVERS].name}\nPodium: ${RACE_DATA.podium.map(d => DRIVERS[d as keyof typeof DRIVERS].name).join(', ')}`
                                    navigator.clipboard.writeText(text)
                                    alert('Report summary copied!')
                                }}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold"
                            >
                                📝 Copy Report Summary
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="w-full bg-f1-gray-700 hover:bg-f1-gray-600 text-white py-3 rounded-lg font-bold"
                            >
                                🖨️ Print / Save as PDF
                            </button>
                        </div>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full mt-4 text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="container mx-auto p-4">
                <Link href="/" className="text-rose-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
