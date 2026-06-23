import { createContext, useContext, useState, useEffect } from 'react'
import { auth, googleProvider } from '../firebase'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

// ─── Helpers ────────────────────────────────────────────────
function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
}

// Fetch the user's saved PathReport from backend
async function fetchPathReport(uid, token) {
  const res = await fetch(`/api/get-report/${uid}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.success && data.found ? data.reportData : null
}

// Sync user record to MongoDB (non-blocking — errors don't interrupt auth)
function syncUser(uid, email, displayName, provider, token) {
  fetch('/api/admin/sync-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ uid, email, displayName, provider })
  }).catch(err => console.error('[Auth] Sync user failed:', err.message))
}

// ─── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const guest = sessionStorage.getItem('skope_guest_user')
      return guest ? JSON.parse(guest) : null
    } catch {
      return null
    }
  })
  // loading starts true — we wait for Firebase to resolve auth state
  const [loading, setLoading] = useState(true)
  const [pathReport, setPathReport] = useState(null)

  useEffect(() => {
    // ── STEP 1: Consume any pending redirect result FIRST ──
    // This handles the case where signInWithRedirect (mobile fallback) completed
    // and the browser returned to the app. Without this, the user appears logged out.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('[Auth] Redirect sign-in completed for:', result.user.email)
          // onAuthStateChanged will fire automatically after this — no extra work needed
        }
      })
      .catch((err) => {
        // Known non-error: auth/no-auth-event means no redirect is pending — safe to ignore
        if (err.code !== 'auth/no-auth-event' && err.code !== 'auth/null-user') {
          console.warn('[Auth] Redirect result error:', err.code, err.message)
        }
      })

    // ── STEP 2: Subscribe to ongoing auth state changes ──
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Guest mode — don't override with Firebase null
      const isLocalGuest = sessionStorage.getItem('skope_guest_mode') === 'true'
      if (isLocalGuest) {
        setLoading(false)
        return
      }

      setUser(firebaseUser)

      if (firebaseUser && !firebaseUser.isAnonymous) {
        // Keep loading=true while we fetch data so UI doesn't flash
        setLoading(true)
        try {
          const token = await firebaseUser.getIdToken()

          // Sync user to MongoDB (fire-and-forget)
          syncUser(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.displayName,
            firebaseUser.providerData?.[0]?.providerId || 'email',
            token
          )

          // Fetch existing PathReport (determines /form vs /result routing)
          const report = await fetchPathReport(firebaseUser.uid, token)
          if (report) {
            setPathReport(report)
            sessionStorage.setItem('pathreport', JSON.stringify(report))
          } else {
            setPathReport(null)
          }
        } catch (err) {
          console.error('[Auth] Failed to fetch user report:', err.message)
          setPathReport(null)
        }
      } else if (!firebaseUser) {
        setPathReport(null)
        sessionStorage.removeItem('pathreport')
      }

      // Release loading AFTER all async work is done
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // ─── Auth Methods ──────────────────────────────────────────

  const loginWithGoogle = async () => {
    setLoading(true)
    sessionStorage.removeItem('skope_guest_mode')
    sessionStorage.removeItem('skope_guest_user')

    try {
      if (isMobileBrowser()) {
        // Mobile browsers block popups — use redirect instead
        // The result will be picked up by getRedirectResult() on next page load
        sessionStorage.setItem('skope_redirect_pending', 'true')
        await signInWithRedirect(auth, googleProvider)
        return // page will navigate away; auth resumes on return
      } else {
        // Desktop — use popup (faster UX, no page reload)
        const result = await signInWithPopup(auth, googleProvider)
        return result.user
      }
    } catch (err) {
      // If popup was blocked on desktop, fall back to redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        try {
          sessionStorage.setItem('skope_redirect_pending', 'true')
          await signInWithRedirect(auth, googleProvider)
          return
        } catch (redirectErr) {
          setLoading(false)
          throw redirectErr
        }
      }
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
    sessionStorage.removeItem('skope_redirect_pending')
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
