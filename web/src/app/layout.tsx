import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
    title: 'F1 Race Insights',
    description: 'Predictive modeling and analysis for Formula 1 race outcomes',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.variable}>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                </div>
            </body>
        </html>
    )
}
