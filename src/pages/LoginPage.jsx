import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../firebase'
import { fetchSignInMethodsForEmail } from 'firebase/auth'

// ─── Icon Components ──────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const GuestIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

// Skope logo mark
const SkopeLogoMark = () => (
  <div
    className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-3"
    style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', boxShadow: '0 4px 24px rgba(79,142,247,0.35)' }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2.5" fill="none"/>
      <line x1="15" y1="15" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  </div>
)

// Rotating testimonials for left panel
const TESTIMONIALS = [
  { text: 'I thought I was destined for engineering. Skope told me I had 64% and no coding experience. It showed me Actuarial Science. Now I\'m studying at IISER.', name: 'Ananya S.', tag: 'IISER Pune' },
  { text: 'My parents wanted IIT. Skope said \'that conversation is over with your percentile\' and recommended DAIICT. Best decision of my life.', name: 'Rohan M.', tag: 'DAIICT Gandhinagar' },
  { text: 'No one told me UCEED existed. Skope did. I gave it and got into IIT Bombay\'s Design program.', name: 'Priya K.', tag: 'IIT Bombay B.Des' },
]

const STATS = [
  { value: '10K+', label: 'PathReports generated' },
  { value: '47',   label: 'Hidden colleges tracked' },
  { value: '0',    label: 'Generic advice given' },
]

