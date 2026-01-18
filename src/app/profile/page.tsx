'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { User, Mail, Save, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchSession()
    }, [])

    const fetchSession = async () => {
        try {
            const res = await fetch('/api/auth/session')
            const data = await res.json()

            if (!res.ok) {
                router.push('/login')
                return
            }

            setUser(data.user)
            setName(data.user.name || '')
            setLoading(false)
        } catch (err) {
            console.error(err)
            router.push('/login')
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })

            if (res.ok) {
                setMessage('Profile updated successfully!')
                fetchSession()
            } else {
                const data = await res.json()
                setMessage(`Error: ${data.error}`)
            }
        } catch (err) {
            setMessage('Failed to update profile.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return null

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <Navbar user={user} />

            <main className="max-w-4xl mx-auto p-8 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
                    <p className="text-slate-400">Manage your account information and preferences.</p>
                </div>

                <div className="glass p-8 rounded-3xl shadow-2xl space-y-8">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="w-24 h-24 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-3xl font-bold border-2 border-blue-500/30">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 space-y-1">
                                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                                <p className="text-slate-400">{user?.email}</p>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                    {user?.role}
                                </span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-700/50" />

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        className="input-field pl-10"
                                        placeholder="Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                                    <input
                                        type="email"
                                        disabled
                                        className="input-field pl-10 opacity-50 cursor-not-allowed"
                                        value={user?.email || ''}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Email cannot be changed for internal security.
                                </p>
                            </div>
                        </div>

                        {message && (
                            <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                                {message}
                            </p>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving || name === user?.name}
                                className="btn-primary h-12 px-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
