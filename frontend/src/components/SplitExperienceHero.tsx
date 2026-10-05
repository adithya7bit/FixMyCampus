import React, { useEffect, useRef, useState } from 'react'
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  MousePointer, 
  Clock, 
  Layers 
} from 'lucide-react'

interface SplitExperienceHeroProps {
  onOpenReport: () => void
}

export const SplitExperienceHero: React.FC<SplitExperienceHeroProps> = ({ onOpenReport }) => {
  const stageRef = useRef<HTMLDivElement | null>(null)
  
  // Interactive divider position (percentage 0 to 100)
  const [dividerPercent, setDividerPercent] = useState(50)
  const [isInteracting, setIsInteracting] = useState(false)
  
  // Scroll parallax & 3D tilt metrics
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!stageRef.current) return
      const rect = stageRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const total = rect.height + windowHeight
      const current = windowHeight - rect.top
      const progress = Math.min(Math.max(current / total, 0), 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Drag / move interaction handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsInteracting(true)
    updateDivider(e)
  }

  const handlePointerUp = () => setIsInteracting(false)

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteracting) return
    updateDivider(e)
  }

  const updateDivider = (e: React.PointerEvent) => {
    if (!stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.min(Math.max((x / rect.width) * 100, 8), 92)
    setDividerPercent(percent)
  }

  // Calculate subtle, cinematic 3D scroll physics
  // Tilt subtly around X as user scrolls past, and slight Y tilt based on slider
  const tiltX = (scrollProgress - 0.5) * 14 // -7deg to +7deg
  const tiltY = (dividerPercent - 50) * 0.12 // Responsive perspective tilt
  const scale = 1.0 + (scrollProgress * 0.05) // Soft zoom
  const translateY = (scrollProgress - 0.5) * -24 // Parallax shift

  return (
    <section 
      aria-label="Campus Transformation Overview"
      className="relative w-full mb-14 select-none"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      
      {/* Editorial Header & Value Narrative */}
      <div className="max-w-3xl mx-auto text-center mb-8 px-4">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Closed-Loop Resolution • Real-Time Transformation</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Campus Restored. <br />
          <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
            One Verified Ticket at a Time.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
          Drag the interactive seam or scroll to see the physical impact of closed-loop operations: 
          turning hazardous outages into safe, verified university spaces.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Report Campus Issue</span>
          </button>

        </div>

      </div>

      {/* 3D Motion Perspective Canvas Stage */}
      <div 
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="relative w-full aspect-[16/9] max-h-[580px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#050811] cursor-ew-resize"
        style={{ perspective: '1200px' }}
      >
        
        {/* Transform Layer driven by scroll & slider */}
        <div 
          className="w-full h-full relative transition-transform duration-150 ease-out will-change-transform"
          style={{
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale}) translateY(${translateY}px)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Base Photographic Split Image */}
          <img
            src="/campus_split_cinematic.jpg"
            alt="University corridor split between damaged and restored states"
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />

          {/* Left Side Atmosphere Tint (Damaged Amber/Red) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: `polygon(0% 0%, ${dividerPercent}% 0%, ${dividerPercent}% 100%, 0% 100%)`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-950/25 via-amber-950/15 to-transparent pointer-events-none" />
          </div>

          {/* Golden/Cyan Light Seam Divider */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#f59e0b] via-[#ffffff] to-[#06b6d4] shadow-[0_0_24px_4px_rgba(245,158,11,0.7)] z-20 pointer-events-none"
            style={{ left: `${dividerPercent}%` }}
          >
            {/* Center Handle Controller */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-slate-950/90 border-2 border-white shadow-[0_0_25px_rgba(6,182,212,0.9)] flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
              <div className="flex items-center gap-0.5 text-cyan-400 font-bold text-xs select-none">
                <span>◀</span>
                <span>▶</span>
              </div>
            </div>
          </div>

          {/* Floating Telemetry Badge: LEFT (DAMAGED) */}
          <div 
            className="absolute top-6 left-6 z-10 flex flex-col gap-1 px-4 py-2.5 rounded-2xl bg-[#090d16]/85 backdrop-blur-md border border-rose-500/40 text-rose-300 shadow-2xl pointer-events-none transition-transform"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>BEFORE: HAZARD & OUTAGE</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Structural cracks, elevator error E-04, flood puddle
            </div>
          </div>

          {/* Floating Telemetry Badge: RIGHT (RESTORED) */}
          <div 
            className="absolute top-6 right-6 z-10 flex flex-col items-end gap-1 px-4 py-2.5 rounded-2xl bg-[#090d16]/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 shadow-2xl pointer-events-none transition-transform"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span>AFTER: RESTORED & VERIFIED</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-300">
              LED architecture, working lift, verified by student
            </div>
          </div>

          {/* Interaction Instruction Pill */}
          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium flex items-center gap-2 pointer-events-none shadow-lg"
            style={{ transform: 'translateZ(35px)' }}
          >
            <MousePointer className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Drag slider horizontally or scroll page for 3D parallax</span>
          </div>

        </div>

      </div>

    </section>
  )
}

export default SplitExperienceHero
