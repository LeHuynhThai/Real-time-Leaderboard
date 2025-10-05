import React, { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import ChatList from '../components/ChatList.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import { isAuthenticated, getCurrentUser, removeToken, removeUser } from '../services/auth.js'
import { getFriendsList } from '../services/friendService.js'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function ChatPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [friends, setFriends] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/sign-in')
      return
    }
    const u = getCurrentUser()
    setUser(u)
    loadFriends()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadFriends = async () => {
    try {
      setLoading(true)
      const res = await getFriendsList()
      if (res?.success) setFriends(res.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/sign-in')
  }

  if (!isAuthenticated()) return null

  return (
    <main className="chat-page" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <Header user={user} onLogout={handleLogout} />

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, marginTop: 24 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Chats</div>
            {loading ? (
              <div style={{ color: '#666' }}>Loading...</div>
            ) : (
              <ChatList currentUserId={user?.userId} friends={friends} onSelect={setSelected} />
            )}
          </div>

          <div style={{ minHeight: 520 }}>
            {selected ? (
              <ChatWindow currentUserId={user?.userId} otherUser={selected} onSent={() => {}} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}>
                Select a chat to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}


