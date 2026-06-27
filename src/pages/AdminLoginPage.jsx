import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('atiwary253@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      sessionStorage.setItem('skope_admin_token', data.token)
      sessionStorage.setItem('skope_admin_user', JSON.stringify(data.admin))
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#050508', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'DM Sans', sans-serif"
    }}>
      {/* Ambient orbs */}
      <div style={{ position:'fixed', top:'10%', left:'5%', width:400, height:400, background:'radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)', pointerEvents:'none', borderRadius:'50%' }} />
      <div style={{ position:'fixed', bottom:'15%', right:'8%', width:350, height:350, background:'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', pointerEvents:'none', borderRadius:'50%' }} />

      <div style={{
        width: '100%', maxWidth: 420, padding: '0 20px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ color: '#f0f4ff' }}>Sk</span>
            <svg width="28" height="28" viewBox="0 0 100 100" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 -2px' }}>
              <circle cx="50" cy="50" r="10" fill="#4f8ef7" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="#4f8ef7" strokeWidth="10" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#4f8ef7" strokeWidth="10" />
            </svg>
            <span style={{ color: '#f0f4ff' }}>pe</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(240,244,255,0.4)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 500 }}>
            Admin Portal
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(15,19,32,0.85)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '36px 32px',
          backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,142,247,0.05)'
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0f4ff', margin: '0 0 6px 0' }}>Founder Access</h1>
          <p style={{ fontSize: 13, color: 'rgba(240,244,255,0.4)', margin: '0 0 28px 0' }}>Level 1 — Full system control</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(240,244,255,0.5)', marginBottom: 8, fontWeight: 500, letterSpacing: '0.5px' }}>
                ADMIN EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                  color: '#f0f4ff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(240,244,255,0.5)', marginBottom: 8, fontWeight: 500, letterSpacing: '0.5px' }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                style={{
                  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                  color: '#f0f4ff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
                border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                fontFamily: 'inherit', letterSpacing: '0.3px',
                transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(79,142,247,0.35)'
              }}
            >
              {loading ? 'Authenticating…' : 'Enter Dashboard →'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: '12px', background: 'rgba(79,142,247,0.08)', borderRadius: 8, border: '1px solid rgba(79,142,247,0.2)' }}>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(240,244,255,0.4)', lineHeight: 1.6 }}>
              🔒 Session expires after 1 hour of inactivity. All admin actions are logged in the audit trail.
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(240,244,255,0.25)' }}>
          Not an admin?{' '}
          <a href="/" style={{ color: 'rgba(79,142,247,0.7)', textDecoration: 'none' }}>Return to Skope ↗</a>
        </p>
      </div>
    </div>
  )
}
