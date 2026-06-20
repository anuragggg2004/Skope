import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import LoadingDots from '../components/LoadingDots'


// ─── Phase 1 Questions Config ─────────────────────────

// ─── Step Icons (SVG, no emojis) ──────────────────────
const STEP_ICONS = [
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8M8 11h5"/>
  </svg>,
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l-.94-.94-2.12-2.12-.94-.94z"/>
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
  </svg>,
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>,
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/>
  </svg>,
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
]

const QUESTIONS = [
  {
    id: 'q1', number: '01',
    title: "Stream and actual marks — right now.",
    subtitle: "Not your target. Not your dream. What is on your marksheet today? What subject are you weakest in? Be honest.",
    placeholder: "e.g. PCM with CS. Maths is my weakest — usually 65-70%. Physics I actually understand. CS I enjoy but never coded outside of school practicals...",
    gradient: 'from-blue to-[#22d3a0]', color: '#4f8ef7'
  },
  {
    id: 'q2', number: '02',
    title: "What have you actually built, made, or done outside school?",
    subtitle: "Not what you 'like'. What have you actually created, competed in, or worked on? If the answer is nothing, say that.",
    placeholder: "e.g. I run a 2000-follower Instagram page on football tactics. I tried coding a website once but gave up. I won a district debate competition. I haven't built anything honestly...",
    gradient: 'from-purple to-[#ec4899]', color: '#8b5cf6'
  },
  {
    id: 'q3', number: '03',
    title: "What career are you thinking? Whose idea is it?",
    subtitle: "Be straight. Is this what you want or what your parents told you to want? Both answers are fine. Just be accurate.",
    placeholder: "e.g. My dad wants engineering but I genuinely don't know if I want it. I vaguely like design but never told anyone. My friends are all doing JEE so I'm also doing it by default...",
    gradient: 'from-[#fbbf24] to-[#f97316]', color: '#fbbf24'
  },
  {
    id: 'q4', number: '04',
    title: "What are your ACTUAL marks or exam scores?",
    subtitle: "Not expected. Not aspirational. The real numbers you have right now. This determines what is realistic vs what is fantasy.",
    placeholder: "e.g. 12th predicted 78% CBSE. JEE mock percentile: 67. 10th was 85%. CUET not given yet. These are my real numbers, not what I'm hoping for...",
    gradient: 'from-[#22d3a0] to-blue', color: '#22d3a0'
  },
  {
    id: 'q5', number: '05',
    title: "Which exams are you preparing for? Be specific.",
    subtitle: "JEE, NEET, CUET, CLAT, UCEED — list what you are actually studying for right now. Also say which ones you have already given up on.",
    placeholder: "e.g. Seriously preparing JEE Main only. Not NEET at all. Planning to give CUET as backup. Have not even heard of most design exams. Skipped BITSAT prep...",
    gradient: 'from-[#ec4899] to-purple', color: '#ec4899'
  }
]

import { motion, AnimatePresence } from 'framer-motion'

