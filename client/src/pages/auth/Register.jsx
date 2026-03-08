// src/pages/auth/Register.jsx
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'MBA', 'BBA', 'Other']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i)

const Register = () => {
    const { register, loginWithGoogle } = useAuth()
    const navigate = useNavigate()
    const [params] = useSearchParams()

    const [form, setForm] = useState({
        displayName: '', email: '', password: '', confirmPassword: '',
        role: params.get('role') || 'student',
        department: '', graduationYear: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

    const redirectAfter = (user) => {
        if (user.role === 'alumni') return navigate('/alumni-dashboard')
        navigate('/student')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (form.password !== form.confirmPassword) return setError('Passwords do not match')
        if (form.password.length < 6) return setError('Password must be at least 6 characters')
        setLoading(true)
        try {
            const user = await register(form)
            redirectAfter(user)
        } catch (err) {
            setError(err.message || 'Registration failed.')
        } finally { setLoading(false) }
    }

    const handleGoogle = async () => {
        setError('')
        setLoading(true)
        try {
            const user = await loginWithGoogle(form.role)
            redirectAfter(user)
        } catch (err) { setError(err.message || 'Google sign-in failed.') }
        finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg animate-slide-up">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl mb-4">
                        <span className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white">AC</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Create your account</h1>
                    <p className="text-slate-400 mt-2">Join the AlumniConnect network</p>
                </div>

                <div className="glass-card p-8">
                    {error && (
                        <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-400">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Role Toggle */}
                    <div className="flex rounded-xl border border-surface-border overflow-hidden mb-6">
                        {['student', 'alumni'].map((r) => (
                            <button key={r} type="button" onClick={() => set('role', r)}
                                className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-all ${form.role === r ? 'bg-gradient-brand text-white' : 'text-slate-400 hover:text-white'
                                    }`}>{r}</button>
                        ))}
                    </div>

                    <button onClick={handleGoogle} disabled={loading} className="btn-ghost w-full mb-5">
                        <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Continue with Google as {form.role}
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <hr className="flex-1 border-surface-border" />
                        <span className="text-xs text-slate-500">or email</span>
                        <hr className="flex-1 border-surface-border" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                                <input type="text" required value={form.displayName}
                                    onChange={(e) => set('displayName', e.target.value)} className="input" placeholder="Jane Doe" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                                <input type="email" required value={form.email}
                                    onChange={(e) => set('email', e.target.value)} className="input" placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                <input type="password" required value={form.password}
                                    onChange={(e) => set('password', e.target.value)} className="input" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm</label>
                                <input type="password" required value={form.confirmPassword}
                                    onChange={(e) => set('confirmPassword', e.target.value)} className="input" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Department</label>
                                <select value={form.department} onChange={(e) => set('department', e.target.value)} className="input">
                                    <option value="">Select…</option>
                                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Grad Year</label>
                                <select value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)} className="input">
                                    <option value="">Select…</option>
                                    {YEARS.map((y) => <option key={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        {form.role === 'alumni' && (
                            <p className="text-xs text-amber-400 bg-amber-500/10 rounded-xl px-3 py-2 border border-amber-500/20">
                                ⚠️ Alumni accounts require admin verification before full access is granted.
                            </p>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
