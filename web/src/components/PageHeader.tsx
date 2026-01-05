'use client'

import Link from 'next/link'
import { Flag, Info, ChevronRight, HelpCircle, LucideIcon } from 'lucide-react'

interface PageHeaderProps {
    title: string
    subtitle?: string
    icon?: LucideIcon
    color?: string // gradient colors like "from-purple-600 to-pink-600"

    // What this page does - for F1 experts
    whatItDoes: string

    // Plain English explanation - for non-F1 users
    plainEnglish: string

    // Technical skills demonstrated
    techSkills?: string[]
}

export default function PageHeader({
    title,
    subtitle,
    icon: Icon,
    color = 'from-f1-red to-red-700',
    whatItDoes,
    plainEnglish,
    techSkills,
}: PageHeaderProps) {
    return (
        <>
            {/* Main Header */}
            <div className={`bg-gradient-to-r ${color} text-white p-6`}>
                <div className="container mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            {Icon ? <Icon className="w-6 h-6 text-white" /> : <Flag className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{title}</h1>
                            {subtitle && <p className="text-white/80">{subtitle}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Explanation Banner - Always visible */}
            <div className="bg-white border-b shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="max-w-4xl">
                        {/* What it does */}
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Info className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-medium text-f1-black">What this does:</div>
                                <p className="text-f1-gray-700">{whatItDoes}</p>
                            </div>
                        </div>

                        {/* Plain English - for non-F1 users */}
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                <HelpCircle className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                                <div className="font-medium text-f1-black">New to F1/ML? Plain English:</div>
                                <p className="text-f1-gray-600">{plainEnglish}</p>
                            </div>
                        </div>

                        {/* Tech Skills - collapsible or inline */}
                        {techSkills && techSkills.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-f1-gray-200">
                                <span className="text-xs font-bold text-f1-gray-500 uppercase">Tech demonstrated:</span>
                                {techSkills.map(skill => (
                                    <span
                                        key={skill}
                                        className="text-xs bg-f1-gray-100 text-f1-gray-700 px-2 py-1 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Link to Getting Started */}
                        <div className="mt-3 pt-3 border-t border-f1-gray-200">
                            <Link
                                href="/getting-started"
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <HelpCircle className="w-4 h-4" />
                                New here? View the Getting Started guide
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
