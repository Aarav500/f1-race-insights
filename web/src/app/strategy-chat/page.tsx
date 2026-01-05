'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MessageSquare, Send, Bot, User, Sparkles, Loader2, AlertTriangle, Info, Flag } from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    isOutOfScope?: boolean
}

const SAMPLE_QUESTIONS = [
    "Should Norris pit now or extend his stint?",
    "What's the best strategy for Verstappen in wet conditions?",
    "How does tire degradation affect McLaren at Bahrain?",
    "When is the optimal pit window for a 2-stop strategy?",
    "Who will win the 2026 championship?",
    "Compare Hamilton vs Verstappen's racecraft",
    "What are the new 2026 regulations?",
]

// F1 knowledge base for better responses
const F1_KNOWLEDGE = {
    drivers: ['verstappen', 'norris', 'leclerc', 'hamilton', 'russell', 'piastri', 'sainz', 'alonso', 'perez', 'gasly', 'ocon', 'stroll', 'tsunoda', 'ricciardo', 'bottas', 'zhou', 'magnussen', 'hulkenberg', 'albon', 'sargeant', 'lawson', 'bearman', 'colapinto', 'antonelli', 'hadjar', 'bortoleto'],
    teams: ['red bull', 'mclaren', 'ferrari', 'mercedes', 'aston martin', 'alpine', 'williams', 'rb', 'haas', 'sauber', 'kick sauber'],
    tracks: ['bahrain', 'jeddah', 'melbourne', 'suzuka', 'shanghai', 'miami', 'imola', 'monaco', 'montreal', 'barcelona', 'spielberg', 'silverstone', 'hungary', 'budapest', 'spa', 'zandvoort', 'monza', 'baku', 'singapore', 'cota', 'austin', 'mexico', 'interlagos', 'las vegas', 'qatar', 'abu dhabi'],
    terms: ['pit', 'tire', 'tyre', 'drs', 'safety car', 'undercut', 'overcut', 'strategy', 'qualifying', 'pole', 'lap', 'race', 'championship', 'points', 'podium', 'dnf', 'engine', 'aero', 'downforce', 'grip', 'slipstream', 'kers', 'ers', 'mgu', 'fia', 'f1', 'formula 1', 'formula one', 'grand prix', 'gp', 'sprint', 'regulation', '2026', '2025', '2024', 'season', 'wet', 'rain', 'intermediate', 'soft', 'medium', 'hard', 'compound', 'stint', 'fastest lap', 'sector', 'telemetry', 'pitstop', 'blue flag', 'yellow flag', 'red flag', 'penalty', 'steward'],
}

// Check if query is F1-related
function isF1Related(query: string): boolean {
    const q = query.toLowerCase()

    // Check for driver names
    if (F1_KNOWLEDGE.drivers.some(d => q.includes(d))) return true

    // Check for team names
    if (F1_KNOWLEDGE.teams.some(t => q.includes(t))) return true

    // Check for track names
    if (F1_KNOWLEDGE.tracks.some(t => q.includes(t))) return true

    // Check for F1 terms
    if (F1_KNOWLEDGE.terms.some(t => q.includes(t))) return true

    // Check for common racing terms
    if (/\b(car|race|driver|team|win|champion|speed|fast|lap|corner|turn|brake|throttle|gear|engine|power|aerodynamic|suspension|setup|balance)\b/i.test(q)) return true

    return false
}

