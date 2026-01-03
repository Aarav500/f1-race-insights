'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { FileText, Download, Printer, Eye, Loader2, CheckCircle } from 'lucide-react'

// Sample analysis data for export
const SAMPLE_ANALYSIS = {
    race: 'Bahrain GP 2024',
    generatedAt: new Date().toISOString(),
    predictions: [
        { driver: 'Max Verstappen', team: 'Red Bull', probability: 0.72, position: 1 },
        { driver: 'Charles Leclerc', team: 'Ferrari', probability: 0.12, position: 2 },
        { driver: 'Lewis Hamilton', team: 'Mercedes', probability: 0.08, position: 3 },
        { driver: 'Lando Norris', team: 'McLaren', probability: 0.05, position: 4 },
        { driver: 'Carlos Sainz', team: 'Ferrari', probability: 0.03, position: 5 },
    ],
    features: [
        { name: 'Qualifying Position', value: 'P1', impact: '+35%' },
        { name: 'Driver Form (5 races)', value: '2.1 avg finish', impact: '+18%' },
        { name: 'Constructor Performance', value: '9.2/10', impact: '+12%' },
        { name: 'Track History', value: '3 wins', impact: '+8%' },
    ],
    modelUsed: 'XGBoost',
    auc: 0.983,
    brier: 0.024,
}

export default function ExportPage() {
    const [exporting, setExporting] = useState(false)
    const [exported, setExported] = useState(false)
    const printRef = useRef<HTMLDivElement>(null)

    const handleExport = async () => {
        setExporting(true)

        // Simulate export process
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Create printable content
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>F1 Race Insights - Analysis Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        h1 { color: #e10600; border-bottom: 2px solid #e10600; padding-bottom: 10px; }
                        h2 { color: #333; margin-top: 30px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background-color: #f8f8f8; font-weight: bold; }
                        .stat { display: inline-block; margin-right: 30px; }
                        .stat-value { font-size: 24px; font-weight: bold; color: #e10600; }
                        .stat-label { font-size: 12px; color: #666; }
                        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <h1>🏎️ F1 Race Insights Analysis Report</h1>
                    <p><strong>Race:</strong> ${SAMPLE_ANALYSIS.race}</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                    
                    <div style="margin: 30px 0;">
                        <div class="stat">
                            <div class="stat-value">${SAMPLE_ANALYSIS.auc}</div>
                            <div class="stat-label">Model AUC</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${SAMPLE_ANALYSIS.brier}</div>
                            <div class="stat-label">Brier Score</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${SAMPLE_ANALYSIS.modelUsed}</div>
                            <div class="stat-label">Model Used</div>
                        </div>
                    </div>
                    
                    <h2>Win Probability Predictions</h2>
                    <table>
                        <thead>
                            <tr><th>Pos</th><th>Driver</th><th>Team</th><th>Win Probability</th></tr>
                        </thead>
                        <tbody>
                            ${SAMPLE_ANALYSIS.predictions.map(p => `
                                <tr>
                                    <td>${p.position}</td>
                                    <td><strong>${p.driver}</strong></td>
                                    <td>${p.team}</td>
                                    <td>${(p.probability * 100).toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <h2>Key Feature Impacts (SHAP)</h2>
                    <table>
                        <thead>
                            <tr><th>Feature</th><th>Value</th><th>Impact on Prediction</th></tr>
                        </thead>
                        <tbody>
                            ${SAMPLE_ANALYSIS.features.map(f => `
                                <tr>
                                    <td>${f.name}</td>
                                    <td>${f.value}</td>
                                    <td style="color: green; font-weight: bold;">${f.impact}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>Generated by F1 Race Insights ML Platform</p>
                        <p>Models: XGBoost, LightGBM, CatBoost, LR, RF, NBT-TLF, Elo, QualiFreq</p>
                        <p>Data: 2020-2024 F1 seasons (2,140 samples, 15 engineered features)</p>
                    </div>
                    
                    <script>window.print();</script>
                </body>
                </html>
            `)
            printWindow.document.close()
        }

        setExporting(false)
        setExported(true)
        setTimeout(() => setExported(false), 3000)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <FileText className="w-10 h-10 text-blue-600" />
                    PDF Export
                </h1>
                <p className="text-f1-gray-600">
                    Download analysis reports as formatted PDF documents
                </p>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8" ref={printRef}>
                <div className="p-4 bg-f1-gray-900 text-white flex justify-between items-center">
                    <span className="font-bold">📄 Report Preview</span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="bg-f1-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {exporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : exported ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Exported!
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Export PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="border-b-2 border-f1-red pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-f1-red">🏎️ F1 Race Insights Analysis Report</h2>
                        <p className="text-f1-gray-600 mt-1">
                            <strong>Race:</strong> {SAMPLE_ANALYSIS.race} |
                            <strong className="ml-2">Generated:</strong> {new Date().toLocaleString()}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-f1-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-f1-red">{SAMPLE_ANALYSIS.auc}</div>
                            <div className="text-xs text-f1-gray-500">Model AUC</div>
                        </div>
                        <div className="bg-f1-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{SAMPLE_ANALYSIS.brier}</div>
                            <div className="text-xs text-f1-gray-500">Brier Score</div>
                        </div>
                        <div className="bg-f1-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{SAMPLE_ANALYSIS.modelUsed}</div>
                            <div className="text-xs text-f1-gray-500">Model Used</div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mb-4">Win Probability Predictions</h3>
                    <table className="w-full mb-8 text-sm">
                        <thead className="bg-f1-gray-100 border-b">
                            <tr>
                                <th className="p-3 text-left">Pos</th>
                                <th className="p-3 text-left">Driver</th>
                                <th className="p-3 text-left">Team</th>
                                <th className="p-3 text-right">Win Probability</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {SAMPLE_ANALYSIS.predictions.map(p => (
                                <tr key={p.position}>
                                    <td className="p-3">{p.position}</td>
                                    <td className="p-3 font-bold">{p.driver}</td>
                                    <td className="p-3">{p.team}</td>
                                    <td className="p-3 text-right font-mono">{(p.probability * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h3 className="text-xl font-bold mb-4">Key Feature Impacts</h3>
                    <table className="w-full text-sm">
                        <thead className="bg-f1-gray-100 border-b">
                            <tr>
                                <th className="p-3 text-left">Feature</th>
                                <th className="p-3 text-left">Value</th>
                                <th className="p-3 text-right">Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {SAMPLE_ANALYSIS.features.map((f, i) => (
                                <tr key={i}>
                                    <td className="p-3">{f.name}</td>
                                    <td className="p-3 font-mono">{f.value}</td>
                                    <td className="p-3 text-right text-green-600 font-bold">{f.impact}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <h3 className="font-bold text-blue-800 mb-2">Export Features</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Full prediction analysis with win probabilities</li>
                    <li>• SHAP feature explanations and impact analysis</li>
                    <li>• Model performance metrics (AUC, Brier score)</li>
                    <li>• Print-ready formatting for documentation</li>
                </ul>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/explainer" className="bg-f1-gray-900 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-700 transition">
                    SHAP Explainer
                </Link>
                <Link href="/whatif" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    What-If Lab
                </Link>
            </div>
        </div>
    )
}
