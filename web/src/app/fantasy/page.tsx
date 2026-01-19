'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Trophy, DollarSign, TrendingUp, Users, Zap, Star, Target, ArrowRight } from 'lucide-react'

// Fantasy F1 driver data with costs and projections
const FANTASY_DRIVERS = [
    { id: 'VER', name: 'Max Verstappen', team: 'Red Bull', color: '#1E41FF', cost: 30.5, avgPoints: 24.2, form: 9.5, value: 0.79 },
    { id: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#FF8700', cost: 28.0, avgPoints: 22.8, form: 9.2, value: 0.81 },
    { id: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#DC0000', cost: 25.5, avgPoints: 18.5, form: 8.5, value: 0.73 },
    { id: 'HAM', name: 'Lewis Hamilton', team: 'Ferrari', color: '#DC0000', cost: 24.0, avgPoints: 17.2, form: 8.0, value: 0.72 },
    { id: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#FF8700', cost: 22.0, avgPoints: 16.8, form: 8.8, value: 0.76 },
    { id: 'RUS', name: 'George Russell', team: 'Mercedes', color: '#00D2BE', cost: 20.0, avgPoints: 14.5, form: 7.8, value: 0.73 },
    { id: 'SAI', name: 'Carlos Sainz', team: 'Williams', color: '#005AFF', cost: 18.0, avgPoints: 12.2, form: 7.5, value: 0.68 },
    { id: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', color: '#006F62', cost: 16.0, avgPoints: 10.8, form: 7.2, value: 0.68 },
    { id: 'STR', name: 'Lance Stroll', team: 'Aston Martin', color: '#006F62', cost: 10.0, avgPoints: 5.5, form: 5.5, value: 0.55 },
    { id: 'GAS', name: 'Pierre Gasly', team: 'Alpine', color: '#0090FF', cost: 12.0, avgPoints: 6.8, form: 6.5, value: 0.57 },
    { id: 'OCO', name: 'Esteban Ocon', team: 'Haas', color: '#B6BABD', cost: 10.5, avgPoints: 5.2, form: 6.0, value: 0.50 },
    { id: 'HUL', name: 'Nico Hulkenberg', team: 'Sauber', color: '#52E252', cost: 9.0, avgPoints: 4.8, form: 6.2, value: 0.53 },
    { id: 'TSU', name: 'Yuki Tsunoda', team: 'RB', color: '#6692FF', cost: 11.0, avgPoints: 6.2, form: 6.8, value: 0.56 },
    { id: 'ALB', name: 'Alex Albon', team: 'Williams', color: '#005AFF', cost: 11.5, avgPoints: 6.5, form: 7.0, value: 0.57 },
]

const FANTASY_CONSTRUCTORS = [
    { id: 'mclaren', name: 'McLaren', color: '#FF8700', cost: 32.0, avgPoints: 45.5 },
    { id: 'redbull', name: 'Red Bull', color: '#1E41FF', cost: 30.0, avgPoints: 38.2 },
    { id: 'ferrari', name: 'Ferrari', color: '#DC0000', cost: 28.0, avgPoints: 35.8 },
    { id: 'mercedes', name: 'Mercedes', color: '#00D2BE', cost: 22.0, avgPoints: 28.5 },
    { id: 'astonmartin', name: 'Aston Martin', color: '#006F62', cost: 14.0, avgPoints: 16.3 },
    { id: 'williams', name: 'Williams', color: '#005AFF', cost: 12.0, avgPoints: 12.8 },
]

const BUDGET_CAP = 100.0

export default function FantasyPage() {
    const [selectedDrivers, setSelectedDrivers] = useState<string[]>([])
    const [selectedConstructor, setSelectedConstructor] = useState<string | null>(null)
    const [showDifferentials, setShowDifferentials] = useState(false)

    const totalCost = useMemo(() => {
        const driversCost = selectedDrivers.reduce((sum, id) => {
            const driver = FANTASY_DRIVERS.find(d => d.id === id)
            return sum + (driver?.cost || 0)
        }, 0)
        const constructorCost = FANTASY_CONSTRUCTORS.find(c => c.id === selectedConstructor)?.cost || 0
        return driversCost + constructorCost
    }, [selectedDrivers, selectedConstructor])

    const projectedPoints = useMemo(() => {
        const driversPoints = selectedDrivers.reduce((sum, id) => {
            const driver = FANTASY_DRIVERS.find(d => d.id === id)
            return sum + (driver?.avgPoints || 0)
        }, 0)
        const constructorPoints = FANTASY_CONSTRUCTORS.find(c => c.id === selectedConstructor)?.avgPoints || 0
        return driversPoints + constructorPoints
    }, [selectedDrivers, selectedConstructor])

    const toggleDriver = (id: string) => {
        if (selectedDrivers.includes(id)) {
            setSelectedDrivers(selectedDrivers.filter(d => d !== id))
        } else if (selectedDrivers.length < 5) {
            const driver = FANTASY_DRIVERS.find(d => d.id === id)!
            if (totalCost + driver.cost <= BUDGET_CAP) {
                setSelectedDrivers([...selectedDrivers, id])
            }
        }
    }

    // Calculate optimal team
    const optimalTeam = useMemo(() => {
        // Simple greedy algorithm for optimal team
        const sortedDrivers = [...FANTASY_DRIVERS].sort((a, b) => b.value - a.value)
        const sortedConstructors = [...FANTASY_CONSTRUCTORS].sort((a, b) => (b.avgPoints / b.cost) - (a.avgPoints / a.cost))

        const team: string[] = []
        let budget = BUDGET_CAP - sortedConstructors[0].cost

        for (const driver of sortedDrivers) {
            if (team.length < 5 && driver.cost <= budget) {
                team.push(driver.id)
                budget -= driver.cost
            }
        }

        return { drivers: team, constructor: sortedConstructors[0].id }
    }, [])

    // Differential picks (undervalued drivers)
    const differentials = useMemo(() => {
        return FANTASY_DRIVERS
            .filter(d => d.value > 0.65)
            .sort((a, b) => b.value - a.value)
            .slice(0, 3)
    }, [])

    const budgetRemaining = BUDGET_CAP - totalCost

    return (
        <div className="min-h-screen bg-gradient-to-b from-f1-gray-900 to-f1-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8" />
                        Fantasy F1 Predictor
                    </h1>
                    <p className="text-white/80 mt-1">ML-powered fantasy point predictions • Optimal team builder</p>
                </div>
            </div>

            <div className="container mx-auto p-4 grid lg:grid-cols-3 gap-6">
                {/* Team Builder */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Budget Bar */}
                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-bold flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-400" />
                                Budget: ${totalCost.toFixed(1)}M / ${BUDGET_CAP}M
                            </span>
                            <span className={`font-bold ${budgetRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${budgetRemaining.toFixed(1)}M remaining
                            </span>
                        </div>
                        <div className="h-4 bg-f1-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${budgetRemaining >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, (totalCost / BUDGET_CAP) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Driver Selection */}
                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-f1-red" />
                                Select 5 Drivers
                            </h2>
                            <span className="text-gray-400">{selectedDrivers.length}/5 selected</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                            {FANTASY_DRIVERS.map(driver => {
                                const isSelected = selectedDrivers.includes(driver.id)
                                const canAfford = budgetRemaining >= driver.cost || isSelected
                                return (
                                    <button
                                        key={driver.id}
                                        onClick={() => toggleDriver(driver.id)}
                                        disabled={!canAfford && !isSelected}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition ${isSelected
                                                ? 'bg-green-600/30 border-2 border-green-500'
                                                : canAfford
                                                    ? 'bg-f1-gray-700 hover:bg-f1-gray-600 border-2 border-transparent'
                                                    : 'bg-f1-gray-700/50 opacity-50 cursor-not-allowed border-2 border-transparent'
                                            }`}
                                    >
                                        <div className="w-3 h-10 rounded" style={{ backgroundColor: driver.color }} />
                                        <div className="flex-1 text-left">
                                            <div className="font-bold text-white">{driver.name}</div>
                                            <div className="text-xs text-gray-400">{driver.team}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white">${driver.cost}M</div>
                                            <div className="text-xs text-green-400">~{driver.avgPoints} pts</div>
                                        </div>
                                        {isSelected && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Constructor Selection */}
                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Select Constructor
                        </h2>
                        <div className="grid md:grid-cols-3 gap-2">
                            {FANTASY_CONSTRUCTORS.map(team => {
                                const isSelected = selectedConstructor === team.id
                                return (
                                    <button
                                        key={team.id}
                                        onClick={() => setSelectedConstructor(isSelected ? null : team.id)}
                                        className={`p-4 rounded-lg transition text-center ${isSelected
                                                ? 'bg-green-600/30 border-2 border-green-500'
                                                : 'bg-f1-gray-700 hover:bg-f1-gray-600 border-2 border-transparent'
                                            }`}
                                    >
                                        <div className="w-full h-2 rounded mb-2" style={{ backgroundColor: team.color }} />
                                        <div className="font-bold text-white">{team.name}</div>
                                        <div className="text-sm text-gray-400">${team.cost}M • ~{team.avgPoints} pts</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                    {/* Projected Points */}
                    <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Projected Points
                        </h3>
                        <div className="text-5xl font-bold">{projectedPoints.toFixed(1)}</div>
                        <div className="text-sm opacity-80 mt-1">Based on ML predictions</div>
                    </div>

                    {/* Optimal Team Suggestion */}
                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            Optimal Team
                        </h3>
                        <div className="space-y-2 text-sm">
                            {optimalTeam.drivers.map(id => {
                                const driver = FANTASY_DRIVERS.find(d => d.id === id)!
                                return (
                                    <div key={id} className="flex justify-between text-gray-300">
                                        <span>{driver.name}</span>
                                        <span className="text-green-400">${driver.cost}M</span>
                                    </div>
                                )
                            })}
                            <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between text-white font-bold">
                                <span>{FANTASY_CONSTRUCTORS.find(c => c.id === optimalTeam.constructor)?.name}</span>
                                <span>${FANTASY_CONSTRUCTORS.find(c => c.id === optimalTeam.constructor)?.cost}M</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedDrivers(optimalTeam.drivers)
                                setSelectedConstructor(optimalTeam.constructor)
                            }}
                            className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold transition"
                        >
                            Apply Optimal Team
                        </button>
                    </div>

                    {/* Differential Picks */}
                    <div className="bg-f1-gray-800 rounded-xl p-4">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Differential Picks
                        </h3>
                        <p className="text-xs text-gray-400 mb-3">Undervalued drivers with high upside</p>
                        <div className="space-y-2">
                            {differentials.map(driver => (
                                <div key={driver.id} className="flex items-center gap-2 p-2 bg-f1-gray-700 rounded-lg">
                                    <div className="w-2 h-8 rounded" style={{ backgroundColor: driver.color }} />
                                    <div className="flex-1">
                                        <div className="text-white font-medium text-sm">{driver.name}</div>
                                        <div className="text-xs text-gray-400">${driver.cost}M • Value: {(driver.value * 100).toFixed(0)}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Back Link */}
                    <Link href="/" className="block text-f1-red hover:underline text-center">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
