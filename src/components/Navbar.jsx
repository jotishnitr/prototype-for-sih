import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/report', label: 'Report Incident' },
    { to: '/dashboard', label: 'Dashboard' }
  ]

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoMark}>RQ</span>
          ResQNet
        </Link>

        <nav style={styles.nav} className={`navbar-links${open ? ' open' : ''}`}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                ...styles.link,
                color: location.pathname === l.to ? '#fff' : 'rgba(255,255,255,0.7)',
                borderBottom: location.pathname === l.to ? '2px solid #e13c3c' : '2px solid transparent'
              }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <a href="#about" style={{ ...styles.link, color: 'rgba(255,255,255,0.7)' }} onClick={() => setOpen(false)}>
            About
          </a>
        </nav>

        <button style={styles.menuBtn} onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <span style={styles.bar}></span>
          <span style={styles.bar}></span>
          <span style={styles.bar}></span>
        </button>
      </div>
    </header>
  )
}

const styles = {
  header: {
    background: 'var(--navy)',
    borderBottom: '1px solid var(--navy-dark)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#fff',
    fontWeight: 800,
    fontSize: 18
  },
  logoMark: {
    background: 'var(--red)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 800,
    padding: '4px 7px',
    borderRadius: 5,
    letterSpacing: '0.03em'
  },
  nav: {
    display: 'flex',
    gap: 28,
    alignItems: 'center'
  },
  link: {
    fontSize: 14,
    fontWeight: 600,
    padding: '20px 0'
  },
  menuBtn: {
    display: 'none',
    flexDirection: 'column',
    gap: 4,
    background: 'none',
    border: 'none',
    padding: 8
  },
  bar: {
    width: 22,
    height: 2,
    background: '#fff',
    borderRadius: 2
  }
}

export default Navbar
