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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start w-full group relative mb-1.5`}>
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
    </div>
  )

}
