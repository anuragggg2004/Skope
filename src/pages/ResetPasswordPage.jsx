import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

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

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

const inputCls = 'w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-3.5 text-white font-dm text-[14px] outline-none focus:border-[rgba(79,142,247,0.5)] focus:shadow-[0_0_0_3px_rgba(79,142,247,0.08)] transition-all placeholder:text-[rgba(240,242,255,0.18)]'
const btnPrimary = 'w-full font-sora text-[14px] font-semibold bg-gradient-to-r from-[#4f8ef7] to-[#8b5cf6] text-white py-3.5 rounded-[12px] border-none cursor-pointer hover:shadow-[0_6px_25px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus]       = useState('verifying') // verifying | valid | invalid | success
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showCPw, setShowCPw]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  // Verify token on mount
  useEffect(() => {
    if (!token) { setStatus('invalid'); return }
    fetch(`/api/auth/verify-reset-token/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setEmail(data.email || '')
          setStatus('valid')
        } else {
          setStatus('invalid')
        }
      })
      .catch(() => setStatus('invalid'))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirmPw) { setError('Passwords do not match.'); return }

    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reset failed.')
      setStatus('success')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Shared wrapper ───────────────────────────
  const Wrapper = ({ children }) => (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080b14' }}>
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-[11px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', boxShadow: '0 4px 20px rgba(79,142,247,0.35)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2.5" fill="none"/>
              <line x1="15" y1="15" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-sora text-[16px] font-bold text-white">Skope</span>
        </div>
        {children}
      </div>
    </div>
  )

  // ─── Verifying ────────────────────────────────
  if (status === 'verifying') {
    return (
      <Wrapper>
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-8 h-8 border-2 border-[rgba(79,142,247,0.2)] border-t-[#4f8ef7] rounded-full animate-spin" />
          <p className="font-dm text-[13px] text-[rgba(240,242,255,0.4)]">Verifying your reset link…</p>
        </div>
      </Wrapper>
    )
  }

  // ─── Invalid / Expired ────────────────────────
  if (status === 'invalid') {
    return (
      <Wrapper>
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 className="font-sora text-[20px] font-bold text-white mb-2">Link expired or invalid</h1>
          <p className="font-dm text-[13px] text-[rgba(240,242,255,0.45)] mb-6 leading-relaxed">
            This reset link has already been used or expired.<br/>Reset links are valid for 1 hour only.
          </p>
          <button
            onClick={() => navigate('/login')}
            className={btnPrimary}
          >
            Request a new link
          </button>
        </div>
      </Wrapper>
    )
  }

  // ─── Success ──────────────────────────────────
  if (status === 'success') {
    return (
      <Wrapper>
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className="font-sora text-[20px] font-bold text-white mb-2">Password updated!</h1>
          <p className="font-dm text-[13px] text-[rgba(240,242,255,0.45)] mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <button onClick={() => navigate('/login')} className={btnPrimary}>
            Go to Login
          </button>
        </div>
      </Wrapper>
    )
  }

  // ─── Valid — Show new password form ──────────
  return (
    <Wrapper>
      <h1 className="font-sora text-[23px] font-bold text-white mb-1">Set new password</h1>
      {email && (
        <p className="font-dm text-[13px] text-[rgba(240,242,255,0.4)] mb-6">
          For <span className="text-[rgba(240,242,255,0.7)]">{email}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-[10px] p-3 font-dm text-[13px] text-[#f87171]"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            {error}
          </div>
        )}

        {/* New password */}
        <div>
          <label className="block font-dm text-[12px] text-[rgba(240,242,255,0.4)] mb-2">New password</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(240,242,255,0.3)]"><LockIcon /></span>
            <input
              id="new-password"
              className={`${inputCls} pl-10 pr-11`}
              type={showPw ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(240,242,255,0.3)] hover:text-[rgba(240,242,255,0.6)] transition-colors">
              <EyeIcon open={showPw} />
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label className="block font-dm text-[12px] text-[rgba(240,242,255,0.4)] mb-2">Confirm new password</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(240,242,255,0.3)]"><LockIcon /></span>
            <input
              id="confirm-password"
              className={`${inputCls} pl-10 pr-11`}
              type={showCPw ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button type="button" onClick={() => setShowCPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(240,242,255,0.3)] hover:text-[rgba(240,242,255,0.6)] transition-colors">
              <EyeIcon open={showCPw} />
            </button>
          </div>
          {/* Match indicator */}
          {confirmPw && (
            <p className={`font-dm text-[11px] mt-1.5 ${password === confirmPw ? 'text-[#10b981]' : 'text-[#f87171]'}`}>
              {password === confirmPw ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        <button type="submit" id="reset-submit-btn" className={btnPrimary} disabled={loading}>
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : 'Update Password'}
        </button>
      </form>
    </Wrapper>
  )
}
