// src/pages/shared/Chat.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardLayout from '../../components/common/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { chatAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const Chat = () => {
    const { user } = useAuth()
    const { joinConversation, sendMessage, onNewMessage, emitTyping, emitStopTyping } = useSocket()
    const location = useLocation()
    const bottomRef = useRef(null)
    const typingRef = useRef(null)

    const [convs, setConvs] = useState([])
    const [activeConv, setActive] = useState(null)
    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(true)
    const [otherTyping, setOtherTyping] = useState(false)
    const [loadingMsgs, setLoadingMsgs] = useState(false)

    // Load conversations list
    useEffect(() => {
        chatAPI.conversations()
            .then((res) => setConvs(res.data || []))
            .catch(() => toast.error('Could not load conversations'))
            .finally(() => setLoading(false))
    }, [])

    // Open conversation passed via navigation state
    useEffect(() => {
        if (location.state?.convId && convs.length > 0) {
            const c = convs.find((c) => c.id === location.state.convId)
            if (c) openConversation(c)
        }
    }, [convs, location.state]) // eslint-disable-line

    // Subscribe to incoming messages
    useEffect(() => {
        const unsub = onNewMessage(({ conversationId, message }) => {
            if (conversationId === activeConv?.id) {
                setMessages((prev) => [...prev, message])
                setOtherTyping(false)
            }
            setConvs((prev) => prev.map((c) => c.id === conversationId
                ? { ...c, lastMessage: message.text, lastMessageAt: message.sentAt } : c
            ))
        })
        return unsub
    }, [activeConv, onNewMessage])

    // Auto-scroll
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    const openConversation = useCallback(async (conv) => {
        setActive(conv)
        setMessages([])
        setLoadingMsgs(true)
        joinConversation(conv.id)
        try {
            const res = await chatAPI.messages(conv.id, { limit: 50 })
            setMessages(res.data || [])
        } catch { toast.error('Could not load messages') }
        finally { setLoadingMsgs(false) }
    }, [joinConversation])

    const handleSend = (e) => {
        e.preventDefault()
        if (!text.trim() || !activeConv) return
        sendMessage(activeConv.id, text.trim())
        // Optimistic update
        setMessages((prev) => [...prev, { id: Date.now(), senderId: user.uid, text: text.trim(), sentAt: new Date() }])
        setText('')
    }

    const handleTyping = () => {
        if (!activeConv) return
        emitTyping(activeConv.id)
        clearTimeout(typingRef.current)
        typingRef.current = setTimeout(() => emitStopTyping(activeConv.id), 2000)
    }

    const otherUid = (conv) => conv.participants?.find((p) => p !== user?.uid)

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-5rem)] max-w-6xl mx-auto gap-0 glass-card overflow-hidden">
                {/* Conversations sidebar */}
                <div className="w-72 border-r border-surface-border flex flex-col shrink-0">
                    <div className="p-4 border-b border-surface-border">
                        <h2 className="font-bold text-white">Messages</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center pt-8"><Loader /></div>
                        ) : convs.length === 0 ? (
                            <p className="text-center text-slate-500 text-sm mt-8 px-4">No conversations yet. Connect with alumni to start chatting.</p>
                        ) : convs.map((conv) => (
                            <button key={conv.id} onClick={() => openConversation(conv)}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-border/30 transition-colors ${activeConv?.id === conv.id ? 'bg-brand-500/10 border-r-2 border-brand-500' : ''}`}>
                                <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white shrink-0 uppercase">
                                    {otherUid(conv)?.[0] || '?'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{otherUid(conv)}</p>
                                    <p className="text-xs text-slate-500 truncate">{conv.lastMessage || 'Start conversation'}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message pane */}
                <div className="flex flex-col flex-1 min-w-0">
                    {!activeConv ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                            <p className="text-5xl mb-4">💬</p>
                            <p className="font-semibold text-white">Select a conversation</p>
                            <p className="text-sm text-slate-400 mt-2">or go to Alumni Directory to start a new one</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border bg-surface-card/60">
                                <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center font-bold text-white text-sm uppercase">
                                    {otherUid(activeConv)?.[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-sm">{otherUid(activeConv)}</p>
                                    <p className="text-xs text-emerald-400">{otherTyping ? 'typing…' : 'Online'}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {loadingMsgs ? (
                                    <div className="flex justify-center pt-8"><Loader /></div>
                                ) : messages.map((msg) => {
                                    const mine = msg.senderId === user?.uid
                                    return (
                                        <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${mine ? 'bg-gradient-brand text-white rounded-br-sm' : 'bg-surface-border text-slate-200 rounded-bl-sm'
                                                }`}>
                                                <p>{msg.text}</p>
                                                <p className={`text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-slate-500'}`}>
                                                    {new Date(msg.sentAt?.seconds * 1000 || msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                {otherTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-surface-border rounded-2xl rounded-bl-sm px-4 py-2.5">
                                            <div className="flex gap-1 items-center h-4">
                                                {[0, 150, 300].map((d) => <span key={d} className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="flex items-center gap-3 p-4 border-t border-surface-border">
                                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleTyping}
                                    className="input flex-1" placeholder="Type a message…" />
                                <button type="submit" disabled={!text.trim()} className="btn-primary px-5 disabled:opacity-40">Send</button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Chat
