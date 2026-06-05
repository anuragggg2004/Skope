import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout, pathReport } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = async () => {
    try {
      await logout()
      setShowDropdown(false)
      navigate('/')
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const hasReport = !!pathReport

  const getInitials = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(79,142,247,0.08)] backdrop-blur-[16px] bg-[rgba(8,11,20,0.75)]">
      <div className="max-w-[1100px] mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
          {/* Icon mark */}
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-blue to-purple flex items-center justify-center shadow-[0_2px_10px_rgba(79,142,247,0.2)] group-hover:shadow-[0_2px_18px_rgba(79,142,247,0.35)] transition-shadow duration-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2.5" fill="none" />
              <line x1="15" y1="15" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          {/* Wordmark */}
          <span className="font-sora text-[18px] font-bold tracking-[-0.5px]">
            <span className="text-white">Sk</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue to-purple">o</span>
            <span className="text-white">pe</span>
          </span>
        </div>

        {/* Auth / CTA Container */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              {/* Conditional Nav Buttons */}
              {hasReport && (
                <button
                  onClick={() => navigate('/result')}
                  className="font-dm text-[12px] font-semibold text-[rgba(240,242,255,0.65)] hover:text-white px-3 py-2 cursor-pointer transition-colors duration-200"
                >
                  My Report
                </button>
              )}
              
              <button
                onClick={() => navigate('/form')}
                className="font-sora text-[12px] font-semibold bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.06)] text-white px-4 py-2 rounded-[10px] cursor-pointer transition-all duration-300"
              >
                New Diagnostic
              </button>

              {/* Avatar Button */}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue to-purple p-[1.5px] flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(79,142,247,0.15)] hover:shadow-[0_2px_15px_rgba(79,142,247,0.3)] transition-all duration-300 overflow-hidden"
              >
                <div className="w-full h-full rounded-full bg-[#0f1320] flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User avatar"} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-sora text-[13px] font-bold text-white tracking-[-0.5px]">
                      {getInitials()}
                    </span>
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-12 w-64 rounded-[16px] p-4 bg-[#0c1019] shadow-[0_10px_40px_rgba(0,0,0,0.65)] border border-[rgba(255,255,255,0.12)] z-50 animate-fadeUp">
                  {/* User Profile Summary */}
                  <div className="border-b border-[rgba(255,255,255,0.06)] pb-3 mb-3">
                    <p className="font-sora text-[13px] font-semibold text-white truncate">
                      {user.displayName || 'Skope Explorer'}
                    </p>
                    <p className="font-dm text-[11px] text-[rgba(240,242,255,0.65)] truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  {/* Links */}
                  <ul className="space-y-1">
                    {hasReport && (
                      <li>
                        <button
                          onClick={() => { setShowDropdown(false); navigate('/result') }}
                          className="w-full text-left font-dm text-[13px] text-[rgba(240,242,255,0.92)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] px-3 py-2 rounded-[8px] cursor-pointer transition-colors"
                        >
                          📈 View PathReport
                        </button>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={() => { setShowDropdown(false); navigate('/form') }}
                        className="w-full text-left font-dm text-[13px] text-[rgba(240,242,255,0.92)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] px-3 py-2 rounded-[8px] cursor-pointer transition-colors"
                      >
                        ⚡ New Diagnostic
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => { setShowDropdown(false); navigate('/profile') }}
                        className="w-full text-left font-dm text-[13px] text-[rgba(240,242,255,0.92)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] px-3 py-2 rounded-[8px] cursor-pointer transition-colors"
                      >
                        👤 My Profile
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => { setShowDropdown(false); navigate('/share') }}
                        className="w-full text-left font-dm text-[13px] text-[rgba(240,242,255,0.92)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] px-3 py-2 rounded-[8px] cursor-pointer transition-colors"
                      >
                        📤 Share Skope
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left font-dm text-[13px] text-[#ff8a8a] hover:bg-[rgba(255,107,107,0.06)] px-3 py-2 rounded-[8px] cursor-pointer transition-colors flex items-center gap-2 mt-2 pt-2 border-t border-[rgba(255,255,255,0.04)]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="font-dm text-[12px] font-semibold text-[rgba(240,242,255,0.65)] hover:text-white px-3 py-2 cursor-pointer transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/form')}
                className="font-sora text-[12px] font-semibold bg-gradient-to-r from-blue to-purple text-white px-5 py-2.5 rounded-[10px] border-none cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(139,92,246,0.25)] transition-all duration-300"
              >
                Find My Scope →
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
