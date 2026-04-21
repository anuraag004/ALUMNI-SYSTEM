// src/pages/student/ResumeAnalyzer.jsx
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import DashboardLayout from '../../components/common/DashboardLayout'
import { resumeAPI } from '../../services/api'
import toast from 'react-hot-toast'

const ScoreRing = ({ score }) => {
    const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
    const glowColor = score >= 70 ? 'rgba(16,185,129,0.2)' : score >= 40 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'
    const r = 46, circ = 2 * Math.PI * r
    const offset = circ - (score / 100) * circ
    return (
        <div className="relative" style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}>
            <svg width="128" height="128" viewBox="0 0 128 128" className="rotate-[-90deg]">
                <circle cx="64" cy="64" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
                <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
                <text x="64" y="71" textAnchor="middle" fill="white" fontSize="24" fontWeight="800"
                    fontFamily="Outfit, sans-serif"
                    style={{ transform: 'rotate(90deg)', transformOrigin: '64px 64px' }}>{score}</text>
            </svg>
        </div>
    )
}

const ResumeAnalyzer = () => {
    const [uploading, setUploading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [resumeUrl, setResumeUrl] = useState(null)
    const [fileName, setFileName] = useState('')
    const [analysis, setAnalysis] = useState(null)

    const onDrop = useCallback(async (accepted) => {
        if (!accepted.length) return
        const file = accepted[0]
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            return toast.error('Only PDF files are accepted')
        }
        setFileName(file.name)
        setUploading(true)
        try {
            const fd = new FormData()
            fd.append('resume', file)
            const res = await resumeAPI.upload(fd)
            setResumeUrl(res.data.resumeUrl)
            toast.success('PDF uploaded! Click Analyze to continue.')
        } catch (e) { toast.error(e.message || 'Upload failed') }
        finally { setUploading(false) }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1
    })

    const handleAnalyze = async () => {
        if (!resumeUrl) return toast.error('Please upload a resume first')
        setAnalyzing(true)
        try {
            const res = await resumeAPI.analyze({ resumeUrl })
            setAnalysis(res.data)
            toast.success('Analysis complete! ✨')
        } catch (e) { toast.error(e.message || 'Analysis failed') }
        finally { setAnalyzing(false) }
    }

    const scoreColor = analysis
        ? (analysis.score >= 70 ? 'text-emerald-400' : analysis.score >= 40 ? 'text-amber-400' : 'text-rose-400')
        : ''

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="animate-slide-up">
                    <h1 className="section-heading">AI Resume Analyzer</h1>
                    <p className="text-slate-400 mt-2">
                        Upload your resume PDF for an instant NLP-powered analysis with skill gap detection.
                    </p>
                </div>

                {/* Upload zone */}
                <div {...getRootProps()}
                     className={`relative glass-card p-14 text-center cursor-pointer
                                border-2 border-dashed transition-all duration-500 ease-bounce-in
                                animate-slide-up group overflow-hidden
                                ${isDragActive
                                    ? 'border-brand-500 bg-brand-500/8 shadow-glow-brand scale-[1.01]'
                                    : 'border-surface-border/60 hover:border-brand-500/50 hover:bg-surface-elevated/30'
                                }`}
                     style={{ animationDelay: '60ms' }}>
                    {/* Animated dashed border glow when dragging */}
                    {isDragActive && (
                        <div className="absolute inset-0 rounded-2xl animate-glow-pulse pointer-events-none" />
                    )}
                    <input {...getInputProps()} />
                    <div className={`text-5xl mb-5 transition-all duration-500 ${isDragActive ? 'scale-125' : 'group-hover:scale-110'}`}>
                        {uploading ? '⏳' : isDragActive ? '📂' : '📄'}
                    </div>
                    <p className="font-bold text-white text-lg font-display">
                        {uploading ? 'Uploading…' : isDragActive ? 'Drop it here!' : 'Drag & drop your resume PDF'}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">or click to browse · PDF only · Max 5 MB</p>
                    {fileName && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20
                                       rounded-xl px-4 py-2 text-brand-400 text-sm font-medium animate-scale-in">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {fileName}
                        </div>
                    )}
                </div>

                {resumeUrl && !analysis && (
                    <div className="flex justify-center animate-scale-in">
                        <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary px-12 py-3.5 text-base">
                            {analyzing ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analysing with AI…
                                </span>
                            ) : '🔍 Analyze Resume'}
                        </button>
                    </div>
                )}

                {/* Results */}
                {analysis && (
                    <div className="space-y-5 animate-slide-up">
                        {/* Score card */}
                        <div className="glass-card p-8 flex flex-col sm:flex-row items-center gap-8">
                            <div className="flex flex-col items-center shrink-0">
                                <ScoreRing score={analysis.score} />
                                <p className={`text-2xl font-extrabold mt-3 font-display ${scoreColor}`}>
                                    {analysis.score}/100
                                </p>
                                <p className="text-slate-400 text-sm mt-0.5">Resume Score</p>
                            </div>
                            <div className="flex-1 w-full space-y-5">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                        Strengths
                                    </p>
                                    <div className="space-y-2">
                                        {(analysis.strengths || []).map((s) => (
                                            <div key={s} className="flex items-center gap-2.5 text-sm text-emerald-400">
                                                <div className="h-5 w-5 rounded-full bg-emerald-500/15 border border-emerald-500/25
                                                               flex items-center justify-center shrink-0 text-xs">✓</div>
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                        Gap Areas
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(analysis.gaps || []).map((g) => <span key={g} className="badge-rose">{g}</span>)}
                                        {(!analysis.gaps || analysis.gaps.length === 0) && (
                                            <span className="text-emerald-400 text-sm font-medium">
                                                🎉 No critical gaps detected!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extracted Skills */}
                        <div className="glass-card-interactive p-6">
                            <p className="font-bold text-white mb-4 font-display flex items-center gap-2">
                                <span className="h-7 w-7 rounded-lg bg-brand-500/10 border border-brand-500/20
                                               flex items-center justify-center text-sm">🏷️</span>
                                Detected Skills
                                <span className="badge-indigo">{analysis.extractedSkills.length}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {(analysis.extractedSkills || []).map((s) => (
                                    <span key={s} className="badge-indigo">{s}</span>
                                ))}
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="glass-card-interactive p-6">
                            <p className="font-bold text-white mb-4 font-display flex items-center gap-2">
                                <span className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20
                                               flex items-center justify-center text-sm">💡</span>
                                AI Suggestions
                            </p>
                            <ul className="space-y-3">
                                {(analysis.suggestions || []).map((s, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300
                                                          p-3 rounded-xl hover:bg-surface-elevated/40
                                                          transition-colors duration-200">
                                        <span className="h-5 w-5 rounded-full bg-brand-500/15 border border-brand-500/25
                                                        flex items-center justify-center text-brand-400 text-xs
                                                        shrink-0 mt-0.5">→</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button onClick={() => { setAnalysis(null); setResumeUrl(null); setFileName('') }}
                                className="btn-ghost w-full">
                            Analyze another resume
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default ResumeAnalyzer
