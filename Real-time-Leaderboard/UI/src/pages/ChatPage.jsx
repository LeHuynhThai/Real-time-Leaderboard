import React, { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import ChatList from '../components/ChatList.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import { isAuthenticated, getCurrentUser, removeToken, removeUser } from '../services/auth.js'
import { getFriendsList } from '../services/friendService.js'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import '../styles/ChatPage.css'

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
    <main className="chat-page">
      <div className="container">
        <Header user={user} onLogout={handleLogout} />

        <div className="chat-layout">
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">Chats</div>
            <div className="chat-list-container chat-list-scroll">
              {loading ? (
                <div className="loading-text">Loading...</div>
              ) : (
                <ChatList currentUserId={user?.userId} friends={friends} onSelect={setSelected} />
              )}
            </div>
          </div>

          <div className="chat-main">
            {selected ? (
              <ChatWindow currentUserId={user?.userId} otherUser={selected} onSent={() => {}} />
            ) : (
              <div className="chat-placeholder">
                Select a chat to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}


