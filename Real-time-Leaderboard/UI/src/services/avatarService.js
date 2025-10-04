const API_BASE_URL = 'https://localhost:7034/api'

export const uploadAvatar = async (avatarFile) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const formData = new FormData()
    formData.append('avatar', avatarFile)

    const response = await fetch(`${API_BASE_URL}/user/update-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload avatar')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw error
  }
}