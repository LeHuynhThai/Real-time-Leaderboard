import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { isAuthenticated, getCurrentUser, removeToken, removeUser } from '../services/auth.js'
import { getLeaderboard, searchPlayers } from '../services/scoreService.js'

const PAGE_SIZE = 50

export default function Leaderboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [skip, setSkip] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const searchTimeoutRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/sign-in')
      return
    }
    const currentUser = getCurrentUser()
    setUser(currentUser)
    fetchLeaderboard(0)
  }, [navigate])

  useEffect(() => {
    // Set up polling interval to refresh leaderboard every 8 seconds when not searching
    if (searchQuery) {
      return // Don't poll when searching
    }

    const pollInterval = setInterval(() => {
      fetchLeaderboard(0)
    }, 8000)

    return () => {
      clearInterval(pollInterval)
    }
  }, [searchQuery])

  const fetchLeaderboard = async (skipValue) => {
    try {
      if (skipValue === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      const res = await getLeaderboard(skipValue, PAGE_SIZE)
      if (res?.success && Array.isArray(res.data)) {
        if (skipValue === 0) {
          setLeaderboard(res.data)
        } else {
          setLeaderboard(prev => [...prev, ...res.data])
        }
        setTotalCount(res.totalCount || 0)
        setHasMore(res.data.length === PAGE_SIZE && (skipValue + res.data.length) < (res.totalCount || 0))
      } else {
        if (skipValue === 0) {
          setLeaderboard([])
        }
        setHasMore(false)
      }
    } catch (e) {
      console.error('Error loading leaderboard:', e)
      if (skipValue === 0) {
        setLeaderboard([])
      }
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setIsSearching(false)
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const res = await searchPlayers(query)
      if (res?.success && Array.isArray(res.data)) {
        setSearchResults(res.data)
      } else {
        setSearchResults([])
      }
    } catch (e) {
      console.error('Error searching players:', e)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery)
      }, 300)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, performSearch])

  const lastElementRef = useCallback((node) => {
    if (loading || loadingMore || searchQuery.trim()) return
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        const nextSkip = skip + PAGE_SIZE
        setSkip(nextSkip)
        fetchLeaderboard(nextSkip)
      }
    })

    if (node) observerRef.current.observe(node)
  }, [loading, loadingMore, hasMore, skip, searchQuery])

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/sign-in')
  }

  const displayData = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults
    }
    return leaderboard
  }, [searchQuery, searchResults, leaderboard])

  const rankByUser = useMemo(() => {
    const map = new Map()
    displayData.forEach((p) => {
      const key = (p.userName || '').toLowerCase()
      const r = typeof p.rank === 'number' ? p.rank : 0
      if (key) map.set(key, r)
    })
    return map
  }, [displayData])

  if (!isAuthenticated()) return null

  return (
    <main className="leaderboard-page">
      <div className="leaderboard__wrap" style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
        <Header user={user} onLogout={handleLogout} />

        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by player name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              outline: 'none'
            }}
          />
          {isSearching && (
            <span style={{ color: '#666', fontSize: 14 }}>Searching...</span>
          )}
        </div>

        <div style={{ marginTop: 12, fontSize: 14, color: '#666' }}>
          {!searchQuery.trim() ? (
            <span>Showing {leaderboard.length} of {totalCount} players</span>
          ) : (
            <span>Found {searchResults.length} matching player{searchResults.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 16 }}>Leaderboard</h2>
          {loading ? (
            <div className="loading">Loading leaderboard...</div>
          ) : (
            <div className="leaderboard-list">
              {displayData.length === 0 ? (
                <div className="empty">
                  {searchQuery.trim() ? 'No players found matching your search.' : 'No records'}
                </div>
              ) : (
                displayData.map((player, index) => {
                  const key = (player.userName || '').toLowerCase()
                  const r = typeof player.rank === 'number' ? player.rank : (rankByUser.get(key) || index + 1)
                  const isLast = index === displayData.length - 1 && !searchQuery.trim()
                  
                  return (
                    <div 
                      key={`${player.userName}-${index}`} 
                      ref={isLast ? lastElementRef : null}
                      className={`leaderboard-item ${r <= 3 ? 'top-three' : ''}`}
                    >
                      <div className="rank">
                        {r <= 3 ? ['🥇', '🥈', '🥉'][r - 1] : `#${r}`}
                      </div>
                      <div className="player-info">
                        <span className="username">{player.userName}</span>
                      </div>
                      <div className="score">{player.score?.toLocaleString?.() ?? player.score}</div>
                    </div>
                  )
                })
              )}
              {loadingMore && (
                <div style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
                  Loading more players...
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
