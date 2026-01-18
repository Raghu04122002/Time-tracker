'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import LogTable from '@/components/LogTable'
import { Filter, Download, Calendar } from 'lucide-react'

export default function TimesheetPage() {
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<any>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchData(viewMode)
    }, [viewMode])

    const fetchData = async (mode: 'week' | 'month') => {
        setLoading(true)
        try {
            const now = new Date()
            let startDate = new Date()
            let endDate = new Date()

            if (mode === 'week') {
                const day = now.getDay()
                const diff = (day + 6) % 7 // Monday is 0 for calculation
                startDate.setDate(now.getDate() - diff)
                startDate.setHours(0, 0, 0, 0)

                endDate.setDate(startDate.getDate() + 6)
                endDate.setHours(23, 59, 59, 999)
            } else {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                endDate.setHours(23, 59, 59, 999)
            }

            const query = new URLSearchParams({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            })

            const res = await fetch(`/api/time?${query}`)
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) {
                    setLogs(data)
                } else {
                    setLogs([])
                }
            } else {
                console.error('Failed to fetch logs')
            }

            // Fetch session for Navbar
            const sessionRes = await fetch('/api/auth/session')
            if (sessionRes.ok) {
                const sessionData = await sessionRes.json()
                setSession(sessionData.user)
            }

            setLoading(false)
        } catch (err) {
            console.error(err)
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this log entry?')) return

        try {
            const res = await fetch(`/api/time/${id}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                setLogs(logs.filter((log: any) => log.id !== id))
            } else {
                console.error('Failed to delete log')
            }
        } catch (err) {
            console.error(err)
        }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <Navbar user={session} />

            <main className="max-w-7xl mx-auto p-8 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Your Timesheet</h1>
                        <p className="text-slate-400">View and manage all your past work entries.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'week'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}>
                                Week
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'month'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}>
                                Month
                            </button>
                        </div>
                    </div>
                </div>

                <LogTable logs={logs} onDelete={handleDelete} />
            </main>
        </div>
    )
}
