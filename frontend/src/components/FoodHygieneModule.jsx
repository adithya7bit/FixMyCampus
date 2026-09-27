import React, { useState, useEffect } from 'react'
import { 
  UtensilsCrossed, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  PlusCircle, 
  FileText, 
  Clock, 
  Award,
  ChevronDown
} from 'lucide-react'
import { api } from '../services/api'

export default function FoodHygieneModule({ currentUser, inspections, complaints, onRefreshData }) {
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [checklistSchema, setChecklistSchema] = useState([])
  const [facilityName, setFacilityName] = useState('Main Dining Hall (Mess A)')
  const [inspectorName, setInspectorName] = useState(currentUser?.name || 'Dr. Sarah Lin (Chief Health Officer)')
  const [notes, setNotes] = useState('')
  const [correctiveActions, setCorrectiveActions] = useState('')
  const [checklistAnswers, setChecklistAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch standard checklist items from backend
  useEffect(() => {
    api.getFoodChecklistItems()
      .then(items => {
        setChecklistSchema(items)
        // Initialize all as checked true by default
        const init = {}
        items.forEach(it => { init[it.id] = true })
        setChecklistAnswers(init)
      })
      .catch(err => console.error('Failed to load checklist schema:', err))
  }, [])

  // Calculate live score
  const calculateLiveScore = () => {
    let score = 0
    checklistSchema.forEach(item => {
      if (checklistAnswers[item.id]) {
        score += item.weight
      }
    })
    return score
  }

  const currentScore = calculateLiveScore()
  const currentGrade = currentScore >= 90 ? 'A (Excellent)' : (currentScore >= 75 ? 'B (Satisfactory)' : (currentScore >= 60 ? 'C (Warning Issued)' : 'F (Critical Violation)'))
  const gradeColor = currentScore >= 75 ? '#10b981' : (currentScore >= 60 ? '#f59e0b' : '#ef4444')

  const toggleChecklistItem = (id) => {
    setChecklistAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleAuditSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.submitFoodInspection({
        facility_name: facilityName,
        inspector_name: inspectorName,
        checklist: checklistAnswers,
        notes: notes.trim(),
        corrective_actions: correctiveActions.trim()
      })
      setShowAuditModal(false)
      setNotes('')
      setCorrectiveActions('')
      onRefreshData()
      alert('Food safety inspection audit logged successfully!')
    } catch (err) {
      alert(`Audit submission error: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24'
          }}>
            <UtensilsCrossed size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'rgba(245, 158, 11, 0.25)', color: '#fde68a' }}>
                SPECIALIZED INSPECTION MODULE
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Food Safety & Dining Quality Standard</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              Campus Food Safety & Hygiene Command
            </h2>
          </div>
        </div>

        <button
          onClick={() => setShowAuditModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.4rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#000000',
            fontWeight: 700,
            fontSize: '0.9rem',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
          }}
        >
          <PlusCircle size={18} />
          Log Hygiene Audit Inspection
        </button>
      </div>

      {/* Grid: Active Food Reports + Recent Audits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Active Food Complaints */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
            Flagged Food Hygiene Complaints ({complaints.length})
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Issues reported by students regarding mess food quality, cafeteria hygiene, or water coolers
          </p>

          {complaints.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No food hygiene complaints currently open.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {complaints.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>
                        {c.ticket_number}
                      </span>
                      <span className={`badge badge-${c.priority}`}>
                        {c.priority}
                      </span>
                      <span className={`badge badge-status-${c.status}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    📍 {c.location_building} ({c.location_room})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log History */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
            Official Health Audit Log ({inspections.length})
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Historical inspection records, sanitary grades, and corrective actions
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {inspections.map((insp) => (
              <div
                key={insp.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-medium)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    {insp.facility_name}
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: insp.score >= 75 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: insp.score >= 75 ? '#34d399' : '#f87171',
                    border: `1px solid ${insp.score >= 75 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                  }}>
                    {insp.score}/100 • {insp.grade}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Inspector: <strong style={{ color: '#ffffff' }}>{insp.inspector_name}</strong> • {new Date(insp.inspection_date).toLocaleDateString()}
                </div>

                {insp.notes && (
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    <strong>Findings:</strong> {insp.notes}
                  </p>
                )}

                {insp.corrective_actions && (
                  <div style={{
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#fde68a'
                  }}>
                    <strong>Directives:</strong> {insp.corrective_actions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Inspection Modal Dialog */}
      {showAuditModal && (
        <div className="modal-overlay" onClick={() => setShowAuditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UtensilsCrossed size={20} color="#fbbf24" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                  Conduct Formal Food Safety Audit
                </h3>
              </div>
              <button onClick={() => setShowAuditModal(false)} style={{ color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAuditSubmit}>
              <div className="modal-body">
                {/* Live Score Gauge Banner */}
                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: `1px solid ${gradeColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      REAL-TIME WEIGHTED AUDIT SCORE
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: gradeColor }}>
                      {currentScore} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ 100</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      COMPLIANCE RATING
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: gradeColor }}>
                      {currentGrade}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Dining Facility / Kitchen Location</label>
                  <select
                    className="form-select"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                  >
                    <option value="Main Dining Hall (Mess A)">Main Dining Hall (Mess A)</option>
                    <option value="Hostel 4 Cafeteria">Hostel 4 Cafeteria</option>
                    <option value="Central Library Kiosk">Central Library Kiosk</option>
                    <option value="Science Block Food Court">Science Block Food Court</option>
                  </select>
                </div>

                {/* Inspection Checklist */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Mandatory Sanitary Checklist Items</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {checklistSchema.map((item) => {
                      const isPassed = checklistAnswers[item.id]
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleChecklistItem(item.id)}
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderRadius: 'var(--radius-md)',
                            background: isPassed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            border: isPassed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: isPassed ? '#ffffff' : '#fca5a5' }}>
                              {item.label} ({item.weight} pts)
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {item.description}
                            </div>
                          </div>

                          <div style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: isPassed ? '#10b981' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.75rem'
                          }}>
                            {isPassed ? '✓' : '✕'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Inspection Findings & Observations</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="e.g. Cold storage temperatures verified at 3.5°C; fly curtain needs motor repair..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Corrective Directives / Immediate Actions</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="e.g. Retrain staff on probe calibration; reinspection in 24 hours..."
                    value={correctiveActions}
                    onChange={(e) => setCorrectiveActions(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAuditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Audit Record...' : 'Log Official Inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