// ─── Typewriter Effect ─────────────────────────────────
function TypewriterText({ text, speed = 8, onType, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let index = 0
    setDisplayedText('')
    
    const interval = setInterval(() => {
      if (index < text.length) {
        const charsToTake = Math.min(3, text.length - index)
        setDisplayedText(text.substring(0, index + charsToTake))
        index += charsToTake
        if (onType) {
          requestAnimationFrame(onType)
        }
      } else {
        clearInterval(interval)
        if (onComplete) onComplete()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return <span>{displayedText}</span>
}

// ─── Chat Bubble ──────────────────────────────────────
function ChatBubble({ message, index, isLatest, onType }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [typingComplete, setTypingComplete] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shouldType = !isUser && isLatest && !typingComplete

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start w-full group relative mb-1.5`}
    >
      {!isUser && (
        <div
          className="w-7 h-7 bg-cover ring-white/10 ring-1 rounded-full animate-floatSlow shrink-0 mr-2.5 mt-0.5"
          style={{
            backgroundImage: `url('https://hoirqrkdgbmvpwutwuwj-all.supabase.co/storage/v1/object/public/assets/assets/fc36a88f-5106-416e-82ac-ea0cd24cf358_320w.webp')`,
            animationDuration: '7s'
          }}
        />
      )}
      <div className="relative max-w-[78%]">
        <div
          className={`px-3.5 py-2 font-dm text-[13.5px] leading-[1.65] shadow-sm ${
            isUser
              ? 'ring-1 ring-blue-400 text-white rounded-[14px_14px_4px_14px] animate-glowPulse'
              : 'bg-neutral-900 ring-1 ring-white/10 text-neutral-200 rounded-[14px_14px_14px_4px] pr-10'
          }`}
          style={isUser ? { background: 'linear-gradient(45deg, #06b6d4, #3b82f6, #2563eb)' } : {}}
        >
          {shouldType ? (
            <TypewriterText
              text={message.content}
              onType={onType}
              onComplete={() => setTypingComplete(true)}
            />
          ) : (
            message.content
          )}
        </div>

        {!isUser && (!shouldType || typingComplete) && (
          <button
            onClick={handleCopy}
            className="absolute right-2.5 top-[50%] -translate-y-[50%] opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/80 hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] rounded-md p-1 text-[rgba(240,242,255,0.4)] hover:text-white cursor-pointer"
            title="Copy message"
          >
            {copied ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22d3a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Form Page ───────────────────────────────────

export default function FormPage() {
  const navigate = useNavigate()
  const { user, pathReport } = useAuth()

  // Load state from sessionStorage if it exists to survive page refreshes
  const getInitialChat = () => {
    try {
      const saved = sessionStorage.getItem('skope_chatHistory')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  const [chatHistory, setChatHistory] = useState(getInitialChat)

  const completedSteps = chatHistory.filter(m => m.role === 'user').length
  const initialIndex = completedSteps
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialIndex)

  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Clear report caches on mount so they can run fresh reports, but leave the chat session intact
  useEffect(() => {
    // If they have a report and didn't explicitly trigger a retake, redirect to result
    const isRetake = sessionStorage.getItem('skope_retake_active') === 'true'
    if (pathReport && !isRetake) {
      navigate('/result')
      return
    }

    // Otherwise, clear the retake flag and clear report cache
    sessionStorage.removeItem('skope_retake_active')
    sessionStorage.removeItem('pathreport')
    sessionStorage.removeItem('skope_preferences')
    sessionStorage.removeItem('skope_phase2')
    sessionStorage.removeItem('share_popup_shown')

    const initialChat = getInitialChat()

    if (initialChat.length === 0) {
      setLoading(true)
      fetch('/api/conversation-start', { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          const next = [{ role: 'assistant', content: data.question }]
          setChatHistory(next)
          sessionStorage.setItem('skope_chatHistory', JSON.stringify(next))
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setError('Failed to start conversation. Please refresh.')
          setLoading(false)
        })
    } else if (initialChat.length % 2 === 0 && initialChat.length > 0) {
      // User sent something, AI hasn't responded.
      setLoading(true)
      fetchNextAdaptiveQuestion(initialChat).then(() => {
        setLoading(false)
      })
    }
  }, [])

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, loading])

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const totalSteps = 6 // Target number of questions
  const progress = Math.round((completedSteps / totalSteps) * 100)

  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart the test? All your current answers will be cleared.")) {
      sessionStorage.removeItem('skope_phase1')
      sessionStorage.removeItem('skope_chatHistory')
      setChatHistory([])
      setCurrentQuestionIndex(0)
      setError('')
      setChatInput('')
      
      setLoading(true)
      fetch('/api/conversation-start', { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          const next = [{ role: 'assistant', content: data.question }]
          setChatHistory(next)
          sessionStorage.setItem('skope_chatHistory', JSON.stringify(next))
          setLoading(false)
        })
    }
  }

  const fetchNextAdaptiveQuestion = async (history, attempt = 1) => {
    const MAX_ATTEMPTS = 3
    try {
      const res = await fetch('/api/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: { q1: 'Dynamic Mode Active' }, chatHistory: history })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Server error (${res.status})`)
      }
      const data = await res.json()
      setError('')
      setChatHistory(prev => {
        const next = [...prev, { role: 'assistant', content: data.question }]
        sessionStorage.setItem('skope_chatHistory', JSON.stringify(next))
        return next
      })
    } catch (err) {
      if (attempt < MAX_ATTEMPTS) {
        const delay = attempt * 2000
        setError(`Connection issue — retrying in ${delay / 1000}s... (attempt ${attempt}/${MAX_ATTEMPTS})`)
        await new Promise(r => setTimeout(r, delay))
        setError('')
        return fetchNextAdaptiveQuestion(history, attempt + 1)
      }
      setError('Could not reach the AI. Check your connection and tap retry.')
    }
  }

  const handleSendMessage = async () => {
    const msg = chatInput.trim()
    if (!msg || loading) return

    setChatInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const newHistory = [...chatHistory, { role: 'user', content: msg }]
    setChatHistory(newHistory)
    sessionStorage.setItem('skope_chatHistory', JSON.stringify(newHistory))
    setLoading(true)
    setError('')

    // Complete after 6 User messages (12 messages total)
    if (newHistory.filter(m => m.role === 'user').length >= 6) {
      const userAnswers = newHistory.filter(m => m.role === 'user').map(m => m.content)
      const phase1Data = {
        q1: userAnswers[0] || 'Dynamic',
        q2: userAnswers[1] || 'Dynamic',
        q3: userAnswers[2] || 'Dynamic',
        q4: userAnswers[3] || 'Dynamic',
        q5: userAnswers[4] || 'Dynamic'
      }
      sessionStorage.setItem('skope_phase1', JSON.stringify(phase1Data))
      navigate('/preferences')
    } else {
      await fetchNextAdaptiveQuestion(newHistory)
      setLoading(false)
    }
  }

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="page-wrapper flex flex-col h-screen overflow-hidden pt-[80px]">
        <Navbar />

        {/* Progress Bar */}
        <div className="h-[3px] bg-[rgba(108,99,255,0.06)] relative overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-[#6c63ff] to-[#4f8ef7] transition-all duration-700 ease-out rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Unified Conversational Chat Box */}
        <div className="flex-1 max-w-[760px] w-full mx-auto px-4 pb-6 pt-4 flex flex-col overflow-hidden animate-fadeUp">
          <div className="flex-1 flex flex-col overflow-hidden relative rounded-3xl border border-white/10 bg-neutral-900/60 backdrop-blur-[16px] transition-all duration-300">
            {/* Lighting highlight borders */}
            <div className="absolute inset-0 border-white/20 border rounded-3xl pointer-events-none" style={{ maskImage: 'linear-gradient(135deg, white, transparent 60%)', WebkitMaskImage: 'linear-gradient(135deg, white, transparent 60%)' }} />
            <div className="absolute inset-0 border-white/10 border rounded-3xl pointer-events-none" style={{ maskImage: 'linear-gradient(135deg, transparent 60%, white)', WebkitMaskImage: 'linear-gradient(135deg, transparent 60%, white)' }} />
            
            {/* Box shadow glow overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl shimmer" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 40px 120px rgba(59,130,246,0.15)' }}></div>

            {/* Chat Header */}
            <div className="shrink-0 px-6 py-3 border-b border-white/5 bg-zinc-950/40 relative z-10">
              <div className="flex items-center justify-between">
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
                        {loading ? 'Thinking' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress counter & Start Over */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-1 bg-[rgba(248,113,113,0.08)] hover:bg-[rgba(248,113,113,0.15)] border border-[rgba(248,113,113,0.15)] hover:border-[rgba(248,113,113,0.3)] transition-all duration-200 rounded-full px-2.5 sm:px-3 py-1.5 font-dm text-[11px] text-[#f87171] cursor-pointer"
                    title="Clear history and start over"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 4v6h-6" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    <span className="hidden sm:inline">Start Over</span>
                  </button>
                  <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-full px-2.5 sm:px-3 py-1.5 font-dm text-[10px] sm:text-[11px] text-[rgba(240,242,255,0.6)]">
                    <span className="sm:hidden">{completedSteps}/{totalSteps} Qs</span>
                    <span className="hidden sm:inline">{completedSteps} of {totalSteps} questions answered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 relative z-10">
              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {chatHistory.map((msg, i) => (
                    <ChatBubble 
                      key={i} 
                      message={msg} 
                      index={i} 
                      isLatest={i === chatHistory.length - 1} 
                      onType={handleScrollToBottom} 
                    />
                  ))}
                </AnimatePresence>

                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 mb-1.5"
                  >
                    <div
                      className="w-7 h-7 bg-cover ring-white/10 ring-1 rounded-full animate-floatSlow shrink-0 mr-2.5 mt-0.5"
                      style={{
                        backgroundImage: `url('https://hoirqrkdgbmvpwutwuwj-all.supabase.co/storage/v1/object/public/assets/assets/fc36a88f-5106-416e-82ac-ea0cd24cf358_320w.webp')`,
                        animationDuration: '7s'
                      }}
                    />
                    <div className="bg-neutral-900 ring-1 ring-white/10 rounded-[14px_14px_14px_4px] px-3.5 py-2 flex items-center gap-2">
                      <span className="font-dm text-[11px] text-neutral-400">Thinking</span>
                      <span className="typing-dots inline-flex items-center gap-1">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </span>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.15)] rounded-[12px] px-4 py-3 text-center">
                    <p className="font-dm text-[13px] text-[#f87171]">{error}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input Box */}
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
                    placeholder={completedSteps >= 6 ? "Interview complete! Moving to preferences..." : "Be honest — there are no wrong answers..."}
                    value={chatInput}
                    disabled={loading || completedSteps >= 6}
                    onChange={(e) => { setChatInput(e.target.value); handleTextareaResize(e) }}
                    onKeyDown={handleChatKeyDown}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !chatInput.trim() || completedSteps >= 6}
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
    </>
  )
}

