import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import AuroraBackground from '../components/AuroraBackground'

// ─── Word-by-Word Text Reveal ──────────────────────────
function RevealText({ text, className, delay = 0 }) {
  const words = text.split(' ')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <span ref={ref} className={className} style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 35, rotate: 2 }}
          animate={inView ? { opacity: 1, y: 0, rotate: 0 } : {}}
          transition={{ duration: 0.6, delay: delay + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// ─── Animated Monospace Counter ───────────────────────
function Counter({ to, suffix = '', prefix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = null
    const duration = 1800
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(ease * to))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, to])

  return (
    <span ref={ref} className="font-mono">
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  )
}

// ─── Spotlight Mouse Tracking Card ────────────────────
function SpotlightBentoCard({ icon, title, desc, tag, accent, className = '', children, delay = 0 }) {
  const cardRef = useRef(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`spotlight-card p-7 flex flex-col justify-between ${className}`}
      onMouseMove={handleMouseMove}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
            style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
          >
            {icon}
          </div>
          {tag && <span className="badge text-[10px]">{tag}</span>}
        </div>

        <h3 className="font-clash text-[22px] font-bold text-white mb-3 leading-tight">{title}</h3>
        <p className="font-jakarta text-[14px] text-white/60 leading-relaxed">{desc}</p>
      </div>

      {children && <div className="mt-6">{children}</div>}
    </motion.div>
  )
}

