'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Brain, Play, Pause, RotateCcw, TrendingDown, Target, Zap, CheckCircle, AlertCircle } from 'lucide-react'

// Simulated training metrics
const MODELS = ['XGBoost', 'LightGBM', 'CatBoost', 'Logistic Regression', 'Random Forest']

const generateEpochData = (epoch: number, modelIdx: number) => {
    const baseLoss = 0.8 - modelIdx * 0.05
    const decay = 0.92 + modelIdx * 0.01
    const noise = (Math.random() - 0.5) * 0.02
    return {
        epoch,
        trainLoss: Math.max(0.05, baseLoss * Math.pow(decay, epoch) + noise),
        valLoss: Math.max(0.06, baseLoss * Math.pow(decay, epoch) * 1.1 + noise * 2),
        auc: Math.min(0.99, 0.5 + (epoch / 100) * 0.4 + modelIdx * 0.02),
        brier: Math.max(0.02, 0.5 - (epoch / 100) * 0.4 - modelIdx * 0.01),
    }
}

export default function TrainingPage() {
    const [isTraining, setIsTraining] = useState(false)
    const [currentEpoch, setCurrentEpoch] = useState(0)
    const [maxEpochs] = useState(100)
    const [selectedModel, setSelectedModel] = useState(0)
    const [trainingHistory, setTrainingHistory] = useState<ReturnType<typeof generateEpochData>[]>([])
    const [trainingSpeed, setTrainingSpeed] = useState(100)

    // Simulate training
    useEffect(() => {
        if (!isTraining) return
        if (currentEpoch >= maxEpochs) {
            setIsTraining(false)
            return
        }

        const timer = setTimeout(() => {
            const newData = generateEpochData(currentEpoch + 1, selectedModel)
            setTrainingHistory(prev => [...prev, newData])
            setCurrentEpoch(prev => prev + 1)
        }, trainingSpeed)

        return () => clearTimeout(timer)
    }, [isTraining, currentEpoch, maxEpochs, selectedModel, trainingSpeed])

    const resetTraining = () => {
        setCurrentEpoch(0)
        setTrainingHistory([])
        setIsTraining(false)
    }

    const latestMetrics = trainingHistory[trainingHistory.length - 1]
    const maxLoss = Math.max(...trainingHistory.map(h => Math.max(h.trainLoss, h.valLoss)), 1)

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Brain className="w-10 h-10 text-purple-600" />
                    Model Training Visualization
                </h1>
                <p className="text-f1-gray-600">
                    Watch loss curves and metrics evolve during training
                </p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedModel}
                            onChange={(e) => { setSelectedModel(parseInt(e.target.value)); resetTraining(); }}
                            className="border rounded-lg px-4 py-2 font-bold"
                        >
                            {MODELS.map((model, i) => (
                                <option key={i} value={i}>{model}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsTraining(!isTraining)}
                            disabled={currentEpoch >= maxEpochs}
                            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${isTraining ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                                } disabled:opacity-50`}
                        >
                            {isTraining ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            {isTraining ? 'Pause' : 'Train'}
                        </button>
                        <button
                            onClick={resetTraining}
                            className="bg-f1-gray-200 px-4 py-3 rounded-lg hover:bg-f1-gray-300 transition flex items-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reset
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm">Speed:</span>
                        <select
                            value={trainingSpeed}
                            onChange={(e) => setTrainingSpeed(parseInt(e.target.value))}
                            className="border rounded px-3 py-2"
                        >
                            <option value={200}>Slow</option>
                            <option value={100}>Normal</option>
                            <option value={50}>Fast</option>
                            <option value={10}>Instant</option>
                        </select>
                        <div className="text-lg font-mono font-bold">
                            Epoch {currentEpoch}/{maxEpochs}
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            {latestMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <TrendingDown className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-mono font-bold text-blue-600">{latestMetrics.trainLoss.toFixed(4)}</div>
                        <div className="text-xs text-f1-gray-500">Training Loss</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <TrendingDown className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-mono font-bold text-orange-600">{latestMetrics.valLoss.toFixed(4)}</div>
                        <div className="text-xs text-f1-gray-500">Validation Loss</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-mono font-bold text-green-600">{latestMetrics.auc.toFixed(4)}</div>
                        <div className="text-xs text-f1-gray-500">AUC Score</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-mono font-bold text-purple-600">{latestMetrics.brier.toFixed(4)}</div>
                        <div className="text-xs text-f1-gray-500">Brier Score</div>
                    </div>
                </div>
            )}

            {/* Loss Curves */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">Loss Curves</h3>
                <div className="h-64 flex items-end gap-1 border-b border-l border-f1-gray-200 relative">
                    {/* Y-axis labels */}
                    <div className="absolute -left-8 top-0 text-xs text-f1-gray-500">{maxLoss.toFixed(2)}</div>
                    <div className="absolute -left-8 bottom-0 text-xs text-f1-gray-500">0.00</div>

                    {trainingHistory.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-f1-gray-500">
                            Click &quot;Train&quot; to start visualization
                        </div>
                    ) : (
                        trainingHistory.map((data, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 relative group" style={{ maxWidth: '10px' }}>
                                {/* Train loss bar */}
                                <div
                                    className="w-full bg-blue-500 rounded-t transition-all"
                                    style={{ height: `${(data.trainLoss / maxLoss) * 100}%` }}
                                />
                                {/* Val loss marker */}
                                <div
                                    className="absolute w-2 h-2 bg-orange-500 rounded-full"
                                    style={{ bottom: `${(data.valLoss / maxLoss) * 100}%` }}
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                    Epoch {data.epoch}: Train={data.trainLoss.toFixed(3)}, Val={data.valLoss.toFixed(3)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded" />
                        <span>Training Loss</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500 rounded-full" />
                        <span>Validation Loss</span>
                    </div>
                </div>
            </div>

            {/* Training Status */}
            <div className={`rounded-lg p-4 mb-8 ${currentEpoch >= maxEpochs ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex gap-2 items-start">
                    {currentEpoch >= maxEpochs ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    )}
                    <div>
                        <h4 className={`font-bold ${currentEpoch >= maxEpochs ? 'text-green-800' : 'text-blue-800'}`}>
                            {currentEpoch >= maxEpochs ? 'Training Complete!' : 'Training in Progress...'}
                        </h4>
                        <p className={`text-sm ${currentEpoch >= maxEpochs ? 'text-green-700' : 'text-blue-700'}`}>
                            {currentEpoch >= maxEpochs
                                ? `Final AUC: ${latestMetrics?.auc.toFixed(4)} | Final Brier: ${latestMetrics?.brier.toFixed(4)}`
                                : 'Watch the loss curves converge as the model learns...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/architecture" className="bg-f1-gray-900 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-700 transition">
                    Model Architecture
                </Link>
                <Link href="/compare" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    Compare Models
                </Link>
            </div>
        </div>
    )
}
