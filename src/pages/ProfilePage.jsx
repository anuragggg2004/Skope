import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, getStoredToken } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

// ─── SVG Icons ────────────────────────────────────────
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconShare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
)
const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

// ─── Field component ──────────────────────────────────
function ProfileField({ label, value, onChange, type = 'text', options, placeholder, hint }) {
  if (options) {
    return (
      <div>
        <label className="font-dm text-[11px] text-[rgba(240,242,255,0.4)] uppercase tracking-[1px] block mb-1.5">{label}</label>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-3 text-white font-dm text-[13px] outline-none focus:border-[rgba(79,142,247,0.4)] transition-all appearance-none cursor-pointer"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(240,242,255,0.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        >
          <option value="" style={{ background: '#0f1320' }}>Select {label}</option>
          {options.map(o => <option key={o} value={o} style={{ background: '#0f1320' }}>{o}</option>)}
        </select>
      </div>
    )
  }
  return (
    <div>
      <label className="font-dm text-[11px] text-[rgba(240,242,255,0.4)] uppercase tracking-[1px] block mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-3 text-white font-dm text-[13px] outline-none focus:border-[rgba(79,142,247,0.4)] transition-all resize-none placeholder:text-[rgba(240,242,255,0.18)]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-3 text-white font-dm text-[13px] outline-none focus:border-[rgba(79,142,247,0.4)] transition-all placeholder:text-[rgba(240,242,255,0.18)]"
        />
      )}
      {hint && <p className="font-dm text-[10px] text-[rgba(240,242,255,0.25)] mt-1">{hint}</p>}
    </div>
  )
}

