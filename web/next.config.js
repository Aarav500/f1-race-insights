/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone', // For optimized Docker builds

    // Configure runtime environment variables
    // These can be set when the container starts
    serverRuntimeConfig: {
        // Server-side config (not exposed to client)
    },
    publicRuntimeConfig: {
        // Client-side config (exposed to client)
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    },

    // Optional: Proxy API requests through Next.js server
    // This is evaluated at request time, not build time
    async rewrites() {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        return [
            {
                source: '/api-proxy/:path*',
                destination: `${apiBaseUrl}/api/:path*`,
            },
        ]
    },
}

module.exports = nextConfig
