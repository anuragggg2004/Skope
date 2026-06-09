import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { motion, useAnimation, useInView } from 'framer-motion';

// Icons as simple SVG components to keep it self-contained
const CompassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-300">
    <circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-300">
    <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>
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
              <CompassIcon />
              <span className="text-sm text-sky-200/90 font-dm">Career Insights</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-center text-4xl md:text-6xl font-sora font-semibold tracking-tight text-white">
            Discover Your Future
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">With Actionable Insights</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-base md:text-lg text-white/70 font-dm font-normal">
            Tools to analyze your vibe, explore top colleges, and track your skills—built to accelerate your career journey.
          </p>

          {/* Grid */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 font-dm">
            <MatchProgressCard />
            <TopCollegesCard />
            <LearningStackCard />
            <ActionPlanCard />
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Cards ──────────────────────────────────────────────

function MatchProgressCard() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });
  
  return (
    <section ref={ref} className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 transition-all hover:bg-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl transition-opacity group-hover:bg-sky-500/20"></div>

      <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 shadow-2xl">
        <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
          <TargetIcon />
          <span className="font-semibold text-white/90">Career Match Progress</span>
        </div>

        <div className="space-y-3">
          {/* Row 1 */}
          <div className="rounded-xl bg-white/[0.04] p-3.5 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-white/90">Software Engineering</p>
                  <p className="text-xs text-white/60 font-mono">High Match</p>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '89%' } : { width: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                  />
                </div>
              </div>
              <span className="text-xs text-white/70 font-mono w-8 text-right">
                <AnimatedCounter from={0} to={89} active={isInView} />%
              </span>
            </div>
            <p className="mt-2.5 text-[11px] text-white/50 tracking-wide uppercase">Technology & Innovation</p>
          </div>

          {/* Row 2 */}
          <div className="rounded-xl bg-white/[0.04] p-3.5 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-white/90">Business Analytics</p>
                  <p className="text-xs text-white/60 font-mono">Good Match</p>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '65%' } : { width: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  />
                </div>
              </div>
              <span className="text-xs text-white/70 font-mono w-8 text-right">
                <AnimatedCounter from={0} to={65} active={isInView} delay={200} />%
              </span>
            </div>
            <p className="mt-2.5 text-[11px] text-white/50 tracking-wide uppercase">Data & Strategy</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3.5 py-1.5 text-xs text-sky-200 ring-1 ring-sky-400/30 hover:bg-sky-500/25 transition duration-300 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"></path><path d="M4 6h.01"></path><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"></path><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"></path><path d="M12 18h.01"></path><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"></path><circle cx="12" cy="12" r="2"></circle><path d="m13.41 10.59 5.66-5.66"></path></svg>
            AI Vibe Analysis
          </button>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400/80 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-Time
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-xl md:text-2xl font-sora font-semibold tracking-tight text-white">Track Your Alignment</h3>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">
        See how closely your vibe aligns with top career paths. Make confident decisions with instant AI insight.
      </p>
    </section>
  );
}

