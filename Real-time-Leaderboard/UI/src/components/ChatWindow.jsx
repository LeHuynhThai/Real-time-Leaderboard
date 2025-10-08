import React, { useEffect, useRef, useState } from 'react'
import { getConversationWith, getLastMessageWith, sendMessage } from '../services/messageService.js'
import { startMessageConnection, getMessageConnection } from '../services/signalr.js'
import MessageBubble from './MessageBubble.jsx'
import { toast } from 'react-toastify'
import './ChatWindow.css'

export default function ChatWindow({ currentUserId, otherUser, onSent }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [lastMessageId, setLastMessageId] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!otherUser?.userId && !otherUser?.Id && !otherUser?.id) return
    loadConversation(true)
    let isMounted = true
    let connRef
    const targetId = otherUser.userId || otherUser.Id || otherUser.id
    const handler = (senderId, message) => {
      if (!isMounted) return
      if (senderId === targetId) {
        ;(async () => {
          try {
            const res = await getLastMessageWith(targetId)
            const newId = res?.data?.id || null
            if (newId && newId !== lastMessageId) {
              await loadConversation(false)
            }
          } catch (e) {
          }
        })()
      }
    }
    ;(async () => {
      try {
        await startMessageConnection()
        connRef = getMessageConnection()
        if (connRef?.on) {
          connRef.on('ReceiveMessage', handler)
        }
      } catch (e) {
        console.error('SignalR connection error:', e)
      }
    })()
    return () => {
      isMounted = false
      if (connRef?.off) {
        connRef.off('ReceiveMessage', handler)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUser?.userId, otherUser?.Id, otherUser?.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadConversation = async (withSpinner = false) => {
    try {
      if (withSpinner) setLoading(true)
      const targetId = otherUser.userId || otherUser.Id || otherUser.id
      const res = await getConversationWith(targetId)
      if (res?.success) {
        setMessages(res.data || [])
        const last = (res.data || []).at(-1)
        setLastMessageId(last ? last.id : null)
      }
    } catch (error) {
      console.error('Failed to load conversation', error)
      toast.error(error.message || 'Failed to load conversation')
    } finally {
      if (withSpinner) setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    try {
      setSending(true)
      const targetId = otherUser.userId || otherUser.Id || otherUser.id
      const optimistic = {
        id: `local-${Date.now()}`,
        senderId: currentUserId,
        receiverId: targetId,
        content: input.trim(),
        createdAt: new Date().toISOString()
      }
      // cập nhật UI ngay lập tức
      setMessages(prev => [...prev, optimistic])
      setInput('')
      const res = await sendMessage(targetId, optimistic.content)
      if (res?.success) {
        // tải lại nhẹ nhàng để đồng bộ ID thật (không spinner)
        await loadConversation(false)
        onSent && onSent(res.data)
      }
    } catch (error) {
      console.error('Failed to send message', error)
      toast.error(error.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat-window">
      <div className="chat-window__header">
        <strong>{otherUser?.userName || otherUser?.UserName || 'Chat'}</strong>
      </div>

      <div ref={scrollRef} className="chat-window__body">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#666' }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666' }}>No messages yet</div>
        ) : (
          messages.map(m => (
            <MessageBubble key={m.id} message={m} isOwn={m.senderId === currentUserId} />
          ))
        )}
      </div>

      <div className="chat-window__footer">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          className="chat-window__input"
        />
        <button onClick={handleSend} disabled={sending || !input.trim()} className="chat-window__send">
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}


