import React, { useRef, useState, useEffect } from 'react'
import { 
  MapPin, 
  Compass, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  PhoneCall, 
  ShieldCheck, 
  Layers, 
  Search, 
  Building2, 
  Sparkles,
  Phone,
  CheckCircle2
} from 'lucide-react'
import type { Complaint, UserPersona } from '../types/index'

interface InteractiveMapProps {
  complaints?: Complaint[]
  onSelectComplaint?: (complaint: Complaint) => void
  onUpvoteComplaint?: (id: string) => void
  onCreateComplaint?: (complaint: any) => void
  currentUser?: UserPersona
  fullscreenMode?: boolean
  autoStartReport?: boolean
  onReportStarted?: () => void
  height?: number | string
  mode?: "view" | "pick"
  initialCoordinates?: { lat: number; lng: number } | null
  onLocationPicked?: (coords: { lat: number; lng: number; building?: string }) => void
  onRequestReport?: () => void
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  complaints = [], 
  onSelectComplaint,
  onUpvoteComplaint,
  onCreateComplaint,
  currentUser,
  fullscreenMode = false,
  autoStartReport = false,
  onReportStarted,
  height,
  mode = "view",
  initialCoordinates,
  onLocationPicked,
  onRequestReport
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [selectedCampus, setSelectedCampus] = useState<'bannari-amman' | 'kpr-iet'>('bannari-amman')
  const [isFullscreen, setIsFullscreen] = useState(fullscreenMode)
  const [isIframeLoaded, setIsIframeLoaded] = useState(false)
  const [showHelplineQuickSheet, setShowHelplineQuickSheet] = useState(false)

  // Construct GIS URL with initial parameters
  const isAdmin = currentUser?.role === 'admin'
  const isPickOnly = mode === "pick"
  const coordsParam = initialCoordinates?.lat && initialCoordinates?.lng
    ? `&lat=${initialCoordinates.lat}&lng=${initialCoordinates.lng}`
    : ''
  const gisSrc = `/campus-gis/index.html?campus=${selectedCampus}&admin=${isAdmin ? 'true' : 'false'}${isPickOnly ? '&pickOnly=true' : ''}${coordsParam}${autoStartReport ? '&startReport=true' : ''}`

