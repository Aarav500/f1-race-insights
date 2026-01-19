import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import QuickAccessPanel from '@/components/QuickAccessPanel'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
    title: 'F1 Race Insights | ML-Powered F1 Predictions',
    description: 'Advanced predictive modeling and analysis for Formula 1 race outcomes. 8 ML models, 98.7% AUC, featuring SHAP explanations, What-If Lab, and championship projections.',
    keywords: ['F1', 'Formula 1', 'Machine Learning', 'Predictions', 'Racing', 'Analytics', 'XGBoost', 'Neural Networks'],
    authors: [{ name: 'Aarav' }],
    openGraph: {
        title: 'F1 Race Insights | ML-Powered F1 Predictions',
        description: 'Predict F1 race outcomes with 8 ML models achieving 98.7% AUC. Features SHAP explanations, What-If Lab, and championship projections.',
        type: 'website',
        locale: 'en_US',
        siteName: 'F1 Race Insights',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'F1 Race Insights - ML-Powered Predictions',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'F1 Race Insights | ML-Powered F1 Predictions',
        description: 'Predict F1 race outcomes with 8 ML models. 98.7% AUC score.',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" />
                <meta name="theme-color" content="#e10600" />
            </head>
            <body className={inter.variable}>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                </div>
                <QuickAccessPanel />
            </body>
        </html>
    )
}

