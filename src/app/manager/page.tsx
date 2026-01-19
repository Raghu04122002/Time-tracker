'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import LogTable from '@/components/LogTable'
import { Download, Users, TrendingUp, Calendar, FileSpreadsheet, Trash2, Clock } from 'lucide-react'
import { getCDTStartOfCurrentWeek, getCDTStartOfMonth } from '@/lib/utils'

import Papa from 'papaparse'

export default function ManagerDashboard() {
    const [logs, setLogs] = useState<any[]>([])
    const [employees, setEmployees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<any>(null)
    const [employeeTasks, setEmployeeTasks] = useState<Record<string, string>>({})
    const [mounted, setMounted] = useState(false)

    const [weeklyHours, setWeeklyHours] = useState('0.00')
    const [monthlyHours, setMonthlyHours] = useState('0.00')
    const [totalHours, setTotalHours] = useState('0.00')

    useEffect(() => {
        setMounted(true)
        fetchData()
    }, [])

    useEffect(() => {
        if (logs.length > 0) {
            calculateStats()
        }
    }, [logs])


    const calculateStats = () => {
        const weekStart = getCDTStartOfCurrentWeek()
        const monthStart = getCDTStartOfMonth()

        let weeklyMs = 0
        let monthlyMs = 0
        let totalMs = 0

        logs.forEach(log => {
            const start = new Date(log.startTime).getTime()
            const end = log.endTime ? new Date(log.endTime).getTime() : new Date().getTime()
            const duration = end - start

            totalMs += duration

            if (start >= weekStart.getTime()) {
                weeklyMs += duration
            }

            if (start >= monthStart.getTime()) {
                monthlyMs += duration
            }
        })

        setWeeklyHours((weeklyMs / (1000 * 60 * 60)).toFixed(2))
        setMonthlyHours((monthlyMs / (1000 * 60 * 60)).toFixed(2))
        setTotalHours((totalMs / (1000 * 60 * 60)).toFixed(2))
    }

    const fetchData = async () => {
        try {
            const sessionRes = await fetch('/api/auth/session')
            if (sessionRes.ok) {
                const sessionData = await sessionRes.json()
                setSession(sessionData.user)
            }

            const logsRes = await fetch('/api/manager/entries', { cache: 'no-store' })
            if (logsRes.ok) {
                const logsData = await logsRes.json()
                if (Array.isArray(logsData)) setLogs(logsData)
            }

            const empRes = await fetch(`/api/manager/employees?t=${Date.now()}`, { cache: 'no-store' })
            if (empRes.ok) {
                const empData = await empRes.json()
                console.log('MANAGER_DASHBOARD_EMPLOYEES:', empData)
                if (Array.isArray(empData)) setEmployees(empData)
            } else {
                console.error('MANAGER_DASHBOARD_EMPLOYEES_ERROR:', await empRes.text())
            }

            setLoading(false)
        } catch (err) {
            console.error(err)
            setLoading(false)
        }
    }

    const handleSetTask = async (userId: string) => {
        const task = employeeTasks[userId]
        if (!task) return

        try {
            const res = await fetch('/api/manager/assign-task', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, task })
            })
            if (res.ok) {
                setEmployeeTasks(prev => ({ ...prev, [userId]: '' }))
                fetchData()
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDeleteTask = async (userId: string) => {
        console.log('DELETE_CLICKED: Starting delete for', userId)

        // Optimistic update: Clear UI immediately
        setEmployees(prev => prev.map(emp =>
            emp.id === userId ? { ...emp, currentTask: null } : emp
        ))

        try {
            const res = await fetch('/api/manager/assign-task', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, task: '' })
            })

            if (res.ok) {
                console.log('Task deleted successfully for', userId)
                setEmployeeTasks(prev => ({ ...prev, [userId]: '' }))
                // Force fetch with timestamp to prevent caching
                await fetchData()
            } else {
                console.error('Failed to delete task', await res.text())
                // Revert on failure (optional, but good practice)
                fetchData()
            }
        } catch (err) {
            console.error('Delete task error:', err)
            fetchData()
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

    const exportCSV = () => {
        // ... (keep same)
        const csvData = logs.map((log: any) => ({
            Employee: log.user.name,
            Date: new Date(log.startTime).toLocaleDateString(),
            'Clock In': new Date(log.startTime).toLocaleTimeString(),
            'Clock Out': log.endTime ? new Date(log.endTime).toLocaleTimeString() : 'Active',
            'Total Hours': log.endTime
                ? ((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / (1000 * 60 * 60)).toFixed(2)
                : '0.00',
            Description: log.description || '',
            Type: log.isManual ? 'Manual' : 'System'
        }))

        const csv = Papa.unparse(csvData)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'timesheet_export.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (!mounted || loading) return null

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <Navbar user={session} />

            <main className="max-w-7xl mx-auto p-8 animate-fade-in space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Manager Dashboard</h1>
                        <p className="text-slate-400">Monitor team activity and export logs.</p>
                    </div>

                    <button
                        onClick={exportCSV}
                        className="btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Employees</p>
                            <p className="text-xl font-bold text-white">{employees.length} Active</p>
                        </div>
                    </div>
                    <div className="card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Weekly (Mon-Sun)</p>
                            <p className="text-xl font-bold text-white">{weeklyHours} h</p>
                        </div>
                    </div>
                    <div className="card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Monthly Hours</p>
                            <p className="text-xl font-bold text-white">{monthlyHours} h</p>
                        </div>
                    </div>
                    <div className="card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Hours</p>
                            <p className="text-xl font-bold text-white">{totalHours} h</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Team Logs & Tasks</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Calendar className="w-4 h-4" />
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Quick Task Assignment */}
                    <div className="card p-6 border-blue-500/20 bg-blue-500/5">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Assign Current Tasks</h3>
                        <div className="space-y-4">
                            {employees.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4 italic">No employees found.</p>
                            )}
                            {employees.map((employee: any) => (
                                <div key={employee.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 transition-all hover:border-blue-500/30">
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm border border-blue-500/20">
                                            {employee.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{employee.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-slate-500">{employee.email}</p>
                                                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                    {employee.totalHours || '0.00'} h
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full md:max-w-md space-y-2">
                                        {/* Current Task Display */}
                                        <div className={`p-3 rounded-lg border ${employee.currentTask
                                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                                            : 'bg-slate-800/50 border-slate-700/50 text-slate-500 italic'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${employee.currentTask ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                                                <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                                                    {employee.currentTask ? 'Current Assignment' : 'No Active Task'}
                                                </span>
                                            </div>
                                            <div className="font-medium">
                                                {employee.currentTask || 'Idle'}
                                            </div>
                                        </div>

                                        {/* Input for New Task */}
                                        <div className="relative group flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter new task..."
                                                className="input-field py-1.5 text-sm flex-1"
                                                value={employeeTasks[employee.id] || ''}
                                                onChange={(e) => setEmployeeTasks(prev => ({ ...prev, [employee.id]: e.target.value }))}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSetTask(employee.id)}
                                            />
                                            <button
                                                onClick={() => handleSetTask(employee.id)}
                                                disabled={!employeeTasks[employee.id]?.trim()}
                                                className="btn-primary py-1.5 px-4 text-sm whitespace-nowrap disabled:opacity-50 h-9"
                                            >
                                                Assign
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-start md:self-center mt-2 md:mt-0">
                                        {employee.currentTask && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTask(employee.id)}
                                                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors h-9 w-9 flex items-center justify-center border border-slate-700/50"
                                                title="Clear Task"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <LogTable logs={logs} onDelete={handleDelete} />
                </div>
            </main>
        </div>
    )
}
