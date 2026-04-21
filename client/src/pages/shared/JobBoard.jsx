import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/common/DashboardLayout'
import { jobsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const JOB_TYPES = ['All', 'full-time', 'part-time', 'internship', 'contract']

const formatDate = (date) => {
    if (!date) return '—'
    const seconds = date.seconds ?? date._seconds;
    const d = seconds ? new Date(seconds * 1000) : new Date(date)
    return d instanceof Date && !isNaN(d) ? d.toLocaleDateString() : '—'
}

const JobCard = ({ job, canDelete, onDelete, index = 0 }) => (
    <div className="glass-card-interactive p-6 card-shine group animate-slide-up"
         style={{ animationDelay: `${index * 60}ms` }}>
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-500/10 border border-brand-500/20
                               flex items-center justify-center text-xl font-bold text-brand-400
                               shrink-0 group-hover:scale-110 group-hover:rotate-3
                               transition-all duration-500 ease-bounce-in">
                    {job.company?.[0] || 'J'}
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg leading-tight font-display
                                  group-hover:text-brand-300 transition-colors duration-300">{job.title}</h3>
                    <p className="text-brand-400 font-medium">{job.company}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-slate-400">📍 {job.location || 'Remote'}</span>
                        <span className="badge-indigo">{job.type}</span>
                        {job.deadline && <span className="text-xs text-slate-500">⏰ Until {formatDate(job.deadline)}</span>}
                    </div>
                </div>
            </div>
            {canDelete && (
                <button onClick={() => onDelete(job.id)}
                        className="text-rose-400 hover:text-rose-300 text-sm shrink-0
                                   hover:underline transition-all duration-200 font-medium">Delete</button>
            )}
        </div>

        <p className="mt-4 text-sm text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>

        {job.requiredSkills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
                {job.requiredSkills.map((s) => (
                    <span key={s} className="badge bg-surface-elevated/60 text-slate-300
                                            border border-surface-border/40">{s}</span>
                ))}
            </div>
        )}

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-surface-border/30">
            <span className="text-xs text-slate-500">Posted {formatDate(job.createdAt)}</span>
            {job.applicationLink
                ? <a href={job.applicationLink} target="_blank" rel="noopener noreferrer"
                     className="btn-primary text-sm px-5 py-2">Apply Now →</a>
                : <span className="text-xs text-slate-500">No link provided</span>
            }
        </div>
    </div>
)

const JobBoard = () => {
    const { user } = useAuth()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [type, setType] = useState('All')
    const [search, setSearch] = useState('')

    const load = async (t = type) => {
        setLoading(true)
        try {
            const params = { limit: 50 }
            if (t !== 'All') params.type = t
            const res = await jobsAPI.list(params)
            setJobs(res.data || [])
        } catch { toast.error('Could not load jobs') }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const handleDelete = async (id) => {
        if (!confirm('Delete this job posting?')) return
        try { await jobsAPI.remove(id); setJobs((p) => p.filter((j) => j.id !== id)); toast.success('Job deleted') }
        catch { toast.error('Failed') }
    }

    const filtered = jobs.filter((j) =>
        j.title?.toLowerCase().includes(search.toLowerCase()) ||
        j.company?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between animate-slide-up">
                    <h1 className="section-heading">Job Board</h1>
                    {(user?.role === 'alumni' || user?.role === 'admin') && (
                        <Link to="/jobs/post" className="btn-primary">+ Post Job</Link>
                    )}
                </div>

                <div className="glass-card p-5 flex flex-col sm:flex-row gap-3 animate-slide-up"
                     style={{ animationDelay: '60ms' }}>
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        className="input flex-1" placeholder="Search jobs or companies…" />
                    <div className="flex gap-2 flex-wrap">
                        {JOB_TYPES.map((t) => (
                            <button key={t} onClick={() => { setType(t); load(t) }}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize
                                           transition-all duration-300 ease-bounce-in
                                           ${type === t
                                               ? 'bg-gradient-brand text-white shadow-glow-brand'
                                               : 'bg-surface-elevated/50 text-slate-300 border border-surface-border/40 hover:bg-surface-card hover:text-white'
                                           }`}>{t}</button>
                        ))}
                    </div>
                </div>

                <p className="text-sm text-slate-400">{filtered.length} positions available</p>

                {loading
                    ? <div className="flex justify-center py-20"><Loader size="lg" /></div>
                    : filtered.length === 0
                        ? <div className="text-center py-24 glass-card">
                            <p className="text-5xl mb-4">🔍</p>
                            <p className="text-white font-semibold font-display text-lg">No jobs found</p>
                            <p className="text-slate-400 text-sm mt-2">Try adjusting your search or filters.</p>
                          </div>
                        : <div className="space-y-4">
                            {filtered.map((job, i) => (
                                <JobCard key={job.id} job={job} index={i}
                                    canDelete={(user?.role === 'admin') || (user?.role === 'alumni' && job.postedBy === user?.uid)}
                                    onDelete={handleDelete} />
                            ))}
                        </div>
                }
            </div>
        </DashboardLayout>
    )
}

export default JobBoard
