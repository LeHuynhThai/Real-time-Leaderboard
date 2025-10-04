import React, { useState, useEffect, useRef } from 'react'
import { searchUsers, createDebouncedSearch, saveSearchHistory, getSearchHistory } from '../services/searchService.js'
import { toast } from 'react-toastify'
import './SearchBar.css'

export default function SearchBar({ onSearchResults, onQueryChange, placeholder = "Search users..." }) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const inputRef = useRef(null)
  const debouncedSearch = useRef(null)

  useEffect(() => {
    // Create debounced search function
    debouncedSearch.current = createDebouncedSearch(async (searchQuery) => {
      if (searchQuery.trim().length < 2) {
        onSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const result = await searchUsers(searchQuery, 10)
        onSearchResults(result.data || [])
        saveSearchHistory(searchQuery)
      } catch (error) {
        toast.error(error.message || 'Search failed')
        onSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    // Load search history
    setSearchHistory(getSearchHistory())
  }, [onSearchResults])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setShowHistory(value.length === 0)
    
    // Notify parent of query change
    if (onQueryChange) {
      onQueryChange(value)
    }
    
    if (debouncedSearch.current) {
      debouncedSearch.current(value)
    }
  }

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery)
    setShowHistory(false)
    if (debouncedSearch.current) {
      debouncedSearch.current(historyQuery)
    }
  }

  const handleClearSearch = () => {
    setQuery('')
    setShowHistory(false)
    onSearchResults([])
  }

  const handleFocus = () => {
    if (query.length === 0) {
      setShowHistory(true)
    }
  }

  const handleBlur = () => {
    // Delay hiding history to allow clicks
    setTimeout(() => setShowHistory(false), 200)
  }

  return (
    <div className="search-bar">
      <div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
        />
        
        {/* Search Icon */}
        <div className={`search-icon ${isSearching ? 'searching' : ''}`}>
          {isSearching ? '⏳' : '🔍'}
        </div>

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClearSearch}
            className="clear-button"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search History Dropdown */}
      {showHistory && searchHistory.length > 0 && (
        <div className="search-history">
          <div className="history-header">
            📚 Recent searches
          </div>
          {searchHistory.map((historyQuery, index) => (
            <button
              key={index}
              onClick={() => handleHistoryClick(historyQuery)}
              className="history-item"
            >
              <span>🔍</span>
              <span>{historyQuery}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}