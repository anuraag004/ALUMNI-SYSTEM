// src/pages/shared/AlumniDirectory.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/common/DashboardLayout'
import { alumniAPI, mentorAPI, chatAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const DEPARTMENTS = ['All', 'Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'MBA', 'BBA', 'Other']

const AlumniCard = ({ alumni, onContact, onMentor }) => (
    <div className="glass-card p-5 hover:border-brand-500/30 transition-all duration-300 animate-fade-in">
        <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-xl font-bold text-white uppercase shrink-0">
                {alumni.displayName?.[0]}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="font-bold text-white">{alumni.displayName}</h3>
                        <p className="text-sm text-slate-400">{alumni.currentRole || 'Alumni'}</p>
                        {alumni.currentCompany && <p className="text-sm text-brand-400 font-medium">@ {alumni.currentCompany}</p>}
                    </div>
                    <span className="badge-indigo shrink-0">{alumni.graduationYear}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{alumni.department}</p>

                {/* Skills */}
                {alumni.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {alumni.skills.slice(0, 4).map((s) => (
                            <span key={s} className="badge bg-surface-border text-slate-300">{s}</span>
                        ))}
                        {alumni.skills.length > 4 && <span className="badge bg-surface-border text-slate-400">+{alumni.skills.length - 4}</span>}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                    <button onClick={() => onContact(alumni)} className="btn-ghost text-xs px-3 py-1.5">💬 Message</button>
                    {alumni.isMentorAvailable && (
                        <button onClick={() => onMentor(alumni)} className="btn-primary text-xs px-3 py-1.5">🎯 Request Mentor</button>
                    )}
                    {alumni.linkedIn && (
                        <a href={alumni.linkedIn} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs px-3 py-1.5">LinkedIn ↗</a>
                    )}
                </div>
            </div>
        </div>
    </div>
)

const AlumniDirectory = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [alumni, setAlumni] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dept, setDept] = useState('All')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const LIMIT = 12

    const fetch = async (s = search, d = dept, p = page) => {
        setLoading(true)
        try {
            const params = { page: p, limit: LIMIT }
            if (s) params.search = s
            if (d !== 'All') params.department = d
            const res = await alumniAPI.list(params)
            setAlumni(res.data || [])
            setTotal(res.pagination?.total || 0)
        } catch { toast.error('Failed to load alumni') }
        finally { setLoading(false) }
    }

    useEffect(() => { fetch() }, []) // eslint-disable-line

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetch(search, dept, 1) }

    const handleContact = async (alum) => {
        try {
            const res = await chatAPI.create({ recipientId: alum.uid })
            navigate('/chat', { state: { convId: res.data.id } })
        } catch { toast.error('Could not open chat') }
    }

    const handleMentor = async (alum) => {
        const msg = prompt(`Send a mentorship request to ${alum.displayName}:`)
        if (!msg) return
        try {
            await mentorAPI.sendRequest({ mentorId: alum.uid, message: msg })
            toast.success('Mentor request sent!')
        } catch (e) { toast.error(e.message || 'Failed') }
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <h1 className="section-heading">Alumni Directory</h1>

                {/* Filters */}
                <form onSubmit={handleSearch} className="glass-card p-4 flex flex-col sm:flex-row gap-3">
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        className="input flex-1" placeholder="Search by name, company, role…" />
                    <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); fetch(search, e.target.value, 1) }}
                        className="input w-full sm:w-52">
                        {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <button type="submit" className="btn-primary shrink-0">Search</button>
                </form>

                <p className="text-sm text-slate-400">{total} alumni found</p>

                {loading
                    ? <div className="flex justify-center py-20"><Loader size="lg" /></div>
                    : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {alumni.length === 0
                                    ? <p className="text-slate-500 col-span-3 text-center py-20">No alumni found matching your filters.</p>
                                    : alumni.map((a) => <AlumniCard key={a.uid} alumni={a} onContact={handleContact} onMentor={user?.role === 'student' ? handleMentor : undefined} />)
                                }
                            </div>

                            {/* Pagination */}
                            {total > LIMIT && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <button disabled={page === 1} onClick={() => { setPage(page - 1); fetch(search, dept, page - 1) }} className="btn-ghost disabled:opacity-40">← Prev</button>
                                    <span className="px-4 py-2 text-sm text-slate-400">Page {page} of {Math.ceil(total / LIMIT)}</span>
                                    <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => { setPage(page + 1); fetch(search, dept, page + 1) }} className="btn-ghost disabled:opacity-40">Next →</button>
                                </div>
                            )}
                        </>
                    )
                }
            </div>
        </DashboardLayout>
    )
}

export default AlumniDirectory
