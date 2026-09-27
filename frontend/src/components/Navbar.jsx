import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  Bell, 
  RotateCcw, 
  ChevronDown, 
  UserCheck, 
  Sparkles,
  Zap,
  Wrench,
  Utensils,
  Wifi,
  Database
} from 'lucide-react'

export default function Navbar({
  currentUser,
  setCurrentUser,
  demoUsers,
  activeRole,
  setActiveRole,
  selectedDepartment,
  setSelectedDepartment,
  departments,
  unreadCount,
  onOpenNotifications,
  onResetSeed,
  supabaseConnected
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const handleSwitchUser = (user) => {
    setCurrentUser(user)
    setActiveRole(user.role)
    if (user.role === 'admin' && user.department_id) {
      setSelectedDepartment(user.department_id)
    }
    setShowUserDropdown(false)
  }

  return (
    <header className="header-glass">
      {/* Brand with Glowing Beacon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="logo-badge"
        >
          <div className="logo-icon-wrap">
            <Building2 size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
                FixMy<span style={{ color: '#38bdf8' }}>Campus</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(59, 130, 246, 0.25)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.45)',
                letterSpacing: '0.05em'
              }}>
                3D DISPATCH
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Closed-Loop Problem Resolution & 3D Telemetry
            </p>
          </div>
        </motion.div>

        {/* Supabase Status Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.25rem 0.7rem',
          borderRadius: '999px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontSize: '0.72rem',
          color: '#34d399'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} className="beacon" />
          <span>Supabase Ready</span>
        </div>
      </div>

      {/* Center Role Toggles with Motion layoutId */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '0.3rem',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-medium)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}>
        <button
          onClick={() => {
            setActiveRole('student')
            const std = demoUsers.find(u => u.role === 'student')
            if (std) setCurrentUser(std)
          }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.15rem',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: activeRole === 'student' ? '#ffffff' : 'var(--text-secondary)',
            background: 'transparent',
            border: 'none',
            zIndex: 1
          }}
        >
          {activeRole === 'student' && (
            <motion.div
              layoutId="activeRoleTab"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.5)',
                zIndex: -1
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <GraduationCap size={17} />
          Student Portal
        </button>

        <button
          onClick={() => {
            setActiveRole('admin')
            const adm = demoUsers.find(u => u.role === 'admin')
            if (adm) {
              setCurrentUser(adm)
              if (adm.department_id) setSelectedDepartment(adm.department_id)
            }
          }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.15rem',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: activeRole === 'admin' ? '#ffffff' : 'var(--text-secondary)',
            background: 'transparent',
            border: 'none',
            zIndex: 1
          }}
        >
          {activeRole === 'admin' && (
            <motion.div
              layoutId="activeRoleTab"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.5)',
                zIndex: -1
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <ShieldCheck size={17} />
          Admin Command Center
        </button>
      </div>

      {/* Right Controls */}
      <div className="nav-controls">
        {/* Reset Demo Seed Data */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onResetSeed}
          title="Reset realistic demo tickets & logs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.04)'
          }}
        >
          <RotateCcw size={14} />
          <span>Reset Demo</span>
        </motion.button>

        {/* Notifications Bell */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onOpenNotifications}
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-medium)',
            color: unreadCount > 0 ? '#60a5fa' : 'var(--text-secondary)'
          }}
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 19,
              height: 19,
              borderRadius: '50%',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
            }}>
              {unreadCount}
            </span>
          )}
        </motion.button>

        {/* Demo Persona Switcher */}
        <div style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-main)'
            }}
          >
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: activeRole === 'admin' ? '#7c3aed' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8rem',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>{currentUser?.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {currentUser?.role === 'admin' 
                  ? `${currentUser.department_id?.replace('_', ' ').toUpperCase() || 'GENERAL'} ADMIN`
                  : `STUDENT (${currentUser?.roll_number})`}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </motion.button>

          {/* Quick Persona Dropdown with AnimatePresence */}
          <AnimatePresence>
            {showUserDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: 280,
                  background: '#0f172a',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
                  padding: '0.5rem',
                  zIndex: 100
                }}
              >
                <div style={{
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em'
                }}>
                  HACKATHON DEMO PERSONAS
                </div>

                {demoUsers.map((user) => (
                  <motion.button
                    whileHover={{ x: 3, background: 'rgba(59, 130, 246, 0.15)' }}
                    key={user.id}
                    onClick={() => handleSwitchUser(user)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.65rem',
                      borderRadius: 'var(--radius-md)',
                      background: currentUser?.id === user.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: currentUser?.id === user.id ? '#60a5fa' : 'var(--text-main)',
                      fontSize: '0.825rem'
                    }}
                  >
                    <div style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: user.role === 'admin' ? '#6d28d9' : '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#ffffff'
                    }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{user.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {user.role === 'student' ? 'Student Desk' : `${user.department_id?.replace('_', ' ')} Admin`}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
