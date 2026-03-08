// src/pages/student/ResumeAnalyzer.jsx
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import DashboardLayout from '../../components/common/DashboardLayout'
import { resumeAPI } from '../../services/api'
import toast from 'react-hot-toast'

const ScoreRing = ({ score }) => {
    const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
    const r = 45, circ = 2 * Math.PI * r
    const offset = circ - (score / 100) * circ
    return (
        <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#334155" strokeWidth="10" />
            <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            <text x="60" y="67" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold"
                style={{ transform: 'rotate(90deg)', transformOrigin: '60px 60px' }}>{score}</text>
        </svg>
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
        if (file.type !== 'application/pdf') return toast.error('Only PDF files are accepted')
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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 })

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

    const scoreColor = analysis ? (analysis.score >= 70 ? 'text-emerald-400' : analysis.score >= 40 ? 'text-amber-400' : 'text-rose-400') : ''

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="section-heading">AI Resume Analyzer</h1>
                    <p className="text-slate-400 mt-1">Upload your resume PDF for an instant NLP-powered analysis with skill gap detection.</p>
                </div>

                {/* Upload zone */}
                <div {...getRootProps()}
                    className={`glass-card p-12 text-center cursor-pointer border-2 border-dashed transition-all duration-300 ${isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-surface-border hover:border-brand-500/50'
                        }`}>
                    <input {...getInputProps()} />
                    <div className="text-5xl mb-4">{uploading ? '⏳' : isDragActive ? '📂' : '📄'}</div>
                    <p className="font-semibold text-white">{uploading ? 'Uploading…' : isDragActive ? 'Drop here!' : 'Drag & drop your resume PDF'}</p>
                    <p className="text-sm text-slate-400 mt-2">or click to browse · Max 5 MB</p>
                    {fileName && <p className="mt-3 text-brand-400 text-sm font-medium">✓ {fileName}</p>}
                </div>

                {resumeUrl && !analysis && (
                    <div className="flex justify-center">
                        <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary px-10 py-3 text-base">
                            {analyzing ? '🧠 Analysing with AI…' : '🔍 Analyze Resume'}
                        </button>
                    </div>
                )}

                {/* Results */}
                {analysis && (
                    <div className="space-y-6 animate-slide-up">
                        {/* Score */}
                        <div className="glass-card p-8 flex flex-col sm:flex-row items-center gap-8">
                            <div className="flex flex-col items-center">
                                <ScoreRing score={analysis.score} />
                                <p className={`text-2xl font-extrabold mt-2 ${scoreColor}`}>{analysis.score}/100</p>
                                <p className="text-slate-400 text-sm">Resume Score</p>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Strengths</p>
                                    <div className="space-y-1">
                                        {analysis.strengths.map((s) => <p key={s} className="text-sm text-emerald-400 flex items-center gap-2"><span>✓</span>{s}</p>)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Gap Areas</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {analysis.gaps.map((g) => <span key={g} className="badge-rose">{g}</span>)}
                                        {analysis.gaps.length === 0 && <span className="text-emerald-400 text-sm">No critical gaps detected!</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extracted Skills */}
                        <div className="glass-card p-6">
                            <p className="font-bold text-white mb-3">Detected Skills ({analysis.extractedSkills.length})</p>
                            <div className="flex flex-wrap gap-2">
                                {analysis.extractedSkills.map((s) => <span key={s} className="badge-indigo">{s}</span>)}
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="glass-card p-6">
                            <p className="font-bold text-white mb-3">💡 AI Suggestions</p>
                            <ul className="space-y-2">
                                {analysis.suggestions.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                        <span className="text-brand-400 mt-0.5 shrink-0">→</span>{s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button onClick={() => { setAnalysis(null); setResumeUrl(null); setFileName('') }} className="btn-ghost w-full">
                            Analyze another resume
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default ResumeAnalyzer
