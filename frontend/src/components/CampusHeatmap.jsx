import React, { useState } from 'react'
import { 
  MapPin, 
  AlertTriangle, 
  Flame, 
  Layers, 
  Building2, 
  ChevronRight, 
  ShieldCheck, 
  Clock 
} from 'lucide-react'

export default function CampusHeatmap({ heatmapData, onSelectComplaintById }) {
  const [selectedBuilding, setSelectedBuilding] = useState(heatmapData[0]?.building || 'Engineering Block A')

  const currentBuilding = heatmapData.find(b => b.building === selectedBuilding) || heatmapData[0]

  const getHeatColor = (level) => {
    switch (level) {
      case 'critical': return '#ef4444' // Red
      case 'warning': return '#f97316'  // Orange
      case 'moderate': return '#f59e0b' // Yellow
      default: return '#10b981'         // Green
    }
  }

  const getHeatGlow = (level) => {
    switch (level) {
      case 'critical': return 'rgba(239, 68, 68, 0.4)'
      case 'warning': return 'rgba(249, 115, 22, 0.35)'
      case 'moderate': return 'rgba(245, 158, 11, 0.3)'
      default: return 'rgba(16, 185, 129, 0.25)'
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Visual Interactive Campus Blueprint Map */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Campus Problem Density Heatmap
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Spot recurring infrastructure failure hotspots across university grounds
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Critical
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }} /> Warning
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Normal
            </div>
          </div>
        </div>

        {/* Campus Map Graphic Area */}
        <div style={{
          position: 'relative',
          height: 420,
          background: 'radial-gradient(circle at center, #111e38 0%, #0a1020 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-medium)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.6)'
        }}>
          {/* Subtle Grid Lines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />

          {/* Campus Zones Watermark */}
          <div style={{ position: 'absolute', top: 15, left: 20, fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.15)', letterSpacing: '0.1em' }}>
            NORTH ACADEMIC QUADRANGLE
          </div>
          <div style={{ position: 'absolute', bottom: 15, right: 20, fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.15)', letterSpacing: '0.1em' }}>
            SOUTH RESIDENTIAL COMMONS
          </div>

          {/* Interactive Building Nodes */}
          {heatmapData.map((item) => {
            const isSelected = selectedBuilding === item.building
            const heatColor = getHeatColor(item.heat_level)
            const heatGlow = getHeatGlow(item.heat_level)

            return (
              <div
                key={item.building}
                onClick={() => setSelectedBuilding(item.building)}
                style={{
                  position: 'absolute',
                  left: `${item.coords.x}%`,
                  top: `${item.coords.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: isSelected ? 20 : 10,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Heat Ring / Pulse */}
                <div style={{
                  position: 'relative',
                  width: isSelected ? 58 : 46,
                  height: isSelected ? 58 : 46,
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? '#1e293b' : 'rgba(15, 23, 42, 0.9)',
                  border: `2px solid ${heatColor}`,
                  boxShadow: `0 0 20px ${heatGlow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {item.urgent_complaints > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 6px #ef4444'
                    }}>
                      !
                    </span>
                  )}
                  <Building2 size={isSelected ? 20 : 16} color={heatColor} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ffffff' }}>
                    {item.total_complaints}
                  </span>
                </div>

                {/* Building Name Tag */}
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  background: 'rgba(0, 0, 0, 0.75)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  {item.building}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Building Details Breakdown */}
      {currentBuilding && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.75rem'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {currentBuilding.zone}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                {currentBuilding.building}
              </h3>
            </div>

            <span className={`badge badge-${currentBuilding.heat_level === 'critical' ? 'urgent' : (currentBuilding.heat_level === 'warning' ? 'high' : 'low')}`}>
              {currentBuilding.heat_level} heat
            </span>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.6rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Issues</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{currentBuilding.total_complaints}</div>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.6rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Open / Active</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa' }}>{currentBuilding.open_complaints}</div>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.6rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Urgent Flares</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f87171' }}>{currentBuilding.urgent_complaints}</div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Primary Failure Category: <strong style={{ color: '#ffffff' }}>{currentBuilding.top_category}</strong>
          </div>

          {/* Complaints list in this building */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              ACTIVE COMPLAINTS IN THIS BUILDING
            </div>

            {currentBuilding.complaints.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No active complaints reported in this building.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 260, overflowY: 'auto' }}>
                {currentBuilding.complaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectComplaintById(c.id)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#93c5fd' }}>
                          {c.ticket_number}
                        </span>
                        <span className={`badge badge-${c.priority}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                          {c.priority}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {c.floor}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#ffffff' }}>
                        {c.title}
                      </div>
                    </div>

                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
