import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Palette & tokens ──────────────────────────────
const C = {
  bg: '#050508', surface: '#0f1320', card: '#141926', card2: '#1a2035',
  blue: '#4f8ef7', purple: '#8b5cf6', green: '#22d3a0', yellow: '#fbbf24',
  red: '#f87171', pink: '#f472b6', white: '#f0f4ff',
  muted: 'rgba(240,244,255,0.45)', border: 'rgba(255,255,255,0.07)',
  indigo: '#6366f1'
}

// ─── Helpers ───────────────────────────────────────
function getToken() { return sessionStorage.getItem('skope_admin_token') }
function getAdmin() {
  try { return JSON.parse(sessionStorage.getItem('skope_admin_user') || '{}') } catch { return {} }
}
function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` } }
function fmt(n) { return n == null ? '—' : Number(n).toLocaleString() }
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

// ─── Reusable UI atoms ─────────────────────────────
const Card = ({ children, style = {}, glass = false }) => (
  <div style={{
    background: glass ? 'rgba(15,19,32,0.7)' : C.card,
    border: `1px solid ${C.border}`, borderRadius: 14,
    padding: 20, backdropFilter: glass ? 'blur(12px)' : undefined, ...style
  }}>
    {children}
  </div>
)

const MetricCard = ({ label, value, sub, color = C.blue, icon }) => (
  <Card style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${color}18, transparent)`, borderRadius: '0 14px 0 80px' }} />
    <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>{fmt(value)}</div>
    <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.3)', marginTop: 2 }}>{sub}</div>}
  </Card>
)

const Badge = ({ label, color = C.blue }) => (
  <span style={{
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: `${color}22`, color, border: `1px solid ${color}44`
  }}>{label}</span>
)

const StatusBadge = ({ status }) => {
  const map = { active: [C.green, '●  Active'], banned: [C.red, '⛔  Banned'], new: [C.blue, '🆕  New'], reviewed: [C.muted, '👁  Reviewed'], in_progress: [C.yellow, '🔄  In Progress'], resolved: [C.green, '✅  Resolved'], dismissed: ['rgba(240,244,255,0.2)', '✕  Dismissed'], critical: [C.red, '🚨 Critical'], high: [C.yellow, '⚡ High'], medium: [C.blue, '· Medium'], low: [C.muted, '· Low'], verified: [C.green, '✓ Verified'], unverified: [C.yellow, '? Unverified'], hidden_gem: [C.purple, '💎 Hidden Gem'], unconventional: [C.pink, '✦ Unconventional'] }
  const [color, text] = map[status] || [C.muted, status]
  return <Badge label={text} color={color} />
}

const Btn = ({ children, onClick, color = C.indigo, small = false, danger = false, ghost = false, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: small ? '6px 14px' : '9px 18px', borderRadius: 8,
    background: ghost ? 'transparent' : danger ? `${C.red}22` : `${color}22`,
    border: `1px solid ${ghost ? C.border : danger ? `${C.red}55` : `${color}55`}`,
    color: ghost ? C.muted : danger ? C.red : color,
    fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, fontFamily: 'inherit', transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  }}>{children}</button>
)

const Input = ({ value, onChange, placeholder, type = 'text', style = {} }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{
      background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 8,
      color: C.white, padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', ...style
    }}
  />
)

const Select = ({ value, onChange, options, style = {} }) => (
  <select value={value} onChange={onChange}
    style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
      color: C.muted, padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
      cursor: 'pointer', ...style
    }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
)

