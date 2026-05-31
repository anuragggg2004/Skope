export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-[18px] py-[12px] font-dm text-[14px] leading-[1.65] shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-blue to-purple shadow-[0_4px_15px_rgba(139,92,246,0.3)] text-white rounded-[20px_20px_4px_20px]'
            : 'glass-card border-[rgba(255,255,255,0.1)] text-[rgba(240,242,255,0.9)] rounded-[20px_20px_20px_4px]'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
