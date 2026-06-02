import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const SHARE_URL = 'https://skope-app.onrender.com'
const SHARE_TEXT = "Just discovered Skope — an AI counsellor that gives brutally honest career advice for Indian Class 12 students. No sugar coating. Hidden gem colleges, unknown courses, and real talk about your actual marks. Try it free."

export default function SharePage() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(SHARE_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Skope — Brutally Honest Career Advice',
          text: SHARE_TEXT,
          url: SHARE_URL
        })
      } catch {}
    }
  }

  const shareOptions = [
    {
      label: 'WhatsApp',
      color: '#25D366',
      bg: 'rgba(37,211,102,0.08)',
      border: 'rgba(37,211,102,0.2)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + '\n\n' + SHARE_URL)}`
    },
    {
      label: 'Twitter / X',
      color: '#1DA1F2',
      bg: 'rgba(29,161,242,0.08)',
      border: 'rgba(29,161,242,0.2)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`
    },
    {
      label: 'LinkedIn',
      color: '#0A66C2',
      bg: 'rgba(10,102,194,0.08)',
      border: 'rgba(10,102,194,0.2)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`
    }
  ]

  const stats = [
    { value: '8', label: 'Colleges per report', sub: 'including hidden gems' },
    { value: '3', label: 'Hidden career fields', sub: 'nobody talks about' },
    { value: '0', label: 'Sugar coating', sub: 'only brutal honesty' },
    { value: '15', label: 'Minutes', sub: 'to your PathReport' }
  ]

  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="page-wrapper">
        <Navbar />
        <div className="max-w-[680px] mx-auto px-6 py-14 max-sm:px-4">

          {/* Hero */}
          <div className="text-center mb-12 animate-fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.06)] mb-6">
              <span className="text-[14px]">✨</span>
              <span className="font-dm text-[12px] text-[rgba(240,242,255,0.6)]">Share with someone who needs this</span>
            </div>
            <h1 className="font-sora text-[38px] sm:text-[48px] font-bold text-white tracking-[-1.5px] leading-[1.1] mb-4">
              Help a friend find their<br />
              <span className="text-gradient">real path.</span>
            </h1>
            <p className="font-dm text-[15px] text-[rgba(240,242,255,0.45)] max-w-[440px] mx-auto leading-[1.75]">
              Most career advice is generic. Skope gives your friends the brutally honest, personalized truth about where they stand and what's actually possible for them.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            {stats.map((s, i) => (
              <div key={i} className="glass-card rounded-[14px] p-4 text-center">
                <div className="font-sora text-[28px] font-bold text-gradient mb-0.5">{s.value}</div>
                <div className="font-sora text-[11px] font-semibold text-white mb-0.5">{s.label}</div>
                <div className="font-dm text-[10px] text-[rgba(240,242,255,0.35)]">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Share Card */}
          <div
            className="rounded-[20px] p-[1px] mb-6 animate-fadeUp"
            style={{ animationDelay: '0.15s', background: 'linear-gradient(135deg, rgba(79,142,247,0.3), rgba(139,92,246,0.3))' }}
          >
            <div className="bg-[#0c1019] rounded-[19px] p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(79,142,247,0.25)]"
                  style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2.5" fill="none" />
                    <line x1="15" y1="15" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-sora text-[18px] font-bold text-white mb-1">Skope — Brutally Honest Career Advice</h2>
                  <p className="font-dm text-[13px] text-[rgba(240,242,255,0.5)] leading-relaxed">
                    AI-powered PathReports for Indian Class 12 students. Hidden gem colleges. Unknown career fields. Zero motivation. Just the mirror.
                  </p>
                </div>
              </div>

              {/* URL Bar */}
              <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 mb-5">
                <span className="font-dm text-[13px] text-[rgba(240,242,255,0.5)] flex-1 truncate">{SHARE_URL}</span>
                <button
                  onClick={handleCopy}
                  className="font-dm text-[11px] font-semibold px-3 py-1.5 rounded-[8px] border-none cursor-pointer transition-all duration-200 shrink-0"
                  style={{
                    background: copied ? 'rgba(107,203,119,0.15)' : 'rgba(79,142,247,0.15)',
                    color: copied ? '#6bcb77' : '#4f8ef7',
                    border: `1px solid ${copied ? 'rgba(107,203,119,0.3)' : 'rgba(79,142,247,0.3)'}`
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {shareOptions.map((opt, i) => (
                  <a
                    key={i}
                    href={opt.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 rounded-[12px] py-4 px-3 transition-all duration-200 hover:scale-105 no-underline"
                    style={{ background: opt.bg, border: `1px solid ${opt.border}` }}
                  >
                    {opt.icon}
                    <span className="font-dm text-[11px] font-semibold text-white">{opt.label}</span>
                  </a>
                ))}
              </div>

              {/* Native Share (mobile) */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="w-full font-sora text-[14px] font-semibold text-white py-3.5 rounded-[12px] border-none cursor-pointer transition-all duration-300 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}
                >
                  📤 Share via your apps
                </button>
              )}
            </div>
          </div>

          {/* What Skope does */}
          <div className="glass-card rounded-[16px] p-6 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-sora text-[14px] font-bold text-white mb-4">What your friend will get</h3>
            <ul className="space-y-3">
              {[
                { icon: '🎯', text: '3 career paths matched to their actual profile — not just what everyone does' },
                { icon: '🏫', text: '8 colleges including 3 hidden gems they\'ve never heard of, with Reddit verdicts from real students' },
                { icon: '🕵️', text: '3 hidden career fields with real market data — actuarial science, marine engineering, geomatics...' },
                { icon: '📋', text: 'Unknown entrance exams beyond JEE/NEET — UCEED, IISER IAT, LSAT India, TISS NET...' },
                { icon: '🔍', text: 'A 5-step action plan specific to their marks, city, budget, and ambitions' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[18px] shrink-0">{item.icon}</span>
                  <span className="font-dm text-[13px] text-[rgba(240,242,255,0.6)] leading-[1.6]">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center mt-8 animate-fadeUp" style={{ animationDelay: '0.25s' }}>
            <button
              onClick={() => navigate('/form')}
              className="font-sora text-[14px] font-semibold text-white px-8 py-3.5 rounded-[12px] border-none cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(79,142,247,0.25)]"
              style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}
            >
              Generate your own PathReport →
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
