'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Terminal, Play, Copy, Check, ChevronDown, ExternalLink, Code } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://34.204.193.47:8000'

const ENDPOINTS = [
    {
        category: 'Predictions',
        endpoints: [
            {
                method: 'GET',
                path: '/api/f1/predict/race/{race_id}',
                description: 'Get win probabilities for all drivers in a race',
                params: [
                    { name: 'race_id', type: 'path', default: '2024_01', options: ['2024_01', '2024_05', '2024_10'] },
                    { name: 'model', type: 'query', default: 'xgb', options: ['xgb', 'lgbm', 'cat', 'lr', 'rf', 'quali_freq', 'nbt_tlf', 'elo'] }
                ]
            },
            {
                method: 'GET',
                path: '/api/f1/explain/race/{race_id}',
                description: 'Get SHAP explanations for a specific driver',
                params: [
                    { name: 'race_id', type: 'path', default: '2024_01', options: ['2024_01', '2024_05'] },
                    { name: 'driver_id', type: 'query', default: 'VER', options: ['VER', 'HAM', 'LEC', 'NOR'] },
                    { name: 'model', type: 'query', default: 'xgb', options: ['xgb', 'cat', 'lr'] }
                ]
            }
        ]
    },
    {
        category: 'Counterfactuals',
        endpoints: [
            {
                method: 'POST',
                path: '/counterfactual',
                description: 'Run what-if scenario analysis',
                body: {
                    race_id: '2024_01',
                    driver_id: 'VER',
                    model: 'xgb',
                    deltas: { quali_position_delta: -2 }
                }
            }
        ]
    },
    {
        category: 'Metadata',
        endpoints: [
            {
                method: 'GET',
                path: '/meta/seasons',
                description: 'List available seasons',
                params: []
            },
            {
                method: 'GET',
                path: '/meta/races',
                description: 'List races for a season',
                params: [
                    { name: 'season', type: 'query', default: '2024', options: ['2020', '2021', '2022', '2023', '2024'] }
                ]
            },
            {
                method: 'GET',
                path: '/meta/models',
                description: 'List available ML models',
                params: []
            }
        ]
    },
    {
        category: 'Reports',
        endpoints: [
            {
                method: 'GET',
                path: '/api/f1/reports/backtest',
                description: 'Get backtest evaluation results',
                params: []
            }
        ]
    }
]

type Endpoint = typeof ENDPOINTS[number]['endpoints'][number]

export default function PlaygroundPage() {
    const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0].endpoints[0])
    const [params, setParams] = useState<Record<string, string>>({})
    const [response, setResponse] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const buildUrl = () => {
        let url = selectedEndpoint.path
        const endpointParams = 'params' in selectedEndpoint ? selectedEndpoint.params : []

        // Replace path params
        if (endpointParams) {
            endpointParams.forEach((p: { name: string; type: string; default: string; options?: string[] }) => {
                if (p.type === 'path') {
                    url = url.replace(`{${p.name}}`, params[p.name] || p.default)
                }
            })
        }

        // Add query params
        const queryParams = endpointParams?.filter((p: { type: string }) => p.type === 'query') || []
        if (queryParams.length > 0) {
            const qs = queryParams.map((p: { name: string; default: string }) => `${p.name}=${params[p.name] || p.default}`).join('&')
            url += '?' + qs
        }

        return API_BASE + url
    }

    const runRequest = async () => {
        setLoading(true)
        setResponse(null)

        try {
            const url = buildUrl()
            const options: RequestInit = { method: selectedEndpoint.method }

            if (selectedEndpoint.method === 'POST' && 'body' in selectedEndpoint) {
                options.headers = { 'Content-Type': 'application/json' }
                options.body = JSON.stringify(selectedEndpoint.body)
            }

            const res = await fetch(url, options)
            const data = await res.json()
            setResponse(JSON.stringify(data, null, 2))
        } catch (error) {
            setResponse(`Error: ${error}`)
        }

        setLoading(false)
    }

    const copyUrl = () => {
        navigator.clipboard.writeText(buildUrl())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Terminal className="w-10 h-10 text-green-600" />
                    API Playground
                </h1>
                <p className="text-f1-gray-600">
                    Interactive API explorer - test endpoints in your browser
                </p>
                <a
                    href={`${API_BASE}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-2"
                >
                    Full Swagger Docs <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Endpoint Selector */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow overflow-hidden sticky top-4">
                        <div className="p-4 bg-f1-gray-100 border-b font-bold">Endpoints</div>
                        <div className="divide-y">
                            {ENDPOINTS.map(category => (
                                <div key={category.category}>
                                    <div className="px-4 py-2 text-xs font-bold text-f1-gray-500 bg-f1-gray-50">
                                        {category.category}
                                    </div>
                                    {category.endpoints.map((endpoint, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setSelectedEndpoint(endpoint)
                                                setParams({})
                                                setResponse(null)
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-f1-gray-50 transition ${selectedEndpoint === endpoint ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {endpoint.method}
                                                </span>
                                                <span className="text-sm font-mono truncate">{endpoint.path.split('/').pop()}</span>
                                            </div>
                                            <div className="text-xs text-f1-gray-500 mt-1 truncate">{endpoint.description}</div>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Request Builder */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Endpoint Details */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`text-sm font-bold px-3 py-1 rounded ${selectedEndpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {selectedEndpoint.method}
                            </span>
                            <code className="text-sm bg-f1-gray-100 px-3 py-1 rounded flex-1 truncate">
                                {selectedEndpoint.path}
                            </code>
                        </div>
                        <p className="text-f1-gray-600 text-sm mb-4">{selectedEndpoint.description}</p>

                        {/* Parameters */}
                        {'params' in selectedEndpoint && selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-bold text-sm">Parameters</h4>
                                {selectedEndpoint.params.map((param, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <label className="w-32 text-sm">
                                            <span className="font-mono">{param.name}</span>
                                            <span className="text-xs text-f1-gray-400 ml-1">({param.type})</span>
                                        </label>
                                        <select
                                            value={params[param.name] || param.default}
                                            onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
                                            className="flex-1 border rounded-lg p-2"
                                        >
                                            {param.options?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Request Body */}
                        {'body' in selectedEndpoint && selectedEndpoint.body && (
                            <div className="mt-4">
                                <h4 className="font-bold text-sm mb-2">Request Body</h4>
                                <pre className="bg-f1-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                                    {JSON.stringify(selectedEndpoint.body, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* URL Preview & Run */}
                    <div className="bg-f1-gray-900 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-green-400 text-sm truncate">{buildUrl()}</code>
                            <button
                                onClick={copyUrl}
                                className="p-2 hover:bg-f1-gray-800 rounded transition"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-f1-gray-400" />}
                            </button>
                            <button
                                onClick={runRequest}
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                <Play className="w-4 h-4" />
                                {loading ? 'Running...' : 'Run'}
                            </button>
                        </div>
                    </div>

                    {/* Response */}
                    {response && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 bg-f1-gray-100 border-b font-bold flex items-center gap-2">
                                <Code className="w-4 h-4" />
                                Response
                            </div>
                            <pre className="p-4 text-sm overflow-x-auto max-h-96 overflow-y-auto bg-f1-gray-50">
                                {response}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 justify-center mt-8">
                <Link href="/architecture" className="bg-f1-gray-900 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-700 transition">
                    Model Architecture
                </Link>
                <a
                    href={`${API_BASE}/docs`}
                    target="_blank"
                    className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition flex items-center gap-2"
                >
                    Swagger Docs <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    )
}