// ─── Main Profile Page ────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Firebase displayName
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState('')

  // Extended profile stored in localStorage (no backend needed)
  const profileKey = user ? `skope_profile_${user.uid}` : null
  const loadProfile = () => {
    if (!profileKey) return {}
    try { return JSON.parse(localStorage.getItem(profileKey) || '{}') } catch { return {} }
  }

  const [ext, setExt] = useState(loadProfile)
  const [savingExt, setSavingExt] = useState(false)
  const [extMsg, setExtMsg] = useState('')

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [editingName, setEditingName] = useState(false)

  useEffect(() => {
    setDisplayName(user?.displayName || '')
  }, [user])

  const initials = (user?.displayName || user?.email || 'U')
    .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  const hasReport = !!sessionStorage.getItem('pathreport')

  const handleSaveName = async () => {
    if (!displayName.trim()) return
    setSavingName(true); setNameMsg('')
    try {
      // Update display name in localStorage (persisted JWT session)
      const storedUser = localStorage.getItem('skope_auth_user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        parsed.displayName = displayName.trim()
        localStorage.setItem('skope_auth_user', JSON.stringify(parsed))
      }
      setNameMsg('Name saved!')
      setEditingName(false)
    } catch {
      setNameMsg('Failed. Try again.')
    } finally {
      setSavingName(false)
      setTimeout(() => setNameMsg(''), 3000)
    }
  }

  const handleSaveExt = () => {
    setSavingExt(true)
    try {
      localStorage.setItem(profileKey, JSON.stringify(ext))
      setExtMsg('Profile saved!')
    } catch {
      setExtMsg('Failed to save.')
    } finally {
      setSavingExt(false)
      setTimeout(() => setExtMsg(''), 3000)
    }
  }

  const handleLogout = async () => { await logout(); navigate('/') }

  if (!user) { navigate('/login'); return null }

  const isGuest = user.isAnonymous

  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="page-wrapper pt-[80px]">
        <Navbar />
        <div className="max-w-[600px] mx-auto px-6 py-12 max-sm:px-4">

          {/* Header */}
          <div className="text-center mb-8 animate-fadeUp">
            <div className="font-dm text-[10px] font-bold uppercase tracking-[2.5px] text-[rgba(240,242,255,0.3)] mb-2">Your Account</div>
            <h1 className="font-sora text-[30px] font-bold text-white tracking-[-1px]">Profile</h1>
          </div>

          {/* ─── Avatar + Basic Identity ───────────────── */}
          <div className="rounded-[20px] p-[1px] mb-5 animate-fadeUp" style={{ animationDelay: '0.05s', background: 'linear-gradient(135deg, rgba(79,142,247,0.25), rgba(139,92,246,0.25))' }}>
            <div className="bg-[#0c1019] rounded-[19px] p-6 sm:p-8">
              {/* Guest banner */}
              {isGuest && (
                <div className="flex items-center gap-2.5 bg-[rgba(251,191,36,0.06)] border border-[rgba(251,191,36,0.18)] rounded-[12px] px-4 py-3 mb-5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div>
                    <span className="font-sora text-[12px] font-semibold text-[#fbbf24]">Guest mode</span>
                    <span className="font-dm text-[11px] text-[rgba(240,242,255,0.45)] ml-2">Your PathReport won't be saved between sessions.</span>
                  </div>
                  <button onClick={() => navigate('/login')} className="ml-auto font-dm text-[11px] font-semibold text-[#4f8ef7] bg-transparent border-none cursor-pointer hover:underline whitespace-nowrap">Create account</button>
                </div>
              )}

              {/* Avatar */}
              <div className="flex items-center gap-5 mb-6">
                <div className="relative shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-[rgba(79,142,247,0.3)]" />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-sora text-[26px] font-bold"
                      style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', boxShadow: '0 0 30px rgba(79,142,247,0.2)' }}>
                      {initials}
                    </div>
                  )}
                  <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-[#6bcb77] border-2 border-[#0c1019]" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                        className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(79,142,247,0.3)] rounded-[10px] px-3 py-2 text-white font-sora text-[16px] font-bold outline-none focus:border-[rgba(79,142,247,0.6)] min-w-0"
                        autoFocus onKeyDown={e => { if (e.key === 'Enter') handleSaveName() }}
                      />
                      <button onClick={handleSaveName} disabled={savingName}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center border-none cursor-pointer disabled:opacity-50 shrink-0"
                        style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}>
                        {savingName ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <IconCheck />}
                      </button>
                      <button onClick={() => { setEditingName(false); setDisplayName(user?.displayName || '') }}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center border border-[rgba(255,255,255,0.1)] bg-transparent cursor-pointer text-[rgba(240,242,255,0.5)] hover:text-white transition-colors shrink-0">
                        <IconClose />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-sora text-[18px] font-bold text-white truncate">
                        {user.displayName || (isGuest ? 'Guest User' : 'Anonymous')}
                      </h2>
                      {!isGuest && (
                        <button onClick={() => setEditingName(true)}
                          className="w-6 h-6 rounded-[6px] flex items-center justify-center border border-[rgba(255,255,255,0.1)] bg-transparent cursor-pointer text-[rgba(240,242,255,0.4)] hover:text-white hover:border-[rgba(79,142,247,0.3)] transition-all shrink-0">
                          <IconEdit />
                        </button>
                      )}
                    </div>
                  )}
                  {nameMsg && <p className={`font-dm text-[11px] mt-1 ${nameMsg.includes('Failed') ? 'text-[#ff8a8a]' : 'text-[#6bcb77]'}`}>{nameMsg}</p>}
                  <p className="font-dm text-[12px] text-[rgba(240,242,255,0.35)] mt-0.5 truncate">
                    {isGuest ? 'Guest session' : (user.email || user.phoneNumber || 'No email')}
                  </p>
                  {!isGuest && (
                    <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)]">
                      <span className="font-dm text-[10px] text-[rgba(240,242,255,0.35)]">
                        Email Account
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Extended Profile Fields ─────────── */}
              {!isGuest && (
                <div className="space-y-4 pt-5 border-t border-[rgba(255,255,255,0.05)]">
                  <h3 className="font-sora text-[13px] font-semibold text-[rgba(240,242,255,0.6)] flex items-center gap-2">
                    <IconUser /> Personal Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ProfileField
                      label="Age"
                      type="number"
                      value={ext.age || ''}
                      onChange={v => setExt(p => ({ ...p, age: v }))}
                      placeholder="e.g. 17"
                    />
                    <ProfileField
                      label="Gender"
                      value={ext.gender || ''}
                      onChange={v => setExt(p => ({ ...p, gender: v }))}
                      options={['Male', 'Female', 'Non-binary', 'Prefer not to say']}
                    />
                    <ProfileField
                      label="City"
                      value={ext.city || ''}
                      onChange={v => setExt(p => ({ ...p, city: v }))}
                      placeholder="e.g. New Delhi"
                    />
                    <ProfileField
                      label="Class / Board"
                      value={ext.classBoard || ''}
                      onChange={v => setExt(p => ({ ...p, classBoard: v }))}
                      options={['Class 11 - CBSE', 'Class 11 - ICSE', 'Class 11 - State Board', 'Class 12 - CBSE', 'Class 12 - ICSE', 'Class 12 - State Board', 'Appeared (waiting for results)', 'Gap Year']}
                    />
                    <ProfileField
                      label="Stream"
                      value={ext.stream || ''}
                      onChange={v => setExt(p => ({ ...p, stream: v }))}
                      options={['PCM (Physics, Chemistry, Maths)', 'PCB (Physics, Chemistry, Biology)', 'PCMB (All four)', 'Commerce with Maths', 'Commerce without Maths', 'Arts / Humanities', 'Other']}
                    />
                    <ProfileField
                      label="Approx. Marks"
                      value={ext.marks || ''}
                      onChange={v => setExt(p => ({ ...p, marks: v }))}
                      placeholder="e.g. 82% or 75 percentile"
                    />
                  </div>

                  <ProfileField
                    label="About Me (optional)"
                    type="textarea"
                    value={ext.bio || ''}
                    onChange={v => setExt(p => ({ ...p, bio: v }))}
                    placeholder="Anything else about you — what you're interested in, what kind of career you're considering, what confuses you most..."
                  />

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5">
                      <IconLock />
                      <span className="font-dm text-[10px] text-[rgba(240,242,255,0.25)]">Saved locally. Not shared with anyone.</span>
                    </div>
                    <button onClick={handleSaveExt}
                      className="font-sora text-[12px] font-semibold px-5 py-2.5 rounded-[10px] border-none cursor-pointer transition-all text-white"
                      style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}>
                      {savingExt ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                  {extMsg && <p className={`font-dm text-[11px] ${extMsg.includes('Failed') ? 'text-[#ff8a8a]' : 'text-[#6bcb77]'}`}>{extMsg}</p>}
                </div>
              )}
            </div>
          </div>

          {/* ─── PathReport Status ──────────────────── */}
          <div className="glass-card rounded-[16px] p-5 mb-4 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-dm text-[10px] font-bold uppercase tracking-[1.5px] text-[rgba(240,242,255,0.3)] mb-1">PathReport</div>
                {hasReport ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#6bcb77] animate-pulse" />
                    <span className="font-sora text-[13px] font-semibold text-white">Report available</span>
                  </div>
                ) : (
                  <span className="font-sora text-[13px] font-semibold text-[rgba(240,242,255,0.4)]">No report yet</span>
                )}
              </div>
              <div className="flex gap-2">
                {hasReport && (
                  <button onClick={() => navigate('/result')}
                    className="font-dm text-[11px] font-semibold px-3.5 py-2 rounded-[9px] border-none cursor-pointer transition-all"
                    style={{ background: 'rgba(79,142,247,0.1)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.2)' }}>
                    <span className="flex items-center gap-1.5"><IconChart /> View</span>
                  </button>
                )}
                <button onClick={() => navigate('/form')}
                  className="font-dm text-[11px] font-semibold px-3.5 py-2 rounded-[9px] border-none cursor-pointer transition-all text-white flex items-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}>
                  <IconPlus /> {hasReport ? 'Retake Test' : 'Start Test'}
                </button>
              </div>
            </div>
          </div>

          {/* ─── Quick Links ───────────────────────── */}
          <div className="glass-card rounded-[16px] overflow-hidden mb-4 animate-fadeUp" style={{ animationDelay: '0.15s' }}>
            {[
              { Icon: IconShare, label: 'Share Skope', sub: 'Invite friends & classmates', action: () => navigate('/share') },
              { Icon: IconLock, label: 'Privacy', sub: 'Your data stays on your device', action: null }
            ].map((item, i) => (
              <div key={i} onClick={item.action}
                className={`flex items-center gap-4 p-4 border-b border-[rgba(255,255,255,0.04)] last:border-b-0 ${item.action ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors' : ''}`}>
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center bg-[rgba(255,255,255,0.04)] text-[rgba(240,242,255,0.5)] shrink-0">
                  <item.Icon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sora text-[13px] font-semibold text-white">{item.label}</div>
                  <div className="font-dm text-[11px] text-[rgba(240,242,255,0.35)]">{item.sub}</div>
                </div>
                {item.action && <IconChevronRight />}
              </div>
            ))}
          </div>

          {/* ─── Sign Out ──────────────────────────── */}
          {!showLogoutConfirm ? (
            <button onClick={() => setShowLogoutConfirm(true)}
              className="w-full font-dm text-[13px] font-semibold text-[#ff8a8a] py-3.5 rounded-[12px] border border-[rgba(255,107,107,0.15)] bg-[rgba(255,107,107,0.05)] cursor-pointer hover:bg-[rgba(255,107,107,0.09)] transition-all duration-200 animate-fadeUp flex items-center justify-center gap-2"
              style={{ animationDelay: '0.2s' }}>
              <IconLogout />
              {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
            </button>
          ) : (
            <div className="glass-card rounded-[14px] p-4 border border-[rgba(255,107,107,0.2)] animate-fadeUp" style={{ animationDelay: '0.2s' }}>
              <p className="font-dm text-[13px] text-[rgba(240,242,255,0.7)] text-center mb-3">
                {isGuest ? 'Exit guest mode? Your PathReport will be lost.' : 'Are you sure you want to sign out?'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 font-dm text-[13px] font-semibold text-white py-2.5 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-transparent cursor-pointer hover:bg-[rgba(255,255,255,0.04)] transition-all">
                  Cancel
                </button>
                <button onClick={handleLogout}
                  className="flex-1 font-dm text-[13px] font-semibold py-2.5 rounded-[10px] cursor-pointer transition-all flex items-center justify-center gap-2"
                  style={{ background: 'rgba(255,107,107,0.12)', color: '#ff8a8a', border: '1px solid rgba(255,107,107,0.25)' }}>
                  <IconLogout />
                  {isGuest ? 'Exit' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
