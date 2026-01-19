'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Radio, Activity, Gauge, Thermometer, Battery, Timer } from 'lucide-react'

const DRIVERS = [
    { id: 'VER', name: 'Verstappen', team: 'Red Bull', color: '#1E41FF', number: 1 },
    { id: 'NOR', name: 'Norris', team: 'McLaren', color: '#FF8700', number: 4 },
    { id: 'LEC', name: 'Leclerc', team: 'Ferrari', color: '#DC0000', number: 16 },
    { id: 'HAM', name: 'Hamilton', team: 'Ferrari', color: '#DC0000', number: 44 },
]

interface TelemetryData {
    speed: number
    throttle: number
    brake: number
    gear: number
    rpm: number
    drs: boolean
    ers: number
    tireTemp: { fl: number, fr: number, rl: number, rr: number }
    lapTime: string
    sector: number
    gap: string
}

export default function TelemetryPage() {
    const [selectedDriver, setSelectedDriver] = useState(DRIVERS[0])
    const [telemetry, setTelemetry] = useState<TelemetryData>({
        speed: 0,
        throttle: 0,
        brake: 0,
        gear: 1,
        rpm: 0,
        drs: false,
        ers: 100,
        tireTemp: { fl: 85, fr: 87, rl: 88, rr: 86 },
        lapTime: '0:00.000',
        sector: 1,
        gap: '+0.000',
    })
    const [isLive, setIsLive] = useState(true)

    // Simulate real-time telemetry updates
    useEffect(() => {
        if (!isLive) return

        const interval = setInterval(() => {
            setTelemetry(prev => {
                const newSpeed = Math.min(340, Math.max(50, prev.speed + (Math.random() - 0.4) * 30))
                const isAccelerating = newSpeed > prev.speed
                const isBraking = newSpeed < prev.speed - 10

                return {
                    speed: Math.round(newSpeed),
                    throttle: isAccelerating ? Math.min(100, prev.throttle + 15) : Math.max(0, prev.throttle - 10),
                    brake: isBraking ? Math.min(100, Math.random() * 80) : 0,
                    gear: Math.min(8, Math.max(1, Math.round(newSpeed / 40))),
                    rpm: Math.min(15000, Math.round(newSpeed * 35 + Math.random() * 1000)),
                    drs: newSpeed > 300 && Math.random() > 0.5,
                    ers: Math.max(0, Math.min(100, prev.ers + (Math.random() - 0.4) * 5)),
                    tireTemp: {
                        fl: Math.round(85 + Math.random() * 15),
                        fr: Math.round(87 + Math.random() * 15),
                        rl: Math.round(88 + Math.random() * 15),
                        rr: Math.round(86 + Math.random() * 15),
                    },
                    lapTime: `1:${(31 + Math.random() * 2).toFixed(3)}`,
                    sector: ((prev.sector % 3) + 1),
                    gap: `+${(Math.random() * 0.5).toFixed(3)}`,
                }
            })
        }, 100)

        return () => clearInterval(interval)
    }, [isLive])

    const getTempColor = (temp: number) => {
        if (temp < 80) return 'text-blue-400'
        if (temp < 95) return 'text-green-400'
        if (temp < 105) return 'text-yellow-400'
        return 'text-red-400'
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Radio className="w-8 h-8" />
                            Live Telemetry Visualization
                        </h1>
                        <p className="text-white/80 mt-1">Real-time car data streaming • Simulated FastF1 feed</p>
                    </div>
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${isLive ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'
                            }`}
                    >
                        <span className={`w-3 h-3 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                        {isLive ? 'LIVE' : 'PAUSED'}
                    </button>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Driver Selection */}
                <div className="flex gap-2 mb-6">
                    {DRIVERS.map(driver => (
                        <button
                            key={driver.id}
                            onClick={() => setSelectedDriver(driver)}
                            className={`px-4 py-3 rounded-lg font-bold transition flex items-center gap-2 ${selectedDriver.id === driver.id
                                    ? 'text-white ring-2 ring-white/50'
                                    : 'bg-f1-gray-800 text-gray-400 hover:text-white'
                                }`}
                            style={{ backgroundColor: selectedDriver.id === driver.id ? driver.color : undefined }}
                        >
                            <span className="text-2xl font-bold">{driver.number}</span>
                            <span>{driver.name}</span>
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Telemetry */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Speed & Gear */}
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-gray-400 text-sm">SPEED</div>
                                    <div className="text-7xl font-bold text-white font-mono">{telemetry.speed}</div>
                                    <div className="text-gray-400">km/h</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-400 text-sm">GEAR</div>
                                    <div className="text-8xl font-bold" style={{ color: selectedDriver.color }}>{telemetry.gear}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-400 text-sm">RPM</div>
                                    <div className="text-4xl font-bold text-white font-mono">{telemetry.rpm.toLocaleString()}</div>
                                    <div className="h-2 bg-f1-gray-700 rounded-full w-32 mt-2 overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-100"
                                            style={{
                                                width: `${(telemetry.rpm / 15000) * 100}%`,
                                                backgroundColor: telemetry.rpm > 13500 ? '#ef4444' : telemetry.rpm > 12000 ? '#f97316' : '#22c55e'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Throttle & Brake */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-f1-gray-800 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400">THROTTLE</span>
                                    <span className="text-green-400 font-bold text-2xl">{telemetry.throttle}%</span>
                                </div>
                                <div className="h-8 bg-f1-gray-700 rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-100"
                                        style={{ width: `${telemetry.throttle}%` }}
                                    />
                                </div>
                            </div>
                            <div className="bg-f1-gray-800 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400">BRAKE</span>
                                    <span className="text-red-400 font-bold text-2xl">{Math.round(telemetry.brake)}%</span>
                                </div>
                                <div className="h-8 bg-f1-gray-700 rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 transition-all duration-100"
                                        style={{ width: `${telemetry.brake}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tire Temps */}
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Thermometer className="w-5 h-5 text-orange-400" />
                                Tire Temperatures
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-f1-gray-700 rounded-lg">
                                        <div className="text-gray-400 text-xs mb-1">FRONT LEFT</div>
                                        <div className={`text-3xl font-bold font-mono ${getTempColor(telemetry.tireTemp.fl)}`}>
                                            {telemetry.tireTemp.fl}°
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-f1-gray-700 rounded-lg">
                                        <div className="text-gray-400 text-xs mb-1">FRONT RIGHT</div>
                                        <div className={`text-3xl font-bold font-mono ${getTempColor(telemetry.tireTemp.fr)}`}>
                                            {telemetry.tireTemp.fr}°
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-f1-gray-700 rounded-lg">
                                        <div className="text-gray-400 text-xs mb-1">REAR LEFT</div>
                                        <div className={`text-3xl font-bold font-mono ${getTempColor(telemetry.tireTemp.rl)}`}>
                                            {telemetry.tireTemp.rl}°
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-f1-gray-700 rounded-lg">
                                        <div className="text-gray-400 text-xs mb-1">REAR RIGHT</div>
                                        <div className={`text-3xl font-bold font-mono ${getTempColor(telemetry.tireTemp.rr)}`}>
                                            {telemetry.tireTemp.rr}°
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="space-y-4">
                        {/* Lap Info */}
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Timer className="w-5 h-5 text-blue-400" />
                                Lap Timing
                            </h3>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-gray-400 text-sm">CURRENT LAP</div>
                                    <div className="text-4xl font-bold text-white font-mono">{telemetry.lapTime}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-400 text-sm">SECTOR</div>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3].map(s => (
                                            <div
                                                key={s}
                                                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl ${telemetry.sector === s
                                                        ? 'bg-purple-600 text-white'
                                                        : telemetry.sector > s
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-f1-gray-700 text-gray-400'
                                                    }`}
                                            >
                                                S{s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-400 text-sm">GAP TO LEADER</div>
                                    <div className="text-2xl font-bold text-yellow-400 font-mono">{telemetry.gap}</div>
                                </div>
                            </div>
                        </div>

                        {/* ERS */}
                        <div className="bg-f1-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Battery className="w-5 h-5 text-green-400" />
                                ERS Deploy
                            </h3>
                            <div className="text-center mb-4">
                                <div className="text-5xl font-bold text-green-400 font-mono">{Math.round(telemetry.ers)}%</div>
                            </div>
                            <div className="h-4 bg-f1-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-100"
                                    style={{ width: `${telemetry.ers}%` }}
                                />
                            </div>
                        </div>

                        {/* DRS Status */}
                        <div className={`rounded-xl p-6 text-center ${telemetry.drs ? 'bg-green-600' : 'bg-f1-gray-800'
                            }`}>
                            <div className="text-4xl font-bold text-white">DRS</div>
                            <div className={`text-lg ${telemetry.drs ? 'text-white' : 'text-gray-400'}`}>
                                {telemetry.drs ? 'ACTIVE' : 'INACTIVE'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <Link href="/" className="text-cyan-400 hover:underline">← Back to Home</Link>
            </div>
        </div>
    )
}
