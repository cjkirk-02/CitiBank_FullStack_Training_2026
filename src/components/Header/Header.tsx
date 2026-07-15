import { Link } from 'react-router-dom'
import './Header.css'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '#' },
  { label: 'Contact', path: '#' },
  { label: 'Services', path: '/services' },
]

function Header() {
  return (
    <header className="app-header">
      <div className="brand-block">
        <div className="brand-mark">FB</div>
        <div>
          <p className="eyebrow">Prime Banking</p>
          <h1>FrontBank</h1>
        </div>
      </div>

      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link key={item.label} to={item.path} className="nav-link">
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="topbar-actions">
        <button type="button" className="ghost-btn">
          Transfer
        </button>
        <button type="button" className="primary-btn">
          Account
        </button>
      </div>
    </header>
  )
}

export default Header
