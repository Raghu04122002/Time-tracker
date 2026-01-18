'use client'

import { formatDate, formatTime, formatDuration } from '@/lib/utils'
import { Calendar, Clock, FileText, ChevronRight, Trash2 } from 'lucide-react'

export default function LogTable({ logs, onDelete }: { logs: any[], onDelete?: (id: string) => void }) {
    if (!Array.isArray(logs) || logs.length === 0) {
        return (
            <div className="card p-12 text-center text-slate-500">
                No logs found for the selected period.
            </div>
        )
    }

    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-700/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Entry/Exit</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Work Description</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {logs.map((log) => {
                            const start = new Date(log.startTime).getTime()
                            const end = log.endTime ? new Date(log.endTime).getTime() : null
                            const duration = end ? end - start : 0

                            return (
                                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-200">
                                            <Calendar className="w-4 h-4 text-blue-400" />
                                            {formatDate(log.startTime)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                                {formatTime(log.startTime)}
                                            </div>
                                            {log.endTime && (
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                    {formatTime(log.endTime)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {log.endTime ? formatDuration(duration) : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-md">
                                        <div className="flex items-start gap-2">
                                            <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                            <p className="text-sm text-slate-400 line-clamp-2 italic">
                                                {log.description || 'No description provided'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.isManual ? (
                                            <span className="text-[10px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                Manual
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded bg-slate-700/30 text-slate-500">
                                                System
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {onDelete && (
                                            <button
                                                type="button"
                                                onClick={() => onDelete(log.id)}
                                                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                                title="Delete Log"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
