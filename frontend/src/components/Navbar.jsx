import React from 'react'
import { NavLink } from 'react-router-dom'

const styles = {
  navbar: {
    background: '#fff',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: 56,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 600,
    fontSize: 15,
    color: 'var(--text-primary)',
  },
  brandIcon: {
    width: 30,
    height: 30,
    background: 'var(--accent)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 14,
  },
  tabs: {
    display: 'flex',
    gap: 2,
    alignItems: 'center',
  },
  tab: {
    padding: '6px 16px',
    borderRadius: 6,
    fontWeight: 500,
    fontSize: 13.5,
    color: 'var(--text-secondary)',
    transition: 'all 0.15s',
    cursor: 'pointer',
  },
  composeBtn: {
    background: 'var(--accent)',
    color: '#fff',
    padding: '7px 18px',
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 13.5,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'background 0.15s',
  }
}

const activeStyle = {
  background: 'var(--accent-light)',
  color: 'var(--accent)',
}

export default function Navbar({ onCompose }) {
  return (
    <nav style={styles.navbar}>
      <div style={styles.inner}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>✉️</div>
          Email Notification
        </div>

        <div style={styles.tabs}>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({ ...styles.tab, ...(isActive ? activeStyle : {}) })}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/emails"
            style={({ isActive }) => ({ ...styles.tab, ...(isActive ? activeStyle : {}) })}
          >
            All Mails
          </NavLink>
          <NavLink
            to="/templates"
            style={({ isActive }) => ({ ...styles.tab, ...(isActive ? activeStyle : {}) })}
          >
            Templates
          </NavLink>
        </div>

        <button
          style={styles.composeBtn}
          onClick={onCompose}
          onMouseEnter={e => e.target.style.background = 'var(--accent-hover)'}
          onMouseLeave={e => e.target.style.background = 'var(--accent)'}
        >
          Compose
        </button>
      </div>
    </nav>
  )
}
