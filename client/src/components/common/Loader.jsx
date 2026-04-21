// src/components/common/Loader.jsx
const Loader = ({ fullScreen = false, size = 'md' }) => {
    const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-14 w-14' }
    const borderSizes = { sm: 'border-2', md: 'border-2', lg: 'border-[3px]' }

    const spinner = (
        <div className={`${sizes[size]} ${borderSizes[size]} animate-spin rounded-full
                        border-surface-border border-t-brand-500 border-r-brand-400/50`} />
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface bg-gradient-mesh">
                {/* Animated brand mark */}
                <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-brand flex items-center justify-center
                                   text-white text-xl font-bold font-display shadow-glow-brand-lg
                                   animate-pulse-slow">
                        AC
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-20
                                   animate-ping" style={{ animationDuration: '2s' }} />
                </div>
                <div className="h-1 w-32 rounded-full bg-surface-border overflow-hidden">
                    <div className="h-full w-full bg-gradient-brand rounded-full animate-shimmer"
                         style={{ backgroundSize: '200% 100%' }} />
                </div>
                <p className="mt-4 text-slate-400 text-sm animate-pulse">Loading…</p>
            </div>
        )
    }

    return spinner
}

export default Loader
