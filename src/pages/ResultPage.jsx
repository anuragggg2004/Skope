import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ChatMessage from '../components/ChatMessage'

// ─── Print = screenshot of the dark page ──────────────────
const PRINT_STYLES = `
@media print {
  /* Preserve dark background */
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body, .page-wrapper { background: #080b14 !important; color: #ffffff !important; }

  /* Hide chrome: navbar, bg effects, story scroll, chat, buttons */
  nav, [data-noprint], .grid-bg, .orb-1, .orb-2, button { display: none !important; }

  /* Show all sections in print */
  .print-block { display: block !important; }

  /* Remove page margin */
  @page { margin: 15mm 15mm; }

  /* Layout */
  .page-wrapper { padding: 0 !important; margin: 0 !important; }
  .max-w-\\[820px\\] { max-width: 100% !important; padding: 0 12px !important; }

  /* Keep cards rendering */
  .glass-card { border: 1px solid rgba(255,255,255,0.07) !important; background: #141926 !important; }

  /* Avoid breaking cards across pages */
  .glass-card, [class*='rounded-'] { break-inside: avoid; }
}
`

// ─── Inline Sub-Components ────────────────────────────

function StoryCard({ gradient, emoji, label, value, delay }) {
  return (
    <div
      className="shrink-0 w-[140px] sm:w-[155px] rounded-[16px] p-[3px] animate-fadeUp cursor-default hover:-translate-y-1 transition-transform duration-300"
      style={{ background: gradient, animationDelay: `${delay}s` }}
    >
      <div className="bg-[#0f1320] rounded-[14px] p-4 h-full flex flex-col items-center text-center gap-2">
        <span className="text-[28px]">{emoji}</span>
        <span className="font-dm text-[10px] uppercase tracking-[1.5px] text-[rgba(240,242,255,0.4)]">{label}</span>
        <span className="font-sora text-[13px] font-semibold text-white leading-snug">{value}</span>
      </div>
    </div>
  )
}

function SectionHeader({ tag, title, delay = 0 }) {
  return (
    <div className="mb-5 animate-fadeUp" style={{ animationDelay: `${delay}s` }}>
      <span className="font-dm text-[10px] font-medium uppercase tracking-[2px] text-blue block mb-2">{tag}</span>
      <h2 className="font-sora text-[22px] sm:text-[26px] font-bold text-white tracking-[-0.5px]">{title}</h2>
    </div>
  )
}

