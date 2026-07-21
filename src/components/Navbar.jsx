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
      className="flex items-center gap-1.5 group cursor-pointer"
      style={{ background: 'none', border: 'none', padding: 0 }}
    >
      <span className="font-clash text-[22px] font-bold text-white tracking-[-0.5px] group-hover:text-indigo-400 transition-colors">
        Sk
      </span>
      <motion.svg
        width="24"
        height="24"
        viewBox="0 0 100 100"
        whileHover={{ rotate: 360, scale: 1.2 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="inline-block mx-[-1px]"
      >
        <circle cx="50" cy="50" r="10" fill="#4f8ef7" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#a855f7" strokeWidth="10" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#ec4899" strokeWidth="10" />
      </motion.svg>
      <span className="font-clash text-[22px] font-bold text-white tracking-[-0.5px] group-hover:text-indigo-400 transition-colors">
        pe
      </span>
    </button>
  )
}

// ─── Avatar Dropdown ───────────────────────────────────
function AvatarDropdown({ user, logout, handleAdminRedirect }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  const initials = (user?.displayName || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const items = [
    { label: '🎯 My PathReport', action: () => navigate('/result') },
    {
      label: '⚡ Retake Diagnostic',
      action: () => {
        sessionStorage.setItem('skope_retake_active', 'true')
        sessionStorage.setItem('skope_assessment_started', 'true')
        navigate('/form')
      },
    },
    { label: '👤 Profile & Settings', action: () => navigate('/profile') },
  ]

  if (user?.email?.toLowerCase() === 'atiwary253@gmail.com') {
    items.push({ label: '🔑 Admin Dashboard', action: handleAdminRedirect })
  }

  items.push({ divider: true })
  items.push({ label: '🚪 Sign Out', action: logout, danger: true })

  return (
    <div ref={dropRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Your account"
        className={`w-9 h-9 rounded-full text-white font-sora text-[13px] font-bold flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden flex-shrink-0 ${
          open ? 'ring-2 ring-indigo-500 shadow-[0_0_20px_rgba(79,142,247,0.5)]' : 'ring-1 ring-white/20'
        }`}
        style={{
          background: 'linear-gradient(135deg, #4f8ef7, #a855f7)',
        }}
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="User profile avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          initials
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+12px)] w-56 rounded-2xl overflow-hidden z-[100] bg-[#0c0a1a]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
          >
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <p className="font-sora text-[13px] font-semibold text-white truncate">
                {user?.displayName || 'Student'}
              </p>
              <p className="font-inter text-[11px] text-white/40 mt-0.5 truncate">
                {user?.email || user?.phoneNumber || 'Guest Account'}
              </p>
            </div>

            <div className="py-1.5">
              {items.map((item, i) =>
                item.divider ? (
                  <div key={i} className="h-[1px] bg-white/5 my-1.5 mx-3" />
                ) : (
                  <button
                    key={i}
                    onClick={() => {
                      setOpen(false)
                      item.action()
                    }}
                    className={`w-full text-left px-4 py-2.5 font-inter text-[13px] transition-colors cursor-pointer flex items-center justify-between ${
                      item.danger
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              )}
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
  const go = (path) => {
    onClose()
    navigate(path)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[95] rounded-t-[32px] p-6 pb-10 bg-[#0a0814]/98 backdrop-blur-3xl border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
          >
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-6" />

            {[
              { label: '🏠 Home', path: '/' },
              { label: '⚡ Find My Career Vibe', path: user ? '/form' : '/login' },
              { label: '🎯 My PathReport', path: user ? '/result' : '/login' },
              user && { label: '👤 Profile & Settings', path: '/profile' },
            ]
              .filter(Boolean)
              .map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className="w-full text-left py-4 border-b border-white/5 font-clash text-[20px] font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}

            <a
              href="https://discord.gg/ANeWgGASWm"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-3 py-4 border-b border-white/5 font-clash text-[20px] font-semibold text-[#5865F2]"
            >
              <svg width="22" height="22" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c1-.73,2-1.5,2.92-2.3a75.7,75.7,0,0,0,85.22,0c.9.8,1.91,1.57,2.92,2.3a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.6-18.83C129.58,49.38,123.38,26.54,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
              </svg>
              Join Discord Community
            </a>

            {user && user.email?.toLowerCase() === 'atiwary253@gmail.com' && (
              <button
                onClick={() => {
                  onClose()
                  handleAdminRedirect()
                }}
                className="w-full text-left py-4 border-b border-white/5 font-clash text-[20px] font-semibold text-indigo-400 cursor-pointer"
              >
                🔑 Admin Dashboard
              </button>
            )}

            {user && (
              <button
                onClick={() => {
                  onClose()
                  logout()
                }}
                className="mt-6 w-full py-3 bg-red-500/10 border border-red-500/30 rounded-xl font-inter text-[14px] font-semibold text-red-400 cursor-pointer"
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
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleAdminRedirect = () => {
    navigate('/admin/login')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 pt-5"
      >
        <div
          className={`flex items-center justify-between w-full max-w-[960px] px-5 py-2.5 rounded-full transition-all duration-500 ${
            scrolled
              ? 'glass-pill bg-[#0a0814]/85 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
              : 'bg-[#0a0814]/40 border border-white/5 backdrop-blur-lg'
          }`}
        >
          {/* Brand Logo */}
          <Logo />

          {/* Center Links (Logged in or Desktop Nav) */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className={`font-jakarta text-[13px] font-semibold transition-colors relative py-1 cursor-pointer ${
                isActive('/') ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              Home
              {isActive('/') && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              )}
            </button>

            {user && (
              <button
                onClick={() => navigate('/result')}
                className={`font-jakarta text-[13px] font-semibold transition-colors relative py-1 cursor-pointer ${
                  isActive('/result') ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                PathReport
                {isActive('/result') && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                )}
              </button>
            )}

            <a
              href="https://discord.gg/ANeWgGASWm"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#5865F2] font-mono text-[11px] font-semibold hover:bg-[#5865F2]/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2] animate-pulse" />
              Community
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Discord Icon */}
            <a
              href="https://discord.gg/ANeWgGASWm"
              target="_blank"
              rel="noopener noreferrer"
              title="Join Discord"
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white/50 hover:text-[#5865F2] hover:bg-[#5865F2]/10 hover:border-[#5865F2]/40 transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c1-.73,2-1.5,2.92-2.3a75.7,75.7,0,0,0,85.22,0c.9.8,1.91,1.57,2.92,2.3a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.6-18.83C129.58,49.38,123.38,26.54,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
              </svg>
            </a>

            {user ? (
              <>
                <button
                  onClick={() => {
                    sessionStorage.setItem('skope_retake_active', 'true')
                    navigate('/form')
                  }}
                  className="hidden sm:inline-flex font-sora text-[12px] font-semibold text-white/70 hover:text-white px-3.5 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                >
                  Retake Test
                </button>
                <AvatarDropdown
                  user={user}
                  logout={logout}
                  handleAdminRedirect={handleAdminRedirect}
                />
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:inline-block font-jakarta text-[13px] font-semibold text-white/60 hover:text-white transition-colors cursor-pointer mr-1"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary text-[13px] px-5 py-2 font-sora"
                >
                  Get Started
                </button>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex md:hidden flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 cursor-pointer border-none bg-transparent"
              aria-label="Open Mobile Menu"
            >
              <span className="w-5 h-0.5 bg-white/70 rounded-full" />
              <span className="w-5 h-0.5 bg-white/70 rounded-full" />
              <span className="w-3 h-0.5 bg-white/70 rounded-full ml-auto" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Sheet */}
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
