import { createContext, useContext, useState, useEffect } from 'react'
import { auth, googleProvider } from '../firebase'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const guest = sessionStorage.getItem('skope_guest_user')
      return guest ? JSON.parse(guest) : null
    } catch {
      return null
    }
  })
  // Start loading = true so the UI waits for Firebase to resolve auth state
  const [loading, setLoading] = useState(true)
  const [pathReport, setPathReport] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If local guest mode is active, do not override user with null
      const isLocalGuest = sessionStorage.getItem('skope_guest_mode') === 'true'
      if (isLocalGuest) {
        setLoading(false)
        return
      }

      if (firebaseUser) {
        setLoading(true)
      }

      setUser(firebaseUser)

      if (firebaseUser && !firebaseUser.isAnonymous) {
        // Keep loading = true until ALL async operations complete
        // This prevents premature redirect before the report is fetched
        try {
          const token = await firebaseUser.getIdToken()

          // Sync user to MongoDB on login/auth change
          await fetch('/api/admin/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              provider: firebaseUser.providerData?.[0]?.providerId || 'email'
            })
          }).catch(err => console.error('Sync user failed:', err))

          // Fetch existing report so we can route to /result vs /form
          const res = await fetch(`/api/get-report/${firebaseUser.uid}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.found) {
              setPathReport(data.reportData)
              sessionStorage.setItem('pathreport', JSON.stringify(data.reportData))
            } else {
              setPathReport(null)
            }
          }
        } catch (err) {
          console.error('Failed to pre-fetch user report from database:', err)
          setPathReport(null)
        }
      } else {
        if (!firebaseUser) {
          setPathReport(null)
          sessionStorage.removeItem('pathreport')
        }
      }

      // Only set loading = false AFTER everything is complete
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // ─── Auth Methods ──────────────────────────────────────

  const loginWithGoogle = async () => {
    setLoading(true)
    sessionStorage.removeItem('skope_guest_mode')
    sessionStorage.removeItem('skope_guest_user')
    try {
      // Use popup-only — avoids cross-origin storage issues on custom domains (Render, Vercel, etc.)
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  const loginWithEmail = async (email, password) => {
    setLoading(true)
    sessionStorage.removeItem('skope_guest_mode')
    sessionStorage.removeItem('skope_guest_user')
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  const signupWithEmail = async (email, password, displayName) => {
    setLoading(true)
    sessionStorage.removeItem('skope_guest_mode')
    sessionStorage.removeItem('skope_guest_user')
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) {
        await updateProfile(result.user, { displayName })
      }
      return result.user
    } catch (err) {
      setLoading(false)
      throw err
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

  const logout = async () => {
    sessionStorage.removeItem('skope_guest_mode')
    sessionStorage.removeItem('skope_guest_user')
    setUser(null)
    await signOut(auth)
  }

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email)
  }

  const value = {
    user,
    loading,
    pathReport,
    setPathReport,
    loginWithGoogle,
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
