import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { isAuthenticated, getCurrentUser, removeToken, removeUser } from '../services/auth.js'
import { getLeaderboard } from '../services/scoreService.js'

export default function Leaderboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/sign-in')
      return
    }
    const currentUser = getCurrentUser()
    setUser(currentUser)
    fetchLeaderboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const fetchLeaderboard = async () => {
    try {
      // Fetch full leaderboard (pass a large n)
      const res = await getLeaderboard(1000)
      if (res?.success && Array.isArray(res.data)) {
        setLeaderboard(res.data)
      } else {
        setLeaderboard([])
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/sign-in')
  }

  if (!isAuthenticated()) return null

  return (
    <main className="leaderboard-page">
      <div className="leaderboard__wrap" style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
        <Header user={user} onLogout={handleLogout} />

        <section style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 16 }}>Leaderboard</h2>
          {loading ? (
            <div className="loading">Loading leaderboard...</div>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.length === 0 ? (
                <div className="empty">No records</div>
              ) : (
                leaderboard.map((player, index) => (
                  <div key={index} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                    <div className="rank">
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${player.rank}`}
                    </div>
                    <div className="player-info">
                      <span className="username">{player.userName}</span>
                    </div>
                    <div className="score">{player.score?.toLocaleString?.() ?? player.score}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
