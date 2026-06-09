import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import AuroraBackground from '../components/AuroraBackground'

// ─── Animation Variants ────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.7, ease: [0.16,1,0.3,1] } }
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } }
}
const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  show:   { opacity: 1, scale: 1,    transition: { duration: 0.6, ease: [0.16,1,0.3,1] } }
}

// ─── Section Reveal Hook ────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return { ref, inView }
}

// ─── Word-by-word text reveal ──────────────────────────
function RevealText({ text, className, delay = 0 }) {
  const words = text.split(' ')
  const { ref, inView } = useReveal()
  return (
    <span ref={ref} className={className} style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: delay + i * 0.07, ease: [0.16,1,0.3,1] }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// ─── Animated Counter ──────────────────────────────────
function Counter({ to, suffix = '', prefix = '' }) {
  const { ref, inView } = useReveal()
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
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  )
}

// ─── Bento Card ────────────────────────────────────────
function BentoCard({ icon, title, desc, accent, large, children, delay = 0 }) {
  const { ref, inView } = useReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16,1,0.3,1] }}
      className={`card-premium p-6 rounded-[20px] relative overflow-hidden ${large ? 'md:col-span-2' : ''}`}
    >
      {/* Accent glow in corner */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
          filter: 'blur(24px)',
        }}
      />

      <div
        className="inline-flex items-center justify-center w-10 h-10 rounded-[12px] mb-4 text-lg"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
      >
        {icon}
      </div>

      <h3 className="font-clash text-[18px] font-semibold text-white/90 mb-2 leading-snug">{title}</h3>
      <p className="font-inter text-[13px] text-white/45 leading-relaxed">{desc}</p>

      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  )
}

// ─── Interactive Demo ──────────────────────────────────
const DEMO_SUBJECTS = ['Maths', 'Biology', 'Art & Design', 'Business / Commerce', 'Physics']
const DEMO_ARCHETYPES = {
  'Maths':              { vibe: 'The Analyst 📊', careers: ['Data Scientist', 'Quant Analyst', 'Actuary'] },
  'Biology':            { vibe: 'The Builder 🔬', careers: ['Biomedical Researcher', 'Clinical Data Manager', 'Genetic Counsellor'] },
  'Art & Design':       { vibe: 'The Creator 🎨', careers: ['Product Designer', 'UX Researcher', 'Creative Technologist'] },
  'Business / Commerce':{ vibe: 'The Strategist 📈', careers: ['Startup Founder', 'Management Consultant', 'Product Manager'] },
  'Physics':            { vibe: 'The Explorer 🔭', careers: ['Astrophysicist', 'Robotics Engineer', 'Materials Scientist'] },
}

