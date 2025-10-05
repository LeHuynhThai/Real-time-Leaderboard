import React, { useEffect, useRef, useState } from 'react'
import { getConversationWith, sendMessage } from '../services/messageService.js'
import MessageBubble from './MessageBubble.jsx'
import { toast } from 'react-toastify'
import './ChatWindow.css'

export default function ChatWindow({ currentUserId, otherUser, onSent }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!otherUser?.userId && !otherUser?.Id && !otherUser?.id) return
    loadConversation()
    // Optional: simple polling
    const interval = setInterval(loadConversation, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUser?.userId, otherUser?.Id, otherUser?.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadConversation = async () => {
    try {
      setLoading(true)
      const targetId = otherUser.userId || otherUser.Id || otherUser.id
      const res = await getConversationWith(targetId)
      if (res?.success) {
        setMessages(res.data || [])
      }
    } catch (error) {
      console.error('Failed to load conversation', error)
      toast.error(error.message || 'Failed to load conversation')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    try {
      setSending(true)
      const targetId = otherUser.userId || otherUser.Id || otherUser.id
      const res = await sendMessage(targetId, input.trim())
      if (res?.success) {
        setInput('')
        await loadConversation()
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


