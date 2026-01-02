'use client'

import { useEffect, useRef } from 'react'

interface ModelMetric {
    model: string
    auc: number
    brier: number
    ece: number
    logloss: number
    color?: string
}

interface ModelComparisonChartProps {
    data: ModelMetric[]
    metric: 'auc' | 'brier' | 'ece' | 'logloss'
    title?: string
    width?: number
    height?: number
}

/**
 * ModelComparisonChart - Academic-grade model comparison visualization
 * 
 * Displays a bar chart comparing model performance metrics.
 * Supports AUC (higher better), Brier/ECE/LogLoss (lower better).
 */
export default function ModelComparisonChart({
    data,
    metric = 'auc',
    title,
    width = 500,
    height = 350
}: ModelComparisonChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const metricConfig = {
        auc: { label: 'AUC (↑)', higherBetter: true, color: '#10b981' },
        brier: { label: 'Brier Score (↓)', higherBetter: false, color: '#f59e0b' },
        ece: { label: 'ECE (↓)', higherBetter: false, color: '#ef4444' },
        logloss: { label: 'Log Loss (↓)', higherBetter: false, color: '#6366f1' }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const padding = { top: 50, right: 30, bottom: 80, left: 60 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom

        // Sort data
        const config = metricConfig[metric]
        const sortedData = [...data].sort((a, b) => {
            const diff = a[metric] - b[metric]
            return config.higherBetter ? -diff : diff
        })

        // Get value range
        const values = sortedData.map(d => d[metric])
        const maxVal = Math.max(...values) * 1.1
        const minVal = metric === 'auc' ? Math.min(0.4, Math.min(...values) * 0.9) : 0

        // Clear and set background
        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)

        // Draw bars
        const barWidth = chartWidth / sortedData.length * 0.7
        const barGap = chartWidth / sortedData.length * 0.3

        sortedData.forEach((model, i) => {
            const x = padding.left + i * (barWidth + barGap) + barGap / 2
            const normalizedValue = (model[metric] - minVal) / (maxVal - minVal)
            const barHeight = normalizedValue * chartHeight
            const y = padding.top + chartHeight - barHeight

            // Bar gradient
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
            gradient.addColorStop(0, config.color)
            gradient.addColorStop(1, config.color + '99')

            ctx.fillStyle = gradient
            ctx.fillRect(x, y, barWidth, barHeight)

            // Bar border
            ctx.strokeStyle = config.color
            ctx.lineWidth = 2
            ctx.strokeRect(x, y, barWidth, barHeight)

            // Value label on top
            ctx.fillStyle = '#333'
            ctx.font = 'bold 11px system-ui'
            ctx.textAlign = 'center'
            ctx.fillText(model[metric].toFixed(3), x + barWidth / 2, y - 8)

            // Model name below
            ctx.save()
            ctx.translate(x + barWidth / 2, height - padding.bottom + 15)
            ctx.rotate(-Math.PI / 4)
            ctx.textAlign = 'right'
            ctx.font = '11px system-ui'
            ctx.fillText(model.model, 0, 0)
            ctx.restore()
        })

        // Y-axis
        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 1
        const yTicks = 5
        for (let i = 0; i <= yTicks; i++) {
            const val = minVal + (maxVal - minVal) * (i / yTicks)
            const y = padding.top + chartHeight - (i / yTicks) * chartHeight

            // Grid line
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(width - padding.right, y)
            ctx.stroke()

            // Label
            ctx.fillStyle = '#666'
            ctx.font = '10px system-ui'
            ctx.textAlign = 'right'
            ctx.fillText(val.toFixed(2), padding.left - 8, y + 4)
        }

        // Title
        ctx.fillStyle = '#333'
        ctx.font = 'bold 16px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(title || `Model Comparison: ${config.label}`, width / 2, 25)

        // Rank indicator (best model)
        ctx.font = '10px system-ui'
        ctx.fillStyle = '#10b981'
        ctx.textAlign = 'left'
        ctx.fillText('🏆 Best performing models ranked left to right', padding.left, height - 10)

    }, [data, metric, title, width, height])

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="rounded-lg shadow-md bg-white"
        />
    )
}

// Example data for testing
export function getExampleModelData(): ModelMetric[] {
    return [
        { model: 'LR', auc: 0.987, brier: 0.019, ece: 0.008, logloss: 0.060 },
        { model: 'RF', auc: 0.985, brier: 0.021, ece: 0.010, logloss: 0.068 },
        { model: 'CatBoost', auc: 0.985, brier: 0.021, ece: 0.012, logloss: 0.070 },
        { model: 'XGBoost', auc: 0.983, brier: 0.024, ece: 0.016, logloss: 0.081 },
        { model: 'QualiFreq', auc: 0.981, brier: 0.018, ece: 0.006, logloss: 0.075 },
        { model: 'LightGBM', auc: 0.975, brier: 0.028, ece: 0.022, logloss: 0.103 },
        { model: 'Elo', auc: 0.440, brier: 0.048, ece: 0.000, logloss: 0.202 },
    ]
}