function TopCollegesCard() {
  const colleges = [
    { name: 'Stanford University', loc: 'US • Highly Selective', icon: 'star', color: 'text-amber-300' },
    { name: 'IIT Delhi', loc: 'IN • Technology Focus', icon: 'badge', color: 'text-sky-300' },
    { name: 'Oxford University', loc: 'GB • Historic Excellence', icon: 'shield', color: 'text-emerald-300' }
  ];

  return (
    <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 transition-all hover:bg-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl transition-opacity group-hover:bg-indigo-500/20"></div>

      <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-indigo-300">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span className="font-semibold text-white/90">Top Recommended Colleges</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/50 tracking-wider uppercase">Auto-Matched</span>
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
            {[...colleges, ...colleges].map((c, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/5 text-white/80 ring-1 ring-white/20">
                    <span className="text-xs font-bold font-sora">{c.name.charAt(0)}</span>
                  </div>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="M14 18h6"></path><path d="m22 22-5-10-5 10"></path></svg>
          Filtered by your preferences and test scores
        </div>
      </div>

      <h3 className="mt-6 text-xl md:text-2xl font-sora font-semibold tracking-tight text-white">Explore World-Class Institutions</h3>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">
        Discover colleges and universities tailored specifically to your profile, academic goals, and location preferences.
      </p>
    </section>
  );
}

function LearningStackCard() {
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
            <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
          </svg>
          <span className="font-semibold text-white/90">Your Learning Stack</span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-sky-300/80"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            <span className="text-[10px] text-white/60 tracking-wide uppercase text-center leading-tight">Code</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-fuchsia-300/80"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <span className="text-[10px] text-white/60 tracking-wide uppercase text-center leading-tight">Design</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-300/80"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span className="text-[10px] text-white/60 tracking-wide uppercase text-center leading-tight">Data</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-300/80"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
            <span className="text-[10px] text-white/60 tracking-wide uppercase text-center leading-tight">Logic</span>
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
          <div className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-2.5 bg-white/[0.02]">
            <span className="text-[11px] text-white/50 tracking-wide uppercase font-semibold">Ready to start learning</span>
          </div>
        </div>
      </motion.div>

      <h3 className="mt-6 text-xl md:text-2xl font-sora font-semibold tracking-tight text-white">Skill Pathways</h3>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">
        Master the essential skills needed for your matched careers with curated tools and learning paths in one place.
      </p>
    </section>
  );
}

function ActionPlanCard() {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Take Vibe Assessment', desc: 'Find your career match', status: 'Completed', icon: 'check', color: 'text-emerald-400' },
    { id: 2, name: 'Review PathReport', desc: 'Explore career matches', status: 'In Progress', icon: 'clock', color: 'text-amber-400' },
    { id: 3, name: 'Shortlist Colleges', desc: 'Build your target list', status: 'Pending', icon: 'circle', color: 'text-white/40' }
  ]);

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      name: 'Prepare for Exams',
      desc: 'Check entrance requirements',
      status: 'Upcoming',
      icon: 'circle',
      color: 'text-white/40'
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 transition-all hover:bg-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl transition-opacity group-hover:bg-fuchsia-500/20"></div>

      <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-fuchsia-300">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
            </svg>
            <span className="font-semibold text-white/90">Your Action Plan</span>
          </div>
          <button onClick={addTask} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/80 ring-1 ring-white/10 hover:bg-white/10 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Step
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex items-center gap-2 text-[11px] font-medium tracking-wide">
          <button className="rounded-full bg-white/10 px-3 py-1.5 text-white/90 ring-1 ring-white/10 transition-colors hover:bg-white/15">All Steps</button>
          <button className="rounded-full bg-transparent px-3 py-1.5 text-white/50 ring-1 ring-white/10 transition-colors hover:bg-white/5 hover:text-white/70">Completed</button>
          <button className="rounded-full bg-transparent px-3 py-1.5 text-white/50 ring-1 ring-white/10 transition-colors hover:bg-white/5 hover:text-white/70">Pending</button>
        </div>

        <div className="mt-4 space-y-2 h-[180px] overflow-y-auto pr-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <motion.div layout className="space-y-2">
            {tasks.map((t) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                key={t.id} 
                className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3.5 ring-1 ring-white/10 hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full bg-white/5 ring-1 ring-white/10 ${t.color}`}>
                    {t.icon === 'check' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    {t.icon === 'clock' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                    {t.icon === 'circle' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${t.status === 'Completed' ? 'text-white/50 line-through' : 'text-white/90'}`}>{t.name}</p>
                    <p className="text-[11px] text-white/50 tracking-wide mt-0.5">{t.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/50 font-medium uppercase tracking-wider">
                  <span className="hidden sm:inline">{t.status}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <h3 className="mt-6 text-xl md:text-2xl font-sora font-semibold tracking-tight text-white">Your Action Plan</h3>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">
        Stay on track with an automated timeline of your next steps toward college admissions and career preparation.
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
