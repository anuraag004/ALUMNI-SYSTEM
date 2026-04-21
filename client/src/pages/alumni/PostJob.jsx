// src/pages/alumni/PostJob.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/common/DashboardLayout'
import { jobsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract']

const PostJob = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        title: '', company: '', description: '', location: 'Remote',
        type: 'full-time', applicationLink: '', deadline: '',
        requiredSkills: '',
    })
    const [loading, setLoading] = useState(false)

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await jobsAPI.create({
                ...form,
                requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
                deadline: form.deadline || undefined,
            })
            toast.success('Job posted successfully! 🎉')
            navigate('/jobs')
        } catch (e) { toast.error(e.message || 'Failed to post job') }
        finally { setLoading(false) }
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="animate-slide-up">
                    <h1 className="section-heading">Post a Job</h1>
                    <p className="text-slate-400 mt-2">Share an opportunity with students in the network.</p>
                </div>

                <div className="glass-card p-8 shadow-card-elevated animate-slide-up"
                     style={{ animationDelay: '60ms' }}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Job details group */}
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="h-5 w-5 rounded-md bg-brand-500/10 border border-brand-500/20
                                               flex items-center justify-center text-[10px]">💼</span>
                                Job Details
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Title *</label>
                                    <input required value={form.title}
                                           onChange={(e) => set('title', e.target.value)}
                                           className="input" placeholder="Software Engineer" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Company *</label>
                                    <input required value={form.company}
                                           onChange={(e) => set('company', e.target.value)}
                                           className="input" placeholder="Acme Corp" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Type *</label>
                                    <select value={form.type} onChange={(e) => set('type', e.target.value)}
                                            className="input">
                                        {JOB_TYPES.map((t) => (
                                            <option key={t} value={t} className="capitalize">{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Location</label>
                                    <input value={form.location}
                                           onChange={(e) => set('location', e.target.value)}
                                           className="input" placeholder="Remote / Mumbai, India" />
                                </div>
                            </div>
                        </div>

                        {/* Application group */}
                        <div className="space-y-4 pt-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/10 border border-emerald-500/20
                                               flex items-center justify-center text-[10px]">🔗</span>
                                Application
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Application Link</label>
                                    <input type="url" value={form.applicationLink}
                                           onChange={(e) => set('applicationLink', e.target.value)}
                                           className="input" placeholder="https://careers.example.com/…" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Application Deadline</label>
                                    <input type="date" value={form.deadline}
                                           onChange={(e) => set('deadline', e.target.value)}
                                           className="input" />
                                </div>
                            </div>
                        </div>

                        {/* Skills & description */}
                        <div className="space-y-4 pt-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="h-5 w-5 rounded-md bg-purple-500/10 border border-purple-500/20
                                               flex items-center justify-center text-[10px]">📝</span>
                                Description
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Required Skills (comma-separated)
                                </label>
                                <input value={form.requiredSkills}
                                       onChange={(e) => set('requiredSkills', e.target.value)}
                                       className="input" placeholder="React, Node.js, TypeScript, Git" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Description *</label>
                                <textarea required rows={6} value={form.description}
                                          onChange={(e) => set('description', e.target.value)}
                                          className="input resize-y"
                                          placeholder="Describe the role, responsibilities, requirements…" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-surface-border/30">
                            <button type="button" onClick={() => navigate(-1)}
                                    className="btn-ghost flex-1">Cancel</button>
                            <button type="submit" disabled={loading} className="btn-primary flex-1">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 border-2 border-white/30 border-t-white
                                                        rounded-full animate-spin" />
                                        Posting…
                                    </span>
                                ) : 'Post Job'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default PostJob