function CareerCardRedesigned({ career, index }) {
  const [expanded, setExpanded] = useState(false)
  const gradients = [
    'linear-gradient(135deg, rgba(79,142,247,0.15), rgba(139,92,246,0.08))',
    'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))',
    'linear-gradient(135deg, rgba(107,203,119,0.12), rgba(79,142,247,0.08))'
  ]

  return (
    <div
      className="rounded-[16px] border border-[rgba(255,255,255,0.06)] p-[1px] animate-fadeUp cursor-pointer group"
      style={{ animationDelay: `${0.1 + index * 0.08}s` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div
        className="rounded-[15px] p-5 sm:p-6 h-full transition-all duration-300"
        style={{ background: gradients[index % 3] }}
      >
        {/* Number + Title */}
        <div className="flex items-start gap-3 mb-3">
          <span className="font-sora text-[32px] font-bold text-[rgba(255,255,255,0.08)] leading-none select-none">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <h3 className="font-sora text-[17px] font-bold text-white leading-snug">{career.title}</h3>
            {career.earning_range && (
              <span className="font-dm text-[12px] text-[rgba(240,242,255,0.45)] mt-0.5 block">{career.earning_range}</span>
            )}
          </div>
        </div>

        {/* Why it fits */}
        <p className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-[1.65] mb-3">
          {career.why_it_fits}
        </p>

        {/* Exams */}
        {career.entrance_exams && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {career.entrance_exams.map((exam, i) => (
              <span
                key={i}
                className="font-dm text-[10px] font-medium text-blue bg-[rgba(79,142,247,0.1)] px-2.5 py-1 rounded-full border border-[rgba(79,142,247,0.2)]"
              >
                {exam}
              </span>
            ))}
          </div>
        )}

        {/* Reality Check — expandable */}
        {career.reality_check && (
          <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[200px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
            <div className="bg-[rgba(255,217,61,0.08)] border border-[rgba(255,217,61,0.18)] rounded-[10px] px-4 py-3">
              <span className="font-dm text-[12px] text-[#ffd93d] leading-relaxed block">
                ⚡ {career.reality_check}
              </span>
            </div>
          </div>
        )}

        {/* Expand hint */}
        <div className="flex items-center justify-end mt-2">
          <span className={`font-dm text-[11px] text-[rgba(240,242,255,0.3)] transition-all duration-200 ${expanded ? 'opacity-0' : 'opacity-100'}`}>
            tap for reality check →
          </span>
        </div>
      </div>
    </div>
  )
}

function CollegeCardRedesigned({ college, index }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="glass-card rounded-[16px] p-5 sm:p-6 animate-fadeUp cursor-pointer hover:border-[rgba(79,142,247,0.2)] transition-all duration-200"
      style={{ animationDelay: `${0.05 + index * 0.06}s` }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-sora text-[15px] font-bold text-white">{college.name}</h4>
            {college.is_hidden_gem && (
              <span className="font-dm text-[9px] font-bold bg-gradient-to-r from-[rgba(251,191,36,0.2)] to-[rgba(251,191,36,0.1)] text-[#fbbf24] px-2.5 py-0.5 rounded-full border border-[rgba(251,191,36,0.3)]">
                💎 HIDDEN GEM
              </span>
            )}
          </div>
          <p className="font-dm text-[12px] text-[rgba(240,242,255,0.4)]">
            {college.location || college.city} · {college.type}
          </p>
        </div>
        {(college.annual_fee || college.approx_annual_fee) && (
          <div className="text-right shrink-0">
            <span className="font-sora text-[14px] font-semibold text-[#6bcb77]">{college.annual_fee || college.approx_annual_fee}</span>
            <span className="font-dm text-[10px] text-[rgba(240,242,255,0.3)] block">/year</span>
          </div>
        )}
      </div>

      {/* Why fits */}
      <p className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-[1.65]">
        {college.why_fits || college.why_this_fits}
      </p>

      {/* Caution — expandable */}
      {college.caution && (
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[150px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
          <div className="bg-[rgba(255,107,107,0.06)] border border-[rgba(255,107,107,0.15)] rounded-[10px] px-4 py-3">
            <span className="font-dm text-[12px] text-[#ff8a8a] leading-relaxed block">
              ⚠️ {college.caution}
            </span>
          </div>
        </div>
      )}

      {college.caution && !expanded && (
        <div className="flex items-center gap-1 mt-2">
          <span className="font-dm text-[11px] text-[rgba(240,242,255,0.25)]">tap for trade-offs →</span>
        </div>
      )}
    </div>
  )
}

// ─── Main Result Page ─────────────────────────────────

export default function ResultPage() {
  const navigate = useNavigate()
  const [pathReport, setPathReport] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [showChips, setShowChips] = useState(true)
  const [activeTab, setActiveTab] = useState('careers')
  const [showSharePopup, setShowSharePopup] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('pathreport')
    if (!stored) {
      navigate('/form')
      return
    }
    setPathReport(JSON.parse(stored))
  }, [navigate])

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = sessionStorage.getItem('pathreport')
      const shownThisSession = sessionStorage.getItem('share_popup_shown')
      if (stored && !shownThisSession) {
        setShowSharePopup(true)
        sessionStorage.setItem('share_popup_shown', 'true')
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, chatLoading])

  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
  }

  const sendChat = async (overrideMsg) => {
    const msg = (overrideMsg || chatInput).trim()
    if (!msg || chatLoading) return

    setChatInput('')
    setShowChips(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const userMsg = { role: 'user', content: msg }
    setChatHistory(prev => [...prev, userMsg])
    setChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, pathreport: pathReport, history: chatHistory })
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't respond. Please try again." }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() }
  }

  const handleChipClick = (text) => { setShowChips(false); sendChat(text) }

  // ─── Print the page as it looks ─────────────────
  const handleDownloadPDF = () => {
    window.print()
  }

  useEffect(() => {
    const id = 'skope-print-styles'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = PRINT_STYLES
      document.head.appendChild(style)
    }
  }, [])

  if (!pathReport) return null

  const chips = [
    'Which college is most realistic for me?',
    'What should I do in the next 6 months?',
    'Compare my top 2 college options',
    'I forgot to mention something important'
  ]

  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />

      <div className="page-wrapper">
        <Navbar />

        <div className="max-w-[820px] mx-auto px-6 py-10 sm:py-14 max-sm:px-4">


          {/* ═══════════════════════════════════════════ */}
          {/* HERO */}
          {/* ═══════════════════════════════════════════ */}
          <div className="text-center mb-10 animate-fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(107,203,119,0.2)] bg-[rgba(107,203,119,0.06)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#6bcb77] animate-pulse" />
              <span className="font-dm text-[12px] text-[rgba(240,242,255,0.6)]">Your PathReport is ready</span>
            </div>
            <h1 className="font-sora text-[38px] sm:text-[46px] font-bold text-white tracking-[-1.5px] leading-[1.1] mb-3">
              Here's your <span className="text-gradient">scope</span>.
            </h1>
            <p className="font-dm text-[14px] text-[rgba(240,242,255,0.4)] max-w-[420px] mx-auto mb-6">
              Tap any card to see trade-offs and reality checks.
            </p>
            {/* ✅ DOWNLOAD PDF BUTTON */}
            <button
              data-noprint
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 font-dm text-[13px] font-semibold px-5 py-2.5 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-[rgba(240,242,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(79,142,247,0.3)] transition-all duration-200 cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </button>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* STORY CARDS — Horizontal scroll */}
          {/* ═══════════════════════════════════════════ */}
          <div data-noprint className="flex gap-3 overflow-x-auto pb-4 mb-8 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            <StoryCard
              gradient="linear-gradient(135deg, #4f8ef7, #8b5cf6)"
              emoji="🎯"
              label="Top Career"
              value={pathReport.careers?.[0]?.title || '—'}
              delay={0.05}
            />
            <StoryCard
              gradient="linear-gradient(135deg, #8b5cf6, #ec4899)"
              emoji="🏫"
              label="Best Fit College"
              value={pathReport.colleges?.[0]?.name?.split(' ').slice(0, 3).join(' ') || '—'}
              delay={0.1}
            />
            <StoryCard
              gradient="linear-gradient(135deg, #6bcb77, #4f8ef7)"
              emoji="💪"
              label="Top Strength"
              value={pathReport.strengths?.[0]?.split('(')[0]?.trim().slice(0, 35) || '—'}
              delay={0.15}
            />
            <StoryCard
              gradient="linear-gradient(135deg, #fbbf24, #f97316)"
              emoji="⚡"
              label="Reality Check"
              value={pathReport.gaps?.[0]?.split('—')[0]?.trim().slice(0, 35) || '—'}
              delay={0.2}
            />
            <StoryCard
              gradient="linear-gradient(135deg, #ec4899, #8b5cf6)"
              emoji="🚀"
              label="Emerging Role"
              value={pathReport.emerging_roles?.[0]?.title || '—'}
              delay={0.25}
            />
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* KEY INSIGHT — Hero card */}
          {/* ═══════════════════════════════════════════ */}
          <div className="relative rounded-[18px] p-[1px] mb-5 animate-fadeUp overflow-hidden" style={{ animationDelay: '0.1s', background: 'linear-gradient(135deg, rgba(79,142,247,0.4), rgba(139,92,246,0.4))' }}>
            <div className="bg-[#0c1019] rounded-[17px] p-6 sm:p-7">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-[7px] flex items-center justify-center bg-[rgba(79,142,247,0.2)]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <span className="font-dm text-[10px] font-bold uppercase tracking-[2px] text-blue">Key Insight</span>
              </div>
              <p className="font-sora text-[18px] sm:text-[22px] font-semibold text-white leading-[1.45] tracking-[-0.3px]">
                "{pathReport.key_insight}"
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* KEY PERSPECTIVE */}
          {/* ═══════════════════════════════════════════ */}
          {(pathReport.key_perspective || pathReport.wide_perspective) && (
            <div className="glass-card rounded-[16px] p-5 sm:p-6 mb-5 border-l-[3px] border-l-[#fbbf24] animate-fadeUp" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-[7px] flex items-center justify-center bg-[rgba(251,191,36,0.12)]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7v0A2.5 2.5 0 012 9.5v5A2.5 2.5 0 004.5 17v0A2.5 2.5 0 007 19.5v0A2.5 2.5 0 009.5 22h5a2.5 2.5 0 002.5-2.5v0A2.5 2.5 0 0019.5 17v0A2.5 2.5 0 0022 14.5v-5A2.5 2.5 0 0019.5 7v0A2.5 2.5 0 0017 4.5v0A2.5 2.5 0 0014.5 2z"/>
                  </svg>
                </div>
                <span className="font-dm text-[10px] font-bold uppercase tracking-[2px] text-[#fbbf24]">The Real Perspective</span>
              </div>
              <p className="font-dm text-[14px] text-[rgba(240,242,255,0.6)] leading-[1.7] italic">
                "{pathReport.key_perspective || pathReport.wide_perspective}"
              </p>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* PROFILE SUMMARY */}
          {/* ═══════════════════════════════════════════ */}
          <div className="glass-card rounded-[16px] p-5 sm:p-6 mb-5 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <span className="font-dm text-[10px] font-bold uppercase tracking-[2px] text-[rgba(240,242,255,0.35)] block mb-3">About You</span>
            <p className="font-dm text-[14px] text-[rgba(240,242,255,0.55)] leading-[1.75]">
              {pathReport.profile_summary}
            </p>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* STRENGTHS & GAPS — Side by side pills */}
          {/* ═══════════════════════════════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8 animate-fadeUp" style={{ animationDelay: '0.25s' }}>
            <div className="glass-card rounded-[16px] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#6bcb77]" />
                <span className="font-dm text-[10px] font-bold uppercase tracking-[2px] text-[#6bcb77]">Strengths</span>
              </div>
              <ul className="space-y-2.5">
                {pathReport.strengths?.map((s, i) => (
                  <li key={i} className="font-dm text-[13px] text-[rgba(240,242,255,0.65)] flex items-start gap-2.5 leading-[1.5]">
                    <span className="text-[#6bcb77] shrink-0 mt-0.5 text-[11px]">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-[16px] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#ff6b6b]" />
                <span className="font-dm text-[10px] font-bold uppercase tracking-[2px] text-[#ff6b6b]">Gaps to Watch</span>
              </div>
              <ul className="space-y-2.5">
                {pathReport.gaps?.map((g, i) => (
                  <li key={i} className="font-dm text-[13px] text-[rgba(240,242,255,0.65)] flex items-start gap-2.5 leading-[1.5]">
                    <span className="text-[#ff6b6b] shrink-0 mt-0.5 text-[11px]">!</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* TAB NAVIGATION — Careers / Colleges / Courses */}
          {/* ═══════════════════════════════════════════ */}
          <div data-noprint className="flex gap-1 p-1 bg-[rgba(15,19,32,0.8)] rounded-[12px] border border-[rgba(79,142,247,0.1)] mb-6 animate-fadeUp" style={{ animationDelay: '0.3s' }}>
            {[
              { key: 'careers', label: `Careers (${pathReport.careers?.length || 0})` },
              { key: 'colleges', label: `Colleges (${pathReport.colleges?.length || 0})` },
              { key: 'courses', label: `Courses (${(pathReport.recommended_courses?.length || 0) + (pathReport.hidden_courses?.length || 0)})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 font-sora text-[12px] sm:text-[13px] font-semibold py-2.5 rounded-[10px] border-none cursor-pointer transition-all duration-200
                  ${activeTab === tab.key
                    ? 'bg-[rgba(79,142,247,0.15)] text-white shadow-[0_2px_10px_rgba(79,142,247,0.1)]'
                    : 'bg-transparent text-[rgba(240,242,255,0.4)] hover:text-[rgba(240,242,255,0.6)]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── Tab Content — Careers ─── */}
          <div className={activeTab === 'careers' ? 'block mb-8' : 'hidden print-block mb-8'}>
            <SectionHeader tag="Your Matches" title="Career Paths" delay={0.32} />
            <div className="grid grid-cols-1 gap-3.5">
              {pathReport.careers?.map((career, i) => (
                <CareerCardRedesigned key={i} career={career} index={i} />
              ))}
            </div>
          </div>

          {/* ─── Tab Content — Colleges ─── */}
          <div className={activeTab === 'colleges' ? 'block mb-8' : 'hidden print-block mb-8'}>
            <SectionHeader tag="Filtered for You" title="College Recommendations" delay={0.32} />
            <div className="grid grid-cols-1 gap-3">
              {pathReport.colleges?.map((college, i) => (
                <CollegeCardRedesigned key={i} college={college} index={i} />
              ))}
            </div>
          </div>

          {/* ─── Tab Content — Courses ─── */}
          <div className={activeTab === 'courses' ? 'block mb-8' : 'hidden print-block mb-8'}>
            {pathReport.recommended_courses?.length > 0 && (
              <div className="mb-8">
                <SectionHeader tag="What to Study" title="Standard Recommended Courses" delay={0.32} />
                <div className="grid grid-cols-1 gap-3">
                  {pathReport.recommended_courses.map((course, i) => (
                    <div key={i} className="glass-card rounded-[16px] p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-sora text-[15px] font-bold text-white leading-snug">{course.course_name}</h4>
                        <span className={`shrink-0 font-dm text-[9px] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded-full border whitespace-nowrap
                          ${course.ai_relevance?.toLowerCase().includes('proof')
                            ? 'text-[#6bcb77] bg-[rgba(107,203,119,0.1)] border-[rgba(107,203,119,0.25)]'
                            : course.ai_relevance?.toLowerCase().includes('augment')
                              ? 'text-blue bg-[rgba(79,142,247,0.1)] border-[rgba(79,142,247,0.25)]'
                              : 'text-[rgba(240,242,255,0.5)] bg-[rgba(240,242,255,0.05)] border-[rgba(240,242,255,0.15)]'
                          }`}>
                          {course.ai_relevance}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                        <span className="font-dm text-[12px] text-[rgba(240,242,255,0.45)]">📍 {course.offered_at}</span>
                        <span className="font-dm text-[12px] text-[rgba(240,242,255,0.45)]">⏱ {course.duration}</span>
                      </div>
                      <p className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-relaxed">{course.why_this_course}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pathReport.hidden_courses?.length > 0 && (
              <div className="mb-8">
                <SectionHeader tag="Niche & High Demand" title="Hidden Gem Fields" delay={0.32} />
                <div className="grid grid-cols-1 gap-4">
                  {pathReport.hidden_courses.map((course, i) => (
                    <div key={i} className="glass-card rounded-[16px] p-5 border-l-[3px] border-l-[#fbbf24]">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="font-dm text-[10px] font-bold uppercase tracking-[1.5px] text-[#fbbf24] mb-1 block">💎 Niche Course</span>
                          <h4 className="font-sora text-[15px] font-bold text-white leading-snug">{course.course_name} ({course.field})</h4>
                        </div>
                        {course.starting_salary && (
                          <div className="text-right shrink-0">
                            <span className="font-sora text-[14px] font-semibold text-[#6bcb77]">{course.starting_salary}</span>
                            <span className="font-dm text-[10px] text-[rgba(240,242,255,0.3)] block">starting</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 font-dm text-[12px] text-[rgba(240,242,255,0.45)]">
                        <span>📍 Best Institute: {course.offered_at}</span>
                        <span>🔑 Entrance Path: {course.how_to_enter}</span>
                      </div>
                      <p className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-relaxed mb-3">
                        <strong className="text-white">Why it's hidden:</strong> {course.why_nobody_knows}
                      </p>
                      <div className="bg-[rgba(79,142,247,0.04)] border border-[rgba(79,142,247,0.1)] rounded-[10px] p-3.5 text-[12px] font-dm space-y-1 text-[rgba(240,242,255,0.7)]">
                        <div>
                          <span className="text-blue font-bold">Market Demand:</span> {course.market_demand}
                        </div>
                        <div>
                          <span className="text-blue font-bold">Why it fits you:</span> {course.why_this_student}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* EMERGING ROLES */}
          {/* ═══════════════════════════════════════════ */}
          {pathReport.emerging_roles?.length > 0 && (
            <div className="mb-10 animate-fadeUp" style={{ animationDelay: '0.35s' }}>
              <SectionHeader tag="Future Outlook" title="Emerging Roles for You" delay={0.35} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {pathReport.emerging_roles.map((role, i) => (
                  <div key={i} className="glass-card rounded-[16px] p-5 flex flex-col justify-between border-t-[3px] border-t-purple">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[16px]">🚀</span>
                        <h4 className="font-sora text-[15px] font-bold text-white">{role.title}</h4>
                      </div>
                      <p className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-relaxed mb-4">{role.description}</p>
                    </div>
                    <div className="bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.15)] rounded-[10px] px-3.5 py-2.5">
                      <span className="font-dm text-[12px] text-[#c084fc] leading-relaxed block">
                        💡 <strong className="text-white">Why relevant:</strong> {role.why_relevant}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* AI COUNSELLOR CHAT */}
          {/* ═══════════════════════════════════════════ */}
          <div data-noprint className="animate-fadeUp" style={{ animationDelay: '0.4s' }}>
            <SectionHeader tag="Keep Going" title="Ask your AI Counsellor" delay={0.4} />

            <div className="glass-card rounded-[16px] overflow-hidden">
              {/* Messages */}
              <div className="max-h-[400px] overflow-y-auto p-5 flex flex-col gap-3">
                <ChatMessage message={{
                  role: 'assistant',
                  content: "Your PathReport is loaded. Ask me anything — compare colleges, dig into a career, clarify exams, or update something you forgot to mention. I'll adjust your recommendations."
                }} />

                {chatHistory.map((msg, i) => (
                  <ChatMessage key={i} message={msg} />
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-navy3 border border-[rgba(79,142,247,0.15)] rounded-[12px_12px_12px_4px] px-4 py-3 flex items-center gap-1.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chips */}
              {showChips && (
                <div className="px-5 pb-3 flex flex-wrap gap-2">
                  {chips.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleChipClick(chip)}
                      className="font-dm text-[12px] text-[rgba(240,242,255,0.55)] bg-navy3 border border-[rgba(79,142,247,0.12)] rounded-full px-3.5 py-1.5 cursor-pointer hover:border-blue hover:text-blue transition-all duration-200"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex items-end gap-2.5 px-5 py-4 border-t border-[rgba(79,142,247,0.08)] bg-[rgba(15,19,32,0.3)]">
                <textarea
                  ref={textareaRef}
                  className="flex-1 bg-navy3 border border-[rgba(79,142,247,0.12)] rounded-[10px] px-4 py-2.5 text-white font-dm text-[14px] outline-none focus:border-blue transition-colors placeholder:text-[rgba(240,242,255,0.2)] resize-none"
                  rows={1}
                  style={{ maxHeight: '80px' }}
                  placeholder="Ask anything about your PathReport..."
                  value={chatInput}
                  onChange={(e) => { setChatInput(e.target.value); handleTextareaResize(e) }}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={() => sendChat()}
                  disabled={chatLoading || !chatInput.trim()}
                  className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-blue to-purple flex items-center justify-center cursor-pointer border-none hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Share Pop-up Modal */}
      {showSharePopup && (
        <div data-noprint className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,7,12,0.8)] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#0c1019] border border-[rgba(79,142,247,0.3)] rounded-[20px] p-6 max-w-[400px] w-full text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-fadeUp">
            {/* Share Icon */}
            <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-blue to-purple flex items-center justify-center mx-auto mb-4 shadow-[0_4px_20px_rgba(79,142,247,0.25)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </div>

            <h3 className="font-sora text-[18px] font-bold text-white mb-2">Spread the Word! 🚀</h3>
            <p className="font-dm text-[14px] text-[rgba(240,242,255,0.7)] leading-[1.6] mb-6">
              "If you like that, please share with your friends, colleagues, brother and sister siblings."
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  const shareUrl = 'https://skope-app.onrender.com'
                  const shareText = "Just discovered Skope — an AI counsellor that gives brutally honest career advice for Indian Class 12 students. No sugar coating. Hidden gem colleges, unknown courses, and real talk about your actual marks. Try it free."
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: 'Skope — Brutally Honest Career Advice',
                        text: shareText,
                        url: shareUrl
                      })
                      setShowSharePopup(false)
                    } catch (e) {
                      console.log(e)
                      navigate('/share')
                    }
                  } else {
                    navigate('/share')
                  }
                }}
                className="w-full font-sora text-[13px] font-semibold text-white py-3 rounded-[10px] cursor-pointer border-none bg-gradient-to-r from-blue to-purple hover:opacity-95 transition-opacity"
              >
                📤 Share Now
              </button>
              <button
                onClick={() => setShowSharePopup(false)}
                className="w-full font-dm text-[13px] font-semibold text-[rgba(240,242,255,0.4)] py-2.5 rounded-[10px] cursor-pointer border-none bg-transparent hover:text-[rgba(240,242,255,0.6)] transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
