// src/pages/shared/Events.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/common/DashboardLayout'
import { eventsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const Events = () => {
    const { user } = useAuth()
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [registering, setRegistering] = useState(null)

    useEffect(() => {
        eventsAPI.list({ limit: 30 })
            .then((res) => setEvents(res.data || []))
            .catch(() => toast.error('Could not load events'))
            .finally(() => setLoading(false))
    }, [])

    const handleRegister = async (id) => {
        setRegistering(id)
        try {
            await eventsAPI.register(id)
            setEvents((prev) => prev.map((ev) => ev.id === id
                ? { ...ev, registrations: [...(ev.registrations || []), user.uid] } : ev))
            toast.success('Registered for event! 🎉')
        } catch (e) { toast.error(e.message || 'Registration failed') }
        finally { setRegistering(null) }
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between animate-slide-up">
                    <h1 className="section-heading">Events</h1>
                    {(user?.role === 'alumni' || user?.role === 'admin') && (
                        <Link to="/events/create" className="btn-primary">+ Create Event</Link>
                    )}
                </div>

                {loading
                    ? <div className="flex justify-center py-20"><Loader size="lg" /></div>
                    : events.length === 0
                        ? <div className="text-center py-24 glass-card">
                            <p className="text-5xl mb-4">📅</p>
                            <p className="text-white font-semibold font-display text-lg">No upcoming events</p>
                            <p className="text-slate-400 text-sm mt-2">Check back later for new events.</p>
                          </div>
                        : <div className="grid sm:grid-cols-2 gap-5 stagger-children">
                            {events.map((ev) => {
                                const isRegistered = ev.registrations?.includes(user?.uid)
                                const isFull = ev.maxAttendees && ev.registrations?.length >= ev.maxAttendees
                                const date = new Date(ev.date?.seconds * 1000 || ev.date)
                                return (
                                    <div key={ev.id}
                                         className="glass-card-interactive p-6 card-shine group">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex gap-3 items-start">
                                                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10
                                                               border border-emerald-500/20 flex flex-col
                                                               items-center justify-center shrink-0
                                                               group-hover:scale-105 group-hover:rotate-2
                                                               transition-all duration-500 ease-bounce-in">
                                                    <span className="text-emerald-400 font-bold text-xs">
                                                        {date.toLocaleDateString('en', { month: 'short' })}
                                                    </span>
                                                    <span className="text-white font-extrabold text-xl leading-none">
                                                        {date.getDate()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white leading-tight font-display
                                                                  group-hover:text-brand-300 transition-colors duration-300">
                                                        {ev.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {date.toLocaleString('en', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            {ev.isVirtual
                                                ? <span className="badge-indigo shrink-0">Virtual</span>
                                                : <span className="badge-green shrink-0">In-person</span>
                                            }
                                        </div>

                                        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{ev.description}</p>

                                        {ev.venue && <p className="text-xs text-slate-500 mb-3">📍 {ev.venue}</p>}

                                        {ev.maxAttendees && (
                                            <div className="mb-5">
                                                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                                    <span>{ev.registrations?.length || 0} registered</span>
                                                    <span>{ev.maxAttendees} max</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div className="progress-bar-fill"
                                                         style={{ width: `${Math.min(((ev.registrations?.length || 0) / ev.maxAttendees) * 100, 100)}%` }} />
                                                </div>
                                            </div>
                                        )}

                                        {isRegistered ? (
                                            <span className="badge-green w-full text-center block py-2.5 text-sm">
                                                ✓ You're registered
                                            </span>
                                        ) : isFull ? (
                                            <span className="badge-rose w-full text-center block py-2.5 text-sm">
                                                Event Full
                                            </span>
                                        ) : (
                                            <button onClick={() => handleRegister(ev.id)}
                                                    disabled={registering === ev.id}
                                                    className="btn-primary w-full">
                                                {registering === ev.id ? (
                                                    <span className="flex items-center gap-2 justify-center">
                                                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Registering…
                                                    </span>
                                                ) : 'Register Now'}
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                }
            </div>
        </DashboardLayout>
    )
}

export default Events
