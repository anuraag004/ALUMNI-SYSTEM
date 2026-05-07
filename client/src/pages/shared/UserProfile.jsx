import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { usersAPI } from '../../services/api'
import Navbar from '../../components/common/Navbar'

const UserProfile = () => {
    const { uid } = useParams()
    const navigate = useNavigate()
    const { user: authUser, updateLocalUser } = useAuth()
    
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({})
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const isOwnerOrAdmin = authUser && (authUser.uid === uid || authUser.role === 'admin')

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await usersAPI.getUser(uid)
                setProfile(res.data)
                setFormData({
                    displayName: res.data.displayName || '',
                    headline: res.data.headline || '',
                    bio: res.data.bio || '',
                    location: res.data.location || '',
                    github: res.data.github || '',
                    linkedin: res.data.linkedin || '',
                    skills: res.data.skills?.join(', ') || ''
                })
            } catch (err) {
                console.error("Error fetching profile:", err)
                setError(err.message || 'Failed to load profile')
                toast.error('Failed to load profile')
            } finally {
                setLoading(false)
            }
        }
        if (uid) fetchProfile()
    }, [uid])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setSaving(true)
            const skillsArray = formData.skills
                ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
                : []
            
            const payload = {
                ...formData,
                skills: skillsArray
            }

            const res = await usersAPI.updateUser(uid, payload)
            setProfile(res.data)
            setIsEditing(false)
            toast.success('Profile updated successfully')
            
            // If the user updated their own profile and the displayName changed, update context
            if (authUser.uid === uid && formData.displayName !== authUser.displayName) {
                 if(updateLocalUser) {
                     updateLocalUser({ displayName: formData.displayName })
                 }
            }
            
        } catch (err) {
            console.error("Error updating profile:", err)
            toast.error(err.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-surface flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
                    <p className="text-slate-400 mb-6">{error || "The user you're looking for doesn't exist."}</p>
                    <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
                </div>
            </div>
        )
    }

    const roleColor = { student: 'badge-green', alumni: 'badge-indigo', admin: 'badge-amber' }

    return (
        <div className="min-h-screen bg-surface flex flex-col">
            <Navbar />
            <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
                
                <div className="glass-card overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-32 md:h-48 bg-gradient-to-r from-brand-600/20 to-purple-600/20 relative">
                        <div className="absolute -bottom-12 left-6 md:left-10 h-24 w-24 md:h-32 md:w-32 
                                        rounded-2xl bg-surface border-4 border-surface-card flex items-center 
                                        justify-center text-3xl md:text-5xl font-bold text-brand-400 uppercase shadow-xl">
                            {profile.displayName?.[0] || 'U'}
                        </div>
                    </div>

                    <div className="px-6 md:px-10 pt-16 pb-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white font-display flex items-center gap-3">
                                    {profile.displayName}
                                    {profile.isVerified && (
                                        <span className="text-brand-400 text-xl" title="Verified Alumni">✓</span>
                                    )}
                                </h1>
                                <p className="text-slate-400 mt-1">{profile.email}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className={roleColor[profile.role] || 'badge-slate'}>
                                        {profile.role?.toUpperCase()}
                                    </span>
                                    {profile.location && (
                                        <span className="text-sm text-slate-500 flex items-center gap-1">
                                            📍 {profile.location}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {isOwnerOrAdmin && !isEditing && (
                                <button onClick={() => setIsEditing(true)} className="btn-ghost text-sm self-start">
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-6 bg-surface-elevated/50 p-6 rounded-2xl border border-surface-border/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-300">Display Name</label>
                                        <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} 
                                               className="input" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-300">Headline</label>
                                        <input type="text" name="headline" value={formData.headline} onChange={handleInputChange} 
                                               className="input" placeholder="e.g. Software Engineer at Google" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-300">Location</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} 
                                               className="input" placeholder="e.g. San Francisco, CA" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-300">Skills (comma separated)</label>
                                        <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} 
                                               className="input" placeholder="React, Node.js, Python" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-300">GitHub URL</label>
                                        <input type="url" name="github" value={formData.github} onChange={handleInputChange} 
                                               className="input" placeholder="https://github.com/username" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-300">LinkedIn URL</label>
                                        <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} 
                                               className="input" placeholder="https://linkedin.com/in/username" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-300">Bio</label>
                                        <textarea name="bio" value={formData.bio} onChange={handleInputChange} 
                                                  className="input min-h-[100px]" placeholder="Tell us about yourself..." />
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 pt-4 border-t border-surface-border/50">
                                    <button type="submit" disabled={saving} className="btn-primary">
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} disabled={saving} className="btn-ghost">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-8">
                                {profile.headline && (
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">Headline</h3>
                                        <p className="text-slate-300">{profile.headline}</p>
                                    </div>
                                )}
                                
                                {profile.bio && (
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">About</h3>
                                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                                    </div>
                                )}

                                {profile.skills && profile.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-3">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map(skill => (
                                                <span key={skill} className="px-3 py-1 rounded-lg bg-surface-elevated border border-surface-border/50 text-sm text-brand-300">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(profile.github || profile.linkedin) && (
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-3">Links</h3>
                                        <div className="flex gap-4">
                                            {profile.github && (
                                                <a href={profile.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                                    GitHub
                                                </a>
                                            )}
                                            {profile.linkedin && (
                                                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-400 transition-colors">
                                                    LinkedIn
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {!profile.headline && !profile.bio && (!profile.skills || profile.skills.length === 0) && (
                                    <div className="text-center py-10 bg-surface-elevated/30 rounded-xl border border-surface-border/30 border-dashed">
                                        <p className="text-slate-500">This profile is quite empty.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default UserProfile
