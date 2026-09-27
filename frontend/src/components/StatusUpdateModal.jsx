import React, { useState } from 'react'
import { motion } from 'motion/react'
import { 
  X, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Camera, 
  FileText, 
  UploadCloud 
} from 'lucide-react'

const RESOLUTION_PHOTO_PRESETS = [
  { label: 'Repaired Wiring', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
  { label: 'Pipe Replaced', url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80' },
  { label: 'Sanitation Complete', url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80' }
]

export default function StatusUpdateModal({
  isOpen,
  onClose,
  complaint,
  currentUser,
  onUpdateStatus
}) {
  const [newStatus, setNewStatus] = useState(complaint?.status || 'in_progress')
  const [assignedStaff, setAssignedStaff] = useState(complaint?.assigned_to_name || currentUser?.name || '')
  const [note, setNote] = useState('')
  const [resolutionNote, setResolutionNote] = useState('')
  const [resolutionPhoto, setResolutionPhoto] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen || !complaint) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        status: newStatus,
        changed_by_name: currentUser?.name || 'Department Admin',
        changed_by_role: 'admin',
        note: note.trim() || `Status updated to ${newStatus.replace('_', ' ')}`,
        assigned_to_name: assignedStaff.trim() || undefined,
        assigned_to_id: currentUser?.id || undefined,
        resolution_note: newStatus === 'resolved' ? resolutionNote.trim() : undefined,
        resolution_photo: newStatus === 'resolved' ? (resolutionPhoto.trim() || undefined) : undefined
      }

      await onUpdateStatus(complaint.id, payload)
      onClose()
    } catch (err) {
      alert(`Status update error: ${err.message}`)
    } finally {
      setSubmitting(false)
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
        style={{ maxWidth: 600 }}
      >
        <div className="modal-header">
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#60a5fa' }}>
              {complaint.ticket_number}
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Update Ticket Status & Dispatch
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Issue summary */}
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                {complaint.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                📍 {complaint.location_building} ({complaint.location_room})
              </div>
            </div>

            {/* Target Status */}
            <div className="form-group">
              <label className="form-label">New Status</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="assigned">Assigned (Technician Allocated)</option>
                <option value="in_progress">In Progress (Work Underway)</option>
                <option value="resolved">Resolved (Completed & Ready for Verification)</option>
                <option value="closed">Closed (Archived)</option>
              </select>
            </div>

            {/* Assigned Staff */}
            <div className="form-group">
              <label className="form-label">Assigned Technician / Lead Staff</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Marcus Vance (Senior Electrical Engineer)"
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
              />
            </div>

            {/* If marking Resolved, require Resolution Note & Photo */}
            {newStatus === 'resolved' && (
              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginBottom: '0.75rem' }}>
                  Resolution Details (Required for Student Verification)
                </div>

                <div className="form-group">
                  <label className="form-label">Resolution Work Summary *</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Describe parts replaced, safety checks performed, and test results..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Resolution Proof Photo URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Paste image URL of completed repair..."
                    value={resolutionPhoto}
                    onChange={(e) => setResolutionPhoto(e.target.value)}
                  />

                  {/* Quick Photo Presets */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
                    {RESOLUTION_PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setResolutionPhoto(p.url)}
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: resolutionPhoto === p.url ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          color: resolutionPhoto === p.url ? '#34d399' : 'var(--text-secondary)'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* General Log Note */}
            <div className="form-group">
              <label className="form-label">Audit Log Comment</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Valve isolated; spare parts requisitioned from Central Store"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Commit Status Update'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
