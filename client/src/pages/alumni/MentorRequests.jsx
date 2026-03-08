// src/pages/alumni/MentorRequests.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/common/DashboardLayout'
import { mentorAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const MentorRequests = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [acting, setActing] = useState(null)

    useEffect(() => {
        mentorAPI.getRequests()
            .then((res) => setRequests(res.data || []))
            .catch(() => toast.error('Could not load requests'))
            .finally(() => setLoading(false))
    }, [])

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
                <div className="flex items-center justify-between">
                    <h1 className="section-heading">Mentor Requests</h1>
                    {pending.length > 0 && (
                        <span className="badge-amber">{pending.length} pending</span>
                    )}
                </div>

                {loading
                    ? <div className="flex justify-center py-20"><Loader size="lg" /></div>
                    : requests.length === 0
                        ? (
                            <div className="glass-card p-12 text-center">
                                <p className="text-4xl mb-3">🤝</p>
                                <p className="text-white font-semibold">No mentor requests yet</p>
                                <p className="text-slate-400 text-sm mt-1">Make sure your profile shows you're available to mentor students.</p>
                            </div>
                        )
                        : (
                            <>
                                {pending.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Pending ({pending.length})</h2>
                                        {pending.map((req) => (
                                            <div key={req.id} className="glass-card p-6 border border-amber-500/20 animate-fade-in">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">S</div>
                                                        <div>
                                                            <p className="font-semibold text-white">{req.studentId}</p>
                                                            <p className="text-xs text-slate-400">{new Date(req.createdAt?.seconds * 1000 || req.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className="badge-amber">Pending</span>
                                                </div>
                                                <p className="text-sm text-slate-300 bg-surface-border/30 rounded-xl p-3 mb-4 leading-relaxed">{req.message}</p>
                                                {req.topics?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                                        <span className="text-xs text-slate-500">Topics:</span>
                                                        {req.topics.map((t) => <span key={t} className="badge-indigo">{t}</span>)}
                                                    </div>
                                                )}
                                                <div className="flex gap-3">
                                                    <button disabled={acting === req.id} onClick={() => respond(req.id, 'accepted')}
                                                        className="btn-primary flex-1">{acting === req.id ? '…' : '✓ Accept'}</button>
                                                    <button disabled={acting === req.id} onClick={() => respond(req.id, 'rejected')}
                                                        className="flex-1 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-semibold">
                                                        ✕ Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {responded.length > 0 && (
                                    <div className="space-y-3">
                                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Past Requests ({responded.length})</h2>
                                        {responded.map((req) => (
                                            <div key={req.id} className="glass-card p-5 flex items-start gap-4 opacity-70">
                                                <div className="h-9 w-9 rounded-full bg-surface-border flex items-center justify-center font-bold text-slate-400 text-sm">S</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-slate-300 truncate">{req.message}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{new Date(req.createdAt?.seconds * 1000 || req.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={req.status === 'accepted' ? 'badge-green' : 'badge-rose'}>{req.status}</span>
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