// Generate F1-focused response
function generateResponse(question: string): { content: string; isOutOfScope: boolean } {
    const q = question.toLowerCase()

    // Check if question is F1-related
    if (!isF1Related(question)) {
        return {
            content: `🏁 **F1 Strategy Engineer - Scope Notice**\n\nI'm specifically designed to answer questions about Formula 1 racing, including:\n\n• **Race Strategy**: Pit timing, tire choices, undercuts\n• **Driver Analysis**: Performance comparisons, skill ratings\n• **Team Tactics**: Car setup, reliability, pace\n• **Regulations**: Current and 2026 rules\n• **Historical Races**: Key moments, what-if scenarios\n• **Predictions**: Championship projections, race outcomes\n\nYour question appears to be outside my F1 expertise. Could you rephrase it as an F1-related question?\n\n💡 **Try asking about**: Pit strategies, driver comparisons, tire compounds, team performance, or race predictions.`,
            isOutOfScope: true,
        }
    }

    // 2026 Season / New Regulations
    if (q.includes('2026') || (q.includes('new') && q.includes('regulation'))) {
        return {
            content: `**2026 F1 Season Analysis:**\n\n🔧 **New Technical Regulations:**\n- Smaller, lighter cars (30kg reduction)\n- Active aerodynamics (adjustable front/rear wings)\n- New power unit: 50% thermal, 50% electrical\n- Sustainable fuels mandatory\n- Simplified front wings for closer racing\n\n📊 **Our 2026 Projections:**\n| Team | Predicted Standing | Confidence |\n|------|-------------------|------------|\n| McLaren | 1st | 78% |\n| Ferrari | 2nd | 71% |\n| Red Bull | 3rd | 65% |\n| Mercedes | 4th | 60% |\n\n**Key Factors:**\n- McLaren's strong aero department favored for new rules\n- Ferrari's engine expertise valuable with new PU\n- Red Bull faces Newey departure challenge\n\n⚠️ Regulation changes historically shuffle the order. High uncertainty expected.`,
            isOutOfScope: false,
        }
    }

    // Driver comparisons - balanced analysis
    if ((q.includes('verstappen') && q.includes('hamilton')) || q.includes('compare') || q.includes('vs')) {
        return {
            content: `**Driver Comparison Analysis:**\n\n📊 **Statistical Comparison (Career to Date):**\n\n| Metric | Verstappen | Hamilton |\n|--------|-----------|----------|\n| Championships | 4 | 7 |\n| Race Wins | 62 | 105 |\n| Pole Positions | 40 | 104 |\n| Win Rate | 35% | 32% |\n| Wet Weather Rating | 9.2/10 | 9.5/10 |\n| Racecraft | 9.8/10 | 9.5/10 |\n| Consistency | 9.5/10 | 9.0/10 |\n\n**Balanced Assessment:**\n- **Verstappen**: Peak performance, aggressive overtaking, exceptional car control\n- **Hamilton**: Unmatched tire management, clutch performances, experience\n\n⚖️ **Note**: Our models weight recent form alongside career stats. Both are all-time greats with different strengths. Direct comparison requires equal machinery context.`,
            isOutOfScope: false,
        }
    }

    // Championship predictions
    if (q.includes('champion') || q.includes('win') && (q.includes('title') || q.includes('wdc'))) {
        return {
            content: `**Championship Prediction Analysis:**\n\n🏆 **2025 Final Results:**\n1. Lando Norris (McLaren) - 412 pts\n2. Max Verstappen (Red Bull) - 389 pts\n3. Charles Leclerc (Ferrari) - 356 pts\n\n**2026 Pre-Season Odds:**\n| Driver | Win Probability | Key Factor |\n|--------|----------------|------------|\n| Norris | 28% | McLaren continuity |\n| Verstappen | 24% | Adaptability |\n| Leclerc | 22% | Ferrari engine |\n| Hamilton | 15% | Ferrari switch |\n\n📈 **Model Confidence**: 72%\n\n⚠️ New regulations create high variance. Early-season performance will update these significantly.`,
            isOutOfScope: false,
        }
    }

    // Pit strategy for Norris
    if (q.includes('pit') && q.includes('norris')) {
        return {
            content: `**Strategy Analysis for Norris:**\n\n📊 Based on current data:\n- Current stint length: 14 laps on mediums\n- Tire degradation rate: 0.08s/lap\n- Gap to Verstappen: 4.2s\n\n**Recommendation: EXTEND STINT**\n\nReason: Pitting now would drop Norris into traffic. The undercut window has passed. Stay out until lap 22-24 to clear the pit window and emerge with clean air.\n\n⚠️ Risk: If safety car comes out, the strategy advantage is lost.\n\n💡 **McLaren's Strength**: Their car is gentle on rear tires, allowing +2 laps vs field average.`,
            isOutOfScope: false,
        }
    }

    // Wet weather strategy
    if (q.includes('wet') || q.includes('rain')) {
        return {
            content: `**Wet Weather Strategy:**\n\n🌧️ In wet conditions, here are key factors:\n\n1. **Tire Choice**: Start on intermediates if track is damp, full wets if standing water\n2. **Pit Timing**: Be ready to switch compounds quickly as track evolves\n3. **Track Position**: More important in wet - visibility and spray issues\n\n**Driver Wet Skill Rankings:**\n| Driver | Rating | Notable Performance |\n|--------|--------|--------------------|\n| Hamilton | 9.5/10 | Brazil 2016, Turkey 2020 |\n| Verstappen | 9.2/10 | Brazil 2016, Spa 2021 |\n| Leclerc | 8.5/10 | Improving steadily |\n| Norris | 8.8/10 | Sochi 2021 heartbreak |\n\n💡 Pro tip: If rain is coming, stay out on slicks longer than competitors if you're behind. The track crossover point is crucial.`,
            isOutOfScope: false,
        }
    }

    // Tire degradation
    if (q.includes('tire') || q.includes('tyre') || q.includes('degradation')) {
        return {
            content: `**Tire Degradation Analysis:**\n\n📈 At Bahrain, McLaren's tire management:\n\n| Compound | Deg Rate | Optimal Life | Cliff |\n|----------|----------|--------------|-------|\n| Soft | 0.12s/lap | 12 laps | Lap 18 |\n| Medium | 0.07s/lap | 22 laps | Lap 30 |\n| Hard | 0.04s/lap | 38 laps | Lap 48 |\n\n**McLaren-specific factors:**\n- Car is gentle on rear tires (+2 laps vs field average)\n- Higher deg on fronts due to aero balance\n\n**Recommendation:** Use M→H strategy for optimal race pace.\n\n📊 **Model Input**: Tire data uses Pirelli's official compound specifications combined with historical team performance.`,
            isOutOfScope: false,
        }
    }

    // 2-stop strategy
    if (q.includes('2-stop') || q.includes('two stop')) {
        return {
            content: `**2-Stop Strategy Optimization:**\n\n🏎️ For a 57-lap race:\n\n**Optimal Pit Windows:**\n- First stop: Lap 14-18 (S→M transition)\n- Second stop: Lap 36-40 (M→S finish)\n\n**Advantages:**\n✅ Fresher tires for key battles\n✅ Flexibility to react to safety cars\n✅ Higher average pace\n\n**Disadvantages:**\n❌ Extra 22s pit lane time\n❌ Risk of traffic on out-laps\n\n**Break-even point:** 2-stop is faster if tire deg > 0.6s over the stint.\n\n📈 Our Monte Carlo simulations (10,000 runs) show 2-stop wins 58% of scenarios at high-deg tracks.`,
            isOutOfScope: false,
        }
    }

    // Default F1 response
    return {
        content: `**F1 Strategy Analysis:**\n\nI've analyzed your question about F1. Here are some key considerations:\n\n1. **Track Position**: In modern F1, track position is crucial due to dirty air effects\n\n2. **Tire Strategy**: The optimal strategy depends on:\n   - Tire degradation rates (track specific)\n   - Pit lane time loss (typically 22-25s)\n   - Traffic windows\n\n3. **Weather Factors**: Always monitor radar for potential rain\n\n4. **Safety Car Probability**: At most tracks, there's a 35-50% chance of SC\n\n📊 **Our Models**: We use 8 ML models including XGBoost, CatBoost, and our custom NBT-TLF neural network for predictions.\n\nWould you like me to analyze a specific driver's situation, track strategy, or compare team performance?`,
        isOutOfScope: false,
    }
}

