import React from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Zap, 
  Wrench, 
  Sparkles, 
  Wifi, 
  Utensils, 
  Building 
} from 'lucide-react'

export default function AnalyticsDashboard({ analyticsData, departments }) {
  if (!analyticsData) return null

  const {
    total_complaints,
    resolved_complaints,
    open_complaints,
    escalated_complaints,
    urgent_complaints,
    avg_resolution_time_hours,
    resolution_rate_percent,
    departments: deptBreakdown = {}
  } = analyticsData

  return (
    <div>
      {/* KPI Highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            OVERALL RESOLUTION RATE
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399' }}>
            {resolution_rate_percent}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {resolved_complaints} of {total_complaints} tickets completed
          </div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            AVG RESOLUTION SPEED
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8' }}>
            {avg_resolution_time_hours} <span style={{ fontSize: '1.1rem' }}>hrs</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Across all campus departments
          </div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            CURRENT OPEN TICKETS
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b' }}>
            {open_complaints}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Active in maintenance queues
          </div>
        </div>

        <div className="glass-card" style={{ borderColor: escalated_complaints > 0 ? 'rgba(168, 85, 247, 0.4)' : 'var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d8b4fe', marginBottom: '0.4rem' }}>
            SLA ESCALATION RATE
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#a855f7' }}>
            {escalated_complaints}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Breached target response time
          </div>
        </div>
      </div>

      {/* Department Workload & Performance Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Complaints by Maintenance Department
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Workload distribution, open backlog, and completion percentage per department
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {Object.entries(deptBreakdown).map(([deptId, data]) => {
              const pct = data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0

              return (
                <div key={deptId}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                      {data.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: '#34d399' }}>{data.resolved}</strong> resolved / <strong style={{ color: '#cbd5e1' }}>{data.total}</strong> total ({pct}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #2563eb, #10b981)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* SLA Standards Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Campus SLA Benchmarks
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Enforced Service Level Agreement resolution ceilings
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fca5a5' }}>
                  URGENT / EMERGENCY
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Fire, elevators, electrical hazards, gas leaks
                </div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>
                2 Hours
              </div>
            </div>

            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fdba74' }}>
                  HIGH PRIORITY
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Water leaks, lab power outage, locks broken
                </div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f97316' }}>
                12 Hours
              </div>
            </div>

            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fde047' }}>
                  MEDIUM PRIORITY
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Wi-Fi drops, furniture, routine maintenance
                </div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>
                24 Hours
              </div>
            </div>

            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7dd3fc' }}>
                  LOW PRIORITY
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Cosmetic touchups, minor squeaks
                </div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                48 Hours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
