import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { motion, useAnimation, useInView } from 'framer-motion';

// Icons as simple SVG components to keep it self-contained
const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-300">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <circle cx="12" cy="12" r="4"></circle>
  </svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-300">
    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>
  </svg>
);

export default function Dashboard() {
  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="page-wrapper min-h-screen">
        <Navbar />
        
        <section className="md:px-10 md:pt-28 max-w-6xl mr-auto ml-auto pt-20 pr-6 pl-6 pb-20">
          {/* Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur">
              <BoltIcon />
              <span className="text-sm text-sky-200/90 font-dm">Feature Highlights</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-center text-4xl md:text-6xl font-sora font-semibold tracking-tight text-white">
            Feature Highlights to Accelerate
            <span className="block mt-2">Your Sales</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-base md:text-lg text-white/70 font-dm font-normal">
            Tools to track, automate, and scale your pipeline—built to elevate performance and help teams close faster.
          </p>

          {/* Grid */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 font-dm">
            <RealtimeCard />
            <BordersCard />
            <CollabCard />
            <AutomationCard />
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Cards ──────────────────────────────────────────────

function RealtimeCard() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });
  
  return (
    <section ref={ref} className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 transition-all hover:bg-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl transition-opacity group-hover:bg-sky-500/20"></div>

      <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 shadow-2xl">
        <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
          <BarChartIcon />
          <span className="font-semibold text-white/90">Realtime KPI Monitor</span>
        </div>

        <div className="space-y-3">
          {/* Row 1 */}
          <div className="rounded-xl bg-white/[0.04] p-3.5 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <img src="https://flagcdn.com/us.svg" alt="US" className="h-5 w-5 rounded-full ring-1 ring-white/20 object-cover" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-white/90">United States</p>
                  <p className="text-xs text-white/60 font-mono">$89,032</p>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '76%' } : { width: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                  />
                </div>
              </div>
              <span className="text-xs text-white/70 font-mono w-8 text-right">
                <AnimatedCounter from={0} to={76} active={isInView} />%
              </span>
            </div>
            <p className="mt-2.5 text-[11px] text-white/50 tracking-wide uppercase">E‑commerce & SaaS</p>
          </div>

          {/* Row 2 */}
          <div className="rounded-xl bg-white/[0.04] p-3.5 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <img src="https://flagcdn.com/bd.svg" alt="BD" className="h-5 w-5 rounded-full ring-1 ring-white/20 object-cover" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-white/90">Bangladesh</p>
                  <p className="text-xs text-white/60 font-mono">$52,878</p>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '44%' } : { width: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  />
                </div>
              </div>
              <span className="text-xs text-white/70 font-mono w-8 text-right">
                <AnimatedCounter from={0} to={44} active={isInView} delay={200} />%
              </span>
            </div>
            <p className="mt-2.5 text-[11px] text-white/50 tracking-wide uppercase">AI & Automation</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3.5 py-1.5 text-xs text-sky-200 ring-1 ring-sky-400/30 hover:bg-sky-500/25 transition duration-300 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"></path><path d="M4 6h.01"></path><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"></path><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"></path><path d="M12 18h.01"></path><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"></path><circle cx="12" cy="12" r="2"></circle><path d="m13.41 10.59 5.66-5.66"></path></svg>
            AI Insights
          </button>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400/80 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-xl md:text-2xl font-sora font-semibold tracking-tight text-white">Real‑Time Performance Tracking</h3>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">
        See KPIs, closed deals, and revenue trends as they happen. Make confident decisions with instant insight.
      </p>
    </section>
  );
}

