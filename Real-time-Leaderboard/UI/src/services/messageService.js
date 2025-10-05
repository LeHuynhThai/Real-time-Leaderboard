const API_BASE_URL = 'https://localhost:7034/api'

export const sendMessage = async (receiverId, content) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ReceiverId: receiverId, Content: content })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send message')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export const getConversationWith = async (userId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/message/with/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get conversation')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting conversation:', error)
    throw error
  }
}

export const getLastMessageWith = async (userId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/message/with/${userId}/last`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get last message')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting last message:', error)
    throw error
  }
}


