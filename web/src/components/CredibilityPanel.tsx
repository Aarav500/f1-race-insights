'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'

interface CredibilityPanelProps {
    modelName: string
    lastUpdated?: string
    dataRange?: string
    evalWindow?: string
    metrics?: {
        auc?: number
        brier?: number
        ece?: number
    }
}

/**
 * CredibilityPanel - Shows model credibility information
 * 
 * Displays:
 * - Model being used
 * - Data coverage/range
 * - Last data refresh
 * - Evaluation metrics (if available)
 */
export default function CredibilityPanel({
    modelName,
    lastUpdated = '2024-11-30',
    dataRange = '2020-2024',
    evalWindow = '97 races',
    metrics
}: CredibilityPanelProps) {
    const [expanded, setExpanded] = useState(false)

    // Determine credibility status based on metrics
    const getStatus = () => {
        if (!metrics?.auc) return 'info'
        if (metrics.auc > 0.9) return 'high'
        if (metrics.auc > 0.7) return 'medium'
        return 'low'
    }

    const status = getStatus()
    const statusConfig = {
        high: { color: 'bg-green-50 border-green-200', icon: CheckCircle, iconColor: 'text-green-600', label: 'High Confidence' },
        medium: { color: 'bg-yellow-50 border-yellow-200', icon: AlertTriangle, iconColor: 'text-yellow-600', label: 'Medium Confidence' },
        low: { color: 'bg-red-50 border-red-200', icon: AlertTriangle, iconColor: 'text-red-600', label: 'Low Confidence' },
        info: { color: 'bg-blue-50 border-blue-200', icon: Info, iconColor: 'text-blue-600', label: 'Info' }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
        <div className={`rounded-lg border p-3 ${config.color}`}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between gap-2"
            >
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                    <span className="text-sm font-medium text-f1-gray-900">
                        Model: <span className="font-bold">{modelName.toUpperCase()}</span>
                    </span>
                    {metrics?.auc && (
                        <span className="text-xs bg-white px-2 py-0.5 rounded-full border">
                            AUC: {(metrics.auc * 100).toFixed(1)}%
                        </span>
                    )}
                </div>
                <span className="text-xs text-f1-gray-500">
                    {expanded ? 'Hide details' : 'Show details'}
                </span>
            </button>

            {expanded && (
                <div className="mt-3 pt-3 border-t border-f1-gray-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                        <div className="text-f1-gray-500">Data Range</div>
                        <div className="font-medium">{dataRange}</div>
                    </div>
                    <div>
                        <div className="text-f1-gray-500">Last Updated</div>
                        <div className="font-medium">{lastUpdated}</div>
                    </div>
                    <div>
                        <div className="text-f1-gray-500">Eval Window</div>
                        <div className="font-medium">{evalWindow}</div>
                    </div>
                    {metrics?.brier !== undefined && (
                        <div>
                            <div className="text-f1-gray-500">Brier Score</div>
                            <div className="font-medium">{(metrics.brier * 100).toFixed(2)}%</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
