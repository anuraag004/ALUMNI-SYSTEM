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
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between
                          border-b border-surface-border/40 bg-surface/70 backdrop-blur-xl
                          px-4 lg:px-6
                          shadow-[0_1px_0_rgba(255,255,255,0.02)]">
            {/* Hamburger (mobile) */}
            <button onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl hover:bg-surface-elevated text-slate-400
                               hover:text-white transition-all duration-200 active:scale-95">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg group">
                <span className="h-8 w-8 rounded-xl bg-gradient-brand flex items-center justify-center
                                text-white text-sm font-bold shadow-glow-brand
                                group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">AC</span>
                <span className="gradient-text hidden sm:inline transition-all duration-300
                                group-hover:tracking-wide">AlumniConnect</span>
            </Link>

            {/* Right controls */}
            <div className="flex items-center gap-2">
                {user && (
                    <>
                        {/* Notifications */}
                        <div className="relative">
                            <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false) }}
                                className="relative p-2.5 rounded-xl hover:bg-surface-elevated
                                           text-slate-400 hover:text-white
                                           transition-all duration-200 active:scale-95
                                           hover:shadow-glow-brand/50">
                                <BellIcon />
                                {unread > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5
                                                     rounded-full bg-gradient-brand text-[10px] font-bold
                                                     text-white flex items-center justify-center
                                                     shadow-glow-brand animate-pulse-slow
                                                     ring-2 ring-surface">{unread}</span>
                                )}
                            </button>
                            {showNotifs && (
                                <div className="absolute right-0 mt-2 w-80 glass-card shadow-card-elevated
                                               p-2 space-y-1 animate-scale-in origin-top-right">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                                        Notifications
                                    </p>
                                    {notifications.length === 0 ? (
                                        <p className="text-sm text-slate-500 px-3 py-4 text-center">No new notifications</p>
                                    ) : notifications.slice(0, 6).map((n) => (
                                        <button key={n.id} onClick={() => { markNotifRead(n.id); setShowNotifs(false) }}
                                            className="w-full text-left p-3 rounded-xl hover:bg-surface-elevated/60
                                                       transition-all duration-200 group">
                                            <p className="text-sm text-slate-200 group-hover:text-white">{n.message}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(n.createdAt?.seconds * 1000 || n.createdAt).toLocaleDateString()}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Avatar + profile */}
                        <div className="relative">
                            <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false) }}
                                className="flex items-center gap-2 p-1.5 rounded-xl
                                           hover:bg-surface-elevated transition-all duration-200
                                           active:scale-95">
                                <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center
                                               justify-center text-sm font-bold text-white uppercase
                                               shadow-glow-brand ring-2 ring-surface-card
                                               hover:ring-brand-500/30 transition-all duration-300">
                                    {user.displayName?.[0] || 'U'}
                                </div>
                            </button>
                            {showProfile && (
                                <div className="absolute right-0 mt-2 w-56 glass-card shadow-card-elevated
                                               overflow-hidden animate-scale-in origin-top-right">
                                    {/* Gradient accent stripe */}
                                    <div className="h-1 bg-gradient-brand" />
                                    <div className="p-2">
                                        <div className="px-3 py-2.5 border-b border-surface-border/50 mb-1">
                                            <p className="font-semibold text-sm text-white">{user.displayName}</p>
                                            <span className={`${roleColor[user.role]} mt-1`}>{user.role}</span>
                                        </div>
                                        <Link to={`/users/${user.uid}`} onClick={() => setShowProfile(false)}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                                                       hover:bg-surface-elevated text-sm text-slate-300
                                                       hover:text-white transition-all duration-200">
                                            <span className="text-base">👤</span> Profile
                                        </Link>
                                        <button onClick={handleLogout}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                                                       hover:bg-rose-500/10 text-sm text-rose-400 w-full
                                                       text-left transition-all duration-200">
                                            <span className="text-base">🚪</span> Sign out
                                        </button>
                                    </div>
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
