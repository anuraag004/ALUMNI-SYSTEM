// src/pages/student/MentorSearch.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/common/DashboardLayout'
import { mentorAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const MentorCard = ({ mentor, matchScore, onRequest }) => (
    <div className="glass-card p-6 hover:border-brand-500/40 transition-all duration-300 animate-fade-in">
        <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-xl font-bold text-white uppercase shrink-0">
                {mentor.displayName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-white">{mentor.displayName}</h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-slow" />
                        <span className="text-emerald-400 text-xs font-semibold">{matchScore}% match</span>
                    </div>
                </div>
                <p className="text-brand-400 font-medium text-sm">{mentor.currentRole}</p>
                {mentor.currentCompany && <p className="text-slate-400 text-sm">@ {mentor.currentCompany}</p>}
                <p className="text-xs text-slate-500 mt-0.5">{mentor.department}</p>
            </div>
        </div>

        {/* Match score bar */}
        <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>AI Compatibility Score</span>
                <span className="text-brand-400 font-semibold">{matchScore}%</span>
            </div>
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${matchScore}%` }} />
            </div>
        </div>

        {/* Skills */}
        {mentor.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
                {mentor.skills.slice(0, 5).map((s) => <span key={s} className="badge bg-surface-border text-slate-300">{s}</span>)}
            </div>
        )}

        {mentor.bio && <p className="text-xs text-slate-400 mt-3 line-clamp-2">{mentor.bio}</p>}

        <div className="flex gap-3 mt-5">
            <button onClick={() => onRequest(mentor)} className="btn-primary flex-1 text-sm">🎯 Request Mentorship</button>
            {mentor.linkedIn && (
                <a href={mentor.linkedIn} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm px-4">LinkedIn ↗</a>
            )}
        </div>
    </div>
)

const RequestModal = ({ mentor, onClose, onSubmit }) => {
    const [msg, setMsg] = useState('')
    const [topics, setTop] = useState('')
    const [loading, setL] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (msg.length < 10) return toast.error('Message must be at least 10 characters')
        setL(true)
        await onSubmit({ mentorId: mentor.uid, message: msg, topics: topics.split(',').map(s => s.trim()).filter(Boolean) })
        setL(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="glass-card p-8 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="font-bold text-white text-lg mb-1">Request Mentorship</h2>
                <p className="text-slate-400 text-sm mb-6">Sending request to <span className="text-brand-400">{mentor.displayName}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Message *</label>
                        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} required
                            className="input resize-none" placeholder="Introduce yourself and explain what you're looking for…" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Topics (comma-separated)</label>
                        <input value={topics} onChange={(e) => setTop(e.target.value)} className="input" placeholder="Career advice, Interview prep, React…" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Sending…' : 'Send Request'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const MentorSearch = () => {
    const [recs, setRecs] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        mentorAPI.recommendations()
            .then((res) => setRecs(res.data || []))
            .catch(() => toast.error('Could not load recommendations'))
            .finally(() => setLoading(false))
    }, [])

    const handleRequest = async (data) => {
        try {
            await mentorAPI.sendRequest(data)
            toast.success('Mentor request sent! 🎉')
        } catch (e) { toast.error(e.message || 'Failed to send request') }
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="section-heading">🎯 AI Mentor Matching</h1>
                    <p className="text-slate-400 mt-1">These alumni are ranked by how closely their background matches your profile using cosine similarity.</p>
                </div>

                {loading
                    ? <div className="flex justify-center py-20"><Loader size="lg" /></div>
                    : recs.length === 0
                        ? (
                            <div className="text-center py-24 glass-card">
                                <p className="text-5xl mb-4">🔍</p>
                                <p className="text-white font-semibold text-lg">No mentor matches yet</p>
                                <p className="text-slate-400 text-sm mt-2">Complete your profile with skills and interests for better recommendations.</p>
                            </div>
                        )
                        : (
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {recs.map(({ mentor, matchScore }) => (
                                    <MentorCard key={mentor.uid} mentor={mentor} matchScore={matchScore} onRequest={setSelected} />
                                ))}
                            </div>
                        )
                }
            </div>

            {selected && (
                <RequestModal mentor={selected} onClose={() => setSelected(null)} onSubmit={handleRequest} />
            )}
        </DashboardLayout>
    )
}

export default MentorSearch
