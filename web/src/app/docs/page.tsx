'use client'

// Get API base URL from environment or use localhost for development
const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // In browser, use the same host but port 8000 for API
        const host = window.location.hostname
        return `http://${host}:8000`
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
}

export default function DocsPage() {
    const apiBaseUrl = getApiBaseUrl()

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xlfont-bold mb-8 text-f1-black">Documentation</h1>

            {/* Quick Links */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4 text-f1-black">API Documentation</h2>
                    <p className="text-f1-gray-700 mb-4">
                        Interactive API documentation powered by FastAPI Swagger UI.
                    </p>
                    <a
                        href={`${apiBaseUrl}/docs`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-f1-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        Open API Docs
                    </a>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4 text-f1-black">Technical Specification</h2>
                    <p className="text-f1-gray-700 mb-4">
                        Paper-ready documentation with model formulations and methodology.
                    </p>
                    <a
                        href="https://github.com/Aarav500/f1-race-insights/blob/main/docs/F1.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block border border-f1-gray-300 text-f1-black px-6 py-2 rounded-lg hover:bg-f1-gray-100 transition"
                    >
                        Read Technical Docs
                    </a>
                </div>
            </div>

            {/* API Examples */}
            <div className="bg-white rounded-lg shadow p-6 mb-12">
                <h2 className="text-2xl font-bold mb-6 text-f1-black">API Examples</h2>

                <div className="space-y-6">
                    <ApiExample
                        title="Get Race Predictions"
                        method="GET"
                        endpoint="/api/f1/predict/race/{race_id}?model=xgb"
                        example={`curl "${apiBaseUrl}/api/f1/predict/race/2024_01?model=xgb"`}
                    />

                    <ApiExample
                        title="Get Explanation"
                        method="GET"
                        endpoint="/api/f1/explain/race/{race_id}?driver_id=VER&model=xgb"
                        example={`curl "${apiBaseUrl}/api/f1/explain/race/2024_01?driver_id=VER&model=xgb"`}
                    />

                    <ApiExample
                        title="Counterfactual Analysis"
                        method="POST"
                        endpoint="/api/f1/counterfactual?model=xgb"
                        example={`curl -X POST "${apiBaseUrl}/api/f1/counterfactual?model=xgb" \\
  -H "Content-Type: application/json" \\
  -d '{
    "race_id": "2024_01",
    "driver_id": "HAM",
    "changes": {"qualifying_position_delta": -2}
  }'`}
                    />
                </div>
            </div>

            {/* Models */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6 text-f1-black">Available Models</h2>

                <div className="space-y-4">
                    <ModelDoc
                        name="xgb, lgbm, cat"
                        description="Gradient boosting models with SHAP explanations"
                    />
                    <ModelDoc
                        name="lr, rf"
                        description="Linear and ensemble models with permutation importance"
                    />
                    <ModelDoc
                        name="quali_freq"
                        description="Baseline using historical qualifying position frequencies"
                    />
                    <ModelDoc
                        name="elo"
                        description="Pairwise rating system updated chronologically"
                    />
                    <ModelDoc
                        name="nbt_tlf"
                        description="Neural Bradley-Terry with temporal latent factors and ablation analysis"
                    />
                </div>
            </div>
        </div>
    )
}

function ApiExample({ title, method, endpoint, example }: {
    title: string
    method: string
    endpoint: string
    example: string
}) {
    return (
        <div>
            <h3 className="font-bold text-lg mb-2 text-f1-black">{title}</h3>
            <div className="bg-f1-gray-100 rounded p-2 mb-2 text-sm">
                <span className={`font-mono px-2 py-1 rounded text-white ${method === 'GET' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                    {method}
                </span>
                <span className="ml-2 font-mono">{endpoint}</span>
            </div>
            <div className="bg-f1-gray-900 text-white p-4 rounded-lg overflow-x-auto">
                <code className="text-sm whitespace-pre">{example}</code>
            </div>
        </div>
    )
}

function ModelDoc({ name, description }: { name: string; description: string }) {
    return (
        <div className="border-l-4 border-f1-red pl-4">
            <h4 className="font-bold text-f1-black">{name}</h4>
            <p className="text-f1-gray-700 text-sm">{description}</p>
        </div>
    )
}
