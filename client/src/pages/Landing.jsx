// src/pages/Landing.jsx
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
    { icon: '🤖', title: 'AI Resume Analyzer', desc: 'NLP-powered analysis scoring your resume against industry standards with gap detection.', color: 'from-brand-500/20 to-purple-500/10' },
    { icon: '🎯', title: 'Smart Mentor Matching', desc: 'Cosine-similarity algorithm ranks alumni mentors by how closely they match your skill profile.', color: 'from-emerald-500/20 to-teal-500/10' },
    { icon: '💬', title: 'Real-time Chat', desc: 'Socket.io-powered instant messaging between students and alumni.', color: 'from-cyan-500/20 to-blue-500/10' },
    { icon: '💼', title: 'Exclusive Job Board', desc: 'Alumni post opportunities directly to students in the network.', color: 'from-amber-500/20 to-orange-500/10' },
    { icon: '📅', title: 'Event Management', desc: 'Discover workshops, networking nights, and virtual panels.', color: 'from-rose-500/20 to-pink-500/10' },
    { icon: '📊', title: 'Admin Analytics', desc: 'Full visibility into platform growth, engagement, and activity.', color: 'from-violet-500/20 to-indigo-500/10' },
]

const stats = [
    ['5,000+', 'Alumni Network'],
    ['1,200+', 'Active Students'],
    ['300+', 'Jobs Posted'],
    ['92%', 'Match Accuracy'],
]

const Landing = () => {
    const { user } = useAuth()

    const getDashboardLink = () => {
        if (!user) return '/login'
        if (user.role === 'admin') return '/admin'
        if (user.role === 'alumni') return '/alumni-dashboard'
        return '/student'
    }

    return (
        <div className="min-h-screen bg-surface overflow-hidden">
            {/* ── Animated Background ────────────────────────────────── */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="floating-shape -top-40 -left-40 h-[500px] w-[500px] bg-brand-500/20"
                     style={{ animationDelay: '0s' }} />
                <div className="floating-shape -top-20 right-0 h-[400px] w-[400px] bg-purple-500/15"
                     style={{ animationDelay: '2s' }} />
                <div className="floating-shape bottom-1/4 left-1/3 h-[300px] w-[300px] bg-brand-400/10"
                     style={{ animationDelay: '4s' }} />
            </div>

            {/* ── Navbar ─────────────────────────────────────────────── */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
                <Link to="/" className="flex items-center gap-2.5 font-bold text-xl group">
                    <span className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center
                                    text-white text-sm font-bold shadow-glow-brand
                                    group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">AC</span>
                    <span className="gradient-text font-display group-hover:tracking-wide transition-all duration-300">
                        AlumniConnect
                    </span>
                </Link>
                <div className="flex items-center gap-3">
                    {user ? (
                        <Link to={getDashboardLink()} className="btn-primary">Go to Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn-ghost">Sign In</Link>
                            <Link to="/register" className="btn-primary">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* ── Hero ────────────────────────────────────────────────── */}
            <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-20 pb-28">
                <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
                    <div className="inline-flex items-center gap-2.5 rounded-full
                                  bg-brand-500/10 border border-brand-500/20 px-5 py-2
                                  text-sm text-brand-400 font-medium mb-8
                                  backdrop-blur-sm shadow-glow-brand/30">
                        <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse-slow" />
                        AI-Powered Alumni Network
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05]
                              tracking-tight mb-8 font-display animate-slide-up"
                    style={{ animationDelay: '80ms' }}>
                    Connect. Grow.<br />
                    <span className="gradient-text">Mentor.</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12
                             animate-slide-up" style={{ animationDelay: '160ms' }}>
                    An intelligent alumni platform where students find mentors, discover opportunities,
                    and build careers — powered by AI.
                </p>

                <div className="flex items-center justify-center gap-4 flex-wrap
                               animate-slide-up" style={{ animationDelay: '240ms' }}>
                    <Link to="/register?role=student"
                          className="btn-primary text-base px-8 py-3.5 shadow-glow-brand-lg">
                        Join as Student
                        <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                    <Link to="/register?role=alumni" className="btn-ghost text-base px-8 py-3.5">
                        Join as Alumni
                    </Link>
                </div>
            </div>

            {/* ── Stats strip ────────────────────────────────────────── */}
            <div className="relative z-10 border-y border-surface-border/40
                           bg-surface-card/30 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map(([num, label], i) => (
                        <div key={label}
                             className="text-center group cursor-default animate-slide-up"
                             style={{ animationDelay: `${300 + i * 80}ms` }}>
                            <p className="text-3xl md:text-4xl font-extrabold gradient-text
                                         group-hover:scale-110 transition-transform duration-300
                                         font-display">{num}</p>
                            <p className="text-slate-400 text-sm mt-1.5 font-medium">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Features grid ──────────────────────────────────────── */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 py-28">
                <div className="text-center mb-16">
                    <h2 className="section-heading text-center mb-4 text-3xl md:text-4xl">
                        Everything You Need
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg">
                        A complete platform for students, alumni, and administrators.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                    {features.map((f) => (
                        <div key={f.title}
                             className="glass-card-interactive p-7 group card-shine">
                            {/* Icon with gradient background */}
                            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${f.color}
                                           flex items-center justify-center text-3xl mb-5
                                           group-hover:scale-110 group-hover:rotate-3
                                           transition-all duration-500 ease-bounce-in
                                           border border-white/5`}>
                                {f.icon}
                            </div>
                            <h3 className="font-bold text-white text-lg mb-2 font-display
                                          group-hover:text-brand-300 transition-colors duration-300">
                                {f.title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CTA ────────────────────────────────────────────────── */}
            <div className="relative z-10 max-w-3xl mx-auto text-center px-6 pb-28">
                <div className="gradient-border">
                    <div className="glass-card p-12 md:p-16 relative overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-64
                                       bg-brand-500/10 blur-3xl rounded-full" />
                        <div className="relative">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
                                Ready to Get Started?
                            </h2>
                            <p className="text-slate-400 mb-10 text-lg max-w-md mx-auto">
                                Join thousands of students and alumni already on the platform.
                            </p>
                            <Link to="/register"
                                  className="btn-primary text-base px-10 py-3.5 shadow-glow-brand-lg">
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Footer ─────────────────────────────────────────────── */}
            <footer className="relative z-10 border-t border-surface-border/40">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2.5">
                            <span className="h-8 w-8 rounded-xl bg-gradient-brand flex items-center
                                           justify-center text-white text-xs font-bold shadow-glow-brand">AC</span>
                            <span className="gradient-text font-bold font-display">AlumniConnect</span>
                        </div>
                        <div className="flex items-center gap-8 text-sm text-slate-500">
                            <Link to="/login" className="hover:text-white transition-colors duration-200">Sign In</Link>
                            <Link to="/register" className="hover:text-white transition-colors duration-200">Register</Link>
                            <span>© 2026 AlumniConnect</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing
