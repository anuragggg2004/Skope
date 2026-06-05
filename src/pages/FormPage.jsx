import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full group relative`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#4f8ef7] flex items-center justify-center shrink-0 mr-2.5 mt-0.5 shadow-[0_2px_12px_rgba(108,99,255,0.25)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      )}
      <div className="relative max-w-[78%]">
        <div
          className={`px-4 py-3 font-dm text-[14px] leading-[1.7] ${
            isUser
              ? 'bg-gradient-to-r from-[rgba(108,99,255,0.15)] to-[rgba(79,142,247,0.15)] border border-[rgba(108,99,255,0.2)] text-white rounded-[18px_18px_4px_18px]'
              : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[rgba(240,242,255,0.85)] rounded-[18px_18px_18px_4px] pr-10'
          }`}
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
            className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#141926] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] rounded-md p-1.5 text-[rgba(240,242,255,0.4)] hover:text-white cursor-pointer"
            title="Copy message"
          >
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const INITIAL_QUESTIONS = [
  "Hey! I'm Skope, your AI career strategist. Let's find your archetype. First, what stream are you in and what are your ACTUAL marks?",
  "What have you actually built, made, or done outside school? (If nothing, say that.)",
  "What career are you thinking, and honestly, whose idea is it?",
  "What are your ACTUAL marks or exam scores? (No dreams, give me the real numbers on your sheet.)",
  "Which exams are you preparing for? Be specific about what you are studying for right now."
]

export default function FormPage() {
  const navigate = useNavigate()

  // Load state from sessionStorage if it exists to survive page refreshes
  const getInitialChat = () => {
    const saved = sessionStorage.getItem('skope_chatHistory')
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: INITIAL_QUESTIONS[0] }]
  }

  const [chatHistory, setChatHistory] = useState(getInitialChat)
  const [phase1, setPhase1] = useState(() => {
    const saved = sessionStorage.getItem('skope_phase1')
    return saved ? JSON.parse(saved) : { q1: '', q2: '', q3: '', q4: '', q5: '' }
  })

  const completedSteps = chatHistory.filter(m => m.role === 'user').length
  const initialIndex = Math.min(completedSteps, 5)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialIndex)

  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Clear report caches on mount so they can run fresh reports, but leave the chat session intact
  useEffect(() => {
    sessionStorage.removeItem('pathreport')
    sessionStorage.removeItem('skope_preferences')
    sessionStorage.removeItem('skope_phase2')
    sessionStorage.removeItem('share_popup_shown')

    // Recovery if page was refreshed while AI was thinking / generating the next question
    const initialChat = getInitialChat()
    if (initialChat.length % 2 === 0 && initialChat.length > 0) {
      setLoading(true)
      const completed = initialChat.filter(m => m.role === 'user').length
      if (completed < 5) {
        const nextIdx = completed
        setTimeout(() => {
          setChatHistory(prev => {
            const next = [...prev, { role: 'assistant', content: INITIAL_QUESTIONS[nextIdx] }]
            sessionStorage.setItem('skope_chatHistory', JSON.stringify(next))
            return next
          })
          setLoading(false)
        }, 800)
      } else {
        const savedPhase1 = sessionStorage.getItem('skope_phase1')
        const currentPhase1 = savedPhase1 ? JSON.parse(savedPhase1) : { q1: '', q2: '', q3: '', q4: '', q5: '' }
        fetchNextAdaptiveQuestion(initialChat, currentPhase1).then(() => {
          setLoading(false)
        })
      }
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

  const totalSteps = 5 + 3 // 5 initial + 3 adaptive = 8 questions total (16 messages)
  const progress = Math.round((completedSteps / totalSteps) * 100)

  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart the diagnostic? All your current answers will be cleared.")) {
      sessionStorage.removeItem('skope_phase1')
      sessionStorage.removeItem('skope_chatHistory')
      setPhase1({ q1: '', q2: '', q3: '', q4: '', q5: '' })
      setChatHistory([{ role: 'assistant', content: INITIAL_QUESTIONS[0] }])
      setCurrentQuestionIndex(0)
      setError('')
      setChatInput('')
    }
  }

  const fetchNextAdaptiveQuestion = async (history, currentPhase1, attempt = 1) => {
    const MAX_ATTEMPTS = 3
    try {
      const res = await fetch('/api/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: currentPhase1, chatHistory: history })
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
        return fetchNextAdaptiveQuestion(history, currentPhase1, attempt + 1)
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

    const updatedPhase1 = { ...phase1 }

    if (currentQuestionIndex < 5) {
      // Store in phase1 variables
      const qKey = `q${currentQuestionIndex + 1}`
      updatedPhase1[qKey] = msg
      setPhase1(updatedPhase1)
      sessionStorage.setItem('skope_phase1', JSON.stringify(updatedPhase1))

      const nextIdx = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIdx)

      if (nextIdx < 5) {
        // Prompt next static question
        setTimeout(() => {
          setChatHistory(prev => {
            const next = [...prev, { role: 'assistant', content: INITIAL_QUESTIONS[nextIdx] }]
            sessionStorage.setItem('skope_chatHistory', JSON.stringify(next))
            return next
          })
          setLoading(false)
        }, 1000)
      } else {
        // Completed initial questions -> call first adaptive
        await fetchNextAdaptiveQuestion(newHistory, updatedPhase1)
        setLoading(false)
      }
    } else {
      // In adaptive phase
      if (newHistory.length >= 16) {
        sessionStorage.setItem('skope_phase1', JSON.stringify(phase1))
        sessionStorage.setItem('skope_chatHistory', JSON.stringify(newHistory))
        navigate('/preferences')
      } else {
        await fetchNextAdaptiveQuestion(newHistory, phase1)
        setLoading(false)
      }
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
      <div className="page-wrapper flex flex-col h-screen overflow-hidden">
        <Navbar />

        {/* Progress Bar */}
        <div className="h-[3px] bg-[rgba(108,99,255,0.06)] relative overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-[#6c63ff] to-[#4f8ef7] transition-all duration-700 ease-out rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Unified Conversational Chat Box */}
        <div className="flex-1 flex flex-col overflow-hidden animate-fadeUp">
          {/* Chat Header */}
          <div className="shrink-0 px-6 py-3.5 border-b border-[rgba(108,99,255,0.06)] bg-[rgba(10,10,15,0.6)] backdrop-blur-md">
            <div className="max-w-[700px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#4f8ef7] flex items-center justify-center shadow-[0_2px_12px_rgba(108,99,255,0.25)]">
                    <span className="text-[14px]">🔍</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#22d3a0] border-2 border-[#0A0A0F]" />
                </div>
                <div>
                  <div className="font-sora text-[14px] font-semibold text-white">Skope AI Counsellor</div>
                  <div className="font-dm text-[11px] text-[#22d3a0]">
                    {loading ? 'Skope is thinking...' : 'Online'}
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
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="max-w-[700px] mx-auto flex flex-col gap-4">
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
                  className="flex items-start gap-2.5"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#4f8ef7] flex items-center justify-center shrink-0 shadow-[0_2px_12px_rgba(108,99,255,0.25)]">
                    <span className="text-[12px]">🔍</span>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-[18px_18px_18px_4px] px-4 py-3 flex flex-col gap-1.5">
                    <span className="font-dm text-[11px] text-[rgba(240,242,255,0.4)]">Skope is thinking...</span>
                    <div className="flex items-center gap-1">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
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
          <div className="shrink-0 border-t border-[rgba(108,99,255,0.06)] bg-[rgba(10,10,15,0.85)] backdrop-blur-xl px-6 py-4">
            <div className="max-w-[700px] mx-auto flex items-end gap-3">
              <div className="flex-1 rounded-[14px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] focus-within:border-[rgba(108,99,255,0.25)] focus-within:shadow-[0_0_25px_rgba(108,99,255,0.06)] transition-all duration-200">
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
                className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#6c63ff] to-[#4f8ef7] flex items-center justify-center cursor-pointer border-none hover:shadow-[0_4px_20px_rgba(108,99,255,0.3)] transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

