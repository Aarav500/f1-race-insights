'use client'

import { useEffect, useRef } from 'react'

interface CalibrationPoint {
    predicted: number
    actual: number
    count: number
}

interface ReliabilityDiagramProps {
    data: CalibrationPoint[]
    title?: string
    width?: number
    height?: number
}

/**
 * ReliabilityDiagram - Academic-grade calibration visualization
 * 
 * Shows how well-calibrated model probabilities are by comparing
 * predicted probabilities to observed frequencies. A perfectly
 * calibrated model produces points along the diagonal.
 * 
 * This is a key visualization for ML papers demonstrating model quality.
 */
export default function ReliabilityDiagram({
    data,
    title = 'Reliability Diagram',
    width = 400,
    height = 400
}: ReliabilityDiagramProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set up dimensions
        const padding = 60
        const chartWidth = width - 2 * padding
        const chartHeight = height - 2 * padding

        // Clear canvas
        ctx.clearRect(0, 0, width, height)

        // Background
        ctx.fillStyle = '#fafafa'
        ctx.fillRect(0, 0, width, height)

        // Chart area
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(padding, padding, chartWidth, chartHeight)
        ctx.strokeStyle = '#e0e0e0'
        ctx.strokeRect(padding, padding, chartWidth, chartHeight)

        // Draw perfect calibration line (diagonal)
        ctx.beginPath()
        ctx.strokeStyle = '#e63946'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.moveTo(padding, height - padding)
        ctx.lineTo(width - padding, padding)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw grid
        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 0.5
        for (let i = 0; i <= 10; i++) {
            const x = padding + (i / 10) * chartWidth
            const y = height - padding - (i / 10) * chartHeight

            // Vertical lines
            ctx.beginPath()
            ctx.moveTo(x, padding)
            ctx.lineTo(x, height - padding)
            ctx.stroke()

            // Horizontal lines
            ctx.beginPath()
            ctx.moveTo(padding, y)
            ctx.lineTo(width - padding, y)
            ctx.stroke()
        }

        // Draw calibration bars
        if (data.length > 0) {
            const binWidth = chartWidth / data.length * 0.8

            data.forEach((point, i) => {
                const x = padding + (point.predicted * chartWidth) - binWidth / 2
                const barHeight = point.actual * chartHeight
                const y = height - padding - barHeight

                // Bar
                ctx.fillStyle = 'rgba(0, 122, 255, 0.7)'
                ctx.fillRect(x, y, binWidth, barHeight)
                ctx.strokeStyle = '#005bb5'
                ctx.lineWidth = 1
                ctx.strokeRect(x, y, binWidth, barHeight)

                // Count label
                if (point.count > 0) {
                    ctx.fillStyle = '#333'
                    ctx.font = '10px system-ui'
                    ctx.textAlign = 'center'
                    ctx.fillText(`n=${point.count}`, x + binWidth / 2, y - 5)
                }
            })
        }

        // Labels
        ctx.fillStyle = '#333'
        ctx.font = '12px system-ui'
        ctx.textAlign = 'center'

        // X-axis labels
        for (let i = 0; i <= 10; i += 2) {
            const x = padding + (i / 10) * chartWidth
            ctx.fillText((i / 10).toFixed(1), x, height - padding + 20)
        }

        // Y-axis labels
        ctx.textAlign = 'right'
        for (let i = 0; i <= 10; i += 2) {
            const y = height - padding - (i / 10) * chartHeight
            ctx.fillText((i / 10).toFixed(1), padding - 10, y + 4)
        }

        // Axis titles
        ctx.font = 'bold 13px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('Mean Predicted Probability', width / 2, height - 15)

        ctx.save()
        ctx.translate(15, height / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText('Fraction of Positives', 0, 0)
        ctx.restore()

        // Title
        ctx.font = 'bold 16px system-ui'
        ctx.fillText(title, width / 2, 25)

        // Legend
        ctx.font = '11px system-ui'
        ctx.textAlign = 'left'

        // Perfect calibration legend
        ctx.strokeStyle = '#e63946'
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(padding + 10, padding + 15)
        ctx.lineTo(padding + 40, padding + 15)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#333'
        ctx.fillText('Perfect Calibration', padding + 45, padding + 19)

    }, [data, title, width, height])

    return (
        <div className="reliability-diagram">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="rounded-lg shadow-sm"
            />
            <style jsx>{`
                .reliability-diagram {
                    display: inline-block;
                }
            `}</style>
        </div>
    )
}

// Example data generator for testing
export function generateExampleCalibrationData(): CalibrationPoint[] {
    return [
        { predicted: 0.05, actual: 0.03, count: 450 },
        { predicted: 0.15, actual: 0.12, count: 320 },
        { predicted: 0.25, actual: 0.28, count: 210 },
        { predicted: 0.35, actual: 0.38, count: 180 },
        { predicted: 0.45, actual: 0.42, count: 120 },
        { predicted: 0.55, actual: 0.58, count: 95 },
        { predicted: 0.65, actual: 0.62, count: 75 },
        { predicted: 0.75, actual: 0.78, count: 60 },
        { predicted: 0.85, actual: 0.82, count: 40 },
        { predicted: 0.95, actual: 0.98, count: 25 },
    ]
}