// Shared input styles
const inputCls = 'w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-3.5 text-white font-dm text-[14px] outline-none focus:border-[rgba(79,142,247,0.5)] focus:shadow-[0_0_0_3px_rgba(79,142,247,0.08)] transition-all placeholder:text-[rgba(240,242,255,0.18)]'
const btnPrimary = 'w-full font-sora text-[14px] font-semibold bg-gradient-to-r from-[#4f8ef7] to-[#8b5cf6] text-white py-3.5 rounded-[12px] border-none cursor-pointer hover:shadow-[0_6px_25px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, loading, pathReport, loginWithGoogle, loginWithEmail, signupWithEmail, loginAsGuest, resetPassword } = useAuth()

  // viewMode: 'login' | 'forgot'
  const [viewMode, setViewMode]       = useState('login')
  const [isSignup, setIsSignup]       = useState(false)

  // Form fields
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [name,        setName]        = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [showPw,      setShowPw]      = useState(false)

  // Loading states
  const [googleLoading, setGoogleLoading] = useState(false)
  const [guestLoading,  setGuestLoading]  = useState(false)
  const [formLoading,   setFormLoading]   = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)

  // Error / info state
  const [error, setError] = useState('')

  // Testimonial rotator
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!loading && user) {
      if (!pathReport) {
        sessionStorage.setItem('skope_assessment_started', 'true')
      }
      navigate(pathReport ? '/result' : '/form')
    }
  }, [user, loading, pathReport, navigate])

  // ─── Handlers ─────────────────────────────────────────

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      // onAuthStateChanged + redirect is handled by useEffect above
    } catch (err) {
      console.error('[Auth] Google Login Error:', err)
      const msgs = {
        'auth/unauthorized-domain':    'Domain not authorized. Add it in Firebase Console → Authentication → Authorized Domains.',
        'auth/popup-blocked':          'Popup was blocked. Please enable popups for this site in your browser settings.',
        'auth/popup-closed-by-user':   'Sign-in cancelled.',
        'auth/internal-error':         'Firebase internal error. Ensure Google sign-in is enabled in Firebase Console → Authentication → Sign-in method, and the project support email is configured in Settings.',
        'auth/configuration-not-found':'Google provider not configured in Firebase Console. Enable it in Authentication → Sign-in method.',
      }
      setError(msgs[err.code] || `Google sign-in failed: ${err.message}`)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setError('')
    setGuestLoading(true)
    try {
      await loginAsGuest()
      sessionStorage.setItem('skope_assessment_started', 'true')
      navigate('/form')
    } catch (err) {
      setError(`Guest login failed: ${err.message}`)
    } finally {
      setGuestLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setError('')
    setFormLoading(true)
    try {
      if (isSignup) {
        // Pre-check for Google-linked email before trying to create account
        try {
          const providers = await fetchSignInMethodsForEmail(auth, email)
          if (providers.includes('google.com')) {
            setError('This email is already registered using Google Sign-In. Please click "Continue with Google" to log in.')
            setFormLoading(false)
            return
          }
        } catch (checkErr) {
          console.warn('Provider check failed:', checkErr)
        }
        await signupWithEmail(email, password, name)
      } else {
        await loginWithEmail(email, password)
      }
    } catch (err) {
      // If password login fails for a Google-linked email, guide user
      if (!isSignup && (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential')) {
        try {
          const providers = await fetchSignInMethodsForEmail(auth, email)
          if (providers.includes('google.com') && !providers.includes('password')) {
            setError('This email is registered via Google Sign-In. Please click "Continue with Google" above to log in, or reset your password to enable password login.')
            setFormLoading(false)
            return
          }
        } catch (checkErr) {
          console.warn('Provider check failed:', checkErr)
        }
      }

      const msgs = {
        'auth/user-not-found':      'No account with this email. Try signing up.',
        'auth/wrong-password':      'Incorrect password.',
        'auth/invalid-credential':  'Invalid email or password.',
        'auth/email-already-in-use':'Email already registered. Log in instead.',
        'auth/invalid-email':       'Invalid email address.',
        'auth/too-many-requests':   'Too many attempts. Try again later.',
      }
      setError(msgs[err.code] || 'Something went wrong. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim()) { setError('Please enter your email.'); return }
    setError('')
    setForgotLoading(true)
    try {
      await resetPassword(forgotEmail)
      setForgotSuccess(true)
    } catch (err) {
      const msgs = {
        'auth/user-not-found':  'No account with this email.',
        'auth/invalid-email':   'Invalid email format.',
      }
      setError(msgs[err.code] || 'Failed to send reset email. Try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  // Show full-page spinner while auth state is resolving
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080b14' }}>
        <div className="w-8 h-8 border-2 border-[rgba(79,142,247,0.2)] border-t-[#4f8ef7] rounded-full animate-spin" />
      </div>
    )
  }

  const testimonial = TESTIMONIALS[testimonialIdx]

  return (
    <>
      <div className="min-h-screen flex" style={{ background: '#080b14' }}>

        {/* ─── LEFT PANEL — Desktop only ──────────────────────── */}
        <div
          className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 relative overflow-hidden p-10"
          style={{
            borderRight: '1px solid rgba(79,142,247,0.08)',
            background: 'linear-gradient(160deg, rgba(79,142,247,0.05) 0%, rgba(139,92,246,0.08) 50%, #080b14 100%)',
          }}
        >
          {/* Ambient orbs */}
          <div className="absolute top-[-100px] left-[-60px] w-[320px] h-[320px] rounded-full opacity-[0.12] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #4f8ef7, transparent)' }} />
          <div className="absolute bottom-[-80px] right-[-80px] w-[280px] h-[280px] rounded-full opacity-[0.1] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-3 bg-transparent border-none cursor-pointer w-fit">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', boxShadow: '0 4px 20px rgba(79,142,247,0.3)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2.5" fill="none"/>
                <line x1="15" y1="15" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-sora text-[22px] font-bold tracking-[-0.5px]">
              <span className="text-white">Sk</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f8ef7] to-[#8b5cf6]">o</span>
              <span className="text-white">pe</span>
            </span>
          </button>

          {/* Hero copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(107,203,119,0.2)] bg-[rgba(107,203,119,0.06)] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6bcb77] animate-pulse inline-block" />
              <span className="font-dm text-[11px] text-[rgba(240,242,255,0.6)]">No sugar coating. Just the mirror.</span>
            </div>
            <h2 className="font-sora text-[32px] font-bold text-white tracking-[-1px] leading-[1.2] mb-4">
              The career advice<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f8ef7] to-[#8b5cf6]">nobody else will give</span><br/>
              you.
            </h2>
            <p className="font-dm text-[13px] text-[rgba(240,242,255,0.4)] leading-[1.8] max-w-[320px]">
              Hidden gem colleges. Unknown entrance exams. Career fields that pay well but nobody talks about.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-8">
            {STATS.map((s, i) => (
              <div key={i}>
                <div className="font-sora text-[20px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4f8ef7] to-[#8b5cf6]">{s.value}</div>
                <div className="font-dm text-[11px] text-[rgba(240,242,255,0.35)] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial card */}
          <div className="rounded-[16px] p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <p className="font-dm text-[13px] text-[rgba(240,242,255,0.6)] leading-[1.75] italic mb-4">"{testimonial.text}"</p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}>
                {testimonial.name[0]}
              </div>
              <div>
                <div className="font-sora text-[12px] font-semibold text-white">{testimonial.name}</div>
                <div className="font-dm text-[10px] text-[rgba(240,242,255,0.35)]">{testimonial.tag}</div>
              </div>
            </div>
            {/* Dot indicators */}
            <div className="flex gap-1.5 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)}
                  className={`h-1 rounded-full border-none cursor-pointer transition-all duration-300 ${i === testimonialIdx ? 'w-6 bg-[#4f8ef7]' : 'w-2 bg-[rgba(255,255,255,0.15)]'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL — Auth Form ──────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px] animate-fadeUp">

            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <button onClick={() => navigate('/')} className="inline-flex items-center gap-2.5 bg-transparent border-none cursor-pointer">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2.5" fill="none"/>
                    <line x1="15" y1="15" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="font-sora text-[20px] font-bold tracking-[-0.5px]">
                  <span className="text-white">Sk</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f8ef7] to-[#8b5cf6]">o</span>
                  <span className="text-white">pe</span>
                </span>
              </button>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="font-sora text-[28px] font-bold text-white tracking-[-0.5px] mb-1.5">
                {viewMode === 'login' && (isSignup ? 'Create account' : 'Welcome back')}
                {viewMode === 'forgot' && 'Reset password'}
              </h1>
              <p className="font-dm text-[13px] text-[rgba(240,242,255,0.4)]">
                {viewMode === 'login' && (isSignup ? 'No sugar coating — get your honest PathReport.' : 'Continue your career discovery.')}
                {viewMode === 'forgot' && 'Enter your email and we\'ll send a reset link.'}
              </p>
            </div>

            {/* ─── Error Banner ─────────────────────────────── */}
            {error && (
              <div className="flex items-start gap-2.5 bg-[rgba(255,107,107,0.06)] border border-[rgba(255,107,107,0.18)] rounded-[12px] px-4 py-3 mb-5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff8a8a" strokeWidth="2" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="font-dm text-[12px] text-[#ff8a8a] leading-relaxed">{error}</p>
              </div>
            )}

            {/* ─── LOGIN / SIGNUP MODE ──────────────────────── */}
            {viewMode === 'login' && (
              <>
                {/* Google Sign-In */}
                <button
                  id="btn-google-login"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white text-[#1f1f1f] font-dm text-[14px] font-medium py-3.5 rounded-[12px] border-none cursor-pointer hover:bg-[#f5f5f5] transition-colors disabled:opacity-60 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                >
                  {googleLoading
                    ? <div className="w-5 h-5 border-2 border-[#ccc] border-t-[#333] rounded-full animate-spin" />
                    : <GoogleIcon />
                  }
                  {googleLoading ? 'Signing in...' : 'Continue with Google'}
                </button>

                {/* Guest */}
                <button
                  id="btn-guest-login"
                  onClick={handleGuestLogin}
                  disabled={guestLoading}
                  className="w-full flex items-center justify-center gap-2.5 bg-[rgba(255,255,255,0.04)] text-[rgba(240,242,255,0.7)] font-dm text-[14px] font-medium py-3.5 rounded-[12px] border border-[rgba(255,255,255,0.09)] cursor-pointer hover:bg-[rgba(255,255,255,0.07)] hover:text-white transition-all disabled:opacity-50 mb-5"
                >
                  {guestLoading
                    ? <div className="w-4 h-4 border-2 border-[rgba(240,242,255,0.3)] border-t-white rounded-full animate-spin" />
                    : <GuestIcon />
                  }
                  {guestLoading ? 'Loading...' : 'Continue as Guest'}
                </button>

                {/* Guest note */}
                <div className="flex items-start gap-2 mb-5 px-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,242,255,0.3)" strokeWidth="2" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="font-dm text-[11px] text-[rgba(240,242,255,0.3)] leading-relaxed">
                    Guest mode doesn't save your PathReport. Sign up to access it anytime.
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                  <span className="font-dm text-[11px] text-[rgba(240,242,255,0.2)] uppercase tracking-[1px]">or</span>
                  <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                </div>

                {/* Email form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {isSignup && (
                    <div>
                      <label className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] block mb-1.5">Your Name</label>
                      <input
                        id="input-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="What should we call you?"
                        className={inputCls}
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] block mb-1.5">Email</label>
                    <input
                      id="input-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputCls}
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-dm text-[12px] text-[rgba(240,242,255,0.4)]">Password</label>
                      {!isSignup && (
                        <button
                          type="button"
                          onClick={() => { setViewMode('forgot'); setError('') }}
                          className="font-dm text-[11px] text-[#4f8ef7] bg-transparent border-none cursor-pointer hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="input-password"
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
                        className={inputCls + ' pr-11'}
                        autoComplete={isSignup ? 'new-password' : 'current-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(240,242,255,0.3)] hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0.5"
                      >
                        <EyeIcon open={showPw} />
                      </button>
                    </div>
                  </div>

                  <button
                    id="btn-email-submit"
                    type="submit"
                    disabled={formLoading}
                    className={btnPrimary}
                  >
                    {formLoading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <MailIcon />
                    }
                    {formLoading ? (isSignup ? 'Creating account...' : 'Logging in...') : (isSignup ? 'Create Account' : 'Log In with Email')}
                  </button>
                </form>
              </>
            )}

            {/* ─── FORGOT PASSWORD ─────────────────────────── */}
            {viewMode === 'forgot' && (
              <div className="space-y-4">
                {forgotSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(34,211,160,0.1)', border: '1px solid rgba(34,211,160,0.2)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <h3 className="font-sora text-[16px] font-bold text-[#22d3a0] mb-2">Reset link sent!</h3>
                    <p className="font-dm text-[13px] text-[rgba(240,242,255,0.5)] leading-relaxed">
                      Check your inbox at <strong className="text-white">{forgotEmail}</strong><br/>
                      (also check your spam folder)
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] block mb-1.5">Email Address</label>
                      <input
                        id="input-forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="The email you signed up with"
                        className={inputCls}
                        autoFocus
                      />
                    </div>
                    <button type="submit" disabled={forgotLoading} className={btnPrimary}>
                      {forgotLoading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <SendIcon />
                      }
                      {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={() => { setViewMode('login'); setForgotSuccess(false); setError('') }}
                  className="w-full font-dm text-[12px] text-[rgba(240,242,255,0.4)] hover:text-white bg-transparent border-none cursor-pointer text-center hover:underline flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <BackIcon /> Back to Log In
                </button>
              </div>
            )}

            {/* Toggle login / signup */}
            {viewMode === 'login' && (
              <p className="text-center font-dm text-[13px] text-[rgba(240,242,255,0.4)] mt-6">
                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  onClick={() => { setIsSignup(!isSignup); setError('') }}
                  className="text-[#4f8ef7] font-medium bg-transparent border-none cursor-pointer hover:underline"
                >
                  {isSignup ? 'Log in' : 'Sign up free'}
                </button>
              </p>
            )}

            {/* Footer privacy note */}
            <div className="flex items-center justify-center gap-1.5 mt-5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(240,242,255,0.2)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <p className="font-dm text-[11px] text-[rgba(240,242,255,0.2)]">
                Your data stays private. Never shared or sold.
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
