import React, { useState } from 'react'
import { 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  ChevronDown, 
  Sparkles, 
  RotateCcw,
  Bell,
  CheckCircle2,
  Compass,
  Volume2,
  VolumeX,
  Radio,
  LogOut,
  BarChart3,
  MapPin,
  Lock
} from 'lucide-react'
import { playTick, playSuccess, toggleSound, isSoundEnabled } from '../services/soundFx'

export default function Navbar({ 
  currentUser, 
  allUsers, 
  onSwitchUser, 
  activeView, 
  onSelectView, 
  pendingVerificationCount = 0,
  onResetData,
  onLogout
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled())

  const isAdmin = currentUser?.role === 'admin'
  const isStudent = currentUser?.role === 'student'

  const handleTabClick = (view) => {
    playTick()
    onSelectView(view)
  }

  const handleSoundToggle = () => {
    const next = toggleSound()
    setSoundOn(next)
    if (next) playTick()
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07090e]/95 border-b border-white/10 px-4 lg:px-8 py-3 shadow-xl shadow-black/50 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Telemetry Ping */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => handleTabClick(isAdmin ? 'admin' : 'portal')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0d121f] rounded-[11px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                FixMyCampus
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                isAdmin 
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/25' 
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAdmin ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                {isAdmin ? 'Operations' : 'TN Campuses Live'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">BIT Sathyamangalam & KPR Coimbatore</p>
          </div>
        </div>

        {/* View Switchers — ROLE-RESTRICTED */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          
          {/* === STUDENT-ONLY TABS === */}
          {isStudent && (
            <>
              <button
                onClick={() => handleTabClick('portal')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] ${
                  activeView === 'portal'
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>My Dashboard</span>
                {pendingVerificationCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black animate-bounce shadow-sm">
                    {pendingVerificationCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('student_map')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] ${
                  activeView === 'student_map'
                    ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Campus Map</span>
              </button>
            </>
          )}

          {/* === ADMIN-ONLY TABS === */}
          {isAdmin && (
            <>
              <button
                onClick={() => handleTabClick('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] ${
                  activeView === 'admin'
                    ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Command Center</span>
              </button>

              <button
                onClick={() => handleTabClick('analytics')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] ${
                  activeView === 'analytics'
                    ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/25 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics & Heatmap</span>
              </button>

              <button
                onClick={() => handleTabClick('map')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] ${
                  activeView === 'map'
                    ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>3D GIS Map</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  3D Extrusions
                </span>
              </button>
            </>
          )}
        </div>

        {/* Action Controls & Persona Switcher */}
        <div className="flex items-center gap-2">
          
          {/* Sound FX Toggle Button */}
          <button
            onClick={handleSoundToggle}
            title={soundOn ? 'Audio Micro-Haptics Enabled' : 'Audio Muted'}
            className={`p-2 rounded-xl border transition-all ${
              soundOn 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25 hover:bg-cyan-500/20' 
                : 'bg-white/5 text-slate-500 border-white/10 hover:text-white'
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Demo State Button */}
          <button
            onClick={() => {
              playTick()
              onResetData()
            }}
            title="Reset Mock State to Initial Defaults"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                playTick()
                setDropdownOpen(!dropdownOpen)
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left active:scale-[0.98]"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className={`w-7 h-7 rounded-full object-cover ring-2 ${
                  isAdmin ? 'ring-amber-500/40' : 'ring-cyan-500/30'
                }`}
              />
              <div className="hidden sm:block text-xs leading-tight">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  {currentUser.name}
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    isAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {isAdmin ? 'Officer' : 'Student'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {isAdmin ? currentUser.department_name : currentUser.roll_number}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0f172a] border border-white/15 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                
                {/* Current Session Info */}
                <div className="px-3 py-2.5 border-b border-white/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Active Session
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                    <span className="text-xs text-white font-semibold">
                      {isAdmin ? 'Operations Officer Mode' : 'Student Portal Mode'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isAdmin 
                      ? 'Full command access: dashboard, analytics, 3D GIS map, directions, and dispatch.' 
                      : 'Student access: report issues, verify repairs, view campus map, and contact helpdesk.'}
                  </p>
                </div>

                {/* Mobile Tab Navigation (visible only in dropdown on small screens) */}
                <div className="lg:hidden border-b border-white/10 py-1.5 space-y-0.5">
                  {isStudent && (
                    <>
                      <button
                        onClick={() => { handleTabClick('portal'); setDropdownOpen(false) }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          activeView === 'portal' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>My Dashboard</span>
                        {pendingVerificationCount > 0 && (
                          <span className="ml-auto w-4 h-4 flex items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-black">
                            {pendingVerificationCount}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => { handleTabClick('student_map'); setDropdownOpen(false) }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          activeView === 'student_map' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Campus Map</span>
                      </button>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => { handleTabClick('admin'); setDropdownOpen(false) }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          activeView === 'admin' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Command Center</span>
                      </button>
                      <button
                        onClick={() => { handleTabClick('analytics'); setDropdownOpen(false) }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          activeView === 'analytics' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Analytics & Heatmap</span>
                      </button>
                      <button
                        onClick={() => { handleTabClick('map'); setDropdownOpen(false) }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          activeView === 'map' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>3D GIS Map</span>
                      </button>
                    </>
                  )}
                </div>

                {onLogout && (
                  <div className="pt-1.5 mt-1">
                    <button
                      onClick={() => {
                        playTick()
                        setDropdownOpen(false)
                        onLogout()
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-rose-300 hover:bg-rose-500/15 font-semibold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Log Out to Login Portal</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
