import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LoadingDots from '../components/LoadingDots'

// ─── Phase 1 Questions Config ─────────────────────────

const QUESTIONS = [
  {
    id: 'q1',
    number: '01',
    emoji: '📚',
    title: "What's your stream?",
    subtitle: 'And which subjects do you actually study?',
    placeholder: "e.g. PCM with Computer Science. I find Maths boring but love Physics experiments. Also took IP as optional...",
    gradient: 'from-blue to-[#22d3a0]'
  },
  {
    id: 'q2',
    number: '02',
    emoji: '🎯',
    title: "What do you do outside school?",
    subtitle: 'Hobbies, obsessions, things you watch, read, or build — be specific.',
    placeholder: "e.g. I binge-watch tech YouTube, play chess online, run a small meme page on Instagram, built a website once for fun...",
    gradient: 'from-purple to-[#ec4899]'
  },
  {
    id: 'q3',
    number: '03',
    emoji: '🧠',
    title: "What's in your head about life after 12th?",
    subtitle: 'Write exactly what you think — even if it\'s confusion.',
    placeholder: "e.g. Everyone says engineering but I'm not sure. I vaguely like design and startups but parents want stable job. Honestly confused...",
    gradient: 'from-[#fbbf24] to-[#f97316]'
  },
  {
    id: 'q4',
    number: '04',
    emoji: '📊',
    title: "What are your marks or percentile?",
    subtitle: 'Board percentage, CUET percentile, or expected marks — whatever you have.',
    placeholder: "e.g. 12th boards: 82% (CBSE). CUET percentile: haven't given yet. 10th was 91%. Expected 75-80% in boards...",
    gradient: 'from-[#22d3a0] to-blue'
  },
  {
    id: 'q5',
    number: '05',
    emoji: '📝',
    title: "Which entrance exams have you given or plan to give?",
    subtitle: 'JEE, NEET, CUET, UCEED, CLAT, or any other — include scores if you have them.',
    placeholder: "e.g. Giving JEE Main in Jan, scored 78 percentile in mock. Planning CUET. Not sure about BITSAT. Skipping NEET...",
    gradient: 'from-[#ec4899] to-purple'
  }
]

// ─── Chat Bubble ──────────────────────────────────────

