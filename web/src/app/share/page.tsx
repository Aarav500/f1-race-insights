'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Share2, Download, Twitter, Copy, CheckCircle, Trophy, Image, ChevronRight } from 'lucide-react'

// Sample prediction data for cards
const PREDICTION_TEMPLATES = [
    {
        id: 'race_prediction',
        title: 'Race Prediction',
        subtitle: 'Abu Dhabi GP 2025',
        predictions: [
            { pos: 1, driver: 'NOR', prob: 28.5, team: 'McLaren', color: '#FF8700' },
            { pos: 2, driver: 'VER', prob: 24.2, team: 'Red Bull', color: '#1E41FF' },
            { pos: 3, driver: 'LEC', prob: 18.1, team: 'Ferrari', color: '#DC0000' },
        ],
        modelInfo: 'XGBoost Ensemble • 98.7% AUC',
    },
    {
        id: 'championship',
        title: '2025 WDC Final',
        subtitle: 'Championship Prediction',
        predictions: [
            { pos: 1, driver: 'NOR', prob: 72, team: 'McLaren', color: '#FF8700' },
            { pos: 2, driver: 'VER', prob: 22, team: 'Red Bull', color: '#1E41FF' },
            { pos: 3, driver: 'LEC', prob: 4, team: 'Ferrari', color: '#DC0000' },
        ],
        modelInfo: 'Monte Carlo • 10,000 sims',
    },
    {
        id: 'podium',
        title: 'Podium Probabilities',
        subtitle: 'Next Race',
        predictions: [
            { pos: 1, driver: 'VER', prob: 85, team: 'Red Bull', color: '#1E41FF' },
            { pos: 2, driver: 'NOR', prob: 78, team: 'McLaren', color: '#FF8700' },
            { pos: 3, driver: 'HAM', prob: 62, team: 'Ferrari', color: '#DC0000' },
        ],
        modelInfo: 'LightGBM • Podium Model',
    },
]

export default function ShareCardsPage() {
    const [selectedTemplate, setSelectedTemplate] = useState(PREDICTION_TEMPLATES[0])
    const [copied, setCopied] = useState(false)
    const [bgStyle, setBgStyle] = useState<'dark' | 'gradient' | 'team'>('dark')
    const cardRef = useRef<HTMLDivElement>(null)

    const handleCopy = () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const getBgClass = () => {
        switch (bgStyle) {
            case 'gradient': return 'bg-gradient-to-br from-f1-red to-purple-600'
            case 'team': return 'bg-gradient-to-br from-[#FF8700] to-[#FF4500]'
            default: return 'bg-f1-black'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Share2 className="w-8 h-8" />
                        Shareable Prediction Cards
                    </h1>
                    <p className="text-white/80 mt-1">Social media ready images • Custom branding</p>
                </div>
            </div>

            <div className="container mx-auto p-4 grid lg:grid-cols-2 gap-6">
                {/* Card Preview */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">Preview</h2>
                    <div
                        ref={cardRef}
                        className={`rounded-2xl p-6 shadow-2xl ${getBgClass()}`}
                        style={{ aspectRatio: '1.91 / 1' }}
                    >
                        <div className="h-full flex flex-col">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-white/60 text-sm">{selectedTemplate.subtitle}</div>
                                    <h3 className="text-2xl font-bold text-white">{selectedTemplate.title}</h3>
                                </div>
                                <div className="flex items-center gap-1 text-white/80">
                                    <Image className="w-5 h-5" />
                                    <span className="text-sm font-bold">F1 INSIGHTS</span>
                                </div>
                            </div>

                            {/* Predictions */}
                            <div className="flex-1 flex flex-col justify-center gap-3">
                                {selectedTemplate.predictions.map(pred => (
                                    <div key={pred.driver} className="flex items-center gap-4 bg-white/10 rounded-lg p-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: pred.color }}>
                                            {pred.pos}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-white text-lg">{pred.driver}</div>
                                            <div className="text-white/60 text-xs">{pred.team}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">{pred.prob}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-center mt-4 text-white/50 text-xs">
                                <span>{selectedTemplate.modelInfo}</span>
                                <span>f1-race-insights.vercel.app</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <h3 className="font-bold text-white mb-3">Select Template</h3>
                        <div className="space-y-2">
                            {PREDICTION_TEMPLATES.map(temp => (
                                <button
                                    key={temp.id}
                                    onClick={() => setSelectedTemplate(temp)}
                                    className={`w-full text-left p-3 rounded-lg transition ${selectedTemplate.id === temp.id ? 'bg-cyan-600' : 'bg-f1-gray-700 hover:bg-f1-gray-600'}`}
                                >
                                    <div className="font-bold text-white">{temp.title}</div>
                                    <div className="text-sm text-gray-400">{temp.subtitle}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <h3 className="font-bold text-white mb-3">Background Style</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'dark', label: 'Dark', preview: 'bg-f1-black' },
                                { id: 'gradient', label: 'Gradient', preview: 'bg-gradient-to-br from-f1-red to-purple-600' },
                                { id: 'team', label: 'Team', preview: 'bg-gradient-to-br from-orange-500 to-red-500' },
                            ].map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => setBgStyle(style.id as typeof bgStyle)}
                                    className={`p-3 rounded-lg border-2 transition ${bgStyle === style.id ? 'border-cyan-500' : 'border-transparent'}`}
                                >
                                    <div className={`h-8 rounded mb-2 ${style.preview}`} />
                                    <div className="text-sm text-white text-center">{style.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <h3 className="font-bold text-white mb-3">Share</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white py-3 rounded-lg font-bold transition">
                                <Twitter className="w-5 h-5" />
                                Twitter
                            </button>
                            <button
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-2 bg-f1-gray-700 hover:bg-f1-gray-600 text-white py-3 rounded-lg font-bold transition"
                            >
                                {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition col-span-2">
                                <Download className="w-5 h-5" />
                                Download PNG
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-cyan-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
