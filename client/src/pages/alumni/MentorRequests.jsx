// src/pages/alumni/MentorRequests.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/common/DashboardLayout'
import { mentorAPI, usersAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const MentorRequests = () => {
    const [requests, setRequests] = useState([])
    const [students, setStudents] = useState({})
    const [loading, setLoading] = useState(true)
    const [acting, setActing] = useState(null)

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await mentorAPI.getRequests()
                const reqs = res.data || []
                setRequests(reqs)

                // Fetch student profiles for each unique studentId
                const uniqueIds = [...new Set(reqs.map((r) => r.studentId))]
                const profiles = {}
                await Promise.all(
                    uniqueIds.map(async (uid) => {
                        try {
                            const userRes = await usersAPI.getUser(uid)
                            profiles[uid] = userRes.data || { displayName: uid }
                        } catch {
                            profiles[uid] = { displayName: uid }
                        }
                    })
                )
                setStudents(profiles)
            } catch {
                toast.error('Could not load requests')
            } finally {
                setLoading(false)
            }
        }
        fetchRequests()
    }, [])

    const getStudentName = (studentId) => students[studentId]?.displayName || studentId
    const getStudentInitial = (studentId) => {
        const name = students[studentId]?.displayName
        return name ? name[0].toUpperCase() : 'S'
    }
    const getStudentDept = (studentId) => students[studentId]?.department || ''

    const respond = async (id, status) => {
        setActing(id)
        try {
            await mentorAPI.respond(id, { status })
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
            toast.success(`Request ${status}`)
        } catch (e) { toast.error(e.message || 'Failed') }
        finally { setActing(null) }
    }

    const pending = requests.filter((r) => r.status === 'pending')
    const responded = requests.filter((r) => r.status !== 'pending')

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center justify-between animate-slide-up">
                    <h1 className="section-heading">Mentor Requests</h1>
                    {pending.length > 0 && (
                        <span className="badge-amber animate-pulse-slow">{pending.length} pending</span>
                    )}
                </div>

                {loading
                    ? <div className="flex justify-center py-20"><Loader size="lg" /></div>
                    : requests.length === 0
                        ? (
                            <div className="glass-card p-14 text-center animate-slide-up">
                                <div className="text-5xl mb-4 animate-float inline-block">🤝</div>
                                <p className="text-white font-bold text-lg font-display">No mentor requests yet</p>
                                <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                                    Make sure your profile shows you're available to mentor students.
                                </p>
                            </div>
                        )
                        : (
                            <>
                                {/* Pending Requests */}
                                {pending.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest
                                                      flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-slow" />
                                            Pending ({pending.length})
                                        </h2>
                                        <div className="stagger-children space-y-4">
                                            {pending.map((req) => (
                                                <div key={req.id}
                                                     className="glass-card p-6 border border-amber-500/15
                                                               hover:border-amber-500/30 transition-all duration-300
                                                               hover:-translate-y-0.5 hover:shadow-card-hover">
                                                    <div className="flex items-start justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-11 w-11 rounded-full bg-purple-500/15
                                                                           border border-purple-500/25 text-purple-400
                                                                           flex items-center justify-center font-bold
                                                                           text-sm">{getStudentInitial(req.studentId)}</div>
                                                            <div>
                                                                <p className="font-semibold text-white">{getStudentName(req.studentId)}</p>
                                                                {getStudentDept(req.studentId) && (
                                                                    <p className="text-xs text-brand-400">{getStudentDept(req.studentId)}</p>
                                                                )}
                                                                <p className="text-xs text-slate-400">
                                                                    {new Date(req.createdAt?.seconds * 1000 || req.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="badge-amber">Pending</span>
                                                    </div>

                                                    <div className="text-sm text-slate-300 bg-surface-elevated/40
                                                                   rounded-xl p-4 mb-4 leading-relaxed
                                                                   border border-surface-border/20">
                                                        {req.message}
                                                    </div>

                                                    {req.topics?.length > 0 && (
                                                        <div className="flex flex-wrap items-center gap-1.5 mb-5">
                                                            <span className="text-xs text-slate-500 font-medium">Topics:</span>
                                                            {req.topics.map((t) => (
                                                                <span key={t} className="badge-indigo">{t}</span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex gap-3">
                                                        <button disabled={acting === req.id}
                                                                onClick={() => respond(req.id, 'accepted')}
                                                                className="btn-primary flex-1">
                                                            {acting === req.id ? (
                                                                <span className="flex items-center gap-2">
                                                                    <span className="h-4 w-4 border-2 border-white/30
                                                                                   border-t-white rounded-full animate-spin" />
                                                                </span>
                                                            ) : '✓ Accept'}
                                                        </button>
                                                        <button disabled={acting === req.id}
                                                                onClick={() => respond(req.id, 'rejected')}
                                                                className="btn-danger flex-1">
                                                            ✕ Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Past Requests */}
                                {responded.length > 0 && (
                                    <div className="space-y-3">
                                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Past Requests ({responded.length})
                                        </h2>
                                        {responded.map((req) => (
                                            <div key={req.id}
                                                 className="glass-card p-5 flex items-start gap-4
                                                           opacity-60 hover:opacity-80
                                                           transition-all duration-300">
                                                <div className="h-10 w-10 rounded-full bg-surface-elevated
                                                               border border-surface-border/40 flex items-center
                                                               justify-center font-bold text-slate-400 text-sm">{getStudentInitial(req.studentId)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white">{getStudentName(req.studentId)}</p>
                                                    <p className="text-sm text-slate-300 truncate">{req.message}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {new Date(req.createdAt?.seconds * 1000 || req.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={req.status === 'accepted' ? 'badge-green' : 'badge-rose'}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )
                }
            </div>
        </DashboardLayout>
    )
}

export default MentorRequests
