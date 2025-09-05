import { Link } from 'react-router-dom'
import '../styles/Home.css'
import Header from '../components/Header.jsx'
import { isAuthenticated, getCurrentUser, removeToken, removeUser } from '../services/auth'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {  
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if(isAuthenticated()) {
      const currentUser = getCurrentUser()
      setUser(currentUser)
      fetchLeaderboard()
    } else {
      navigate('/sign-in')
    }
  }, [navigate])

  const fetchLeaderboard = async () => {
    try {
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/sign-in')
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <main className="home">
      <div className="home__wrap">
        {/* Header Section */}
        <Header user={user} onLogout={handleLogout} />

        {/* Main Dashboard */}
        <div className="dashboard">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <h3>Your Best Score</h3>
                <p className="stat-value">{user?.bestScore || '0'}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Your Rank</h3>
                <p className="stat-value">#{user?.rank || 'N/A'}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎮</div>
              <div className="stat-content">
                <h3>Games Played</h3>
                <p className="stat-value">{user?.gamesPlayed || '0'}</p>
              </div>
            </div>
          </div>

          {/* Play Game Section */}
          <div className="play-game-section" style={{ marginTop: 24, textAlign: 'center' }}>
            <Link to="/play" className="play-game-button">
              <div className="play-icon">🦕</div>
              <div className="play-content">
                <h3>Chơi T-Rex Game</h3>
                <p>Nhảy qua chướng ngại vật và đạt điểm cao!</p>
              </div>
              <div className="play-arrow">→</div>
            </Link>
          </div>

          {/* Leaderboard Preview */}
          <div className="leaderboard-preview">
            <div className="section-header">
              <h2>Top Players</h2>
              <Link to="/leaderboard" className="view-all-link">View All →</Link>
            </div>
            {loading ? (
              <div className="loading">Loading leaderboard...</div>
            ) : (
              <div className="leaderboard-list">
                {leaderboard.map((player, index) => (
                  <div key={player.id} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                    <div className="rank">
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${player.rank}`}
                    </div>
                    <div className="player-info">
                      <span className="username">{player.username}</span>
                    </div>
                    <div className="score">{player.score.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}