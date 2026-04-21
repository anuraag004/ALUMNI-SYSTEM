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
            <div className="page-container">
                {/* Welcome */}
                <div className="gradient-border animate-slide-up">
                    <div className="glass-card p-7 bg-gradient-to-r from-brand-500/5 to-purple-500/5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white font-display">
                                    Welcome, <span className="gradient-text">{user?.displayName}</span> 🎓
                                </h1>
                                <p className="text-slate-400 mt-1">
                                    {user?.currentRole || 'Alumni'} {user?.currentCompany ? `@ ${user.currentCompany}` : ''}
                                </p>
                                {!user?.isVerified && (
                                    <p className="mt-3 text-amber-400 text-sm bg-amber-500/10 rounded-xl px-4 py-2
                                                 inline-flex items-center gap-2 border border-amber-500/20
                                                 animate-glow-pulse">
                                        ⏳ Your account is pending admin verification
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Link to="/jobs/post" className="btn-primary">Post a Job</Link>
                                <Link to="/mentor/requests" className="btn-ghost">
                                    Mentor Requests
                                    {pendingCount > 0 && <span className="ml-1 badge-amber">{pendingCount}</span>}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                    {[
                        { label: 'Jobs Posted', value: myJobs.length, icon: '💼', color: 'bg-brand-500/10' },
                        { label: 'Mentor Requests', value: requests.length, icon: '🤝', color: 'bg-purple-500/10' },
                        { label: 'Pending Requests', value: pendingCount, icon: '⏳', color: 'bg-amber-500/10' },
                        { label: 'Profile Completeness', value: `${user?.skills?.length > 0 ? '80' : '40'}%`, icon: '📊', color: 'bg-emerald-500/10' },
                    ].map((s) => (
                        <div key={s.label} className="stat-card group">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl
                                           ${s.color} border border-white/5
                                           group-hover:scale-110 group-hover:rotate-3
                                           transition-all duration-500 ease-bounce-in`}>{s.icon}</div>
                            <p className="text-3xl font-bold text-white mt-2 font-display
                                        group-hover:text-brand-300 transition-colors duration-300">{s.value}</p>
                            <p className="text-sm text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* My Job Postings */}
                    <div className="glass-card-interactive p-6 card-shine">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-white text-lg font-display">My Job Postings</h2>
                            <Link to="/jobs/post" className="text-brand-400 text-sm hover:text-brand-300
                                                            font-medium transition-colors duration-200">Post new →</Link>
                        </div>
                        {myJobs.length === 0
                            ? <div className="text-center py-10">
                                <p className="text-4xl mb-3">💼</p>
                                <p className="text-slate-500 text-sm mb-4">No jobs posted yet.</p>
                                <Link to="/jobs/post" className="btn-primary inline-flex">Post First Job</Link>
                              </div>
                            : <div className="space-y-2">
                                {myJobs.map((j) => (
                                    <div key={j.id} className="flex items-start gap-3 p-3 rounded-xl
                                                              hover:bg-surface-elevated/50 transition-all duration-200
                                                              group/item">
                                        <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20
                                                       text-brand-400 flex items-center justify-center font-bold
                                                       text-sm shrink-0 group-hover/item:scale-105
                                                       transition-transform duration-200">{j.company?.[0]}</div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-white text-sm">{j.title}</p>
                                            <p className="text-xs text-slate-400">{j.company} · {j.type}</p>
                                        </div>
                                        <span className={j.isActive ? 'badge-green' : 'badge-rose'}>
                                            {j.isActive ? 'Active' : 'Closed'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>

                    {/* Incoming Mentor Requests */}
                    <div className="glass-card-interactive p-6 card-shine">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-white text-lg font-display">Mentor Requests</h2>
                            <Link to="/mentor/requests" className="text-brand-400 text-sm hover:text-brand-300
                                                                   font-medium transition-colors duration-200">View all →</Link>
                        </div>
                        {requests.length === 0
                            ? <div className="text-center py-10">
                                <p className="text-4xl mb-3">🤝</p>
                                <p className="text-slate-500 text-sm">No mentor requests yet.</p>
                              </div>
                            : <div className="space-y-2">
                                {requests.map((r) => (
                                    <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl
                                                              hover:bg-surface-elevated/50 transition-all duration-200
                                                              group/item">
                                        <div className="h-10 w-10 rounded-full bg-purple-500/10 border border-purple-500/20
                                                       text-purple-400 flex items-center justify-center
                                                       font-bold text-sm shrink-0 group-hover/item:scale-105
                                                       transition-transform duration-200">S</div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-slate-200 truncate">{r.message}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {new Date(r.createdAt?.seconds * 1000 || r.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={r.status === 'pending' ? 'badge-amber'
                                                        : r.status === 'accepted' ? 'badge-green' : 'badge-rose'}>
                                            {r.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                </div>

                {/* Profile completion tip */}
                {(!user?.skills?.length || !user?.bio) && (
                    <div className="glass-card p-7 border border-brand-500/15 flex items-center gap-5
                                   animate-slide-up hover:border-brand-500/30 transition-all duration-300">
                        <div className="text-3xl h-14 w-14 rounded-2xl bg-brand-500/10 border border-brand-500/20
                                       flex items-center justify-center shrink-0">💡</div>
                        <div className="flex-1">
                            <p className="font-semibold text-white font-display">
                                Complete your profile to attract more mentorship requests
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Add your skills, bio, and current role to get matched with students.
                            </p>
                        </div>
                        <Link to={`/users/${user?.uid}`} className="btn-primary shrink-0">Update Profile</Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default AlumniDashboard
