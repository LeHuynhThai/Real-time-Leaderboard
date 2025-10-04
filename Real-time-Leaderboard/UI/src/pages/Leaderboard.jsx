import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { isAuthenticated, getCurrentUser, removeToken, removeUser } from '../services/auth.js'
import { getLeaderboard } from '../services/scoreService.js'
import { startLeaderboardConnection, stopLeaderboardConnection, getConnection } from '../services/signalr.js'
import { toast } from 'react-toastify'

export default function Leaderboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/sign-in')
      return
    }
    const currentUser = getCurrentUser()
    setUser(currentUser)
    fetchLeaderboard()
  }, [navigate])

  useEffect(() => {
    const setupSignalR = async () => {
      try {
        await startLeaderboardConnection()

        const conn = getConnection()

        conn.on('LeaderboardUpdate', async (data) => {
          // show toast notification
          toast.info(`${data.username} has scored ${data.score}!`, {
            position: 'top-right',
            autoClose: 3000,
          })

          // fetch leaderboard
          await fetchLeaderboard()
        })
      } catch (error) {
        console.error('SignalR connection failed in Leaderboard:', error)
      }
    }
    setupSignalR()

    return () => {
      const conn = getConnection()
      if (conn) {
        conn.off('LeaderboardUpdate')
      }
      stopLeaderboardConnection()
    }
  }, [])


  const fetchLeaderboard = async () => {
    try {
      const res = await getLeaderboard()
      if (res?.success && Array.isArray(res.data)) {
        setLeaderboard(res.data)
      } else {
        setLeaderboard([])
      }
    } catch (e) {
      console.error('Error loading leaderboard:', e)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

const rankByUser = useMemo(() => {
  const map = new Map()
  leaderboard.forEach((p, i) => {
    const key = (p.userName || '').toLowerCase()
    const r = typeof p.rank === 'number' ? p.rank : (i + 1)
    if (key) map.set(key, r)
  })
  return map
}, [leaderboard])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return leaderboard
    return leaderboard.filter(x=> (x.userName || '').toLowerCase().includes(term))
  }, [q, leaderboard])

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

        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="Tìm theo tên người chơi..."
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              outline: 'none'
            }}
          />
        </div>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 16 }}>Leaderboard</h2>
          {loading ? (
            <div className="loading">Loading leaderboard...</div>
          ) : (
            <div className="leaderboard-list">
            {filtered.length === 0 ? ( 
              <div className="empty">No records</div>
            ) : (
              filtered.map((player, index) => {
                const key = (player.userName || '').toLowerCase()
                const r = typeof player.rank === 'number' ? player.rank : (rankByUser.get(key) ?? (index + 1))
                return (
                  <div key={`${player.userName}-${index}`} className={`leaderboard-item ${r <= 3 ? 'top-three' : ''}`}>
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
          </div>
          )}
        </section>
      </div>
    </main>
  )
}
