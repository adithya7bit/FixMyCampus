import React, { useState } from 'react'
import { motion } from 'motion/react'
import { 
  X, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ThumbsUp, 
  Share2, 
  ShieldAlert, 
  User, 
  Calendar,
  MessageSquare,
  Sparkles,
  Camera,
  RotateCcw,
  Check
} from 'lucide-react'
import confetti from 'canvas-confetti'

export default function ComplaintDetailModal({
  isOpen,
  onClose,
  complaint,
  currentUser,
  activeRole,
  onVerifyResolution,
  onUpvote,
  onOpenStatusUpdate
}) {
  const [reopenMode, setReopenMode] = useState(false)
  const [reopenReason, setReopenReason] = useState('')
  const [confirmationNote, setConfirmationNote] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen || !complaint) return null

  const isReporter = currentUser?.id === complaint.reporter_id || activeRole === 'student'
  const isResolved = complaint.status === 'resolved'
  const isEscalated = complaint.status === 'escalated' || complaint.is_escalated
  const hasUpvoted = complaint.upvoter_ids?.includes(currentUser?.id)

  const handleConfirmFix = async () => {
    setIsProcessing(true)
    try {
      await onVerifyResolution(complaint.id, {
        action: 'confirm',
        verified_by_name: currentUser?.name || 'Alex Rivera',
        note: confirmationNote.trim() || 'Verified by student: Physical issue satisfactorily inspected and repaired.'
      })

      // Celebration Confetti!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      })
      onClose()
    } catch (err) {
      alert(`Error verifying resolution: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReopen = async (e) => {
    e.preventDefault()
    if (!reopenReason.trim()) return

    setIsProcessing(true)
    try {
      await onVerifyResolution(complaint.id, {
        action: 'reopen',
        verified_by_name: currentUser?.name || 'Alex Rivera',
        reopen_reason: reopenReason.trim()
      })
      setReopenMode(false)
      onClose()
    } catch (err) {
      alert(`Error reopening ticket: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 740 }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(56, 189, 248, 0.25)'
            }}>
              {complaint.ticket_number}
            </span>

            <span className={`badge badge-${complaint.priority}`}>
              {complaint.priority} priority
            </span>

            <span className={`badge badge-status-${complaint.status}`}>
              {complaint.status.replace('_', ' ')}
            </span>

            {isEscalated && (
              <span className="badge badge-status-escalated">
                ⚠️ SLA Breached (Auto-Escalated)
              </span>
            )}
          </div>

          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Title & Description */}
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
            {complaint.title}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={14} color="#60a5fa" />
              <span>Reported by: <strong style={{ color: '#ffffff' }}>{complaint.reporter_name}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} color="#f97316" />
              <span>{complaint.location_building} ({complaint.location_floor} - {complaint.location_room})</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={14} color="#94a3b8" />
              <span>{new Date(complaint.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            marginBottom: '1.25rem'
          }}>
            {complaint.description}
          </div>

          {/* Photo Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                ATTACHED EVIDENCE ({complaint.attachments.length})
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {complaint.attachments.map((img, idx) => (
                  <div key={idx} style={{
                    width: 140,
                    height: 100,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-medium)',
                    position: 'relative'
                  }}>
                    <img src={img} alt="Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Resolution Note & Proof */}
          {complaint.resolution_note && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#34d399', fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.35rem' }}>
                <CheckCircle2 size={16} />
                <span>OFFICIAL RESOLUTION NOTE (By {complaint.assigned_to_name || 'Department Admin'})</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                {complaint.resolution_note}
              </p>

              {complaint.resolution_photo && (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img 
                    src={complaint.resolution_photo} 
                    alt="Resolution Proof" 
                    style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.4)' }} 
                  />
                  <span style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>Verified Repair Photo Attached</span>
                </div>
              )}
            </div>
          )}

          {/* CLOSED LOOP: STUDENT RESOLUTION VERIFICATION PANEL */}
          {isResolved && (
            <div className="verification-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Sparkles size={20} color="#10b981" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
                  Action Required: Verify Resolution (Closed-Loop)
                </h3>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                The department has marked this problem as resolved. As the student who reported it, you hold the authority to close this ticket or reopen it if the fix is inadequate.
              </p>

              {!reopenMode ? (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleConfirmFix}
                    disabled={isProcessing}
                    className="btn-success"
                    style={{ flex: 1 }}
                  >
                    <Check size={16} />
                    Confirm Fixed (Close Ticket)
                  </button>

                  <button
                    onClick={() => setReopenMode(true)}
                    disabled={isProcessing}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      padding: '0.6rem 1.2rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <RotateCcw size={16} />
                    Reopen (Still Broken)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReopen} style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" style={{ color: '#fca5a5' }}>
                    Why is this issue still unresolved? *
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="e.g. The leak started dripping again after 20 minutes, floor remains slippery..."
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    required
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setReopenMode(false)}
                      disabled={isProcessing}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-urgent"
                      disabled={isProcessing || !reopenReason.trim()}
                    >
                      Submit Reopen Reason
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Reopen Warning Banner */}
          {complaint.status === 'reopened' && complaint.reopen_reason && (
            <div style={{
              padding: '0.9rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <RotateCcw size={15} />
                <span>TICKET REOPENED BY STUDENT</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#fecaca' }}>
                "{complaint.reopen_reason}"
              </p>
            </div>
          )}

          {/* Upvote & Community Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => onUpvote(complaint.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: hasUpvoted ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: hasUpvoted ? '1px solid #3b82f6' : '1px solid var(--border-medium)',
                  color: hasUpvoted ? '#60a5fa' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.825rem'
                }}
              >
                <ThumbsUp size={15} />
                <span>{hasUpvoted ? 'Upvoted' : 'Upvote Issue'}</span>
                <span style={{
                  padding: '0.1rem 0.4rem',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  fontSize: '0.75rem'
                }}>
                  {complaint.upvotes || 1}
                </span>
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {complaint.upvotes || 1} student(s) confirmed this issue
              </span>
            </div>

            {activeRole === 'admin' && (
              <button
                onClick={() => {
                  onClose()
                  onOpenStatusUpdate(complaint)
                }}
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
              >
                Update Status / Assign
              </button>
            )}
          </div>

          {/* STATUS HISTORY TIMELINE */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.04em' }}>
              AUDIT TIMELINE & STATUS LIFECYCLE
            </h4>

            <div className="timeline">
              {(complaint.history || []).map((step, idx) => (
                <div key={idx} className="timeline-item">
                  <div className={`timeline-dot ${step.status === 'escalated' ? 'escalated' : (step.status === 'resolved' || step.status === 'closed' ? 'resolved' : '')}`} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge badge-status-${step.status}`}>
                        {step.status.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                        {step.changed_by_name} ({step.changed_by_role})
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(step.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.2rem' }}>
                    {step.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
