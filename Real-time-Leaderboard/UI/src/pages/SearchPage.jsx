import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import SearchBar from '../components/SearchBar.jsx'
import SearchResults from '../components/SearchResults.jsx'
import { isAuthenticated, getCurrentUser, removeToken, removeUser } from '../services/auth.js'
import './SearchPage.css'

export default function SearchPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')

  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/sign-in')
      return
    }
    
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [navigate])

  const handleSearchResults = (results) => {
    setSearchResults(results)
    setIsSearching(false)
  }

  const handleQueryChange = (query) => {
    setCurrentQuery(query)
  }

  const handleSearchStart = () => {
    setIsSearching(true)
  }

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/sign-in')
  }

  const handleUserClick = (user) => {
    console.log('Clicked user:', user)
    // Navigate to user profile or show user details
    // navigate(`/profile/${user.userId}`)
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <main className="search-page">
      <div className="search-container">
        <Header user={user} onLogout={handleLogout} />
        
        <div className="search-content">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-icon">
              🔍
            </div>
            <h1 className="hero-title">
              Search Users
            </h1>
            <p className="hero-subtitle">
              Find users by username or email
            </p>
            
            {/* Search Bar */}
            <div className="search-bar-container">
              <div className="search-bar-wrapper">
                <SearchBar 
                  onSearchResults={handleSearchResults}
                  onQueryChange={handleQueryChange}
                  placeholder="Search by username or email..."
                />
              </div>
            </div>
          </div>
          
          {/* Search Results */}
          <div className="results-container">
            <SearchResults 
              results={searchResults}
              loading={isSearching}
              query={currentQuery}
            />
          </div>
        </div>
      </div>
    </main>
  )
}