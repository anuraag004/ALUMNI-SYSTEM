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

    useEffect(() => {
        chatAPI.conversations()
            .then((res) => setConvs(res.data || []))
            .catch(() => toast.error('Could not load conversations'))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (location.state?.convId && convs.length > 0) {
            const c = convs.find((c) => c.id === location.state.convId)
            if (c) openConversation(c)
        }
    }, [convs, location.state])

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
        setText('')
    }

    const handleTyping = () => {
        if (!activeConv) return
        emitTyping(activeConv.id)
        clearTimeout(typingRef.current)
        typingRef.current = setTimeout(() => emitStopTyping(activeConv.id), 2000)
    }

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-5.5rem)] max-w-6xl mx-auto gap-0 glass-card overflow-hidden">
                {/* ── Conversation list ─────────────────────────── */}
                <div className="w-72 border-r border-surface-border/40 flex flex-col shrink-0
                               bg-surface-card/40">
                    <div className="px-5 py-4 border-b border-surface-border/40">
                        <h2 className="font-bold text-white font-display">Messages</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{convs.length} conversation{convs.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center pt-10"><Loader /></div>
                        ) : convs.length === 0 ? (
                            <div className="text-center px-5 pt-12">
                                <p className="text-4xl mb-3">💬</p>
                                <p className="text-slate-400 text-sm font-medium">No conversations yet</p>
                                <p className="text-slate-500 text-xs mt-1">Connect with alumni to start chatting.</p>
                            </div>
                        ) : convs.map((conv) => (
                            <button key={conv.id} onClick={() => openConversation(conv)}
                                className={`w-full text-left px-4 py-3.5 flex items-center gap-3
                                           transition-all duration-200 group
                                           ${activeConv?.id === conv.id
                                               ? 'bg-brand-500/10 border-l-2 border-brand-500'
                                               : 'hover:bg-surface-elevated/40 border-l-2 border-transparent'
                                           }`}>
                                <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center
                                               justify-center text-sm font-bold text-white shrink-0 uppercase
                                               shadow-glow-brand/30 group-hover:scale-105
                                               transition-transform duration-200">
                                    {conv.recipientName?.[0] || '?'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{conv.recipientName || 'Unknown User'}</p>
                                    <p className="text-xs text-slate-500 truncate">{conv.lastMessage || 'Start conversation'}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Message area ─────────────────────────────── */}
                <div className="flex flex-col flex-1 min-w-0">
                    {!activeConv ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                            <div className="h-20 w-20 rounded-3xl bg-brand-500/10 border border-brand-500/20
                                           flex items-center justify-center text-4xl mb-5
                                           animate-float">💬</div>
                            <p className="font-bold text-white text-lg font-display">Select a conversation</p>
                            <p className="text-sm text-slate-400 mt-2 max-w-xs">
                                or go to Alumni Directory to start a new one
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-surface-border/40
                                           bg-surface-card/60">
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center
                                                   justify-center font-bold text-white text-sm uppercase
                                                   shadow-glow-brand/30">
                                        {activeConv.recipientName?.[0] || '?'}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full
                                                   bg-emerald-400 ring-2 ring-surface-card" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-sm">{activeConv.recipientName || 'Unknown User'}</p>
                                    <p className={`text-xs transition-colors duration-300 ${otherTyping ? 'text-brand-400' : 'text-emerald-400'}`}>
                                        {otherTyping ? 'typing…' : 'Online'}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                                {loadingMsgs ? (
                                    <div className="flex justify-center pt-10"><Loader /></div>
                                ) : messages.map((msg) => {
                                    const mine = msg.senderId === user?.uid
                                    return (
                                        <div key={msg.id}
                                             className={`flex animate-fade-in ${mine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm
                                                           shadow-sm transition-all duration-200
                                                           hover:scale-[1.01]
                                                           ${mine
                                                               ? 'bg-gradient-brand text-white rounded-br-sm shadow-glow-brand/20'
                                                               : 'bg-surface-elevated text-slate-200 rounded-bl-sm border border-surface-border/30'
                                                           }`}>
                                                <p className="leading-relaxed">{msg.text}</p>
                                                <p className={`text-[10px] mt-1 ${mine ? 'text-white/50' : 'text-slate-500'}`}>
                                                    {(() => {
                                                        const seconds = msg.sentAt?.seconds ?? msg.sentAt?._seconds;
                                                        const d = seconds ? new Date(seconds * 1000) : new Date(msg.sentAt)
                                                        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                {otherTyping && (
                                    <div className="flex justify-start animate-fade-in">
                                        <div className="bg-surface-elevated rounded-2xl rounded-bl-sm
                                                       px-4 py-3 border border-surface-border/30">
                                            <div className="flex gap-1 items-center">
                                                {[0, 150, 300].map((d) => (
                                                    <span key={d} className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
                                                          style={{ animationDelay: `${d}ms` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend}
                                  className="flex items-center gap-3 p-4 border-t border-surface-border/40
                                            bg-surface-card/40">
                                <input value={text} onChange={(e) => setText(e.target.value)}
                                       onKeyDown={handleTyping}
                                       className="input flex-1" placeholder="Type a message…" />
                                <button type="submit" disabled={!text.trim()}
                                        className="btn-primary px-6 disabled:opacity-30">Send</button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Chat
