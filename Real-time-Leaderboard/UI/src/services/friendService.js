const API_BASE_URL = 'https://localhost:7034/api'

export const sendFriendRequest = async (receiverId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/friend/send-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ReceiverId: receiverId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send friend request')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error sending friend request:', error)
    throw error
  }
}

export const acceptFriendRequest = async (friendId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/friend/accept/${friendId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to accept friend request')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error accepting friend request:', error)
    throw error
  }
}

export const rejectFriendRequest = async (friendId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/friend/reject/${friendId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to reject friend request')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    throw error
  }
}

export const removeFriend = async (friendId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/friend/${friendId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to remove friend')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error removing friend:', error)
    throw error
  }
}

export const getFriendsList = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/friend/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get friends list')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error getting friends list:', error)
    throw error
  }
}