function BordersCard() {
  const clients = [
    { name: 'Jordan Lee', loc: 'US • USD', flag: 'https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&q=80', icon: 'star', color: 'text-amber-300' },
    { name: 'Maya Chen', loc: 'GB • GBP', flag: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=80&auto=format&fit=crop', icon: 'shield', color: 'text-emerald-300' },
    { name: 'Sofia Alvarez', loc: 'AU • AUD', flag: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=80&auto=format&fit=crop', icon: 'badge', color: 'text-sky-300' }
  ];

  return (
    <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 transition-all hover:bg-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl transition-opacity group-hover:bg-indigo-500/20"></div>

      <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-indigo-300">
              <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"></path><path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"></path><path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"></path><circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span className="font-semibold text-white/90">Worldwide Clients</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/50 tracking-wider uppercase">Weekly</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-white/40">
              <path d="m17 2 4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="m7 22-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
            </svg>
          </div>
        </div>

        {/* Sliding list */}
        <div className="overflow-hidden h-[130px] rounded-xl ring-white/10 ring-1 relative bg-white/[0.02]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#141926] via-transparent to-[#141926] z-10 pointer-events-none opacity-80" />
          <motion.div 
            animate={{ translateY: ['0%', '-50%'] }}
            transition={{ ease: "linear", duration: 10, repeat: Infinity }}
            className="flex flex-col pt-2"
          >
            {[...clients, ...clients].map((c, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <img src={c.flag} className="h-7 w-7 rounded-full ring-1 ring-white/20 object-cover" alt="client" />
                  <div>
                    <p className="text-sm text-white/90 font-medium">{c.name}</p>
                    <p className="text-[11px] text-white/50 uppercase tracking-widest mt-0.5">{c.loc}</p>
                  </div>
                </div>
                {c.icon === 'star' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${c.color}`}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>}
                {c.icon === 'shield' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${c.color}`}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>}
                {c.icon === 'badge' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${c.color}`}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></svg>}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-white/50 tracking-wide">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="m5 8 6 6"></path><path d="m4 14 6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="m22 22-5-10-5 10"></path><path d="M14 18h6"></path></svg>
          Multilingual + multicurrency support
        </div>
      </div>

      <h3 className="mt-6 text-xl md:text-2xl font-sora font-semibold tracking-tight text-white">Sell Globally</h3>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">
        Serve customers across regions with localized language and currency options to scale confidently.
      </p>
    </section>
  );
}

function CollabCard() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    setRotate({ x: dy * -4, y: dx * 4 });
  };

  return (
    <section 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 transition-all hover:bg-white/[0.06]"
      style={{ perspective: 1000 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl transition-opacity group-hover:bg-emerald-500/20"></div>

      <motion.div 
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 shadow-2xl"
      >
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-emerald-300">
            <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"></path><path d="m7 16.5-4.74-2.85"></path><path d="m7 16.5 5-3"></path><path d="M7 16.5v5.17"></path><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"></path><path d="m17 16.5-5-3"></path><path d="m17 16.5 4.74-2.85"></path><path d="M17 16.5v5.17"></path><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"></path><path d="M12 8 7.26 5.15"></path><path d="m12 8 4.74-2.85"></path><path d="M12 13.5V8"></path>
          </svg>
          <span className="font-semibold text-white/90">Connects with your tools</span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-sky-300/80"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
            <span className="text-[10px] text-white/60 tracking-wide uppercase">Email</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-fuchsia-300/80"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path></svg>
            <span className="text-[10px] text-white/60 tracking-wide uppercase">Chat</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-300/80"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
            <span className="text-[10px] text-white/60 tracking-wide uppercase">Calendar</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-300/80"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
            <span className="text-[10px] text-white/60 tracking-wide uppercase">CRM</span>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl bg-white/[0.02] ring-1 ring-white/10 relative">
          <div className="relative grid grid-cols-6 gap-2.5 p-4">
            <div className="h-2.5 rounded-full bg-white/10 col-span-2"></div>
            <div className="h-2.5 rounded-full bg-white/10 col-span-3"></div>
            <div className="h-2.5 rounded-full bg-white/10 col-span-1"></div>
            <div className="h-2.5 rounded-full bg-white/10 col-span-4"></div>
            <div className="h-2.5 rounded-full bg-white/10 col-span-2"></div>
            <motion.div 
              animate={{ x: ['-100%', '300%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5 bg-white/[0.02]">
            <div className="flex -space-x-2">
              <img className="h-6 w-6 rounded-full ring-2 ring-[#171b26] object-cover" src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=80&auto=format&fit=crop" alt="avatar" />
              <img className="h-6 w-6 rounded-full ring-2 ring-[#171b26] object-cover z-10" src="https://images.unsplash.com/photo-1546539782-6fc531453083?q=80&w=80&auto=format&fit=crop" alt="avatar" />
              <img className="h-6 w-6 rounded-full ring-2 ring-[#171b26] object-cover z-20" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&auto=format&fit=crop" alt="avatar" />
            </div>
            <span className="ml-2 text-[11px] text-white/50 tracking-wide uppercase">Synced across tools</span>
          </div>
        </div>
      </motion.div>

      <h3 className="mt-6 text-xl md:text-2xl font-sora font-semibold tracking-tight text-white">Seamless Collaboration</h3>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">
        Keep your team aligned with integrations to email, chat, calendars, and your CRM—all in one place.
      </p>
    </section>
  );
}

function AutomationCard() {
  const [members, setMembers] = useState([
    { id: 1, name: 'Ava Morgan', role: 'Backend Developer', pic: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=80&auto=format&fit=crop', status: 'Auto‑reminders', icon: 'clock' },
    { id: 2, name: 'Ethan Reed', role: 'Project Lead', pic: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=80&auto=format&fit=crop', status: 'Follow‑ups', icon: 'bell' },
    { id: 3, name: 'Zoe Park', role: 'Sales Lead', pic: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=80&auto=format&fit=crop', status: 'Reporting', icon: 'chart' }
  ]);

  const addMember = () => {
    const newMember = {
      id: Date.now(),
      name: 'New Teammate',
      role: 'Sales Ops',
      pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop',
      status: 'Auto‑assigned',
      icon: 'sparkle'
    };
    setMembers([newMember, ...members]);
  };

  return (
    <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 transition-all hover:bg-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl transition-opacity group-hover:bg-fuchsia-500/20"></div>

      <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-fuchsia-300">
              <rect width="8" height="8" x="3" y="3" rx="2"></rect><path d="M7 11v4a2 2 0 0 0 2 2h4"></path><rect width="8" height="8" x="13" y="13" rx="2"></rect>
            </svg>
            <span className="font-semibold text-white/90">Team Workspace</span>
          </div>
          <button onClick={addMember} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/80 ring-1 ring-white/10 hover:bg-white/10 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
            Add
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex items-center gap-2 text-[11px] font-medium tracking-wide">
          <button className="rounded-full bg-white/10 px-3 py-1.5 text-white/90 ring-1 ring-white/10 transition-colors hover:bg-white/15">Members</button>
          <button className="rounded-full bg-transparent px-3 py-1.5 text-white/50 ring-1 ring-white/10 transition-colors hover:bg-white/5 hover:text-white/70">Tasks</button>
          <button className="rounded-full bg-transparent px-3 py-1.5 text-white/50 ring-1 ring-white/10 transition-colors hover:bg-white/5 hover:text-white/70">Hub</button>
        </div>

        <div className="mt-4 space-y-2 h-[180px] overflow-y-auto pr-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <motion.div layout className="space-y-2">
            {members.map((m) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                key={m.id} 
                className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3.5 ring-1 ring-white/10 hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={m.pic} className="h-8 w-8 rounded-full ring-1 ring-white/20 object-cover" alt="member" />
                  <div>
                    <p className="text-sm font-medium text-white/90">{m.name}</p>
                    <p className="text-[11px] text-white/50 tracking-wide uppercase mt-0.5">{m.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/50">
                  {m.icon === 'clock' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10"></circle></svg>}
                  {m.icon === 'bell' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M10.268 21a2 2 0 0 0 3.464 0"></path><path d="M22 8c0-2.3-.8-4.3-2-6"></path><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path><path d="M4 2C2.8 3.7 2 5.7 2 8"></path></svg>}
                  {m.icon === 'chart' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M5 21v-6"></path><path d="M12 21V9"></path><path d="M19 21V3"></path></svg>}
                  {m.icon === 'sparkle' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-fuchsia-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>}
                  <span className="hidden sm:inline">{m.status}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <h3 className="mt-6 text-xl md:text-2xl font-sora font-semibold tracking-tight text-white">Automate Sales Workflows</h3>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">
        Automate follow‑ups, reminders, and handoffs so your team can focus on building relationships and closing deals.
      </p>
    </section>
  );
}

// ─── Helpers ──────────────────────────────────────────────

function AnimatedCounter({ from, to, active, delay = 0 }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (!active) return;
    let startTimestamp = null;
    let frameId;
    const duration = 1500;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOut cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * (to - from) + from));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    setTimeout(() => {
      frameId = window.requestAnimationFrame(step);
    }, delay);

    return () => window.cancelAnimationFrame(frameId);
  }, [from, to, active, delay]);

  return <>{count}</>;
}
