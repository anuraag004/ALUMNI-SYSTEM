// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/common/DashboardLayout'
import { adminAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

const AdminDashboard = () => {
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('overview')

    useEffect(() => {
        Promise.allSettled([adminAPI.stats(), adminAPI.users({ limit: 20 })]).then(([s, u]) => {
            if (s.status === 'fulfilled') setStats(s.value.data)
            if (u.status === 'fulfilled') setUsers(u.value.data || [])
        }).finally(() => setLoading(false))
    }, [])

    const handleVerify = async (uid) => {
        try {
            await adminAPI.verify(uid)
            setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, isVerified: true } : u))
            toast.success('User verified ✅')
        } catch { toast.error('Failed to verify') }
    }

    const handleDelete = async (uid) => {
        if (!confirm('Delete this user permanently?')) return
        try {
            await adminAPI.deleteUser(uid)
            setUsers((prev) => prev.filter((u) => u.uid !== uid))
            toast.success('User deleted')
        } catch { toast.error('Failed to delete') }
    }

    if (loading) return <DashboardLayout><Loader fullScreen /></DashboardLayout>

    const barData = [
        { name: 'Users', value: stats?.totalUsers || 0 },
        { name: 'Alumni', value: stats?.totalAlumni || 0 },
        { name: 'Students', value: stats?.totalStudents || 0 },
        { name: 'Active Jobs', value: stats?.activeJobs || 0 },
        { name: 'Events', value: stats?.totalEvents || 0 },
    ]

    const pieData = [
        { name: 'Students', value: stats?.totalStudents || 0 },
        { name: 'Alumni', value: stats?.totalAlumni || 0 },
    ]

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers, icon: '👥', color: 'bg-brand-500/10' },
        { label: 'Alumni', value: stats?.totalAlumni, icon: '🎓', color: 'bg-purple-500/10' },
        { label: 'Active Jobs', value: stats?.activeJobs, icon: '💼', color: 'bg-emerald-500/10' },
        { label: 'Events Hosted', value: stats?.totalEvents, icon: '📅', color: 'bg-amber-500/10' },
        { label: 'Resume Analyses', value: stats?.resumeAnalysesCompleted, icon: '📄', color: 'bg-cyan-500/10' },
        { label: 'Pending Requests', value: stats?.pendingMentorRequests, icon: '⏳', color: 'bg-rose-500/10' },
    ]

    return (
        <DashboardLayout>
            <div className="page-container">
                <div className="flex items-center justify-between animate-slide-up">
                    <h1 className="section-heading">Admin Dashboard</h1>
                    <span className="badge-amber">Admin</span>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
                    {statCards.map((s) => (
                        <div key={s.label} className="stat-card text-center group">
                            <span className={`h-12 w-12 rounded-2xl flex items-center justify-center
                                            text-xl mx-auto ${s.color} border border-white/5
                                            group-hover:scale-110 group-hover:rotate-3
                                            transition-all duration-500 ease-bounce-in`}>{s.icon}</span>
                            <p className="text-2xl font-bold text-white mt-2 font-display
                                        group-hover:text-brand-300 transition-colors duration-300">
                                {s.value ?? '—'}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-surface-elevated/40 rounded-xl p-1 border border-surface-border/30 w-fit">
                    {['overview', 'users'].map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-5 py-2.5 text-sm font-semibold capitalize rounded-lg
                                       transition-all duration-300 ease-bounce-in
                                       ${tab === t
                                           ? 'bg-gradient-brand text-white shadow-glow-brand'
                                           : 'text-slate-400 hover:text-white hover:bg-surface-card'
                                       }`}>{t}</button>
                    ))}
                </div>

                {tab === 'overview' && (
                    <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
                        <div className="glass-card-interactive p-6">
                            <h2 className="font-bold text-white mb-5 font-display">Platform Overview</h2>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip contentStyle={{
                                        background: '#111827', border: '1px solid #1e293b',
                                        borderRadius: 12, color: '#f1f5f9',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
                                    }} />
                                    <Bar dataKey="value" fill="url(#grad)" radius={[8, 8, 0, 0]} />
                                    <defs>
                                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#818cf8" />
                                            <stop offset="100%" stopColor="#6366f1" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="glass-card-interactive p-6 flex flex-col items-center">
                            <h2 className="font-bold text-white mb-5 self-start font-display">User Distribution</h2>
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                                         paddingAngle={4} dataKey="value">
                                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{
                                        background: '#111827', border: '1px solid #1e293b',
                                        borderRadius: 12, color: '#f1f5f9',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
                                    }} />
                                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {tab === 'users' && (
                    <div className="glass-card overflow-hidden animate-fade-in">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-surface-elevated/40 border-b border-surface-border/30">
                                        {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                                            <th key={h} className="text-left px-5 py-3.5 text-slate-400
                                                                  font-semibold text-xs uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border/30">
                                    {users.map((u) => (
                                        <tr key={u.uid} className="hover:bg-surface-elevated/30
                                                                   transition-colors duration-200 group">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-brand
                                                                   flex items-center justify-center text-xs
                                                                   font-bold text-white uppercase
                                                                   group-hover:scale-105 transition-transform duration-200">
                                                        {u.displayName?.[0]}
                                                    </div>
                                                    <span className="font-medium text-white">{u.displayName}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-400">{u.email}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={u.role === 'admin' ? 'badge-amber'
                                                               : u.role === 'alumni' ? 'badge-indigo' : 'badge-green'}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={u.isVerified ? 'badge-green' : 'badge-amber'}>
                                                    {u.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {!u.isVerified && (
                                                        <button onClick={() => handleVerify(u.uid)}
                                                            className="text-xs text-emerald-400 hover:text-emerald-300
                                                                       font-semibold hover:underline transition-all duration-200">
                                                            Verify
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(u.uid)}
                                                        className="text-xs text-rose-400 hover:text-rose-300
                                                                   font-semibold hover:underline transition-all duration-200">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default AdminDashboard