function InteractiveDemo() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState(0) // 0 = pick, 1 = loading, 2 = result
  const [collapsed, setCollapsed] = useState(false)
  const { ref, inView } = useReveal()

  const pick = (subj) => {
    setSelected(subj)
    setStep(1)
    setTimeout(() => setStep(2), 1400)
  }
  const reset = () => { setSelected(null); setStep(0) }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
      className="max-w-[700px] mx-auto rounded-[24px] overflow-hidden"
      style={{
        background: 'rgba(17,17,24,0.8)',
        border: '1px solid rgba(99,102,241,0.2)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 0 60px rgba(99,102,241,0.08), 0 24px 64px rgba(0,0,0,0.5)',
      }}
    >
      {/* Terminal header bar */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5">
        {/* Red — reset demo */}
        <button
          onClick={reset}
          title="Reset demo"
          style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(248,113,113,0.7)', border: 'none', cursor: 'pointer', padding: 0, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.7)'}
        />
        {/* Yellow — collapse/expand */}
        <button
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Expand demo' : 'Collapse demo'}
          style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(251,191,36,0.7)', border: 'none', cursor: 'pointer', padding: 0, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#fbbf24'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.7)'}
        />
        {/* Green — navigate to start */}
        <button
          onClick={() => navigate(user ? '/form' : '/login')}
          title="Open full diagnostic"
          style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(74,222,128,0.7)', border: 'none', cursor: 'pointer', padding: 0, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#4ade80'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.7)'}
        />
        <span className="ml-3 font-mono text-[11px] text-white/20">skope — career-intelligence</span>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}
            className="overflow-hidden"
          >
            <div className="p-6 min-h-[200px]">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="font-mono text-[13px] text-[#6366f1] mb-1">→ skope analyze</p>
                    <p className="font-inter text-[14px] text-white/70 mb-5">
                      What subject do you actually enjoy? (not what you're "supposed" to say)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DEMO_SUBJECTS.map(s => (
                        <button
                          key={s}
                          onClick={() => pick(s)}
                          className="font-inter text-[13px] font-medium px-4 py-2 rounded-[10px] transition-all duration-200 hover:scale-[1.03]"
                          style={{
                            background: 'rgba(99,102,241,0.08)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            color: 'rgba(241,245,249,0.8)',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)' }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3 py-4">
                    {['Analyzing your profile...', 'Cross-referencing 2,400 career paths...', 'Matching to real Indian colleges...'].map((t, i) => (
                      <motion.div
                        key={t}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.3 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-4 h-4 rounded-full border border-[#6366f1] border-t-transparent animate-spin" style={{ animationDuration: '0.7s' }} />
                        <span className="font-mono text-[12px] text-white/50">{t}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {step === 2 && selected && (
                  <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="font-mono text-[11px] text-green-400">Analysis complete</span>
                    </div>

                    <div className="rounded-[14px] p-4 mb-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                      <p className="font-inter text-[11px] text-white/35 mb-1 uppercase tracking-widest">Your Career Vibe</p>
                      <p className="font-clash text-[22px] font-semibold text-white">{DEMO_ARCHETYPES[selected].vibe}</p>
                    </div>

                    <p className="font-inter text-[12px] text-white/40 mb-2 uppercase tracking-widest">Top matching paths</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {DEMO_ARCHETYPES[selected].careers.map(c => (
                        <span key={c} className="font-inter text-[12px] px-3 py-1 rounded-full text-white/70" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          {c}
                        </span>
                      ))}
                    </div>

                    <p className="font-inter text-[12px] text-white/30 italic mb-5">
                      This is 5% of what Skope actually does. The real PathReport covers 15 careers, 15 colleges, a 30-day action plan, and an honest reality check.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(user ? '/form' : '/login')}
                        className="btn-primary text-[13px] px-5 py-2.5"
                      >
                        Get My Full PathReport →
                      </button>
                      <button onClick={reset} className="btn-ghost text-[12px] px-4 py-2">
                        Try again
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── FAQ Item ──────────────────────────────────────────
function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16,1,0.3,1] }}
      className="border-b border-white/5"
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-5 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span className="font-inter text-[15px] font-medium text-white/80 pr-6">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-[#6366f1] text-xl font-light"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{  height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}
            className="overflow-hidden"
          >
            <p className="font-inter text-[14px] text-white/45 leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Landing Page ─────────────────────────────────
const FAQ = [
  { q: "Is this real AI or a form with pre-written answers?", a: "Real AI. It conducts a live conversation and changes its questions based on exactly what you say. No two students get the same interview." },
  { q: "Will it push me toward a college I can't afford?", a: "No. You tell us your budget upfront. Every recommendation is filtered by what your family can actually pay." },
  { q: "What if I don't have my final marks yet?", a: "Give us your estimated marks. You can come back after results and generate a new PathReport with updated numbers." },
  { q: "Does it only work for engineering?", a: "No. Skope covers PCM, PCB, Commerce, Arts, Design, Law, Hotel Management, Agriculture, Media, and more. It knows real Indian colleges across every stream." },
  { q: "How is this different from Googling colleges?", a: "Google gives you sponsored lists. Skope gives you a ranked shortlist filtered by YOUR marks, YOUR budget, YOUR city, and YOUR interest — with honest reality checks attached." },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleStart = () => {
    if (user) {
      navigate('/form')
    } else {
      sessionStorage.setItem('initial_diagnostic_message', "Let's build your PathReport.")
      navigate('/login')
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Background */}
      <AuroraBackground />

      {/* Navbar */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* ══ HERO ═══════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-5 pt-28 pb-16">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16,1,0.3,1] }}
          className="badge mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          🇮🇳 Built for Class 12 India · Free to use
        </motion.div>

        {/* Headline */}
        <div className="max-w-[780px] mx-auto mb-6">
          <h1 className="font-clash font-bold leading-[1.05] tracking-[-2.5px] text-[clamp(44px,7vw,88px)]">
            <RevealText
              text="Your career isn't"
              className="text-white"
              delay={0.1}
            />
            <br />
            <RevealText
              text="a guess."
              className="text-gradient"
              delay={0.4}
            />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.16,1,0.3,1] }}
            className="font-inter text-[17px] text-white/50 max-w-[520px] mx-auto leading-relaxed mt-6"
          >
            Stop choosing your future based on what your relatives think. Skope figures out what actually fits you — brutally honestly — using real AI.
          </motion.p>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0, ease: [0.16,1,0.3,1] }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          <motion.button
            id="hero-cta"
            onClick={handleStart}
            className="btn-primary text-[15px] px-8 py-4 font-sora"
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
          >
            Find My Career Vibe
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </motion.button>

          <motion.button
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-ghost text-[14px] px-7 py-[15px]"
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
          >
            See how it works
          </motion.button>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="font-inter text-[12px] text-white/20 tracking-wide"
        >
          8 questions · ~7 minutes · 100% free · No college commissions
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-inter text-[10px] text-white/20 tracking-[0.2em] uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[1px] h-8 bg-gradient-to-b from-white/20 to-transparent"
          />
        </motion.div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 px-5">
        <div className="max-w-[900px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: 8,     suffix: '',  label: 'Smart questions' },
            { value: 15,    suffix: '+', label: 'Career paths matched' },
            { value: 15,    suffix: '+', label: 'Colleges shortlisted' },
            { value: 7,     suffix: 'm', label: 'Avg time to report' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16,1,0.3,1] }}
              className="text-center"
            >
              <p className="font-clash text-[clamp(32px,5vw,52px)] font-bold text-white leading-none mb-1">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="font-inter text-[13px] text-white/35">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ INTERACTIVE DEMO ═══════════════════════════════ */}
      <section id="demo" className="relative z-10 py-20 px-5">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <span className="badge mb-4 inline-flex">Try it right now</span>
            <h2 className="font-clash text-[clamp(28px,4vw,44px)] font-bold text-white tracking-tight">
              <RevealText text="See what Skope" delay={0} />
              <br />
              <span className="text-gradient-2">
                <RevealText text="says about you" delay={0.2} />
              </span>
            </h2>
          </div>
          <InteractiveDemo />
        </div>
      </section>

      {/* ══ BENTO FEATURE GRID ═════════════════════════════ */}
      <section className="relative z-10 py-20 px-5">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <span className="badge mb-4 inline-flex">What you get</span>
            <h2 className="font-clash text-[clamp(28px,4vw,44px)] font-bold text-white tracking-tight">
              <RevealText text="Built different." delay={0} />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BentoCard
              icon="🎯"
              title="Career Vibe Matching"
              desc="Not job titles — actual archetypes. Analyst, Creator, Builder, Explorer, Strategist. We find yours from how you actually think, not what you think you should say."
              accent="#6366f1"
              delay={0}
            />
            <BentoCard
              icon="🏫"
              title="Real Indian Colleges"
              desc="Not just IITs and NITs. Hidden gems filtered by your marks, budget, and city. With honest Reddit verdicts from actual students."
              accent="#a855f7"
              delay={0.08}
            />
            <BentoCard
              icon="💰"
              title="Budget-First Filtering"
              desc="You tell us what your family can spend. Every recommendation stays within it. No aspirational nonsense."
              accent="#22d3ee"
              delay={0.16}
            />
            <BentoCard
              icon="🔥"
              title="Brutally Honest Mode"
              desc="No sugarcoating. If your marks don't match your dream college, we tell you. Then we show you what actually works."
              accent="#f59e0b"
              delay={0.24}
              large
            />
            <BentoCard
              icon="📅"
              title="30-Day Action Plan"
              desc="After your PathReport, you get 5 specific actions to take right now. No vague advice."
              accent="#10b981"
              delay={0.32}
            />
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════ */}
      <section className="relative z-10 py-20 px-5">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <span className="badge mb-4 inline-flex">Process</span>
            <h2 className="font-clash text-[clamp(28px,4vw,44px)] font-bold text-white tracking-tight">
              <RevealText text="How it works" delay={0} />
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'The Interview',
                desc: "8 questions. Not a form — a real conversation. It adapts based on what you actually say.",
                icon: '🎤',
              },
              {
                num: '02',
                title: 'Your PathReport',
                desc: "A brutally honest analysis: 15 career paths, 15 colleges, reality checks, and a 30-day plan.",
                icon: '📊',
              },
              {
                num: '03',
                title: 'Take Action',
                desc: "You leave with specific next steps — not inspiration, not motivation. Actual things to do this week.",
                icon: '⚡',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16,1,0.3,1] }}
                className="relative"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%+12px)] w-[calc(100%-24px)] h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                )}

                <div className="card-premium p-6 rounded-[20px]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[11px] text-white/20 tracking-widest">{step.num}</span>
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <h3 className="font-clash text-[18px] font-semibold text-white mb-2">{step.title}</h3>
                  <p className="font-inter text-[13px] text-white/45 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-5">
        <div className="max-w-[660px] mx-auto">
          <div className="text-center mb-12">
            <span className="badge mb-4 inline-flex">Questions</span>
            <h2 className="font-clash text-[clamp(28px,4vw,40px)] font-bold text-white tracking-tight">
              <RevealText text="Still skeptical? Good." delay={0} />
            </h2>
          </div>
          <div>
            {FAQ.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-5">
        {/* Glow behind CTA */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="max-w-[600px] mx-auto text-center relative">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
            className="font-clash text-[clamp(32px,5vw,56px)] font-bold text-white tracking-tight mb-4"
          >
            Ready to find your scope?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16,1,0.3,1] }}
            className="font-inter text-[15px] text-white/40 mb-10"
          >
            8 questions · ~7 minutes · Real, personalized insights.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16,1,0.3,1] }}
            onClick={handleStart}
            id="final-cta"
            className="btn-primary text-[16px] px-10 py-4 font-sora"
            whileTap={{ scale: 0.96 }}
          >
            Find My Career Vibe
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="font-inter text-[12px] text-white/20 mt-5"
          >
            Works for PCM · PCB · Commerce · Arts · and everything in between
          </motion.p>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/5 px-5 py-10">
        <div className="max-w-[900px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-clash text-[18px] font-bold">
              Sk<span className="text-[#6366f1]">o</span>pe
            </span>
            <p className="font-inter text-[12px] text-white/25 mt-1">
              "Built because choosing a career shouldn't feel like gambling."
            </p>
          </div>
          <p className="font-inter text-[11px] text-white/20">
            © 2026 Skope · Made in India 🇮🇳
          </p>
        </div>
      </footer>
    </div>
  )
}
