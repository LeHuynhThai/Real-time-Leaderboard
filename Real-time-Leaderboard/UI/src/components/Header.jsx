import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getFriendRequests } from '../services/friendService.js'
import './Header.css'


export default function Header({ user, onLogout }) {
  const displayName = user?.userName || user?.username || 'Player'
  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const response = await getFriendRequests()
        setPendingRequests(response.data?.length || 0)
      } catch (error) {
        console.error('Error loading friend requests:', error)
      }
    }

    if (user) {
      loadPendingRequests()
      // Refresh every 30 seconds
      const interval = setInterval(loadPendingRequests, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__brand">
          <Link to="/home" className="brand__link">Leaderboard</Link>
        </div>

        <nav className="site-header__nav">
          <Link to="/home" className="nav__link">Home</Link>
          <Link to="/leaderboard" className="nav__link">Leaderboard</Link>
          <Link to="/play" className="nav__link">Game</Link>
          <Link to="/search" className="nav__link">Search</Link>
          <Link to="/chat" className="nav__link">Chat</Link>
          <Link to="/friends" className="nav__link">
            Friends
            {pendingRequests > 0 && (
              <span className="nav__badge">{pendingRequests}</span>
            )}
          </Link>
        </nav>

        <div className="site-header__user">
          <Link to="/profile" className="user__profile" aria-label="Go to your profile">
            <div className="user__avatar" aria-hidden="true" style={{
              backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {!user?.avatar && '👤'}
            </div>
            <span className="user__name">{displayName}</span>
          </Link>
          <button type="button" className="btn btn--ghost btn--small" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
