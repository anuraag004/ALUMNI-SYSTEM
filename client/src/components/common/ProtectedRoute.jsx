// src/components/common/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from './Loader'

/**
 * Wraps a route to require authentication and optionally a specific role.
 * Redirects to /login if unauthenticated, or /unauthorized if wrong role.
 */
const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) return <Loader fullScreen />

    if (!user) return <Navigate to="/login" state={{ from: location }} replace />

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return children
}

export default ProtectedRoute
