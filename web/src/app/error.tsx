'use client'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto bg-red-50 border border-red-300 rounded-lg p-8">
                <h1 className="text-3xl font-bold text-red-900 mb-4">
                    Application Error
                </h1>
                <p className="text-red-700 mb-6">
                    {error.message || 'An unexpected error occurred'}
                </p>
                {error.digest && (
                    <p className="text-sm text-red-600 mb-6">
                        Error ID: {error.digest}
                    </p>
                )}
                <button
                    onClick={reset}
                    className="bg-f1-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                >
                    Try Again
                </button>
            </div>
        </div>
    )
}
