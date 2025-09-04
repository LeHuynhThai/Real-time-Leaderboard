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
    return response
  } catch (error) {
    throw new Error(error.message || 'Error logging in')
  }
}

export async function logout() {
  try {
    const response = await http('/api/user/logout', {
      method: 'POST',
    })
    return response
  } catch (error) {
    throw new Error(error.message || 'Error logging out')
  }
}

// Lưu token vào localStorage
export function setToken(token) {
  localStorage.setItem('token', token)
}

// Lấy token từ localStorage
export function getToken() {
  return localStorage.getItem('token')
}

// Xóa token
export function removeToken() {
  localStorage.removeItem('token')
}

// Kiểm tra đã đăng nhập chưa
export function isAuthenticated() {
  return !!getToken()
}

// Lưu thông tin user vào localStorage
export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
}

// Lấy thông tin user từ localStorage
export function getCurrentUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// Xóa thông tin user
export function removeUser() {
  localStorage.removeItem('user')
}