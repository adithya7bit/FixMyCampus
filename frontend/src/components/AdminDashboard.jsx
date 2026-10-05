import React, { useState } from 'react'
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  CheckCircle2, 
  Search, 
  Filter, 
  Flame, 
  ArrowUpRight,
  Sparkles,
  Navigation,
  Wrench,
  Check
} from 'lucide-react'
import TiltCard from './TiltCard'
import { playTick, playSuccess } from '../services/soundFx'

const CAMPUS_WORKERS = [
  { name: 'Ramesh Kumar', role: 'Plumbing & Pipe Specialist' },
  { name: 'Marcus Vance', role: 'Chief Electrician' },
  { name: 'Suresh Babu', role: 'IT & Digital Infrastructure' },
  { name: 'Elena Rostova', role: 'Facilities Operations' },
  { name: 'Housekeeping Crew', role: 'Sanitation' }
]

export default function AdminDashboard({ 
  complaints = [], 
  currentUser, 
  onSelectComplaint,
  onGetDirections,
  onAdminUpdate
}) {
  const [departmentFilter, setDepartmentFilter] = useState(
    currentUser.role === 'admin' ? currentUser.department_id : 'all'
  )
  const [statusFilter, setStatusFilter] = useState('all')

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'electrical', name: 'Electrical & Power' },
    { id: 'civil_maintenance', name: 'Civil & Plumbing' },
    { id: 'it_network', name: 'IT & Digital' },
    { id: 'food_services', name: 'Food Services' },
    { id: 'housekeeping', name: 'Housekeeping' },
    { id: 'security', name: 'Campus Security' }
  ]

  const filteredList = complaints.filter(c => {
    if (departmentFilter !== 'all' && c.department_id !== departmentFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    return true
  })

  const urgentCount = filteredList.filter(c => c.priority === 'urgent' && c.status !== 'closed').length
  const pendingCount = filteredList.filter(c => c.status === 'pending').length
  const inProgressCount = filteredList.filter(c => c.status === 'assigned' || c.status === 'in_progress').length
  const resolvedCount = filteredList.filter(c => c.status === 'resolved').length

  const handleDeptClick = (id) => {
    playTick()
    setDepartmentFilter(id)
  }

  const handleQuickAssign = (comp, workerName) => {
    playSuccess()
    if (onAdminUpdate) {
      onAdminUpdate(comp.id, {
        assigned_to: workerName,
        status: 'assigned'
      })
    }
  }

  const handleQuickResolve = (comp) => {
    playSuccess()
    if (onAdminUpdate) {
      onAdminUpdate(comp.id, {
        status: 'resolved',
        resolution_notes: `Repaired on-site by ${comp.assigned_to || 'facilities crew'}. Pressure and integrity tests nominal. Pending student verification.`,
        resolved_at: new Date().toISOString()
      })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Admin Header & Officer Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border-amber-500/25 bg-gradient-to-r from-amber-500/15 via-[#0d1322] to-transparent shadow-xl shadow-amber-500/5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Facilities Operations Command</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DISPATCH CONTROL ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Authenticated Officer: <strong className="text-amber-300">{currentUser.name}</strong> • {currentUser.badge || 'Executive Admin'}
            </p>
          </div>
        </div>

        {/* SLA Auto-Escalation Pill */}
        <div className="flex items-center gap-3 text-xs bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10">
          <div className="text-slate-400 font-medium">SLA Thresholds:</div>
          <div className="font-mono text-rose-400 font-bold">Urgent: 2h</div>
          <div className="font-mono text-amber-400 font-bold">High: 12h</div>
          <div className="font-mono text-cyan-400 font-bold">Med: 24h</div>
        </div>
      </div>

      {/* Admin Queue Counters (3D Tilt & Specular Glare) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <TiltCard 
          maxTilt={6}
          glareColor="rgba(245, 158, 11, 0.22)"
          className="p-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-amber-500/40 shadow-lg shadow-black/30"
        >
          <div className="bg-[#0b101c]/90 rounded-[calc(1rem-2px)] p-4 border border-white/5 h-full">
            <div className="text-xs text-slate-400 mb-1">Pending Triage</div>
            <div className="text-2xl font-black text-amber-300 font-mono">{pendingCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">Awaiting dispatch</div>
          </div>
        </TiltCard>

        <TiltCard 
          maxTilt={6}
          glareColor="rgba(6, 182, 212, 0.22)"
          className="p-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-cyan-500/40 shadow-lg shadow-black/30"
        >
          <div className="bg-[#0b101c]/90 rounded-[calc(1rem-2px)] p-4 border border-white/5 h-full">
            <div className="text-xs text-slate-400 mb-1">In Progress</div>
            <div className="text-2xl font-black text-cyan-300 font-mono">{inProgressCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">Technicians on site</div>
          </div>
        </TiltCard>

        <TiltCard 
          maxTilt={6}
          glareColor="rgba(16, 185, 129, 0.22)"
          className="p-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-emerald-500/40 shadow-lg shadow-black/30"
        >
          <div className="bg-[#0b101c]/90 rounded-[calc(1rem-2px)] p-4 border border-white/5 h-full">
            <div className="text-xs text-slate-400 mb-1">Awaiting Student Sign-Off</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{resolvedCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">Closed-loop phase</div>
          </div>
        </TiltCard>

        <TiltCard 
          maxTilt={6}
          glareColor="rgba(244, 63, 94, 0.22)"
          className="p-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-rose-500/40 shadow-lg shadow-black/30"
        >
          <div className="bg-[#0b101c]/90 rounded-[calc(1rem-2px)] p-4 border border-white/5 h-full">
            <div className="text-xs text-slate-400 mb-1">Escalated Hazards</div>
            <div className="text-2xl font-black text-rose-400 font-mono">{urgentCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">Immediate priority</div>
          </div>
        </TiltCard>
      </div>

      {/* Department & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {departments.map(dep => (
            <button
              key={dep.id}
              onClick={() => handleDeptClick(dep.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                departmentFilter === dep.id 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {dep.name}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            playTick()
            setStatusFilter(e.target.value)
          }}
          className="bg-[#0d121f] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
        >
          <option value="all">All Ticket Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Queue Table */}
      <div className="glass-panel rounded-3xl border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Ticket</th>
                <th className="py-3.5 px-4">Headline / Issue</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Priority / SLA</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Worker</th>
                <th className="py-3.5 px-4 text-right">Quick Dispatch / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredList.map(comp => (
                <tr 
                  key={comp.id} 
                  onClick={() => {
                    playTick()
                    onSelectComplaint(comp)
                  }}
                  className="hover:bg-white/[0.05] cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                    {comp.ticket_number}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white max-w-[220px] truncate group-hover:text-amber-300 transition-colors">
                    {comp.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                    {comp.location_building} <span className="text-slate-500">• {comp.location_floor}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                      comp.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {comp.priority} ({comp.sla_hours}h)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`mono-tag px-2 py-0.5 rounded border text-[10px] uppercase font-bold ${
                      comp.status === 'resolved' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : comp.status === 'closed'
                        ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        : comp.status === 'assigned' || comp.status === 'in_progress'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {comp.status === 'resolved' ? 'Awaiting Sign-Off' : comp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    {/* Inline Quick Assign worker */}
                    <select
                      value={comp.assigned_to || ''}
                      onChange={(e) => handleQuickAssign(comp, e.target.value)}
                      className="bg-[#0b101c] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="" disabled>Select Technician</option>
                      {CAMPUS_WORKERS.map(w => (
                        <option key={w.name} value={w.name}>{w.name} ({w.role})</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* Quick Mark Resolved Button (if assigned or in progress) */}
                      {(comp.status === 'assigned' || comp.status === 'in_progress' || comp.status === 'pending') && (
                        <button
                          onClick={() => handleQuickResolve(comp)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold shadow-sm transition-all active:scale-95"
                          title="Mark work order completed and send for student verification"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Resolve</span>
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          playTick()
                          if (onGetDirections) {
                            onGetDirections(comp)
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold text-[11px] transition-all active:scale-95 border border-cyan-500/30"
                        title="Get Campus Directions & Route"
                      >
                        <Navigation className="w-3 h-3 text-cyan-400" />
                        <span>Route</span>
                      </button>

                      <button 
                        onClick={() => {
                          playTick()
                          onSelectComplaint(comp)
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold text-[11px] transition-all active:scale-95 border border-amber-500/30"
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