// ─── Marquee Ticker ───────────────────────────────────
function MarqueeTicker() {
  const items = [
    '🇮🇳 Class 12 Career Intelligence',
    '•',
    'PCM & Engineering',
    '•',
    'PCB & Medical Sciences',
    '•',
    'Commerce & Finance',
    '•',
    'Arts & Design',
    '•',
    'Law & Public Policy',
    '•',
    'Brutally Honest AI',
    '•',
    'No Sponsored Colleges',
    '•',
  ]

  return (
    <div className="w-full py-6 border-y border-white/5 bg-[#080616]/60 backdrop-blur-md overflow-hidden my-16">
      <div className="marquee-wrapper">
        <div className="marquee-content">
          {items.concat(items).map((item, idx) => (
            <span
              key={idx}
              className={`font-mono text-[13px] tracking-wider uppercase ${
                item === '•' ? 'text-indigo-500' : 'text-white/40'
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Floating Archetype Chips for Hero ────────────────
function FloatingArchetypes() {
  const archetypes = [
    { title: 'The Analyst 📊', pos: 'top-[18%] left-[5%] md:left-[8%]', anim: 'animate-floatSlow' },
    { title: 'The Creator 🎨', pos: 'top-[22%] right-[5%] md:right-[8%]', anim: 'animate-floatReverse' },
    { title: 'The Builder 🔬', pos: 'bottom-[25%] left-[4%] md:left-[10%]', anim: 'animate-floatReverse' },
    { title: 'The Strategist 📈', pos: 'bottom-[20%] right-[4%] md:right-[10%]', anim: 'animate-floatSlow' },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
      {archetypes.map((a, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + i * 0.15, duration: 0.6 }}
          className={`absolute ${a.pos} ${a.anim}`}
        >
          <div className="glass-pill px-4 py-2 rounded-full border border-white/10 text-white/80 font-mono text-[12px] font-semibold shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-2 backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            {a.title}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Interactive Demo Component ───────────────────────
const DEMO_SUBJECTS = ['Maths & Coding', 'Biology & Bio-tech', 'Art & Design', 'Business & Economics', 'Physics & Space']
const DEMO_ARCHETYPES = {
  'Maths & Coding': { vibe: 'The Analyst 📊', careers: ['Data Scientist', 'Quant Analyst', 'Robotics Systems Engineer'] },
  'Biology & Bio-tech': { vibe: 'The Builder 🔬', careers: ['Biomedical Engineer', 'Clinical Data Scientist', 'Genetic Counsellor'] },
  'Art & Design': { vibe: 'The Creator 🎨', careers: ['Product Designer (UX/UI)', 'Creative Technologist', '3D Interactive Artist'] },
  'Business & Economics': { vibe: 'The Strategist 📈', careers: ['Startup Product Manager', 'Venture Capital Analyst', 'Growth Architect'] },
  'Physics & Space': { vibe: 'The Explorer 🔭', careers: ['Aerospace Systems Engineer', 'Quantum Computing Researcher', 'Astrophysicist'] },
}

function InteractiveDemo() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState(0) // 0 = pick, 1 = loading, 2 = result

  const pick = (subj) => {
    setSelected(subj)
    setStep(1)
    setTimeout(() => setStep(2), 1400)
  }
  const reset = () => {
    setSelected(null)
    setStep(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[760px] mx-auto rounded-[28px] overflow-hidden glass-card border border-indigo-500/20 shadow-[0_0_80px_rgba(79,142,247,0.1)]"
    >
      {/* Terminal window header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors border-none cursor-pointer"
            title="Reset"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 border-none" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 border-none" />
        </div>
        <span className="font-mono text-[11px] text-white/40 tracking-wider">
          skope-live-demo.exe
        </span>
        <span className="badge text-[9px] py-0.5 px-2">Interactive</span>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="pick"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-2 font-mono text-[13px] text-indigo-400">
                <span>→</span>
                <span>STEP 01/08</span>
              </div>
              <h4 className="font-clash text-[22px] font-bold text-white mb-2">
                What subject do you actually enjoy studying?
              </h4>
              <p className="font-jakarta text-[14px] text-white/50 mb-6">
                Be honest. Not what your parents or teachers want you to choose.
              </p>

              <div className="flex flex-wrap gap-2.5">
                {DEMO_SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => pick(s)}
                    className="font-jakarta text-[13px] font-semibold px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-indigo-500/15 hover:border-indigo-500/40 text-white/80 hover:text-white transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-6 flex flex-col gap-4"
            >
              {[
                'Analyzing cognitive preferences...',
                'Cross-referencing 2,400 Indian career paths...',
                'Matching real college placement data...',
              ].map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.35 }}
                  className="flex items-center gap-3 font-mono text-[13px] text-white/60"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <span>{t}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {step === 2 && selected && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Archetype Identified
                </span>
              </div>

              <div className="rounded-2xl p-6 mb-6 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/10 border border-indigo-500/30">
                <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mb-1">
                  Your Primary Vibe
                </p>
                <h3 className="font-clash text-[28px] font-bold text-white">
                  {DEMO_ARCHETYPES[selected].vibe}
                </h3>
              </div>

              <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mb-3">
                Top Matching Career Paths
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {DEMO_ARCHETYPES[selected].careers.map((c) => (
                  <span
                    key={c}
                    className="font-jakarta text-[13px] font-medium px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/90"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <p className="font-jakarta text-[13px] text-white/50 italic mb-6">
                This is only 5% of what Skope does. The complete PathReport provides 15 personalized careers, 15 target colleges within your family budget, and a 30-day execution plan.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    sessionStorage.setItem('skope_assessment_started', 'true')
                    navigate(user ? '/form' : '/login')
                  }}
                  className="btn-primary text-[14px] px-6 py-3 font-sora"
                >
                  Get Full PathReport →
                </button>
                <button onClick={reset} className="btn-ghost text-[13px] px-5 py-3">
                  Try another option
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── FAQ Component ─────────────────────────────────────
const FAQ_LIST = [
  { q: "Is this real AI or a pre-written form?", a: "Real AI powered by Gemini. It conducts a live interactive interview that adapts follow-up questions based on your specific responses." },
  { q: "Will it suggest colleges I can't afford?", a: "Never. You specify your family budget upfront, and every college recommendation strictly respects that boundary." },
  { q: "What if I don't have my Class 12 final marks yet?", a: "Enter your estimated marks. You can retake the assessment anytime after results to generate an updated PathReport." },
  { q: "Does Skope only cover engineering?", a: "No. Skope supports PCM, PCB, Commerce, Arts, Design, Law, Management, Media, Hotel Management, and multidisciplinary programs." },
  { q: "Does Skope accept college commissions?", a: "100% independent. We reject all sponsored placements and university advertising to ensure completely unbiased advice." },
  { q: "Can I share the report with my parents?", a: "Yes! Every PathReport includes a dedicated 'Parent Alignment Vibe Check' section designed to translate your career aspirations into parameters parents care about—like stability, growth, and ROI." },
  { q: "Can I download my roadmap as a PDF?", a: "Yes, you can export your complete PathReport as a high-quality PDF to save or share." }
]

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-6 text-left cursor-pointer bg-transparent border-none"
      >
        <span className="font-jakarta text-[17px] font-semibold text-white/90 pr-6">{q}</span>
        <span className={`w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-indigo-400 font-bold transition-transform duration-300 ${open ? 'rotate-45 bg-indigo-500/20' : ''}`}>
          +
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="font-jakarta text-[14px] text-white/60 leading-relaxed pb-6 pr-6">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Landing Page ─────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const { user, pathReport } = useAuth()

  const handleStart = () => {
    sessionStorage.setItem('skope_assessment_started', 'true')
    if (user) {
      if (pathReport) {
        navigate('/result')
      } else {
        navigate('/form')
      }
    } else {
      sessionStorage.setItem('initial_diagnostic_message', "Let's build your PathReport.")
      navigate('/login')
    }
  }

  return (
    <div className="bg-[#04030a] text-white min-h-screen relative overflow-hidden font-jakarta">
      {/* Background Particle Mesh Canvas */}
      <AuroraBackground />

      {/* Navigation */}
      <Navbar />

      {/* ══ HERO SECTION ════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-5 pt-32 pb-20">
        <FloatingArchetypes />

        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="badge mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Built for Indian Class 12 Students · 100% Free
        </motion.div>

        {/* Headline */}
        <div className="max-w-[900px] mx-auto mb-8">
          <h1 className="font-clash font-extrabold leading-[1.02] tracking-[-2px] text-[clamp(44px,7vw,92px)]">
            <RevealText text="Your career isn't" className="text-white" delay={0.1} />
            <br />
            <RevealText text="a random guess." className="text-gradient-hot" delay={0.4} />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="font-jakarta text-[18px] text-white/60 max-w-[580px] mx-auto leading-relaxed mt-6"
          >
            Stop choosing your college path based on relative opinions. Skope evaluates your actual mindset and budget—brutally honestly—with real AI.
          </motion.p>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-10"
        >
          <button
            onClick={handleStart}
            className="btn-primary text-[16px] px-9 py-4 font-sora shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          >
            Find My Career Vibe
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          <button
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-ghost text-[14px] px-8 py-[15px]"
          >
            See interactive demo
          </button>
        </motion.div>

        {/* Trust Guarantee */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="font-mono text-[12px] text-white/30 uppercase tracking-wider"
        >
          8 Questions · ~7 Minutes · Zero Sponsored Recommendations
        </motion.p>
      </section>

      {/* ══ MARQUEE TICKER ═════════════════════════════════ */}
      <MarqueeTicker />

      {/* ══ OVERSIZED STATS SHOWCASE ═══════════════════════ */}
      <section className="relative z-10 py-20 px-5 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 8, suffix: '', label: 'Diagnostic Questions' },
            { value: 15, suffix: '+', label: 'Matched Career Paths' },
            { value: 15, suffix: '+', label: 'Filtered Colleges' },
            { value: 7, suffix: 'm', label: 'Avg Time to Report' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative p-6 glass-card text-center group hover:border-indigo-500/40"
            >
              <span className="font-mono text-[10px] text-indigo-400 absolute top-4 left-4">
                0{i + 1} /
              </span>
              <p className="font-clash text-[clamp(40px,5vw,64px)] font-bold text-white leading-none mb-2 mt-4 group-hover:scale-105 transition-transform">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="font-jakarta text-[13px] text-white/50">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ INTERACTIVE DEMO ═══════════════════════════════ */}
      <section id="demo" className="relative z-10 py-24 px-5">
        <div className="max-w-[900px] mx-auto text-center mb-12">
          <span className="badge mb-4">Live Preview</span>
          <h2 className="font-clash text-[clamp(32px,4.5vw,52px)] font-bold text-white tracking-tight">
            See how Skope <span className="text-gradient-cool">analyzes your mindset</span>
          </h2>
        </div>
        <InteractiveDemo />
      </section>

      {/* ══ ASYMMETRIC BENTO GRID ══════════════════════════ */}
      <section className="relative z-10 py-24 px-5 max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <span className="badge mb-4">Platform Features</span>
          <h2 className="font-clash text-[clamp(32px,4.5vw,52px)] font-bold text-white tracking-tight">
            Built different. <span className="text-gradient">No generic career tests.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpotlightBentoCard
            icon="🎯"
            title="Mindset & Archetype Vibe"
            desc="Instead of standard job titles, Skope matches you to deep career archetypes (Analyst, Creator, Builder, Explorer) based on how you solve problems."
            tag="Core AI Engine"
            accent="#4f8ef7"
            delay={0}
          />

          <SpotlightBentoCard
            icon="🏫"
            title="Real Indian Colleges"
            desc="From IITs & NLUs to hidden gems across India, every college recommendation comes with genuine placement insights."
            tag="Database"
            accent="#a855f7"
            delay={0.1}
          />

          <SpotlightBentoCard
            icon="💰"
            title="Budget-First Filter"
            desc="You set your family budget upfront. Skope strictly excludes colleges outside your financial comfort zone."
            tag="Financial Safety"
            accent="#06b6d4"
            delay={0.2}
          />

          <SpotlightBentoCard
            icon="🔥"
            title="Brutally Honest Mode"
            desc="No sugarcoating. If your estimated marks make a target college a reach, Skope clearly states the hard truths and offers realistic alternatives."
            tag="Unbiased"
            accent="#f97316"
            className="md:col-span-2"
            delay={0.3}
          />

          <SpotlightBentoCard
            icon="📅"
            title="30-Day Action Roadmap"
            desc="Receive 5 immediate, concrete steps to execute this week—from entrance exam prep to portfolio milestones."
            tag="Execution"
            accent="#10b981"
            delay={0.4}
          />
        </div>
      </section>

      {/* ══ SCROLLYTELLING HOW IT WORKS ═════════════════════ */}
      <section className="relative z-10 py-24 px-5 max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <span className="badge mb-4">The Process</span>
          <h2 className="font-clash text-[clamp(32px,4.5vw,52px)] font-bold text-white tracking-tight">
            How your PathReport is created
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          {[
            {
              step: '01',
              title: 'The AI Diagnostic Interview',
              desc: '8 adaptive questions. Skope asks follow-up questions tailored to your previous answers, probing for real strengths and genuine interests.',
              icon: '🎤',
            },
            {
              step: '02',
              title: 'Budget & Marks Calibration',
              desc: 'Input your estimated Class 12 marks, location preferences, and target annual tuition budget. Skope filters out unrealistic options instantly.',
              icon: '⚙️',
            },
            {
              step: '03',
              title: 'PathReport Generation',
              desc: 'Receive your comprehensive 15-career roadmap, college recommendations, reality checks, and parent alignment breakdown.',
              icon: '📊',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="spotlight-card p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6">
                <span className="font-mono text-[48px] font-extrabold text-indigo-500/40">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-clash text-[22px] font-bold text-white mb-2">{item.title}</h3>
                  <p className="font-jakarta text-[14px] text-white/60 max-w-[600px] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
              <span className="text-4xl p-4 rounded-2xl bg-white/5 border border-white/10">
                {item.icon}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ FAQ SECTION ════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-5 max-w-[800px] mx-auto">
        <div className="text-center mb-16">
          <span className="badge mb-4">FAQ</span>
          <h2 className="font-clash text-[clamp(32px,4.5vw,52px)] font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="glass-card p-8 rounded-[32px]">
          {FAQ_LIST.map((item, idx) => (
            <FAQItem key={idx} q={item.q} a={item.a} index={idx} />
          ))}
        </div>
      </section>

      {/* ══ FULL-SCREEN SPOTLIGHT CTA ═══════════════════════ */}
      <section className="relative z-10 py-32 px-5 text-center">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(168,85,247,0.2) 0%, rgba(79,142,247,0.1) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        <div className="max-w-[700px] mx-auto relative">
          <h2 className="font-clash text-[clamp(36px,6vw,68px)] font-extrabold text-white tracking-tight mb-6">
            Ready to find your <span className="text-gradient-hot">actual scope?</span>
          </h2>
          <p className="font-jakarta text-[17px] text-white/60 mb-10 max-w-[500px] mx-auto">
            Takes 7 minutes. 100% free. Get your personalized career & college PathReport now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="btn-primary text-[17px] px-10 py-4 font-sora w-full sm:w-auto shadow-[0_0_40px_rgba(236,72,153,0.4)]"
            >
              Find My Career Vibe →
            </button>

            <a
              href="https://discord.gg/ANeWgGASWm"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-[15px] px-8 py-4 font-sora w-full sm:w-auto flex items-center justify-center gap-2 text-[#5865F2]"
            >
              <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c1-.73,2-1.5,2.92-2.3a75.7,75.7,0,0,0,85.22,0c.9.8,1.91,1.57,2.92,2.3a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.6-18.83C129.58,49.38,123.38,26.54,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
              </svg>
              Join Discord
            </a>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-clash text-[22px] font-bold text-white">Skope</span>
              <span className="badge text-[9px] py-0.5 px-2">Made in India 🇮🇳</span>
            </div>
            <p className="font-jakarta text-[13px] text-white/40 mt-1">
              Building intelligent career transparency for Indian students.
            </p>
          </div>

          <div className="flex items-center gap-6 font-jakarta text-[13px] text-white/50">
            <a href="https://discord.gg/ANeWgGASWm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Discord
            </a>
            <span>•</span>
            <span>© 2026 Skope</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
