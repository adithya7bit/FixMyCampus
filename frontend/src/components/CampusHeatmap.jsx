import React, { useState } from 'react'
import { 
  Building2, 
  AlertTriangle, 
  Flame, 
  ShieldAlert, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  Compass,
  ArrowUpRight
} from 'lucide-react'
import { CAMPUS_BUILDINGS } from '../services/mockData'
import { playTick } from '../services/soundFx'

export default function CampusHeatmap({ 
  complaints = [],
  onSelectComplaint,
  onOpenMap
}) {
  const [selectedBuilding, setSelectedBuilding] = useState(CAMPUS_BUILDINGS[0])

  // Count open issues per building
  const getBuildingStats = (buildingName) => {
    const list = complaints.filter(c => c.location_building === buildingName)
    const active = list.filter(c => c.status !== 'closed')
    const urgent = list.filter(c => c.priority === 'urgent' && c.status !== 'closed')
    return {
      total: list.length,
      active: active.length,
      urgent: urgent.length,
      issues: list
    }
  }

  const getRiskColor = (activeCount, urgentCount) => {
    if (urgentCount > 0) return 'border-rose-500/50 bg-rose-500/15 text-rose-300 shadow-sm shadow-rose-500/20'
    if (activeCount >= 2) return 'border-amber-500/50 bg-amber-500/15 text-amber-300'
    return 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
  }

  const selectedStats = getBuildingStats(selectedBuilding.name)

  const handleSelectBuilding = (b) => {
    playTick()
    setSelectedBuilding(b)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-[#0d1322] to-transparent">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>Campus Problem Density Heatmap</span>
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              GEOSPATIAL STRESS INDEX
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Real-time failure hotspots and infrastructure stress across Bannari Amman & KPR campus facilities.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-slate-300">Urgent Hazard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Active Issues</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Nominal</span>
          </div>
        </div>
      </div>

      {/* Grid of Campus Buildings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CAMPUS_BUILDINGS.map(b => {
          const stats = getBuildingStats(b.name)
          const isSelected = selectedBuilding.id === b.id

          return (
            <div
              key={b.id}
              onClick={() => handleSelectBuilding(b)}
              className={`p-1 rounded-2xl transition-all cursor-pointer group active:scale-[0.985] ${
                isSelected 
                  ? 'bg-gradient-to-tr from-indigo-500/30 to-cyan-500/30 ring-2 ring-indigo-500/60 shadow-xl shadow-indigo-500/10' 
                  : 'bg-white/[0.03] ring-1 ring-white/10 hover:ring-white/20'
              }`}
            >
              <div className="bg-[#0b101c]/95 rounded-[calc(1rem-2px)] p-4 sm:p-5 flex flex-col justify-between h-full border border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-300" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRiskColor(stats.active, stats.urgent)}`}>
                    {stats.urgent > 0 ? 'Hazard Alert' : `${stats.active} Active Issues`}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mb-1 group-hover:text-indigo-300 transition-colors">{b.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{b.floors.length} Floors Monitored</p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Total Logged: <strong className="text-white font-mono">{stats.total}</strong></span>
                  {stats.urgent > 0 && (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 animate-pulse" />
                      <span>{stats.urgent} Urgent</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Drill-down Drawer for Selected Building */}
      {selectedBuilding && (
        <div className="glass-panel p-6 rounded-3xl border-white/15 bg-[#0d1322]/95 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Sector Audit: {selectedBuilding.name}</span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Stress Density: {selectedStats.active}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Physical telemetry and verified incidents registered for this structure</p>
            </div>

            {onOpenMap && (
              <button
                onClick={() => onOpenMap(selectedBuilding)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all active:scale-95 shrink-0"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Locate on 3D GIS Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {selectedStats.issues.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <span className="font-medium text-slate-300">All building infrastructure nominal. Zero open tickets registered for this zone!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedStats.issues.map(iss => (
                <div 
                  key={iss.id} 
                  onClick={() => onSelectComplaint && onSelectComplaint(iss)}
                  className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center justify-between gap-4 text-xs group"
                >
                  <div>
                    <div className="font-bold text-white group-hover:text-cyan-300 transition-colors mb-0.5">{iss.title}</div>
                    <div className="text-slate-400 text-[11px]">{iss.location_floor} • {iss.location_room}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="mono-tag text-slate-400 text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5">{iss.status}</span>
                    <span className="font-bold text-cyan-300 font-mono text-[11px]">{iss.sla_hours}h SLA</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
