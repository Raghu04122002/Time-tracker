'use client'

import { useState } from 'react'
import { Plus, X, Calendar, Clock, FileText } from 'lucide-react'

export default function ManualEntryModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: () => void }) {
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        description: ''
    })
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const startDateTime = new Date(`${formData.date}T${formData.startTime}`)
            const endDateTime = new Date(`${formData.date}T${formData.endTime}`)

            const res = await fetch('/api/time/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    description: formData.description
                })
            })

            if (res.ok) {
                onSave()
                onClose()
            } else {
                const errorData = await res.json()
                alert(`Failed to save entry: ${errorData.error || 'Unknown error'}`)
                console.error('Save failed:', errorData)
            }
        } catch (err) {
            console.error('Error submitting form:', err)
            alert('An error occurred. Please check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
            <div className="card w-full max-w-lg p-8 relative z-10 animate-fade-in shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Manual Time Entry</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 block">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                            <input
                                type="date"
                                required
                                className="input-field pl-10"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Start Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="time"
                                    required
                                    className="input-field pl-10"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1.5 block">End Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="time"
                                    required
                                    className="input-field pl-10"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 block">Work Description</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            <textarea
                                required
                                className="input-field pl-10 min-h-[100px] py-2.5"
                                placeholder="What did you work on?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 btn-outline">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary"
                        >
                            {loading ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
