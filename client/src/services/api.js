// src/services/api.js
// Axios instance pre-configured to attach JWT from localStorage.
import axios from 'axios'

const api = axios.create({
    baseURL: '/api/v1',
    headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach token ──────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401 ───────────────────────────────────
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error.response?.data || { message: 'Network error' })
    }
)

// ── Auth API ────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
}

// ── Users API ───────────────────────────────────────────────────────────
export const usersAPI = {
    getUser: (uid) => api.get(`/users/${uid}`),
    updateUser: (uid, data) => api.put(`/users/${uid}`, data),
}

// ── Alumni API ──────────────────────────────────────────────────────────
export const alumniAPI = {
    list: (params) => api.get('/alumni', { params }),
    getProfile: (uid) => api.get(`/alumni/${uid}`),
}

// ── Jobs API ────────────────────────────────────────────────────────────
export const jobsAPI = {
    list: (params) => api.get('/jobs', { params }),
    getOne: (id) => api.get(`/jobs/${id}`),
    create: (data) => api.post('/jobs', data),
    update: (id, d) => api.put(`/jobs/${id}`, d),
    remove: (id) => api.delete(`/jobs/${id}`),
}

// ── Events API ──────────────────────────────────────────────────────────
export const eventsAPI = {
    list: (params) => api.get('/events', { params }),
    getOne: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    register: (id) => api.post(`/events/${id}/register`),
}

// ── Mentor API ──────────────────────────────────────────────────────────
export const mentorAPI = {
    recommendations: () => api.get('/mentor/recommendations'),
    sendRequest: (data) => api.post('/mentor/request', data),
    getRequests: () => api.get('/mentor/requests'),
    respond: (id, data) => api.put(`/mentor/request/${id}`, data),
}

// ── Resume API ──────────────────────────────────────────────────────────
export const resumeAPI = {
    upload: (formData) => api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    analyze: (data) => api.post('/resume/analyze', data),
    history: () => api.get('/resume/history'),
}

// ── Chat API ────────────────────────────────────────────────────────────
export const chatAPI = {
    conversations: () => api.get('/chat/conversations'),
    create: (data) => api.post('/chat/conversations', data),
    messages: (id, p) => api.get(`/chat/conversations/${id}/messages`, { params: p }),
}

// ── Admin API ───────────────────────────────────────────────────────────
export const adminAPI = {
    stats: () => api.get('/admin/stats'),
    users: (params) => api.get('/admin/users', { params }),
    verify: (uid) => api.put(`/admin/users/${uid}/verify`),
    changeRole: (uid, data) => api.put(`/admin/users/${uid}/role`, data),
    deleteUser: (uid) => api.delete(`/admin/users/${uid}`),
}

export default api
