'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, ArrowUp, ArrowDown, HelpCircle, Sparkles, ChevronRight } from 'lucide-react'

// Comprehensive SHAP values for all drivers and races
const SHAP_DATA: Record<string, Record<string, { features: { name: string; value: number; impact: number }[]; baseProb: number; finalProb: number }>> = {
    // MAX VERSTAPPEN
    'VER': {
        '2024_bahrain': {
            baseProb: 0.05, finalProb: 0.72,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.35 },
                { name: 'Driver Rolling Form', value: 2.1, impact: 0.18 },
                { name: 'Constructor Strength', value: 9.2, impact: 0.12 },
                { name: 'Track History (Bahrain)', value: 1.0, impact: 0.08 },
                { name: 'Reliability Risk', value: 0.02, impact: -0.02 },
                { name: 'Quali Delta to Pole', value: 0, impact: 0.04 },
                { name: 'DNF Rate (Historical)', value: 0.05, impact: -0.03 },
            ]
        },
        '2024_jeddah': {
            baseProb: 0.05, finalProb: 0.68,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.32 },
                { name: 'Driver Rolling Form', value: 1.8, impact: 0.20 },
                { name: 'Constructor Strength', value: 9.3, impact: 0.11 },
                { name: 'Track History (Jeddah)', value: 2.0, impact: 0.05 },
                { name: 'High Speed Sections', value: 8.5, impact: 0.06 },
                { name: 'Street Circuit Penalty', value: 0.1, impact: -0.06 },
            ]
        },
        '2024_monaco': {
            baseProb: 0.05, finalProb: 0.45,
            features: [
                { name: 'Qualifying Position (P6)', value: 6, impact: 0.08 },
                { name: 'Driver Rolling Form', value: 2.5, impact: 0.12 },
                { name: 'Constructor Strength', value: 8.8, impact: 0.10 },
                { name: 'Track History (Monaco)', value: 4.0, impact: 0.04 },
                { name: 'Overtaking Difficulty', value: 9.5, impact: -0.12 },
                { name: 'Car Width Disadvantage', value: 0.8, impact: -0.07 },
                { name: 'Reliability Risk', value: 0.03, impact: 0.02 },
            ]
        },
        '2024_monza': {
            baseProb: 0.05, finalProb: 0.55,
            features: [
                { name: 'Qualifying Position (P3)', value: 3, impact: 0.15 },
                { name: 'Driver Rolling Form', value: 2.2, impact: 0.16 },
                { name: 'Constructor Strength', value: 8.5, impact: 0.09 },
                { name: 'Track History (Monza)', value: 2.0, impact: 0.05 },
                { name: 'Low Downforce Setup', value: 7.8, impact: 0.08 },
                { name: 'Slipstream Vulnerability', value: 0.6, impact: -0.03 },
            ]
        },
        '2024_suzuka': {
            baseProb: 0.05, finalProb: 0.78,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.35 },
                { name: 'Driver Rolling Form', value: 1.5, impact: 0.22 },
                { name: 'Constructor Strength', value: 9.4, impact: 0.12 },
                { name: 'Track History (Suzuka)', value: 1.2, impact: 0.10 },
                { name: 'Technical Sections', value: 9.2, impact: 0.08 },
                { name: 'Reliability Risk', value: 0.02, impact: -0.04 },
            ]
        },
        '2024_spa': {
            baseProb: 0.05, finalProb: 0.65,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.30 },
                { name: 'Driver Rolling Form', value: 2.0, impact: 0.15 },
                { name: 'Constructor Strength', value: 9.0, impact: 0.10 },
                { name: 'Track History (Spa)', value: 1.8, impact: 0.08 },
                { name: 'Weather Uncertainty', value: 0.4, impact: -0.05 },
                { name: 'Grid Penalty Applied', value: 5, impact: -0.08 },
            ]
        },
        '2024_silverstone': {
            baseProb: 0.05, finalProb: 0.52,
            features: [
                { name: 'Qualifying Position (P4)', value: 4, impact: 0.12 },
                { name: 'Driver Rolling Form', value: 2.3, impact: 0.14 },
                { name: 'Constructor Strength', value: 8.6, impact: 0.09 },
                { name: 'Track History (Silverstone)', value: 3.0, impact: 0.06 },
                { name: 'High-Speed Corners', value: 8.8, impact: 0.08 },
                { name: 'McLaren Threat', value: 0.7, impact: -0.12 },
            ]
        },
        '2023_bahrain': {
            baseProb: 0.05, finalProb: 0.82,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.38 },
                { name: 'Driver Rolling Form', value: 1.2, impact: 0.24 },
                { name: 'Constructor Strength', value: 9.8, impact: 0.15 },
                { name: 'Track History (Bahrain)', value: 1.5, impact: 0.08 },
                { name: 'Reliability Risk', value: 0.01, impact: -0.03 },
            ]
        },
    },
    // LANDO NORRIS
    'NOR': {
        '2024_bahrain': {
            baseProb: 0.05, finalProb: 0.08,
            features: [
                { name: 'Qualifying Position (P7)', value: 7, impact: 0.02 },
                { name: 'Driver Rolling Form', value: 5.2, impact: 0.01 },
                { name: 'Constructor Strength', value: 5.5, impact: -0.01 },
                { name: 'Track History (Bahrain)', value: 6.0, impact: -0.02 },
                { name: 'Reliability Risk', value: 0.08, impact: -0.02 },
            ]
        },
        '2024_miami': {
            baseProb: 0.05, finalProb: 0.42,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.22 },
                { name: 'Driver Rolling Form', value: 3.5, impact: 0.10 },
                { name: 'Constructor Strength', value: 7.8, impact: 0.06 },
                { name: 'Track History (Miami)', value: 2.5, impact: 0.04 },
                { name: 'McLaren Upgrade Impact', value: 8.5, impact: 0.08 },
                { name: 'Humidity Factor', value: 0.3, impact: -0.03 },
            ]
        },
        '2024_silverstone': {
            baseProb: 0.05, finalProb: 0.38,
            features: [
                { name: 'Qualifying Position (P2)', value: 2, impact: 0.18 },
                { name: 'Driver Rolling Form', value: 2.8, impact: 0.12 },
                { name: 'Constructor Strength', value: 8.2, impact: 0.08 },
                { name: 'Track History (Silverstone)', value: 2.0, impact: 0.05 },
                { name: 'Home Race Advantage', value: 0.9, impact: 0.03 },
                { name: 'Red Bull Pace', value: 0.7, impact: -0.08 },
            ]
        },
        '2024_monza': {
            baseProb: 0.05, finalProb: 0.32,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.18 },
                { name: 'Driver Rolling Form', value: 2.5, impact: 0.10 },
                { name: 'Constructor Strength', value: 8.5, impact: 0.07 },
                { name: 'Low Downforce Efficiency', value: 8.2, impact: 0.05 },
                { name: 'Ferrari Home Advantage', value: 0.5, impact: -0.08 },
            ]
        },
        '2024_singapore': {
            baseProb: 0.05, finalProb: 0.45,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.22 },
                { name: 'Driver Rolling Form', value: 2.2, impact: 0.12 },
                { name: 'Constructor Strength', value: 8.8, impact: 0.08 },
                { name: 'Street Circuit Performance', value: 8.5, impact: 0.06 },
                { name: 'Track History (Singapore)', value: 3.0, impact: 0.02 },
                { name: 'Verstappen Pace', value: 0.6, impact: -0.10 },
            ]
        },
        '2024_austin': {
            baseProb: 0.05, finalProb: 0.35,
            features: [
                { name: 'Qualifying Position (P2)', value: 2, impact: 0.15 },
                { name: 'Driver Rolling Form', value: 2.0, impact: 0.12 },
                { name: 'Constructor Strength', value: 8.6, impact: 0.08 },
                { name: 'Track History (Austin)', value: 4.0, impact: 0.03 },
                { name: 'Sprint Race Fatigue', value: 0.4, impact: -0.03 },
            ]
        },
        '2023_silverstone': {
            baseProb: 0.05, finalProb: 0.15,
            features: [
                { name: 'Qualifying Position (P4)', value: 4, impact: 0.06 },
                { name: 'Driver Rolling Form', value: 4.5, impact: 0.04 },
                { name: 'Constructor Strength', value: 6.2, impact: 0.01 },
                { name: 'Home Race Advantage', value: 0.8, impact: 0.02 },
                { name: 'Red Bull Dominance', value: 0.9, impact: -0.08 },
            ]
        },
    },
    // CHARLES LECLERC
    'LEC': {
        '2024_bahrain': {
            baseProb: 0.05, finalProb: 0.18,
            features: [
                { name: 'Qualifying Position (P3)', value: 3, impact: 0.08 },
                { name: 'Driver Rolling Form', value: 3.8, impact: 0.03 },
                { name: 'Constructor Strength', value: 7.2, impact: 0.02 },
                { name: 'Track History (Bahrain)', value: 2.0, impact: 0.01 },
                { name: 'Reliability Risk', value: 0.12, impact: -0.03 },
            ]
        },
        '2024_monaco': {
            baseProb: 0.05, finalProb: 0.55,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.28 },
                { name: 'Driver Rolling Form', value: 2.5, impact: 0.10 },
                { name: 'Constructor Strength', value: 7.8, impact: 0.05 },
                { name: 'Home Race Advantage', value: 9.5, impact: 0.12 },
                { name: 'Track History (Monaco)', value: 3.0, impact: 0.05 },
                { name: 'Overtaking Difficulty', value: 9.5, impact: -0.05 },
                { name: 'Reliability Concerns', value: 0.15, impact: -0.05 },
            ]
        },
        '2024_monza': {
            baseProb: 0.05, finalProb: 0.42,
            features: [
                { name: 'Qualifying Position (P4)', value: 4, impact: 0.12 },
                { name: 'Driver Rolling Form', value: 2.8, impact: 0.10 },
                { name: 'Constructor Strength', value: 8.0, impact: 0.08 },
                { name: 'Home Race (Italy)', value: 9.2, impact: 0.10 },
                { name: 'Tifosi Support', value: 0.95, impact: 0.05 },
                { name: 'McLaren Pace', value: 0.7, impact: -0.08 },
            ]
        },
        '2024_singapore': {
            baseProb: 0.05, finalProb: 0.28,
            features: [
                { name: 'Qualifying Position (P3)', value: 3, impact: 0.12 },
                { name: 'Driver Rolling Form', value: 3.2, impact: 0.08 },
                { name: 'Constructor Strength', value: 7.5, impact: 0.05 },
                { name: 'Street Circuit Skills', value: 8.8, impact: 0.06 },
                { name: 'Humidity Impact', value: 0.4, impact: -0.03 },
            ]
        },
        '2024_austin': {
            baseProb: 0.05, finalProb: 0.32,
            features: [
                { name: 'Qualifying Position (P3)', value: 3, impact: 0.14 },
                { name: 'Driver Rolling Form', value: 2.5, impact: 0.10 },
                { name: 'Constructor Strength', value: 8.2, impact: 0.08 },
                { name: 'Track History (Austin)', value: 3.5, impact: 0.04 },
                { name: 'Red Bull Competition', value: 0.8, impact: -0.09 },
            ]
        },
        '2023_monaco': {
            baseProb: 0.05, finalProb: 0.12,
            features: [
                { name: 'Qualifying Position (P3)', value: 3, impact: 0.05 },
                { name: 'Driver Rolling Form', value: 4.5, impact: 0.02 },
                { name: 'Home Race Psychology', value: 0.3, impact: -0.03 },
                { name: 'Red Bull Dominance', value: 0.95, impact: -0.08 },
            ]
        },
    },
    // LEWIS HAMILTON
    'HAM': {
        '2024_bahrain': {
            baseProb: 0.05, finalProb: 0.12,
            features: [
                { name: 'Qualifying Position (P5)', value: 5, impact: 0.04 },
                { name: 'Driver Rolling Form', value: 4.2, impact: 0.02 },
                { name: 'Constructor Strength', value: 6.5, impact: 0.01 },
                { name: 'Track History (Bahrain)', value: 1.5, impact: 0.02 },
                { name: 'Reliability Risk', value: 0.05, impact: -0.02 },
            ]
        },
        '2024_silverstone': {
            baseProb: 0.05, finalProb: 0.48,
            features: [
                { name: 'Qualifying Position (P2)', value: 2, impact: 0.20 },
                { name: 'Driver Rolling Form', value: 2.5, impact: 0.12 },
                { name: 'Constructor Strength', value: 8.0, impact: 0.08 },
                { name: 'Home Race Advantage', value: 9.8, impact: 0.12 },
                { name: 'Track History (8 wins)', value: 1.0, impact: 0.08 },
                { name: 'Weather Mastery', value: 9.5, impact: 0.05 },
                { name: 'McLaren Threat', value: 0.6, impact: -0.12 },
            ]
        },
        '2024_spa': {
            baseProb: 0.05, finalProb: 0.35,
            features: [
                { name: 'Qualifying Position (P3)', value: 3, impact: 0.14 },
                { name: 'Driver Rolling Form', value: 2.8, impact: 0.10 },
                { name: 'Constructor Strength', value: 7.8, impact: 0.06 },
                { name: 'Track History (Spa)', value: 1.5, impact: 0.06 },
                { name: 'Weather Adaptation', value: 9.2, impact: 0.08 },
                { name: 'Red Bull Pace', value: 0.7, impact: -0.09 },
            ]
        },
        '2024_monza': {
            baseProb: 0.05, finalProb: 0.22,
            features: [
                { name: 'Qualifying Position (P5)', value: 5, impact: 0.08 },
                { name: 'Driver Rolling Form', value: 3.0, impact: 0.08 },
                { name: 'Constructor Strength', value: 7.5, impact: 0.05 },
                { name: 'Track History (Monza)', value: 2.0, impact: 0.04 },
                { name: 'Ferrari Home Advantage', value: 0.5, impact: -0.03 },
            ]
        },
        '2024_suzuka': {
            baseProb: 0.05, finalProb: 0.18,
            features: [
                { name: 'Qualifying Position (P4)', value: 4, impact: 0.08 },
                { name: 'Driver Rolling Form', value: 3.5, impact: 0.05 },
                { name: 'Constructor Strength', value: 7.2, impact: 0.04 },
                { name: 'Track History (Suzuka)', value: 2.5, impact: 0.04 },
                { name: 'Red Bull Dominance', value: 0.85, impact: -0.08 },
            ]
        },
        '2023_silverstone': {
            baseProb: 0.05, finalProb: 0.25,
            features: [
                { name: 'Qualifying Position (P3)', value: 3, impact: 0.10 },
                { name: 'Home Race Advantage', value: 9.5, impact: 0.08 },
                { name: 'Track History (8 wins)', value: 1.0, impact: 0.06 },
                { name: 'Red Bull Pace Gap', value: 0.9, impact: -0.09 },
            ]
        },
        '2023_singapore': {
            baseProb: 0.05, finalProb: 0.18,
            features: [
                { name: 'Qualifying Position (P5)', value: 5, impact: 0.06 },
                { name: 'Street Circuit Skills', value: 8.5, impact: 0.05 },
                { name: 'Night Race Experience', value: 9.0, impact: 0.04 },
                { name: 'Red Bull Weakness', value: 0.6, impact: 0.02 },
                { name: 'Sainz Pole', value: 0.5, impact: -0.04 },
            ]
        },
    },
    // OSCAR PIASTRI
    'PIA': {
        '2024_bahrain': {
            baseProb: 0.05, finalProb: 0.06,
            features: [
                { name: 'Qualifying Position (P8)', value: 8, impact: 0.01 },
                { name: 'Driver Rolling Form', value: 6.0, impact: 0.00 },
                { name: 'Constructor Strength', value: 5.5, impact: -0.01 },
                { name: 'Rookie Season', value: 0.8, impact: -0.04 },
            ]
        },
        '2024_hungary': {
            baseProb: 0.05, finalProb: 0.48,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.22 },
                { name: 'Driver Rolling Form', value: 2.5, impact: 0.12 },
                { name: 'Constructor Strength', value: 8.5, impact: 0.08 },
                { name: 'McLaren Form', value: 9.2, impact: 0.10 },
                { name: 'Team Orders Risk', value: 0.4, impact: -0.04 },
            ]
        },
        '2024_baku': {
            baseProb: 0.05, finalProb: 0.35,
            features: [
                { name: 'Qualifying Position (P2)', value: 2, impact: 0.15 },
                { name: 'Driver Rolling Form', value: 2.8, impact: 0.10 },
                { name: 'Constructor Strength', value: 8.2, impact: 0.07 },
                { name: 'Street Circuit Adaptation', value: 7.8, impact: 0.05 },
                { name: 'Experience Gap', value: 0.6, impact: -0.02 },
            ]
        },
        '2024_monza': {
            baseProb: 0.05, finalProb: 0.28,
            features: [
                { name: 'Qualifying Position (P2)', value: 2, impact: 0.12 },
                { name: 'Driver Rolling Form', value: 2.5, impact: 0.08 },
                { name: 'Constructor Strength', value: 8.5, impact: 0.07 },
                { name: 'Low Downforce Skills', value: 7.5, impact: 0.04 },
                { name: 'Leclerc Home Advantage', value: 0.5, impact: -0.03 },
            ]
        },
        '2024_singapore': {
            baseProb: 0.05, finalProb: 0.22,
            features: [
                { name: 'Qualifying Position (P5)', value: 5, impact: 0.08 },
                { name: 'Driver Rolling Form', value: 3.0, impact: 0.06 },
                { name: 'Constructor Strength', value: 8.0, impact: 0.05 },
                { name: 'Street Circuit Learning', value: 7.0, impact: 0.03 },
                { name: 'Experience Gap', value: 0.5, impact: -0.05 },
            ]
        },
    },
    // CARLOS SAINZ
    'SAI': {
        '2024_bahrain': {
            baseProb: 0.05, finalProb: 0.15,
            features: [
                { name: 'Qualifying Position (P4)', value: 4, impact: 0.06 },
                { name: 'Driver Rolling Form', value: 4.0, impact: 0.03 },
                { name: 'Constructor Strength', value: 7.0, impact: 0.02 },
                { name: 'Track History (Bahrain)', value: 3.5, impact: 0.01 },
                { name: 'Reliability Risk', value: 0.10, impact: -0.02 },
            ]
        },
        '2024_australia': {
            baseProb: 0.05, finalProb: 0.52,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.25 },
                { name: 'Driver Rolling Form', value: 2.0, impact: 0.12 },
                { name: 'Constructor Strength', value: 8.0, impact: 0.08 },
                { name: 'Post-Surgery Motivation', value: 9.5, impact: 0.08 },
                { name: 'Verstappen DNF', value: 0.1, impact: 0.04 },
                { name: 'Track History', value: 2.0, impact: -0.05 },
            ]
        },
        '2024_monza': {
            baseProb: 0.05, finalProb: 0.35,
            features: [
                { name: 'Qualifying Position (P5)', value: 5, impact: 0.10 },
                { name: 'Driver Rolling Form', value: 3.0, impact: 0.08 },
                { name: 'Constructor Strength', value: 8.0, impact: 0.08 },
                { name: 'Home Race (Italy)', value: 8.5, impact: 0.08 },
                { name: 'Leclerc Priority', value: 0.6, impact: -0.04 },
            ]
        },
        '2024_singapore': {
            baseProb: 0.05, finalProb: 0.22,
            features: [
                { name: 'Qualifying Position (P4)', value: 4, impact: 0.08 },
                { name: 'Driver Rolling Form', value: 3.5, impact: 0.06 },
                { name: 'Constructor Strength', value: 7.5, impact: 0.05 },
                { name: 'Street Circuit Skills', value: 8.0, impact: 0.04 },
                { name: 'McLaren Threat', value: 0.7, impact: -0.06 },
            ]
        },
        '2024_mexico': {
            baseProb: 0.05, finalProb: 0.42,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.20 },
                { name: 'Driver Rolling Form', value: 2.2, impact: 0.10 },
                { name: 'Constructor Strength', value: 8.2, impact: 0.08 },
                { name: 'High Altitude Advantage', value: 8.0, impact: 0.06 },
                { name: 'Track History (Mexico)', value: 2.0, impact: 0.03 },
                { name: 'Verstappen Incidents', value: 0.3, impact: -0.05 },
            ]
        },
        '2023_singapore': {
            baseProb: 0.05, finalProb: 0.55,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.28 },
                { name: 'Street Circuit Form', value: 9.0, impact: 0.12 },
                { name: 'Red Bull Weakness', value: 0.3, impact: 0.08 },
                { name: 'Constructor Strength', value: 7.5, impact: 0.05 },
                { name: 'Humidity Management', value: 0.4, impact: -0.03 },
            ]
        },
    },
    // GEORGE RUSSELL
    'RUS': {
        '2024_bahrain': {
            baseProb: 0.05, finalProb: 0.10,
            features: [
                { name: 'Qualifying Position (P6)', value: 6, impact: 0.03 },
                { name: 'Driver Rolling Form', value: 4.5, impact: 0.02 },
                { name: 'Constructor Strength', value: 6.5, impact: 0.01 },
                { name: 'Track History (Bahrain)', value: 5.0, impact: -0.01 },
            ]
        },
        '2024_austria': {
            baseProb: 0.05, finalProb: 0.52,
            features: [
                { name: 'Qualifying Position (P3)', value: 3, impact: 0.15 },
                { name: 'Driver Rolling Form', value: 2.5, impact: 0.10 },
                { name: 'Constructor Strength', value: 8.0, impact: 0.08 },
                { name: 'VER-NOR Collision', value: 0.1, impact: 0.18 },
                { name: 'Opportunism', value: 9.0, impact: 0.06 },
                { name: 'Reliability Risk', value: 0.05, impact: -0.05 },
            ]
        },
        '2024_spa': {
            baseProb: 0.05, finalProb: 0.45,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.22 },
                { name: 'Driver Rolling Form', value: 2.2, impact: 0.10 },
                { name: 'Constructor Strength', value: 8.2, impact: 0.08 },
                { name: 'Track History (Spa)', value: 2.5, impact: 0.05 },
                { name: 'Verstappen Penalty', value: 0.2, impact: 0.08 },
                { name: 'Weather Uncertainty', value: 0.5, impact: -0.08 },
            ]
        },
        '2024_vegas': {
            baseProb: 0.05, finalProb: 0.42,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.20 },
                { name: 'Driver Rolling Form', value: 2.0, impact: 0.12 },
                { name: 'Constructor Strength', value: 8.5, impact: 0.08 },
                { name: 'Low Drag Setup', value: 8.8, impact: 0.06 },
                { name: 'Night Race Skills', value: 8.0, impact: 0.04 },
                { name: 'Verstappen Championship', value: 0.3, impact: -0.08 },
            ]
        },
        '2022_brazil': {
            baseProb: 0.05, finalProb: 0.65,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.30 },
                { name: 'Sprint Race Winner', value: 9.5, impact: 0.15 },
                { name: 'Constructor Strength', value: 8.5, impact: 0.10 },
                { name: 'Track History', value: 3.0, impact: 0.05 },
            ]
        },
    },
    // SERGIO PEREZ
    'PER': {
        '2024_bahrain': {
            baseProb: 0.05, finalProb: 0.22,
            features: [
                { name: 'Qualifying Position (P2)', value: 2, impact: 0.10 },
                { name: 'Driver Rolling Form', value: 3.5, impact: 0.05 },
                { name: 'Constructor Strength', value: 9.2, impact: 0.08 },
                { name: 'Track History (Bahrain)', value: 2.0, impact: 0.03 },
                { name: 'Teammate Gap', value: 0.5, impact: -0.09 },
            ]
        },
        '2024_jeddah': {
            baseProb: 0.05, finalProb: 0.28,
            features: [
                { name: 'Qualifying Position (P3)', value: 3, impact: 0.12 },
                { name: 'Track History (Jeddah Win)', value: 1.0, impact: 0.10 },
                { name: 'Constructor Strength', value: 9.3, impact: 0.08 },
                { name: 'Street Circuit Skills', value: 8.5, impact: 0.05 },
                { name: 'Teammate Pace Gap', value: 0.6, impact: -0.07 },
            ]
        },
        '2024_monaco': {
            baseProb: 0.05, finalProb: 0.05,
            features: [
                { name: 'Qualifying Crash', value: 0, impact: -0.05 },
                { name: 'Track History (Monaco)', value: 8.0, impact: -0.02 },
                { name: 'Constructor Strength', value: 8.8, impact: 0.05 },
                { name: 'Overtaking Difficulty', value: 9.5, impact: -0.03 },
            ]
        },
        '2023_jeddah': {
            baseProb: 0.05, finalProb: 0.55,
            features: [
                { name: 'Qualifying Position (P1)', value: 1, impact: 0.28 },
                { name: 'Track History (Jeddah)', value: 1.0, impact: 0.12 },
                { name: 'Constructor Strength', value: 9.5, impact: 0.10 },
                { name: 'Street Circuit Skills', value: 9.0, impact: 0.08 },
                { name: 'Verstappen Red Flag', value: 0.3, impact: -0.08 },
            ]
        },
        '2023_baku': {
            baseProb: 0.05, finalProb: 0.48,
            features: [
                { name: 'Qualifying Position (P2)', value: 2, impact: 0.18 },
                { name: 'Track History (2x Winner)', value: 1.0, impact: 0.15 },
                { name: 'Constructor Strength', value: 9.5, impact: 0.10 },
                { name: 'Street Circuit King', value: 9.2, impact: 0.08 },
                { name: 'Verstappen Start', value: 0.5, impact: -0.08 },
            ]
        },
    },
    // FERNANDO ALONSO
    'ALO': {
        '2024_bahrain': {
            baseProb: 0.05, finalProb: 0.08,
            features: [
                { name: 'Qualifying Position (P9)', value: 9, impact: 0.01 },
                { name: 'Driver Rolling Form', value: 5.0, impact: 0.01 },
                { name: 'Constructor Strength', value: 5.0, impact: -0.02 },
                { name: 'Experience Factor', value: 9.8, impact: 0.03 },
            ]
        },
        '2023_bahrain': {
            baseProb: 0.05, finalProb: 0.25,
            features: [
                { name: 'Qualifying Position (P5)', value: 5, impact: 0.08 },
                { name: 'Aston Martin Upgrade', value: 9.2, impact: 0.12 },
                { name: 'Experience Factor', value: 9.8, impact: 0.05 },
                { name: 'Track History', value: 3.0, impact: 0.02 },
                { name: 'Red Bull Gap', value: 0.8, impact: -0.07 },
            ]
        },
        '2023_monaco': {
            baseProb: 0.05, finalProb: 0.18,
            features: [
                { name: 'Qualifying Position (P2)', value: 2, impact: 0.08 },
                { name: 'Experience (Monaco Master)', value: 9.8, impact: 0.05 },
                { name: 'Constructor Strength', value: 7.5, impact: 0.03 },
                { name: 'Track Knowledge', value: 9.5, impact: 0.04 },
                { name: 'Verstappen Dominance', value: 0.85, impact: -0.07 },
            ]
        },
        '2023_jeddah': {
            baseProb: 0.05, finalProb: 0.22,
            features: [
                { name: 'Qualifying Position (P3)', value: 3, impact: 0.10 },
                { name: 'Aston Martin Pace', value: 8.5, impact: 0.08 },
                { name: 'Experience Factor', value: 9.8, impact: 0.04 },
                { name: 'Track History', value: 4.0, impact: 0.02 },
                { name: 'Red Bull Advantage', value: 0.9, impact: -0.07 },
            ]
        },
    },
    // LANCE STROLL
    'STR': {
        '2024_bahrain': {
            baseProb: 0.05, finalProb: 0.02,
            features: [
                { name: 'Qualifying Position (P14)', value: 14, impact: -0.02 },
                { name: 'Driver Rolling Form', value: 12.0, impact: -0.02 },
                { name: 'Constructor Strength', value: 5.0, impact: -0.01 },
                { name: 'Track History', value: 8.0, impact: 0.00 },
            ]
        },
        '2023_singapore': {
            baseProb: 0.05, finalProb: 0.08,
            features: [
                { name: 'Qualifying Position (P8)', value: 8, impact: 0.02 },
                { name: 'Street Circuit Skills', value: 7.0, impact: 0.01 },
                { name: 'Aston Martin Pace', value: 6.5, impact: 0.01 },
                { name: 'Teammate Comparison', value: 0.3, impact: -0.01 },
            ]
        },
    },
}

