import React from 'react'
import './SearchResults.css'
import { sendFriendRequest } from '../services/friendService.js'
import { toast } from 'react-toastify'

export default function SearchResults({ results, loading = false, query = '' }) {
    const handleAddFriend = async (userId, event) => {
        event.stopPropagation()
        try {
          await sendFriendRequest(userId)
          toast.success('Friend request sent!')
        } catch (error) {
          console.error('Error details:', error)
          toast.error(error.message || 'Cannot send friend request')
        }
      }
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-icon">
          ⏳
        </div>
        <div className="loading-text">
          Searching...
        </div>
        <div className="loading-subtitle">
          Looking for users matching "{query}"
        </div>
      </div>
    )
  }

  if (!results || results.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          🔍
        </div>
        <div className="empty-text">
          No users found
        </div>
        <div className="empty-subtitle">
          Try searching with a different term
        </div>
        {query && (
          <div className="empty-query">
            Searched for: "{query}"
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="search-results">
      <div className="results-header">
        <div className="results-title">
          Search Results
        </div>
        <div className="results-count">
          Found {results.length} user{results.length !== 1 ? 's' : ''} matching "{query}"
        </div>
      </div>
      
      <div className="results-list">
        {results.map((user, index) => (
          <div
            key={user.Id || user.id || index}
            className="user-card"
            onClick={() => {
              console.log('Clicked user:', user)
            }}
          >
            <div 
              className="user-avatar"
              style={{
                backgroundImage: user.avatar ? `url(${user.avatar})` : 'none'
              }}
            >
              {!user.avatar && <span style={{ fontSize: '32px' }}>👤</span>}
            </div>

            <div className="user-info">
              <div className="user-name">
                {user.userName || user.UserName}
              </div>
            </div>

            <div className="user-actions">
              <button 
                className="btn-add-friend"
                onClick={(e) => handleAddFriend(user.Id || user.id, e)}
              >
                👥 Add Friend
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}