function ChatBubble({ message, index }) {
  const isUser = message.role === 'user'
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeUp`}
      style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue to-purple flex items-center justify-center shrink-0 mr-2.5 mt-0.5 shadow-[0_2px_12px_rgba(79,142,247,0.25)]">
          <span className="text-[12px]">🔍</span>
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-3 font-dm text-[14px] leading-[1.7] ${
          isUser
            ? 'bg-gradient-to-r from-[rgba(79,142,247,0.15)] to-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.2)] text-white rounded-[18px_18px_4px_18px]'
            : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[rgba(240,242,255,0.85)] rounded-[18px_18px_18px_4px]'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

// ─── Main Form Page ───────────────────────────────────

export default function FormPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState(1)
  const [currentQ, setCurrentQ] = useState(0)
  const [phase1, setPhase1] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' })
  const [chatHistory, setChatHistory] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transitioning, setTransitioning] = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const inputRef = useRef(null)

  // Clear stale session data
  useEffect(() => {
    sessionStorage.removeItem('pathreport')
    sessionStorage.removeItem('skope_phase1')
    sessionStorage.removeItem('skope_phase2')
    sessionStorage.removeItem('skope_chatHistory')
  }, [])

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, loading])

  // Auto-focus input on question change
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400)
  }, [currentQ])

  const totalSteps = 5 + 8 // 5 phase1 + 8 interview
  const completedSteps = phase === 1
    ? currentQ
    : 5 + Math.floor(chatHistory.filter(m => m.role === 'user').length)
  const progress = Math.round((completedSteps / totalSteps) * 100)
  const questionsAnswered = chatHistory.filter(m => m.role === 'user').length

  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const goNext = () => {
    const q = QUESTIONS[currentQ]
    if (!phase1[q.id].trim()) {
      setError('Write something before continuing.')
      return
    }
    setError('')

    if (currentQ < 4) {
      setTransitioning(true)
      setTimeout(() => {
        setCurrentQ(currentQ + 1)
        setTransitioning(false)
      }, 300)
    } else {
      startInterview()
    }
  }

  const goBack = () => {
    if (currentQ > 0) {
      setTransitioning(true)
      setTimeout(() => {
        setCurrentQ(currentQ - 1)
        setTransitioning(false)
      }, 300)
    }
  }

  const handlePhase1KeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      goNext()
    }
  }

  const fetchNextQuestion = async (history) => {
    try {
      const res = await fetch('/api/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: phase1, chatHistory: history })
      })
      if (!res.ok) throw new Error('Failed to get question. Please try again.')
      const data = await res.json()
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.question }])
    } catch (err) {
      setError(err.message)
    }
  }

  const startInterview = async () => {
    setLoading(true)
    setError('')
    await fetchNextQuestion([])
    setPhase(2)
    setLoading(false)
  }

  const handleSendMessage = async () => {
    const msg = chatInput.trim()
    if (!msg || loading) return

    setChatInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const newHistory = [...chatHistory, { role: 'user', content: msg }]
    setChatHistory(newHistory)
    setLoading(true)
    setError('')

    if (newHistory.length >= 16) {
      sessionStorage.setItem('skope_phase1', JSON.stringify(phase1))
      sessionStorage.setItem('skope_chatHistory', JSON.stringify(newHistory))
      navigate('/preferences')
    } else {
      await fetchNextQuestion(newHistory)
      setLoading(false)
    }
  }

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const q = QUESTIONS[currentQ]

  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="page-wrapper flex flex-col h-screen">
        <Navbar />

        {/* Progress Bar */}
        <div className="h-[3px] bg-[rgba(79,142,247,0.06)] relative overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-blue to-purple transition-all duration-700 ease-out rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* PHASE 1 — One question at a time           */}
        {/* ═══════════════════════════════════════════ */}
        {phase === 1 && (
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div
              className={`max-w-[600px] w-full mx-auto px-8 max-sm:px-5 transition-all duration-300 ${
                transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {/* Question Number + Dots */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[32px]">{q.emoji}</span>
                <div className="flex items-center gap-1.5">
                  {QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i < currentQ
                          ? 'w-6 bg-gradient-to-r from-blue to-purple'
                          : i === currentQ
                            ? 'w-10 bg-gradient-to-r from-blue to-purple'
                            : 'w-1.5 bg-[rgba(255,255,255,0.1)]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question Title */}
              <h1 className="font-sora text-[32px] sm:text-[40px] font-bold text-white tracking-[-1px] leading-[1.15] mb-2">
                {q.title}
              </h1>
              <p className="font-dm text-[15px] text-[rgba(240,242,255,0.4)] mb-8 leading-relaxed">
                {q.subtitle}
              </p>

              {/* Input */}
              <div className="relative mb-6">
                <textarea
                  ref={inputRef}
                  className="w-full bg-transparent border-none border-b-2 border-b-[rgba(79,142,247,0.2)] text-white font-dm text-[16px] sm:text-[18px] outline-none placeholder:text-[rgba(240,242,255,0.15)] resize-none leading-[1.75] pb-4 focus:border-b-blue transition-colors"
                  rows={3}
                  style={{ minHeight: '80px', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, background: 'transparent', boxShadow: 'none' }}
                  placeholder={q.placeholder}
                  value={phase1[q.id]}
                  onChange={e => {
                    setPhase1({ ...phase1, [q.id]: e.target.value })
                    setError('')
                  }}
                  onKeyDown={handlePhase1KeyDown}
                />
              </div>

              {/* Error */}
              {error && (
                <p className="font-dm text-[13px] text-[#ff8a8a] mb-4">{error}</p>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                {currentQ > 0 ? (
                  <button
                    onClick={goBack}
                    className="font-dm text-[13px] text-[rgba(240,242,255,0.35)] hover:text-white cursor-pointer bg-transparent border-none transition-colors flex items-center gap-1.5"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={goNext}
                  disabled={loading}
                  className={`font-sora text-[14px] font-semibold text-white px-6 py-3 rounded-[12px] border-none cursor-pointer transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${q.gradient} hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(79,142,247,0.2)]`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">Starting <LoadingDots /></span>
                  ) : currentQ === 4 ? (
                    <>
                      Start Interview
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Next
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Keyboard hint */}
              <p className="font-dm text-[11px] text-[rgba(240,242,255,0.2)] text-center mt-8">
                press <span className="font-mono bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 rounded text-[rgba(240,242,255,0.3)]">Enter ↵</span> to continue
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* PHASE 2 — Chat Interview                   */}
        {/* ═══════════════════════════════════════════ */}
        {phase === 2 && (
          <div className="flex-1 flex flex-col overflow-hidden animate-fadeUp">
            {/* Chat Header */}
            <div className="shrink-0 px-6 py-3.5 border-b border-[rgba(79,142,247,0.06)] bg-[rgba(8,11,20,0.6)] backdrop-blur-md">
              <div className="max-w-[700px] mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue to-purple flex items-center justify-center shadow-[0_2px_12px_rgba(79,142,247,0.25)]">
                      <span className="text-[14px]">🔍</span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#6bcb77] border-2 border-[#080b14]" />
                  </div>
                  <div>
                    <div className="font-sora text-[14px] font-semibold text-white">Skope</div>
                    <div className="font-dm text-[11px] text-[#6bcb77]">
                      {loading ? 'Thinking...' : 'Online'}
                    </div>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-full px-3 py-1.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-[6px] h-[6px] rounded-full transition-all duration-500 ${
                        i < questionsAnswered
                          ? 'bg-[#6bcb77]'
                          : i === questionsAnswered && !loading
                            ? 'bg-[rgba(79,142,247,0.5)] animate-pulse'
                            : 'bg-[rgba(255,255,255,0.08)]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="max-w-[700px] mx-auto flex flex-col gap-4">
                {chatHistory.map((msg, i) => (
                  <ChatBubble key={i} message={msg} index={i} />
                ))}

                {loading && (
                  <div className="flex items-start gap-2.5 animate-fadeUp">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue to-purple flex items-center justify-center shrink-0 shadow-[0_2px_12px_rgba(79,142,247,0.25)]">
                      <span className="text-[12px]">🔍</span>
                    </div>
                    <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-[18px_18px_18px_4px] px-4 py-3 flex items-center gap-2">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-[rgba(255,107,107,0.06)] border border-[rgba(255,107,107,0.15)] rounded-[12px] px-4 py-3 text-center">
                    <p className="font-dm text-[13px] text-[#ff8a8a]">{error}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-[rgba(79,142,247,0.06)] bg-[rgba(8,11,20,0.85)] backdrop-blur-xl px-6 py-4">
              <div className="max-w-[700px] mx-auto flex items-end gap-3">
                <div className="flex-1 rounded-[14px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] focus-within:border-[rgba(79,142,247,0.25)] focus-within:shadow-[0_0_25px_rgba(79,142,247,0.06)] transition-all duration-200">
                  <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent border-none px-4 py-3 text-white font-dm text-[14px] outline-none placeholder:text-[rgba(240,242,255,0.18)] resize-none leading-[1.65]"
                    rows={1}
                    style={{ maxHeight: '100px' }}
                    placeholder={chatHistory.length >= 16 ? "Interview complete! Moving to preferences..." : "Be honest — there are no wrong answers..."}
                    value={chatInput}
                    disabled={loading || chatHistory.length >= 16}
                    onChange={(e) => { setChatInput(e.target.value); handleTextareaResize(e) }}
                    onKeyDown={handleChatKeyDown}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !chatInput.trim() || chatHistory.length >= 16}
                  className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-blue to-purple flex items-center justify-center cursor-pointer border-none hover:shadow-[0_4px_20px_rgba(139,92,246,0.3)] transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
