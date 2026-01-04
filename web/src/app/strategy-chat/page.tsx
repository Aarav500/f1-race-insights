'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MessageSquare, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const SAMPLE_QUESTIONS = [
    "Should Norris pit now or extend his stint?",
    "What's the best strategy for Verstappen in wet conditions?",
    "How does tire degradation affect McLaren at Bahrain?",
    "When is the optimal pit window for a 2-stop strategy?",
    "Should Ferrari use soft or medium tires for the restart?",
]

// Simulated AI responses based on F1 strategy knowledge
function generateResponse(question: string): string {
    const q = question.toLowerCase()

    if (q.includes('pit') && q.includes('norris')) {
        return `**Strategy Analysis for Norris:**\n\n📊 Based on current data:\n- Current stint length: 14 laps on mediums\n- Tire degradation rate: 0.08s/lap\n- Gap to Verstappen: 4.2s\n\n**Recommendation: EXTEND STINT**\n\nReason: Pitting now would drop Norris into traffic. The undercut window has passed. Stay out until lap 22-24 to clear the pit window and emerge with clean air.\n\n⚠️ Risk: If safety car comes out, the strategy advantage is lost.`
    }

    if (q.includes('wet') || q.includes('rain')) {
        return `**Wet Weather Strategy:**\n\n🌧️ In wet conditions, here are key factors:\n\n1. **Tire Choice**: Start on intermediates if track is damp, full wets if standing water\n2. **Pit Timing**: Be ready to switch compounds quickly as track evolves\n3. **Track Position**: More important in wet - visibility and spray issues\n\n**For Verstappen specifically:**\nHe has a 90% wet weather skill rating - one of the best on the grid. In changeable conditions, he typically gains 2-3 positions.\n\n💡 Pro tip: If rain is coming, stay out on slicks longer than competitors if you're behind. The track crossover point is crucial.`
    }

    if (q.includes('tire') || q.includes('degradation')) {
        return `**Tire Degradation Analysis:**\n\n📈 At Bahrain, McLaren's tire management:\n\n| Compound | Deg Rate | Optimal Life | Cliff |\n|----------|----------|--------------|-------|\n| Soft | 0.12s/lap | 12 laps | Lap 18 |\n| Medium | 0.07s/lap | 22 laps | Lap 30 |\n| Hard | 0.04s/lap | 38 laps | Lap 48 |\n\n**McLaren-specific factors:**\n- Car is gentle on rear tires (+2 laps vs field average)\n- Higher deg on fronts due to aero balance\n\n**Recommendation:** Use M→H strategy for optimal race pace.`
    }

    if (q.includes('2-stop') || q.includes('two stop')) {
        return `**2-Stop Strategy Optimization:**\n\n🏎️ For a 57-lap race:\n\n**Optimal Pit Windows:**\n- First stop: Lap 14-18 (S→M transition)\n- Second stop: Lap 36-40 (M→S finish)\n\n**Advantages:**\n✅ Fresher tires for key battles\n✅ Flexibility to react to safety cars\n✅ Higher average pace\n\n**Disadvantages:**\n❌ Extra 22s pit lane time\n❌ Risk of traffic on out-laps\n\n**Break-even point:** 2-stop is faster if tire deg > 0.6s over the stint.`
    }

    if (q.includes('soft') || q.includes('medium') || q.includes('restart')) {
        return `**Tire Choice for Restart:**\n\n🚦 For Ferrari on a restart:\n\n**Soft Tires:**\n- Immediate grip advantage: +0.8s/lap for 5 laps\n- Risk: High degradation, may need extra stop\n- Best if: Track position is critical, race <15 laps remaining\n\n**Medium Tires:**\n- Consistent pace\n- Can run to finish without stopping\n- Best if: >15 laps remaining, protecting position\n\n**Recommendation for Ferrari:** If Leclerc is within striking distance of podium, SOFT. If consolidating position, MEDIUM.\n\nℹ️ Note: Ferrari historically struggles with soft tire degradation at high-fuel tracks.`
    }

    return `**F1 Strategy Analysis:**\n\nI've analyzed your question about F1 strategy. Here are some key considerations:\n\n1. **Track Position**: In modern F1, track position is crucial due to dirty air effects\n\n2. **Tire Strategy**: The optimal strategy depends on:\n   - Tire degradation rates\n   - Pit lane time loss (typically 22-25s)\n   - Traffic windows\n\n3. **Weather Factors**: Always monitor radar for potential rain\n\n4. **Safety Car Probability**: At most tracks, there's a 35-50% chance of SC\n\nWould you like me to analyze a specific driver's situation or track strategy?`
}

export default function StrategyChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "👋 Hello! I'm your AI Strategy Engineer. Ask me anything about F1 race strategy, pit windows, tire choices, or specific driver scenarios.\n\nI can help with:\n- Pit stop timing\n- Tire compound selection\n- Weather strategy\n- Undercut/overcut analysis\n- Championship implications\n\nWhat would you like to analyze?",
            timestamp: new Date(),
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

        const response = generateResponse(input)
        const assistantMessage: Message = {
            role: 'assistant',
            content: response,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
    }

    const handleSampleQuestion = (question: string) => {
        setInput(question)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <MessageSquare className="w-8 h-8" />
                        AI Strategy Engineer
                    </h1>
                    <p className="text-white/80 mt-1">Virtual strategy advisor powered by F1 race intelligence</p>
                </div>
            </div>

            <div className="flex-1 container mx-auto p-4 flex flex-col max-h-[calc(100vh-180px)]">
                {/* Sample Questions */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Sparkles className="w-4 h-4" />
                        Try asking:
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_QUESTIONS.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleSampleQuestion(q)}
                                className="px-3 py-1.5 bg-f1-gray-800 hover:bg-f1-gray-700 text-gray-300 text-sm rounded-full transition"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 bg-f1-gray-800 rounded-xl p-4 overflow-y-auto mb-4">
                    <div className="space-y-4">
                        {messages.map((message, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'
                                    }`}>
                                    {message.role === 'user' ?
                                        <User className="w-5 h-5 text-white" /> :
                                        <Bot className="w-5 h-5 text-white" />
                                    }
                                </div>
                                <div className={`max-w-[80%] rounded-2xl p-4 ${message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-f1-gray-700 text-white'
                                    }`}>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {message.content.split('\n').map((line, i) => {
                                            if (line.startsWith('**') && line.endsWith('**')) {
                                                return <div key={i} className="font-bold text-lg mt-2 first:mt-0">{line.replace(/\*\*/g, '')}</div>
                                            }
                                            if (line.startsWith('|')) {
                                                return <div key={i} className="font-mono text-xs bg-black/20 px-2 py-0.5 rounded">{line}</div>
                                            }
                                            if (line.startsWith('- ') || line.startsWith('✅') || line.startsWith('❌') || line.startsWith('⚠️') || line.startsWith('💡') || line.startsWith('📊') || line.startsWith('🌧️') || line.startsWith('🏎️') || line.startsWith('📈') || line.startsWith('🚦') || line.startsWith('ℹ️') || line.startsWith('👋')) {
                                                return <div key={i} className="ml-2">{line}</div>
                                            }
                                            return <div key={i}>{line}</div>
                                        })}
                                    </div>
                                    <div className="text-xs opacity-50 mt-2">
                                        {message.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-f1-gray-700 rounded-2xl p-4 flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    <span className="text-gray-400">Analyzing strategy...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about race strategy..."
                        className="flex-1 bg-f1-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition"
                    >
                        <Send className="w-5 h-5" />
                        Send
                    </button>
                </form>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-blue-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
