import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// ─── Helpers ────────────────────────────────────────────────

const TOKEN_KEY = 'skope_auth_token'
const USER_KEY  = 'skope_auth_user'

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem('skope_guest_mode')
  sessionStorage.removeItem('skope_guest_user')
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// Fetch the user's saved PathReport from backend
async function fetchPathReport(uid, token) {
  try {
    const res = await fetch(`/api/get-report/${uid}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.success && data.found ? data.reportData : null
  } catch {
    return null
  }
}

// ─── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pathReport, setPathReport] = useState(null)

  // Rehydrate session on mount
  useEffect(() => {
    async function rehydrate() {
      // Guest mode
      const isGuest = sessionStorage.getItem('skope_guest_mode') === 'true'
      if (isGuest) {
        try {
          const guest = JSON.parse(sessionStorage.getItem('skope_guest_user'))
          if (guest) {
            setUser(guest)
            setLoading(false)
            return
          }
        } catch { /* ignore */ }
      }

      // JWT session
      const token = localStorage.getItem(TOKEN_KEY)
      const storedUser = localStorage.getItem(USER_KEY)

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // Fetch existing PathReport (determines /form vs /result routing)
          const report = await fetchPathReport(parsedUser.uid, token)
          if (report) {
            setPathReport(report)
            sessionStorage.setItem('pathreport', JSON.stringify(report))
          }
        } catch {
          clearSession()
        }
      }

      setLoading(false)
    }

    rehydrate()
  }, [])

  // ─── Auth Methods ──────────────────────────────────────────

  const signupWithEmail = async (email, password, name) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')

      saveSession(data.token, data.user)
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const loginWithEmail = async (email, password) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      saveSession(data.token, data.user)
      setUser(data.user)

      // Fetch existing PathReport after login
      const report = await fetchPathReport(data.user.uid, data.token)
      if (report) {
        setPathReport(report)
        sessionStorage.setItem('pathreport', JSON.stringify(report))
      }

      return data.user
    } finally {
      setLoading(false)
    }
  }

  const loginAsGuest = async () => {
    const mockUser = {
      uid: 'guest_' + Math.random().toString(36).substr(2, 9),
      email: 'guest@skope.ai',
      displayName: 'Guest Student',
      isAnonymous: true
    }
    sessionStorage.setItem('skope_guest_mode', 'true')
    sessionStorage.setItem('skope_guest_user', JSON.stringify(mockUser))
    setUser(mockUser)
    return mockUser
  }

  const logout = () => {
    clearSession()
    sessionStorage.removeItem('pathreport')
    setUser(null)
    setPathReport(null)
  }

  const resetPassword = async (email) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to send reset email')
    return data
  }

  const value = {
    user,
    loading,
    pathReport,
    setPathReport,
    loginWithEmail,
    signupWithEmail,
    loginAsGuest,
    resetPassword,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