const MiniBar = ({ label, value, max, color = C.blue }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: C.muted }}>
      <span>{label}</span><span style={{ color }}>{fmt(value)}</span>
    </div>
    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
      <div style={{ height: '100%', width: `${max > 0 ? (value / max) * 100 : 0}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: 2, transition: 'width 0.6s ease' }} />
    </div>
  </div>
)

const SectionHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.white, margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0 0' }}>{subtitle}</p>}
    </div>
    {action}
  </div>
)

const Divider = () => <div style={{ height: 1, background: C.border, margin: '20px 0' }} />

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
    <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.indigo, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
)

const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px', color: C.muted }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontSize: 14 }}>{text}</div>
  </div>
)

// ─── Simple SVG line chart ─────────────────────────
function LineChart({ data = [], color = C.blue, height = 80 }) {
  if (!data.length) return <div style={{ height, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }} />
  const max = Math.max(...data.map(d => d.count), 1)
  const w = 600, h = height
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * w
    const y = h - (d.count / max) * (h - 10) - 5
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#lg)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * w
        const y = h - (d.count / max) * (h - 10) - 5
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />
      })}
    </svg>
  )
}

// ─── Pie chart SVG ─────────────────────────────────
function PieChart({ data = [], colors = [C.blue, C.purple, C.green, C.yellow, C.pink], size = 120 }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  if (!total) return null
  let angle = 0
  const cx = size / 2, cy = size / 2, r = size / 2 - 4
  const slices = data.map((d, i) => {
    const pct = d.count / total
    const a = pct * Math.PI * 2
    const x1 = cx + Math.cos(angle) * r, y1 = cy + Math.sin(angle) * r
    angle += a
    const x2 = cx + Math.cos(angle) * r, y2 = cy + Math.sin(angle) * r
    const large = a > Math.PI ? 1 : 0
    return { path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, color: colors[i % colors.length], label: d._id || 'Other', pct: Math.round(pct * 100) }
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.9} />)}
      </svg>
      <div>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: C.muted }}>{s.label || 'Unknown'}</span>
            <span style={{ fontSize: 12, color: s.color, marginLeft: 'auto' }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Data table component ─────────────────────────
function DataTable({ columns, rows, onRowClick }) {
  if (!rows.length) return <EmptyState icon="📭" text="No records found" />
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{ padding: '10px 14px', textAlign: 'left', color: 'rgba(240,244,255,0.4)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map(c => (
                <td key={c.key} style={{ padding: '11px 14px', borderBottom: `1px solid ${C.border}`, color: C.white, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.render ? c.render(row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Modal ─────────────────────────────────────────
function Modal({ children, onClose, title, width = 600 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', backdropFilter: 'blur(20px)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ margin: 0, color: C.white, fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════

// ─── OVERVIEW ─────────────────────────────────────
function OverviewSection() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/overview', { headers: authHeaders() })
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))

    const interval = setInterval(() => {
      fetch('/api/admin/overview', { headers: authHeaders() })
        .then(r => r.json()).then(d => setData(d)).catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <Spinner />
  if (!data) return <EmptyState icon="⚠️" text="Failed to load overview data" />

  const m = data.metrics || {}

  return (
    <div>
      <SectionHeader title="Overview" subtitle="Real-time platform metrics — refreshes every 60 seconds" />

      {/* Panic mode warning */}
      {m.panicMode && (
        <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}44`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: C.red, fontSize: 14, fontWeight: 600 }}>
          🚨 PANIC MODE ACTIVE — AI calls are disabled system-wide. Go to Settings to re-enable.
        </div>
      )}

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Total Signups" value={m.totalUsers} icon="👤" color={C.blue} />
        <MetricCard label="Active Today" value={m.activeToday} icon="⚡" color={C.green} sub="Last 24 hours" />
        <MetricCard label="Active This Week" value={m.activeWeek} icon="📅" color={C.yellow} />
        <MetricCard label="Reports Generated" value={m.totalReports} icon="📊" color={C.purple} />
        <MetricCard label="Reports This Week" value={m.reportsThisWeek} icon="📈" color={C.pink} />
        <MetricCard label="Conversion Rate" value={m.totalUsers > 0 ? `${Math.round((m.totalReports / m.totalUsers) * 100)}%` : '—'} icon="🎯" color={C.indigo} sub="Signups → Reports" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 16 }}>
        {/* Signup trend */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16 }}>📈 Signup Trend (Last 30 Days)</div>
          <LineChart data={data.signupTrend || []} color={C.blue} />
        </Card>

        {/* Stream distribution */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16 }}>🎓 Stream Distribution</div>
          <PieChart data={data.streamDistribution || []} />
        </Card>
      </div>

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16 }}>🆕 Recent Signups</div>
          {(data.recentActivity?.users || []).length === 0
            ? <EmptyState icon="👤" text="No signups yet" />
            : (data.recentActivity?.users || []).map((u, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 13, color: C.white }}>{u.displayName || u.email?.split('@')[0]}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{u.email} · {u.stream || 'Unknown stream'}</div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.3)' }}>{fmtDate(u.signupDate)}</div>
              </div>
            ))}
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16 }}>📋 Recent Reports</div>
          {(data.recentActivity?.reports || []).length === 0
            ? <EmptyState icon="📊" text="No reports yet" />
            : (data.recentActivity?.reports || []).map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, color: C.white }}>{r.email}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.3)' }}>{fmtDate(r.createdAt)}</div>
              </div>
            ))}
        </Card>
      </div>

      {/* Unread feedback alerts */}
      {(data.recentActivity?.feedback || []).length > 0 && (
        <Card style={{ marginTop: 16, borderColor: `${C.yellow}44` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.yellow, marginBottom: 12 }}>⚠️ Unreviewed Feedback ({data.recentActivity.feedback.length})</div>
          {data.recentActivity.feedback.map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <div>
                <span style={{ fontSize: 12, color: C.yellow, marginRight: 8 }}>[{f.type}]</span>
                <span style={{ fontSize: 13, color: C.muted }}>{f.message?.slice(0, 80)}…</span>
              </div>
              <StatusBadge status={f.priority} />
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// ─── USERS ────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [streamFilter, setStreamFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [confirmBan, setConfirmBan] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, stream: streamFilter, status: statusFilter, limit: 100 })
    const r = await fetch(`/api/admin/users?${params}`, { headers: authHeaders() })
    const d = await r.json()
    setUsers(d.users || [])
    setTotal(d.total || 0)
    setLoading(false)
  }, [search, streamFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const banUser = async (userId) => {
    await fetch(`/api/admin/users/${userId}/ban`, { method: 'POST', headers: authHeaders() })
    setConfirmBan(null)
    load()
  }

  const deleteUser = async (userId) => {
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', headers: authHeaders() })
    setConfirmDelete(null)
    if (selected?.userId === userId) setSelected(null)
    load()
  }

  const columns = [
    { key: 'displayName', label: 'Name', render: r => <span style={{ color: C.white, fontWeight: 600 }}>{r.displayName || '—'}</span> },
    { key: 'email', label: 'Email' },
    { key: 'stream', label: 'Stream', render: r => r.stream ? <Badge label={r.stream} color={C.blue} /> : '—' },
    { key: 'city', label: 'City' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'lastActive', label: 'Last Active', render: r => fmtDate(r.lastActive) },
    { key: 'actions', label: '', render: r => (
      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
        <Btn small onClick={() => setSelected(r)}>View</Btn>
        <Btn small danger onClick={() => setConfirmBan(r)}>{r.status === 'banned' ? 'Unban' : 'Ban'}</Btn>
        <Btn small danger onClick={() => setConfirmDelete(r)}>Del</Btn>
      </div>
    )}
  ]

  return (
    <div>
      <SectionHeader title={`Users (${fmt(total)})`} subtitle="All registered student accounts" />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, city…" style={{ flex: 1, minWidth: 200 }} />
        <Select value={streamFilter} onChange={e => setStreamFilter(e.target.value)}
          options={[{ value: 'all', label: 'All Streams' }, { value: 'PCM', label: 'PCM' }, { value: 'PCB', label: 'PCB' }, { value: 'Commerce', label: 'Commerce' }, { value: 'Arts', label: 'Arts' }]} />
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          options={[{ value: 'all', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'banned', label: 'Banned' }]} />
        <Btn onClick={load}>Refresh</Btn>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <Spinner /> : <DataTable columns={columns} rows={users} onRowClick={setSelected} />}
      </Card>

      {/* User detail modal */}
      {selected && (
        <Modal title={`User: ${selected.displayName || selected.email}`} onClose={() => setSelected(null)} width={520}>
          {[
            ['Email', selected.email], ['Stream', selected.stream || '—'], ['City', selected.city || '—'],
            ['State', selected.state || '—'], ['Status', <StatusBadge status={selected.status} />],
            ['Signed Up', fmtDate(selected.signupDate)], ['Last Active', fmtDate(selected.lastActive)],
            ['Provider', selected.provider || '—'], ['User ID', <code style={{ fontSize: 11, color: C.muted }}>{selected.userId}</code>]
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
              <span style={{ color: C.muted }}>{k}</span>
              <span style={{ color: C.white }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn danger onClick={() => { setConfirmBan(selected); setSelected(null) }}>{selected.status === 'banned' ? 'Unban User' : 'Ban User'}</Btn>
            <Btn danger onClick={() => { setConfirmDelete(selected); setSelected(null) }}>Delete User</Btn>
          </div>
        </Modal>
      )}

      {/* Ban confirm */}
      {confirmBan && (
        <Modal title="Confirm Action" onClose={() => setConfirmBan(null)} width={400}>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>
            Are you sure you want to <strong style={{ color: C.yellow }}>{confirmBan.status === 'banned' ? 'unban' : 'ban'}</strong> <strong style={{ color: C.white }}>{confirmBan.email}</strong>?
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn danger onClick={() => banUser(confirmBan.userId)}>{confirmBan.status === 'banned' ? 'Unban' : 'Ban'} User</Btn>
            <Btn ghost onClick={() => setConfirmBan(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal title="⚠️ Confirm Deletion" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>
            This will permanently delete <strong style={{ color: C.red }}>{confirmDelete.email}</strong> and their report. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn danger onClick={() => deleteUser(confirmDelete.userId)}>Delete Permanently</Btn>
            <Btn ghost onClick={() => setConfirmDelete(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── REPORTS ──────────────────────────────────────
function ReportsSection() {
  const [reports, setReports] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [fullReport, setFullReport] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, limit: 100 })
    const r = await fetch(`/api/admin/reports?${params}`, { headers: authHeaders() })
    const d = await r.json()
    setReports(d.reports || [])
    setTotal(d.total || 0)
    setLoading(false)
  }, [search])

  const loadDetail = async (report) => {
    setSelected(report)
    setLoadingDetail(true)
    const r = await fetch(`/api/admin/reports/${report._id}`, { headers: authHeaders() })
    const d = await r.json()
    setFullReport(d.report)
    setLoadingDetail(false)
  }

  const deleteReport = async (id) => {
    await fetch(`/api/admin/reports/${id}`, { method: 'DELETE', headers: authHeaders() })
    setConfirmDelete(null); setSelected(null); setFullReport(null); load()
  }

  useEffect(() => { load() }, [load])

  const columns = [
    { key: 'email', label: 'Email', render: r => <span style={{ color: C.white }}>{r.email}</span> },
    { key: 'createdAt', label: 'Generated', render: r => fmtDate(r.createdAt) },
    { key: 'updatedAt', label: 'Last Edited', render: r => fmtDate(r.updatedAt) },
    { key: 'actions', label: '', render: r => (
      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
        <Btn small onClick={() => loadDetail(r)}>View</Btn>
        <Btn small danger onClick={() => setConfirmDelete(r)}>Delete</Btn>
      </div>
    )}
  ]

  const rd = fullReport?.reportData

  return (
    <div>
      <SectionHeader title={`Reports (${fmt(total)})`} subtitle="AI-generated PathReports saved to database" />
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email…" style={{ flex: 1 }} />
        <Btn onClick={load}>Refresh</Btn>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <Spinner /> : <DataTable columns={columns} rows={reports} onRowClick={loadDetail} />}
      </Card>

      {selected && (
        <Modal title={`PathReport — ${selected.email}`} onClose={() => { setSelected(null); setFullReport(null) }} width={720}>
          {loadingDetail ? <Spinner /> : rd ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>ARCHETYPE</div><div style={{ color: C.purple, fontWeight: 700 }}>{rd.archetype || '—'}</div></div>
                <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>STREAM</div><div style={{ color: C.white }}>{rd.stream || '—'}</div></div>
              </div>
              {rd.key_insight && <div style={{ background: `${C.indigo}15`, border: `1px solid ${C.indigo}33`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: C.muted, fontStyle: 'italic' }}>💡 {rd.key_insight}</div>}
              {rd.careers && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 10 }}>🎯 Careers ({rd.careers.length})</div>
                  {rd.careers.map((c, i) => (
                    <div key={i} style={{ marginBottom: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: `1px solid ${C.border}` }}>
                      <div style={{ fontWeight: 600, color: C.blue }}>{c.title} <span style={{ color: C.green, fontSize: 12 }}>({c.match_score || c.match}% match)</span></div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{c.why_it_fits || c.reason}</div>
                    </div>
                  ))}
                </div>
              )}
              {rd.colleges && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 10 }}>🏫 Colleges ({rd.colleges.length})</div>
                  {rd.colleges.slice(0, 5).map((c, i) => (
                    <div key={i} style={{ marginBottom: 6, padding: '8px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: C.white }}>{c.name}</span>
                      <span style={{ color: C.muted }}>{c.location}</span>
                    </div>
                  ))}
                  {rd.colleges.length > 5 && <div style={{ fontSize: 12, color: C.muted, marginTop: 4, paddingLeft: 14 }}>+{rd.colleges.length - 5} more…</div>}
                </div>
              )}
              <Divider />
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn danger onClick={() => setConfirmDelete(selected)}>Delete Report</Btn>
              </div>
            </div>
          ) : <EmptyState icon="📭" text="Could not load report data" />}
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="⚠️ Delete Report" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Permanently delete report for <strong style={{ color: C.red }}>{confirmDelete.email}</strong>?</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn danger onClick={() => deleteReport(confirmDelete._id)}>Delete</Btn>
            <Btn ghost onClick={() => setConfirmDelete(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── COLLEGES ─────────────────────────────────────
function CollegesSection() {
  const [colleges, setColleges] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, type: typeFilter, status: statusFilter, limit: 200 })
    const r = await fetch(`/api/admin/colleges?${params}`, { headers: authHeaders() })
    const d = await r.json()
    setColleges(d.colleges || [])
    setTotal(d.total || 0)
    setLoading(false)
  }, [search, typeFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const openEdit = (c = null) => {
    setEditing(c || 'new')
    setForm(c ? { ...c } : { name: '', state: '', city: '', type: 'Other', status: 'unverified', keyStrengths: '' })
  }

  const saveCollege = async () => {
    const isNew = editing === 'new'
    const url = isNew ? '/api/admin/colleges' : `/api/admin/colleges/${editing._id}`
    await fetch(url, { method: isNew ? 'POST' : 'PUT', headers: authHeaders(), body: JSON.stringify(form) })
    setEditing(null); load()
  }

  const deleteCollege = async (id) => {
    await fetch(`/api/admin/colleges/${id}`, { method: 'DELETE', headers: authHeaders() })
    setConfirmDelete(null); load()
  }

  const columns = [
    { key: 'name', label: 'College', render: r => <span style={{ color: C.white, fontWeight: 600 }}>{r.name}</span> },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'type', label: 'Type', render: r => <Badge label={r.type} color={C.blue} /> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'timesRecommended', label: '# Recommended', render: r => fmt(r.timesRecommended) },
    { key: 'actions', label: '', render: r => (
      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
        <Btn small onClick={() => openEdit(r)}>Edit</Btn>
        <Btn small danger onClick={() => setConfirmDelete(r)}>Del</Btn>
      </div>
    )}
  ]

  const colField = (label, field, type = 'text') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <Input value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} type={type} style={{ width: '100%', boxSizing: 'border-box' }} />
    </div>
  )

  return (
    <div>
      <SectionHeader title={`Colleges (${fmt(total)})`} subtitle="Manage the college recommendation database"
        action={<Btn onClick={() => openEdit()}>+ Add College</Btn>} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name…" style={{ flex: 1 }} />
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          options={['all', 'IIT', 'NIT', 'IIIT', 'Central University', 'Private', 'Deemed', 'Design', 'Law', 'Management', 'Medical', 'Other'].map(v => ({ value: v, label: v === 'all' ? 'All Types' : v }))} />
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          options={[{ value: 'all', label: 'All Status' }, { value: 'verified', label: 'Verified' }, { value: 'unverified', label: 'Unverified' }, { value: 'hidden_gem', label: 'Hidden Gem' }, { value: 'unconventional', label: 'Unconventional' }]} />
        <Btn onClick={load}>Refresh</Btn>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <Spinner /> : <DataTable columns={columns} rows={colleges} />}
      </Card>

      {editing && (
        <Modal title={editing === 'new' ? 'Add New College' : `Edit: ${editing.name}`} onClose={() => setEditing(null)} width={520}>
          {colField('College Name', 'name')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {colField('State', 'state')}
            {colField('City', 'city')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>TYPE</label>
              <Select value={form.type || 'Other'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ width: '100%' }}
                options={['IIT','NIT','IIIT','Central University','Private','Deemed','Design','Law','Management','Medical','Other'].map(v => ({ value: v, label: v }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>STATUS</label>
              <Select value={form.status || 'unverified'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ width: '100%' }}
                options={[{ value: 'verified', label: 'Verified' }, { value: 'unverified', label: 'Unverified' }, { value: 'hidden_gem', label: 'Hidden Gem' }, { value: 'unconventional', label: 'Unconventional' }]} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {colField('Avg Salary (LPA)', 'avgSalaryLPA', 'number')}
            {colField('Avg Placement %', 'avgPlacementPct', 'number')}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>KEY STRENGTHS</label>
            <textarea value={form.keyStrengths || ''} onChange={e => setForm(f => ({ ...f, keyStrengths: e.target.value }))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn color={C.green} onClick={saveCollege}>{editing === 'new' ? 'Create College' : 'Save Changes'}</Btn>
            <Btn ghost onClick={() => setEditing(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="⚠️ Delete College" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Delete <strong style={{ color: C.red }}>{confirmDelete.name}</strong> from the database?</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn danger onClick={() => deleteCollege(confirmDelete._id)}>Delete</Btn>
            <Btn ghost onClick={() => setConfirmDelete(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── ANALYTICS ────────────────────────────────────
function AnalyticsSection() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics', { headers: authHeaders() })
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (!data) return <EmptyState icon="⚠️" text="Failed to load analytics" />

  const maxCity = Math.max(...(data.topCities || []).map(c => c.count), 1)

  return (
    <div>
      <SectionHeader title="Analytics" subtitle="Deep-dive into platform usage patterns and conversion" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <MetricCard label="Total Users" value={data.totalUsers} icon="👥" color={C.blue} />
        <MetricCard label="Reports Generated" value={data.totalReports} icon="📊" color={C.purple} />
        <MetricCard label="Conversion Rate" value={`${data.conversionRate}%`} icon="🎯" color={C.green} sub="Signups → Reports" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16 }}>📅 Daily Signups (30 Days)</div>
          <LineChart data={data.dailySignups || []} color={C.green} height={100} />
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16 }}>🎓 Stream Breakdown</div>
          <PieChart data={data.streamDistribution || []} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16 }}>🏙️ Top 10 Cities</div>
          {(data.topCities || []).map((c, i) => (
            <MiniBar key={i} label={c._id || 'Unknown'} value={c.count} max={maxCity} color={[C.blue, C.purple, C.green, C.yellow, C.pink][i % 5]} />
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16 }}>💬 Feedback by Type</div>
          <PieChart data={data.feedbackByType || []} colors={[C.red, C.yellow, C.blue, C.muted, C.pink, C.green]} />
          {!data.feedbackByType?.length && <EmptyState icon="💬" text="No feedback yet" />}
        </Card>
      </div>
    </div>
  )
}

// ─── FEEDBACK ─────────────────────────────────────
function FeedbackSection() {
  const [feedback, setFeedback] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ status: statusFilter, priority: priorityFilter, limit: 100 })
    const r = await fetch(`/api/admin/feedback?${params}`, { headers: authHeaders() })
    const d = await r.json()
    setFeedback(d.feedback || [])
    setTotal(d.total || 0)
    setLoading(false)
  }, [statusFilter, priorityFilter])

  useEffect(() => { load() }, [load])

  const update = async (id, updates) => {
    await fetch(`/api/admin/feedback/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(updates) })
    setSelected(null); load()
  }

  const columns = [
    { key: 'userName', label: 'User', render: r => <span style={{ color: C.white }}>{r.userName}</span> },
    { key: 'type', label: 'Type', render: r => <Badge label={r.type} color={C.blue} /> },
    { key: 'message', label: 'Message', render: r => <span style={{ color: C.muted }}>{r.message?.slice(0, 60)}…</span> },
    { key: 'priority', label: 'Priority', render: r => <StatusBadge status={r.priority} /> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: 'Submitted', render: r => fmtDate(r.createdAt) },
    { key: 'actions', label: '', render: r => (
      <Btn small onClick={() => { setSelected(r); setNotes(r.internalNotes || '') }}>View</Btn>
    )}
  ]

  return (
    <div>
      <SectionHeader title={`Feedback (${fmt(total)})`} subtitle="Student-submitted feedback, bugs, and feature requests" />
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          options={[{ value: 'all', label: 'All Status' }, { value: 'new', label: 'New' }, { value: 'reviewed', label: 'Reviewed' }, { value: 'in_progress', label: 'In Progress' }, { value: 'resolved', label: 'Resolved' }, { value: 'dismissed', label: 'Dismissed' }]} />
        <Select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          options={[{ value: 'all', label: 'All Priority' }, { value: 'critical', label: '🚨 Critical' }, { value: 'high', label: '⚡ High' }, { value: 'medium', label: '· Medium' }, { value: 'low', label: '· Low' }]} />
        <Btn onClick={load}>Refresh</Btn>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <Spinner /> : <DataTable columns={columns} rows={feedback} onRowClick={r => { setSelected(r); setNotes(r.internalNotes || '') }} />}
      </Card>

      {selected && (
        <Modal title={`Feedback from ${selected.userName}`} onClose={() => setSelected(null)} width={520}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
            {selected.message}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[['Type', selected.type], ['Priority', <StatusBadge status={selected.priority} />], ['Status', <StatusBadge status={selected.status} />], ['Submitted', fmtDate(selected.createdAt)]].map(([k, v]) => (
              <div key={k}><div style={{ fontSize: 11, color: 'rgba(240,244,255,0.3)', marginBottom: 4 }}>{k}</div><div style={{ fontSize: 13, color: C.white }}>{v}</div></div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>INTERNAL NOTES</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Add team notes here…"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn color={C.green} small onClick={() => update(selected._id, { status: 'resolved', internalNotes: notes })}>Mark Resolved</Btn>
            <Btn color={C.yellow} small onClick={() => update(selected._id, { status: 'in_progress', internalNotes: notes })}>In Progress</Btn>
            <Btn color={C.red} small onClick={() => update(selected._id, { status: 'dismissed', internalNotes: notes })}>Dismiss</Btn>
            <Btn ghost small onClick={() => update(selected._id, { internalNotes: notes })}>Save Notes</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── SETTINGS ─────────────────────────────────────
function SettingsSection() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    fetch('/api/admin/settings', { headers: authHeaders() })
      .then(r => r.json()).then(d => {
        setSettings(d.settings)
        setForm(d.settings || {})
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    await fetch('/api/admin/settings', { method: 'PUT', headers: authHeaders(), body: JSON.stringify(form) })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const toggle = (key) => setForm(f => ({ ...f, [key]: !f[key] }))

  if (loading) return <Spinner />

  const Toggle = ({ label, desc, field, warning = false }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 8, border: `1px solid ${warning && form[field] ? `${C.red}44` : C.border}` }}>
      <div>
        <div style={{ fontSize: 14, color: C.white, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{desc}</div>}
      </div>
      <div onClick={() => toggle(field)}
        style={{ width: 44, height: 24, borderRadius: 12, background: form[field] ? (warning ? C.red : C.green) : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: form[field] ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
      </div>
    </div>
  )

  return (
    <div>
      <SectionHeader title="Settings" subtitle="System configuration, feature flags, and API controls"
        action={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {saved && <span style={{ fontSize: 13, color: C.green }}>✓ Saved</span>}
            <Btn color={C.green} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</Btn>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.red, marginBottom: 16 }}>🚨 Emergency Controls</div>
          <Toggle label="PANIC MODE" desc="Disables ALL AI calls system-wide immediately" field="panicMode" warning />
          <Toggle label="Disable New Signups" desc="Prevents new student account creation" field="userSignupsEnabled" />
        </Card>

        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.blue, marginBottom: 16 }}>⚙️ Feature Flags</div>
          <Toggle label="RAG Search" desc="Local knowledge base injection into AI prompts" field="ragSearchEnabled" />
          <Toggle label="PDF Downloads" desc="Allow students to download their PathReport" field="pdfDownloadEnabled" />
          <Toggle label="College Recommendations" desc="Enable college matching in reports" field="collegeRecommendationsEnabled" />
          <Toggle label="AI Conversation" desc="Enable the AI counsellor chat feature" field="aiConversationEnabled" />
        </Card>

        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.yellow, marginBottom: 16 }}>⚡ Rate Limiting</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>AI REQUESTS PER 10 MIN (per IP)</label>
            <Input value={form.aiRateLimitPerTenMin || 15} onChange={e => setForm(f => ({ ...f, aiRateLimitPerTenMin: Number(e.target.value) }))} type="number" style={{ width: 100 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>MAX CONVERSATION EXCHANGES</label>
            <Input value={form.maxConversationExchanges || 20} onChange={e => setForm(f => ({ ...f, maxConversationExchanges: Number(e.target.value) }))} type="number" style={{ width: 100 }} />
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.purple, marginBottom: 16 }}>📧 Admin Contact</div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>ADMIN EMAIL (for system alerts)</label>
            <Input value={form.adminEmail || ''} onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <Divider />
          <div style={{ padding: '10px 14px', background: `${C.indigo}15`, borderRadius: 8, border: `1px solid ${C.indigo}33` }}>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
              🔑 API keys can be updated by setting <code style={{ color: C.indigo }}>GEMINI_API_KEY</code> and <code style={{ color: C.indigo }}>OPENROUTER_API_KEY</code> in the server <code style={{ color: C.indigo }}>.env</code> file and restarting.
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── AUDIT LOG ────────────────────────────────────
function AuditLogSection() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [resourceFilter, setResourceFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ resource: resourceFilter, limit: 200 })
    const r = await fetch(`/api/admin/audit-log?${params}`, { headers: authHeaders() })
    const d = await r.json()
    setLogs(d.logs || [])
    setTotal(d.total || 0)
    setLoading(false)
  }, [resourceFilter])

  useEffect(() => { load() }, [load])

  const actionColor = (a) => {
    if (a?.includes('DELETE')) return C.red
    if (a?.includes('BAN')) return C.yellow
    if (a?.includes('EDIT') || a?.includes('UPDATE')) return C.blue
    if (a?.includes('CREATE')) return C.green
    return C.muted
  }

  const columns = [
    { key: 'adminEmail', label: 'Admin', render: r => <span style={{ color: C.white }}>{r.adminEmail}</span> },
    { key: 'action', label: 'Action', render: r => <Badge label={r.action} color={actionColor(r.action)} /> },
    { key: 'resource', label: 'Resource', render: r => <Badge label={r.resource} color={C.purple} /> },
    { key: 'ipAddress', label: 'IP', render: r => <code style={{ fontSize: 11, color: C.muted }}>{r.ipAddress}</code> },
    { key: 'createdAt', label: 'Time', render: r => fmtDate(r.createdAt) },
    { key: 'actions', label: '', render: r => <Btn small onClick={() => setSelected(r)}>Details</Btn> }
  ]

  return (
    <div>
      <SectionHeader title={`Audit Log (${fmt(total)})`} subtitle="Complete history of all admin actions" />
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Select value={resourceFilter} onChange={e => setResourceFilter(e.target.value)}
          options={[{ value: 'all', label: 'All Resources' }, { value: 'user', label: 'Users' }, { value: 'report', label: 'Reports' }, { value: 'college', label: 'Colleges' }, { value: 'feedback', label: 'Feedback' }, { value: 'settings', label: 'Settings' }]} />
        <Btn onClick={load}>Refresh</Btn>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <Spinner /> : <DataTable columns={columns} rows={logs} onRowClick={setSelected} />}
      </Card>

      {selected && (
        <Modal title={`Audit Detail — ${selected.action}`} onClose={() => setSelected(null)} width={540}>
          {[
            ['Admin', selected.adminEmail], ['Role', selected.adminRole], ['Action', <Badge label={selected.action} color={actionColor(selected.action)} />],
            ['Resource', selected.resource], ['Resource ID', <code style={{ fontSize: 11, color: C.muted }}>{selected.resourceId || '—'}</code>],
            ['IP Address', selected.ipAddress], ['Time', fmtDate(selected.createdAt)]
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
              <span style={{ color: C.muted }}>{k}</span><span style={{ color: C.white }}>{v}</span>
            </div>
          ))}
          {selected.before && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>BEFORE</div>
              <pre style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 12, fontSize: 11, color: C.muted, overflowX: 'auto', margin: 0 }}>{JSON.stringify(selected.before, null, 2)}</pre>
            </div>
          )}
          {selected.after && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: C.green, fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>AFTER</div>
              <pre style={{ background: `${C.green}0a`, borderRadius: 8, padding: 12, fontSize: 11, color: C.green, overflowX: 'auto', margin: 0 }}>{JSON.stringify(selected.after, null, 2)}</pre>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// MAIN DASHBOARD SHELL
// ═══════════════════════════════════════════════════
const NAV = [
  { id: 'overview',   icon: '🏠', label: 'Overview' },
  { id: 'users',      icon: '👥', label: 'Users' },
  { id: 'reports',    icon: '📊', label: 'Reports' },
  { id: 'colleges',   icon: '🏫', label: 'Colleges' },
  { id: 'analytics',  icon: '📈', label: 'Analytics' },
  { id: 'feedback',   icon: '💬', label: 'Feedback' },
  { id: 'settings',   icon: '⚙️', label: 'Settings' },
  { id: 'auditlog',   icon: '🗒️', label: 'Audit Log' },
]

const SECTIONS = {
  overview:  OverviewSection,
  users:     UsersSection,
  reports:   ReportsSection,
  colleges:  CollegesSection,
  analytics: AnalyticsSection,
  feedback:  FeedbackSection,
  settings:  SettingsSection,
  auditlog:  AuditLogSection,
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const admin = getAdmin()

  useEffect(() => {
    if (!getToken()) navigate('/admin/login')
  }, [navigate])

  const logout = () => {
    sessionStorage.removeItem('skope_admin_token')
    sessionStorage.removeItem('skope_admin_user')
    navigate('/admin/login')
  }

  const Section = SECTIONS[active] || OverviewSection

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', fontFamily: "'Inter','DM Sans',sans-serif", color: C.white }}>
      {/* Global keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(240,244,255,0.25) !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64, flexShrink: 0, background: C.surface,
        borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', transition: 'width 0.25s ease', overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 16px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', flexShrink: 0 }}>
            <span style={{ color: C.white }}>Sk</span><span style={{ color: C.indigo }}>o</span><span style={{ color: C.white }}>pe</span>
          </div>
          {sidebarOpen && <div style={{ fontSize: 10, color: 'rgba(240,244,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase' }}>Admin</div>}
        </div>

        {/* Admin info */}
        {sidebarOpen && (
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.white }}>{admin.displayName || 'Founder'}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{admin.email}</div>
            <div style={{ marginTop: 6 }}>
              <Badge label={admin.role === 'founder' ? '👑 Founder' : admin.role} color={C.indigo} />
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: active === item.id ? `${C.indigo}22` : 'transparent',
                borderLeft: active === item.id ? `3px solid ${C.indigo}` : '3px solid transparent',
                color: active === item.id ? C.white : C.muted,
                fontSize: 14, fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s',
                whiteSpace: 'nowrap', marginBottom: 2
              }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* Collapse + logout */}
        <div style={{ padding: 8, borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: C.muted, fontSize: 14, fontFamily: 'inherit', marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && 'Collapse'}
          </button>
          <button onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', background: `${C.red}15`, cursor: 'pointer', color: C.red, fontSize: 14, fontFamily: 'inherit' }}>
            <span style={{ fontSize: 18 }}>🚪</span>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ padding: '16px 28px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface, position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontSize: 14, color: C.muted }}>
            <span style={{ color: C.indigo }}>Skope Admin</span>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
            <span style={{ color: C.white, fontWeight: 600 }}>{NAV.find(n => n.id === active)?.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
            <span style={{ fontSize: 12, color: C.muted }}>System Online</span>
            <div style={{ width: 1, height: 16, background: C.border }} />
            <span style={{ fontSize: 12, color: C.muted }}>{new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {/* Section content */}
        <div style={{ flex: 1, padding: '28px', animation: 'fadeUp 0.3s ease' }} key={active}>
          <Section />
        </div>
      </main>
    </div>
  )
}
