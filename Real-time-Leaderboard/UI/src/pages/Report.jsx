import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { isAuthenticated, getCurrentUser, removeToken, removeUser } from '../services/auth.js'
import { getTopPlayersReport } from '../services/scoreService.js'
import '../styles/Report.css'

const PAGE_SIZE = 50

const PERIODS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all-time', label: 'All-Time' },
  { key: 'custom', label: 'Custom' },
]

export default function Report() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [period, setPeriod] = useState('weekly')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [pendingFrom, setPendingFrom] = useState('')
  const [pendingTo, setPendingTo] = useState('')
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [resolvedPeriod, setResolvedPeriod] = useState(null)
  const observerRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/sign-in')
      return
    }
    setUser(getCurrentUser())
  }, [navigate])

  const fetchReport = useCallback(async (skipValue, activePeriod, from, to) => {
    try {
      if (skipValue === 0) setLoading(true)
      else setLoadingMore(true)

      const res = await getTopPlayersReport(activePeriod, from || null, to || null, skipValue, PAGE_SIZE)

      if (res?.success && Array.isArray(res.data)) {
        setPlayers(prev => skipValue === 0 ? res.data : [...prev, ...res.data])
        setTotalCount(res.totalCount || 0)
        setHasMore(res.data.length === PAGE_SIZE && (skipValue + res.data.length) < (res.totalCount || 0))
        if (res.period) setResolvedPeriod(res.period)
      } else {
        if (skipValue === 0) setPlayers([])
        setHasMore(false)
      }
    } catch (e) {
      console.error('Error loading report:', e)
      if (skipValue === 0) setPlayers([])
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Re-fetch when preset period changes (not custom)
  useEffect(() => {
    if (period === 'custom') return
    setSkip(0)
    setPlayers([])
    setHasMore(true)
    fetchReport(0, period, '', '')
  }, [period, fetchReport])

  const handleTabClick = (key) => {
    if (key === period) return
    setPeriod(key)
    setResolvedPeriod(null)
    if (key !== 'custom') {
      setCustomFrom('')
      setCustomTo('')
      setPendingFrom('')
      setPendingTo('')
    }
  }

  const handleApplyCustom = () => {
    if (!pendingFrom || !pendingTo) return
    setCustomFrom(pendingFrom)
    setCustomTo(pendingTo)
    setSkip(0)
    setPlayers([])
    setHasMore(true)
    fetchReport(0, 'custom', pendingFrom, pendingTo)
  }

  const lastElementRef = useCallback((node) => {
    if (loading || loadingMore) return
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        const nextSkip = skip + PAGE_SIZE
        setSkip(nextSkip)
        fetchReport(nextSkip, period, customFrom, customTo)
      }
    })

    if (node) observerRef.current.observe(node)
  }, [loading, loadingMore, hasMore, skip, period, customFrom, customTo, fetchReport])

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/sign-in')
  }

  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (!isAuthenticated()) return null

  return (
    <main className="report-page">
      <div className="report__wrap">
        <Header user={user} onLogout={handleLogout} />

        {/* Period tab bar */}
        <div className="period-tabs">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              className={`period-tab${period === key ? ' active' : ''}`}
              onClick={() => handleTabClick(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom date range panel */}
        {period === 'custom' && (
          <div className="custom-range">
            <label>From</label>
            <input
              type="date"
              value={pendingFrom}
              max={pendingTo || undefined}
              onChange={e => setPendingFrom(e.target.value)}
            />
            <label>To</label>
            <input
              type="date"
              value={pendingTo}
              min={pendingFrom || undefined}
              onChange={e => setPendingTo(e.target.value)}
            />
            <button
              className="custom-range__apply"
              onClick={handleApplyCustom}
              disabled={!pendingFrom || !pendingTo}
            >
              Apply
            </button>
          </div>
        )}

        {/* Meta info */}
        <div className="report-meta">
          {!loading && resolvedPeriod && (
            <>
              <span>
                Period: <strong>{formatDate(resolvedPeriod.from)}</strong> → <strong>{formatDate(resolvedPeriod.to)}</strong>
              </span>
              <span>Showing {players.length} of {totalCount} players</span>
            </>
          )}
        </div>

        {/* Player list */}
        <section style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 16 }}>Top Players</h2>
          {loading ? (
            <div className="loading">Loading report...</div>
          ) : players.length === 0 ? (
            <div className="empty" style={{ color: 'var(--text-secondary)', padding: '24px 0' }}>
              {period === 'custom' && !customFrom
                ? 'Select a date range and press Apply.'
                : 'No players found for this period.'}
            </div>
          ) : (
            <div className="leaderboard-list">
              {players.map((player, index) => {
                const rank = skip > 0 && index < PAGE_SIZE ? index + 1 : index + 1
                const isLast = index === players.length - 1
                return (
                  <div
                    key={`${player.userName}-${index}`}
                    ref={isLast ? lastElementRef : null}
                    className={`leaderboard-item ${rank <= 3 ? 'top-three' : ''}`}
                  >
                    <div className="rank">
                      {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
                    </div>
                    <div className="player-info">
                      <span className="username">{player.userName}</span>
                    </div>
                    <div className="score">{player.score?.toLocaleString?.() ?? player.score}</div>
                    <span className="achieved-at">{formatDate(player.achievedAt)}</span>
                  </div>
                )
              })}
              {loadingMore && (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
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
