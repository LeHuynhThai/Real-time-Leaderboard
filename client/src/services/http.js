const BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7034'

export async function http(path, options = {}) {

  const token = localStorage.getItem('token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
    ...options,
  }

  const response = await fetch(`${BASE_URL}${path}`, config)

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `HTTP ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
} 