// src/App.jsx
// Central router — maps paths to role-guarded page components.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import StudentDashboard from './pages/student/Dashboard'
import AlumniDashboard from './pages/alumni/Dashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AlumniDirectory from './pages/shared/AlumniDirectory'
import JobBoard from './pages/shared/JobBoard'
import Events from './pages/shared/Events'
import ResumeAnalyzer from './pages/student/ResumeAnalyzer'
import MentorSearch from './pages/student/MentorSearch'
import Chat from './pages/shared/Chat'
import PostJob from './pages/alumni/PostJob'
import MentorRequests from './pages/alumni/MentorRequests'

const Unauth = () => (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-6xl mb-4">🚫</p>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6">You don't have permission to view this page.</p>
        <a href="/" className="btn-primary">Go Home</a>
    </div>
)

const App = () => (
    <AuthProvider>
        <SocketProvider>
            <BrowserRouter>
                <Toaster position="top-right" toastOptions={{
                    style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '12px' },
                    success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
                }} />

                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/unauthorized" element={<Unauth />} />

                    {/* Student-only */}
                    <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
                    <Route path="/mentor" element={<ProtectedRoute roles={['student']}><MentorSearch /></ProtectedRoute>} />
                    <Route path="/resume" element={<ProtectedRoute roles={['student']}><ResumeAnalyzer /></ProtectedRoute>} />

                    {/* Alumni-only */}
                    <Route path="/alumni-dashboard" element={<ProtectedRoute roles={['alumni']}><AlumniDashboard /></ProtectedRoute>} />
                    <Route path="/jobs/post" element={<ProtectedRoute roles={['alumni', 'admin']}><PostJob /></ProtectedRoute>} />
                    <Route path="/mentor/requests" element={<ProtectedRoute roles={['alumni']}><MentorRequests /></ProtectedRoute>} />

                    {/* Admin-only */}
                    <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

                    {/* All authenticated users */}
                    <Route path="/alumni" element={<ProtectedRoute><AlumniDirectory /></ProtectedRoute>} />
                    <Route path="/jobs" element={<ProtectedRoute><JobBoard /></ProtectedRoute>} />
                    <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </SocketProvider>
    </AuthProvider>
)

export default App
