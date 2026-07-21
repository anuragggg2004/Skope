import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const steps = [
      { target: 25, delay: 100 },
      { target: 55, delay: 350 },
      { target: 82, delay: 700 },
      { target: 100, delay: 1100 },
    ]

    const timers = steps.map(({ target, delay }) =>
      setTimeout(() => setProgress(target), delay)
    )

    const doneTimer = setTimeout(() => {
      setDone(true)
      setTimeout(() => onComplete?.(), 500)
    }, 1500)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  const tagline = "NEVER GUESS YOUR FUTURE"

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9000] flex flex-col items-center justify-center overflow-hidden bg-[#04030a]"
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: 'blur(10px)',
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          {/* Orbital Rings & Logo Center */}
          <div className="relative flex items-center justify-center w-64 h-64 mb-8">
            {/* Outer Spinning Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-[#a855f7]/30"
            />

            {/* Middle Reverse Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-4 rounded-full border border-indigo-500/20 border-t-indigo-500/80 border-r-indigo-500/80"
              style={{ boxShadow: '0 0 24px rgba(79,142,247,0.3)' }}
            />

            {/* Inner Fast Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-10 rounded-full border border-pink-500/20 border-b-pink-500"
            />

            {/* Center Logo Text */}
            <div className="relative z-10 flex items-center gap-1.5">
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="font-clash text-[44px] font-bold text-white tracking-tight"
              >
                Sk
              </motion.span>
              <motion.svg
                width="36"
                height="36"
                viewBox="0 0 100 100"
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <circle cx="50" cy="50" r="10" fill="#4f8ef7" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="#a855f7" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#ec4899" strokeWidth="6" />
              </motion.svg>
              <motion.span
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="font-clash text-[44px] font-bold text-white tracking-tight"
              >
                pe
              </motion.span>
            </div>
          </div>

          {/* Monospace Progress Counter & Bar */}
          <div className="w-56 text-center">
            <div className="flex items-center justify-between font-mono text-[12px] text-white/50 mb-2">
              <span className="text-[#4f8ef7] font-semibold">INITIALIZING</span>
              <span className="text-white font-bold">{progress}%</span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden p-[1px] border border-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#4f8ef7] via-[#a855f7] to-[#ec4899]"
                style={{
                  width: `${progress}%`,
                  boxShadow: '0 0 12px rgba(168,85,247,0.8)',
                  transition: 'width 0.3s ease-out',
                }}
              />
            </div>

            {/* Letter-by-letter tagline */}
            <div className="mt-4 flex items-center justify-center gap-1 font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
              {tagline.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Background Ambient Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(79,142,247,0.05) 50%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
