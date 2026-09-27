import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  UserCheck, 
  CheckCircle2, 
  BarChart3, 
  Map, 
  UtensilsCrossed, 
  Zap, 
  Wrench, 
  Sparkles, 
  Wifi, 
  Building, 
  ShieldAlert,
  ArrowUpDown,
  Filter,
  Check,
  ChevronRight,
  Flame,
  Search,
  RefreshCw
} from 'lucide-react'

// Sub-components
import CampusHeatmap from './CampusHeatmap'
import FoodHygieneModule from './FoodHygieneModule'
import AnalyticsDashboard from './AnalyticsDashboard'

const DEPT_ICONS = {
  electrical: Zap,
  civil_maintenance: Wrench,
  housekeeping: Sparkles,
  it_network: Wifi,
  food_services: UtensilsCrossed,
  hostel: Building,
  security: ShieldAlert
}

export default function AdminDashboard({
  currentUser,
  departments,
  complaints,
  selectedDepartment,
  setSelectedDepartment,
  onSelectComplaint,
  onOpenStatusUpdate,
  onRunEscalation,
  analyticsData,
  heatmapData,
  inspections,
  onRefreshData
}) {
  const [activeTab, setActiveTab] = useState('queue') // 'queue', 'heatmap', 'food_hygiene', 'analytics'
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)

  // Filter complaints for admin queue
  const queueComplaints = complaints.filter(c => {
    // Dept filter
    const matchesDept = selectedDepartment === 'all' || c.department_id === selectedDepartment

    // Status filter
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter

    // Priority filter
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter

    // Search query
    const matchesSearch = !searchQuery || (
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location_building?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reporter_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return matchesDept && matchesStatus && matchesPriority && matchesSearch
  })

  // Priority sorting (Urgent first!)
  const pOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
  const sortedQueue = [...queueComplaints].sort((a, b) => {
    const aP = pOrder[a.priority] ?? 2
    const bP = pOrder[b.priority] ?? 2
    if (aP !== bP) return aP - bP
    return new Date(b.created_at) - new Date(a.created_at)
  })

  const urgentCount = complaints.filter(c => c.priority === 'urgent' && c.status !== 'closed').length
  const escalatedCount = complaints.filter(c => c.status === 'escalated' || c.is_escalated).length

  const handleEscalationTrigger = async () => {
    setIsEscalating(true)
    try {
      const res = await onRunEscalation()
      alert(`SLA Auto-Escalation Engine Executed! ${res.escalated_count} ticket(s) breached SLA and were escalated to Director level.`)
      onRefreshData()
    } catch (err) {
      alert(`Escalation error: ${err.message}`)
    } finally {
      setIsEscalating(false)
    }
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Header and Operational Notice */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(124, 58, 237, 0.25)',
              color: '#d8b4fe',
              border: '1px solid rgba(168, 85, 247, 0.45)',
              letterSpacing: '0.05em'
            }}>
              CAMPUS OPERATIONS COMMAND
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Cross-Department Dispatch & Real-Time Telemetry
            </span>
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Operations Admin Dashboard
          </h1>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleEscalationTrigger}
            disabled={isEscalating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(124, 58, 237, 0.15))',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              color: '#d8b4fe',
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.2)'
            }}
          >
            <Clock size={17} />
            <span>{isEscalating ? 'Evaluating SLAs...' : 'Run SLA Auto-Escalation Engine'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onRefreshData}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)'
            }}
            title="Refresh All Queue & Analytics Data"
          >
            <RefreshCw size={17} />
          </motion.button>
        </div>
      </div>

      {/* SLA Escalation Warning Banner (if breached tickets exist) */}
      <AnimatePresence>
        {escalatedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(239, 68, 68, 0.2))',
              border: '1px solid rgba(168, 85, 247, 0.6)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.15rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 8px 30px rgba(168, 85, 247, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <AlertTriangle size={26} color="#f87171" />
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                  🚨 {escalatedCount} Complaint(s) Breached SLA Response Threshold
                </div>
                <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                  Auto-escalated to Campus Operations Director & Chief Engineer. Immediate dispatch required.
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveTab('queue')
                setStatusFilter('escalated')
              }}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#ef4444',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
              }}
            >
              Filter Escalated Tickets
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Feature Tabs with Motion layoutId */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-medium)',
        marginBottom: '1.75rem',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'queue', label: 'Department Queue', icon: Clock, count: sortedQueue.length },
          { id: 'heatmap', label: 'Campus Problem Heatmap', icon: Map },
          { id: 'food_hygiene', label: 'Food Hygiene Audits', icon: UtensilsCrossed, badge: 'Specialized' },
          { id: 'analytics', label: 'Analytics & SLA Metrics', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.75rem 1.35rem',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
                whiteSpace: 'nowrap',
                zIndex: 1
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="adminTabPill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
                    zIndex: -1
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon size={17} color={isActive ? '#60a5fa' : 'var(--text-muted)'} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '999px',
                  background: isActive ? '#2563eb' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontWeight: 800
                }}>
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span style={{
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  background: 'rgba(245, 158, 11, 0.25)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  fontWeight: 800
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB CONTENT: 1. DEPARTMENT QUEUE */}
      {activeTab === 'queue' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Department Selector Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => setSelectedDepartment('all')}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: selectedDepartment === 'all' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedDepartment === 'all' ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                boxShadow: selectedDepartment === 'all' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
              }}
            >
              All Departments ({complaints.length})
            </button>

            {departments.map((dept) => {
              const Icon = DEPT_ICONS[dept.id] || Building
              const isSelected = selectedDepartment === dept.id
              const countInDept = complaints.filter(c => c.department_id === dept.id).length

              return (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1.1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? '#60a5fa' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-subtle)'
                  }}
                >
                  <Icon size={14} />
                  <span>{dept.name}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.05rem 0.4rem',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff'
                  }}>
                    {countInDept}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Filters Bar */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.1rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search ticket, building, reporter or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.6rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', fontSize: '0.825rem' }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
                <option value="reopened">Reopened</option>
                <option value="closed">Closed</option>
              </select>

              <select
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ width: 'auto', fontSize: '0.825rem' }}
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Queue List with Staggered Motion */}
          {sortedQueue.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: 'var(--radius-xl)',
              border: '1px dashed var(--border-medium)'
            }}>
              <CheckCircle2 size={42} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>No matching complaints in queue</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>All clear or adjust filter parameters.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sortedQueue.map((c) => {
                const isUrgent = c.priority === 'urgent'
                const isEscalated = c.status === 'escalated' || c.is_escalated

                return (
                  <motion.div
                    key={c.id}
                    whileHover={{ scale: 1.01, y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="glass-card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      border: isUrgent 
                        ? '1px solid rgba(239, 68, 68, 0.45)' 
                        : (isEscalated ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid var(--border-subtle)')
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                        <span style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontSize: '0.8rem', 
                          fontWeight: 700, 
                          color: '#38bdf8' 
                        }}>
                          {c.ticket_number}
                        </span>

                        <span className={`badge badge-${c.priority} ${isUrgent ? 'pulse-urgent' : ''}`}>
                          {c.priority}
                        </span>

                        <span className={`badge badge-status-${c.status}`}>
                          {c.status.replace('_', ' ')}
                        </span>

                        {isEscalated && (
                          <span className="badge badge-status-escalated">
                            ⚠️ Auto-Escalated
                          </span>
                        )}

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Dept: <strong style={{ color: '#cbd5e1' }}>{c.category}</strong>
                        </span>
                      </div>

                      <h3 
                        onClick={() => onSelectComplaint(c)}
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          cursor: 'pointer',
                          marginBottom: '0.4rem'
                        }}
                      >
                        {c.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} color="#f97316" />
                          <span>{c.location_building} • {c.location_floor} ({c.location_room})</span>
                        </div>

                        <div>
                          Reported by: <span style={{ color: '#ffffff' }}>{c.reporter_name}</span>
                        </div>

                        {c.assigned_to_name && (
                          <div>
                            Assigned to: <span style={{ color: '#60a5fa' }}>{c.assigned_to_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectComplaint(c)}
                        className="btn-secondary"
                        style={{ fontSize: '0.825rem', padding: '0.55rem 0.95rem' }}
                      >
                        Inspect Details
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onOpenStatusUpdate(c)}
                        className="btn-primary"
                        style={{ fontSize: '0.825rem', padding: '0.55rem 1.15rem' }}
                      >
                        Update / Resolve
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* TAB CONTENT: 2. CAMPUS HEATMAP */}
      {activeTab === 'heatmap' && (
        <CampusHeatmap 
          heatmapData={heatmapData} 
          onSelectComplaintById={(id) => {
            const match = complaints.find(c => c.id === id)
            if (match) onSelectComplaint(match)
          }} 
        />
      )}

      {/* TAB CONTENT: 3. FOOD HYGIENE AUDITS */}
      {activeTab === 'food_hygiene' && (
        <FoodHygieneModule
          currentUser={currentUser}
          inspections={inspections}
          complaints={complaints.filter(c => c.department_id === 'food_services' || c.is_food_hygiene)}
          onRefreshData={onRefreshData}
        />
      )}

      {/* TAB CONTENT: 4. ANALYTICS & SLA PERFORMANCE */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard analyticsData={analyticsData} departments={departments} />
      )}
    </div>
  )
}
