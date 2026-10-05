import React, { useState } from 'react'
import { Sparkles, ArrowRight, Zap, CheckCircle2, AlertTriangle, Layers, Clock } from 'lucide-react'

interface SplitHeroProps {
  onOpenReport: () => void
}

export const SplitHero: React.FC<SplitHeroProps> = ({ onOpenReport }) => {
  const [sliderPos, setSliderPos] = useState(50) // percentage 0-100 for interactive slider comparison

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#080c16] shadow-2xl mb-12">
      
      {/* Top Banner Headline */}
      <div className="p-6 sm:p-10 pb-6 relative z-20 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Autonomous Dispatch 3.0 • Closed-Loop Infrastructure
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          From Broken to Fixed. <br />
          <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
            In Record Campus Time.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed font-normal">
          No more unanswered facilities tickets or ghost repairs. Report physical hazards in 15 seconds, 
          track automated department dispatches, and sign off only when the job is genuinely fixed.
        </p>

        {/* Action Call to Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Report Campus Issue</span>
          </button>

        </div>
      </div>

      {/* Interactive Visual Comparison Stage */}
      <div className="relative w-full aspect-[16/9] max-h-[560px] overflow-hidden border-t border-white/10 select-none group">
        
        {/* Background Image: Generated Split Campus */}
        <img
          src="/campus_split.jpg"
          alt="Campus Before and After - Broken vs Fixed"
          className="w-full h-full object-cover"
        />

        {/* Floating Interactive Badge Overlays */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-950/80 backdrop-blur-md border border-rose-500/40 text-rose-300 text-xs font-bold shadow-xl">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>BEFORE: HAZARD & NEGLECT</span>
        </div>

        <div className="absolute top-6 right-6 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>AFTER: RESOLVED & VERIFIED</span>
        </div>

        {/* Bottom Floating Stats Panel */}
        <div className="absolute bottom-6 left-6 right-6 z-10 p-4 rounded-2xl bg-[#07090e]/85 backdrop-blur-xl border border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span><strong>Left:</strong> Leaking Pipes, Halting Lifts, Flickering Power</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span><strong>Right:</strong> Nominal Pressure, Working LED Fixtures, 100% Student Verified</span>
          </div>

          <div className="mono-tag text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
            Target SLA: 2h Urgent
          </div>
        </div>

      </div>

    </div>
  )
}

export default SplitHero
