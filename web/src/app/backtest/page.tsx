export default function BacktestPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-f1-black">Backtest Results</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <p className="text-f1-gray-700 mb-4">
                    View comprehensive backtest results comparing all models using walk-forward validation.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 font-medium mb-2">📊 Backtest Reports Available</p>
                    <p className="text-blue-700 text-sm">
                        Run the backtest script to generate reports:
                    </p>
                    <code className="block bg-f1-gray-900 text-white p-3 rounded mt-2 text-sm">
                        python scripts/backtest.py --models all --task win
                    </code>
                </div>
            </div>

            {/* Model Comparison Overview */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-f1-black">Model Comparison</h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-f1-gray-900 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left">Model</th>
                                <th className="px-6 py-3 text-left">Type</th>
                                <th className="px-6 py-3 text-center">Interpretable</th>
                                <th className="px-6 py-3 text-center">Speed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-f1-gray-200">
                            <ModelRow name="Qualifying Freq" type="Baseline" interpretable="✓" speed="Fast" />
                            <ModelRow name="Elo" type="Baseline" interpretable="✓" speed="Fast" />
                            <ModelRow name="Logistic Regression" type="Linear" interpretable="✓" speed="Fast" />
                            <ModelRow name="Random Forest" type="Ensemble" interpretable="△" speed="Medium" />
                            <ModelRow name="XGBoost" type="Gradient Boosting" interpretable="△ (SHAP)" speed="Medium" />
                            <ModelRow name="LightGBM" type="Gradient Boosting" interpretable="△ (SHAP)" speed="Medium" />
                            <ModelRow name="CatBoost" type="Gradient Boosting" interpretable="△ (SHAP)" speed="Medium" />
                            <ModelRow name="NBT-TLF" type="Neural Ranking" interpretable="△ (ablation)" speed="Slow" />
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Metrics Explanation */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6 text-f1-black">Evaluation Metrics</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <MetricCard
                        name="AUC"
                        description="Area Under the ROC Curve - measures discrimination (0.5=random, 1=perfect)"
                    />
                    <MetricCard
                        name="Log Loss"
                        description="Proper scoring rule for probabilistic predictions (lower is better)"
                    />
                    <MetricCard
                        name="Brier Score"
                        description="Mean squared error of probability forecasts (lower is better)"
                    />
                    <MetricCard
                        name="ECE"
                        description="Expected Calibration Error - measures calibration quality (lower is better)"
                    />
                    <MetricCard
                        name="MAE"
                        description="Mean Absolute Error for expected finish position"
                    />
                </div>
            </div>
        </div>
    )
}

function ModelRow({ name, type, interpretable, speed }: {
    name: string
    type: string
    interpretable: string
    speed: string
}) {
    return (
        <tr className="hover:bg-f1-gray-50">
            <td className="px-6 py-4 font-medium">{name}</td>
            <td className="px-6 py-4 text-f1-gray-700">{type}</td>
            <td className="px-6 py-4 text-center">{interpretable}</td>
            <td className="px-6 py-4 text-center">
                <span className={`px-2 py-1 rounded text-sm ${speed === 'Fast' ? 'bg-green-100 text-green-800' :
                        speed === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                    }`}>
                    {speed}
                </span>
            </td>
        </tr>
    )
}

function MetricCard({ name, description }: { name: string; description: string }) {
    return (
        <div className="border border-f1-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2 text-f1-black">{name}</h3>
            <p className="text-f1-gray-700 text-sm">{description}</p>
        </div>
    )
}
