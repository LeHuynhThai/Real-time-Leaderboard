import { Link } from 'react-router-dom'
import './Header.css'


export default function Header({ user, onLogout }) {
  const displayName = user?.userName || user?.username || 'Player'

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
        </nav>

        <div className="site-header__user">
          <Link to="/profile" className="user__profile" aria-label="Go to your profile">
            <div className="user__avatar" aria-hidden="true" style={{
              backgroundImage: user?.avatarData ? `url(${user.avatarData})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {!user?.avatarData && '👤'}
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
