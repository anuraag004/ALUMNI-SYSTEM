// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, googleProvider } from '../services/firebase'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
    const [token, setToken] = useState(() => localStorage.getItem('token') || null)
    const [loading, setLoading] = useState(true)

    // Persist helpers
    const persist = (userData, jwt) => {
        setUser(userData)
        setToken(jwt)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', jwt)
    }

    const clear = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    // Validate stored token on mount
    useEffect(() => {
        if (token) {
            authAPI.getMe()
                .then((res) => setUser(res.data))
                .catch(() => clear())
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, []) // eslint-disable-line

    // ── Email + Password Register ───────────────────────────────────────────
    const register = useCallback(async ({ email, password, displayName, role, graduationYear, department }) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        const idToken = await cred.user.getIdToken()
        const res = await authAPI.register({ idToken, displayName, role, graduationYear, department, email })
        persist(res.data.user, res.data.token)
        toast.success('Welcome to AlumniConnect! 🎓')
        return res.data.user
    }, [])

    // ── Email + Password Login ──────────────────────────────────────────────
    const login = useCallback(async ({ email, password }) => {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        const idToken = await cred.user.getIdToken()
        const res = await authAPI.login({ idToken })
        persist(res.data.user, res.data.token)
        toast.success(`Welcome back, ${res.data.user.displayName}!`)
        return res.data.user
    }, [])

    // ── Google OAuth Login ──────────────────────────────────────────────────
    const loginWithGoogle = useCallback(async (role = 'student') => {
        const cred = await signInWithPopup(auth, googleProvider)
        const idToken = await cred.user.getIdToken()
        // Try login first; if user doesn't exist, register them
        try {
            const res = await authAPI.login({ idToken })
            persist(res.data.user, res.data.token)
            toast.success(`Welcome back, ${res.data.user.displayName}!`)
            return res.data.user
        } catch {
            const res = await authAPI.register({
                idToken,
                displayName: cred.user.displayName,
                email: cred.user.email,
                role,
            })
            persist(res.data.user, res.data.token)
            toast.success('Account created with Google! 🎉')
            return res.data.user
        }
    }, [])

    // ── Logout ──────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        await Promise.allSettled([authAPI.logout(), signOut(auth)])
        clear()
        toast.success('Logged out successfully')
    }, [])

    // ── Update local user state (after profile edits) ───────────────────────
    const updateLocalUser = useCallback((updates) => {
        setUser((prev) => {
            const updated = { ...prev, ...updates }
            localStorage.setItem('user', JSON.stringify(updated))
            return updated
        })
    }, [])

    const value = { user, token, loading, register, login, loginWithGoogle, logout, updateLocalUser }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
