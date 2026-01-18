'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Timer, Mail, Lock } from 'lucide-react'

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Login failed')
            }

            // Successful login - for internal tool we'll just redirect to dashboard
            // The cookie is set by the API
            if (data.user?.role === 'MANAGER') {
                router.push('/manager')
            } else {
                router.push('/dashboard')
            }
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
                    <h1 className="text-4xl font-bold gradient-text mb-2">Welcome Back</h1>
                    <p className="text-slate-400">Sign in to continue tracking</p>
                </div>

                <div className="glass p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-sm font-medium text-slate-300 block">Password</label>
                            </div>
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

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary h-12 flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
