import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Simulate loading progress
    const steps = [
      { target: 30,  delay: 100  },
      { target: 65,  delay: 400  },
      { target: 85,  delay: 800  },
      { target: 100, delay: 1300 },
    ]

    const timers = steps.map(({ target, delay }) =>
      setTimeout(() => setProgress(target), delay)
    )

    const done = setTimeout(() => {
      setDone(true)
      setTimeout(() => onComplete?.(), 600)
    }, 1800)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9000] flex flex-col items-center justify-center"
          style={{ background: '#050508' }}
          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.6, ease: [0.16,1,0.3,1] } }}
        >
          {/* Logo */}
          <div className="flex items-center gap-0 mb-12 overflow-hidden">
            <motion.span
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0,   opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16,1,0.3,1] }}
              className="font-clash text-[52px] font-bold text-[#f1f5f9] tracking-[-2px]"
            >
              Sk
            </motion.span>

            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.34,1.56,0.64,1] }}
              className="font-clash text-[52px] font-bold text-[#6366f1] tracking-[-2px]"
            >
              o
            </motion.span>

            <motion.span
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0,  opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16,1,0.3,1] }}
              className="font-clash text-[52px] font-bold text-[#f1f5f9] tracking-[-2px]"
            >
              pe
            </motion.span>
          </div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="w-[200px]"
          >
            <div className="h-[2px] rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: '0 0 12px rgba(99,102,241,0.6)',
                }}
              />
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mt-4 text-[11px] font-inter tracking-[0.15em] uppercase text-white/20"
            >
              AI Career Intelligence
            </motion.p>
          </motion.div>

          {/* Floating orb behind logo */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'pulseGlow 4s ease-in-out infinite',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
