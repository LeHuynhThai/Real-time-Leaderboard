import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { isAuthenticated, getCurrentUser, removeToken, removeUser } from '../services/auth.js'
import { getFriendsList } from '../services/friendService.js'
import { toast } from 'react-toastify'
import '../styles/FriendsPage.css'

export default function FriendsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/sign-in')
      return
    }
    
    const currentUser = getCurrentUser()
    setUser(currentUser)
    fetchFriends()
  }, [navigate])

  const fetchFriends = async () => {
    try {
      setLoading(true)
      const result = await getFriendsList()
      if (result?.success) {
        setFriends(result.data || [])
      }
    } catch (error) {
      toast.error('Cannot load friends list')
      console.error('Error fetching friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/sign-in')
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <main className="friends-page">
      <div className="friends-container">
        <Header user={user} onLogout={handleLogout} />
        
        <div className="friends-content">
          <div className="page-header">
            <h1>List of Friends</h1>
            <p>Total friends: {friends.length}</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-icon">⏳</div>
              <div className="loading-text">Loading...</div>
            </div>
          ) : friends.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-text">No friends yet</div>
              <div className="empty-subtitle">Search and make friends with everyone!</div>
              <button 
                className="btn-primary"
                onClick={() => navigate('/search')}
              >
                🔍 Search for friends
              </button>
            </div>
          ) : (
            <div className="friends-list">
              {friends.map((friend) => {
                const friendUser = friend.senderId === user.userId ? friend.receiver : friend.sender
                return (
                  <div key={friend.id} className="friend-card">
                    <div className="friend-avatar">
                      {friendUser.avatar ? (
                        <img src={friendUser.avatar} alt={friendUser.userName} />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div className="friend-info">
                      <h3>{friendUser.userName}</h3>
                      <p className="friend-role">{friendUser.role}</p>
                      <p className="friend-date">
                        Friend since: {new Date(friend.updatedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="friend-actions">
                      <button 
                        className="btn-danger"
                        onClick={() => handleRemoveFriend(friend.id)}
                      >
                        ❌ Cancel friend
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}