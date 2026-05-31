import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const testimonials = [
  {
    quote: "I was about to take a drop for IIT. Skope showed me DAIICT and I didn't even know it existed. Got in. Best decision ever.",
    name: "Aanya S.",
    path: "B.Tech IT → DAIICT Gandhinagar",
    color: '#4f8ef7',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
  },
  {
    quote: "My parents wanted me to do CA. Skope didn't say 'follow your passion'. It said 'here's how design pays — show your parents this data.'",
    name: "Rahul M.",
    path: "B.Des → Symbiosis Institute of Design",
    color: '#fbbf24',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M12 2v1M4.22 4.22l.7.7M1 12h1M4.22 19.78l.7-.7M20.78 19.78l-.7-.7M23 12h-1M19.78 4.22l-.7.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/></svg>
  },
  {
    quote: "It told me I won't crack NEET with my current marks. No counsellor ever said that. Then it gave me a real backup plan.",
    name: "Priya K.",
    path: "BSc Biotech → Manipal",
    color: '#22d3a0',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 2h6v6h4l-7 8-7-8h4V2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 22h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  },
  {
    quote: "The AI asked me questions about my actual life, not just my stream. That's when the recommendations started making sense.",
    name: "Arjun D.",
    path: "B.Tech CSE → Thapar Institute",
    color: '#8b5cf6',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 10h8M8 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  }
]

