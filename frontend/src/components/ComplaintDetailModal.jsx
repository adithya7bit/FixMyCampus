import React, { useState, useEffect } from 'react'
import { 
  X, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Sparkles, 
  Send, 
  User, 
  Image as ImageIcon,
  Navigation
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { playSuccess, playTick, playAlert } from '../services/soundFx'

export default function ComplaintDetailModal({ 
  complaint, 
  onClose, 
  currentUser, 
  onConfirmFixed, 
  onReopenIssue,
  onAdminUpdate,
  onGetDirections
}) {
  const [reopenReason, setReopenReason] = useState('')
  const [showReopenBox, setShowReopenBox] = useState(false)
  const [adminStatus, setAdminStatus] = useState(complaint.status)
  const [adminNotes, setAdminNotes] = useState(complaint.admin_notes || '')
  const [assignedTo, setAssignedTo] = useState(complaint.assigned_to || '')

  if (!complaint) return null

  const isReporter = currentUser.id === complaint.reporter_id || currentUser.role === 'student'
  const isAdmin = currentUser.role === 'admin'

  const handleConfirmFixed = () => {
    playSuccess()
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (e) {}
    onConfirmFixed(complaint.id, {
      rating: 5,
      note: 'Verified physically fixed in person via ticket inspector.'
    })
  }

  const handleReopen = () => {
    if (!reopenReason.trim()) return
    playAlert()
    onReopenIssue(complaint.id, reopenReason)
    setShowReopenBox(false)
  }

  const handleSaveAdmin = () => {
    playSuccess()
    onAdminUpdate(complaint.id, {
      status: adminStatus,
      admin_notes: adminNotes,
      assigned_to: assignedTo
    })
  }

  // Prevent background scroll while modal is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return (
    <div 
      data-lenis-prevent="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain glass-panel bg-[#0d1322] border-white/15 p-6 sm:p-8 rounded-3xl shadow-2xl focus:outline-none"
      >
        
        {/* Header with Ticket Tag & Close Button */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="mono-tag text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20 font-bold">
              {complaint.ticket_number}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
              {complaint.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Meta Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{complaint.location_building} • {complaint.location_floor} • {complaint.location_room}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{complaint.sla_hours}h Target SLA</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
            {complaint.category}
          </div>

          {onGetDirections && (
            <button
              onClick={() => {
                playTick()
                onGetDirections(complaint)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold transition-all active:scale-95 shadow-sm ml-auto"
              title="View Turn-by-Turn Campus Directions"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Get Directions</span>
            </button>
          )}
        </div>

        {/* Issue Description */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Detailed Issue Report
          </h4>
          <p className="text-sm text-slate-200 bg-white/[0.02] p-4 rounded-2xl border border-white/5 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* Photos (Reported Photo & Resolution Proof) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {complaint.photo_url && (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Student Attachment</span>
              </div>
              <img 
                src={complaint.photo_url} 
                alt="Reported problem" 
                className="w-full h-44 object-cover rounded-2xl border border-white/10 shadow-md"
              />
            </div>
          )}

          {complaint.resolution_photo && (
            <div>
              <div className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Technician Resolution Proof</span>
              </div>
              <img 
                src={complaint.resolution_photo} 
                alt="Resolution proof" 
                className="w-full h-44 object-cover rounded-2xl border border-emerald-500/30 shadow-md"
              />
            </div>
          )}
        </div>

        {/* CLOSED-LOOP VERIFICATION CALLOUT (For Students) */}
        {complaint.status === 'resolved' && (
          <div className="mb-6 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-sm text-emerald-300">
                Action Required: Closed-Loop Verification
              </h4>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Maintenance marked this issue as resolved. Please verify if the physical infrastructure is actually functioning.
            </p>

            {complaint.resolution_notes && (
              <div className="text-xs bg-black/40 p-3 rounded-xl border border-emerald-500/20 text-slate-300 mb-4">
                <strong className="text-emerald-400">Technician Note:</strong> {complaint.resolution_notes}
              </div>
            )}

            {!showReopenBox ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleConfirmFixed}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Fixed (Close Loop)</span>
                </button>
                <button
                  onClick={() => setShowReopenBox(true)}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Still Broken? Reopen</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Explain why the issue is still unresolved (e.g. still leaking, door still jammed)..."
                  className="w-full bg-[#0a0f1d] border border-rose-500/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  rows={2}
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setShowReopenBox(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReopen}
                    className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit & Alert Head</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADMIN DISPATCH CONTROLS (If logged in as admin) */}
        {isAdmin && (
          <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <h4 className="font-bold text-sm text-amber-300 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Admin Dispatch & Work Order Update</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Ticket Status
                </label>
                <select
                  value={adminStatus}
                  onChange={(e) => setAdminStatus(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="pending">Pending Triage</option>
                  <option value="assigned">Assigned to Crew</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Mark Resolved (Awaits Student)</option>
                  <option value="closed">Closed & Archived</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Assign Technician / Contractor
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Technician name..."
                  className="w-full bg-[#0a0f1d] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Internal Maintenance Log & Dispatch Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log parts used, inspection results, or technician ETA..."
                className="w-full bg-[#0a0f1d] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                rows={2}
              />
            </div>

            <button
              onClick={handleSaveAdmin}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              Update Work Order & Notify Student
            </button>
          </div>
        )}

        {/* Audit Trail Timeline */}
        {complaint.updates && complaint.updates.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Live Lifecycle Audit Trail
            </h4>
            <div className="space-y-2.5 border-l-2 border-white/10 pl-4 ml-2">
              {complaint.updates.map((up, idx) => (
                <div key={idx} className="relative text-xs">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-4 ring-[#0d1322]" />
                  <div className="font-semibold text-slate-200">
                    {up.author} • <span className="text-[10px] text-slate-500 font-normal">{new Date(up.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-slate-400 mt-0.5">{up.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
