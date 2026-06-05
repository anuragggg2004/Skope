import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

// ─── SVG Icons ────────────────────────────────────────
const IconTarget = ({ color = 'currentColor', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const IconStar = ({ color = 'currentColor', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconBolt = ({ color = 'currentColor', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const IconChat = ({ color = 'currentColor', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
  </svg>
)
const IconCheck = ({ color = '#6bcb77', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconX = ({ color = '#ff6b6b', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconGem = ({ color = '#fbbf24', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 22 22 7 12 2"/><line x1="2" y1="7" x2="22" y2="7"/>
  </svg>
)
const IconChevron = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" strokeWidth="2.5" strokeLinecap="round"
    style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconBrain = ({ color = 'currentColor', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7v0A2.5 2.5 0 012 9.5v5A2.5 2.5 0 004.5 17v0A2.5 2.5 0 007 19.5v0A2.5 2.5 0 009.5 22h5a2.5 2.5 0 002.5-2.5v0A2.5 2.5 0 0019.5 17v0A2.5 2.5 0 0022 14.5v-5A2.5 2.5 0 0019.5 7v0A2.5 2.5 0 0017 4.5v0A2.5 2.5 0 0014.5 2z"/>
  </svg>
)

const faqItems = [
  {
    q: "Is this an actual AI or a form with pre-written answers?",
    a: "Real AI. It conducts a live conversation with you. It changes its follow-up questions based on your specific answers — no two students get the same interview."
  },
  {
    q: "Will it push me toward a college I can't afford?",
    a: "No. You tell us your budget upfront. Every college recommendation is filtered by what your family can actually pay."
  },
  {
    q: "What if I don't have my final marks yet?",
    a: "Tell us your estimated or current marks. You can come back and update your PathReport after board results or competitive exam percentiles come out."
  },
  {
    q: "Does it only work for engineering students?",
    a: "No. Skope covers PCM, PCB, Commerce, Arts, Design, Law, Hotel Management, Agriculture, Media, and more. It knows real Indian colleges across all streams."
  },
  {
    q: "How is this different from Google searching colleges?",
    a: "Google gives you sponsored lists. Skope gives you a ranked shortlist filtered by YOUR marks, YOUR budget, YOUR city, and YOUR career interest — with honest reality checks attached."
  }
]

const streams = [
  { stream: 'PCM', sub: 'Engineering, Tech, Design', color: '#4f8ef7', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
  { stream: 'PCB', sub: 'Medicine, Biotech, Health', color: '#22d3a0', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3a0" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z"/><circle cx="12" cy="9" r="2.5"/></svg> },
  { stream: 'Commerce', sub: 'Finance, Economics, CA', color: '#fbbf24', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><rect x="3" y="14" width="4" height="7" rx="1"/><rect x="10" y="9" width="4" height="12" rx="1"/><rect x="17" y="4" width="4" height="17" rx="1"/></svg> },
  { stream: 'Arts', sub: 'Law, Media, Design, Social Work', color: '#f472b6', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17" cy="14" r="2"/><circle cx="7" cy="14" r="2"/><circle cx="10" cy="19" r="2"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/></svg> },
  { stream: 'Liberal Arts', sub: 'Ashoka, FLAME, Krea', color: '#8b5cf6', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8M8 11h5"/></svg> },
  { stream: 'Hotel Mgmt', sub: 'IHM, Hospitality, Tourism', color: '#f97316', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><rect x="9" y="13" width="6" height="8" rx="1"/></svg> },
  { stream: 'Agriculture', sub: 'IARI, BHU, AgriTech', color: '#22d3a0', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3a0" strokeWidth="2"><path d="M12 22V8"/><path d="M5 12s1-6 7-6"/><path d="M19 12s-1-6-7-6"/></svg> },
  { stream: 'Sports', sub: 'LNUPE, Coaching, Sports Science', color: '#ef4444', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10A15 15 0 0112 2z"/><path d="M2 12h20"/></svg> }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  
  // Interactive Demo States
  const [demoStep, setDemoStep] = useState(0)
  const [demoSubject, setDemoSubject] = useState('')
  const [demoText, setDemoText] = useState('')
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoResponse, setDemoResponse] = useState('')

  const handleStart = () => {
    sessionStorage.setItem('initial_diagnostic_message', 'Let\'s build your PathReport.')
    navigate('/form')
  }

  const handleDemoSubjectSelect = (sub) => {
    setDemoSubject(sub)
    setDemoLoading(true)
    setTimeout(() => {
      setDemoLoading(false)
      setDemoStep(1)
    }, 900)
  }

  const handleDemoTextSubmit = (e) => {
    e.preventDefault()
    if (!demoText.trim()) return
    setDemoLoading(true)
    setTimeout(() => {
      setDemoLoading(false)
      // Determine a fun mock result based on subject choice
      let archetype = 'The Explorer'
      if (demoSubject === 'Maths') archetype = 'The Analyst'
      if (demoSubject === 'Art & Design') archetype = 'The Creator'
      if (demoSubject === 'Business / Commerce') archetype = 'The Strategist'
      if (demoSubject === 'Biology') archetype = 'The Builder'
      
      setDemoResponse(`Analyzing your vibe... You sound like you belong in "${archetype}" category. Let's do the full diagnostic!`)
      setDemoStep(2)
    }, 1200)
  }

  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="page-wrapper">
        <Navbar />

        {/* ══════════════════════════════════════════════ */}
        {/* HERO */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[820px] mx-auto px-10 pt-20 pb-16 text-center animate-fadeUp max-sm:px-5 max-sm:pt-12">
          {/* Brutally Honest Badge Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mb-6 font-dm text-[12px] text-[#fbbf24] bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.15)] rounded-full px-4 py-1.5 w-fit mx-auto">
            <span className="flex items-center gap-1">✓ No sugarcoating</span>
            <span className="text-[rgba(240,242,255,0.25)]">•</span>
            <span className="flex items-center gap-1">✓ No college commissions</span>
            <span className="text-[rgba(240,242,255,0.25)]">•</span>
            <span className="flex items-center gap-1">✓ No fake motivation</span>
          </div>

          <h1 className="font-sora font-bold text-[56px] leading-[1.1] tracking-[-2px] mb-6 max-sm:text-[38px] max-sm:tracking-[-1px]">
            <span className="block text-[rgba(240,242,255,0.5)]">Iiske aage</span>
            <span className="block text-gradient pb-1">scope hai kya?</span>
            <span className="block text-white mt-1">Find out.</span>
          </h1>

          {/* Upgraded Headline Copy with Emotion */}
          <p className="font-dm text-[15px] text-[rgba(240,242,255,0.65)] max-w-[520px] mx-auto leading-relaxed mb-6">
            The career advice most students get is generic. Yours shouldn't be. Stop choosing your future based on guesswork — Skope figures out what actually fits you.
          </p>

          {/* Archetype Preview above CTA */}
          <div className="mb-6 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <span className="font-dm text-[11px] uppercase tracking-[1.5px] text-[rgba(240,242,255,0.45)] block mb-2.5">Discover your archetype</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['🛠️ Builder', '🔭 Explorer', '🎨 Creator', '🎯 Strategist', '📊 Analyst'].map((arch, idx) => (
                <span key={idx} className="font-dm text-[12px] font-semibold text-white px-3 py-1 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                  {arch}
                </span>
              ))}
            </div>
          </div>

          {/* CTA with Curiosity Driven Text */}
          <div className="flex flex-col items-center">
            <button onClick={handleStart} id="hero-cta"
              className="inline-flex items-center gap-2.5 font-sora text-[15px] font-semibold bg-gradient-to-r from-[#4f8ef7] to-[#8b5cf6] text-white px-8 py-3.5 rounded-full border-none cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] transition-all duration-300">
              Discover My Archetype
              <IconArrow />
            </button>

            {/* Time / Progress Preview */}
            <p className="font-dm text-[12px] text-[#fbbf24] mt-3.5 flex items-center gap-1.5">
              <span>⏱️ 8 questions total</span>
              <span className="text-[rgba(240,242,255,0.25)]">•</span>
              <span>≈ 7 minutes remaining</span>
            </p>
          </div>

          {/* Moat / positioning copy block (You are not your marks) */}
          <div className="my-12 p-6 glass-card rounded-[20px] border border-[rgba(108,99,255,0.15)] max-w-[600px] mx-auto text-left bg-gradient-to-r from-[rgba(108,99,255,0.03)] to-transparent">
            <h3 className="font-sora text-[16px] font-bold text-white mb-2">You are not your marks.</h3>
            <p className="font-dm text-[13px] text-[rgba(240,242,255,0.6)] leading-relaxed mb-4">
              Skope maps the full picture of who you are, not just standard grade percentages:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 font-dm text-[12.5px] text-[rgba(240,242,255,0.8)]">
              <div>🧠 Interests & Personality</div>
              <div>🎯 Personal Goals</div>
              <div>🛡️ Real Constraints</div>
              <div>📖 Learning Style</div>
              <div>💰 Education Budget</div>
              <div>🤝 Family Expectations</div>
            </div>
          </div>

          {/* Social Proof with Real Credibility */}
          <div className="flex items-center justify-center gap-10 mt-6 pt-8 border-t border-[rgba(79,142,247,0.15)] max-sm:flex-col max-sm:gap-5">
            {[
              { n: 'Personalized', l: 'for every student', s: '(no cookie-cutter advice)' },
              { n: 'Adaptive', l: 'conversational questioning', s: '(finds hidden traits)' },
              { n: 'Real', l: 'Indian colleges & careers', s: '(validated data systems)' }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-sora text-[17px] font-bold text-white">{s.n}</div>
                <div className="font-dm text-[12.5px] text-[rgba(240,242,255,0.4)] mt-0.5 leading-snug">
                  {s.l}<br/><span className="text-[rgba(240,242,255,0.3)] text-[11px]">{s.s}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* WHAT YOU'LL DISCOVER */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-12 max-sm:px-5">
          <div className="text-center mb-10">
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-[#4f8ef7] block mb-2">What you'll discover</span>
            <h2 className="font-sora text-[30px] font-semibold text-white">Your exact scope, calculated.</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {[
              { title: 'Career Matches', desc: 'Roles matched to your specific archetype', color: 'rgba(79,142,247,0.1)' },
              { title: 'Hidden Colleges', desc: 'Excellent options that fit your budget', color: 'rgba(139,92,246,0.1)' },
              { title: 'Salary Reality', desc: 'True starting salaries, not averages', color: 'rgba(34,211,160,0.1)' },
              { title: 'Entrance Exams', desc: 'Niche test paths for key programs', color: 'rgba(251,191,36,0.1)' },
              { title: 'Future Self', desc: 'Simulated day-in-the-life story at 30', color: 'rgba(244,114,182,0.1)' }
            ].map((item, idx) => (
              <div key={idx} className="glass-card rounded-[16px] p-5 flex flex-col justify-between" style={{ background: item.color }}>
                <div>
                  <h4 className="font-sora text-[13.5px] font-bold text-white mb-2">✓ {item.title}</h4>
                  <p className="font-dm text-[11.5px] text-[rgba(240,242,255,0.5)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* INTERACTIVE DEMO */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[700px] mx-auto px-10 py-12 max-sm:px-5">
          <div className="glass-card rounded-[20px] p-6 sm:p-8 border border-[rgba(108,99,255,0.15)] bg-[rgba(10,10,15,0.4)]">
            <div className="text-center mb-6">
              <span className="font-dm text-[11px] font-bold text-blue uppercase tracking-[1.5px]">Try A Demo</span>
              <h3 className="font-sora text-[22px] font-bold text-white mt-1">Talk to Skope right now</h3>
            </div>

            <div className="space-y-4 min-h-[160px] flex flex-col justify-end">
              {/* Question 0 */}
              <div className="flex justify-start">
                <div className="bg-[#141926] border border-[rgba(79,142,247,0.12)] rounded-[14px_14px_14px_4px] px-4 py-3 max-w-[85%] font-dm text-[13px] text-[rgba(240,242,255,0.85)]">
                  <strong>Skope:</strong> What subject do you enjoy studying the most?
                </div>
              </div>

              {/* Step 0 Subject Selector */}
              {demoStep === 0 && !demoLoading && (
                <div className="flex flex-wrap gap-2 justify-end mt-2 animate-fadeUp">
                  {['Maths', 'Biology', 'Art & Design', 'Business / Commerce', 'Writing & Media'].map((sub, i) => (
                    <button
                      key={i}
                      onClick={() => handleDemoSubjectSelect(sub)}
                      className="font-dm text-[12px] bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.25)] text-white px-3 py-1.5 rounded-full hover:bg-[rgba(108,99,255,0.2)] transition-colors cursor-pointer"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1 User Answer */}
              {demoStep >= 1 && (
                <div className="flex justify-end">
                  <div className="bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.25)] rounded-[14px_14px_4px_14px] px-4 py-3 max-w-[85%] font-dm text-[13px] text-white">
                    I enjoy {demoSubject}.
                  </div>
                </div>
              )}

              {/* Step 1 Question */}
              {demoStep >= 1 && !demoLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#141926] border border-[rgba(79,142,247,0.12)] rounded-[14px_14px_14px_4px] px-4 py-3 max-w-[85%] font-dm text-[13px] text-[rgba(240,242,255,0.85)]">
                    <strong>Skope:</strong> Interesting... {demoSubject} is versatile. Do you see yourself building technical solutions, or are you more curious about user behavior?
                  </div>
                </div>
              )}

              {/* Step 1 Input Form */}
              {demoStep === 1 && !demoLoading && (
                <form onSubmit={handleDemoTextSubmit} className="flex gap-2 mt-2 animate-fadeUp">
                  <input
                    type="text"
                    required
                    placeholder="Type: 'building things', 'understanding users' etc..."
                    value={demoText}
                    onChange={(e) => setDemoText(e.target.value)}
                    className="flex-1 bg-navy3 border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-2 text-white font-dm text-[12.5px] outline-none focus:border-purple"
                  />
                  <button
                    type="submit"
                    className="font-sora text-[12px] font-semibold bg-gradient-to-r from-blue to-purple text-white px-4 py-2 rounded-[10px] border-none cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              )}

              {/* Step 2 AI Answer */}
              {demoStep === 2 && !demoLoading && (
                <>
                  <div className="flex justify-end">
                    <div className="bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.25)] rounded-[14px_14px_4px_14px] px-4 py-3 max-w-[85%] font-dm text-[13px] text-white">
                      {demoText}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#141926] border border-[rgba(79,142,247,0.12)] rounded-[14px_14px_14px_4px] px-4 py-3 max-w-[85%] font-dm text-[13px] text-[#fbbf24] border-l-2 border-l-[#fbbf24] leading-relaxed">
                      💡 <strong>{demoResponse}</strong>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleStart}
                      className="font-sora text-[13px] font-bold bg-gradient-to-r from-blue to-purple text-white px-6 py-2.5 rounded-full border-none cursor-pointer shadow-[0_0_15px_rgba(108,99,255,0.3)]"
                    >
                      Discover My Archetype →
                    </button>
                  </div>
                </>
              )}

              {/* Loading Indicator */}
              {demoLoading && (
                <div className="flex justify-start">
                  <div className="bg-navy3 border border-[rgba(79,142,247,0.12)] rounded-full px-4 py-2.5 flex items-center gap-1.5">
                    <span className="font-dm text-[11px] text-[rgba(240,242,255,0.4)]">Skope is thinking</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple animate-ping" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* FUTURE SELF PREVIEW */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[820px] mx-auto px-10 py-12 max-sm:px-5">
          <div className="text-center mb-8">
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-pink block mb-2">Simulation Preview</span>
            <h2 className="font-sora text-[28px] font-bold text-white">A Day In Your Life At 30</h2>
            <p className="font-dm text-[13.5px] text-[rgba(240,242,255,0.45)] mt-2">Here's a glimpse of the Future Self narratives Skope builds for you:</p>
          </div>
          
          <div className="glass-card rounded-[20px] p-6 border border-[rgba(236,72,153,0.15)] bg-gradient-to-br from-[rgba(236,72,153,0.03)] to-transparent max-w-[500px] mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[20px]">🔮</span>
              <div>
                <span className="font-dm text-[10px] font-bold text-pink uppercase tracking-[1.5px]">Simulation Preview</span>
                <h4 className="font-sora text-[14px] font-bold text-white">Product Designer · Bangalore</h4>
              </div>
            </div>
            
            <div className="font-dm text-[12.5px] text-[rgba(240,242,255,0.7)] leading-[1.7] space-y-3.5 bg-[rgba(5,5,10,0.4)] p-4 rounded-[14px] border border-[rgba(255,255,255,0.03)] italic">
              <div>
                <strong>8:00 AM</strong> — You wake up in your apartment in Indiranagar, Bangalore. You grab a coffee and review a feature launch metrics dashboard. The new micro-interaction you designed saw a 14% increase in user retention overnight.
              </div>
              <div>
                <strong>12:30 PM</strong> — You meet with the engineering team to solve a layout dispute. Since you know a bit of coding yourself, you're able to speak their language and resolve it instantly.
              </div>
              <div>
                <strong>4:00 PM</strong> — Deep work session in Figma, mapping out the product flows for an AI-augmented educational tool. This feels exactly like the side projects you used to build back in Class 12...
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* HOW IT WORKS */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-16 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-12 animate-fadeUp">
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-[#4f8ef7] block mb-3">How it works</span>
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">Not a form. A conversation.</h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
            {[
              { step: '01', title: 'Tell us about you', desc: 'Stream, subjects you love, what you do outside school. Write freely — no rigid checkboxes.' },
              { step: '02', title: 'Skope interviews you', desc: 'The AI asks follow-up questions that adapt to your specific answers. Like a real counsellor listening.' },
              { step: '03', title: 'Set your constraints', desc: 'Budget, cities, exam preferences. We only recommend what actually fits your financial reality.' },
              { step: '04', title: 'Get your PathReport', desc: 'Careers, colleges, hidden gems, entrance exams, reality checks, and an interactive checklist.' }
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-[14px] p-[24px] fade-in" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
                <div className="font-sora text-[11px] font-medium text-[#4f8ef7] mb-3 tracking-[1px]">{item.step}</div>
                <div className="font-sora text-[14px] font-semibold text-white mb-2">{item.title}</div>
                <div className="font-dm text-[13px] text-[rgba(240,242,255,0.45)] leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* WHY SKOPE IS DIFFERENT */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-16 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-10 animate-fadeUp">
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-[#4f8ef7] block mb-3">The difference</span>
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">Not your typical career counsellor.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <div className="glass-card rounded-[14px] p-6 border-t-2 border-t-[#ff6b6b]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(255,107,107,0.1)]">
                  <IconX color="#ff6b6b" size={16} />
                </div>
                <span className="font-sora text-[15px] font-semibold text-[#ff6b6b]">Traditional Counsellors</span>
              </div>
              <ul className="space-y-3">
                {['Push only IITs, NITs, and famous names', 'Same generic advice for every student', '"Follow your passion" (then charges ₹5000)', 'No real data on fees, exams, or placements', 'Never tells you the hard truth', 'Ask only your stream'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5"><IconX /></span>
                    <span className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-[14px] p-6 border-t-2 border-t-[#6bcb77]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(107,203,119,0.1)]">
                  <IconCheck color="#6bcb77" size={16} />
                </div>
                <span className="font-sora text-[15px] font-semibold text-[#6bcb77]">Skope</span>
              </div>
              <ul className="space-y-3">
                {['Hidden gems that genuinely fit YOUR profile', 'Questions adapt to your specific answers', 'Blunt about reality — names real blockers', 'Real colleges with fees, exams, and caution flags', 'Tells you when your plan has a problem', 'Understand your personality & goals'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5"><IconCheck /></span>
                    <span className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* THE TRUTH SECTION */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-16 max-sm:px-5 max-sm:py-12">
          <div className="glass-card rounded-[18px] p-8 sm:p-10 bg-[rgba(139,92,246,0.04)] border-t-2 border-t-[#8b5cf6] animate-fadeUp">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-[rgba(139,92,246,0.12)]">
                <IconBrain color="#8b5cf6" />
              </div>
              <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-[#8b5cf6]">What nobody tells you</span>
            </div>
            <h2 className="font-sora text-[24px] sm:text-[28px] font-semibold text-white mb-5 leading-snug">
              Here's the truth about Indian college admissions.
            </h2>
            <div className="space-y-4">
              <p className="font-dm text-[14px] text-[rgba(240,242,255,0.55)] leading-[1.75]">
                IIT placements include mass hiring by consulting firms who take anyone with the IIT tag. If you actually want to build products or work in engineering, your portfolio and skills matter more than your college logo after year 1.
              </p>
              <p className="font-dm text-[14px] text-[rgba(240,242,255,0.55)] leading-[1.75]">
                The students who build unique careers often picked unusual colleges — places like FLAME, Ashoka, Thapar, or DAIICT — where they learned differently and shipped real projects. The differentiation comes from what you build, not where you sat in a lecture hall.
              </p>
              <p className="font-dm text-[14px] text-[rgba(240,242,255,0.55)] leading-[1.75]">
                Skope exists because we think every student deserves to hear this before they make the biggest decision of their life based on brand name alone.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* WORKS FOR ALL STREAMS */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-16 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-10 animate-fadeUp">
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-[#4f8ef7] block mb-3">Every path</span>
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">Works for all streams.</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            {streams.map((item, i) => (
              <div key={i} className="glass-card rounded-[14px] p-5 text-center hover:-translate-y-1 transition-transform duration-200 cursor-default group">
                <div className="w-11 h-11 rounded-[12px] mx-auto mb-3 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                  {item.icon}
                </div>
                <div className="font-sora text-[13px] font-semibold text-white mb-1">{item.stream}</div>
                <div className="font-dm text-[11px] text-[rgba(240,242,255,0.4)] leading-snug">{item.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* HONEST STATUS SECTION (Replaced Fake Testimonials) */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-16 text-center max-sm:px-5">
          <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-[#4f8ef7] block mb-3">Beta Testing</span>
          <h2 className="font-sora text-[26px] sm:text-[30px] font-bold text-white mb-3">Currently testing with early student beta testers.</h2>
          <p className="font-dm text-[13.5px] text-[rgba(240,242,255,0.45)] max-w-[420px] mx-auto leading-relaxed">
            We are gathering real feedback from Class 12 students across India. Authentic success stories will be published here soon.
          </p>
        </section>

        {/* City trust signals */}
        <section className="max-w-[900px] mx-auto px-10 py-12 max-sm:px-5 animate-fadeUp">
          <p className="text-center font-dm text-[12px] text-[rgba(240,242,255,0.35)] mb-6">Designed for students from</p>
          <div className="flex justify-center items-center gap-6 sm:gap-10 flex-wrap">
            {['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Kolkata', 'Tier 2 & 3 cities'].map((city, i) => (
              <span key={i} className="font-dm text-[13px] text-[rgba(240,242,255,0.35)] whitespace-nowrap">{city}</span>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* FAQ */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[700px] mx-auto px-10 py-16 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-10 animate-fadeUp">
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-[#4f8ef7] block mb-3">FAQ</span>
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">Questions?</h2>
          </div>
          <div className="space-y-3 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            {faqItems.map((item, i) => (
              <div key={i} className="glass-card rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200 hover:border-[rgba(79,142,247,0.25)]"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex items-center justify-between p-5">
                  <span className="font-sora text-[14px] font-semibold text-white pr-4 leading-snug">{item.q}</span>
                  <span className="shrink-0"><IconChevron open={openFaq === i} /></span>
                </div>
                <div className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openFaq === i ? '200px' : '0px', opacity: openFaq === i ? 1 : 0 }}>
                  <p className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-relaxed px-5 pb-5">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* PRICING */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-16 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-10 animate-fadeUp">
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">Completely free. No hidden costs.</h2>
            <p className="font-dm text-[14px] text-[rgba(240,242,255,0.45)] mt-3">We built this because every student deserves real guidance, not a sales pitch.</p>
          </div>
          <div className="glass-card rounded-[18px] p-8 max-w-[520px] mx-auto animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <ul className="space-y-4">
              {[
                { Icon: IconCheck, color: '#6bcb77', text: 'Full PathReport — careers, colleges, exams, interactive checklist' },
                { Icon: IconCheck, color: '#6bcb77', text: 'Unlimited follow-up chats with AI counsellor' },
                { Icon: IconCheck, color: '#6bcb77', text: 'No credit card. No ads. Works as a guest too.' },
                { Icon: IconCheck, color: '#6bcb77', text: 'Update your report anytime with new board or exam marks' },
                { Icon: IconArrow, color: '#4f8ef7', text: 'Premium features (mentor connection, direct calls) coming soon' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5"><item.Icon color={item.color} /></span>
                  <span className="font-dm text-[14px] text-[rgba(240,242,255,0.6)] leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* FINAL CTA */}
        {/* ══════════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-20 text-center max-sm:px-5 max-sm:py-12">
          <h2 className="font-sora text-[36px] sm:text-[42px] font-bold text-white tracking-[-1px] mb-4 max-sm:text-[28px]">
            Ready to find your scope?
          </h2>
          <p className="font-dm text-[15px] text-[rgba(240,242,255,0.45)] mb-8 max-w-[400px] mx-auto">
            ⏱️ 8 questions total  |  ≈ 7 minutes remaining. Real diagnostic plans.
          </p>
          <button onClick={handleStart} id="final-cta"
            className="inline-flex items-center gap-2.5 font-sora text-[16px] font-semibold bg-gradient-to-r from-[#4f8ef7] to-[#8b5cf6] text-white px-10 py-4 rounded-full border-none cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300">
            Discover My Archetype
            <IconArrow />
          </button>
          <p className="font-dm text-[12px] text-[rgba(240,242,255,0.25)] mt-4">
            Works for PCM · PCB · Commerce · Arts · and everything in between
          </p>
        </section>

        {/* Footer */}
        <footer className="border-t border-[rgba(79,142,247,0.15)] px-10 py-10 max-sm:px-5">
          <div className="max-w-[900px] mx-auto flex items-center justify-between gap-6 max-sm:flex-col max-sm:text-center">
            
            {/* Founder Message block */}
            <div className="flex flex-col gap-1.5 max-w-[280px] max-sm:max-w-none text-left max-sm:text-center">
              <p className="font-dm text-[12.5px] text-[rgba(240,242,255,0.65)] leading-relaxed italic">
                "Built because choosing a college shouldn't feel like gambling."
              </p>
              <span className="font-sora text-[11px] text-purple font-semibold">— Anurag, Founder</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2.5" fill="none"/>
                  <line x1="15" y1="15" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-sora text-[15px] font-semibold">
                <span className="text-white">Sk</span>
                <span className="text-[#4f8ef7]">o</span>
                <span className="text-white">pe</span>
              </span>
            </div>
            
            <div className="flex flex-col items-end max-sm:items-center gap-2">
              <div className="flex items-center gap-6">
                <button onClick={() => navigate('/share')} className="font-dm text-[12px] text-[rgba(240,242,255,0.35)] hover:text-white bg-transparent border-none cursor-pointer transition-colors">Share</button>
                <button onClick={() => navigate('/login')} className="font-dm text-[12px] text-[rgba(240,242,255,0.35)] hover:text-white bg-transparent border-none cursor-pointer transition-colors">Sign In</button>
              </div>
              <p className="font-dm text-[12px] text-[rgba(240,242,255,0.3)]">
                © 2025 Skope · anuraggg.tech
              </p>
            </div>

          </div>
        </footer>
      </div>
    </>
  )
}
