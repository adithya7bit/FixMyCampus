import React from 'react'
import { motion } from 'motion/react'
import { 
  X, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ChevronRight,
  Flame
} from 'lucide-react'

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onSelectComplaintById
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        onClick={(e) => e.stopPropagation()} 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 420,
          background: '#0f172a',
          borderLeft: '1px solid var(--border-medium)',
          boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 150
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={20} color="#60a5fa" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              Notifications & Alerts
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Bell size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <div>No new notifications</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((n) => {
                const isUrgent = n.type === 'urgent_assignment' || n.type === 'escalation'
                const isResolution = n.type === 'resolution_ready'

                return (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) onMarkRead(n.id)
                      if (n.complaint_id) {
                        onSelectComplaintById(n.complaint_id)
                        onClose()
                      }
                    }}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: n.is_read ? 'rgba(255, 255, 255, 0.02)' : (isUrgent ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)'),
                      border: `1px solid ${n.is_read ? 'var(--border-subtle)' : (isUrgent ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)')}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isUrgent ? <Flame size={14} color="#ef4444" /> : (isResolution ? <Sparkles size={14} color="#10b981" /> : <Clock size={14} color="#60a5fa" />)}
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                          {n.title}
                        </span>
                      </div>
                      {!n.is_read && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                      )}
                    </div>

                    <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '0.4rem' }}>
                      {n.message}
                    </p>

                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
