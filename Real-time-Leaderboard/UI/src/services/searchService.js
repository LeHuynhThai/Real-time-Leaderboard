const API_BASE_URL = 'https://localhost:7034/api'

export const searchUsers = async (query, limit = 10) => {
  try {
    // Validate input
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters')
    }

    if (limit < 1 || limit > 50) {
      throw new Error('Limit must be between 1 and 50')
    }

    // Build URL with query parameters
    const url = new URL(`${API_BASE_URL}/user/search`)
    url.searchParams.append('query', query.trim())
    url.searchParams.append('limit', limit.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to search users')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error searching users:', error)
    throw error
  }
}

export const searchUsersWithAuth = async (query, limit = 10) => {
  try {
    // Validate input
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters')
    }

    if (limit < 1 || limit > 50) {
      throw new Error('Limit must be between 1 and 50')
    }

    // Get token from localStorage
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication token not found')
    }

    // Build URL with query parameters
    const url = new URL(`${API_BASE_URL}/user/search`)
    url.searchParams.append('query', query.trim())
    url.searchParams.append('limit', limit.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to search users')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error searching users:', error)
    throw error
  }
}

// Debounced search function
export const createDebouncedSearch = (searchFunction, delay = 300) => {
  let timeoutId = null
  
  return (...args) => {
    return new Promise((resolve, reject) => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      // Set new timeout
      timeoutId = setTimeout(async () => {
        try {
          const result = await searchFunction(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}

// Search history management
export const saveSearchHistory = (query) => {
  try {
    const history = getSearchHistory()
    const newHistory = [query, ...history.filter(item => item !== query)].slice(0, 10)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  } catch (error) {
    console.error('Error saving search history:', error)
  }
}

export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('searchHistory')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Error getting search history:', error)
    return []
  }
}

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem('searchHistory')
  } catch (error) {
    console.error('Error clearing search history:', error)
  }
}


export const getUserById = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }
  
      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
  
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to get user')
      }
  
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error getting user by ID:', error)
      throw error
    }
  }