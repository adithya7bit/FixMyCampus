import React, { useState } from 'react'
import { 
  X, 
  Navigation, 
  MapPin, 
  Clock, 
  Compass, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  Share2, 
  AlertTriangle, 
  Building2, 
  Layers,
  Sparkles,
  Radio
} from 'lucide-react'
import { playSuccess, playTick } from '../services/soundFx'
import type { Complaint } from '../types/index'

interface DispatchDirectionsModalProps {
  complaint: Complaint | null
  onClose: () => void
  onOpenMap?: () => void
}

export const DispatchDirectionsModal: React.FC<DispatchDirectionsModalProps> = ({
  complaint,
  onClose,
  onOpenMap
}) => {
  const [copied, setCopied] = useState(false)
  const [originPoint, setOriginPoint] = useState<'depot' | 'main_gate' | 'hostel'>('depot')

  if (!complaint) return null

  // Calculate mock distance and walking steps based on origin
  const originDetails = {
    depot: {
      name: 'Facilities Command Depot (Ground Central)',
      distanceMeters: 280,
      walkTimeMin: 3.5,
      buggyTimeMin: 1.2,
      steps: [
        `Depart Facilities Command Hub via Central Service Lane North (80m).`,
        `Turn right at Innovation Courtyard toward ${complaint.location_building} (120m).`,
        `Enter through East Ground Ramp (Service & Equipment accessible).`,
        `Proceed to ${complaint.location_floor || 'Level 1'} via Freight Elevator B or Stairwell 2.`,
        `Arrive at ${complaint.location_room || 'Designated Zone'}. Report to on-site faculty/reporter.`
      ]
    },
    main_gate: {
      name: 'Main Campus Security Gate (South Entrance)',
      distanceMeters: 450,
      walkTimeMin: 5.5,
      buggyTimeMin: 2.0,
      steps: [
        `Pass Security Guard Post 1 onto University Grand Avenue (180m).`,
        `Follow roundabout clockwise toward Academic North Ring (150m).`,
        `Arrive at ${complaint.location_building} main passenger entrance (120m).`,
        `Take main passenger lobby lifts to ${complaint.location_floor || 'Floor 1'}.`,
        `Navigate hallway to room ${complaint.location_room || 'site'}.`
      ]
    },
    hostel: {
      name: 'Hostel Quadrangle Service Substation',
      distanceMeters: 340,
      walkTimeMin: 4.0,
      buggyTimeMin: 1.5,
      steps: [
        `Exit Hostel Quad Service bay along West Pathway (100m).`,
        `Cross sports complex perimeter walkway toward ${complaint.location_building} (140m).`,
        `Access West Facilities doorway via staff badge scanner.`,
        `Ascend to ${complaint.location_floor || 'Floor 1'} via Service Stairwell C.`,
        `Target incident: ${complaint.location_room || 'Room'}.`
      ]
    }
  }[originPoint]

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${complaint.lat || 11.4965},${complaint.lng || 77.2765}&travelmode=walking`

  const handleCopyCoordinates = () => {
    const text = `DISPATCH ROUTE: Ticket ${complaint.ticket_number}\nLocation: ${complaint.location_building} (${complaint.location_floor || ''} - ${complaint.location_room || ''})\nGPS: ${complaint.lat || 11.4965}, ${complaint.lng || 77.2765}\nPriority: ${complaint.priority.toUpperCase()} (${complaint.sla_hours}h SLA)`
    navigator.clipboard.writeText(text)
    playSuccess()
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleOpen3DMap = () => {
    playTick()
    onClose()
    if (onOpenMap) {
      onOpenMap()
    }
  }

  // Lock body scroll while directions modal is mounted
  React.useEffect(() => {
    const origBody = document.body.style.overflow
    const origHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBody
      document.documentElement.style.overflow = origHtml
    }
  }, [])

  return (
    <div 
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain glass-panel bg-[#0d1322] border-cyan-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl focus:outline-none"
      >
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[15px] flex items-center justify-center">
                <Navigation className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="mono-tag text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25 font-bold text-[11px]">
                  {complaint.ticket_number}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CREW DISPATCH ROUTE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Directions to Incident Site
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destination Target Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-[#101728] to-transparent border border-cyan-500/30 mb-5 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-cyan-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Target Facility Destination</span>
              </div>
              <h3 className="text-base font-bold text-white">
                {complaint.location_building}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {complaint.location_floor || 'Level 1'} • {complaint.location_room || 'Reported Zone'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                complaint.priority === 'urgent' 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {complaint.priority} • {complaint.sla_hours}h SLA
              </span>
            </div>
          </div>
        </div>

        {/* Departure Origin Selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-400 block mb-2">
            Select Crew Departure Origin:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => { playTick(); setOriginPoint('depot') }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                originPoint === 'depot'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
              }`}
            >
              <div className="text-[10px] uppercase text-cyan-400">Depot (Recommended)</div>
              <div className="truncate text-white font-medium">Facilities Command</div>
            </button>

            <button
              onClick={() => { playTick(); setOriginPoint('main_gate') }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                originPoint === 'main_gate'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
              }`}
            >
              <div className="text-[10px] uppercase text-amber-400">Main Entrance</div>
              <div className="truncate text-white font-medium">Security Gate South</div>
            </button>

            <button
              onClick={() => { playTick(); setOriginPoint('hostel') }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                originPoint === 'hostel'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
              }`}
            >
              <div className="text-[10px] uppercase text-emerald-400">Residential</div>
              <div className="truncate text-white font-medium">Hostel Substation</div>
            </button>
          </div>
        </div>

        {/* Route Metrics (Walking vs Buggy) */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <div className="text-[10px] text-slate-400 font-medium mb-1">Route Distance</div>
            <div className="text-xl font-black text-white font-mono">{originDetails.distanceMeters}m</div>
            <div className="text-[10px] text-slate-500">Paved path</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <div className="text-[10px] text-slate-400 font-medium mb-1">Walking ETA</div>
            <div className="text-xl font-black text-cyan-400 font-mono">~{originDetails.walkTimeMin} min</div>
            <div className="text-[10px] text-slate-500">Foot crew</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <div className="text-[10px] text-slate-400 font-medium mb-1">Maintenance Buggy</div>
            <div className="text-xl font-black text-emerald-400 font-mono">~{originDetails.buggyTimeMin} min</div>
            <div className="text-[10px] text-slate-500">Electric cart</div>
          </div>
        </div>

        {/* Turn-by-Turn Waypoints */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Turn-by-Turn Campus Navigation
            </h4>
            <span className="text-[11px] text-cyan-400 font-medium">
              Elevator B Accessible
            </span>
          </div>

          <div className="space-y-3 bg-[#0a0f1d] p-4 rounded-2xl border border-white/10">
            {originDetails.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-slate-300 leading-relaxed">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCoordinates}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Dispatch Notes'}</span>
            </button>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Maps GPS</span>
            </a>
          </div>

          {onOpenMap && (
            <button
              onClick={handleOpen3DMap}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-95 ml-auto"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Open in 3D Campus GIS Map →</span>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default DispatchDirectionsModal
