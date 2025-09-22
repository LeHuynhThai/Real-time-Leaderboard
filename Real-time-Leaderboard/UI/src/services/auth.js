import { http } from './http'

export async function register(userData) {
  try {
    const response = await http('/api/user/register', {
      method: 'POST',
      body: JSON.stringify(
        {
          Username: userData.username,
          Email: userData.email,
          Password: userData.password,
        }
      ),
    })
    return response
  } catch (error) {
    throw new Error(error.message || 'Error registering user')
  }
}

export async function login(username, password) {
  try {
    const response = await http('/api/user/login', {
      method: 'POST',
      body: JSON.stringify(
        {
          Username: username,
          Password: password,
        }
      ),
    })
    
    // Save JWT token and user data
    if (response.success && response.data) {
      setToken(response.data.token)
      setUser(response.data.user)
    }
    
    return response
  } catch (error) {
    throw new Error(error.message || 'Error logging in')
  }
}

export async function logout() {
  try {
    // Call API logout endpoint (optional with JWT)
    await http('/api/user/logout', {
      method: 'POST',
    })
  } catch (error) {
    // Continue with client-side logout even if API call fails
    console.warn('Logout API call failed:', error.message)
  } finally {
    // Always clean up client-side data
    clearAuth()
  }
}

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function getToken() {
  return localStorage.getItem('token')
}

export function removeToken() {
  localStorage.removeItem('token')
}

export function isAuthenticated() {
  return !!getToken()
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
}

export function getCurrentUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export function removeUser() {
  localStorage.removeItem('user')
}

export function clearAuth() {
  removeToken()
  removeUser()
}