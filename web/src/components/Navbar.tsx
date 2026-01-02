'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Flag } from 'lucide-react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/race-explorer', label: 'Race Explorer' },
        { href: '/compare', label: 'Compare Models' },
        { href: '/whatif', label: 'What-If Lab' },
        { href: '/2026', label: '2026 Regs' },
        { href: '/backtest', label: 'Backtest' },
        { href: '/docs', label: 'Docs' },
    ]

    return (
        <nav className="bg-f1-black text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
                        <Flag className="w-6 h-6 text-f1-red" />
                        <span>F1 Insights</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="hover:text-f1-red transition"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden pb-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block py-2 hover:text-f1-red transition"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}