const faqItems = [
  {
    q: "Is this an actual AI or a form with pre-written answers?",
    a: "Real AI. It has a live conversation with you. It changes its questions based on your specific answers — no two students get the same interview."
  },
  {
    q: "Will it push me toward a college I can't afford?",
    a: "No. You tell us your budget upfront. Every college recommendation is filtered by what your family can actually pay."
  },
  {
    q: "What if I don't have my final marks yet?",
    a: "Tell us your estimated or current marks. You can come back and update your PathReport after results come out."
  },
  {
    q: "Does it only work for engineering students?",
    a: "No. Skope covers PCM, PCB, Commerce, Arts, Design, Law, Hotel Management, Agriculture, Media, and more. It knows 800+ colleges across all streams."
  },
  {
    q: "How is this different from Google searching colleges?",
    a: "Google gives you a list. Skope gives you a ranked shortlist filtered by YOUR marks, YOUR budget, YOUR city, and YOUR career interest — with honest reality checks attached."
  }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="page-wrapper">
        <Navbar />

        {/* ═══════════════════════════════════════════ */}
        {/* HERO SECTION */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[820px] mx-auto px-10 pt-20 pb-16 text-center animate-fadeUp max-sm:px-5 max-sm:pt-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(79,142,247,0.15)] bg-[rgba(79,142,247,0.06)] mb-8">
            <span className="w-2 h-2 rounded-full bg-blue" />
            <span className="font-dm text-[13px] text-[rgba(240,242,255,0.6)]">AI-powered · Built for India · Free</span>
          </div>

          {/* H1 */}
          <h1 className="font-sora font-bold text-[56px] leading-[1.1] tracking-[-2px] mb-6 max-sm:text-[38px] max-sm:tracking-[-1px]">
            <span className="block text-[rgba(240,242,255,0.5)]">Iske aage</span>
            <span className="block text-gradient pb-1">scope hai kya?</span>
            <span className="block text-white mt-1">Find out.</span>
          </h1>

          {/* Subparagraph */}
          <p className="font-dm text-[15px] text-[rgba(240,242,255,0.5)] max-w-[480px] mx-auto leading-relaxed mb-8">
            Tell Skope what you're like. It tells you what fits — careers, colleges, entrance exams, and a real plan. No vague advice. No upselling. Just clarity.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/form')}
            id="hero-cta"
            className="font-sora text-[15px] font-semibold bg-gradient-to-r from-blue to-purple text-white px-8 py-3.5 rounded-full border-none cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 mb-3"
          >
            Find My Scope →
          </button>

          {/* Note */}
          <p className="font-dm text-[12px] text-[rgba(240,242,255,0.35)] mt-2">
            Takes 6 minutes. No signup required.
          </p>

          {/* Improved Social Proof Row (#7) */}
          <div className="flex items-center justify-center gap-10 mt-12 pt-8 border-t border-[rgba(79,142,247,0.15)] max-sm:flex-col max-sm:gap-5">
            <div className="text-center">
              <div className="font-sora text-[22px] font-semibold text-white">800+</div>
              <div className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] mt-0.5 leading-snug">
                Colleges tracked<br /><span className="text-[rgba(240,242,255,0.3)]">(IITs, NITs, hidden gems)</span>
              </div>
            </div>
            <div className="text-center">
              <div className="font-sora text-[22px] font-semibold text-white">150+</div>
              <div className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] mt-0.5 leading-snug">
                Entrance exams<br /><span className="text-[rgba(240,242,255,0.3)]">(including niche ones)</span>
              </div>
            </div>
            <div className="text-center">
              <div className="font-sora text-[22px] font-semibold text-white">0</div>
              <div className="font-dm text-[12px] text-[rgba(240,242,255,0.4)] mt-0.5 leading-snug">
                Generic advice<br /><span className="text-[rgba(240,242,255,0.3)]">(everything is personalized)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* HOW IT WORKS */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-20 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-12 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-blue block mb-3">How it works</span>
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">Not a form. A conversation.</h2>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
            {[
              {
                step: '01',
                title: 'Tell us about you',
                desc: 'Stream, subjects you love, what you do outside school. Write freely — no dropdowns.'
              },
              {
                step: '02',
                title: 'Skope interviews you',
                desc: 'The AI asks 8 follow-up questions that adapt to your answers. Like a real counsellor actually listening.'
              },
              {
                step: '03',
                title: 'Set your constraints',
                desc: 'Budget, cities, how much AI-era relevance matters. We only recommend what fits.'
              },
              {
                step: '04',
                title: 'Get your PathReport',
                desc: 'Careers, colleges, entrance exams, reality checks, and a 30-day action plan. Plus a counsellor chat for follow-ups.'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="glass-card rounded-[14px] p-[24px] fade-in"
                style={{ animationDelay: `${(i + 1) * 0.1}s` }}
              >
                <div className="font-sora text-[11px] font-medium text-blue mb-3 tracking-[1px]">{item.step}</div>
                <div className="font-sora text-[14px] font-semibold text-white mb-2">{item.title}</div>
                <div className="font-dm text-[13px] text-[rgba(240,242,255,0.45)] leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* #2 — WHY SKOPE IS DIFFERENT */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-20 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-10 animate-fadeUp">
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-blue block mb-3">The difference</span>
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">Not your typical career counsellor.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            {/* Traditional */}
            <div className="glass-card rounded-[14px] p-6 border-t-2 border-t-[#ff6b6b]">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[20px]">🚫</span>
                <span className="font-sora text-[15px] font-semibold text-[#ff6b6b]">Traditional Counsellors</span>
              </div>
              <ul className="space-y-3">
                {[
                  'Push only IITs, NITs, and famous names',
                  'Same generic advice for every student',
                  '"Follow your passion" (then charges ₹5000)',
                  'No real data on fees, exams, or placements',
                  'Never tells you the hard truth'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#ff6b6b] shrink-0 mt-0.5 text-[13px]">✗</span>
                    <span className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skope */}
            <div className="glass-card rounded-[14px] p-6 border-t-2 border-t-[#6bcb77]">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[20px]">✨</span>
                <span className="font-sora text-[15px] font-semibold text-[#6bcb77]">Skope</span>
              </div>
              <ul className="space-y-3">
                {[
                  'Hidden gems that genuinely fit YOUR profile',
                  'Questions adapt to your specific answers',
                  'Blunt about reality — names real blockers',
                  '800+ colleges with fees, exams, and caution flags',
                  'Tells you when your plan has a problem'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#6bcb77] shrink-0 mt-0.5 text-[13px]">✓</span>
                    <span className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* #9 — SAMPLE CONVERSATION */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-20 max-sm:px-5 max-sm:py-12">
          <div className="glass-card rounded-[18px] p-8 sm:p-10 bg-[rgba(79,142,247,0.03)] border border-[rgba(79,142,247,0.12)] animate-fadeUp">
            <div className="text-center mb-8">
              <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-blue block mb-3">See it in action</span>
              <h2 className="font-sora text-[28px] sm:text-[32px] font-semibold text-white max-sm:text-[22px]">This is how Skope talks to you.</h2>
            </div>

            <div className="max-w-[600px] mx-auto space-y-4">
              {/* AI Q1 */}
              <div className="flex justify-start">
                <div className="bg-navy3 border border-[rgba(79,142,247,0.15)] rounded-[14px_14px_14px_4px] px-5 py-3.5 max-w-[85%]">
                  <div className="font-dm text-[11px] text-blue font-medium mb-1.5">Skope</div>
                  <p className="font-dm text-[13px] text-[rgba(240,242,255,0.75)] leading-relaxed">
                    You mentioned parents want engineering but you're thinking product design. That's actually not a bad split — they're not mutually exclusive. But when you say "product", what do you actually mean? Designing how buttons look, or figuring out what problem the product solves?
                  </p>
                </div>
              </div>

              {/* User A1 */}
              <div className="flex justify-end">
                <div className="bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.2)] rounded-[14px_14px_4px_14px] px-5 py-3.5 max-w-[85%]">
                  <div className="font-dm text-[11px] text-purple font-medium mb-1.5">You</div>
                  <p className="font-dm text-[13px] text-[rgba(240,242,255,0.75)] leading-relaxed">
                    Honestly, I like both. I watch videos about how Figma works, I see how apps are designed, but I also built a website and enjoyed the coding part. I'm not sure which one I should lean into.
                  </p>
                </div>
              </div>

              {/* AI Q2 */}
              <div className="flex justify-start">
                <div className="bg-navy3 border border-[rgba(79,142,247,0.15)] rounded-[14px_14px_14px_4px] px-5 py-3.5 max-w-[85%]">
                  <div className="font-dm text-[11px] text-blue font-medium mb-1.5">Skope</div>
                  <p className="font-dm text-[13px] text-[rgba(240,242,255,0.75)] leading-relaxed">
                    So you want both — that's actually the smart move. But here's the thing: a standard B.Tech CS degree puts you on the default path. A design degree skips the engineering credibility. Given your marks and budget, which skill do you want as primary and which will you pick up on your own?
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/form')}
                id="sample-conv-cta"
                className="font-sora text-[14px] font-semibold bg-gradient-to-r from-blue to-purple text-white px-7 py-3 rounded-full border-none cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300"
              >
                Start your conversation →
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* #4 — SAMPLE PATHREPORT PREVIEW */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-20 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-10 animate-fadeUp">
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-blue block mb-3">Your PathReport</span>
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">Here's what you'll get.</h2>
          </div>

          <div className="glass-card rounded-[18px] p-8 sm:p-10 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Left — Checklist */}
              <div>
                <h3 className="font-sora text-[18px] font-semibold text-white mb-5">Your PathReport includes</h3>
                <ul className="space-y-3.5">
                  {[
                    { icon: '🎯', text: 'Career paths ranked for YOUR interests' },
                    { icon: '🏫', text: '6-8 colleges matched to your marks & budget' },
                    { icon: '📝', text: 'Entrance exams with prep guidance' },
                    { icon: '⚡', text: 'Reality checks — the hard truths' },
                    { icon: '📅', text: 'Action plan with timelines' },
                    { icon: '💎', text: 'Hidden gem colleges most counsellors miss' },
                    { icon: '💬', text: 'AI counsellor for unlimited follow-ups' }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[16px] shrink-0">{item.icon}</span>
                      <span className="font-dm text-[14px] text-[rgba(240,242,255,0.6)] leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — Sample career card */}
              <div className="space-y-3">
                <div className="bg-[rgba(79,142,247,0.08)] border border-[rgba(79,142,247,0.15)] rounded-[14px] p-5">
                  <div className="font-dm text-[10px] font-medium text-blue uppercase tracking-[1.5px] mb-2">Sample Career Match</div>
                  <div className="font-sora text-[16px] font-semibold text-white mb-2">Product Engineer</div>
                  <p className="font-dm text-[13px] text-[rgba(240,242,255,0.5)] leading-relaxed mb-3">
                    Coders who understand product are rarer and more valuable than pure engineers. You'd write code that solves real user problems.
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-dm text-[11px] text-[rgba(240,242,255,0.35)] uppercase tracking-[0.5px]">Salary</span>
                    <span className="font-dm text-[13px] text-white font-medium">₹12-30L/year</span>
                  </div>
                  <div className="bg-[rgba(255,217,61,0.06)] border border-[rgba(255,217,61,0.15)] rounded-lg px-3.5 py-2.5">
                    <span className="font-dm text-[12px] text-[#ffd93d] leading-relaxed">
                      ⚡ Your math weakness will limit you in competitive coding interviews. Build project portfolio to compensate.
                    </span>
                  </div>
                </div>

                <div className="bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.15)] rounded-[14px] p-5">
                  <div className="font-dm text-[10px] font-medium text-purple uppercase tracking-[1.5px] mb-2">Sample College</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sora text-[14px] font-semibold text-white">DAIICT Gandhinagar</span>
                    <span className="font-dm text-[10px] font-medium text-[#fbbf24] bg-[rgba(251,191,36,0.12)] px-2 py-0.5 rounded-full border border-[rgba(251,191,36,0.25)]">
                      💎 Hidden Gem
                    </span>
                  </div>
                  <p className="font-dm text-[12px] text-[rgba(240,242,255,0.45)] leading-relaxed mt-1.5">
                    Founded specifically for CS/IT with a design-thinking curriculum. Stronger for product engineering than most mid-tier NITs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* #6 — THE TRUTH SECTION */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-20 max-sm:px-5 max-sm:py-12">
          <div className="glass-card rounded-[18px] p-8 sm:p-10 bg-[rgba(139,92,246,0.04)] border-t-2 border-t-purple animate-fadeUp">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[20px]">🧠</span>
              <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-purple">What nobody tells you</span>
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

        {/* ═══════════════════════════════════════════ */}
        {/* #8 — WORKS FOR ALL STREAMS */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-20 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-10 animate-fadeUp">
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-blue block mb-3">Every path</span>
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">Works for all streams.</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            {[
              { stream: 'PCM', sub: 'Engineering, Tech, Design', color: '#4f8ef7', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { stream: 'PCB', sub: 'Medicine, Biotech, Health', color: '#22d3a0', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/></svg> },
              { stream: 'Commerce', sub: 'Finance, Economics, CA', color: '#fbbf24', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="14" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="10" y="9" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="17" y="4" width="4" height="17" rx="1" stroke="currentColor" strokeWidth="2"/><path d="M3 3l7 4 7-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { stream: 'Arts', sub: 'Law, Media, Design, Social Work', color: '#f472b6', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="13.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="2"/><circle cx="17" cy="14" r="2" stroke="currentColor" strokeWidth="2"/><circle cx="7" cy="14" r="2" stroke="currentColor" strokeWidth="2"/><circle cx="10" cy="19" r="2" stroke="currentColor" strokeWidth="2"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" stroke="currentColor" strokeWidth="2"/></svg> },
              { stream: 'Liberal Arts', sub: 'Ashoka, FLAME, Krea', color: '#8b5cf6', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2"/><path d="M8 7h8M8 11h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
              { stream: 'Hotel Mgmt', sub: 'IHM, Hospitality', color: '#f97316', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M5 21V7l7-4 7 4v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="13" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="2"/><path d="M9 9h2M13 9h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
              { stream: 'Agriculture', sub: 'IARI, BHU, Agritech', color: '#22d3a0', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 22V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M5 12s1-6 7-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 12s-1-6-7-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M5 8s1-4 7-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 8s-1-4-7-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
              { stream: 'Sports', sub: 'LNUPE, Coaching, Fitness', color: '#ef4444', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10A15 15 0 0112 2z" stroke="currentColor" strokeWidth="2"/><path d="M2 12h20" stroke="currentColor" strokeWidth="2"/></svg> }
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-[14px] p-5 text-center hover:-translate-y-1 transition-transform duration-200 cursor-default group">
                <div
                  className="w-11 h-11 rounded-[12px] mx-auto mb-3 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}25` }}
                >
                  {item.icon}
                </div>
                <div className="font-sora text-[13px] font-semibold text-white mb-1">{item.stream}</div>
                <div className="font-dm text-[11px] text-[rgba(240,242,255,0.4)] leading-snug">{item.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* #1 — TESTIMONIALS */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-20 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-10 animate-fadeUp">
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-blue block mb-3">Real students</span>
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">What they found.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card rounded-[14px] p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200 group">
                <div>
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}25` }}
                  >
                    {t.icon}
                  </div>
                  <p className="font-dm text-[14px] text-[rgba(240,242,255,0.65)] leading-[1.7] italic mb-4">
                    "{t.quote}"
                  </p>
                </div>
                <div className="border-t border-[rgba(79,142,247,0.1)] pt-3">
                  <div className="font-sora text-[13px] font-semibold text-white">{t.name}</div>
                  <div className="font-dm text-[11px] text-blue mt-0.5">{t.path}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* #5 — TRUST SIGNALS */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-12 max-sm:px-5 animate-fadeUp">
          <p className="text-center font-dm text-[12px] text-[rgba(240,242,255,0.35)] mb-6">
            Built for students from
          </p>
          <div className="flex justify-center items-center gap-6 sm:gap-10 flex-wrap">
            {['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Kolkata', 'Tier 2 & 3 cities'].map((city, i) => (
              <span key={i} className="font-dm text-[13px] text-[rgba(240,242,255,0.35)] whitespace-nowrap">
                {city}
              </span>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* #3 — FAQ */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[700px] mx-auto px-10 py-20 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-10 animate-fadeUp">
            <span className="font-dm text-[11px] font-medium uppercase tracking-[2px] text-blue block mb-3">FAQ</span>
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">Questions?</h2>
          </div>

          <div className="space-y-3 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="glass-card rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200 hover:border-[rgba(79,142,247,0.25)]"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between p-5">
                  <span className="font-sora text-[14px] font-semibold text-white pr-4 leading-snug">{item.q}</span>
                  <span className={`text-blue text-[18px] shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </div>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openFaq === i ? '200px' : '0px', opacity: openFaq === i ? 1 : 0 }}
                >
                  <p className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-relaxed px-5 pb-5">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* #10 — PRICING CLARITY */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-20 max-sm:px-5 max-sm:py-12">
          <div className="text-center mb-10 animate-fadeUp">
            <h2 className="font-sora text-[32px] font-semibold text-white max-sm:text-[24px]">Completely free. No hidden costs.</h2>
            <p className="font-dm text-[14px] text-[rgba(240,242,255,0.45)] mt-3">We built this because every student deserves real guidance, not a sales pitch.</p>
          </div>

          <div className="glass-card rounded-[18px] p-8 max-w-[520px] mx-auto animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <ul className="space-y-4">
              {[
                { icon: '✓', color: 'text-[#6bcb77]', text: 'Full PathReport — careers, colleges, exams, action plan' },
                { icon: '✓', color: 'text-[#6bcb77]', text: 'Unlimited follow-up chats with AI counsellor' },
                { icon: '✓', color: 'text-[#6bcb77]', text: 'No signup. No email required. No ads.' },
                { icon: '✓', color: 'text-[#6bcb77]', text: 'Update your report anytime with new information' },
                { icon: '→', color: 'text-blue', text: 'Premium features (mentor intro, college calls) coming soon' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`${item.color} shrink-0 font-semibold text-[14px] mt-0.5`}>{item.icon}</span>
                  <span className="font-dm text-[14px] text-[rgba(240,242,255,0.6)] leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* FINAL CTA */}
        {/* ═══════════════════════════════════════════ */}
        <section className="max-w-[900px] mx-auto px-10 py-20 text-center max-sm:px-5 max-sm:py-12">
          <h2 className="font-sora text-[36px] sm:text-[42px] font-bold text-white tracking-[-1px] mb-4 max-sm:text-[28px]">
            Ready to find your scope?
          </h2>
          <p className="font-dm text-[15px] text-[rgba(240,242,255,0.45)] mb-8 max-w-[400px] mx-auto">
            6 minutes. No signup. A real plan.
          </p>
          <button
            onClick={() => navigate('/form')}
            id="final-cta"
            className="font-sora text-[16px] font-semibold bg-gradient-to-r from-blue to-purple text-white px-10 py-4 rounded-full border-none cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] transition-all duration-300"
          >
            Find My Scope →
          </button>
        </section>

        {/* Footer */}
        <footer className="border-t border-[rgba(79,142,247,0.15)] px-10 py-6 max-sm:px-5">
          <div className="max-w-[900px] mx-auto flex items-center justify-between max-sm:flex-col max-sm:gap-3 max-sm:text-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="7" stroke="#4f8ef7" strokeWidth="2" fill="none" />
                <line x1="15" y1="15" x2="21" y2="21" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-sora text-[15px] font-semibold">
                <span className="text-white">Sk</span>
                <span className="text-blue">o</span>
                <span className="text-white">pe</span>
              </span>
            </div>
            <p className="font-dm text-[12px] text-[rgba(240,242,255,0.35)]">
              © 2025 Skope. Built for students who don't know what's next.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
