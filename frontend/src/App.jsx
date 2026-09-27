import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import StudentDashboard from './components/StudentDashboard'
import AdminDashboard from './components/AdminDashboard'
import ReportComplaintModal from './components/ReportComplaintModal'
import ComplaintDetailModal from './components/ComplaintDetailModal'
import StatusUpdateModal from './components/StatusUpdateModal'
import NotificationDrawer from './components/NotificationDrawer'
import { api } from './services/api'
import { isSupabaseConfigured } from './services/supabase'
import './App.css'

export default function App() {
  // Core application state
  const [currentUser, setCurrentUser] = useState(null)
  const [demoUsers, setDemoUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [complaints, setComplaints] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [heatmapData, setHeatmapData] = useState([])
  const [inspections, setInspections] = useState([])
  const [notifications, setNotifications] = useState([])

  // UI state
  const [activeRole, setActiveRole] = useState('student') // 'student' | 'admin'
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [complaintToUpdate, setComplaintToUpdate] = useState(null)
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch initial system data
  const loadData = async () => {
    try {
      setLoading(true)
      const [depts, users, comps, analytics, heatmap, insps, notifs] = await Promise.all([
        api.getDepartments(),
        api.getDemoUsers(),
        api.getComplaints(),
        api.getAnalytics(),
        api.getCampusHeatmap(),
        api.getFoodInspections(),
        api.getNotifications()
      ])

      setDepartments(depts)
      setDemoUsers(users)
      setComplaints(comps)
      setAnalyticsData(analytics)
      setHeatmapData(heatmap)
      setInspections(insps)
      setNotifications(notifs)

      // Set initial user to student if not yet set
      if (!currentUser && users.length > 0) {
        setCurrentUser(users[0])
      }
    } catch (err) {
      console.error('Data initialization error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Complaint lifecycle handlers
  const handleComplaintCreated = (newTicket) => {
    setComplaints(prev => [newTicket, ...prev])
    // Reload analytics and heatmap
    api.getAnalytics().then(setAnalyticsData)
    api.getCampusHeatmap().then(setHeatmapData)
  }

  const handleVerifyResolution = async (id, data) => {
    const updated = await api.verifyResolution(id, data)
    setComplaints(prev => prev.map(c => c.id === id ? updated : c))
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint(updated)
    }
    api.getAnalytics().then(setAnalyticsData)
    api.getCampusHeatmap().then(setHeatmapData)
  }

  const handleUpdateStatus = async (id, data) => {
    const updated = await api.updateStatus(id, data)
    setComplaints(prev => prev.map(c => c.id === id ? updated : c))
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint(updated)
    }
    api.getAnalytics().then(setAnalyticsData)
    api.getCampusHeatmap().then(setHeatmapData)
  }

  const handleUpvote = async (id) => {
    const userId = currentUser?.id || 'std-001'
    const res = await api.upvoteComplaint(id, userId)
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        const upvoter_ids = c.upvoter_ids || []
        const hasUpvoted = upvoter_ids.includes(userId)
        const updatedIds = hasUpvoted
          ? upvoter_ids.filter(u => u !== userId)
          : [...upvoter_ids, userId]
        return {
          ...c,
          upvotes: res.upvotes,
          upvoter_ids: updatedIds
        }
      }
      return c
    }))
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint(prev => ({
        ...prev,
        upvotes: res.upvotes,
        upvoter_ids: prev.upvoter_ids?.includes(userId)
          ? prev.upvoter_ids.filter(u => u !== userId)
          : [...(prev.upvoter_ids || []), userId]
      }))
    }
  }

  const handleRunEscalation = async () => {
    const res = await api.runEscalation()
    await loadData()
    return res
  }

  const handleResetSeed = async () => {
    if (window.confirm('Reset demo state to default sample tickets and food audits?')) {
      await api.resetDemoData()
      await loadData()
    }
  }

  const handleMarkNotificationRead = async (id) => {
    await api.markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const unreadNotifs = notifications.filter(n => !n.is_read).length

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        demoUsers={demoUsers}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        departments={departments}
        unreadCount={unreadNotifs}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
        onResetSeed={handleResetSeed}
        supabaseConnected={isSupabaseConfigured}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ fontSize: '0.9rem' }}>Initializing FixMyCampus Command Systems...</p>
            </div>
          </div>
        ) : activeRole === 'student' ? (
          <StudentDashboard
            currentUser={currentUser}
            complaints={complaints}
            onOpenReportModal={() => setReportModalOpen(true)}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            onVerifyResolution={handleVerifyResolution}
            onSwitchToAdmin={() => setActiveRole('admin')}
            analyticsData={analyticsData}
          />
        ) : (
          <AdminDashboard
            currentUser={currentUser}
            departments={departments}
            complaints={complaints}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            onOpenStatusUpdate={(c) => {
              setComplaintToUpdate(c)
              setStatusModalOpen(true)
            }}
            onRunEscalation={handleRunEscalation}
            analyticsData={analyticsData}
            heatmapData={heatmapData}
            inspections={inspections}
            onRefreshData={loadData}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <ReportComplaintModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        currentUser={currentUser}
        onComplaintCreated={handleComplaintCreated}
        onUpvoteExisting={handleUpvote}
      />

      <ComplaintDetailModal
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        complaint={selectedComplaint}
        currentUser={currentUser}
        activeRole={activeRole}
        onVerifyResolution={handleVerifyResolution}
        onUpvote={handleUpvote}
        onOpenStatusUpdate={(c) => {
          setComplaintToUpdate(c)
          setStatusModalOpen(true)
        }}
      />

      <StatusUpdateModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false)
          setComplaintToUpdate(null)
        }}
        complaint={complaintToUpdate}
        currentUser={currentUser}
        onUpdateStatus={handleUpdateStatus}
      />

      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onSelectComplaintById={(id) => {
          const match = complaints.find(c => c.id === id)
          if (match) setSelectedComplaint(match)
        }}
      />
    </div>
  )
}
