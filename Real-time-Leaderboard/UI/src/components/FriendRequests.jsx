import React, { useState, useEffect } from 'react'
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../services/friendService.js'
import { toast } from 'react-toastify'
import './FriendRequests.css'

export default function FriendRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(new Set())

  useEffect(() => {
    loadFriendRequests()
  }, [])

  const loadFriendRequests = async () => {
    try {
      setLoading(true)
      const response = await getFriendRequests()
      setRequests(response.data || [])
    } catch (error) {
      console.error('Error loading friend requests:', error)
      toast.error('Failed to load friend requests')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (friendId) => {
    try {
      setProcessing(prev => new Set(prev).add(friendId))
      await acceptFriendRequest(friendId)
      toast.success('Friend request accepted!')
      loadFriendRequests() // Reload the list
    } catch (error) {
      console.error('Error accepting friend request:', error)
      toast.error(error.message || 'Failed to accept friend request')
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(friendId)
        return newSet
      })
    }
  }

  const handleReject = async (friendId) => {
    try {
      setProcessing(prev => new Set(prev).add(friendId))
      await rejectFriendRequest(friendId)
      toast.success('Friend request rejected')
      loadFriendRequests() // Reload the list
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      toast.error(error.message || 'Failed to reject friend request')
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(friendId)
        return newSet
      })
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="friend-requests-container">
        <div className="loading-state">
          <div className="loading-icon">⏳</div>
          <div className="loading-text">Loading friend requests...</div>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="friend-requests-container">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-text">No friend requests</div>
          <div className="empty-subtitle">You don't have any pending friend requests</div>
        </div>
      </div>
    )
  }

  return (
    <div className="friend-requests-container">
      <div className="requests-header">
        <h2>Friend Requests</h2>
        <div className="requests-count">
          {requests.length} pending request{requests.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="requests-list">
        {requests.map((request) => {
          const sender = request.sender || request.Sender
          const isProcessing = processing.has(request.id || request.Id)
          
          return (
            <div key={request.id || request.Id} className="request-card">
              <div className="request-avatar">
                <div 
                  className="avatar"
                  style={{
                    backgroundImage: sender?.avatar || sender?.Avatar ? `url(${sender.avatar || sender.Avatar})` : 'none'
                  }}
                >
                  {!(sender?.avatar || sender?.Avatar) && <span>👤</span>}
                </div>
              </div>

              <div className="request-info">
                <div className="request-name">
                  {sender?.userName || sender?.UserName || 'Unknown User'}
                </div>
                <div className="request-time">
                  {formatDate(request.createdAt || request.CreatedAt)}
                </div>
                <div className="request-status">
                  Wants to be your friend
                </div>
              </div>

              <div className="request-actions">
                <button
                  className="btn-accept"
                  onClick={() => handleAccept(request.id || request.Id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳' : '✅'} Accept
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleReject(request.id || request.Id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳' : '❌'} Reject
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
