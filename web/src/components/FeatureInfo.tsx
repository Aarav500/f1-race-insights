'use client'

import { useState } from 'react'
import { Info, ChevronDown, ChevronUp, Lightbulb, Target, Code, Zap } from 'lucide-react'

interface FeatureInfoProps {
    title: string
    description: string
    advantage: string
    skills: string[]
    f1Context: string
    defaultExpanded?: boolean
}

export default function FeatureInfo({
    title,
    description,
    advantage,
    skills,
    f1Context,
    defaultExpanded = false
}: FeatureInfoProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    return (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl overflow-hidden mb-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition"
            >
                <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-white">About {title}</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>

            {isExpanded && (
                <div className="px-6 pb-6 space-y-4">
                    {/* What it does */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Target className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-blue-400 mb-1">What it does</div>
                            <p className="text-gray-300 text-sm">{description}</p>
                        </div>
                    </div>

                    {/* Why it matters */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-green-400 mb-1">Why it matters</div>
                            <p className="text-gray-300 text-sm">{advantage}</p>
                        </div>
                    </div>

                    {/* F1 Context */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-yellow-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-yellow-400 mb-1">Real F1 Usage</div>
                            <p className="text-gray-300 text-sm">{f1Context}</p>
                        </div>
                    </div>

                    {/* Skills demonstrated */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Code className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-purple-400 mb-1">Skills Demonstrated</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {skills.map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Compact inline version for smaller spaces
export function FeatureInfoInline({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg text-sm">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-300">{text}</span>
        </div>
    )
}
