// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth()
    const socketRef = useRef(null)
    const [connected, setConnected] = useState(false)
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        if (!token || !user) return

        // Connect to Socket.io server with JWT
        socketRef.current = io(import.meta.env.VITE_API_URL || import.meta.env.VITE_SOCKET_URL || window.location.origin, {
            auth: { token },
            transports: ['websocket'],
        })

        socketRef.current.on('connect', () => setConnected(true))
        socketRef.current.on('disconnect', () => setConnected(false))

        // Load notifications on connect
        socketRef.current.emit('get_notifications')
        socketRef.current.on('notifications', (list) => setNotifications(list))

        // Append live incoming notifications
        socketRef.current.on('notification', (notif) =>
            setNotifications((prev) => [notif, ...prev])
        )

        return () => {
            socketRef.current?.disconnect()
            socketRef.current = null
            setConnected(false)
        }
    }, [token, user])

    const joinConversation = (convId) => socketRef.current?.emit('join_conversation', { conversationId: convId })

    const sendMessage = (convId, text) =>
        socketRef.current?.emit('send_message', { conversationId: convId, text })

    const onNewMessage = (cb) => {
        socketRef.current?.on('new_message', cb)
        return () => socketRef.current?.off('new_message', cb)
    }

    const emitTyping = (convId) => socketRef.current?.emit('typing', { conversationId: convId })
    const emitStopTyping = (convId) => socketRef.current?.emit('stop_typing', { conversationId: convId })

    const markNotifRead = (notifId) => {
        socketRef.current?.emit('mark_notification_read', { notifId })
        setNotifications((prev) => prev.filter((n) => n.id !== notifId))
    }

    const value = {
        socket: socketRef.current,
        connected,
        notifications,
        joinConversation,
        sendMessage,
        onNewMessage,
        emitTyping,
        emitStopTyping,
        markNotifRead,
    }

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocket must be used within SocketProvider')
    return ctx
}
