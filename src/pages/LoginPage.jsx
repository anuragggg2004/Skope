import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../firebase'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginWithGoogle, loginWithEmail, signupWithEmail, resetPassword } = useAuth()
  
  // View states: 'login' (email/password), 'forgot' (forgot password), 'phone' (enter phone), 'otp' (verify SMS OTP)
  const [viewMode, setViewMode] = useState('login')
  const [isSignup, setIsSignup] = useState(false)
  
  // Email state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)

  // Phone & OTP state
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  // OTP resend timer countdown
  useEffect(() => {
    let interval = null
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [otpTimer])

  // Google Login
  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/form')
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return
      setError('Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  // Email Submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setError('')
    setLoading(true)
    try {
      if (isSignup) {
        await signupWithEmail(email, password, name)
      } else {
        await loginWithEmail(email, password)
      }
      navigate('/form')
    } catch (err) {
      const messages = {
        'auth/user-not-found': "No account found. Try signing up.",
        'auth/wrong-password': "Incorrect password.",
        'auth/invalid-credential': "Invalid email or password.",
        'auth/email-already-in-use': "Email already registered. Try logging in.",
        'auth/invalid-email': "Invalid email address.",
        'auth/too-many-requests': "Too many attempts. Try again later."
      }
      setError(messages[err.code] || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Forgot Password Submit
  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      setError('Please enter your email address.')
      return
    }
    setError('')
    setForgotLoading(true)
    setForgotSuccess(false)
    try {
      await resetPassword(forgotEmail)
      setForgotSuccess(true)
    } catch (err) {
      const messages = {
        'auth/user-not-found': "No account found with this email.",
        'auth/invalid-email': "Invalid email address."
      }
      setError(messages[err.code] || 'Failed to send reset link. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  // Setup reCAPTCHA Verifier
  const initRecaptcha = () => {
    // Clean up previous verifier instance to prevent duplicate rendering errors
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear()
      } catch (e) {
        console.error('Error clearing recaptcha verifier:', e)
      }
      window.recaptchaVerifier = null
    }

    // Recreate the DOM element dynamically inside the parent wrapper
    const parent = document.getElementById('recaptcha-parent')
    if (parent) {
      parent.innerHTML = '<div id="recaptcha-container"></div>'
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // recaptcha solved
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please request a new code.')
      }
    })
    return window.recaptchaVerifier
  }

  // Phone Number Submit (Send OTP)
  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setError('')
    setPhoneLoading(true)
    try {
      const appVerifier = initRecaptcha()
      const formattedPhone = `+91${cleaned}`
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      setConfirmationResult(confirmation)
      setViewMode('otp')
      setOtpTimer(30)
    } catch (err) {
      console.error(err)
      const friendlyMessages = {
        'auth/operation-not-allowed': 'Phone Authentication is not enabled in your Firebase Console. Please search "Authentication" -> "Sign-in method" tab, and enable the "Phone" provider.',
        'auth/invalid-phone-number': 'The phone number format is invalid. Please double check the 10 digits.',
        'auth/too-many-requests': 'SMS quota exceeded or too many requests. Please try again later.'
      }
      setError(friendlyMessages[err.code] || `SMS Verification failed: ${err.message} (Code: ${err.code})`)
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    } finally {
      setPhoneLoading(false)
    }
  }

  // OTP Verification Submit
  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP code.')
      return
    }

    setError('')
    setOtpLoading(true)
    try {
      await confirmationResult.confirm(otp)
      navigate('/form')
    } catch (err) {
      setError('Invalid OTP code. Please check and try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />
      
      {/* Invisible parent wrapper for dynamic Firebase reCAPTCHA recycling */}
      <div id="recaptcha-parent">
        <div id="recaptcha-container"></div>
      </div>

      <div className="page-wrapper min-h-screen flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px] animate-fadeUp">

          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-2.5 cursor-pointer mb-6"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 rounded-[11px] bg-gradient-to-br from-blue to-purple flex items-center justify-center shadow-[0_4px_20px_rgba(79,142,247,0.25)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2.5" fill="none" />
                  <line x1="15" y1="15" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-sora text-[22px] font-bold tracking-[-0.5px]">
                <span className="text-white">Sk</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue to-purple">o</span>
                <span className="text-white">pe</span>
              </span>
            </div>

            <h1 className="font-sora text-[28px] sm:text-[32px] font-bold text-white tracking-[-0.5px] mb-2">
              {viewMode === 'login' && (isSignup ? 'Create your account' : 'Welcome back')}
              {viewMode === 'forgot' && 'Reset your password'}
              {viewMode === 'phone' && 'Sign in with phone'}
              {viewMode === 'otp' && 'Verify OTP Code'}
            </h1>
            <p className="font-dm text-[14px] text-[rgba(240,242,255,0.4)]">
              {viewMode === 'login' && (isSignup ? 'Start discovering your career path' : 'Continue your career discovery')}
              {viewMode === 'forgot' && 'Enter your email to receive a password reset link'}
              {viewMode === 'phone' && 'Enter your mobile number to receive a 6-digit OTP code'}
              {viewMode === 'otp' && `Enter the code sent to +91 ******${phone.slice(-4)}`}
            </p>
          </div>

          {/* Card */}
          <div className="glass-card rounded-[20px] p-6 sm:p-8 hover:translate-y-0 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">

            {/* ERROR DISPLAY */}
            {error && (
              <div className="bg-[rgba(255,107,107,0.06)] border border-[rgba(255,107,107,0.18)] rounded-[10px] px-4 py-3 mb-5 animate-fadeUp">
                <p className="font-dm text-[12px] text-[#ff8a8a] leading-relaxed flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{error}</span>
                </p>
              </div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* VIEW MODE: EMAIL / PASSWORD LOGIN & SIGNUP */}
            {/* ═══════════════════════════════════════════ */}
            {viewMode === 'login' && (
              <>
                {/* Google Button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white text-[#1f1f1f] font-dm text-[14px] font-medium py-3.5 rounded-[12px] border-none cursor-pointer hover:bg-[#f5f5f5] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-5"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-[#ccc] border-t-[#333] rounded-full animate-spin" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  {googleLoading ? 'Signing in...' : 'Continue with Google'}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                  <span className="font-dm text-[11px] text-[rgba(240,242,255,0.25)] uppercase tracking-[1px]">or</span>
                  <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {isSignup && (
                    <div>
                      <label className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] block mb-1.5 font-medium">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-white font-dm text-[14px] outline-none focus:border-[rgba(79,142,247,0.3)] focus:shadow-[0_0_20px_rgba(79,142,247,0.06)] transition-all placeholder:text-[rgba(240,242,255,0.18)]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] block mb-1.5 font-medium">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-white font-dm text-[14px] outline-none focus:border-[rgba(79,142,247,0.3)] focus:shadow-[0_0_20px_rgba(79,142,247,0.06)] transition-all placeholder:text-[rgba(240,242,255,0.18)]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] block font-medium">Password</label>
                      {!isSignup && (
                        <button
                          type="button"
                          onClick={() => { setViewMode('forgot'); setError('') }}
                          className="font-dm text-[11px] text-blue bg-transparent border-none cursor-pointer hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-white font-dm text-[14px] outline-none focus:border-[rgba(79,142,247,0.3)] focus:shadow-[0_0_20px_rgba(79,142,247,0.06)] transition-all placeholder:text-[rgba(240,242,255,0.18)]"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-sora text-[14px] font-semibold bg-gradient-to-r from-blue to-purple text-white py-3.5 rounded-[12px] border-none cursor-pointer hover:shadow-[0_6px_25px_rgba(139,92,246,0.25)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isSignup ? 'Creating account...' : 'Logging in...'}
                      </span>
                    ) : (
                      isSignup ? 'Create Account' : 'Log In'
                    )}
                  </button>
                </form>

                {/* Switch to Phone Auth link */}
                <div className="text-center mt-5 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                  <button
                    type="button"
                    onClick={() => { setViewMode('phone'); setError('') }}
                    className="font-dm text-[12px] font-medium text-blue hover:underline bg-transparent border-none cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                  >
                    📱 Continue with Phone Number OTP
                  </button>
                </div>
              </>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* VIEW MODE: FORGOT PASSWORD */}
            {/* ═══════════════════════════════════════════ */}
            {viewMode === 'forgot' && (
              <div className="space-y-4">
                {forgotSuccess ? (
                  <div className="bg-[rgba(34,211,160,0.06)] border border-[rgba(34,211,160,0.18)] rounded-[10px] p-4 text-center">
                    <span className="text-[24px] block mb-2">✉️</span>
                    <h3 className="font-sora text-[15px] font-semibold text-[#22d3a0] mb-1">Reset Link Sent</h3>
                    <p className="font-dm text-[12px] text-[rgba(240,242,255,0.6)] leading-relaxed">
                      We have emailed a password reset link to <strong className="text-white">{forgotEmail}</strong>. Check your inbox (and spam folder).
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] block mb-1.5 font-medium">Email Address</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-white font-dm text-[14px] outline-none focus:border-[rgba(79,142,247,0.3)] focus:shadow-[0_0_20px_rgba(79,142,247,0.06)] transition-all placeholder:text-[rgba(240,242,255,0.18)]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full font-sora text-[14px] font-semibold bg-gradient-to-r from-blue to-purple text-white py-3.5 rounded-[12px] border-none cursor-pointer hover:shadow-[0_6px_25px_rgba(139,92,246,0.25)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      {forgotLoading ? 'Sending link...' : 'Send Reset Link'}
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={() => { setViewMode('login'); setForgotSuccess(false); setError('') }}
                  className="w-full font-dm text-[12px] text-[rgba(240,242,255,0.45)] hover:text-white bg-transparent border-none cursor-pointer text-center hover:underline mt-2 block"
                >
                  ← Back to Log In
                </button>
              </div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* VIEW MODE: PHONE OTP (ENTER MOBILE NUMBER) */}
            {/* ═══════════════════════════════════════════ */}
            {viewMode === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] block mb-1.5 font-medium">Mobile Number</label>
                  <div className="flex gap-2">
                    {/* Fixed Indian Code Prefix */}
                    <div className="flex items-center justify-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-3 py-3 text-white font-dm text-[14px] select-none">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit number"
                      maxLength="10"
                      className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-white font-dm text-[14px] outline-none focus:border-[rgba(79,142,247,0.3)] focus:shadow-[0_0_20px_rgba(79,142,247,0.06)] transition-all placeholder:text-[rgba(240,242,255,0.18)]"
                    />
                  </div>
                  <span className="font-dm text-[11px] text-[rgba(240,242,255,0.25)] mt-1.5 block leading-normal">
                    🔒 An invisible verification check is solved in your browser before sending SMS.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={phoneLoading}
                  className="w-full font-sora text-[14px] font-semibold bg-gradient-to-r from-blue to-purple text-white py-3.5 rounded-[12px] border-none cursor-pointer hover:shadow-[0_6px_25px_rgba(139,92,246,0.25)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {phoneLoading ? 'Sending SMS OTP...' : 'Send OTP Code'}
                </button>

                <button
                  type="button"
                  onClick={() => { setViewMode('login'); setError('') }}
                  className="w-full font-dm text-[12px] text-[rgba(240,242,255,0.45)] hover:text-white bg-transparent border-none cursor-pointer text-center hover:underline mt-2 block"
                >
                  ← Use Email / password
                </button>
              </form>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* VIEW MODE: PHONE OTP (ENTER 6-DIGIT CODE)   */}
            {/* ═══════════════════════════════════════════ */}
            {viewMode === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] block mb-1.5 font-medium">6-Digit Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    className="w-full tracking-[8px] text-center font-sora text-[18px] font-bold bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3.5 text-white outline-none focus:border-[rgba(79,142,247,0.3)] focus:shadow-[0_0_20px_rgba(79,142,247,0.06)] transition-all placeholder:text-[rgba(240,242,255,0.18)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full font-sora text-[14px] font-semibold bg-gradient-to-r from-blue to-purple text-white py-3.5 rounded-[12px] border-none cursor-pointer hover:shadow-[0_6px_25px_rgba(139,92,246,0.25)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {otpLoading ? 'Verifying OTP...' : 'Verify & Log In'}
                </button>

                <div className="flex items-center justify-between text-[11px] font-dm text-[rgba(240,242,255,0.3)] mt-2">
                  <button
                    type="button"
                    onClick={() => { setViewMode('phone'); setError('') }}
                    className="text-blue hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Change Phone Number
                  </button>

                  {otpTimer > 0 ? (
                    <span>Resend code in {otpTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePhoneSubmit}
                      className="text-blue hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Resend SMS OTP
                    </button>
                  )}
                </div>
              </form>
            )}

          </div>

          {/* Toggle Login/Signup */}
          {viewMode === 'login' && (
            <p className="text-center font-dm text-[13px] text-[rgba(240,242,255,0.4)] mt-5">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsSignup(!isSignup); setError('') }}
                className="text-blue font-medium bg-transparent border-none cursor-pointer hover:underline"
              >
                {isSignup ? 'Log in' : 'Sign up'}
              </button>
            </p>
          )}

          {/* Privacy */}
          <p className="text-center font-dm text-[11px] text-[rgba(240,242,255,0.2)] mt-4">
            🔒 Your data stays private. We never share your information.
          </p>
        </div>
      </div>
    </>
  )
}
