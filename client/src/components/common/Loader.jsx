// src/components/common/Loader.jsx
const Loader = ({ fullScreen = false, size = 'md' }) => {
    const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-14 w-14' }

    const spinner = (
        <div className={`${sizes[size]} animate-spin rounded-full border-2 border-surface-border border-t-brand-500`} />
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-surface-border border-t-brand-500" />
                <p className="mt-4 text-slate-400 text-sm animate-pulse">Loading…</p>
            </div>
        )
    }

    return spinner
}

export default Loader
