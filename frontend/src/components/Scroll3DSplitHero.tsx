import React, { useEffect, useRef, useState } from 'react'
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Droplets, 
  Zap, 
  MousePointerClick 
} from 'lucide-react'

interface Scroll3DSplitHeroProps {
  onOpenReport: () => void
}

export const Scroll3DSplitHero: React.FC<Scroll3DSplitHeroProps> = ({ onOpenReport }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [sliderPos, setSliderPos] = useState(50) // 0 to 100%
  const [isDragging, setIsDragging] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0) // 0 to 1

  // Track scroll position to create scroll-driven 3D tilt & zoom
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate how far the section has scrolled through viewport
      const total = rect.height + windowHeight
      const current = windowHeight - rect.top
      const progress = Math.min(Math.max(current / total, 0), 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Dragging logic for the split curtain
  const handlePointerDown = () => setIsDragging(true)
  const handlePointerUp = () => setIsDragging(false)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.min(Math.max((x / rect.width) * 100, 5), 95)
    setSliderPos(percent)
  }

  // 3D Motion transforms driven by scroll
  const tiltX = (scrollProgress - 0.5) * 18 // Rotate from -9deg to +9deg
  const tiltY = (sliderPos - 50) * 0.15 // Mouse drag tilts along Y
  const scale = 1 + (scrollProgress * 0.08) // Slight cinematic zoom
  const translateY = (scrollProgress - 0.5) * -30 // Parallax shift

  return (
    <div 
      className="relative w-full mb-16 select-none"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      
      {/* Top Value Headline */}
      <div className="text-center max-w-3xl mx-auto mb-8 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Interactive 3D Motion Transformation • Drag or Scroll</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          One Campus. <br />
          <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
            Broken to Fixed.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
          Hover, drag the interactive neon curtain, or scroll down to watch the campus physically transform 
          from hazardous infrastructure to student-verified excellence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Report Campus Issue</span>
          </button>

        </div>
      </div>

      {/* 3D Perspective Stage Container */}
      <div 
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="relative w-full aspect-[16/9] max-h-[580px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl cursor-ew-resize bg-[#04060a]"
        style={{
          perspective: '1200px',
        }}
      >
        
        {/* 3D Moving Canvas Layer */}
        <div 
          className="w-full h-full relative transition-transform duration-100 ease-out"
          style={{
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale}) translateY(${translateY}px)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Complete Base Image (Right Side / Full Split) */}
          <img
            src="/campus_split.jpg"
            alt="Campus Before and After"
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {/* Left Curtain Overlay (Reveals Damaged Side with Clip Path) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: `polygon(0% 0%, ${sliderPos}% 0%, ${sliderPos}% 100%, 0% 100%)`
            }}
          >
            {/* Red / Dark Hazard Vignette on the damaged side */}
            <div className="absolute inset-0 bg-rose-950/20 mix-blend-overlay pointer-events-none" />
          </div>

          {/* Neon Divider Line down the split */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#00f0ff] via-white to-[#ff2a85] shadow-[0_0_20px_4px_rgba(0,240,255,0.8)] z-20 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            {/* Center Handle Puck */}
            <div 
              onPointerDown={handlePointerDown}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-950 border-2 border-white shadow-[0_0_20px_rgba(0,240,255,1)] flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-0.5 text-cyan-400">
                <span className="text-xs font-black">◀</span>
                <span className="text-xs font-black">▶</span>
              </div>
            </div>
          </div>

          {/* Floating Telemetry Badge Left (DAMAGED) */}
          <div 
            className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 px-4 py-2.5 rounded-2xl bg-[#07090e]/85 backdrop-blur-md border border-rose-500/40 text-rose-300 shadow-2xl transition-transform duration-300 pointer-events-none"
            style={{ transform: 'translateZ(35px)' }}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>BEFORE: SEVERE DAMAGE</span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Elevator halted, water pipe burst, live sparks</span>
            </div>
          </div>

          {/* Floating Telemetry Badge Right (FIXED) */}
          <div 
            className="absolute top-6 right-6 z-10 flex flex-col items-end gap-1.5 px-4 py-2.5 rounded-2xl bg-[#07090e]/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 shadow-2xl transition-transform duration-300 pointer-events-none"
            style={{ transform: 'translateZ(35px)' }}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span>AFTER: STUDENT VERIFIED</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <span>Nominal pressure, modern LED lighting, verified</span>
              <Zap className="w-3 h-3 text-cyan-400" />
            </div>
          </div>

          {/* Interactive Hint Indicator */}
          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-2 pointer-events-none"
            style={{ transform: 'translateZ(40px)' }}
          >
            <MousePointerClick className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>Drag slider or scroll down for 3D depth tilt</span>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Scroll3DSplitHero
