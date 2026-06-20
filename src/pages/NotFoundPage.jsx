import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)' }} />
      <div className="orb-2" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
      <div className="page-wrapper min-h-screen flex flex-col pt-[80px]">
        <Navbar />
        
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-[480px] w-full text-center">
            {/* 404 Visual Tag */}
            <div className="relative inline-block mb-6">
              <span className="font-clash text-[100px] sm:text-[120px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue to-purple select-none tracking-tighter">
                404
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue to-purple blur-2xl opacity-20 -z-10" />
            </div>

            {/* Glass Card Container */}
            <div className="glass-card p-8 sm:p-10 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <h2 className="font-sora text-[22px] sm:text-[24px] font-semibold text-white mb-3">
                Lost in the Whirlpool?
              </h2>
              <p className="font-dm text-[13.5px] text-[rgba(240,242,255,0.45)] leading-relaxed mb-8">
                The page you are looking for doesn't exist, has been relocated, or is hiding in our database. Let's get you back on track.
              </p>

              {/* Action Button */}
              <button
                onClick={() => navigate('/')}
                className="w-full font-sora text-[14px] font-semibold bg-gradient-to-r from-blue to-purple text-white py-3.5 rounded-[12px] border-none cursor-pointer hover:shadow-[0_6px_25px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 mb-4"
              >
                Back to Home Vibe →
              </button>

              {/* Automatic Redirect Countdown */}
              <p className="font-dm text-[11px] text-[rgba(240,242,255,0.25)]">
                Redirecting automatically in <span className="font-mono text-white/60 font-medium">{countdown}s</span>...
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