  // Notify iframe when campus is changed
  const handleCampusSwitch = (campus: 'bannari-amman' | 'kpr-iet') => {
    setSelectedCampus(campus)
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        action: 'switchCampus',
        campus: campus
      }, '*')
    }
  }

  // Sync admin mode when currentUser changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        action: 'toggleAdmin',
        admin: isAdmin
      }, '*')
    }
  }, [isAdmin])

  // Automatically activate map report pinpoint mode if requested
  useEffect(() => {
    if (autoStartReport && iframeRef.current?.contentWindow && isIframeLoaded) {
      const timer = setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({
          action: 'startReport'
        }, '*')
        onReportStarted?.()
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [autoStartReport, isIframeLoaded, onReportStarted])

  // Bidirectionally synchronize complaints with the 3D GIS iframe engine
  useEffect(() => {
    if (iframeRef.current?.contentWindow && isIframeLoaded && complaints.length > 0) {
      const gisComplaints = complaints.map(c => ({
        id: c.ticket_number || c.id,
        title: c.title,
        category: (function(cat, dept) {
          const c = String(cat || dept || '').toLowerCase();
          if (['water', 'plumbing', 'washroom', 'civil_maintenance'].includes(c)) return 'plumbing';
          if (['electricity', 'electrical', 'power'].includes(c)) return 'electrical';
          if (['wifi', 'it-network', 'it_network', 'internet'].includes(c)) return 'it-network';
          if (['food_hygiene', 'food', 'cleanliness', 'sanitation', 'food_services'].includes(c)) return 'sanitation';
          if (['security', 'safety'].includes(c)) return 'safety';
          if (['infrastructure', 'roads', 'pavement'].includes(c)) return 'roads';
          return 'facilities';
        })(c.category, c.department_id),
        urgency: c.priority,
        status: (['in_progress', 'in-progress', 'assigned'].includes(c.status)
          ? 'in-progress'
          : ['closed_verified', 'resolved', 'resolved_pending_verification', 'auto_closed', 'closed'].includes(c.status)
          ? 'resolved'
          : 'reported'),
        lat: c.lat,
        lng: c.lng,
        floor: c.location_floor || 'Ground',
        room: c.location_room || '',
        locationName: c.location_room ? `${c.location_building} • ${c.location_room}` : c.location_building,
        nearestBuilding: c.location_building,
        description: c.description,
        reporterName: c.reporter_name,
        rollNumber: '',
        department: c.category,
        anonymous: false,
        timestamp: c.created_at,
        upvotes: c.upvotes || 0,
        hasUpvoted: false,
        photos: c.photo_url ? [c.photo_url] : [],
        timeline: (c.updates || []).map(u => ({
          title: u.author,
          time: new Date(u.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          desc: u.message
        }))
      }))

      iframeRef.current.contentWindow.postMessage({
        action: 'syncComplaints',
        complaints: gisComplaints
      }, '*')
    }
  }, [complaints, isIframeLoaded])

  // Listen for actions originating inside the Mapbox GIS iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return
      if (e.data.action === 'selectComplaint' && e.data.id && onSelectComplaint) {
        const found = complaints.find(c => c.id === e.data.id || c.ticket_number === e.data.id || c.title === e.data.title)
        if (found) {
          onSelectComplaint(found)
        }
      }
      if (e.data.action === 'complaintUpvoted' && e.data.id && onUpvoteComplaint) {
        onUpvoteComplaint(e.data.id)
      }
      if (e.data.action === 'complaintCreated' && e.data.complaint && onCreateComplaint) {
        onCreateComplaint(e.data.complaint)
      }
      if (e.data.action === 'locationPicked' && onLocationPicked) {
        onLocationPicked({
          lat: e.data.lat,
          lng: e.data.lng,
          building: e.data.building
        })
      }
      if (e.data.action === 'onRequestReport' && onRequestReport) {
        onRequestReport()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [complaints, onSelectComplaint, onUpvoteComplaint, onCreateComplaint, onLocationPicked, onRequestReport])

  // Center/fly map when initialCoordinates change
  useEffect(() => {
    if (initialCoordinates?.lat && initialCoordinates?.lng && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        action: 'flyToLocation',
        lat: initialCoordinates.lat,
        lng: initialCoordinates.lng
      }, '*')
    }
  }, [initialCoordinates?.lat, initialCoordinates?.lng])

  return (
    <div 
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      onMouseEnter={() => {
        window.dispatchEvent(new CustomEvent('lenis:prevent', { detail: true }))
      }}
      onMouseLeave={() => {
        window.dispatchEvent(new CustomEvent('lenis:prevent', { detail: false }))
      }}
      style={!isFullscreen && height ? { height: typeof height === 'number' ? `${height}px` : height } : undefined}
      className={`relative flex flex-col bg-[#0b0f19] border border-white/10 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none border-0 shadow-none bg-[#07090e]' 
        : 'w-full h-full min-h-0'
    }`}>
      
      {/* Executive Command Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#0d121f] border-b border-white/10 shrink-0">
        
        {/* Left: Branding & Status Badge */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-sm shrink-0">
            <div className="w-full h-full bg-[#0b0f19] rounded-[5px] flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-white tracking-tight">
              FixMyCampus 3D GIS
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live 3D
            </span>
          </div>
        </div>

        {/* Middle: Fast Campus Switcher Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => handleCampusSwitch('bannari-amman')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              selectedCampus === 'bannari-amman'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>BIT</span>
          </button>

          <button
            onClick={() => handleCampusSwitch('kpr-iet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              selectedCampus === 'kpr-iet'
                ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/25 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>KPR</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Helpline Popover Trigger */}
          <button
            onClick={() => setShowHelplineQuickSheet(!showHelplineQuickSheet)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-all"
            title="View Campus Emergency Numbers"
          >
            <PhoneCall className="w-3 h-3" />
            <span className="hidden sm:inline">Helplines</span>
          </button>

          {/* Open in Dedicated Tab */}
          <a
            href={`/campus-gis/index.html?campus=${selectedCampus}&admin=${isAdmin ? 'true' : 'false'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
            title="Open Fullscreen Standalone App in New Window"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden md:inline">Standalone</span>
          </a>

          {/* Toggle Fullscreen inside view */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Expand Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Emergency Helpline Dropdown Drawer */}
      {showHelplineQuickSheet && (
        <div className="bg-[#141b2d] border-b border-white/10 p-3.5 px-4 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              Direct Emergency Dispatch Numbers ({selectedCampus === 'bannari-amman' ? 'Bannari Amman' : 'KPR Institute'})
            </span>
            <button 
              onClick={() => setShowHelplineQuickSheet(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5"
            >
              Close
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {selectedCampus === 'bannari-amman' ? (
              <>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-200">Main Campus Security</div>
                    <div className="text-xs font-bold text-cyan-400">04295-226000</div>
                  </div>
                  <a href="tel:04295226000" className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-red-200">BIT Ambulance / Medical</div>
                    <div className="text-xs font-bold text-red-400">04295-226300</div>
                  </div>
                  <a href="tel:04295226300" className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-200">Anti-Ragging Squad</div>
                    <div className="text-xs font-bold text-amber-400">04295-226123</div>
                  </div>
                  <a href="tel:04295226123" className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-200">National Emergency</div>
                    <div className="text-xs font-bold text-emerald-400">112 / 108</div>
                  </div>
                  <a href="tel:112" className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-200">KPR Security Desk</div>
                    <div className="text-xs font-bold text-cyan-400">0422-2635600</div>
                  </div>
                  <a href="tel:04222635600" className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-red-200">Health Clinic & ER</div>
                    <div className="text-xs font-bold text-red-400">0422-2635699</div>
                  </div>
                  <a href="tel:04222635699" className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-200">Student Affairs / Dean</div>
                    <div className="text-xs font-bold text-amber-400">0422-2635622</div>
                  </div>
                  <a href="tel:04222635622" className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-200">National Emergency</div>
                    <div className="text-xs font-bold text-emerald-400">112 / 108</div>
                  </div>
                  <a href="tel:112" className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Mapbox WebGL Embedded Frame */}
      <div 
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        className={`relative w-full flex-1 min-h-0 ${isFullscreen ? 'h-[calc(100vh-70px)]' : 'h-full'} bg-[#07090e]`}
      >
        {!isIframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07090e] z-10 space-y-3">
            <div className="w-9 h-9 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-cyan-300 font-medium">Initializing Mapbox 3D Campus GIS Engine...</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={gisSrc}
          data-lenis-prevent="true"
          title="FixMyCampus Interactive 3D GIS"
          onLoad={() => {
            setIsIframeLoaded(true)
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage({
                action: 'toggleAdmin',
                admin: isAdmin
              }, '*')
              if (autoStartReport) {
                setTimeout(() => {
                  iframeRef.current?.contentWindow?.postMessage({
                    action: 'startReport'
                  }, '*')
                  onReportStarted?.()
                }, 500)
              }
            }
          }}
          className="w-full h-full border-0 outline-none"
          allow="geolocation; clipboard-write"
          style={{ overscrollBehavior: 'contain' }}
        />
      </div>

      {/* Compact Telemetry Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1 bg-[#090d16] border-t border-white/10 text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">
              {selectedCampus === 'bannari-amman' 
                ? 'Bannari Amman Institute of Technology (BIT) • Sathyamangalam' 
                : 'KPR Institute of Engineering & Technology (KPR) • Coimbatore'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            Mapbox 3D Vector GIS
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
          <span className="text-[10px] text-cyan-400 font-semibold">
            {isAdmin ? '🛡️ Admin Officer Mode' : '🎓 Student Mode'}
          </span>
        </div>
      </div>

    </div>
  )
}

export default InteractiveMap
