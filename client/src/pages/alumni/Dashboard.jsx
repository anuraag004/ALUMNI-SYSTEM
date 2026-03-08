// src/pages/alumni/Dashboard.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/common/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { jobsAPI, mentorAPI } from '../../services/api'
import { Link } from 'react-router-dom'

const AlumniDashboard = () => {
    const { user } = useAuth()
    const [myJobs, setMyJobs] = useState([])
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.allSettled([
            jobsAPI.list({ limit: 5 }),
            mentorAPI.getRequests(),
        ]).then(([j, r]) => {
            if (j.status === 'fulfilled') setMyJobs((j.value.data || []).filter(job => job.postedBy === user?.uid))
            if (r.status === 'fulfilled') setRequests(r.value.data?.slice(0, 5) || [])
        }).finally(() => setLoading(false))
    }, [user])

    const pendingCount = requests.filter((r) => r.status === 'pending').length

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Welcome */}
                <div className="glass-card p-6 bg-gradient-to-r from-brand-500/10 to-purple-500/10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Welcome, <span className="gradient-text">{user?.displayName}</span> 🎓</h1>
                            <p className="text-slate-400 mt-1">{user?.currentRole || 'Alumni'} {user?.currentCompany ? `@ ${user.currentCompany}` : ''}</p>
                            {!user?.isVerified && (
                                <p className="mt-2 text-amber-400 text-sm bg-amber-500/10 rounded-lg px-3 py-1.5 inline-block border border-amber-500/20">
                                    ⏳ Your account is pending admin verification
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Link to="/jobs/post" className="btn-primary">Post a Job</Link>
                            <Link to="/mentor/requests" className="btn-ghost">Mentor Requests {pendingCount > 0 && <span className="ml-1 badge-amber">{pendingCount}</span>}</Link>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Jobs Posted', value: myJobs.length, icon: '💼', color: 'bg-brand-500/10' },
                        { label: 'Mentor Requests', value: requests.length, icon: '🤝', color: 'bg-purple-500/10' },
                        { label: 'Pending Requests', value: pendingCount, icon: '⏳', color: 'bg-amber-500/10' },
                        { label: 'Profile Completeness', value: `${user?.skills?.length > 0 ? '80' : '40'}%`, icon: '📊', color: 'bg-emerald-500/10' },
                    ].map((s) => (
                        <div key={s.label} className="stat-card">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-2xl ${s.color}`}>{s.icon}</div>
                            <p className="text-3xl font-bold text-white mt-2">{s.value}</p>
                            <p className="text-sm text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* My Job Postings */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-white text-lg">My Job Postings</h2>
                            <Link to="/jobs/post" className="text-brand-400 text-sm hover:underline">Post new →</Link>
                        </div>
                        {myJobs.length === 0
                            ? <div className="text-center py-8"><p className="text-slate-500 text-sm">No jobs posted yet.</p><Link to="/jobs/post" className="btn-primary mt-4 inline-flex">Post First Job</Link></div>
                            : <div className="space-y-3">
                                {myJobs.map((j) => (
                                    <div key={j.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-border/30 transition-colors">
                                        <div className="h-9 w-9 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">{j.company?.[0]}</div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-white text-sm">{j.title}</p>
                                            <p className="text-xs text-slate-400">{j.company} · {j.type}</p>
                                        </div>
                                        <span className={j.isActive ? 'badge-green' : 'badge-rose'}>{j.isActive ? 'Active' : 'Closed'}</span>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>

                    {/* Incoming Mentor Requests */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-white text-lg">Mentor Requests</h2>
                            <Link to="/mentor/requests" className="text-brand-400 text-sm hover:underline">View all →</Link>
                        </div>
                        {requests.length === 0
                            ? <p className="text-slate-500 text-sm text-center py-8">No mentor requests yet.</p>
                            : <div className="space-y-3">
                                {requests.map((r) => (
                                    <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-border/30 transition-colors">
                                        <div className="h-9 w-9 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">S</div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-slate-200 truncate">{r.message}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{new Date(r.createdAt?.seconds * 1000 || r.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={r.status === 'pending' ? 'badge-amber' : r.status === 'accepted' ? 'badge-green' : 'badge-rose'}>{r.status}</span>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                </div>

                {/* Profile completion tip */}
                {(!user?.skills?.length || !user?.bio) && (
                    <div className="glass-card p-6 border border-brand-500/20 flex items-center gap-4">
                        <div className="text-3xl">💡</div>
                        <div className="flex-1">
                            <p className="font-semibold text-white">Complete your profile to attract more mentorship requests</p>
                            <p className="text-sm text-slate-400 mt-1">Add your skills, bio, and current role to get matched with students.</p>
                        </div>
                        <Link to={`/users/${user?.uid}`} className="btn-primary shrink-0">Update Profile</Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default AlumniDashboard
