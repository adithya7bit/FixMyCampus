import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { 
  MapPin, 
  Clock, 
  ThumbsUp, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle 
} from 'lucide-react'

export default function ComplaintCard({ complaint, onSelect, onVerify }) {
  const ref = useRef(null)

  // 3D Tilt Motion Values
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 })
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg'])

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const isUrgent = complaint.priority === 'urgent'
  const isResolved = complaint.status === 'resolved'
  const isEscalated = complaint.status === 'escalated' || complaint.is_escalated

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(complaint)}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        cursor: 'pointer'
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="glass-card"
    >
      <div style={{ transform: 'translateZ(20px)' }}>
        {/* Top Meta Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.1)',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(56, 189, 248, 0.25)'
          }}>
            {complaint.ticket_number}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className={`badge badge-${complaint.priority} ${isUrgent ? 'pulse-urgent' : ''}`}>
              {complaint.priority}
            </span>
            <span className={`badge badge-status-${complaint.status}`}>
              {complaint.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '0.5rem',
          lineHeight: 1.35
        }}>
          {complaint.title}
        </h3>

        {/* Description snippet */}
        <p style={{
          fontSize: '0.825rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {complaint.description}
        </p>

        {/* Auto-escalated Alert Tag */}
        {isEscalated && (
          <div style={{
            padding: '0.35rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            color: '#d8b4fe',
            fontSize: '0.72rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <AlertTriangle size={13} color="#a855f7" />
            <span>⚠️ SLA Breached: Escalated to Director</span>
          </div>
        )}

        {/* Resolution Banner */}
        {isResolved && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: [1, 1.02, 1], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              color: '#34d399',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} />
              <span>Fix Ready: Verify & Close</span>
            </div>
            <ChevronRight size={15} />
          </motion.div>
        )}

        {/* Footer Meta */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={13} color="#f97316" />
            <span style={{ maxWidth: 180, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {complaint.location_building}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ThumbsUp size={12} color="#60a5fa" />
              <span style={{ fontWeight: 600, color: '#cbd5e1' }}>{complaint.upvotes || 1}</span>
            </div>
            <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
