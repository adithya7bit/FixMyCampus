import React, { useState, useEffect } from 'react'
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Camera, 
  Sparkles, 
  Star, 
  RotateCcw, 
  ShieldCheck, 
  MessageSquare,
  ThumbsUp,
  FileCheck,
  Building2,
  Send
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { playSuccess, playTick, playAlert } from '../services/soundFx'
import type { Complaint, UserPersona } from '../types/index'

interface StudentVerificationModalProps {
  complaint: Complaint | null
  currentUser: UserPersona
  onClose: () => void
  onConfirmFixed: (id: string, feedback?: { rating: number; note: string }) => void
  onReopenIssue: (id: string, reason: string) => void
}

export const StudentVerificationModal: React.FC<StudentVerificationModalProps> = ({
  complaint,
  currentUser,
  onClose,
  onConfirmFixed,
  onReopenIssue
}) => {
  const [activeTab, setActiveTab] = useState<'verify' | 'reopen'>('verify')
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [verificationNote, setVerificationNote] = useState('Inspected in person. Facility is working normally and the area is clean.')
  const [reopenReason, setReopenReason] = useState('')
  
  // Physical Inspection Checklist items
  const [checks, setChecks] = useState({
    functional: true,
    safeAndClean: true,
    physicallyTested: true
  })

  // Prevent background scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  if (!complaint) return null

  const handleCheckboxChange = (key: keyof typeof checks) => {
    playTick()
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleApprove = () => {
    playSuccess()
    // Celebrate with confetti explosion
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      })
    } catch (e) {
      // fallback safe
    }

    onConfirmFixed(complaint.id, {
      rating,
      note: verificationNote.trim() || 'Verified physical repair.'
    })
    onClose()
  }

  const handleReject = () => {
    if (!reopenReason.trim()) return
    playAlert()
    onReopenIssue(complaint.id, reopenReason.trim())
    onClose()
  }

  const allChecksPassed = checks.functional && checks.safeAndClean && checks.physicallyTested

  return (
    <div 
      data-lenis-prevent="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div 
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto overscroll-contain bg-[#0c1220] border border-emerald-500/30 p-5 sm:p-7 rounded-3xl shadow-2xl shadow-emerald-500/10 focus:outline-none"
      >
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        {/* Modal Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Closed-Loop Student Verification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Physical Inspection & Sign-Off
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Verify whether campus technicians completed the repair to physical standard before this ticket can be closed.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Snapshot Card */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-5 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="mono-tag text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/25 font-bold text-xs">
              {complaint.ticket_number}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Reported by {complaint.reporter_name}
            </span>
          </div>

          <h3 className="text-base font-bold text-white mb-2">
            {complaint.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{complaint.location_building} • {complaint.location_floor} • {complaint.location_room}</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-medium">
              Technician: {complaint.assigned_to || 'Assigned Crew'}
            </div>
          </div>
        </div>

        {/* Before & After Photo Comparison */}
        <div className="mb-5 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Photographic Evidence Comparison</span>
            </span>
            <span className="text-[11px] text-slate-400">Before & After Repair</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Before (Student Report) */}
            <div className="relative rounded-2xl overflow-hidden border border-rose-500/30 bg-black/40 group">
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/40 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                Reported Hazard
              </div>
              <img 
                src={complaint.photo_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'} 
                alt="Original Damage"
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-2.5 bg-[#0e1424] text-[11px] text-slate-400 border-t border-rose-500/20 truncate">
                Initial condition reported
              </div>
            </div>

            {/* After (Crew Resolution Proof) */}
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-black/40 group">
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Crew Work Proof</span>
              </div>
              <img 
                src={complaint.resolution_photo || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80'} 
                alt="Resolved State"
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-2.5 bg-[#0e1424] text-[11px] text-emerald-300/90 border-t border-emerald-500/20 truncate">
                {complaint.resolution_notes || 'Crew replaced damaged parts and re-tested'}
              </div>
            </div>
          </div>
        </div>

        {/* Technician Log Callout */}
        {complaint.resolution_notes && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 relative z-10">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Operations Maintenance Note</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              "{complaint.resolution_notes}"
            </p>
          </div>
        )}

        {/* Verification Action Mode Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#090d17] border border-white/10 mb-4 relative z-10">
          <button
            type="button"
            onClick={() => { playTick(); setActiveTab('verify') }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'verify'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25 scale-[1.01]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Sign-Off</span>
          </button>

          <button
            type="button"
            onClick={() => { playTick(); setActiveTab('reopen') }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'reopen'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/25 scale-[1.01]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Still Defective (Reopen)</span>
          </button>
        </div>

        {/* TAB 1: CONFIRM AND SIGN-OFF */}
        {activeTab === 'verify' && (
          <div className="space-y-4 relative z-10 animate-in fade-in duration-150">
            
            {/* Student Physical Inspection Checklist */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 block mb-1">
                Student Physical Verification Checklist:
              </span>

              <label 
                onClick={() => handleCheckboxChange('functional')}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-black/30 hover:bg-black/50 border border-white/5 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox" 
                  checked={checks.functional}
                  onChange={() => {}}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-white/20 focus:ring-0 cursor-pointer accent-emerald-500"
                />
                <span className="text-xs text-slate-200">
                  Infrastructure is physically functional (e.g. water flows normally, elevator operates smoothly, lights work).
                </span>
              </label>

              <label 
                onClick={() => handleCheckboxChange('safeAndClean')}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-black/30 hover:bg-black/50 border border-white/5 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox" 
                  checked={checks.safeAndClean}
                  onChange={() => {}}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-white/20 focus:ring-0 cursor-pointer accent-emerald-500"
                />
                <span className="text-xs text-slate-200">
                  The immediate area is safe, cleared of debris, and poses zero hazard to students.
                </span>
              </label>

              <label 
                onClick={() => handleCheckboxChange('physicallyTested')}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-black/30 hover:bg-black/50 border border-white/5 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox" 
                  checked={checks.physicallyTested}
                  onChange={() => {}}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-white/20 focus:ring-0 cursor-pointer accent-emerald-500"
                />
                <span className="text-xs text-slate-200">
                  I have personally inspected or used the repaired facility on campus.
                </span>
              </label>
            </div>

            {/* Satisfaction Rating */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Maintenance Workmanship Rating:
                </label>
                <span className="text-xs text-amber-400 font-bold">
                  {rating} of 5 Stars
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => { playTick(); setRating(star) }}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star 
                      className={`w-6 h-6 transition-colors ${
                        (hoverRating || rating) >= star 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-slate-600'
                      }`} 
                    />
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-2">
                  {rating === 5 ? 'Excellent & prompt resolution' : rating >= 4 ? 'Good repair' : 'Acceptable'}
                </span>
              </div>
            </div>

            {/* Verification Note */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Student Verification Remark:
              </label>
              <textarea
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                placeholder="Add your observation on the repair quality..."
                className="w-full bg-[#111728] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                rows={2}
              />
            </div>

            {/* Sign-Off Action Button */}
            <button
              type="button"
              onClick={handleApprove}
              disabled={!allChecksPassed}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Physical Fix & Close Work Order</span>
            </button>
            {!allChecksPassed && (
              <p className="text-[11px] text-amber-400/90 text-center">
                Please check all three verification criteria before signing off.
              </p>
            )}
          </div>
        )}

        {/* TAB 2: REOPEN AND ESCALATE */}
        {activeTab === 'reopen' && (
          <div className="space-y-4 relative z-10 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1 text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Notice: Escalating Defective Repair</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                If the infrastructure was not properly fixed or is still hazardous, submitting this will automatically reopen the work order, bump its priority, and send an urgent alert to the Operations Supervisor.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Why is the issue still unresolved? (Required)
              </label>
              <textarea
                required
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="Describe what you observed in person (e.g., 'Water is still leaking around the base joint', 'Elevator still making grinding sound on floor 2')..."
                className="w-full bg-[#111728] border border-rose-500/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                rows={3}
              />
            </div>

            <button
              type="button"
              onClick={handleReject}
              disabled={!reopenReason.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-500/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reject Repair & Reopen Escalation</span>
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default StudentVerificationModal
