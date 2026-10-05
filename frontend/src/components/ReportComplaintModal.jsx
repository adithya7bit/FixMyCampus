import React, { useState, useEffect } from 'react'
import { 
  X, 
  Sparkles, 
  MapPin, 
  AlertTriangle, 
  Camera, 
  Send, 
  ThumbsUp, 
  CheckCircle2, 
  Layers,
  Compass,
  ArrowRight,
  ArrowLeft,
  Wifi,
  LifeBuoy,
  Zap,
  Bath,
  Building2,
  Home,
  Coffee,
  ShieldAlert,
  Navigation,
  CircleHelp,
  ImagePlus,
  Clock,
  Check
} from 'lucide-react'
import { classifyComplaintAI, detectDuplicates, fetchAIClassification, fetchDuplicates } from '../services/aiEngine'
import { CAMPUS_BUILDINGS } from '../services/mockData'
import { playSuccess, playTick } from '../services/soundFx'

// Category definitions inspired by ref0 and ref1
const CATEGORIES = [
  { id: 'Water', name: 'Water & Plumbing', icon: LifeBuoy, tone: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 'Electricity', name: 'Electricity & Power', icon: Zap, tone: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30' },
  { id: 'Wi-Fi / Network', name: 'Wi-Fi / Network', icon: Wifi, tone: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30' },
  { id: 'Cleanliness', name: 'Cleanliness & Sanitation', icon: Sparkles, tone: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'Classroom', name: 'Classroom & Labs', icon: Building2, tone: 'from-purple-500/20 to-violet-500/20 text-purple-400 border-purple-500/30' },
  { id: 'Hostel', name: 'Hostel Amenities', icon: Home, tone: 'from-teal-500/20 to-green-500/20 text-teal-400 border-teal-500/30' },
  { id: 'Food / Canteen', name: 'Food & Canteen', icon: Coffee, tone: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30' },
  { id: 'Safety', name: 'Safety & Security', icon: ShieldAlert, tone: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30' },
  { id: 'Other', name: 'Other Campus Facilities', icon: CircleHelp, tone: 'from-slate-500/20 to-zinc-500/20 text-slate-300 border-slate-500/30' },
]

export default function ReportComplaintModal({ 
  onClose, 
  onSubmit, 
  existingComplaints = [], 
  currentUser,
  onUpvoteExisting,
  onGoToMapReport
}) {
  const [step, setStep] = useState(1) // 1: Category & Details, 2: Location, 3: Evidence, 4: AI Review & Duplicate Check
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0].name)
  const [floor, setFloor] = useState(CAMPUS_BUILDINGS[0].floors[1] || 'Floor 1')
  const [room, setRoom] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  
  // AI Prediction State
  const [aiResult, setAiResult] = useState(null)
  const [potentialDuplicates, setPotentialDuplicates] = useState([])

  // Recalculate AI classification as user types
  useEffect(() => {
    let isCurrent = true
    if (title.length > 4 || description.length > 8) {
      const pred = classifyComplaintAI(title, description)
      setAiResult(pred)

      fetchAIClassification(title, description).then(backendPred => {
        if (isCurrent && backendPred) {
          setAiResult(backendPred)
        }
      })
    } else {
      setAiResult(null)
    }

    if (title.length > 4 && building) {
      const dups = detectDuplicates(title, building, existingComplaints)
      setPotentialDuplicates(dups)

      fetchDuplicates(title, building, existingComplaints).then(backendDups => {
        if (isCurrent && backendDups) {
          setPotentialDuplicates(backendDups)
        }
      })
    } else {
      setPotentialDuplicates([])
    }

    return () => {
      isCurrent = false
    }
  }, [title, description, building, existingComplaints])

  const handleBuildingChange = (e) => {
    const bName = e.target.value
    setBuilding(bName)
    const bObj = CAMPUS_BUILDINGS.find(b => b.name === bName)
    if (bObj && bObj.floors.length > 0) {
      setFloor(bObj.floors[0])
    }
  }

  const selectedBuildingObj = CAMPUS_BUILDINGS.find(b => b.name === building) || CAMPUS_BUILDINGS[0]

  const handleNextStep = () => {
    if (step === 1 && (!title.trim() || !description.trim())) {
      return
    }
    playTick()
    setStep(prev => Math.min(prev + 1, 4))
  }

  const handlePrevStep = () => {
    playTick()
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (!title.trim() || !description.trim()) return
    playSuccess()

    const category = aiResult ? aiResult.category : selectedCategory
    const department_id = aiResult ? aiResult.department_id : 'civil_maintenance'
    const priority = aiResult ? aiResult.priority : 'medium'
    const sla_hours = aiResult ? aiResult.sla_hours : 24

    onSubmit({
      title,
      description,
      category,
      department_id,
      priority,
      sla_hours,
      location_building: building,
      location_floor: floor,
      location_room: room.trim() || 'General Area',
      photo_url: photoUrl.trim() || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80',
      reporter_name: currentUser?.name || 'Student',
      reporter_id: currentUser?.id || 'u-student-1',
      reporter_email: currentUser?.email || 'student@campus.edu'
    })
  }

  // Prevent background scroll while modal is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return (
    <div 
      data-lenis-prevent="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain glass-panel bg-[#0d1322] border-white/15 p-6 sm:p-8 rounded-3xl shadow-2xl focus:outline-none"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Report Campus Issue</h2>
              <p className="text-xs text-slate-400">4-Step Progressive Auto-Triage & Dispatch</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Progress Indicator (from ref1) */}
        <div className="mb-6 grid grid-cols-4 gap-2">
          {[
            { num: 1, label: 'Details' },
            { num: 2, label: 'Location' },
            { num: 3, label: 'Evidence' },
            { num: 4, label: 'AI Review' }
          ].map(s => (
            <div 
              key={s.num}
              onClick={() => { if (step > s.num) setStep(s.num) }}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                step === s.num
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold shadow-sm shadow-cyan-500/20'
                  : step > s.num
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-medium'
                  : 'bg-white/[0.02] border-white/5 text-slate-500'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider">Step {s.num}</div>
              <div className="text-xs truncate">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ═══════════ STEP 1: CATEGORY & PROBLEM DETAILS ═══════════ */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Select Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  const isSelected = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { playTick(); setSelectedCategory(cat.id) }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        isSelected 
                          ? 'bg-white/10 border-cyan-400 ring-2 ring-cyan-500/30 text-white shadow-md'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-slate-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg border bg-gradient-to-br ${cat.tone}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium leading-tight">{cat.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Issue Title / Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken water pipe leaking in Chemistry Lab 3F"
                className="w-full bg-[#070a12] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Problem Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what is broken, hazards, sounds, or errors observed..."
                className="w-full bg-[#070a12] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!title.trim() || !description.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Continue to Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 2: CAMPUS LOCATION PINPOINT ═══════════ */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Visual Map Reporting Callout */}
            {onGoToMapReport && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-transparent border border-cyan-500/30 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Prefer visual pinpointing on 3D Map?</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Click anywhere on the campus map to drop an exact GPS pinpoint marker.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onGoToMapReport}
                  className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1 shrink-0"
                >
                  <span>3D Map</span>
                  <Compass className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Campus Building / Zone *
              </label>
              <select
                value={building}
                onChange={handleBuildingChange}
                className="w-full bg-[#070a12] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {CAMPUS_BUILDINGS.map(b => (
                  <option key={b.id} value={b.name} className="bg-[#0b101c]">
                    {b.name} ({b.open_issues} active issues)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Floor Level *
                </label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full bg-[#070a12] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {selectedBuildingObj.floors.map(f => (
                    <option key={f} value={f} className="bg-[#0b101c]">{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Room / Specific Bay
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Lab 304, Restroom, Hallway"
                  className="w-full bg-[#070a12] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Continue to Evidence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 3: EVIDENCE & PHOTO UPLOAD ═══════════ */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Photo Proof / Evidence URL (Optional)
              </label>
              <div className="relative">
                <Camera className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or paste image link"
                  className="w-full bg-[#070a12] border border-white/10 rounded-xl pl-9 pr-3 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Quick Preset Photo Samples */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-2">Or choose a quick demo evidence photo:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Water Leak', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
                  { label: 'Electrical Tripping', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80' },
                  { label: 'Hostel Maintenance', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80' }
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { playTick(); setPhotoUrl(sample.url) }}
                    className={`p-2 rounded-xl border text-center text-[11px] font-medium transition-all ${
                      photoUrl === sample.url 
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Preview */}
            {photoUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-white/15 h-36 bg-black/40">
                <img 
                  src={photoUrl} 
                  alt="Evidence preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80' }}
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Preview Ready</span>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Continue to AI Triage</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 4: AI PRE-TRIAGE & PROACTIVE DUPLICATE CHECK ═══════════ */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Autonomous AI Triage Pill */}
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">AI Autonomous Triage & Routing</span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300">
                    Confidence: 96%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 mt-2 font-mono text-[11px]">
                  <div>Department: <strong className="text-cyan-300">{aiResult ? aiResult.department_id : 'civil_maintenance'}</strong></div>
                  <div>Urgency SLA: <strong className="text-amber-300">{aiResult ? aiResult.sla_hours : 24} Hours</strong></div>
                  <div>Category: <strong className="text-slate-200">{aiResult ? aiResult.category : selectedCategory}</strong></div>
                  <div>Assigned Priority: <strong className="text-emerald-300 uppercase">{aiResult ? aiResult.priority : 'medium'}</strong></div>
                </div>
              </div>
            </div>

            {/* Proactive Duplicate Detection & Upvote Prevention */}
            {potentialDuplicates.length > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Proactive Duplicate Prevention: Similar Ticket Detected Nearby!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Another student has already reported an identical issue in <strong>{building}</strong>. You can directly upvote their ticket instead of cluttering maintenance queues:
                </p>

                <div className="space-y-2">
                  {potentialDuplicates.map(dup => (
                    <div 
                      key={dup.id} 
                      className="p-3 rounded-xl bg-[#090e18] border border-amber-500/25 flex items-center justify-between gap-3"
                    >
                      <div className="text-xs">
                        <div className="font-semibold text-white truncate max-w-[260px] sm:max-w-xs">{dup.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Ticket #{dup.ticket_number} • {dup.upvotes} Students Upvoted • Status: {dup.status}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playSuccess()
                          onUpvoteExisting(dup.id)
                          onClose()
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Upvote (+1)</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Zero duplicate conflicts detected in {building}. Clean to submit.</span>
              </div>
            )}

            {/* Submission Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Dispatch Ticket</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
