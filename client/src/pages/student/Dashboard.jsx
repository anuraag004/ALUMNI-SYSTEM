// src/pages/student/Dashboard.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/common/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { jobsAPI, eventsAPI, mentorAPI } from '../../services/api'
import { Link } from 'react-router-dom'
import Loader from '../../components/common/Loader'

const StatCard = ({ label, value, icon, color }) => (
    <div className="stat-card">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
    </div>
)

const StudentDashboard = () => {
    const { user } = useAuth()
    const [jobs, setJobs] = useState([])
    const [events, setEvents] = useState([])
    const [recs, setRecs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.allSettled([
            jobsAPI.list({ limit: 4 }),
            eventsAPI.list({ limit: 3 }),
            mentorAPI.recommendations(),
        ]).then(([j, e, r]) => {
            if (j.status === 'fulfilled') setJobs(j.value.data || [])
            if (e.status === 'fulfilled') setEvents(e.value.data || [])
            if (r.status === 'fulfilled') setRecs(r.value.data?.slice(0, 3) || [])
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return <DashboardLayout><Loader fullScreen /></DashboardLayout>

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Welcome */}
                <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Welcome back, <span className="gradient-text">{user?.displayName}</span> 👋</h1>
                        <p className="text-slate-400 mt-1">Here's what's happening in your network today.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/resume" className="btn-primary">Analyze Resume</Link>
                        <Link to="/mentor" className="btn-ghost">Find Mentor</Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Open Jobs" value={jobs.length} icon="💼" color="bg-brand-500/10" />
                    <StatCard label="Upcoming Events" value={events.length} icon="📅" color="bg-emerald-500/10" />
                    <StatCard label="Mentor Matches" value={recs.length} icon="🎯" color="bg-purple-500/10" />
                    <StatCard label="Network Size" value="5,200+" icon="🌐" color="bg-amber-500/10" />
                </div>

                {/* Main grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Latest Jobs */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-white text-lg">Latest Jobs</h2>
                            <Link to="/jobs" className="text-brand-400 text-sm hover:underline">View all →</Link>
                        </div>
                        <div className="space-y-3">
                            {jobs.length === 0 && <p className="text-slate-500 text-sm">No jobs yet.</p>}
                            {jobs.map((j) => (
                                <div key={j.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-border/30 transition-colors">
                                    <div className="h-9 w-9 rounded-lg bg-brand-500/10 flex items-center justify-center text-sm font-bold text-brand-400 shrink-0">
                                        {j.company?.[0] || 'J'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-white text-sm truncate">{j.title}</p>
                                        <p className="text-xs text-slate-400">{j.company} · {j.location}</p>
                                    </div>
                                    <span className="badge-green shrink-0">{j.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-white text-lg">Upcoming Events</h2>
                            <Link to="/events" className="text-brand-400 text-sm hover:underline">View all →</Link>
                        </div>
                        <div className="space-y-3">
                            {events.length === 0 && <p className="text-slate-500 text-sm">No upcoming events.</p>}
                            {events.map((ev) => (
                                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-border/30 transition-colors">
                                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-lg shrink-0">📅</div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-white text-sm truncate">{ev.title}</p>
                                        <p className="text-xs text-slate-400">{new Date(ev.date?.seconds * 1000 || ev.date).toLocaleDateString()}</p>
                                    </div>
                                    {ev.isVirtual && <span className="badge-indigo shrink-0">Virtual</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Mentor Matches */}
                {recs.length > 0 && (
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-white text-lg">🎯 Top Mentor Matches</h2>
                            <Link to="/mentor" className="text-brand-400 text-sm hover:underline">View all →</Link>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {recs.map(({ mentor, matchScore }) => (
                                <div key={mentor.uid} className="p-4 rounded-xl border border-surface-border hover:border-brand-500/40 transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center font-bold text-white text-sm">
                                            {mentor.displayName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-sm">{mentor.displayName}</p>
                                            <p className="text-xs text-slate-400">{mentor.currentRole}</p>
                                        </div>
                                    </div>
                                    <div className="progress-bar mb-1">
                                        <div className="progress-bar-fill" style={{ width: `${matchScore}%` }} />
                                    </div>
                                    <p className="text-xs text-brand-400 font-semibold">{matchScore}% match</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default StudentDashboard
