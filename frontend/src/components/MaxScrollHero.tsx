import React, { useEffect, useRef, useState } from 'react'
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Compass, 
  MousePointer, 
  ArrowRight,
  RotateCcw
} from 'lucide-react'
import { playTick, playSuccess } from '../services/soundFx'

interface MaxScrollHeroProps {
  onOpenReport: () => void
  onOpenMap?: () => void
}

export const MaxScrollHero: React.FC<MaxScrollHeroProps> = ({ 
  onOpenReport, 
  onOpenMap
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  // Interactive Slider Percentage (0 to 100)
  const [splitPercent, setSplitPercent] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const hasCelebrated = useRef(false)

  // Non-disturbing 3D Perspective Tilt (Subtle ±4° max, Apple Vision / Linear aesthetic)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Drag and 3D interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    playTick()
    updatePosition(e.clientX)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height

    // Controlled, pleasant 3D tilt
    setTilt({
      x: -(relY - 0.5) * 4.5,
      y: (relX - 0.5) * 4.5
    })
    setGlare({
      x: relX * 100,
      y: relY * 100,
      opacity: 0.14
    })

    if (isDragging) {
      updatePosition(e.clientX)
    }
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
    setIsDragging(false)
    setTilt({ x: 0, y: 0 })
    setGlare(prev => ({ ...prev, opacity: 0 }))
  }

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.min(Math.max((x / rect.width) * 100, 4), 96)
    setSplitPercent(percent)

    // Moving slider to the left reveals more of the fixed/restored side (Right side)
    if (percent <= 20 && !hasCelebrated.current) {
      playSuccess()
      hasCelebrated.current = true
    } else if (percent > 20) {
      hasCelebrated.current = false
    }
  }

  const handlePresetClick = (percent: number) => {
    playTick()
    setSplitPercent(percent)
    if (percent <= 20) playSuccess()
  }

  return (
    <section className="relative w-full pt-4 pb-8 select-none">
      
      {/* Editorial Title & Navigation CTAs */}
      <div className="max-w-3xl mx-auto text-center mb-8 px-4">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Interactive Campus Transformation • Closed Loop</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
          Campus Restored. <br />
          <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
            One Verified Ticket at a Time.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Drag the interactive slider below to reveal the physical impact of closed-loop facilities management: 
          transitioning hazardous failure points into safe, verified university spaces.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all active:scale-95 group"
          >
            <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span>Report Physical Issue</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/15 text-slate-950 font-extrabold uppercase tracking-wider">
              On 3D Map
            </span>
          </button>


          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs sm:text-sm border border-emerald-500/30 transition-all active:scale-95 shadow-sm"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>3D GIS Map (BIT & KPR)</span>
            </button>
          )}
        </div>

      </div>

      {/* Quick Preset Selector */}
      <div className="flex items-center justify-center gap-2 mb-4 text-xs">
        <span className="text-slate-400 font-medium">Quick View:</span>
        <button
          onClick={() => handlePresetClick(85)}
          className={`px-3 py-1 rounded-lg border transition-all ${
            splitPercent >= 75 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold' 
              : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
          }`}
        >
          Before: Outages
        </button>
        <button
          onClick={() => handlePresetClick(50)}
          className={`px-3 py-1 rounded-lg border transition-all ${
            splitPercent > 25 && splitPercent < 75 
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' 
              : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
          }`}
        >
          50 / 50 Split
        </button>
        <button
          onClick={() => handlePresetClick(15)}
          className={`px-3 py-1 rounded-lg border transition-all ${
            splitPercent <= 25 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' 
              : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
          }`}
        >
          After: 100% Fixed
        </button>
      </div>

      {/* 3D Perspective Stage Container */}
      <div 
        className="w-full relative"
        style={{ perspective: '1200px' }}
      >
        <div 
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onMouseEnter={() => setIsHovered(true)}
          onPointerLeave={handlePointerLeave}
          style={{
            transform: isHovered 
              ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-3px)` 
              : 'rotateX(0deg) rotateY(0deg) translateY(0px)',
            transition: isDragging ? 'none' : isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
            transformStyle: 'preserve-3d'
          }}
          className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[580px] rounded-3xl overflow-hidden border-2 border-white/15 bg-[#050811] shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-ew-resize group will-change-transform"
        >
          
          {/* Dynamic Specular Spotlight Glare Overlay */}
          {isHovered && (
            <div 
              className="absolute inset-0 pointer-events-none rounded-3xl z-30 transition-opacity duration-150"
              style={{
                opacity: glare.opacity,
                background: `radial-gradient(circle 500px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.18), transparent 70%)`
              }}
            />
          )}

          {/* BASE LAYER: Full Restored Clean Campus Image (Shows on the RIGHT of the divider) */}
          <img
            src="/campus_restored.jpg"
            alt="Fix My Campus - Restored & Verified State"
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />

          {/* OVERLAY LAYER: Full Damaged Campus Image (Clipped dynamically on the LEFT of the divider) */}
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden select-none"
            style={{
              clipPath: `polygon(0% 0%, ${splitPercent}% 0%, ${splitPercent}% 100%, 0% 100%)`
            }}
          >
            <img
              src="/campus_damaged.jpg"
              alt="Fix My Campus - Damaged & Hazardous Outages"
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Glowing Laser Seam Divider */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#ff2a85] via-white to-[#00f0ff] shadow-[0_0_25px_4px_rgba(0,240,255,0.8)] z-20 pointer-events-none"
            style={{ left: `${splitPercent}%` }}
          >
            {/* Draggable HUD Puck */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-slate-950/95 border-2 border-white shadow-[0_0_25px_rgba(0,240,255,0.9)] flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
              <span className="text-[11px] font-mono font-black text-cyan-400 select-none">
                {Math.round(splitPercent)}%
              </span>
            </div>
          </div>

          {/* Floating Badge Left: BEFORE (HAZARDS) */}
          <div 
            style={{ 
              transform: 'translateZ(20px)',
              opacity: splitPercent < 15 ? 0 : 1,
              transition: 'opacity 0.2s ease'
            }}
            className="absolute top-5 left-5 z-10 flex flex-col gap-1 px-4 py-2.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-rose-500/50 text-rose-300 shadow-2xl pointer-events-none"
          >
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>BEFORE: SEVERE HAZARDS</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">
              Elevator E-04 Halts • Water Pipe Leaks • Exposed Wires
            </div>
          </div>

          {/* Floating Badge Right: AFTER (RESTORED) */}
          <div 
            style={{ 
              transform: 'translateZ(20px)',
              opacity: splitPercent > 85 ? 0 : 1,
              transition: 'opacity 0.2s ease'
            }}
            className="absolute top-5 right-5 z-10 flex flex-col items-end gap-1 px-4 py-2.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-emerald-500/50 text-emerald-300 shadow-2xl pointer-events-none"
          >
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
              <span>AFTER: STUDENT VERIFIED</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-300 font-medium">
              Pristine Daylight • Safe Walkways • 100% Closed Loop
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          <div 
            style={{ transform: 'translateZ(15px)' }}
            className="absolute bottom-4 left-4 right-4 z-10 p-3 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs pointer-events-none"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <Flame className="w-3.5 h-3.5" />
                <span>2-Hour Urgent SLA</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>Autonomous AI Dispatch</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <MousePointer className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Drag slider horizontally to reveal transformation</span>
            </div>
          </div>

        </div>
      </div>

    </section>
  )
}

export default MaxScrollHero
