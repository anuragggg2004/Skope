import { useState, useEffect } from 'react'

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

export default function ChatMessage({ message, isLatest, onType }) {
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full group relative`}>
      <div className="relative max-w-[80%]">
        <div
          className={`px-[18px] py-[12px] font-dm text-[14px] leading-[1.65] shadow-sm ${
            isUser
              ? 'bg-gradient-to-r from-blue to-purple shadow-[0_4px_15px_rgba(139,92,246,0.3)] text-white rounded-[20px_20px_4px_20px]'
              : 'glass-card border-[rgba(255,255,255,0.1)] text-[rgba(240,242,255,0.9)] rounded-[20px_20px_20px_4px] pr-10'
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
            className="absolute right-2 top-[50%] -translate-y-[50%] opacity-0 group-hover:opacity-100 transition-opacity bg-[#141926]/90 hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] rounded-md p-1.5 text-[rgba(240,242,255,0.4)] hover:text-white cursor-pointer"
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
    </div>
  )
}
