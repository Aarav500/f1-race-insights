'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, Moon, Sun, Keyboard, Volume2, VolumeX, Bell, Eye, Palette } from 'lucide-react'

// Keyboard shortcuts
const SHORTCUTS = [
    { key: 'S', action: 'Open Simulator', category: 'Navigation' },
    { key: 'C', action: 'Championship View', category: 'Navigation' },
    { key: 'P', action: 'Pit Strategy', category: 'Navigation' },
    { key: 'H', action: 'Go Home', category: 'Navigation' },
    { key: '?', action: 'Show Shortcuts', category: 'Help' },
    { key: 'Esc', action: 'Close Modal', category: 'General' },
    { key: '/', action: 'Focus Search', category: 'General' },
]

export default function SettingsPage() {
    // Load from localStorage with defaults
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('f1-dark-mode')
            return saved !== null ? JSON.parse(saved) : true
        }
        return true
    })
    const [audioEnabled, setAudioEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('f1-audio')
            return saved !== null ? JSON.parse(saved) : false
        }
        return false
    })
    const [notifications, setNotifications] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('f1-notifications')
            return saved !== null ? JSON.parse(saved) : true
        }
        return true
    })
    const [reducedMotion, setReducedMotion] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('f1-reduced-motion')
            return saved !== null ? JSON.parse(saved) : false
        }
        return false
    })
    const [accentColor, setAccentColor] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('f1-accent-color') || 'red'
        }
        return 'red'
    })

    // Save to localStorage when settings change
    useEffect(() => {
        localStorage.setItem('f1-dark-mode', JSON.stringify(isDark))
    }, [isDark])
    useEffect(() => {
        localStorage.setItem('f1-audio', JSON.stringify(audioEnabled))
    }, [audioEnabled])
    useEffect(() => {
        localStorage.setItem('f1-notifications', JSON.stringify(notifications))
    }, [notifications])
    useEffect(() => {
        localStorage.setItem('f1-reduced-motion', JSON.stringify(reducedMotion))
    }, [reducedMotion])
    useEffect(() => {
        localStorage.setItem('f1-accent-color', accentColor)
    }, [accentColor])

    // Apply theme
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDark])

    // Listen for keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            switch (e.key.toLowerCase()) {
                case 's':
                    window.location.href = '/simulator'
                    break
                case 'c':
                    window.location.href = '/championship'
                    break
                case 'p':
                    window.location.href = '/strategy'
                    break
                case 'h':
                    window.location.href = '/'
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const accentColors = [
        { id: 'red', color: '#E10600', name: 'F1 Red' },
        { id: 'blue', color: '#1E41FF', name: 'Red Bull Blue' },
        { id: 'orange', color: '#FF8700', name: 'McLaren Orange' },
        { id: 'teal', color: '#00D2BE', name: 'Mercedes Teal' },
        { id: 'green', color: '#006F62', name: 'Aston Martin' },
    ]

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gradient-to-b from-f1-gray-900 to-f1-black' : 'bg-gradient-to-b from-gray-100 to-white'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        Settings & Preferences
                    </h1>
                    <p className="text-white/80 mt-1">Theme • Accessibility • Keyboard Shortcuts</p>
                </div>
            </div>

            <div className="container mx-auto p-4 space-y-6">
                {/* Appearance */}
                <div className={`rounded-xl p-6 ${isDark ? 'bg-f1-gray-800' : 'bg-white shadow-lg'}`}>
                    <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Palette className="w-5 h-5" />
                        Appearance
                    </h2>

                    {/* Dark/Light Mode */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-700/50">
                        <div>
                            <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dark Mode</div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Toggle between dark and light themes</div>
                        </div>
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className={`w-16 h-8 rounded-full relative transition-colors ${isDark ? 'bg-f1-red' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all flex items-center justify-center ${isDark ? 'left-9' : 'left-1'}`}>
                                {isDark ? <Moon className="w-4 h-4 text-gray-800" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                            </div>
                        </button>
                    </div>

                    {/* Accent Color */}
                    <div className="py-4">
                        <div className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Accent Color</div>
                        <div className="flex gap-3">
                            {accentColors.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setAccentColor(c.id)}
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${accentColor === c.id ? 'border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c.color }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Accessibility */}
                <div className={`rounded-xl p-6 ${isDark ? 'bg-f1-gray-800' : 'bg-white shadow-lg'}`}>
                    <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Eye className="w-5 h-5" />
                        Accessibility
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Reduced Motion</div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Disable animations for accessibility</div>
                            </div>
                            <button
                                onClick={() => setReducedMotion(!reducedMotion)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${reducedMotion ? 'bg-f1-red' : isDark ? 'bg-f1-gray-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${reducedMotion ? 'left-6' : 'left-0.5'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div>
                                <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Audio Narration</div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Enable race ticker audio updates</div>
                            </div>
                            <button
                                onClick={() => setAudioEnabled(!audioEnabled)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${audioEnabled ? 'bg-f1-red' : isDark ? 'bg-f1-gray-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all flex items-center justify-center ${audioEnabled ? 'left-6' : 'left-0.5'}`}>
                                    {audioEnabled ? <Volume2 className="w-3 h-3 text-gray-800" /> : <VolumeX className="w-3 h-3 text-gray-400" />}
                                </div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div>
                                <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Race Notifications</div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Enable push notifications for live races</div>
                            </div>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-f1-red' : isDark ? 'bg-f1-gray-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all flex items-center justify-center ${notifications ? 'left-6' : 'left-0.5'}`}>
                                    <Bell className={`w-3 h-3 ${notifications ? 'text-gray-800' : 'text-gray-400'}`} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className={`rounded-xl p-6 ${isDark ? 'bg-f1-gray-800' : 'bg-white shadow-lg'}`}>
                    <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Keyboard className="w-5 h-5" />
                        Keyboard Shortcuts
                    </h2>

                    <div className="grid md:grid-cols-2 gap-3">
                        {SHORTCUTS.map(shortcut => (
                            <div key={shortcut.key} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-f1-gray-700' : 'bg-gray-100'}`}>
                                <div>
                                    <div className={isDark ? 'text-white' : 'text-gray-900'}>{shortcut.action}</div>
                                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{shortcut.category}</div>
                                </div>
                                <kbd className={`px-3 py-1 rounded font-mono text-sm ${isDark ? 'bg-f1-gray-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {shortcut.key}
                                </kbd>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className={isDark ? 'text-gray-400 hover:underline' : 'text-gray-600 hover:underline'}>← Back to Home</Link>
            </div>
        </div>
    )
}
