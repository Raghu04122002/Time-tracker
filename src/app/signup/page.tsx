'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Timer, User, Mail, Lock, ShieldCheck } from 'lucide-react'

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE'
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            router.push('/login')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#0f172a]">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 mb-4">
                        <Timer className="w-8 h-8 text-blue-500" />
                    </div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">Join TimeTracker</h1>
                    <p className="text-slate-400">Streamline your work hours today</p>
                </div>

                <div className="glass p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    className="input-field pl-10"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Role</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'EMPLOYEE' })}
                                    className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${formData.role === 'EMPLOYEE'
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                            : 'border-slate-700 hover:border-slate-600 text-slate-400'
                                        }`}
                                >
                                    <User className="w-4 h-4" />
                                    Employee
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'MANAGER' })}
                                    className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${formData.role === 'MANAGER'
                                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                            : 'border-slate-700 hover:border-slate-600 text-slate-400'
                                        }`}
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Manager
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary h-12 flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
