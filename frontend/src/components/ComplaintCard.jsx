import React, { useState } from 'react'
import { 
  Clock, 
  MapPin, 
  ThumbsUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight,
  Camera,
  Layers
} from 'lucide-react'
import { playUpvote, playTick } from '../services/soundFx'

export default function ComplaintCard({ 
  complaint, 
  onSelect, 
  onUpvote, 
  currentUser,
  onVerify 
}) {
  const [upvoted, setUpvoted] = useState(false)
  
  // Non-disturbing 3D Spotlight Tilt (Apple / Linear style)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    // Gentle ±5 degree maximum tilt
    setRotate({
      x: -(y - 0.5) * 7,
      y: (x - 0.5) * 7
    })
    setGlarePos({ x: x * 100, y: y * 100 })
  }

  const handleCardMouseLeave = () => {
    setIsHovered(false)
    setRotate({ x: 0, y: 0 })
  }

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10'
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      case 'medium':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40'
    }
  }

  const getStatusBadge = (s) => {
    switch (s) {
      case 'resolved':
        return 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40'
      case 'assigned':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40'
      case 'closed':
        return 'bg-slate-800/60 text-slate-400 border-slate-700/60'
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    }
  }

  const handleUpvoteClick = (e) => {
    e.stopPropagation()
    playUpvote()
    if (!upvoted) {
      setUpvoted(true)
      onUpvote(complaint.id)
    }
  }

  const handleCardClick = () => {
    playTick()
    onSelect(complaint)
  }

  return (
    /* Outer Shell with 3D Spatial Tilt & Glare */
    <div 
      onClick={handleCardClick}
      onMouseMove={handleCardMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleCardMouseLeave}
      style={{
        perspective: '1000px',
        transform: isHovered 
          ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-4px)` 
          : 'rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out'
      }}
      className="p-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-cyan-500/40 hover:bg-cyan-500/[0.04] cursor-pointer group active:scale-[0.985] shadow-lg shadow-black/40 relative overflow-hidden will-change-transform"
    >
      {/* Specular Spotlight Glare */}
      {isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-150 z-20"
          style={{
            background: `radial-gradient(circle 220px at ${glarePos.x}% ${glarePos.y}%, rgba(6, 182, 212, 0.14), transparent 75%)`
          }}
        />
      )}

      {/* Inner Core with Spatial Depth */}
      <div 
        className="bg-[#0b101c]/95 rounded-[calc(1rem-2px)] p-4 sm:p-5 flex flex-col justify-between h-full border border-white/5 group-hover:border-cyan-500/20 transition-all relative z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        
        {/* Top Meta Bar */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="mono-tag text-cyan-400 font-bold text-[11px] bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/25">
              {complaint.ticket_number}
            </span>
            <div className="flex items-center gap-1.5">
              {complaint.photo_url && (
                <span title="Evidence Photo Attached" className="p-1 rounded bg-white/5 text-slate-400 border border-white/5">
                  <Camera className="w-3 h-3 text-cyan-400" />
                </span>
              )}
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadge(complaint.priority)}`}>
                {complaint.priority}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(complaint.status)}`}>
                {complaint.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors mb-2 line-clamp-2 leading-snug">
            {complaint.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* Verification Notice Banner if in resolved state */}
        {complaint.status === 'resolved' && (
          <div className="mb-4 p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/35 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold text-emerald-300">
                Repair Completed
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                playTick()
                if (onVerify) {
                  onVerify(complaint)
                } else {
                  onSelect(complaint)
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all active:scale-95"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Verify Fix</span>
            </button>
          </div>
        )}

        {/* Footer Meta */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate max-w-[190px]">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate text-slate-300 font-medium">{complaint.location_building}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono text-[11px] text-slate-400">{complaint.sla_hours}h SLA</span>
            </div>

            <button
              onClick={handleUpvoteClick}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all active:scale-95 ${
                upvoted 
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20' 
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title="Upvote / Mark Affected"
            >
              <ThumbsUp className={`w-3 h-3 ${upvoted ? 'fill-cyan-300 text-cyan-300' : ''}`} />
              <span className="font-bold text-[11px]">{complaint.upvotes + (upvoted ? 1 : 0)}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
