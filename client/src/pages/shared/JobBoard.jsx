// src/pages/shared/JobBoard.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/common/DashboardLayout'
import { jobsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const JOB_TYPES = ['All', 'full-time', 'part-time', 'internship', 'contract']

const JobCard = ({ job, canDelete, onDelete }) => (
    <div className="glass-card p-6 hover:border-brand-500/30 transition-all duration-300 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-xl font-bold text-brand-400 shrink-0 border border-brand-500/20">
                    {job.company?.[0] || 'J'}
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{job.title}</h3>
                    <p className="text-brand-400 font-medium">{job.company}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-400">📍 {job.location || 'Remote'}</span>
                        <span className="badge-indigo">{job.type}</span>
                        {job.deadline && <span className="text-xs text-slate-500">⏰ Until {new Date(job.deadline?.seconds * 1000 || job.deadline).toLocaleDateString()}</span>}
                    </div>
                </div>
            </div>
            {canDelete && (
                <button onClick={() => onDelete(job.id)} className="text-rose-400 hover:text-rose-300 text-sm shrink-0">Delete</button>
            )}
        </div>

        <p className="mt-3 text-sm text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>

        {job.requiredSkills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
                {job.requiredSkills.map((s) => <span key={s} className="badge bg-surface-border text-slate-300">{s}</span>)}
            </div>
        )}

        <div className="flex items-center justify-between mt-5">
            <span className="text-xs text-slate-500">Posted {new Date(job.createdAt?.seconds * 1000 || job.createdAt).toLocaleDateString()}</span>
            {job.applicationLink
                ? <a href={job.applicationLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm px-4 py-2">Apply Now →</a>
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

    useEffect(() => { load() }, []) // eslint-disable-line

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
                <div className="flex items-center justify-between">
                    <h1 className="section-heading">Job Board</h1>
                    {(user?.role === 'alumni' || user?.role === 'admin') && (
                        <Link to="/jobs/post" className="btn-primary">+ Post Job</Link>
                    )}
                </div>

                {/* Filters */}
                <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        className="input flex-1" placeholder="Search jobs or companies…" />
                    <div className="flex gap-2 flex-wrap">
                        {JOB_TYPES.map((t) => (
                            <button key={t} onClick={() => { setType(t); load(t) }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${type === t ? 'bg-brand-500 text-white' : 'bg-surface-border text-slate-300 hover:bg-surface-card'
                                    }`}>{t}</button>
                        ))}
                    </div>
                </div>

                <p className="text-sm text-slate-400">{filtered.length} positions available</p>

                {loading
                    ? <div className="flex justify-center py-20"><Loader size="lg" /></div>
                    : filtered.length === 0
                        ? <div className="text-center py-20 text-slate-500">No jobs found matching your search.</div>
                        : <div className="space-y-4">
                            {filtered.map((job) => (
                                <JobCard key={job.id} job={job}
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
