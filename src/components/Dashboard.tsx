'use client'

import { useState, useEffect } from 'react'
import { Play, Square, AlertCircle, Clock, Calendar, CheckCircle2, Plus, Filter, X } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import ManualEntryModal from '@/components/ManualEntryModal'

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [activeEntry, setActiveEntry] = useState<any>(null)
    const [timer, setTimer] = useState(0)
    const [loading, setLoading] = useState(true)
    const [clocking, setClocking] = useState(false)

    // Modals
    const [showClockOutModal, setShowClockOutModal] = useState(false)
    const [showManualModal, setShowManualModal] = useState(false)
    const [description, setDescription] = useState('')

    const [weeklyTotal, setWeeklyTotal] = useState('0.0')
    const [dailyTotal, setDailyTotal] = useState('0.0')
    const [monthlyTotal, setMonthlyTotal] = useState('0.0')

    // Filter State
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isFiltered, setIsFiltered] = useState(false)

    // Filtered Stats
    const [filteredTotal, setFilteredTotal] = useState('0.0')
    const [filteredAvg, setFilteredAvg] = useState('0.0')
    const [filteredDays, setFilteredDays] = useState(0)

    useEffect(() => {
        fetchData()
    }, [])

    const calculateStats = (entries: any[]) => {
        const now = new Date()
        const todayStart = new Date(now)
        todayStart.setHours(0, 0, 0, 0)

        // Calculate start of week (Monday)
        const dayOfWeek = now.getDay() // 0-6 (Sun-Sat)
        const daysSinceMonday = (dayOfWeek + 6) % 7
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - daysSinceMonday)
        weekStart.setHours(0, 0, 0, 0)

        // Calculate start of month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        monthStart.setHours(0, 0, 0, 0)

        let weeklyMs = 0
        let dailyMs = 0
        let monthlyMs = 0

        entries.forEach(entry => {
            const start = new Date(entry.startTime).getTime()
            const end = entry.endTime ? new Date(entry.endTime).getTime() : now.getTime()
            const duration = end - start

            if (start >= weekStart.getTime()) {
                weeklyMs += duration
            }

            if (start >= todayStart.getTime()) {
                dailyMs += duration
            }

            if (start >= monthStart.getTime()) {
                monthlyMs += duration
            }
        })

        setWeeklyTotal((weeklyMs / (1000 * 60 * 60)).toFixed(1))
        setDailyTotal((dailyMs / (1000 * 60 * 60)).toFixed(1))
        setMonthlyTotal((monthlyMs / (1000 * 60 * 60)).toFixed(1))
    }

    useEffect(() => {
        let interval: any
        if (activeEntry) {
            interval = setInterval(() => {
                const start = new Date(activeEntry.startTime).getTime()
                const now = new Date().getTime()
                setTimer(now - start)
            }, 1000)
        } else {
            setTimer(0)
        }
        return () => clearInterval(interval)
    }, [activeEntry])

    const fetchData = async (customStart?: string, customEnd?: string) => {
        try {
            // Get user session info
            const sessionRes = await fetch('/api/auth/session')
            const sessionData = await sessionRes.json()
            setUser(sessionData.user)

            // Prepare query
            const query = new URLSearchParams()
            if (customStart && customEnd) {
                query.append('startDate', new Date(customStart).toISOString())
                const eDate = new Date(customEnd)
                eDate.setHours(23, 59, 59, 999)
                query.append('endDate', eDate.toISOString())
            }

            // Get active entries
            const res = await fetch(`/api/time?${query.toString()}`)
            const entries = await res.json()

            // If filtering, calculate total for this range
            if (customStart && customEnd) {
                let totalMs = 0
                const uniqueDays = new Set()

                entries.forEach((entry: any) => {
                    const start = new Date(entry.startTime).getTime()
                    const end = entry.endTime ? new Date(entry.endTime).getTime() : new Date().getTime()
                    totalMs += (end - start)

                    const dayStr = new Date(entry.startTime).toDateString()
                    uniqueDays.add(dayStr)
                })

                const totalHours = totalMs / (1000 * 60 * 60)
                setFilteredTotal(totalHours.toFixed(1))
                setFilteredDays(uniqueDays.size)
                setFilteredAvg(uniqueDays.size > 0 ? (totalHours / uniqueDays.size).toFixed(1) : '0.0')
                setIsFiltered(true)
            } else {
                // Normal Load: Update everything
                const active = entries.find((e: any) => !e.endTime)
                setActiveEntry(active)
                calculateStats(entries)
                setIsFiltered(false)
            }

            setLoading(false)
        } catch (err) {
            console.error(err)
            setLoading(false)
        }
    }

    const handleApplyFilter = () => {
        if (!startDate || !endDate) return
        setLoading(true)
        fetchData(startDate, endDate)
    }

    const clearFilter = () => {
        setStartDate('')
        setEndDate('')
        setIsFiltered(false)
        setLoading(true)
        fetchData()
    }

    const handleClockIn = async () => {
        setClocking(true)
        try {
            const res = await fetch('/api/time', { method: 'POST' })
            if (res.ok) {
                const entry = await res.json()
                setActiveEntry(entry)
                fetchData()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setClocking(false)
        }
    }

    const handleClockOut = async () => {
        if (!description.trim()) return
        setClocking(true)
        try {
            const res = await fetch('/api/time/clock-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            })
            if (res.ok) {
                setActiveEntry(null)
                setShowClockOutModal(false)
                setDescription('')
                fetchData()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setClocking(false)
        }
    }

    if (loading) return null

    return (
        <div className="flex-1 p-8 space-y-8 animate-fade-in max-w-7xl mx-auto w-full">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, {user?.name || 'User'}</h1>
                <p className="text-slate-400">Track your work hours and manage your productivity.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Timer Card */}
                    <div className="card p-12 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500" />
                        <div className={`text-7xl font-mono font-bold mb-8 transition-colors ${activeEntry ? 'text-blue-400' : 'text-slate-600'}`}>
                            {formatDuration(timer)}
                        </div>
                        {activeEntry ? (
                            <button
                                onClick={() => setShowClockOutModal(true)}
                                disabled={clocking}
                                className="btn-primary bg-red-600 hover:bg-red-700 h-16 px-10 rounded-2xl flex items-center gap-3 text-lg"
                            >
                                <Square className="w-6 h-6 fill-current" />
                                Clock Out
                            </button>
                        ) : (
                            <button
                                onClick={handleClockIn}
                                disabled={clocking}
                                className="btn-primary h-16 px-10 rounded-2xl flex items-center gap-3 text-lg"
                            >
                                <Play className="w-6 h-6 fill-current" />
                                Clock In
                            </button>
                        )}
                        {activeEntry && (
                            <div className="mt-8 flex items-center gap-2 text-emerald-400 animate-pulse">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Session in progress...</span>
                            </div>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <div className="flex items-end justify-between gap-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            {isFiltered ? 'Filtered Stats' : 'Overview'}
                        </h3>
                        <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50">
                            <input
                                type="date"
                                className="bg-transparent text-slate-300 text-sm px-2 py-1 outline-none border-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-slate-600 text-sm">to</span>
                            <input
                                type="date"
                                className="bg-transparent text-slate-300 text-sm px-2 py-1 outline-none border-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <div className="w-px h-4 bg-slate-700 mx-1" />
                            <button
                                onClick={handleApplyFilter}
                                disabled={!startDate || !endDate}
                                className="p-1 rounded hover:bg-blue-500/20 text-blue-400 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                            {isFiltered && (
                                <button
                                    onClick={clearFilter}
                                    className="p-1 rounded hover:bg-red-500/20 text-red-400"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid - Dynamic Content */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {isFiltered ? (
                            <>
                                <div className="card p-6 flex items-center gap-4 border-blue-500/30 bg-blue-500/5">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Total Hours</p>
                                        <p className="text-xl font-bold text-white">{filteredTotal} h</p>
                                    </div>
                                </div>
                                <div className="card p-6 flex items-center gap-4 border-blue-500/30 bg-blue-500/5">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Daily Avg</p>
                                        <p className="text-xl font-bold text-white">{filteredAvg} h</p>
                                    </div>
                                </div>
                                <div className="card p-6 flex items-center gap-4 border-blue-500/30 bg-blue-500/5">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Days Worked</p>
                                        <p className="text-xl font-bold text-white">{filteredDays} days</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="card p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Weekly</p>
                                        <p className="text-xl font-bold text-white">{weeklyTotal} h</p>
                                    </div>
                                </div>
                                <div className="card p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Daily</p>
                                        <p className="text-xl font-bold text-white">{dailyTotal} h</p>
                                    </div>
                                </div>
                                <div className="card p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Monthly</p>
                                        <p className="text-xl font-bold text-white">{monthlyTotal} h</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Sidebar / Info */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-400" />
                            Next Task
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {user?.currentTask || 'No task assigned yet. Please check back later or update your objectives.'}
                        </p>
                    </div>

                    <div className="card p-6 bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20">
                        <h3 className="text-lg font-bold text-white mb-4">Manual Entry</h3>
                        <p className="text-xs text-slate-400 mb-4">Missed a punch? Add your time manually.</p>
                        <button
                            onClick={() => setShowManualModal(true)}
                            className="w-full btn-outline border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                            Add Manual Log
                        </button>
                    </div>
                </div>
            </div>

            <ManualEntryModal
                isOpen={showManualModal}
                onClose={() => setShowManualModal(false)}
                onSave={fetchData}
            />

            {/* Clock Out Modal */}
            {showClockOutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowClockOutModal(false)} />
                    <div className="card w-full max-w-lg p-8 relative z-10 animate-fade-in shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4">Complete Your Session</h2>
                        <p className="text-slate-400 mb-6">What did you work on during this period? Description is mandatory.</p>

                        <textarea
                            className="input-field min-h-[150px] mb-6 resize-none py-3"
                            placeholder="Detailed work description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowClockOutModal(false)}
                                className="flex-1 btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClockOut}
                                disabled={!description.trim() || clocking}
                                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {clocking ? 'Saving...' : 'Finish Session'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
