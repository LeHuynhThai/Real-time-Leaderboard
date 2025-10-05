import React, { useEffect, useState } from 'react'
import { getLastMessageWith } from '../services/messageService.js'

export default function ChatList({ currentUserId, friends = [], onSelect }) {
  const [previews, setPreviews] = useState({})

  useEffect(() => {
    let cancelled = false
    const loadPreviews = async () => {
      const entries = await Promise.all(
        friends.map(async (f) => {
          const target = f.receiver?.id ? (f.senderId === currentUserId ? f.receiver : f.sender) : (f.receiver || f.sender)
          const targetId = target?.userId || target?.Id || target?.id
          if (!targetId) return [null, null]
          try {
            const res = await getLastMessageWith(targetId)
            return [targetId, res?.data || null]
          } catch {
            return [targetId, null]
          }
        })
      )
      if (!cancelled) {
        const dict = {}
        for (const [id, data] of entries) {
          if (id) dict[id] = data
        }
        setPreviews(dict)
      }
    }
    loadPreviews()
    return () => { cancelled = true }
  }, [friends, currentUserId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {friends.map((f) => {
        const friendUser = f.senderId === currentUserId ? f.receiver : f.sender
        const id = friendUser?.userId || friendUser?.Id || friendUser?.id
        const last = id ? previews[id] : null
        return (
          <button
            key={f.id}
            onClick={() => onSelect && onSelect(friendUser)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 10,
              border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff', textAlign: 'left', cursor: 'pointer'
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f0f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {friendUser?.avatar ? (
                <img src={friendUser.avatar} alt={friendUser.userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : '👤'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#111' }}>{friendUser?.userName || 'User'}</div>
              <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                {last?.content || 'No messages yet'}
              </div>
            </div>
            {last?.createdAt && (
              <div style={{ fontSize: 11, color: '#999' }}>
                {new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}


