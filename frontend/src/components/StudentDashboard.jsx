import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ThumbsUp, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Inbox
} from 'lucide-react'
import Campus3DHero from './Campus3DHero'
import ComplaintCard from './ComplaintCard'

export default function StudentDashboard({
  currentUser,
  complaints,
  onOpenReportModal,
  onSelectComplaint,
  onVerifyResolution,
  onSwitchToAdmin,
  analyticsData
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, resolved, closed
  const [priorityFilter, setPriorityFilter] = useState('all')

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    // Matches search
    const matchesSearch = !searchTerm || (
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location_building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Matches status
    let matchesStatus = true
    if (statusFilter === 'active') {
      matchesStatus = ['pending', 'assigned', 'in_progress', 'reopened', 'escalated'].includes(c.status)
    } else if (statusFilter === 'needs_verification') {
      matchesStatus = c.status === 'resolved'
    } else if (statusFilter === 'closed') {
      matchesStatus = c.status === 'closed'
    }

    // Matches priority
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Quick stats calculations
  const totalReported = complaints.length
  const activeCount = complaints.filter(c => ['pending', 'assigned', 'in_progress', 'reopened', 'escalated'].includes(c.status)).length
  const needsVerificationCount = complaints.filter(c => c.status === 'resolved').length
  const closedCount = complaints.filter(c => c.status === 'closed').length

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>
      {/* 3D WEBGL HERO SECTION */}
      <Campus3DHero
        currentUser={currentUser}
        activeRole="student"
        onOpenReportModal={onOpenReportModal}
        onSwitchToAdmin={onSwitchToAdmin}
        totalComplaints={totalReported}
        openComplaints={activeCount}
        avgResolutionTime={analyticsData?.avg_resolution_time_hours || 4.2}
      />

      {/* Verification Alert Callout (If fixes are ready for confirmation) */}
      <AnimatePresence>
        {needsVerificationCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem 1.75rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.25)',
                border: '1px solid rgba(16, 185, 129, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}>
                <Sparkles size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#34d399' }}>
                  {needsVerificationCount} Completed Repair(s) Require Student Verification
                </div>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  The maintenance department completed these tickets. Test the fix and confirm resolution to close the loop!
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatusFilter('needs_verification')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              Verify Fixes Now <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <motion.div whileHover={{ y: -3 }} className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>TOTAL COMPLAINTS</span>
            <Inbox size={18} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
            {totalReported}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            Campus problems logged
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card" style={{ borderColor: activeCount > 0 ? 'rgba(59, 130, 246, 0.35)' : 'var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#60a5fa', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>IN PROGRESS / ACTIVE</span>
            <Clock size={18} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            Under active repair
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card" style={{ borderColor: needsVerificationCount > 0 ? 'rgba(16, 185, 129, 0.45)' : 'var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#34d399', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>AWAITING VERIFICATION</span>
            <Sparkles size={18} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
            {needsVerificationCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            Ready for student confirmation
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>CLOSED & VERIFIED</span>
            <CheckCircle2 size={18} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
            {closedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            Closed loop complete
          </div>
        </motion.div>
      </div>

      {/* Search and Filters Bar with Smooth Motion layoutId */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.1rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by issue title, building, floor, room or ticket number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.6rem', fontSize: '0.92rem' }}
          />
        </div>

        {/* Filter Pills with layoutId */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
          {[
            { id: 'all', label: 'All Issues' },
            { id: 'active', label: 'Active Repairs' },
            { id: 'needs_verification', label: 'Needs Verification' },
            { id: 'closed', label: 'Closed' }
          ].map((tab) => {
            const isSelected = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  position: 'relative',
                  fontSize: '0.825rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  background: 'transparent',
                  border: 'none',
                  zIndex: 1
                }}
              >
                {isSelected && (
                  <motion.div
                    layoutId="studentFilterPill"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                {tab.label}
              </button>
            )
          })}

          {/* Priority Filter */}
          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Complaints List with 3D Tilt Cards & Staggered Motion */}
      {filteredComplaints.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--border-medium)'
          }}
        >
          <AlertCircle size={46} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
            No complaints match the criteria
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Try adjusting your search query or clear the active filter tags.
          </p>
          <button onClick={onOpenReportModal} className="btn-primary">
            <PlusCircle size={18} /> Report an Issue
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filteredComplaints.map((c) => (
            <motion.div key={c.id} variants={itemVariants}>
              <ComplaintCard
                complaint={c}
                onSelect={onSelectComplaint}
                onVerify={onVerifyResolution}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
