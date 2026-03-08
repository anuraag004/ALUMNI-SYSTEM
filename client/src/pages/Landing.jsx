// src/pages/Landing.jsx
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
    { icon: '🤖', title: 'AI Resume Analyzer', desc: 'NLP-powered analysis scoring your resume against industry standards with gap detection.' },
    { icon: '🎯', title: 'Smart Mentor Matching', desc: 'Cosine-similarity algorithm ranks alumni mentors by how closely they match your skill profile.' },
    { icon: '💬', title: 'Real-time Chat', desc: 'Socket.io-powered instant messaging between students and alumni.' },
    { icon: '💼', title: 'Exclusive Job Board', desc: 'Alumni post opportunities directly to students in the network.' },
    { icon: '📅', title: 'Event Management', desc: 'Discover workshops, networking nights, and virtual panels.' },
    { icon: '📊', title: 'Admin Analytics', desc: 'Full visibility into platform growth, engagement, and activity.' },
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
            {/* ── Hero ────────────────────────────────────────────────────── */}
            <div className="relative">
                {/* Gradient orbs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
                    <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />
                </div>

                <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <span className="h-9 w-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">AC</span>
                        <span className="gradient-text">AlumniConnect</span>
                    </div>
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

                <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-24 pb-32">
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/30 px-4 py-1.5 text-sm text-brand-400 font-medium mb-6">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse-slow" /> AI-Powered Alumni Network
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
                        Connect. Grow.<br /><span className="gradient-text">Mentor.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
                        An intelligent alumni platform where students find mentors, discover opportunities, and build careers — powered by AI.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link to="/register?role=student" className="btn-primary text-base px-8 py-3">Join as Student</Link>
                        <Link to="/register?role=alumni" className="btn-ghost text-base px-8 py-3">Join as Alumni</Link>
                    </div>
                </div>
            </div>

            {/* ── Stats strip ─────────────────────────────────────────────── */}
            <div className="border-y border-surface-border bg-surface-card/50 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[['5,000+', 'Alumni'], ['1,200+', 'Students'], ['300+', 'Jobs Posted'], ['92%', 'Match Accuracy']].map(([num, label]) => (
                        <div key={label}>
                            <p className="text-3xl font-extrabold gradient-text">{num}</p>
                            <p className="text-slate-400 text-sm mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Features grid ───────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 py-24">
                <h2 className="section-heading text-center mb-3">Everything You Need</h2>
                <p className="text-slate-400 text-center mb-14 max-w-xl mx-auto">A complete platform for students, alumni, and administrators.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f) => (
                        <div key={f.title} className="glass-card p-6 hover:border-brand-500/40 transition-all duration-300 group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                            <h3 className="font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CTA ─────────────────────────────────────────────────────── */}
            <div className="max-w-2xl mx-auto text-center px-6 pb-24">
                <div className="glass-card p-10">
                    <h2 className="text-3xl font-bold text-white mb-3">Ready to Get Started?</h2>
                    <p className="text-slate-400 mb-8">Join thousands of students and alumni already on the platform.</p>
                    <Link to="/register" className="btn-primary text-base px-10 py-3">Create Free Account</Link>
                </div>
            </div>

            <footer className="text-center text-slate-600 py-8 border-t border-surface-border text-sm">
                © 2026 AlumniConnect · Built with ♥ using MERN + Firebase
            </footer>
        </div>
    )
}

export default Landing
