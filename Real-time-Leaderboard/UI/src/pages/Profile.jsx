import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { isAuthenticated, getCurrentUser, removeToken, removeUser } from '../services/auth.js'
import { getMyScore, getMyRank } from '../services/scoreService.js'
import { toast } from 'react-toastify'
import { uploadAvatar } from '../services/avatarService.js'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userStats, setUserStats] = useState({
    bestScore: 0,
    rank: 0
  })
  const [loading, setLoading] = useState(true)
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/sign-in')
      return
    }
    
    // get current user
    const currentUser = getCurrentUser()
    setUser(currentUser)
    
    // Set avatar preview if user has avatar
    if (currentUser?.avatar) {
      setAvatarPreview(currentUser.avatar)
    }
    
    fetchUserStats()
  }, [navigate])

  const fetchUserStats = async () => {
    try {
      // get my score
      const scoreRes = await getMyScore()
      if (scoreRes?.success && scoreRes?.data) {
        setUserStats(prev => ({
          ...prev,
          bestScore: scoreRes.data.score
        }))
      }

      // get my rank
      const rankRes = await getMyRank()
      if (rankRes?.success && rankRes?.data) {
        setUserStats(prev => ({
          ...prev,
          rank: rankRes.data.rank
        }))
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      toast.error('Cannot fetch user stats')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleSaveAvatar = async () => {
    if (!avatar) return
    
    setUploading(true)
    try {
      const result = await uploadAvatar(avatar)
      toast.success('Successfully updated avatar!')
      
      // Update user data in localStorage
      const currentUser = getCurrentUser()
      const updatedUser = { ...currentUser, avatar: result.data.avatar }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      setAvatar(null)
      setAvatarPreview(null)
    } catch (error) {
      toast.error(error.message || 'An error occurred while uploading avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleCancelAvatar = () => {
    setAvatar(null)
    setAvatarPreview(user?.avatar || null)
  }

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/sign-in')
  }

  if (!isAuthenticated()) {
    return null
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile__wrap" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
          <Header user={user} onLogout={handleLogout} />
          <div className="loading">Loading profile...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="profile-page">
      <div className="profile__wrap" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
        <Header user={user} onLogout={handleLogout} />

        {/* Profile Header */}
        <div className="profile-header" style={{ marginTop: 24, textAlign: 'center' }}>
          <div className="profile-avatar" style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: '#f0f0f0',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            border: '4px solid #007bff',
            backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {!avatarPreview && '👤'}
          </div>
          
          {/* Avatar Upload Section */}
          <div className="avatar-upload" style={{ marginBottom: 24 }}>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <label
              htmlFor="avatar-upload"
              style={{
                display: 'inline-block',
                backgroundColor: '#007bff',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '14px',
                marginRight: 8
              }}
            >
              📷 Select avatar
            </label>
            
            {avatar && (
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={handleSaveAvatar}
                  disabled={uploading}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    marginRight: 8,
                    opacity: uploading ? 0.6 : 1
                  }}
                >
                  {uploading ? 'Uploading...' : '💾 Save'}
                </button>
                <button
                  onClick={handleCancelAvatar}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            )}
          </div>
          
          <h1 style={{ marginBottom: 24, color: '#333' }}>
            {user?.userName || user?.username || 'Player'}
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32
        }}>
          <div className="stat-card" style={{
            backgroundColor: '#fff',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            border: '1px solid #e0e0e0'
          }}>
            <div className="stat-icon" style={{ fontSize: '32px', marginBottom: 12 }}>🏆</div>
            <h3 style={{ margin: '0 0 8px', color: '#333' }}>Best Score</h3>
            <p className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', margin: 0 }}>
              {userStats.bestScore.toLocaleString()}
            </p>
          </div>

          <div className="stat-card" style={{
            backgroundColor: '#fff',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            border: '1px solid #e0e0e0'
          }}>
            <div className="stat-icon" style={{ fontSize: '32px', marginBottom: 12 }}>📊</div>
            <h3 style={{ margin: '0 0 8px', color: '#333' }}>Current Rank</h3>
            <p className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>
              #{userStats.rank || 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions" style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/play')}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: 16,
              marginBottom: 16
            }}
          >
            🎮 Play Game
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: 16
            }}
          >
            📊 View Leaderboard
          </button>
        </div>

        {/* User Info */}
        <div className="user-info" style={{
          backgroundColor: '#f8f9fa',
          padding: 24,
          borderRadius: 12,
          marginTop: 32
        }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>Account information</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Username:</span>
              <span style={{ fontWeight: 'bold' }}>{user?.userName || user?.username}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Email:</span>
              <span style={{ fontWeight: 'bold' }}>{user?.email || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}