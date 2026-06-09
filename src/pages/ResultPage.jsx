import { useState, useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ChatMessage from '../components/ChatMessage'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'

// ─── Print = screenshot of the dark page ──────────────────
const PRINT_STYLES = `
@media print {
  /* Preserve dark background */
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body, .page-wrapper { background: #080b14 !important; color: #ffffff !important; }

  /* Hide chrome: navbar, bg effects, chat, buttons */
  nav, .grid-bg, .orb-1, .orb-2, button, [data-noprint] { display: none !important; }

  /* Allow story cards to wrap in print so all 5 are visible */
  .scrollbar-hide { overflow-x: visible !important; flex-wrap: wrap !important; justify-content: center !important; }

  /* Remove page margin */
  @page { margin: 10mm 10mm; }

  /* Layout */
  .page-wrapper { padding: 0 !important; margin: 0 !important; }
  .max-w-\\[820px\\] { max-width: 100% !important; padding: 0 12px !important; }

  /* Keep cards rendering */
  .glass-card { border: 1px solid rgba(255,255,255,0.07) !important; background: #141926 !important; }

  /* Avoid breaking cards across pages */
  .glass-card, [class*='rounded-'] { break-inside: avoid; }
}
`

const ARCHETYPE_EMOJIS = {
  'The Builder': '🛠️',
  'The Explorer': '🔭',
  'The Creator': '🎨',
  'The Strategist': '🎯',
  'The Analyst': '📊',
  'The Innovator': '💡',
  'The Connector': '🤝'
}

// ─── Inline Sub-Components ────────────────────────────

function StoryCard({ config, delay }) {
  const [hovered, setHovered] = useState(false)
  const { icon, label, value, badge, badgeIcon, bg, orb1, orb2, borderGlow, textAccent, pattern } = config

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.04 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="shrink-0 w-[148px] sm:w-[162px] h-[210px] sm:h-[230px] rounded-[22px] cursor-default relative overflow-hidden snap-start"
      style={{ perspective: 800 }}
    >
      {/* Rotating glow border ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', inset: -2, borderRadius: 24, zIndex: 0,
          background: `conic-gradient(from 0deg, transparent 60%, ${borderGlow}, transparent 80%)`,
          opacity: hovered ? 1 : 0.5,
          transition: 'opacity 0.4s'
        }}
      />

      {/* Card body */}
      <div
        className="absolute inset-[2px] rounded-[21px] overflow-hidden flex flex-col"
        style={{ background: bg, zIndex: 1 }}
      >
        {/* Floating orb 1 */}
        <motion.div
          animate={{ x: [0, 14, 0], y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: -18, right: -18,
            width: 100, height: 100, borderRadius: '50%',
            background: orb1, filter: 'blur(32px)', opacity: 0.7
          }}
        />
        {/* Floating orb 2 */}
        <motion.div
          animate={{ x: [0, -12, 0], y: [0, 15, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute', bottom: 40, left: -10,
            width: 70, height: 70, borderRadius: '50%',
            background: orb2, filter: 'blur(22px)', opacity: 0.5
          }}
        />

        {/* Subtle dot pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '18px 18px'
        }} />

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-between p-4 relative z-10">
          {/* Top: icon + badge */}
          <div className="flex items-start justify-between">
            {/* Icon box */}
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0
            }}>
              {icon}
            </div>
            {/* Badge */}
            {badge && (
              <motion.div
                animate={{ scale: hovered ? [1, 1.08, 1] : 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 999, padding: '3px 8px',
                  display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                {badgeIcon && <span style={{ fontSize: 10 }}>{badgeIcon}</span>}
                <span className="font-mono text-[8.5px] font-bold text-white/80">{badge}</span>
              </motion.div>
            )}
          </div>

          {/* Center: large value */}
          <div>
            <div className="font-dm text-[9px] uppercase tracking-[2.5px] mb-1.5" style={{ color: textAccent }}>
              {label}
            </div>
            <div className="font-sora text-[15px] font-extrabold text-white leading-snug drop-shadow-sm">
              {value}
            </div>
          </div>
        </div>

        {/* Frosted bottom strip */}
        <div style={{
          background: 'rgba(0,0,0,0.28)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '7px 14px',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: borderGlow, flexShrink: 0 }}
          />
          <span className="font-dm text-[9px] text-white/50 truncate">AI analysed</span>
        </div>
      </div>
    </motion.div>
  )
}


// ─── Animated progress bar (dashboard-inspired) ─────
function AnimatedBar({ pct, color = 'from-[#4f8ef7] to-[#8b5cf6]', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  return (
    <div ref={ref} className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
        initial={{ width: 0 }}
        animate={inView ? { width: `${pct}%` } : { width: 0 }}
        transition={{ duration: 1.4, ease: 'easeOut', delay }}
      />
    </div>
  )
}

// ─── Animated counter number ──────────────────────────
function CountUp({ to, active, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / 1200, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(ease * to))
      if (progress < 1) requestAnimationFrame(step)
      else setVal(to)
    }
    requestAnimationFrame(step)
  }, [active, to])
  return <>{val}{suffix}</>
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
  const cardRef = useRef(null)
  const inView = useInView(cardRef, { once: true, margin: '-10%' })
  const [hovered, setHovered] = useState(false)

  const configs = [
    { bg:'linear-gradient(145deg,#0d1b3e,#0f1428)', orb1:'radial-gradient(circle,#4f8ef755,transparent)', orb2:'radial-gradient(circle,#8b5cf640,transparent)', glow:'#4f8ef7', barColor:'from-[#4f8ef7] to-[#8b5cf6]', textAccent:'#7eb3ff' },
    { bg:'linear-gradient(145deg,#1a0d3e,#160d38)', orb1:'radial-gradient(circle,#8b5cf755,transparent)', orb2:'radial-gradient(circle,#ec489940,transparent)', glow:'#a78bfa', barColor:'from-[#8b5cf6] to-[#ec4899]', textAccent:'#c4b5fd' },
    { bg:'linear-gradient(145deg,#0d2e2a,#0c2822)', orb1:'radial-gradient(circle,#22d3a055,transparent)', orb2:'radial-gradient(circle,#4f8ef740,transparent)', glow:'#22d3a0', barColor:'from-[#22d3a0] to-[#4f8ef7]', textAccent:'#6ee7b7' },
  ]
  const c = configs[index % 3]
  const matchScore = career.match_score || career.matchScore || (90 - index * 8)

  return (
    <div
      ref={cardRef}
      className="relative rounded-[22px] overflow-hidden cursor-pointer mb-0"
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rotating glow border */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        style={{
          position:'absolute', inset:-2, borderRadius:24, zIndex:0,
          background:`conic-gradient(from 0deg, transparent 60%, ${c.glow}, transparent 78%)`,
          opacity: hovered ? 0.9 : 0.4, transition:'opacity 0.4s'
        }}
      />
      <div className="absolute inset-[2px] rounded-[21px] overflow-hidden" style={{ background: c.bg, zIndex:1 }}>
        {/* Floating orbs */}
        <motion.div animate={{x:[0,16,0],y:[0,-12,0]}} transition={{duration:5,repeat:Infinity,ease:'easeInOut'}} style={{ position:'absolute',top:-20,right:-20,width:110,height:110,borderRadius:'50%',background:c.orb1,filter:'blur(30px)',opacity:0.8 }} />
        <motion.div animate={{x:[0,-12,0],y:[0,14,0]}} transition={{duration:7,repeat:Infinity,ease:'easeInOut',delay:1.5}} style={{ position:'absolute',bottom:20,left:-15,width:80,height:80,borderRadius:'50%',background:c.orb2,filter:'blur(22px)',opacity:0.5 }} />
        {/* Dot grid */}
        <div style={{ position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)',backgroundSize:'18px 18px' }} />

        {/* Content */}
        <div className="relative z-10 p-5 sm:p-6">
          {/* Number + Title + Match Score */}
          <div className="flex items-start gap-3 mb-4">
            <span className="font-sora text-[38px] font-bold leading-none select-none" style={{ color: c.glow + '20' }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-sora text-[17px] font-bold text-white leading-snug">{career.title}</h3>
                <span className="font-mono text-[14px] font-extrabold shrink-0" style={{ color: c.glow }}>
                  <CountUp to={matchScore} active={inView} suffix="%" />
                </span>
              </div>
              {career.earning_range && (
                <span className="font-dm text-[11px] block mb-2" style={{ color: c.textAccent + '99' }}>{career.earning_range}</span>
              )}
              {/* Animated Match Bar */}
              <AnimatedBar pct={matchScore} color={c.barColor} delay={index * 0.15} />
              <span className="font-dm text-[9px] uppercase tracking-[1.5px] mt-1 block" style={{ color: c.glow + '60' }}>Match Score</span>
            </div>
          </div>

          {/* Why it fits */}
          <p className="font-dm text-[13px] leading-[1.68] mb-3" style={{ color:'rgba(240,242,255,0.62)' }}>
            {career.why_it_fits}
          </p>

          {/* Exams */}
          {career.entrance_exams && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {career.entrance_exams.map((exam, i) => (
                <span key={i} className="font-dm text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ color:c.textAccent, background:c.glow+'18', border:`1px solid ${c.glow}30` }}>
                  {exam}
                </span>
              ))}
            </div>
          )}

          {/* Expandable */}
          <div className={`overflow-hidden transition-all duration-400 ${expanded ? 'max-h-[800px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
            {career.pros && career.pros.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mb-3" style={{ borderTop:`1px solid ${c.glow}18` }}>
                <div>
                  <span className="font-dm text-[10px] font-bold text-[#22d3a0] uppercase tracking-[1px] block mb-1.5">✓ Pros</span>
                  <ul className="space-y-1">{career.pros.map((p,i) => <li key={i} className="font-dm text-[12px] text-white/60">• {p}</li>)}</ul>
                </div>
                <div>
                  <span className="font-dm text-[10px] font-bold text-[#f87171] uppercase tracking-[1px] block mb-1.5">✗ Cons</span>
                  <ul className="space-y-1">{career.cons && career.cons.map((co,i) => <li key={i} className="font-dm text-[12px] text-white/60">• {co}</li>)}</ul>
                </div>
              </div>
            )}
            {career.reality_check && (
              <div className="rounded-[12px] px-4 py-3 mb-2" style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.18)' }}>
                <span className="font-dm text-[12px] text-[#fbbf24] leading-relaxed block">⚡ <strong>Reality Check:</strong> {career.reality_check}</span>
              </div>
            )}
            {career.what_nobody_tells_you && (
              <div className="rounded-[12px] px-4 py-3" style={{ background:`${c.glow}0a`, border:`1px solid ${c.glow}20` }}>
                <span className="font-dm text-[12px] leading-relaxed block" style={{ color:c.textAccent }}>🤫 <strong>What nobody tells you:</strong> {career.what_nobody_tells_you}</span>
              </div>
            )}
          </div>

          {/* Frosted bottom strip hint */}
          <div className="flex items-center justify-between mt-3">
            <span className={`font-dm text-[10px] transition-opacity duration-200 ${expanded ? 'opacity-0' : 'opacity-60'}`} style={{ color:c.textAccent }}>
              tap for details →
            </span>
            {expanded && <span className="font-dm text-[10px] opacity-50" style={{ color:c.textAccent }}>tap to collapse</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function CollegeCardRedesigned({ college, index, isShortlisted, onToggleShortlist }) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const classMap = {
    safe:         { glow:'#22d3a0', bg:'linear-gradient(145deg,#0d2e2a,#0c2822)', orb:'radial-gradient(circle,#22d3a055,transparent)', label:'SAFE', textAccent:'#6ee7b7' },
    realistic:    { glow:'#4f8ef7', bg:'linear-gradient(145deg,#0d1b3e,#0f1a35)', orb:'radial-gradient(circle,#4f8ef755,transparent)', label:'REALISTIC', textAccent:'#7eb3ff' },
    aspirational: { glow:'#fbbf24', bg:'linear-gradient(145deg,#2e1a00,#281500)', orb:'radial-gradient(circle,#fbbf2455,transparent)', label:'REACH', textAccent:'#fde68a' },
  }
  const c = classMap[college.classification] || { glow:'#8b5cf6', bg:'linear-gradient(145deg,#1a0d3e,#160d38)', orb:'radial-gradient(circle,#8b5cf655,transparent)', label:'TARGET', textAccent:'#c4b5fd' }

  return (
    <div
      className="relative rounded-[22px] overflow-hidden cursor-pointer"
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rotating glow border */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        style={{
          position:'absolute', inset:-2, borderRadius:24, zIndex:0,
          background:`conic-gradient(from 0deg, transparent 62%, ${c.glow}, transparent 80%)`,
          opacity: hovered ? 0.85 : 0.35, transition:'opacity 0.4s'
        }}
      />
      <div className="absolute inset-[2px] rounded-[21px] overflow-hidden" style={{ background: c.bg, zIndex:1 }}>
        {/* Floating orbs */}
        <motion.div animate={{x:[0,14,0],y:[0,-10,0]}} transition={{duration:5,repeat:Infinity,ease:'easeInOut'}} style={{ position:'absolute',top:-18,right:-18,width:100,height:100,borderRadius:'50%',background:c.orb,filter:'blur(28px)',opacity:0.75 }} />
        <motion.div animate={{x:[0,-10,0],y:[0,12,0]}} transition={{duration:6.5,repeat:Infinity,ease:'easeInOut',delay:1}} style={{ position:'absolute',bottom:-10,left:-10,width:70,height:70,borderRadius:'50%',background:c.orb,filter:'blur(20px)',opacity:0.4 }} />
        {/* Dot grid */}
        <div style={{ position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)',backgroundSize:'18px 18px' }} />

        {/* Content */}
        <div className="relative z-10 p-5 sm:p-6">
          {/* Top Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleShortlist(college) }}
                  className="text-[16px] hover:scale-110 active:scale-95 transition-transform bg-transparent border-none cursor-pointer p-0"
                >
                  {isShortlisted ? '⭐' : '☆'}
                </button>
                <h4 className="font-sora text-[15px] font-bold text-white">{college.name}</h4>
                {college.is_hidden_gem && (
                  <span className="font-dm text-[9px] font-bold px-2.5 py-0.5 rounded-full" style={{ background:'rgba(251,191,36,0.15)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.3)' }}>💎 GEM</span>
                )}
              </div>
              <p className="font-dm text-[11px]" style={{ color:c.textAccent + '80' }}>{college.location || college.city} · {college.type}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {/* Classification badge */}
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background:c.glow+'20', border:`1px solid ${c.glow}40` }}>
                <motion.div animate={{opacity:[1,0.4,1]}} transition={{duration:2,repeat:Infinity}} style={{ width:5, height:5, borderRadius:'50%', background:c.glow }} />
                <span className="font-mono text-[9px] font-bold" style={{ color:c.glow }}>{c.label}</span>
              </div>
              {(college.annual_fee || college.approx_annual_fee) && (
                <span className="font-sora text-[12px] font-bold" style={{ color:'#22d3a0' }}>{college.annual_fee || college.approx_annual_fee}</span>
              )}
            </div>
          </div>

          {/* Why fits */}
          <p className="font-dm text-[13px] leading-[1.65] mb-2" style={{ color:'rgba(240,242,255,0.6)' }}>
            {college.why_fits || college.why_this_fits}
          </p>

          {/* Internet verdict */}
          {college.internet_verdict && (
            <div className="mt-3 rounded-[12px] p-3" style={{ background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.15)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span style={{ fontSize:11 }}>🌐</span>
                <span className="font-dm text-[9px] font-bold uppercase tracking-wider text-[#fbbf24]">Live Internet Verdict</span>
              </div>
              <p className="font-dm text-[12px] text-white/65 leading-relaxed">{college.internet_verdict}</p>
            </div>
          )}

          {/* Expandable */}
          <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            {college.match_reasons && college.match_reasons.length > 0 && (
              <div className="mb-3" style={{ borderTop:`1px solid ${c.glow}18`, paddingTop:12 }}>
                <span className="font-dm text-[10px] font-bold uppercase tracking-[1.2px] text-white/40 block mb-2">Why it matches:</span>
                <ul className="space-y-1">{college.match_reasons.map((r,i) => <li key={i} className="font-dm text-[12px] text-white/60 flex items-start gap-2"><span style={{color:c.glow}}>•</span><span>{r}</span></li>)}</ul>
              </div>
            )}
            {college.caution && (
              <div className="rounded-[12px] px-4 py-3 mb-2" style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.15)' }}>
                <span className="font-dm text-[12px] text-[#f87171] leading-relaxed block">⚠️ <strong>Trade-off:</strong> {college.caution}</span>
              </div>
            )}
            {college.reddit_verdict && (
              <div className="rounded-[12px] px-4 py-3" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <span className="font-dm text-[12px] text-white/65 leading-relaxed block">💬 <strong className="text-white">Student Verdict:</strong> "{college.reddit_verdict}"</span>
              </div>
            )}
            {college.eligibilityWarning && (
              <div className="rounded-[10px] px-3 py-2 mt-2" style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.15)' }}>
                <span className="font-dm text-[11px] text-[#f87171] leading-relaxed block">⚠️ <strong>Guardrail:</strong> {college.eligibilityWarning}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mt-3">
            <span className="font-dm text-[10px]" style={{ color: c.textAccent + '60' }}>{!expanded ? 'tap for details →' : 'tap to collapse'}</span>
          </div>
        </div>

        {/* Frosted bottom strip */}
        <div style={{ background:'rgba(0,0,0,0.22)', backdropFilter:'blur(10px)', borderTop:`1px solid ${c.glow}15`, padding:'6px 20px', display:'flex', alignItems:'center', gap:6, position:'relative', zIndex:2 }}>
          <motion.div animate={{opacity:[1,0.4,1]}} transition={{duration:2.5,repeat:Infinity}} style={{ width:5, height:5, borderRadius:'50%', background:c.glow, flexShrink:0 }} />
          <span className="font-dm text-[9px] text-white/40">AI recommended</span>
        </div>
      </div>
    </div>
  )
}

function TinderSwipeDeck({ additionalCareers, onSwipeRight, onSwipeLeft }) {
  const [index, setIndex] = useState(0)

  if (!additionalCareers || additionalCareers.length === 0 || index >= additionalCareers.length) {
    return (
      <div className="text-center p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[20px] font-dm text-[14px] text-[rgba(240,242,255,0.4)]">
        🎉 You've swiped all recommendation cards!
      </div>
    )
  }

  const career = additionalCareers[index]

  return (
    <div className="relative w-full max-w-[400px] mx-auto h-[320px] flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          className="absolute w-full h-full bg-gradient-to-br from-[#141926] to-[#0f1320] border border-[rgba(108,99,255,0.2)] rounded-[24px] p-6 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.4)] cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(event, info) => {
            if (info.offset.x > 100) {
              onSwipeRight(career)
              setIndex(prev => prev + 1)
            } else if (info.offset.x < -100) {
              onSwipeLeft(career)
              setIndex(prev => prev + 1)
            }
          }}
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={(custom) => ({
            x: custom === 'right' ? 300 : -300,
            opacity: 0,
            rotate: custom === 'right' ? 15 : -15,
            transition: { duration: 0.2 }
          })}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-dm text-[11px] font-bold text-pink uppercase tracking-[1px]">Career Explorer Swipe</span>
              <span className="font-mono text-[12px] font-bold text-[#22d3a0]">{career.average_salary || career.earning_range || 'N/A'}</span>
            </div>
            <h4 className="font-sora text-[17px] font-bold text-white mb-2">{career.title}</h4>
            <p className="font-dm text-[13px] text-[rgba(240,242,255,0.6)] leading-relaxed mb-3">
              {career.what_they_do || career.description || 'niche path details.'}
            </p>
            {career.why_enjoy && (
              <div className="bg-[rgba(108,99,255,0.06)] border border-[rgba(108,99,255,0.12)] rounded-[10px] p-3 text-[12px] text-[rgba(240,242,255,0.75)]">
                💡 <strong className="text-white">Why fits:</strong> {career.why_enjoy}
              </div>
            )}
          </div>
          <div className="flex justify-around gap-4 mt-4">
            <button
              onClick={() => { onSwipeLeft(career); setIndex(prev => prev + 1) }}
              className="w-12 h-12 rounded-full border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.06)] flex items-center justify-center text-red hover:bg-[rgba(248,113,113,0.15)] transition-all cursor-pointer"
            >
              ❌
            </button>
            <button
              onClick={() => { onSwipeRight(career); setIndex(prev => prev + 1) }}
              className="w-12 h-12 rounded-full border border-[rgba(34,211,160,0.3)] bg-[rgba(34,211,160,0.06)] flex items-center justify-center text-green hover:bg-[rgba(34,211,160,0.15)] transition-all cursor-pointer"
            >
              ❤️
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ProfileTimelineTracker({ pathReport }) {
  const steps = [
    {
      title: 'AI Career Test',
      desc: 'Analysed subjects, marks, side-projects, and geographic constraints.',
      status: 'completed',
      date: 'Step 1'
    },
    {
      title: 'Career Vibe Matched',
      desc: `Identified as "${pathReport.archetype?.name || 'Explorer'}" — visual, self-directed and ambitious.`,
      status: 'completed',
      date: 'Step 2'
    },
    {
      title: 'Shortlisting & Research',
      desc: 'Examine match percentages and reality checks. Shortlist best colleges.',
      status: 'active',
      date: 'Step 3'
    },
    {
      title: 'Next Actions Execution',
      desc: 'Complete exam syllabus check and build initial portfolio pieces.',
      status: 'upcoming',
      date: 'Next 30 Days'
    },
    {
      title: 'Milestone Review',
      desc: 'Simulate what-ifs (salary prioritization, relocation, study abroad shifts).',
      status: 'upcoming',
      date: 'Next 60 Days'
    }
  ]

  return (
    <div className="glass-card rounded-[20px] p-6 mb-8 border border-[rgba(255,255,255,0.06)]">
      <h3 className="font-sora text-[17px] font-bold text-white mb-5 flex items-center gap-2">
        <span>🗺️</span> Profile Evolution Roadmap
      </h3>
      <div className="relative border-l border-[rgba(255,255,255,0.07)] ml-3.5 pl-6 space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative">
            <span className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
              step.status === 'completed'
                ? 'bg-[#22d3a0] border-[#22d3a0] shadow-[0_0_10px_rgba(34,211,160,0.4)]'
                : step.status === 'active'
                  ? 'bg-purple border-purple animate-pulse shadow-[0_0_10px_rgba(108,99,255,0.5)]'
                  : 'bg-navy3 border-[rgba(255,255,255,0.15)]'
            }`} />
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[1px] text-blue block mb-0.5">{step.date}</span>
              <h4 className="font-sora text-[13.5px] font-bold text-white">{step.title}</h4>
              <p className="font-dm text-[12.5px] text-[rgba(240,242,255,0.5)] mt-1 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard Stat Strip ─────────────────────────────
function DashboardStatStrip({ pathReport }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  const stats = [
    {
      label: 'Career Matches', value: pathReport?.careers?.length || 0,
      icon: '🎯', glow: '#4f8ef7',
      bg: 'linear-gradient(145deg,#0d1b3e,#0f1a35)',
      orb: 'radial-gradient(circle,#4f8ef760,transparent)',
      grad: 'linear-gradient(90deg,#4f8ef7,#8b5cf6)'
    },
    {
      label: 'Colleges Found', value: pathReport?.colleges?.length || 0,
      icon: '🏛️', glow: '#a78bfa',
      bg: 'linear-gradient(145deg,#1a0d3e,#160d38)',
      orb: 'radial-gradient(circle,#8b5cf660,transparent)',
      grad: 'linear-gradient(90deg,#8b5cf6,#ec4899)'
    },
    {
      label: 'Profile Score', value: pathReport?.confidence_score?.score || 84, suffix: '%',
      icon: '⚡', glow: '#22d3a0',
      bg: 'linear-gradient(145deg,#0d2e2a,#0c2822)',
      orb: 'radial-gradient(circle,#22d3a060,transparent)',
      grad: 'linear-gradient(90deg,#22d3a0,#4f8ef7)'
    },
    {
      label: 'Action Items', value: pathReport?.confidence_score?.actions?.length || 3,
      icon: '📋', glow: '#fbbf24',
      bg: 'linear-gradient(145deg,#2e1a00,#281500)',
      orb: 'radial-gradient(circle,#fbbf2460,transparent)',
      grad: 'linear-gradient(90deg,#fbbf24,#f97316)'
    }
  ]

  return (
    <div ref={ref} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8" style={{ animationDelay: '0.18s' }}>
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.08, duration: 0.45, ease: [0.16,1,0.3,1] }}
          whileHover={{ y: -4, scale: 1.03 }}
          className="relative rounded-[18px] overflow-hidden cursor-default"
          style={{ background: s.bg, minHeight: 120 }}
        >
          {/* Rotating border ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', inset: -1.5, borderRadius: 20, zIndex: 0,
              background: `conic-gradient(from 0deg, transparent 65%, ${s.glow}, transparent 82%)`,
              opacity: 0.6
            }}
          />
          {/* Inner card */}
          <div className="absolute inset-[1.5px] rounded-[17px] overflow-hidden" style={{ background: s.bg }}>
            {/* Floating orb */}
            <motion.div
              animate={{ x: [0,10,0], y: [0,-8,0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: -16, right: -16, width: 70, height: 70,
                borderRadius: '50%', background: s.orb, filter: 'blur(18px)', opacity: 0.8
              }}
            />
            {/* Dot grid */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.05,
              backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)',
              backgroundSize: '16px 16px'
            }} />
            {/* Content */}
            <div className="relative z-10 p-4 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <motion.div
                  animate={{ opacity: [1,0.4,1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: s.glow }}
                />
              </div>
              <div>
                <div className="font-sora font-extrabold text-[28px] text-transparent bg-clip-text" style={{ backgroundImage: s.grad }}>
                  <CountUp to={s.value} active={inView} suffix={s.suffix || ''} />
                </div>
                <div className="font-dm text-[9px] uppercase tracking-[1.8px] mt-0.5" style={{ color: s.glow + 'bb' }}>{s.label}</div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── 30-Day Action Plan Section ───────────────────────
function ActionPlanSection({ pathReport }) {
  const rawActions = pathReport?.next_30_days || pathReport?.confidence_score?.actions || []
  const defaultActions = [
    'Review your top career match in detail',
    'Shortlist 3 colleges from your recommendations',
    'Check entrance exam syllabus for your target',
  ]
  const actions = rawActions.length > 0 ? rawActions : defaultActions
  const [checked, setChecked] = useState({})
  const completedCount = Object.values(checked).filter(Boolean).length
  const pct = actions.length > 0 ? Math.round((completedCount / actions.length) * 100) : 0

  return (
    <div className="relative rounded-[22px] overflow-hidden mb-6">
      {/* Rotating border */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', inset: -2, borderRadius: 24, zIndex: 0,
          background: 'conic-gradient(from 0deg, transparent 60%, #8b5cf6, transparent 80%)',
          opacity: 0.5
        }}
      />
      <div
        className="relative z-10 rounded-[21px] p-6 overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#100d28,#0d0d20,#0d1a28)' }}
      >
        {/* Floating orbs */}
        <motion.div
          animate={{ x:[0,20,0], y:[0,-14,0] }}
          transition={{ duration:6, repeat:Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', top:-24, right:-24, width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle,#8b5cf640,transparent)', filter:'blur(30px)' }}
        />
        <motion.div
          animate={{ x:[0,-15,0], y:[0,18,0] }}
          transition={{ duration:8, repeat:Infinity, ease:'easeInOut', delay:2 }}
          style={{ position:'absolute', bottom:-20, left:-20, width:90, height:90, borderRadius:'50%', background:'radial-gradient(circle,#4f8ef730,transparent)', filter:'blur(24px)' }}
        />
        {/* Dot grid */}
        <div style={{ position:'absolute', inset:0, opacity:0.04, backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)', backgroundSize:'18px 18px' }} />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div style={{ width:42, height:42, borderRadius:12, background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>📅</div>
            <div>
              <div className="font-dm text-[9px] uppercase tracking-[2px] text-purple font-bold">Action Plan</div>
              <div className="font-sora text-[16px] font-bold text-white">Your Next 30 Days</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="font-mono text-[12px] font-bold" style={{ color: pct === 100 ? '#22d3a0' : 'rgba(255,255,255,0.6)' }}>{completedCount}/{actions.length}</span>
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background:'linear-gradient(90deg,#8b5cf6,#4f8ef7)' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="relative z-10 space-y-2">
          {actions.slice(0, 5).map((act, i) => (
            <motion.div
              key={i} layout
              className="flex items-start gap-3 rounded-[13px] px-4 py-3 cursor-pointer transition-all duration-200"
              style={{
                background: checked[i] ? 'rgba(34,211,160,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${checked[i] ? 'rgba(34,211,160,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}
              whileHover={{ scale: 1.01, borderColor: 'rgba(139,92,246,0.25)' }}
              onClick={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))}
            >
              <div style={{
                width:20, height:20, borderRadius:'50%', border:`2px solid ${checked[i]?'#22d3a0':'rgba(255,255,255,0.2)'}`,
                background: checked[i]?'#22d3a0':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2
              }}>
                {checked[i] && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span className="font-dm text-[13px] leading-snug" style={{ color: checked[i]?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.75)', textDecoration:checked[i]?'line-through':'none' }}>{act}</span>
            </motion.div>
          ))}
        </div>

        {pct === 100 && (
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="relative z-10 mt-4 text-center p-3 rounded-[14px]" style={{ background:'rgba(34,211,160,0.08)', border:'1px solid rgba(34,211,160,0.2)' }}>
            <span className="font-sora text-[14px] font-bold text-[#22d3a0]">🎉 All done! You're ahead of the curve.</span>
          </motion.div>
        )}
      </div>
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
  const [showShareStoryModal, setShowShareStoryModal] = useState(false)
  
  // New upgraded states
  const [brutallyHonest, setBrutallyHonest] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationScenario, setSimulationScenario] = useState('')
  const [reportHistory, setReportHistory] = useState([])
  const [shortlistedColleges, setShortlistedColleges] = useState([])
  const [checkedActions, setCheckedActions] = useState({})
  const [likedCareers, setLikedCareers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Load report & properties
  useEffect(() => {
    const stored = sessionStorage.getItem('pathreport')
    if (!stored) {
      navigate('/form')
      return
    }
    const parsed = JSON.parse(stored)
    setPathReport(parsed)
    
    const isHonest = sessionStorage.getItem('brutally_honest') === 'true'
    setBrutallyHonest(isHonest)

    // Load shortlist
    const shortlist = JSON.parse(localStorage.getItem('skope_shortlist') || '[]')
    setShortlistedColleges(shortlist)
  }, [navigate])

  // Custom trigger for generic share recommendation pop-up after 2 seconds
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

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, chatLoading])

  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
  }

  const handleChatScroll = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  // Handle college shortlisting
  const handleToggleShortlist = (college) => {
    let updated = []
    const exists = shortlistedColleges.some(c => c.name === college.name)
    if (exists) {
      updated = shortlistedColleges.filter(c => c.name !== college.name)
    } else {
      updated = [...shortlistedColleges, college]
    }
    setShortlistedColleges(updated)
    localStorage.setItem('skope_shortlist', JSON.stringify(updated))
  }

  // Toggle brutally honest mode & regenerate
  const handleToggleBrutallyHonest = async () => {
    const newBrutallyHonest = !brutallyHonest
    setBrutallyHonest(newBrutallyHonest)
    sessionStorage.setItem('brutally_honest', String(newBrutallyHonest))

    setLoading(true)
    setIsSimulating(true)
    setError('')
    try {
      const phase1 = JSON.parse(sessionStorage.getItem('skope_phase1') || '{}')
      const chatHistoryData = JSON.parse(sessionStorage.getItem('skope_chatHistory') || '[]')
      const preferences = JSON.parse(sessionStorage.getItem('skope_preferences') || '{}')

      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase1,
          chatHistory: chatHistoryData,
          preferences,
          brutally_honest: newBrutallyHonest
        })
      })
      if (!res.ok) throw new Error('Regeneration failed.')
      const data = await res.json()
      setReportHistory(prev => [...prev, pathReport])
      setPathReport(data)
      sessionStorage.setItem('pathreport', JSON.stringify(data))
    } catch (err) {
      console.error(err)
      setError('Regeneration failed. Check server connection.')
    } finally {
      setLoading(false)
      setIsSimulating(false)
    }
  }

  // Run What-If simulation
  const runWhatIf = async (scenarioText) => {
    const query = (scenarioText || simulationScenario).trim()
    if (!query) return
    setSimulationScenario('')
    setLoading(true)
    setIsSimulating(true)
    setError('')
    try {
      const res = await fetch('/api/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: query, pathreport: pathReport })
      })
      if (!res.ok) throw new Error('Simulation endpoint failed.')
      const data = await res.json()
      setReportHistory(prev => [...prev, pathReport])
      setPathReport(data)
      sessionStorage.setItem('pathreport', JSON.stringify(data))
    } catch (err) {
      console.error(err)
      setError('Simulation failed. Please try again.')
    } finally {
      setLoading(false)
      setIsSimulating(false)
    }
  }

  // Undo what-if shift
  const handleUndoWhatIf = () => {
    if (reportHistory.length > 0) {
      const prev = reportHistory[reportHistory.length - 1]
      setReportHistory(prevHistory => prevHistory.slice(0, -1))
      setPathReport(prev)
      sessionStorage.setItem('pathreport', JSON.stringify(prev))
    }
  }

  // Chat message support
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

  // PDF print
  const handleDownloadPDF = () => {
    window.print()
  }

  // Instagram story Canvas PNG Export
  const exportCard = () => {
    const element = document.getElementById('instagram-share-card')
    if (!element) return
    html2canvas(element, {
      backgroundColor: '#0A0A0F',
      scale: 3, // Premium quality
      useCORS: true
    }).then(canvas => {
      const link = document.createElement('a')
      link.download = `Skope_StoryCard_${pathReport.archetype?.name || 'CareerVibe'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    })
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

  // Interactive confidence checklist calculation
  const actionsList = pathReport.confidence_score?.actions || []
  const baseScore = pathReport.confidence_score?.percentage || 70
  const actionsCount = actionsList.length
  const completedCount = actionsList.filter((_, idx) => checkedActions[idx]).length
  const currentPercentage = actionsCount > 0 
    ? Math.round(baseScore + (completedCount / actionsCount) * (100 - baseScore))
    : baseScore

  // SVG Circular Ring params
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (currentPercentage / 100) * circumference

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

      <div className="page-wrapper pt-[80px]">
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
            
            {/* Action Bar (PDF, Instagram share, brutally honest) */}
            <div data-noprint className="flex flex-wrap items-center justify-center gap-4 mb-4">
              <button
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
              
              <button
                onClick={() => setShowShareStoryModal(true)}
                className="inline-flex items-center gap-2 font-dm text-[13px] font-semibold px-5 py-2.5 rounded-full border border-[rgba(236,72,153,0.2)] bg-[rgba(236,72,153,0.05)] text-pink hover:text-white hover:bg-pink/20 transition-all duration-200 cursor-pointer"
              >
                📸 Export Story
              </button>

              {/* Brutally Honest Mode Toggle */}
              <div className="inline-flex items-center gap-3.5 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                <span className="font-dm text-[12px] text-[rgba(240,242,255,0.6)]">Brutally Honest Mode</span>
                <button
                  onClick={handleToggleBrutallyHonest}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none border-none cursor-pointer flex items-center ${
                    brutallyHonest ? 'bg-[#fbbf24]' : 'bg-[rgba(255,255,255,0.15)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      brutallyHonest ? 'transform translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {error && (
              <p className="font-dm text-[13px] text-red mt-2">{error}</p>
            )}
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* STORY CARDS — Premium glassmorphism strip */}
          {/* ═══════════════════════════════════════════ */}
          <div className="mb-8">
            {/* Section label */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="font-dm text-[9px] uppercase tracking-[2.5px] text-white/30 px-2">At a glance</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="flex gap-3.5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
              <StoryCard delay={0.05} config={{
                icon: '🎯', label: 'Top Career',
                value: pathReport.careers?.[0]?.title || '—',
                badge: pathReport.careers?.[0]?.match_score ? `${pathReport.careers[0].match_score}%` : 'AI Pick',
                badgeIcon: '✦',
                bg: 'linear-gradient(145deg, #0d1b3e 0%, #0f1a35 60%, #1a0d3e 100%)',
                orb1: 'radial-gradient(circle, #4f8ef7, #6c63ff)',
                orb2: 'radial-gradient(circle, #8b5cf6, transparent)',
                borderGlow: '#4f8ef7',
                textAccent: '#7eb3ff'
              }} />
              <StoryCard delay={0.1} config={{
                icon: '🏛️', label: 'Best Fit College',
                value: pathReport.colleges?.[0]?.name?.split(' ').slice(0, 3).join(' ') || '—',
                badge: pathReport.colleges?.[0]?.classification || 'Target',
                badgeIcon: '🎯',
                bg: 'linear-gradient(145deg, #1a0d3e 0%, #160d38 60%, #2a0d4e 100%)',
                orb1: 'radial-gradient(circle, #8b5cf6, #ec4899)',
                orb2: 'radial-gradient(circle, #ec4899, transparent)',
                borderGlow: '#a78bfa',
                textAccent: '#c4b5fd'
              }} />
              <StoryCard delay={0.15} config={{
                icon: '💪', label: 'Top Strength',
                value: pathReport.strengths?.[0]?.split('(')[0]?.trim().slice(0, 38) || '—',
                badge: 'Your Edge',
                badgeIcon: '⚡',
                bg: 'linear-gradient(145deg, #0d2e2a 0%, #0c2822 60%, #0d3a2a 100%)',
                orb1: 'radial-gradient(circle, #22d3a0, #4f8ef7)',
                orb2: 'radial-gradient(circle, #10b981, transparent)',
                borderGlow: '#22d3a0',
                textAccent: '#6ee7b7'
              }} />
              <StoryCard delay={0.2} config={{
                icon: '⚡', label: 'Reality Check',
                value: pathReport.gaps?.[0]?.split('—')[0]?.trim().slice(0, 38) || '—',
                badge: 'Watch Out',
                badgeIcon: '🔥',
                bg: 'linear-gradient(145deg, #2e1a00 0%, #281500 60%, #3a1a00 100%)',
                orb1: 'radial-gradient(circle, #fbbf24, #f97316)',
                orb2: 'radial-gradient(circle, #f59e0b, transparent)',
                borderGlow: '#fbbf24',
                textAccent: '#fde68a'
              }} />
              <StoryCard delay={0.25} config={{
                icon: '🚀', label: 'Emerging Role',
                value: pathReport.emerging_roles?.[0]?.title || '—',
                badge: '2026+',
                badgeIcon: '🌐',
                bg: 'linear-gradient(145deg, #2e0d1f 0%, #280a1a 60%, #3a0d2e 100%)',
                orb1: 'radial-gradient(circle, #ec4899, #8b5cf6)',
                orb2: 'radial-gradient(circle, #f472b6, transparent)',
                borderGlow: '#ec4899',
                textAccent: '#f9a8d4'
              }} />
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* DASHBOARD STAT STRIP */}
          {/* ═══════════════════════════════════════════ */}
          <DashboardStatStrip pathReport={pathReport} />

          {/* ═══════════════════════════════════════════ */}
          {/* PERSONALITY ARCHETYPE HERO CARD */}
          {/* ═══════════════════════════════════════════ */}
          {pathReport.archetype && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="glass-card rounded-[24px] p-6 mb-6 border border-[rgba(108,99,255,0.15)] bg-gradient-to-br from-[rgba(108,99,255,0.05)] to-[rgba(79,142,247,0.05)]"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-[40px]">{ARCHETYPE_EMOJIS[pathReport.archetype.name] || '🧠'}</span>
                  <div>
                    <span className="font-dm text-[11px] font-bold text-purple uppercase tracking-[1.5px]">Your Career Vibe</span>
                    <h2 className="font-sora text-[22px] font-bold text-white leading-tight">{pathReport.archetype.name}</h2>
                  </div>
                </div>
                {/* Visual badge */}
                <div className="bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.25)] rounded-full px-3 py-1 font-mono text-[10px] text-[#9b8eff] tracking-[1.5px] uppercase">
                  ⚡ 2026 Core Vibe
                </div>
              </div>
              <p className="font-dm text-[14px] text-[rgba(240,242,255,0.85)] leading-relaxed mb-4">
                {pathReport.archetype.description}
              </p>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[14px] p-4 text-[13px] font-dm text-[rgba(240,242,255,0.65)] leading-relaxed">
                <strong className="text-white">Why you fit this category:</strong> {pathReport.archetype.why_match}
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* CONFIDENCE CHECK & CHECKS TO LEVEL UP */}
          {/* ═══════════════════════════════════════════ */}
          {pathReport.confidence_score && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="glass-card rounded-[20px] p-6 mb-6 border border-[rgba(108,99,255,0.06)] grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="flex flex-col items-center justify-center text-center border-r border-[rgba(255,255,255,0.06)] pr-2 max-md:border-r-0 max-md:border-b max-md:pb-6 max-md:pr-0">
                <div className="relative flex items-center justify-center mb-2">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} className="stroke-[rgba(255,255,255,0.03)] fill-none stroke-[6px]" />
                    <circle cx="48" cy="48" r={radius} className="stroke-purple fill-none stroke-[6px] transition-all duration-500 ease-out" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                  </svg>
                  <span className="absolute font-sora text-[20px] font-extrabold text-white">{currentPercentage}%</span>
                </div>
                <h4 className="font-sora text-[14px] font-bold text-white">Confidence Level</h4>
                <p className="font-dm text-[11px] text-[rgba(240,242,255,0.4)] mt-1">Check actions to level up</p>
              </div>

              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <span className="font-dm text-[10px] font-bold uppercase tracking-[1.5px] text-[#fbbf24] block mb-1">Direction Analysis</span>
                  <p className="font-dm text-[13.5px] text-[rgba(240,242,255,0.65)] leading-relaxed mb-4">
                    {pathReport.confidence_score.explanation}
                  </p>
                </div>
                
                {/* Actions Checklist */}
                {actionsList.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-dm text-[11px] font-bold uppercase tracking-[1.5px] text-[rgba(240,242,255,0.45)] block mb-1">Interactive Steps to Clear Ambiguity:</span>
                    {actionsList.map((act, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id={`action-${index}`}
                          checked={!!checkedActions[index]}
                          onChange={() => setCheckedActions(prev => ({ ...prev, [index]: !prev[index] }))}
                          className="mt-0.5 w-4 h-4 rounded accent-purple bg-navy3 border-[rgba(255,255,255,0.1)] focus:ring-0 cursor-pointer"
                        />
                        <label
                          htmlFor={`action-${index}`}
                          className={`font-dm text-[12.5px] cursor-pointer transition-colors leading-snug ${
                            checkedActions[index]
                              ? 'text-[rgba(240,242,255,0.35)] line-through'
                              : 'text-[rgba(240,242,255,0.85)] hover:text-white'
                          }`}
                        >
                          {act}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* FUTURE SELF SIMULATION */}
          {/* ═══════════════════════════════════════════ */}
          {pathReport.future_self && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="glass-card rounded-[20px] p-6 mb-6 border border-[rgba(236,72,153,0.15)] bg-gradient-to-br from-[rgba(236,72,153,0.04)] to-transparent"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-[22px]">🔮</span>
                <div>
                  <span className="font-dm text-[11px] font-bold text-pink uppercase tracking-[1.5px]">Future Self Simulation</span>
                  <h3 className="font-sora text-[17px] font-bold text-white">A Day in Your Life at 30</h3>
                </div>
              </div>
              <p className="font-dm text-[13.5px] text-[rgba(240,242,255,0.75)] leading-[1.75] italic whitespace-pre-line bg-[rgba(5,5,10,0.45)] p-4 rounded-[14px] border border-[rgba(255,255,255,0.03)] font-light">
                {pathReport.future_self.story}
              </p>
            </motion.div>
          )}

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
          {/* WHAT-IF SIMULATOR */}
          {/* ═══════════════════════════════════════════ */}
          <div data-noprint className="glass-card rounded-[20px] p-6 mb-6 border border-[rgba(79,142,247,0.15)] bg-gradient-to-br from-[rgba(79,142,247,0.03)] to-transparent">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-[20px]">🎛️</span>
                <div>
                  <span className="font-dm text-[10px] font-bold uppercase tracking-[1.5px] text-blue">Decision Modeler</span>
                  <h3 className="font-sora text-[16px] font-bold text-white">What-If Simulation Engine</h3>
                </div>
              </div>
              {reportHistory.length > 0 && (
                <button
                  onClick={handleUndoWhatIf}
                  className="font-dm text-[11px] font-semibold text-[#fbbf24] px-2.5 py-1 rounded bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.2)] hover:bg-[rgba(251,191,36,0.15)] transition-colors cursor-pointer"
                >
                  ↩ Undo Shift
                </button>
              )}
            </div>

            <p className="font-dm text-[13px] text-[rgba(240,242,255,0.6)] leading-relaxed mb-4">
              Simulate changes in your roadmap. Clicks will trigger a fast AI recalculation mapping new options.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label: 'Switch to Humanities / Liberal Arts 🎨', value: 'What if I switch to Humanities or Liberal Arts?' },
                { label: 'Prioritize Starting Salary over everything 💰', value: 'What if starting salary is my absolute priority?' },
                { label: 'Study Design or Tech Abroad ✈️', value: 'What if I want to study design abroad after class 12?' },
                { label: 'If I don\'t clear JEE Advanced 📉', value: 'What if I don\'t clear JEE Advanced and must seek non-IIT backups?' }
              ].map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => runWhatIf(s.value)}
                  className="font-dm text-[11.5px] text-[rgba(240,242,255,0.65)] bg-navy3 border border-[rgba(255,255,255,0.08)] px-3 py-1.5 rounded-full hover:border-[#6c63ff] hover:text-white transition-colors cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type custom scenario (e.g. 'What if I want to do game design?')..."
                value={simulationScenario}
                onChange={(e) => setSimulationScenario(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runWhatIf()}
                className="flex-1 bg-navy3 border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-2.5 text-white font-dm text-[13px] outline-none focus:border-[#6c63ff] transition-colors placeholder:text-[rgba(240,242,255,0.25)]"
              />
              <button
                onClick={() => runWhatIf()}
                className="font-sora text-[12.5px] font-semibold bg-gradient-to-r from-blue to-purple text-white px-4 py-2.5 rounded-[12px] border-none cursor-pointer hover:opacity-95 transition-opacity"
              >
                Model Path →
              </button>
            </div>
          </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6 animate-fadeUp" style={{ animationDelay: '0.25s' }}>
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
          {/* 30-DAY ACTION PLAN */}
          {/* ═══════════════════════════════════════════ */}
          <ActionPlanSection pathReport={pathReport} />

          {/* ═══════════════════════════════════════════ */}
          {/* TAB NAVIGATION — Careers / Colleges / Courses */}
          {/* ═══════════════════════════════════════════ */}
          <div className="flex gap-1 p-1 bg-[rgba(15,19,32,0.8)] rounded-[12px] border border-[rgba(79,142,247,0.1)] mb-6 animate-fadeUp" style={{ animationDelay: '0.3s' }}>
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
          <div className={activeTab === 'careers' ? 'block mb-8' : 'hidden mb-8'}>
            <SectionHeader tag="Your Matches" title="Career Paths" delay={0.32} />
            <div className="grid grid-cols-1 gap-3.5 mb-6">
              {pathReport.careers?.map((career, i) => (
                <CareerCardRedesigned key={i} career={career} index={i} />
              ))}
            </div>

            {/* Tinder-style Career Swipe widget */}
            {pathReport.hidden_careers && pathReport.hidden_careers.length > 0 && (
              <div data-noprint className="mt-8 mb-6">
                <SectionHeader tag="Discovery Deck" title="Swipe New Opportunities" />
                <TinderSwipeDeck
                  additionalCareers={pathReport.hidden_careers}
                  onSwipeRight={(c) => {
                    setLikedCareers(prev => [...prev, c])
                    sendChat(`I swiped right on the career: "${c.title}". Tell me how I can prepare for it.`)
                  }}
                  onSwipeLeft={(c) => console.log('Swiped pass on', c.title)}
                />
                
                {likedCareers.length > 0 && (
                  <div className="mt-4 p-4 glass-card rounded-[14px]">
                    <span className="font-dm text-[11px] font-bold text-green uppercase tracking-[1px] block mb-2">⭐ Careers you liked:</span>
                    <div className="flex flex-wrap gap-2">
                      {likedCareers.map((c, idx) => (
                        <span key={idx} className="font-dm text-[12px] bg-[rgba(34,211,160,0.1)] text-[#22d3a0] px-3 py-1 rounded-full border border-[rgba(34,211,160,0.25)]">
                          {c.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── Tab Content — Colleges ─── */}
          <div className={activeTab === 'colleges' ? 'block mb-8' : 'hidden mb-8'}>
            <SectionHeader tag="Filtered for You" title="College Recommendations" delay={0.32} />
            <div className="grid grid-cols-1 gap-3">
              {pathReport.colleges?.map((college, i) => (
                <CollegeCardRedesigned
                  key={i}
                  college={college}
                  index={i}
                  isShortlisted={shortlistedColleges.some(c => c.name === college.name)}
                  onToggleShortlist={handleToggleShortlist}
                />
              ))}
            </div>
          </div>

          {/* ─── Tab Content — Courses ─── */}
          <div className={activeTab === 'courses' ? 'block mb-8' : 'hidden mb-8'}>
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
                        <div className="min-w-0">
                          <span className="font-dm text-[10px] font-bold uppercase tracking-[1.5px] text-[#fbbf24] mb-1 block">💎 Niche Course</span>
                          <h4 className="font-sora text-[15px] font-bold text-white leading-snug truncate">{course.course_name} ({course.field})</h4>
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
          {/* PROFILE EVOLUTION ROADMAP */}
          {/* ═══════════════════════════════════════════ */}
          <ProfileTimelineTracker pathReport={pathReport} />

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

            <div className="relative rounded-3xl border border-white/10 bg-neutral-900/60 backdrop-blur-[16px] overflow-hidden transition-all duration-300">
              {/* Lighting highlight borders */}
              <div className="absolute inset-0 border-white/20 border rounded-3xl pointer-events-none" style={{ maskImage: 'linear-gradient(135deg, white, transparent 60%)', WebkitMaskImage: 'linear-gradient(135deg, white, transparent 60%)' }} />
              <div className="absolute inset-0 border-white/10 border rounded-3xl pointer-events-none" style={{ maskImage: 'linear-gradient(135deg, transparent 60%, white)', WebkitMaskImage: 'linear-gradient(135deg, transparent 60%, white)' }} />
              
              {/* Box shadow glow overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl shimmer" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 40px 120px rgba(59,130,246,0.15)' }}></div>

              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-zinc-950/40 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-full bg-cover ring-white/10 ring-1 animate-floatSlow"
                      style={{
                        backgroundImage: `url('https://hoirqrkdgbmvpwutwuwj-all.supabase.co/storage/v1/object/public/assets/assets/fc36a88f-5106-416e-82ac-ea0cd24cf358_320w.webp')`,
                        animationDuration: '7s'
                      }}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-400 border border-[#0A0A0F]" />
                  </div>
                  <div>
                    <div className="font-sora text-[13.5px] font-semibold text-white">Skope AI Counsellor</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-blue-200 bg-blue-900/30 rounded-full px-2.5 py-0.5 ring-1 ring-blue-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-breathe" />
                        {chatLoading ? 'Thinking' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="max-h-[400px] overflow-y-auto p-5 flex flex-col gap-3 relative z-10">
                <ChatMessage message={{
                  role: 'assistant',
                  content: "Your PathReport is loaded. Ask me anything — compare colleges, dig into a career, clarify exams, or update something you forgot to mention. I'll adjust your recommendations."
                }} />

                {chatHistory.map((msg, i) => (
                  <ChatMessage 
                    key={i} 
                    message={msg} 
                    isLatest={i === chatHistory.length - 1} 
                    onType={handleChatScroll} 
                  />
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-900 ring-1 ring-white/10 rounded-[14px_14px_14px_4px] px-3.5 py-2 flex items-center gap-2">
                      <span className="font-dm text-[11px] text-neutral-400">Thinking</span>
                      <span className="typing-dots inline-flex items-center gap-1">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chips */}
              {showChips && (
                <div className="px-5 pb-3 flex flex-wrap gap-2 relative z-10">
                  {chips.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleChipClick(chip)}
                      className="font-dm text-[11px] text-[rgba(240,242,255,0.55)] bg-neutral-900 border border-[rgba(79,142,247,0.12)] rounded-full px-3.5 py-1.5 cursor-pointer hover:border-blue hover:text-blue transition-all duration-200"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="shrink-0 border-t border-white/5 bg-zinc-950/60 px-6 py-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center bg-neutral-900/90 rounded-full ring-1 ring-white/10 px-4 py-1 focus-within:ring-blue-400/50 focus-within:ring-1 transition-all duration-200">
                    <svg className="w-3.5 h-3.5 text-neutral-400 animate-tilt mr-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <textarea
                      ref={textareaRef}
                      className="flex-1 bg-transparent border-none text-white font-dm text-[13.5px] outline-none placeholder:text-neutral-500 resize-none leading-relaxed pt-1.5"
                      rows={1}
                      style={{ maxHeight: '80px' }}
                      placeholder="Ask anything about your PathReport..."
                      value={chatInput}
                      onChange={(e) => { setChatInput(e.target.value); handleTextareaResize(e) }}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <button
                    onClick={() => sendChat()}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-4 py-2 text-xs font-semibold rounded-full text-white ring-1 ring-blue-400 shadow-[0_6px_18px_rgba(59,130,246,0.35)] animate-glowPulse disabled:opacity-30 disabled:cursor-not-allowed shrink-0 transition-transform active:scale-95"
                    style={{ background: 'linear-gradient(45deg, #06b6d4, #3b82f6, #2563eb)' }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SHORTLIST COUNTER FLOATING STRIP */}
      {shortlistedColleges.length > 0 && (
        <div data-noprint className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-[rgba(10,10,15,0.92)] backdrop-blur-md border border-purple rounded-full px-5 py-2.5 flex items-center gap-4 shadow-[0_10px_35px_rgba(108,99,255,0.25)]">
          <span className="font-dm text-[13px] text-white">⭐ <strong>{shortlistedColleges.length}</strong> college(s) shortlisted</span>
          <button
            onClick={() => {
              sendChat(`Here is my college shortlist: ${shortlistedColleges.map(c => c.name).join(', ')}. Compare their programs, typical placements, and caution points for me.`)
              setActiveTab('colleges')
            }}
            className="bg-purple text-white px-3.5 py-1.5 rounded-full font-dm text-[11px] font-semibold border-none cursor-pointer hover:bg-opacity-95 transition-opacity"
          >
            Compare in Chat
          </button>
        </div>
      )}

      {/* Share Modal Pop-up (Request 2) */}
      {showSharePopup && (
        <div data-noprint className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,7,12,0.8)] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#0c1019] border border-[rgba(79,142,247,0.3)] rounded-[20px] p-6 max-w-[400px] w-full text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            {/* Share Icon */}
            <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-blue to-purple flex items-center justify-center mx-auto mb-4 shadow-[0_4px_20px_rgba(79,142,247,0.25)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </div>

            <h3 className="font-sora text-[18px] font-bold text-white mb-2">Spread the Word! 🚀</h3>
            <p className="font-dm text-[13.5px] text-[rgba(240,242,255,0.7)] leading-[1.65] mb-6">
              "If you like that, please share with your friends, colleagues, brother and sister siblings."
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  const shareUrl = 'https://anuraggg.tech'
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

      {/* Share Instagram Story Modal (html2canvas) */}
      {showShareStoryModal && (
        <div data-noprint className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,7,12,0.85)] backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#0c1019] border border-[rgba(108,99,255,0.2)] rounded-[24px] p-6 max-w-[400px] w-full flex flex-col gap-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
            <div className="flex justify-between items-center">
              <h3 className="font-sora text-[16px] font-bold text-white">Instagram Story Card</h3>
              <button
                onClick={() => setShowShareStoryModal(false)}
                className="text-[rgba(240,242,255,0.4)] hover:text-white bg-transparent border-none cursor-pointer text-[18px]"
              >
                ✕
              </button>
            </div>

            {/* 9:16 ratio card to screenshot */}
            <div className="relative overflow-hidden w-[280px] h-[497px] mx-auto rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#0A0A0F] shadow-[0_4px_30px_rgba(0,0,0,0.8)]" id="instagram-share-card">
              {/* Glow orbs inside the share card */}
              <div className="absolute top-[-10%] right-[-10%] w-[180px] h-[180px] rounded-full bg-gradient-to-br from-[#6c63ff] to-[#4f8ef7] opacity-20 filter blur-[30px]" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[180px] h-[180px] rounded-full bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] opacity-15 filter blur-[30px]" />
              
              {/* Card Content */}
              <div className="relative h-full flex flex-col justify-between p-6 z-10 text-center">
                <div>
                  <div className="font-sora text-[18px] font-extrabold text-white tracking-wide mb-8">
                    Sk<span className="text-[#4f8ef7]">o</span>pe
                  </div>
                  
                  <span className="font-dm text-[9px] uppercase tracking-[2px] text-pink font-bold block mb-1">My Career Vibe</span>
                  <div className="text-[42px] mb-2">{ARCHETYPE_EMOJIS[pathReport.archetype?.name] || '🧠'}</div>
                  <h2 className="font-sora text-[22px] font-extrabold text-white leading-tight mb-2">
                    {pathReport.archetype?.name || 'Explorer'}
                  </h2>
                  <div className="w-10 h-[2px] bg-gradient-to-r from-[#6c63ff] to-[#4f8ef7] mx-auto mb-6" />
                  
                  {/* Stats list */}
                  <div className="space-y-4 text-left max-w-[200px] mx-auto">
                    <div className="flex flex-col">
                      <span className="font-dm text-[9px] uppercase text-[rgba(240,242,255,0.45)]">Top Career Fit</span>
                      <span className="font-sora text-[12px] font-semibold text-white leading-tight truncate">
                        {pathReport.careers?.[0]?.title || '—'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="font-dm text-[9px] uppercase text-[rgba(240,242,255,0.45)]">Best Fit College</span>
                      <span className="font-sora text-[12px] font-semibold text-white leading-tight truncate">
                        {pathReport.colleges?.[0]?.name || '—'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="font-dm text-[9px] uppercase text-[rgba(240,242,255,0.45)]">Confidence Score</span>
                      <span className="font-sora text-[12px] font-semibold text-[#22d3a0]">
                        {currentPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="font-dm text-[9px] text-[rgba(240,242,255,0.35)] mb-1">Get your PathReport at</p>
                  <span className="font-mono text-[10px] text-blue font-semibold">anuraggg.tech</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowShareStoryModal(false)}
                className="flex-1 font-dm text-[13px] py-2.5 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-transparent text-[rgba(240,242,255,0.5)] cursor-pointer hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={exportCard}
                className="flex-1 font-sora text-[13px] font-bold py-2.5 rounded-[12px] border-none bg-gradient-to-r from-blue to-purple text-white cursor-pointer hover:opacity-95 shadow-[0_4px_15px_rgba(108,99,255,0.25)]"
              >
                💾 Download PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-running loader overlay */}
      {isSimulating && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-[16px] flex items-center justify-center p-6 animate-fadeIn">
          <div className="max-w-[360px] w-full glass-card p-6 rounded-[24px] border border-[rgba(108,99,255,0.15)] text-center flex flex-col items-center justify-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-purple/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-purple rounded-full animate-spin" />
            </div>
            <div>
              <h3 className="font-sora text-[17px] font-bold text-white mb-1">Recalculating PathReport</h3>
              <p className="font-dm text-[12.5px] text-[rgba(240,242,255,0.45)]">AI modeling is running simulation metrics...</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
