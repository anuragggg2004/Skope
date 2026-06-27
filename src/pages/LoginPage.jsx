import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ─── Icon Components ──────────────────────────────────
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

const GuestIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
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
    style={{ background: '#4f8ef7', boxShadow: '0 4px 24px rgba(79,142,247,0.35)' }}
  >
    <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="10" fill="white" />
      <circle cx="50" cy="50" r="25" fill="none" stroke="white" strokeWidth="10" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="10" />
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
  const { user, loading, pathReport, loginWithEmail, signupWithEmail, loginAsGuest, resetPassword } = useAuth()

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

  // Navigate away once auth resolves
  useEffect(() => {
    if (!loading && user) {
      if (!pathReport) {
        sessionStorage.setItem('skope_assessment_started', 'true')
      }
      navigate(pathReport ? '/result' : '/form', { replace: true })
    }
  }, [user, loading, pathReport, navigate])

  // ─── Handlers ─────────────────────────────────────────

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
    if (isSignup && name.trim().length < 2) { setError('Please enter your name.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setError('')
    setFormLoading(true)
    try {
      if (isSignup) {
        await signupWithEmail(email, password, name)
      } else {
        await loginWithEmail(email, password)
      }
      // AuthContext useEffect above handles navigation after user state updates
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
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
      setError(err.message || 'Failed to send reset email. Try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  // Show full-page spinner while auth state is resolving
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#080b14' }}>
        <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-1"
          style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', boxShadow: '0 4px 24px rgba(79,142,247,0.35)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2.5" fill="none"/>
            <line x1="15" y1="15" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="w-8 h-8 border-2 border-[rgba(79,142,247,0.2)] border-t-[#4f8ef7] rounded-full animate-spin" />
        <p className="font-dm text-[13px] text-[rgba(240,242,255,0.4)]">Loading…</p>
      </div>
    )
  }

  const testimonial = TESTIMONIALS[testimonialIdx]

  return (
    <div className="min-h-screen flex" style={{ background: '#080b14' }}>

      {/* ─── Left Panel — Testimonial / Social Proof ──────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(79,142,247,0.08) 0%, rgba(139,92,246,0.06) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.04)'
        }}
      >
        {/* Background orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full opacity-20 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #4f8ef7, transparent)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-[240px] h-[240px] rounded-full opacity-15 blur-[60px]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

        {/* Logo */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2.5" fill="none"/>
                <line x1="15" y1="15" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-sora text-[16px] font-bold text-white">Skope</span>
          </div>
          <p className="mt-4 font-dm text-[13px] text-[rgba(240,242,255,0.4)] leading-relaxed max-w-[280px]">
            AI-powered career discovery for Indian Class 12 students. No fluff. No generics. Just data.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="font-sora font-bold text-[22px] text-white">{s.value}</p>
              <p className="font-dm text-[11px] text-[rgba(240,242,255,0.35)] mt-0.5 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div
          className="rounded-[16px] p-6 relative"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="text-[rgba(79,142,247,0.8)] text-[28px] font-serif leading-none mb-3">"</div>
          <p className="font-dm text-[13.5px] text-[rgba(240,242,255,0.75)] leading-relaxed italic">
            {testimonial.text}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-sora font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}>
              {testimonial.name[0]}
            </div>
            <div>
              <p className="font-sora text-[12px] font-semibold text-white">{testimonial.name}</p>
              <p className="font-dm text-[11px] text-[rgba(240,242,255,0.35)]">{testimonial.tag}</p>
            </div>
          </div>
          {/* Slide indicator dots */}
          <div className="flex gap-1.5 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <div key={i} className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === testimonialIdx ? '20px' : '6px',
                  background: i === testimonialIdx ? '#4f8ef7' : 'rgba(255,255,255,0.15)'
                }} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Login / Signup form ─────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">

          {/* Forgot Password View */}
          {viewMode === 'forgot' ? (
            <div>
              <SkopeLogoMark />
              <button
                onClick={() => { setViewMode('login'); setError(''); setForgotSuccess(false) }}
                className="flex items-center gap-1.5 text-[rgba(240,242,255,0.4)] hover:text-white transition-colors mb-6 font-dm text-[13px]"
              >
                <BackIcon /> Back to login
              </button>
              <h1 className="font-sora text-[22px] font-bold text-white mb-1">Reset your password</h1>
              <p className="font-dm text-[13px] text-[rgba(240,242,255,0.45)] mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              {forgotSuccess ? (
                <div className="rounded-[12px] p-4 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p className="font-sora font-semibold text-[#10b981] text-[14px]">✓ Reset email sent!</p>
                  <p className="font-dm text-[12px] text-[rgba(240,242,255,0.5)] mt-1">Check your inbox (and spam folder).</p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-[10px] p-3 font-dm text-[13px] text-[#f87171]"
                      style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                      {error}
                    </div>
                  )}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(240,242,255,0.3)]"><MailIcon /></span>
                    <input
                      id="forgot-email"
                      className={`${inputCls} pl-10`}
                      type="email"
                      placeholder="your@email.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className={btnPrimary} disabled={forgotLoading}>
                    {forgotLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><SendIcon /> Send Reset Link</>}
                  </button>
                </form>
              )}
            </div>

          ) : (
            /* ── Login / Signup view ── */
            <div>
              <SkopeLogoMark />
              <h1 className="font-sora text-[24px] font-bold text-white mb-1">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="font-dm text-[13px] text-[rgba(240,242,255,0.45)] mb-7">
                {isSignup
                  ? 'Join thousands of students finding their real path.'
                  : 'Sign in to continue your career journey.'}
              </p>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-[10px] p-3 font-dm text-[13px] text-[#f87171]"
                    style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                    {error}
                  </div>
                )}

                {isSignup && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(240,242,255,0.3)]"><UserIcon /></span>
                    <input
                      id="signup-name"
                      className={`${inputCls} pl-10`}
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(240,242,255,0.3)]"><MailIcon /></span>
                  <input
                    id="email"
                    className={`${inputCls} pl-10`}
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(240,242,255,0.3)]"><LockIcon /></span>
                  <input
                    id="password"
                    className={`${inputCls} pl-10 pr-11`}
                    type={showPw ? 'text' : 'password'}
                    placeholder={isSignup ? 'Create a password (min 6 chars)' : 'Your password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(240,242,255,0.3)] hover:text-[rgba(240,242,255,0.6)] transition-colors"
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>

                {!isSignup && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => { setViewMode('forgot'); setError('') }}
                      className="font-dm text-[12px] text-[rgba(79,142,247,0.7)] hover:text-[#4f8ef7] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button type="submit" id="submit-btn" className={btnPrimary} disabled={formLoading}>
                  {formLoading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : isSignup ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(255,255,255,0.07)]" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="px-3 font-dm text-[rgba(240,242,255,0.3)]" style={{ background: '#080b14' }}>or</span>
                </div>
              </div>

              {/* Guest access */}
              <button
                id="guest-btn"
                onClick={handleGuestLogin}
                disabled={guestLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] font-dm text-[13px] text-[rgba(240,242,255,0.6)] hover:text-white transition-all duration-200 disabled:opacity-50"
                style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
              >
                {guestLoading
                  ? <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  : <><GuestIcon /> Continue as Guest</>}
              </button>

              {/* Toggle login / signup */}
              <p className="text-center mt-5 font-dm text-[13px] text-[rgba(240,242,255,0.4)]">
                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  onClick={() => { setIsSignup(v => !v); setError(''); setPassword('') }}
                  className="text-[#4f8ef7] hover:underline transition-colors font-medium"
                >
                  {isSignup ? 'Sign in' : 'Sign up for free'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
