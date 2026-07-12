import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

// ─── Logo ──────────────────────────────────────────────
function Logo() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/')}
      className="flex items-center gap-1.5"
      style={{ background: 'none', border: 'none', padding: 0 }}
    >
      <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Sk</span>
      <motion.svg
        width="22"
        height="22"
        viewBox="0 0 100 100"
        whileHover={{ rotate: 360, scale: 1.15 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 -1px' }}
      >
        <circle cx="50" cy="50" r="10" fill="#4f8ef7" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#4f8ef7" strokeWidth="10" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#4f8ef7" strokeWidth="10" />
      </motion.svg>
      <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px' }}>pe</span>
    </button>
  )
}

// ─── Avatar Dropdown ───────────────────────────────────
function AvatarDropdown({ user, logout, handleAdminRedirect }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  const initials = (user?.displayName || user?.email || 'U')
    .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const items = [
    { label: '🎯 My PathReport',    action: () => navigate('/result') },
    { label: '⚡ Retake Test',       action: () => { sessionStorage.setItem('skope_retake_active', 'true'); sessionStorage.setItem('skope_assessment_started', 'true'); navigate('/form') } },
    { label: '👤 Profile',           action: () => navigate('/profile') },
  ]

  if (user?.email?.toLowerCase() === 'atiwary253@gmail.com') {
    items.push({ label: '🔑 Admin Dashboard', action: handleAdminRedirect })
  }

  items.push({ divider: true })
  items.push({ label: '🚪 Sign Out',          action: logout, danger: true })

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Your account"
        style={{
          width: 36, height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f8ef7, #a855f7)',
          border: `2px solid ${open ? 'rgba(79,142,247,0.7)' : 'rgba(79,142,247,0.3)'}`,
          color: '#fff',
          fontFamily: 'Sora, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: open ? '0 0 20px rgba(79,142,247,0.45)' : 'none',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {user?.photoURL
          ? <img src={user.photoURL} alt="User profile avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          : initials
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16,1,0.3,1] }}
            style={{
              position: 'absolute', right: 0, top: 'calc(100% + 10px)',
              width: 210, borderRadius: 16, overflow: 'hidden', zIndex: 100,
              background: 'rgba(17,17,24,0.97)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,142,247,0.08)',
            }}
          >
            {/* User info */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(241,245,249,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.displayName || 'Student'}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(241,245,249,0.3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || user?.phoneNumber || 'Guest'}
              </p>
            </div>

            {/* Menu items */}
            <div style={{ padding: '6px 0' }}>
              {items.map((item, i) => item.divider ? (
                <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 12px' }} />
              ) : (
                <button
                  key={i}
                  onClick={() => { setOpen(false); item.action() }}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '10px 16px',
                    background: 'none', border: 'none',
                    fontFamily: 'Inter, sans-serif', fontSize: 13,
                    color: item.danger ? '#f87171' : 'rgba(241,245,249,0.75)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Mobile Menu Sheet ─────────────────────────────────
function MobileMenu({ open, onClose, user, logout, handleAdminRedirect }) {
  const navigate = useNavigate()
  const go = (path) => { onClose(); navigate(path) }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 95, borderRadius: '28px 28px 0 0',
              padding: '24px 24px 40px',
              background: 'rgba(12,12,20,0.98)',
              backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Drag handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', margin: '0 auto 24px' }} />

            {[
              { label: 'Home',              path: '/' },
              { label: 'Find My Career Vibe', path: user ? '/form' : '/login' },
              { label: 'My PathReport',       path: user ? '/result' : '/login' },
              user && { label: 'Profile',     path: '/profile' },
            ].filter(Boolean).map(item => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '16px 0',
                  background: 'none', border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontFamily: "'Clash Display', sans-serif", fontSize: 22, fontWeight: 600,
                  color: 'rgba(241,245,249,0.8)',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(241,245,249,0.8)'}
              >
                {item.label}
              </button>
            ))}

            <a
              href="https://discord.gg/ANeWgGASWm"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 0',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontFamily: "'Clash Display', sans-serif",
                fontSize: 22,
                fontWeight: 600,
                color: '#5865F2',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c1-.73,2-1.5,2.92-2.3a75.7,75.7,0,0,0,85.22,0c.9.8,1.91,1.57,2.92,2.3a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.6-18.83C129.58,49.38,123.38,26.54,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
              </svg>
              Join Discord
            </a>

            {user && user.email?.toLowerCase() === 'atiwary253@gmail.com' && (
              <button
                onClick={() => { onClose(); handleAdminRedirect() }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '16px 0',
                  background: 'none', border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontFamily: "'Clash Display', sans-serif", fontSize: 22, fontWeight: 600,
                  color: '#4f8ef7',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
              >
                🔑 Admin Dashboard
              </button>
            )}

            {user && (
              <button
                onClick={() => { onClose(); logout() }}
                style={{
                  marginTop: 16, width: '100%', textAlign: 'center',
                  padding: '12px 0',
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 12,
                  fontFamily: 'Inter, sans-serif', fontSize: 13,
                  color: '#f87171', cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main Navbar ───────────────────────────────────────
export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleAdminRedirect = () => {
    navigate('/admin/login')
  }
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16,1,0.3,1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 30, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '20px 16px 0',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%', maxWidth: 960,
            padding: '10px 20px',
            borderRadius: 100,
            background: scrolled ? 'rgba(12,12,20,0.88)' : 'rgba(12,12,20,0.35)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: scrolled ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.05)',
            boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
            transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Logo */}
          <Logo />

          {/* Desktop center nav — only when logged in */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden-mobile">
              {[
                { label: 'Home',       path: '/' },
                { label: 'PathReport', path: '/result' },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    background: 'none', border: 'none',
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                    color: isActive(item.path) ? '#f1f5f9' : 'rgba(241,245,249,0.45)',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    position: 'relative', paddingBottom: 2,
                  }}
                  onMouseEnter={e => { if (!isActive(item.path)) e.currentTarget.style.color = 'rgba(241,245,249,0.85)' }}
                  onMouseLeave={e => { if (!isActive(item.path)) e.currentTarget.style.color = 'rgba(241,245,249,0.45)' }}
                  className="hidden md:block"
                >
                  {item.label}
                  {isActive(item.path) && (
                    <span style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: 1.5, borderRadius: 2,
                      background: 'linear-gradient(90deg, #4f8ef7, #a855f7)',
                    }} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Discord Community Button — desktop only */}
            <a
              href="https://discord.gg/ANeWgGASWm"
              target="_blank"
              rel="noopener noreferrer"
              title="Join our Discord community"
              className="hidden sm:flex"
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: 'rgba(241,245,249,0.45)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#5865F2';
                e.currentTarget.style.background = 'rgba(88,101,242,0.1)';
                e.currentTarget.style.borderColor = 'rgba(88,101,242,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(241,245,249,0.45)';
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c1-.73,2-1.5,2.92-2.3a75.7,75.7,0,0,0,85.22,0c.9.8,1.91,1.57,2.92,2.3a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.6-18.83C129.58,49.38,123.38,26.54,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
              </svg>
            </a>

            {user ? (
              <>
                {/* Retake Test — desktop only */}
                <button
                  onClick={() => { sessionStorage.setItem('skope_retake_active', 'true'); navigate('/form') }}
                  className="hidden sm:block"
                  style={{
                    fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 600,
                    color: 'rgba(241,245,249,0.6)',
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '7px 16px', borderRadius: 100,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(241,245,249,0.6)'; e.currentTarget.style.background = 'none' }}
                >
                  Retake Test
                </button>

                {/* Avatar */}
                <AvatarDropdown user={user} logout={logout} handleAdminRedirect={handleAdminRedirect} />
              </>
            ) : (
              <>
                {/* Sign in link — desktop */}
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:block"
                  style={{
                    background: 'none', border: 'none',
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                    color: 'rgba(241,245,249,0.45)',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    marginRight: 4,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(241,245,249,0.45)'}
                >
                  Sign in
                </button>

                {/* Get Started CTA */}
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 600,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #4f8ef7, #a855f7)',
                    border: 'none',
                    padding: '9px 20px', borderRadius: 100,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 0 0 rgba(79,142,247,0)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(79,142,247,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 0 rgba(79,142,247,0)' }}
                >
                  Get Started
                </button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                display: 'none', flexDirection: 'column', gap: 5,
                padding: 8, background: 'none', border: 'none', cursor: 'pointer',
              }}
              className="hamburger-btn"
            >
              {[0,1,2].map(i => (
                <span key={i} style={{ display: 'block', width: 20, height: 1.5, background: 'rgba(241,245,249,0.6)', borderRadius: 2 }} />
              ))}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hamburger mobile-only via CSS */}
      <style>{`
        @media (max-width: 640px) {
          .hamburger-btn { display: flex !important; }
        }
      `}</style>

      {/* Mobile menu */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        logout={logout}
        handleAdminRedirect={handleAdminRedirect}
      />
    </>
  )
}