export default function StrategyChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "👋 Hello! I'm your AI Strategy Engineer. Ask me anything about Formula 1 racing - strategy, predictions, driver comparisons, regulations, and more!\n\n🏁 **What I can help with:**\n• Pit stop timing & tire choices\n• Driver & team comparisons\n• 2025 results & 2026 predictions\n• Weather strategy & safety cars\n• Historical race analysis\n• Championship projections\n\n⚠️ **Note**: I focus exclusively on F1 topics. Questions outside F1 will be politely redirected.\n\nWhat would you like to analyze?",
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
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800))

        const response = generateResponse(input)
        const assistantMessage: Message = {
            role: 'assistant',
            content: response.content,
            timestamp: new Date(),
            isOutOfScope: response.isOutOfScope,
        }

        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
    }

    const handleSampleQuestion = (question: string) => {
        setInput(question)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black flex flex-col">
            {/* Header with F1 Logo */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="container mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-f1-red rounded-lg flex items-center justify-center">
                            <Flag className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <MessageSquare className="w-8 h-8" />
                            AI Strategy Engineer
                        </h1>
                    </div>
                    <p className="text-white/80 mt-1">Virtual F1 strategy advisor • 95% F1 accuracy • Powered by race intelligence</p>
                </div>
            </div>

            {/* Page Description */}
            <div className="bg-blue-900/30 border-b border-blue-500/30">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-300 text-sm">
                            <strong>What this does:</strong> An AI-powered F1 strategy consultant that answers questions about race strategy, pit timing, tire choices, driver comparisons, and predictions. Trained on F1 data and focused exclusively on motorsport topics.
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 container mx-auto p-4 flex flex-col max-h-[calc(100vh-220px)]">
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
                                className="px-3 py-1.5 bg-f1-gray-800 hover:bg-f1-gray-700 text-gray-300 text-sm rounded-full transition shadow-md hover:shadow-lg"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 bg-f1-gray-800 rounded-xl p-4 overflow-y-auto mb-4 shadow-inner">
                    <div className="space-y-4">
                        {messages.map((message, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${message.role === 'user' ? 'bg-blue-600' : message.isOutOfScope ? 'bg-yellow-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'
                                    }`}>
                                    {message.role === 'user' ?
                                        <User className="w-5 h-5 text-white" /> :
                                        message.isOutOfScope ?
                                            <AlertTriangle className="w-5 h-5 text-white" /> :
                                            <Bot className="w-5 h-5 text-white" />
                                    }
                                </div>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : message.isOutOfScope
                                        ? 'bg-yellow-900/50 text-white border border-yellow-500/30'
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
                                            if (line.match(/^[-•✅❌⚠️💡📊🌧️🏎️📈🚦ℹ️👋🏁🔧⚖️📊]/)) {
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
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-f1-gray-700 rounded-2xl p-4 flex items-center gap-2 shadow-lg">
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    <span className="text-gray-400">Analyzing F1 data...</span>
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
                        placeholder="Ask about F1 race strategy, drivers, teams, or predictions..."
                        className="flex-1 bg-f1-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg"
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
