// src/pages/auth/Login.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
    const { login, loginWithGoogle } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || null

    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const redirect = (user) => {
        if (from) return navigate(from, { replace: true })
        if (user.role === 'admin') return navigate('/admin')
        if (user.role === 'alumni') return navigate('/alumni-dashboard')
        navigate('/student')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const user = await login(form)
            redirect(user)
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.')
        } finally { setLoading(false) }
    }

    const handleGoogle = async () => {
        setError('')
        setLoading(true)
        try {
            const user = await loginWithGoogle()
            redirect(user)
        } catch (err) {
            setError(err.message || 'Google sign-in failed.')
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4">
            {/* BG orbs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl mb-6">
                        <span className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white">AC</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                    <p className="text-slate-400 mt-2">Sign in to your account</p>
                </div>

                <div className="glass-card p-8">
                    {error && (
                        <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-400">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Google button */}
                    <button onClick={handleGoogle} disabled={loading}
                        className="btn-ghost w-full mb-5 border-surface-border">
                        <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <hr className="flex-1 border-surface-border" />
                        <span className="text-xs text-slate-500">or email</span>
                        <hr className="flex-1 border-surface-border" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                            <input type="email" required value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="input" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                            <input type="password" required value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="input" placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
