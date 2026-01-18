'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Timer, LogOut, User, BarChart3, Clock, ChevronDown } from 'lucide-react'

export default function Navbar({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-700/50">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Timer className="w-6 h-6 text-white" />
                </div>
                <Link href="/dashboard" className="text-xl font-bold gradient-text">TimeTracker</Link>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 mr-4">
                    {user?.role !== 'MANAGER' && (
                        <>
                            <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link href="/timesheet" className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5">
                                <BarChart3 className="w-4 h-4" />
                                Logs
                            </Link>
                        </>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-700/50" />

                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800/50 transition-all text-slate-200 border border-transparent hover:border-slate-700/50"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs border border-blue-500/20">
                            {user?.name?.charAt(0) || <User className="w-4 h-4 text-blue-400" />}
                        </div>
                        <span className="text-sm font-medium hidden md:block">{user?.name || 'User'}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                            <div className="absolute right-0 mt-3 w-64 glass border border-slate-700/50 rounded-2xl shadow-2xl py-2 z-20 animate-fade-in overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-700/50 mb-1">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Signed in as</p>
                                    <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                                </div>

                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-blue-600/10 hover:text-blue-400 transition-all font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User className="w-4 h-4" />
                                    Account Settings
                                </Link>

                                {user?.role === 'MANAGER' && (
                                    <Link
                                        href="/manager"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-emerald-600/10 hover:text-emerald-400 transition-all font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        Manager Dashboard
                                    </Link>
                                )}

                                <div className="h-px bg-slate-700/50 my-1" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-all text-left font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
