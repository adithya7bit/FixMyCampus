import React from 'react'
import { Sparkles, Zap, Activity, ArrowRight, CheckCircle2, Wifi, Droplets } from 'lucide-react'

interface ModernTwinHeroProps {
  onOpenReport: () => void
}

export const ModernTwinHero: React.FC<ModernTwinHeroProps> = ({ onOpenReport }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0b101d] via-[#07090e] to-[#04060a] shadow-2xl p-6 sm:p-10 lg:p-12 mb-10">
      
      {/* Background Glow Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Column: Clean Copy & Action Controls */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>CAMPUS DIGITAL TWIN 3.0 • REAL-TIME DISPATCH</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Report in Seconds. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Resolved with Proof.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            FixMyCampus empowers students to log physical infrastructure issues directly to department dispatchers. 
            Features instant AI categorization, duplicate prevention, and student-verified sign-offs.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onOpenReport}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Report Campus Issue</span>
            </button>

          </div>

          {/* Key Metrics Ticker */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Avg Dispatch</div>
              <div className="text-xl font-extrabold text-cyan-300 font-mono mt-0.5">14 Mins</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">SLA Target</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">98.4%</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Verification</div>
              <div className="text-xl font-extrabold text-white font-mono mt-0.5">Closed-Loop</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Blocks</div>
              <div className="text-xl font-extrabold text-indigo-400 font-mono mt-0.5">6 Active</div>
            </div>
          </div>

        </div>

        {/* Right Column: High-Fidelity 3D Isometric Digital Twin Showcase */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl group bg-[#080d1a]">
            
            <img 
              src="/campus_twin.jpg" 
              alt="Isometric 3D Campus Digital Twin Telemetry"
              className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
            />

            {/* Glowing Corner Accents */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-60 pointer-events-none" />

            {/* Interactive Telemetry Pill Overlays */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold shadow-lg">
              <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>POWER GRID: 100% NOMINAL</span>
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold shadow-lg">
              <Droplets className="w-3 h-3 text-emerald-400" />
              <span>SMART WATER: BALANCED</span>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-indigo-500/40 text-indigo-300 text-[10px] font-mono font-bold shadow-lg">
              <Wifi className="w-3 h-3 text-indigo-400" />
              <span>WIFI MESH: ACTIVE</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}

export default ModernTwinHero