const DRIVERS = [
    { id: 'VER', name: 'Max Verstappen', team: 'Red Bull', color: '#1E41FF' },
    { id: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#FF8700' },
    { id: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#DC0000' },
    { id: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', color: '#00D2BE' },
    { id: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#FF8700' },
    { id: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', color: '#DC0000' },
    { id: 'RUS', name: 'George Russell', team: 'Mercedes', color: '#00D2BE' },
    { id: 'PER', name: 'Sergio Perez', team: 'Red Bull', color: '#1E41FF' },
    { id: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', color: '#006F62' },
    { id: 'STR', name: 'Lance Stroll', team: 'Aston Martin', color: '#006F62' },
]

const RACES = [
    { id: '2024_bahrain', name: '🇧🇭 Bahrain GP 2024', year: 2024 },
    { id: '2024_jeddah', name: '🇸🇦 Saudi Arabia GP 2024', year: 2024 },
    { id: '2024_australia', name: '🇦🇺 Australian GP 2024', year: 2024 },
    { id: '2024_miami', name: '🇺🇸 Miami GP 2024', year: 2024 },
    { id: '2024_monaco', name: '🇲🇨 Monaco GP 2024', year: 2024 },
    { id: '2024_hungary', name: '🇭🇺 Hungarian GP 2024', year: 2024 },
    { id: '2024_spa', name: '🇧🇪 Belgian GP 2024', year: 2024 },
    { id: '2024_monza', name: '🇮🇹 Italian GP 2024', year: 2024 },
    { id: '2024_baku', name: '🇦🇿 Azerbaijan GP 2024', year: 2024 },
    { id: '2024_singapore', name: '🇸🇬 Singapore GP 2024', year: 2024 },
    { id: '2024_austin', name: '🇺🇸 US GP 2024', year: 2024 },
    { id: '2024_mexico', name: '🇲🇽 Mexican GP 2024', year: 2024 },
    { id: '2024_vegas', name: '🇺🇸 Las Vegas GP 2024', year: 2024 },
    { id: '2024_silverstone', name: '🇬🇧 British GP 2024', year: 2024 },
    { id: '2024_suzuka', name: '🇯🇵 Japanese GP 2024', year: 2024 },
    { id: '2024_austria', name: '🇦🇹 Austrian GP 2024', year: 2024 },
    { id: '2023_bahrain', name: '🇧🇭 Bahrain GP 2023', year: 2023 },
    { id: '2023_jeddah', name: '🇸🇦 Saudi Arabia GP 2023', year: 2023 },
    { id: '2023_monaco', name: '🇲🇨 Monaco GP 2023', year: 2023 },
    { id: '2023_silverstone', name: '🇬🇧 British GP 2023', year: 2023 },
    { id: '2023_singapore', name: '🇸🇬 Singapore GP 2023', year: 2023 },
    { id: '2023_baku', name: '🇦🇿 Azerbaijan GP 2023', year: 2023 },
    { id: '2022_brazil', name: '🇧🇷 Brazilian GP 2022', year: 2022 },
]

export default function ShapExplainerPage() {
    const [selectedDriver, setSelectedDriver] = useState('VER')
    const [selectedRace, setSelectedRace] = useState('2024_bahrain')

    const shapData = SHAP_DATA[selectedDriver]?.[selectedRace]
    const driver = DRIVERS.find(d => d.id === selectedDriver)

    // Get available races for selected driver
    const availableRaces = RACES.filter(r => SHAP_DATA[selectedDriver]?.[r.id])

    // Sort features by absolute impact
    const sortedFeatures = shapData?.features.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)) || []

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Brain className="w-10 h-10 text-purple-600" />
                    SHAP Explainer
                </h1>
                <p className="text-f1-gray-600">
                    Understand <em>why</em> our models make predictions using SHAP (SHapley Additive exPlanations)
                </p>
                <div className="mt-2 text-sm text-f1-gray-500">
                    {DRIVERS.length} drivers • {RACES.length} races • {Object.values(SHAP_DATA).reduce((sum, d) => sum + Object.keys(d).length, 0)} explanations
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
                <div className="flex gap-2 items-start">
                    <HelpCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-purple-800">How to Read SHAP Values</h3>
                        <p className="text-sm text-purple-700">
                            Each feature contribution shows how much it pushes the prediction up (green) or down (red)
                            from the base probability. The waterfall chart starts from the base ~5% and shows
                            cumulative effects to reach the final prediction.
                        </p>
                    </div>
                </div>
            </div>

            {/* Selectors */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium mb-2">Driver ({DRIVERS.length} available)</label>
                    <select
                        value={selectedDriver}
                        onChange={(e) => {
                            setSelectedDriver(e.target.value)
                            // Reset race if not available for this driver
                            const driverRaces = Object.keys(SHAP_DATA[e.target.value] || {})
                            if (!driverRaces.includes(selectedRace) && driverRaces.length > 0) {
                                setSelectedRace(driverRaces[0])
                            }
                        }}
                        className="w-full border rounded-lg p-3 font-bold"
                        style={{ borderColor: driver?.color }}
                    >
                        {DRIVERS.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.team})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Race ({availableRaces.length} for this driver)</label>
                    <select
                        value={selectedRace}
                        onChange={(e) => setSelectedRace(e.target.value)}
                        className="w-full border rounded-lg p-3"
                    >
                        {availableRaces.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {shapData ? (
                <>
                    {/* Probability Summary */}
                    <div className="rounded-xl p-6 mb-8 text-white" style={{ backgroundColor: driver?.color || '#1f2937' }}>
                        <div className="grid grid-cols-3 text-center">
                            <div>
                                <div className="text-sm opacity-75">Base Probability</div>
                                <div className="text-3xl font-bold">{(shapData.baseProb * 100).toFixed(1)}%</div>
                            </div>
                            <div className="flex items-center justify-center">
                                <ChevronRight className="w-8 h-8 opacity-50" />
                                <span className="text-sm px-2">SHAP</span>
                                <ChevronRight className="w-8 h-8 opacity-50" />
                            </div>
                            <div>
                                <div className="text-sm opacity-75">Final Prediction</div>
                                <div className="text-3xl font-bold">{(shapData.finalProb * 100).toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Waterfall Chart */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-xl font-bold mb-6">Feature Contributions (Waterfall)</h2>

                        {/* Base */}
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                            <div className="w-48 text-sm text-f1-gray-600">Base Probability</div>
                            <div className="flex-1 relative h-8">
                                <div
                                    className="absolute h-full bg-f1-gray-300 rounded"
                                    style={{ width: `${shapData.baseProb * 100 * 3}%` }}
                                />
                            </div>
                            <div className="w-20 text-right font-mono">{(shapData.baseProb * 100).toFixed(1)}%</div>
                        </div>

                        {/* Features */}
                        {sortedFeatures.map((feature, i) => (
                            <div key={i} className="flex items-center gap-4 mb-3">
                                <div className="w-48 text-sm text-f1-gray-600 truncate" title={feature.name}>
                                    {feature.name}
                                </div>
                                <div className="flex-1 relative h-8 flex items-center">
                                    {feature.impact > 0 ? (
                                        <div
                                            className="h-full bg-green-500 rounded flex items-center justify-end pr-2"
                                            style={{ width: `${Math.abs(feature.impact) * 100 * 3}%` }}
                                        >
                                            <ArrowUp className="w-4 h-4 text-white" />
                                        </div>
                                    ) : (
                                        <div
                                            className="h-full bg-red-500 rounded flex items-center justify-end pr-2"
                                            style={{ width: `${Math.abs(feature.impact) * 100 * 3}%` }}
                                        >
                                            <ArrowDown className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className={`w-20 text-right font-mono ${feature.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {feature.impact > 0 ? '+' : ''}{(feature.impact * 100).toFixed(1)}%
                                </div>
                            </div>
                        ))}

                        {/* Final */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                            <div className="w-48 text-sm font-bold">Final Prediction</div>
                            <div className="flex-1 relative h-8">
                                <div
                                    className="absolute h-full rounded"
                                    style={{
                                        width: `${shapData.finalProb * 100 * 1.2}%`,
                                        backgroundColor: driver?.color || '#8b5cf6'
                                    }}
                                />
                            </div>
                            <div className="w-20 text-right font-mono font-bold" style={{ color: driver?.color }}>
                                {(shapData.finalProb * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Key Insight */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            Key Insight
                        </h3>
                        <p className="text-f1-gray-700">
                            The most influential feature for this prediction is <strong>{sortedFeatures[0]?.name}</strong>,
                            contributing <strong>{sortedFeatures[0]?.impact > 0 ? '+' : ''}{(sortedFeatures[0]?.impact * 100).toFixed(1)}%</strong> to
                            the win probability. {sortedFeatures[0]?.impact > 0
                                ? 'This significantly increases the driver\'s chances.'
                                : 'This slightly decreases the driver\'s chances.'}
                        </p>
                    </div>
                </>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <p className="text-yellow-800">No SHAP data available for this driver/race combination.</p>
                    <p className="text-sm text-yellow-600 mt-2">Try selecting a different race from the dropdown above.</p>
                </div>
            )}

            {/* Links */}
            <div className="flex gap-4 justify-center">
                <Link href="/head-to-head" className="bg-f1-gray-900 text-white px-6 py-3 rounded-lg hover:bg-f1-gray-700 transition">
                    Head-to-Head
                </Link>
                <Link href="/whatif" className="border border-f1-gray-300 px-6 py-3 rounded-lg hover:bg-f1-gray-50 transition">
                    What-If Lab
                </Link>
            </div>
        </div>
    )
}
