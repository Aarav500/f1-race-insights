'use client'

import { useState, useEffect } from 'react'
import { getSeasons, getRaces, RaceInfo } from '@/utils/api'

interface RacePickerProps {
    onRaceSelect: (raceId: string, raceName: string) => void
    initialRaceId?: string
    className?: string
    label?: string
}

export default function RacePicker({
    onRaceSelect,
    initialRaceId,
    className = '',
    label = 'Select Race'
}: RacePickerProps) {
    const [seasons, setSeasons] = useState<number[]>([])
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
    const [races, setRaces] = useState<RaceInfo[]>([])
    const [selectedRaceId, setSelectedRaceId] = useState<string>(initialRaceId || '')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load seasons on mount
    useEffect(() => {
        loadSeasons()
    }, [])

    // Load races when season changes
    useEffect(() => {
        if (selectedSeason !== null) {
            loadRaces(selectedSeason)
        }
    }, [selectedSeason])

    // Auto-select initial race's season if provided
    useEffect(() => {
        if (initialRaceId && races.length > 0) {
            const race = races.find(r => r.race_id === initialRaceId)
            if (race && race.season !== selectedSeason) {
                setSelectedSeason(race.season)
            }
        }
    }, [initialRaceId, races])

    const loadSeasons = async () => {
        try {
            setLoading(true)
            const data = await getSeasons()
            setSeasons(data.seasons)

            // Auto-select latest season
            if (data.seasons.length > 0) {
                setSelectedSeason(data.latest)
            }
        } catch (err: any) {
            console.error('Failed to load seasons:', err)
            setError('Failed to load seasons')
            // Fallback to 2024
            setSeasons([2024])
            setSelectedSeason(2024)
        } finally {
            setLoading(false)
        }
    }

    const loadRaces = async (season: number) => {
        try {
            const data = await getRaces(season)
            setRaces(data.races)

            // If we have an initialRaceId that matches this season, select it
            if (initialRaceId) {
                const matchingRace = data.races.find(r => r.race_id === initialRaceId)
                if (matchingRace) {
                    setSelectedRaceId(initialRaceId)
                }
            } else if (data.races.length > 0 && !selectedRaceId) {
                // Auto-select first race if none selected, but DON'T trigger callback
                // This prevents auto-redirect on homepage
                const firstRace = data.races[0]
                setSelectedRaceId(firstRace.race_id)
                // Removed: onRaceSelect(firstRace.race_id, firstRace.name)
            }
        } catch (err: any) {
            console.error('Failed to load races:', err)
            setError('Failed to load races')
            setRaces([])
        }
    }

    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const season = parseInt(e.target.value)
        setSelectedSeason(season)
        setSelectedRaceId('') // Reset race selection
    }

    const handleRaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const raceId = e.target.value
        setSelectedRaceId(raceId)

        const race = races.find(r => r.race_id === raceId)
        if (race) {
            onRaceSelect(raceId, race.name)
        }
    }

    if (loading) {
        return (
            <div className={className}>
                <p className="text-f1-gray-600 text-sm">Loading seasons...</p>
            </div>
        )
    }

    if (error && seasons.length === 0) {
        return (
            <div className={className}>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        )
    }

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium mb-2 text-f1-gray-700">
                    {label}
                </label>
            )}
            <div className="grid grid-cols-2 gap-4">
                {/* Season Dropdown */}
                <div>
                    <label className="block text-xs text-f1-gray-600 mb-1">Season</label>
                    <select
                        value={selectedSeason || ''}
                        onChange={handleSeasonChange}
                        className="w-full px-4 py-2 border border-f1-gray-300 rounded-lg focus:ring-2 focus:ring-f1-red focus:border-transparent"
                    >
                        {seasons.map(season => (
                            <option key={season} value={season}>
                                {season}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Race Dropdown */}
                <div>
                    <label className="block text-xs text-f1-gray-600 mb-1">Race</label>
                    <select
                        value={selectedRaceId}
                        onChange={handleRaceChange}
                        disabled={races.length === 0}
                        className="w-full px-4 py-2 border border-f1-gray-300 rounded-lg focus:ring-2 focus:ring-f1-red focus:border-transparent disabled:bg-f1-gray-100"
                    >
                        {races.length === 0 ? (
                            <option>No races available</option>
                        ) : (
                            races.map(race => (
                                <option key={race.race_id} value={race.race_id}>
                                    {race.round}. {race.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>
        </div>
    )
}
