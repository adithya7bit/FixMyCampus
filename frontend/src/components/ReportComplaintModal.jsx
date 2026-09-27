import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  Sparkles, 
  UploadCloud, 
  Camera, 
  CheckCircle2, 
  ThumbsUp, 
  Flame, 
  Clock, 
  Layers,
  ArrowRight
} from 'lucide-react'
import { api } from '../services/api'

const BUILDINGS = [
  'Engineering Block A',
  'Science Center',
  'Central Library',
  'Main Cafeteria & Dining Hall',
  'Hostel Block 4',
  'Hostel Block 2',
  'Lecture Hall Complex'
]

const FLOORS = [
  'Basement',
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  'Terrace / Roof'
]

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Water Leak', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=600&q=80' },
  { label: 'Electrical Wiring', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80' },
  { label: 'Broken Furniture', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80' },
  { label: 'Food Hygiene Concern', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' }
]

export default function ReportComplaintModal({
  isOpen,
  onClose,
  currentUser,
  onComplaintCreated,
  onUpvoteExisting
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [building, setBuilding] = useState(BUILDINGS[0])
  const [floor, setFloor] = useState(FLOORS[1])
  const [room, setRoom] = useState('')
  const [locationDetails, setLocationDetails] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [isEmergency, setIsEmergency] = useState(false)

  // AI Classification state
  const [aiClassification, setAiClassification] = useState(null)
  const [isClassifying, setIsClassifying] = useState(false)

  // Duplicate detection state
  const [duplicateMatches, setDuplicateMatches] = useState([])
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Debounced AI classification and duplicate check
  useEffect(() => {
    if (!title || title.length < 5) {
      setAiClassification(null)
      setDuplicateMatches([])
      return
    }

    const timer = setTimeout(async () => {
      // 1. Run AI classification
      try {
        setIsClassifying(true)
        const aiRes = await api.classifyComplaint(title, description)
        setAiClassification(aiRes)
        if (aiRes.is_urgent) {
          setIsEmergency(true)
        }
      } catch (err) {
        console.error('AI classification error:', err)
      } finally {
        setIsClassifying(false)
      }

      // 2. Check for duplicates
      try {
        setIsCheckingDuplicates(true)
        const dupRes = await api.checkDuplicates({
          title,
          description,
          location_building: building,
          location_floor: floor,
          location_room: room
        })
        if (dupRes.has_duplicate) {
          setDuplicateMatches(dupRes.duplicates)
        } else {
          setDuplicateMatches([])
        }
      } catch (err) {
        console.error('Duplicate check error:', err)
      } finally {
        setIsCheckingDuplicates(false)
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [title, description, building, floor, room])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    setSubmitting(true)
    try {
      const payload = {
        reporter_id: currentUser?.id || 'std-001',
        reporter_name: currentUser?.name || 'Alex Rivera',
        reporter_email: currentUser?.email || 'alex.rivera@campus.edu',
        title: title.trim(),
        description: description.trim(),
        category: aiClassification?.category || 'General Maintenance',
        department_id: aiClassification?.department_id || 'civil_maintenance',
        priority: isEmergency ? 'urgent' : (aiClassification?.priority || 'medium'),
        location_building: building,
        location_floor: floor,
        location_room: room.trim() || 'General Area',
        location_details: locationDetails.trim(),
        attachments: attachmentUrl ? [attachmentUrl] : [],
        is_food_hygiene: Boolean(aiClassification?.is_food_hygiene)
      }

      const newTicket = await api.createComplaint(payload)
      onComplaintCreated(newTicket)
      onClose()
    } catch (err) {
      alert(`Failed to submit complaint: ${err.message}`)
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
        style={{ maxWidth: 680 }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Report Campus Issue</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Closed-loop resolution tracked directly with department admins
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '0.3rem', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Issue Title / Summary *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Elevator stuck between 2nd and 3rd floor with alarm sounding"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* In-App Location Picker (Structured Selector: Building -> Floor -> Room) */}
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-medium)',
              marginBottom: '1.25rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#60a5fa',
                marginBottom: '0.75rem'
              }}>
                <MapPin size={15} />
                <span>IN-APP CAMPUS LOCATION PICKER (NO QR CODES REQUIRED)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Building / Facility</label>
                  <select
                    className="form-select"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                  >
                    {BUILDINGS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Floor</label>
                  <select
                    className="form-select"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                  >
                    {FLOORS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label className="form-label">Room / Lab / Wing</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Room 304, East Washroom, Lab 3"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Landmark / Specific Spot</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Near Staircase B or Fire Exit"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe what is broken, visible hazards, how long it has been occurring..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Live AI Classification Preview Badge */}
            {aiClassification && (
              <div className="ai-detect-banner">
                <Sparkles size={18} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#93c5fd' }}>
                      AI AUTO-ROUTER CLASSIFICATION
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {Math.round(aiClassification.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-status-assigned">
                      Dept: {aiClassification.department_name}
                    </span>
                    <span className={`badge badge-${aiClassification.priority}`}>
                      Priority: {aiClassification.priority.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      ⏱️ SLA: {aiClassification.sla_hours}h target resolution
                    </span>
                    {aiClassification.is_food_hygiene && (
                      <span className="badge badge-high">
                        🍽️ Food Hygiene Module Flagged
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                    {aiClassification.reasoning}
                  </p>
                </div>
              </div>
            )}

            {/* Live Duplicate Detection Alert Banner */}
            {duplicateMatches.length > 0 && (
              <div className="duplicate-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={18} color="#f59e0b" />
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fbbf24' }}>
                    SIMILAR COMPLAINT ALREADY REPORTED NEAR THIS LOCATION!
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#fde68a', marginBottom: '0.75rem' }}>
                  A similar open issue exists in {duplicateMatches[0].location}. Rather than filing a duplicate ticket, you can upvote it to increase its priority queue position.
                </p>

                <div style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#ffffff' }}>
                      [{duplicateMatches[0].ticket_number}] {duplicateMatches[0].title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Status: {duplicateMatches[0].status.toUpperCase()} • Upvotes: {duplicateMatches[0].upvotes}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onUpvoteExisting(duplicateMatches[0].complaint_id)
                      onClose()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#000000',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}
                  >
                    <ThumbsUp size={14} />
                    Upvote & Close
                  </button>
                </div>
              </div>
            )}

            {/* Photo / Evidence Upload */}
            <div className="form-group">
              <label className="form-label">Photo / Video Evidence Attachment</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="url"
                  className="form-input"
                  placeholder="Paste image URL or choose sample preset below..."
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                />
              </div>

              {/* Presets for fast hackathon demo testing */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
                {SAMPLE_PHOTO_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setAttachmentUrl(p.url)}
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: attachmentUrl === p.url ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: attachmentUrl === p.url ? '#60a5fa' : 'var(--text-secondary)'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {attachmentUrl && (
                <div style={{ marginTop: '0.6rem', position: 'relative', width: 90, height: 60, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
                  <img src={attachmentUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            {/* Fast-Track Emergency Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: isEmergency ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: isEmergency ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-subtle)',
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Flame size={20} color={isEmergency ? '#ef4444' : '#94a3b8'} />
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: isEmergency ? '#fca5a5' : 'var(--text-main)' }}>
                    Immediate Life / Safety Risk (Fast-Track SLA: 2 Hours)
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Flags ticket with critical flashing priority and alerts Dean & Department Chief immediately
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#ef4444' }}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className={isEmergency ? 'btn-urgent' : 'btn-primary'}
              disabled={submitting || !title.trim()}
            >
              {submitting ? 'Transmitting Ticket...' : (isEmergency ? 'Submit Fast-Track Emergency' : 'Submit Complaint')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
