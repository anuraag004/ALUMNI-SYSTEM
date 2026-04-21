/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                accent: {
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                },
                surface: {
                    DEFAULT: '#0a0f1e',
                    card: '#111827',
                    elevated: '#1a2236',
                    border: '#1e293b',
                    muted: '#475569',
                },
            },
            backgroundImage: {
                'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
                'gradient-brand-hover': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #8b5cf6 100%)',
                'gradient-dark': 'linear-gradient(135deg, #0a0f1e 0%, #111827 100%)',
                'gradient-accent': 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(99,102,241,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139,92,246,0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(99,102,241,0.06) 0px, transparent 50%)',
            },
            boxShadow: {
                'glow-brand': '0 0 20px rgba(99,102,241,0.15), 0 0 60px rgba(99,102,241,0.05)',
                'glow-brand-lg': '0 0 30px rgba(99,102,241,0.25), 0 0 80px rgba(99,102,241,0.08)',
                'glow-accent': '0 0 20px rgba(249,115,22,0.15)',
                'card-hover': '0 8px 30px rgba(0,0,0,0.3), 0 0 1px rgba(99,102,241,0.2)',
                'card-elevated': '0 20px 60px rgba(0,0,0,0.4), 0 0 1px rgba(255,255,255,0.05)',
                'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.03)',
            },
            animation: {
                'fade-in': 'fadeIn .4s ease-out',
                'slide-up': 'slideUp .5s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-down': 'slideDown .3s cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-in': 'scaleIn .3s cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'slide-in-left': 'slideInLeft .4s cubic-bezier(0.16, 1, 0.3, 1)',
                'spin-slow': 'spin 3s linear infinite',
                'border-flow': 'borderFlow 3s ease infinite',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    from: { opacity: '0', transform: 'translateY(-10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    from: { opacity: '0', transform: 'scale(0.95)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.15)' },
                    '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.3)' },
                },
                slideInLeft: {
                    from: { opacity: '0', transform: 'translateX(-20px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                borderFlow: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            transitionTimingFunction: {
                'bounce-in': 'cubic-bezier(0.16, 1, 0.3, 1)',
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
        },
    },
    plugins: [],
}
