import React, { useState } from 'react'
import { 
  Sparkles, 
  Search, 
  Filter, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Flame, 
  ArrowUpRight,
  TrendingUp,
  X,
  Plus,
  ShieldCheck,
  Camera,
  ThumbsUp,
  ListFilter,
  LifeBuoy,
  Zap,
  Wifi,
  Building2,
  Home,
  Coffee,
  ShieldAlert
} from 'lucide-react'
import ComplaintCard from './ComplaintCard'
import TiltCard from './TiltCard'
import StudentVerificationModal from './StudentVerificationModal'
import { playTick, playSuccess } from '../services/soundFx'

export default function StudentDashboard({ 
  complaints = [], 
  onSelectComplaint, 
  onOpenReport, 
  onUpvote, 
  currentUser,
  onConfirmFixed,
  onReopenIssue
}) {
  const [filter, setFilter] = useState('all') // all, my_reports, pending_verification, urgent
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [verifyingComplaint, setVerifyingComplaint] = useState(null)

  // Verification alert items
  const awaitingVerification = complaints.filter(
    c => c.status === 'resolved' && (c.reporter_id === currentUser.id || currentUser.role === 'student')
  )

  // Filter logic
  const filteredComplaints = complaints.filter(c => {
    // Search match
    const matchSearch = search === '' || 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.location_building.toLowerCase().includes(search.toLowerCase()) ||
      c.ticket_number.toLowerCase().includes(search.toLowerCase())

    if (!matchSearch) return false

    if (categoryFilter !== 'all') {
      const catLower = (c.category || '').toLowerCase()
      if (!catLower.includes(categoryFilter.toLowerCase())) return false
    }

    if (filter === 'my_reports') {
      return c.reporter_id === currentUser.id
    }
    if (filter === 'pending_verification') {
      return c.status === 'resolved'
    }
    if (filter === 'urgent') {
      return c.priority === 'urgent' && c.status !== 'closed'
    }
    return true
  })

  // Quick stat metrics
  const activeCount = complaints.filter(c => c.status !== 'closed').length
  const closedCount = complaints.filter(c => c.status === 'closed').length
  const urgentCount = complaints.filter(c => c.priority === 'urgent' && c.status !== 'closed').length

  const handleFilterClick = (f) => {
    playTick()
    setFilter(f)
  }

  const handleOpenVerification = (comp) => {
    playTick()
    setVerifyingComplaint(comp)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* CLOSED-LOOP VERIFICATION BANNER CALLOUT */}
      {awaitingVerification.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-black text-sm sm:text-base text-emerald-300">
                  Student Verification Action Required: {awaitingVerification.length} Completed Repair(s)
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Campus crew marked work orders completed. Under university protocol, you must physically verify repair quality before closing!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 shrink-0">
            <button
              onClick={() => handleFilterClick('pending_verification')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs transition-all"
            >
              View Queue ({awaitingVerification.length})
            </button>
            <button
              onClick={() => handleOpenVerification(awaitingVerification[0])}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify Fixes Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Campus Telemetry KPI Cards with 3D Tilt & Specular Glare */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <TiltCard 
          maxTilt={6}
          glareColor="rgba(6, 182, 212, 0.22)"
          className="p-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-cyan-500/40 shadow-lg shadow-black/30"
        >
          <div className="bg-[#0b101c]/90 rounded-[calc(1rem-2px)] p-4 flex flex-col justify-between h-full border border-white/5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Logged</span>
              <AlertCircle className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{complaints.length}</div>
            <div className="text-[10px] text-slate-500 mt-1">Tamil Nadu Campuses</div>
          </div>
        </TiltCard>

        <TiltCard 
          maxTilt={6}
          glareColor="rgba(245, 158, 11, 0.22)"
          className="p-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-amber-500/40 shadow-lg shadow-black/30"
        >
          <div className="bg-[#0b101c]/90 rounded-[calc(1rem-2px)] p-4 flex flex-col justify-between h-full border border-white/5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Active in Queue</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">{activeCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">Under maintenance</div>
          </div>
        </TiltCard>

        {/* Interactive Needs Verification KPI */}
        <div onClick={() => handleFilterClick('pending_verification')} className="cursor-pointer">
          <TiltCard 
            maxTilt={6}
            glareColor="rgba(16, 185, 129, 0.3)"
            className={`p-1 rounded-2xl bg-white/[0.03] ring-1 transition-all shadow-lg shadow-black/30 ${
              awaitingVerification.length > 0 
                ? 'ring-emerald-500/50 bg-emerald-500/[0.04]' 
                : 'ring-white/10 hover:ring-emerald-500/40'
            }`}
          >
            <div className="bg-[#0b101c]/90 rounded-[calc(1rem-2px)] p-4 flex flex-col justify-between h-full border border-white/5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="text-emerald-400 font-semibold">Needs Student Sign-Off</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-black text-emerald-400 font-mono">{awaitingVerification.length}</div>
                {awaitingVerification.length > 0 && (
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider animate-pulse">Action Req</span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Click to inspect & close</div>
            </div>
          </TiltCard>
        </div>

        <TiltCard 
          maxTilt={6}
          glareColor="rgba(244, 63, 94, 0.22)"
          className="p-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-rose-500/40 shadow-lg shadow-black/30"
        >
          <div className="bg-[#0b101c]/90 rounded-[calc(1rem-2px)] p-4 flex flex-col justify-between h-full border border-white/5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Urgent Hazards</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">{urgentCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">2-Hour Escalation Active</div>
          </div>
        </TiltCard>
      </div>

      {/* Special Physical Verification Queue Notice Header when filter is active */}
      {filter === 'pending_verification' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1627] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Closed-Loop Student Verification Queue</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">
                  Physical Sign-Off
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                These campus repairs have been marked resolved by facilities technicians. Inspect the repair in person or review before/after photo proof, then either approve to close the work order or reopen if still defective.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleFilterClick('all')}
            className="text-xs text-slate-400 hover:text-white underline whitespace-nowrap self-end sm:self-center"
          >
            Show All Issues
          </button>
        </div>
      )}

      {/* Search, Filter Toolbar & Report Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by title, building, or FMC ID..."
            className="w-full bg-[#0d121f] border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => handleFilterClick('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              filter === 'all' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Issues
          </button>
          <button
            onClick={() => handleFilterClick('my_reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              filter === 'my_reports' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            My Reports
          </button>
          <button
            onClick={() => handleFilterClick('pending_verification')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
              filter === 'pending_verification' 
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-md shadow-emerald-500/10' 
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Needs Verification ({awaitingVerification.length})</span>
          </button>
          <button
            onClick={() => handleFilterClick('urgent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              filter === 'urgent' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' 
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Urgent Only
          </button>

          {/* Quick Report Physical Issue Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-md shadow-cyan-500/20 active:scale-95 transition-all whitespace-nowrap ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips (from ref1) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">Category:</span>
        {[
          { id: 'all', label: 'All', icon: null },
          { id: 'water', label: 'Water', icon: LifeBuoy },
          { id: 'electrical', label: 'Electricity', icon: Zap },
          { id: 'network', label: 'Wi-Fi', icon: Wifi },
          { id: 'cleanliness', label: 'Cleanliness', icon: Sparkles },
          { id: 'classroom', label: 'Classroom', icon: Building2 },
          { id: 'hostel', label: 'Hostel', icon: Home },
          { id: 'food', label: 'Food', icon: Coffee },
          { id: 'safety', label: 'Safety', icon: ShieldAlert },
        ].map(cat => {
          const Icon = cat.icon
          const isActive = categoryFilter === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => { playTick(); setCategoryFilter(cat.id) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-sm shadow-cyan-500/10'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border-white/10 hover:bg-white/[0.07]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>
      {filteredComplaints.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border-white/10">
          <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">No matching tickets found</h4>
          <p className="text-xs text-slate-400">
            {filter === 'pending_verification' 
              ? 'Great news! All campus repairs have been verified and closed.' 
              : 'Try adjusting your search terms or filter selections.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComplaints.map(comp => (
            <ComplaintCard
              key={comp.id}
              complaint={comp}
              onSelect={onSelectComplaint}
              onUpvote={onUpvote}
              currentUser={currentUser}
              onVerify={handleOpenVerification}
            />
          ))}
        </div>
      )}

      {/* Dedicated Student Physical Verification Modal */}
      {verifyingComplaint && (
        <StudentVerificationModal
          complaint={verifyingComplaint}
          currentUser={currentUser}
          onClose={() => setVerifyingComplaint(null)}
          onConfirmFixed={(id, feedback) => {
            if (onConfirmFixed) {
              onConfirmFixed(id, feedback)
            }
          }}
          onReopenIssue={(id, reason) => {
            if (onReopenIssue) {
              onReopenIssue(id, reason)
            }
          }}
        />
      )}

    </div>
  )
}
