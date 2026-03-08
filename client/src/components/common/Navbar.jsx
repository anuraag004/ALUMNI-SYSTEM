// src/components/common/Navbar.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
)

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth()
    const { notifications, markNotifRead } = useSocket()
    const [showNotifs, setShowNotifs] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const navigate = useNavigate()
    const unread = notifications.filter((n) => !n.isRead).length

    const handleLogout = async () => { await logout(); navigate('/') }
    const roleColor = { student: 'badge-green', alumni: 'badge-indigo', admin: 'badge-amber' }

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-surface-border bg-surface/90 backdrop-blur-md px-4 lg:px-6">
            {/* Hamburger (mobile) */}
            <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-surface-card text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
                <span className="h-8 w-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">AC</span>
                <span className="gradient-text hidden sm:inline">AlumniConnect</span>
            </Link>

            {/* Right controls */}
            <div className="flex items-center gap-3">
                {user && (
                    <>
                        {/* Notifications */}
                        <div className="relative">
                            <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false) }}
                                className="relative p-2 rounded-xl hover:bg-surface-card text-slate-400 hover:text-white transition-colors">
                                <BellIcon />
                                {unread > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-500 text-[10px] font-bold text-white flex items-center justify-center">{unread}</span>
                                )}
                            </button>
                            {showNotifs && (
                                <div className="absolute right-0 mt-2 w-80 glass-card shadow-2xl p-3 space-y-2 animate-fade-in">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Notifications</p>
                                    {notifications.length === 0 ? (
                                        <p className="text-sm text-slate-500 px-1 py-3 text-center">No new notifications</p>
                                    ) : notifications.slice(0, 6).map((n) => (
                                        <button key={n.id} onClick={() => { markNotifRead(n.id); setShowNotifs(false) }}
                                            className="w-full text-left p-2.5 rounded-xl hover:bg-surface-border/40 transition-colors">
                                            <p className="text-sm text-slate-200">{n.message}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{new Date(n.createdAt?.seconds * 1000 || n.createdAt).toLocaleDateString()}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Avatar + profile */}
                        <div className="relative">
                            <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false) }}
                                className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-card transition-colors">
                                <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white uppercase">
                                    {user.displayName?.[0] || 'U'}
                                </div>
                            </button>
                            {showProfile && (
                                <div className="absolute right-0 mt-2 w-52 glass-card shadow-2xl p-2 space-y-1 animate-fade-in">
                                    <div className="px-3 py-2 border-b border-surface-border">
                                        <p className="font-semibold text-sm text-white">{user.displayName}</p>
                                        <span className={roleColor[user.role]}>{user.role}</span>
                                    </div>
                                    <Link to={`/users/${user.uid}`} onClick={() => setShowProfile(false)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-border/40 text-sm text-slate-300">Profile</Link>
                                    <button onClick={handleLogout}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-sm text-rose-400 w-full text-left">Sign out</button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </header>
    )
}

export default Navbar
