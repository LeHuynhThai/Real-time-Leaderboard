import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import FriendRequests from '../components/FriendRequests.jsx'
import { isAuthenticated, getCurrentUser, removeToken, removeUser } from '../services/auth.js'
import { getFriendsList, removeFriend } from '../services/friendService.js'
import { toast } from 'react-toastify'
import '../styles/FriendsPage.css'

export default function FriendsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('friends')

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

  const handleRemoveFriend = async (friendId) => {
    try {
      await removeFriend(friendId)
      toast.success('Friend removed successfully')
      fetchFriends() // Reload friends list
    } catch (error) {
      toast.error(error.message || 'Failed to remove friend')
      console.error('Error removing friend:', error)
    }
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
            <h1>Friends & Requests</h1>
            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
                onClick={() => setActiveTab('friends')}
              >
                👥 Friends ({friends.length})
              </button>
              <button 
                className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                📬 Requests
              </button>
            </div>
          </div>

          {activeTab === 'friends' ? (
            loading ? (
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
                      </div>
                      <div className="friend-actions">
                        <button 
                          className="btn-danger"
                          onClick={() => handleRemoveFriend(friend.id)}
                        >
                          ❌ Unfriend
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            <FriendRequests />
          )}
        </div>
      </div>
    </main>
  )
}