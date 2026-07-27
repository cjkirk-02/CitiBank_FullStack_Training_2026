import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Header.css'

type HeaderProps = {
  isLoggedIn: boolean
  isAdmin: boolean
  onLogout: () => void
}

function Header({ isLoggedIn, isAdmin, onLogout }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const servicesLabel = isAdmin ? 'Services' : 'Accounts'

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  return (
    <header className={`app-header ${isAdmin ? 'admin-mode' : ''}`}>
      <div className="brand-block">
        <div className="brand-mark">FB</div>
        <div>
          <p className="eyebrow">Prime Banking</p>
          <h1>FrontBank</h1>
        </div>
      </div>

      <nav className="nav-links" aria-label="Primary navigation">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/about" className="nav-link">
          About
        </Link>
        <Link to="#" className="nav-link">
          Contact
        </Link>
        {(isAdmin || (!isAdmin && isLoggedIn)) && (
          <Link to={isAdmin ? "/services" : "/accounts"} className="nav-link">
            {servicesLabel}
          </Link>
        )}
      </nav>

      <div className="topbar-actions">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="primary-btn login-link">
              Login
            </Link>
            {isLoginPage && (
              <Link to="/signup" className="ghost-btn">
                Sign up
              </Link>
            )}
          </>
        ) : (
          <button type="button" className="ghost-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
