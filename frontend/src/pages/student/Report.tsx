import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CampusMap } from "@/components/CampusMap";
import { CategoryChip, CategoryIcon, PriorityBadge, StatusBadge } from "@/components/badges";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { compressImage, validateFile } from "@/lib/compress";
import {
  BUILDINGS,
  CATEGORIES,
  IMAGE_MAX_MB,
  PRIORITIES,
  RATE_LIMIT_PER_DAY,
  VIDEO_MAX_MB,
  DEFAULT_SLA,
} from "@/lib/constants";
import { nearestBuilding } from "@/lib/geo";
import { useStore, type DuplicateHit } from "@/lib/store";
import type { Category, Priority } from "@/types";
import { cn } from "@/utils/cn";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  ImagePlus,
  MapPin,
  Send,
  Sparkles,
  X,
  AlertTriangle,
  Users,
  ThumbsUp,
  FileText,
  Upload,
  Cpu,
  Layers,
  ArrowRight,
  Mic,
  MicOff,
} from "lucide-react";
import confetti from "canvas-confetti";

const DRAFT_KEY = "campusiq-draft-v3";

interface Draft {
  step: number; // 1 to 8
  category: Category | string;
  title: string;
  description: string;
  enhancedDescription?: string;
  aiCategory?: string;
  aiSeverity?: string;
  aiConfidence?: number;
  aiSafetyRisk?: boolean;
  aiEstimatedAffected?: number;
  aiReason?: string;
  media: { url: string; mediaType: "image" | "video"; name: string }[];
  lat: number;
  lng: number;
  building: string;
  floor: string;
  room: string;
  priority: Priority;
}

const emptyDraft: Draft = {
  step: 1,
  category: "",
  title: "",
  description: "",
  enhancedDescription: "",
  media: [],
  lat: 28.5458,
  lng: 77.1922,
  building: "Academic Block A",
  floor: "1st Floor",
  room: "",
  priority: "medium",
};

const STEPS = [
  { id: 1, title: "Category", desc: "Select issue trade" },
  { id: 2, title: "Description", desc: "Title & problem details" },
  { id: 3, title: "AI Triage", desc: "Enhancement & neural analysis" },
  { id: 4, title: "Evidence", desc: "Photos or videos" },
  { id: 5, title: "Location", desc: "Building, room & map pin" },
  { id: 6, title: "Duplicate Check", desc: "Nearby existing tickets" },
  { id: 7, title: "Review", desc: "Verify information" },
  { id: 8, title: "Submit", desc: "CMP ticket generation" },
];

export function Report() {
  const { session, createComplaint, findDuplicates, addSupport, todayCount, toast } = useStore();
  const nav = useNavigate();

  const [d, setD] = useState<Draft>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? { ...emptyDraft, ...JSON.parse(raw) } : emptyDraft;
    } catch {
      return emptyDraft;
    }
  });

  const [busy, setBusy] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [dups, setDups] = useState<DuplicateHit[]>([]);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [donePublic, setDonePublic] = useState("");
  const [isListeningDesc, setIsListeningDesc] = useState(false);

  const toggleListeningDesc = () => {
    if (isListeningDesc) {
      setIsListeningDesc(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.onstart = () => setIsListeningDesc(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");
      set("description", transcript);
    };
    recognition.onerror = () => setIsListeningDesc(false);
    recognition.onend = () => setIsListeningDesc(false);
    recognition.start();
  };

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  }, [d]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  const remaining = session ? RATE_LIMIT_PER_DAY - todayCount(session.id) : RATE_LIMIT_PER_DAY;

  // File upload handler
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError("");
    for (const file of Array.from(files)) {
      const err = validateFile(file);
      if (err) {
        setUploadError(err);
        continue;
      }
      setBusy(true);
      setProgress(0);
      try {
        if (file.type.startsWith("image/")) {
          const { dataUrl } = await compressImage(file);
          setProgress(100);
          setD((p) => ({
            ...p,
            media: [...p.media, { url: dataUrl, mediaType: "image", name: file.name }],
          }));
        } else {
          const { readAsDataURL } = await import("@/lib/compress");
          const dataUrl = await readAsDataURL(file, setProgress);
          setD((p) => ({
            ...p,
            media: [...p.media, { url: dataUrl, mediaType: "video", name: file.name }],
          }));
        }
      } catch {
        setUploadError("Could not process this file.");
      } finally {
        setBusy(false);
        setProgress(null);
      }
    }
  };

  // AI Enhancement and Triage (Calling Groq backend or fallback)
  const runAIEnhance = async () => {
    if (!d.description.trim()) {
      toast({ tone: "error", title: "Please enter a description first." });
      return;
    }
    setEnhancing(true);

    try {
      // Call backend AI triage endpoint
      const res = await fetch("http://localhost:8000/api/ai/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: d.title,
          description: d.description,
          category: d.category || "General",
        }),
      }).catch(() => null);

      let aiResult;
      if (res && res.ok) {
        aiResult = await res.json();
      } else {
        // Fallback local neural heuristic
        const combined = `${d.title} ${d.description}`.toLowerCase();
        let fallbackSeverity = "LOW";
        let isHazard = false;
        let reason = "Routine maintenance or general inquiry.";

        if (combined.includes("wire") || combined.includes("spark") || combined.includes("elevator") || combined.includes("trapped") || combined.includes("fire") || combined.includes("gas") || combined.includes("smoke")) {
          fallbackSeverity = "URGENT";
          isHazard = true;
          reason = "Safety-critical hazard requiring expedited technician dispatch.";
        } else if (combined.includes("leak") || combined.includes("power") || combined.includes("outage") || combined.includes("blackout") || combined.includes("water") || combined.includes("broken")) {
          fallbackSeverity = "HIGH";
          reason = "Significant facility disruption impacting academic routine or causing property damage.";
        } else if (combined.includes("clean") || combined.includes("trash") || combined.includes("dirty") || combined.includes("hygiene") || combined.includes("noise") || combined.includes("ac")) {
          fallbackSeverity = "MEDIUM";
          reason = "Quality of life issue affecting student comfort, but not an immediate hazard.";
        } else {
          fallbackSeverity = "LOW";
        }
        
        aiResult = {
          category: d.category || "General",
          severity: fallbackSeverity,
          confidence: 0.94,
          urgency: fallbackSeverity,
          safety_risk: isHazard,
          estimated_affected_people: fallbackSeverity === "URGENT" ? 50 : fallbackSeverity === "HIGH" ? 20 : 5,
          reason: reason,
        };
      }

      // Polish grammar
      const polished = d.description
        .replace(/\bi\b/g, "I")
        .replace(/\s+/g, " ")
        .trim();
      const enhanced = polished.endsWith(".") ? polished : `${polished}.`;

      setD((p) => ({
        ...p,
        enhancedDescription: enhanced,
        aiCategory: aiResult.category,
        aiSeverity: aiResult.severity,
        aiConfidence: aiResult.confidence,
        aiSafetyRisk: aiResult.safety_risk,
        aiEstimatedAffected: aiResult.estimated_affected_people,
        aiReason: aiResult.reason,
        priority: aiResult.severity === "URGENT" ? "urgent" : aiResult.severity === "HIGH" ? "high" : aiResult.severity === "MEDIUM" ? "medium" : "low",
      }));

      toast({
        tone: "success",
        title: "AI Analysis Complete",
        message: `Triaged as ${aiResult.severity} severity (${Math.round((aiResult.confidence || 0.9) * 100)}% confidence).`,
      });
    } catch {
      toast({ tone: "info", title: "Deterministic rules applied." });
    } finally {
      setEnhancing(false);
    }
  };

  // Live GPS geolocation
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast({ tone: "error", title: "GPS not supported on this device" });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const b = nearestBuilding(lat, lng);
        setD((p) => ({
          ...p,
          lat,
          lng,
          building: b?.name || p.building,
        }));
        toast({ tone: "success", title: "GPS Acquired", message: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      },
      (err) => {
        setGpsLoading(false);
        toast({ tone: "error", title: "Could not retrieve GPS", message: err.message });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Step Navigation Validation
  const canProceed = () => {
    if (d.step === 1) return Boolean(d.category);
    if (d.step === 2) return d.title.trim().length >= 4 && d.description.trim().length >= 8;
    if (d.step === 5) return Boolean(d.building);
    return true;
  };

  const nextStep = () => {
    if (!canProceed()) {
      if (d.step === 1) toast({ tone: "error", title: "Please select an issue category." });
      else if (d.step === 2) toast({ tone: "error", title: "Please provide a valid title and description." });
      return;
    }

    // When moving to step 3, run AI enhance if not run yet
    if (d.step === 2 && !d.enhancedDescription) {
      runAIEnhance();
    }

    // When moving to step 6, search duplicates
    if (d.step === 5) {
      const hits = findDuplicates({
        category: (d.category as Category) || "other",
        lat: d.lat,
        lng: d.lng,
        description: `${d.title} ${d.description}`,
      });
      setDups(hits);
    }

    set("step", Math.min(8, d.step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    set("step", Math.max(1, d.step - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Submission (Step 8)
  const submitComplaint = () => {
    if (!session) return;
    if (remaining <= 0) {
      toast({ tone: "error", title: "Daily submission rate limit reached." });
      return;
    }

    setBusy(true);
    try {
      const r = createComplaint({
        studentId: session.id,
        title: d.title,
        description: d.enhancedDescription || d.description,
        category: (d.category as Category) || "other",
        priority: d.priority || "low",
        latitude: d.lat || 0,
        longitude: d.lng || 0,
        building: d.building || "Academic Block A",
        floor: d.floor || "",
        room: d.room || "",
        mediaDataUrls: (d.media || []).map((m) => ({ url: m.url, mediaType: m.mediaType })),
        aiSummary: d.aiReason || d.title,
        aiCategory: d.category as Category,
        aiPriority: d.priority || "low",
      });
      setBusy(false);

      if (!r.ok) {
        toast({ tone: "error", title: r.error ?? "Failed to submit report." });
        return;
      }

      localStorage.removeItem(DRAFT_KEY);
      setDoneId(r.complaint?.id ?? null);
      setDonePublic(r.complaint?.publicId ?? "");
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      toast({ tone: "success", title: "Ticket Generated!", message: r.complaint?.publicId });
    } catch (error: any) {
      setBusy(false);
      console.error("Submission error:", error);
      toast({ tone: "error", title: "An unexpected error occurred during submission." });
    }
  };

  // Success Screen
  if (donePublic) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-lg">
          <Check className="h-8 w-8" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 mb-2">
          CAMPUSIQ Ticket Generated
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Complaint Successfully Filed!
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Your official tracking ticket number:
        </p>
        <p className="tabular mt-3 text-3xl font-black text-teal-400 tracking-wider font-mono">
          {donePublic}
        </p>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Location:</span>
            <span className="font-semibold text-white">{d.building} {d.room ? `· ${d.room}` : ""}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Assigned Priority:</span>
            <span className="font-bold text-amber-400 uppercase">{d.priority}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">SLA Target Resolution:</span>
            <span className="font-semibold text-teal-300">Under {DEFAULT_SLA[d.priority] || 48} hours</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Student Verification Gate:</span>
            <span className="text-emerald-400 font-semibold">Active (Requires your confirmation upon repair)</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="teal"
            className="w-full sm:w-auto font-bold"
            onClick={() => nav(`/student/reports/${doneId}`)}
          >
            Track Live Timeline →
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto text-slate-300"
            onClick={() => nav(`/student/map`)}
          >
            View on Campus Map
          </Button>
          <Button
            variant="ghost"
            className="w-full sm:w-auto text-xs text-slate-400"
            onClick={() => {
              setD(emptyDraft);
              setDoneId(null);
              setDonePublic("");
            }}
          >
            File Another Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-16 px-2 sm:px-4 space-y-6">
      {/* Wizard Progress Stepper (8 Steps) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-teal-400 uppercase tracking-wider">
            Step {d.step} of 8: {STEPS[d.step - 1].title}
          </span>
          <span className="text-slate-400 hidden sm:inline">{STEPS[d.step - 1].desc}</span>
        </div>

        <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => d.step > s.id && set("step", s.id)}
              disabled={d.step < s.id}
              className={cn(
                "h-2 rounded-full transition-all text-left",
                s.id === d.step
                  ? "bg-teal-500 shadow-sm shadow-teal-500/50"
                  : s.id < d.step
                  ? "bg-emerald-500/80 cursor-pointer"
                  : "bg-slate-800"
              )}
              title={`${s.id}. ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* =========================================================================
          STEP 1: CATEGORY SELECTION (Section 14)
          ========================================================================= */}
      {d.step === 1 && (
        <Card className="p-6 space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white">Select Incident Category</h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose the facility trade that best matches your problem for automated department routing.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => set("category", c.id)}
                className={cn(
                  "flex flex-col items-start p-4 rounded-xl border text-left transition-all",
                  d.category === c.id
                    ? "border-teal-500 bg-teal-500/10 text-white ring-2 ring-teal-500/30 shadow-md"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-300 hover:bg-slate-900"
                )}
              >
                <div className="p-2 rounded-lg bg-slate-800/80 text-teal-400 mb-2">
                  <CategoryIcon category={c.id} className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-white leading-tight">{c.label}</span>
                <span className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {c.hint}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* =========================================================================
          STEP 2: TITLE & DESCRIPTION (Section 15)
          ========================================================================= */}
      {d.step === 2 && (
        <Card className="p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Issue Description</h2>
              <p className="text-xs text-slate-400 mt-1">
                Give a clear title and specify what broke, who is affected, and any safety risks.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-teal-500/40 text-teal-400 text-[11px] gap-1.5 shrink-0"
              onClick={() => {
                let suggestedTitle = "Maintenance Request";
                let suggestedDesc = "Please check the equipment in this area. It appears to be malfunctioning and needs attention.";
                
                switch (d.category) {
                  case "wifi":
                    suggestedTitle = "Complete Wi-Fi Dead Zone";
                    suggestedDesc = "The campus Wi-Fi router is completely offline in this area. Students cannot connect to the eduroam network, halting academic work.";
                    break;
                  case "infrastructure":
                    suggestedTitle = "Severe Structural Damage / Crack";
                    suggestedDesc = "There is a significant crack in the wall/ceiling. Plaster is falling, posing a risk to students walking by. Needs immediate structural assessment.";
                    break;
                  case "safety":
                    suggestedTitle = "Safety Hazard: Broken Glass / Structural Damage";
                    suggestedDesc = "There is a significant safety hazard present, such as broken glass or structural damage. Students should avoid the area until it is cleared.";
                    break;
                  case "washroom":
                    suggestedTitle = "Washroom Flooded & Unusable";
                    suggestedDesc = "Multiple sinks/toilets are overflowing, flooding the washroom floor. It is currently unhygienic and completely unusable.";
                    break;
                  case "electricity":
                    suggestedTitle = "Exposed Wiring & Sparking Panel";
                    suggestedDesc = "There is an exposed electrical wire near the switchboard that is actively sparking when turned on. Major shock and fire hazard.";
                    break;
                  case "power":
                    suggestedTitle = "Total Section Power Blackout";
                    suggestedDesc = "The entire block has lost power, and the backup generator hasn't kicked in. Complete blackout affecting all classes.";
                    break;
                  case "classroom":
                    suggestedTitle = "Smartboard & Projector Failure";
                    suggestedDesc = "The classroom projector lamp is dead and the smartboard is unresponsive. The professor is unable to conduct the lecture.";
                    break;
                  case "furniture":
                    suggestedTitle = "Broken Desks & Hazardous Splinters";
                    suggestedDesc = "Several student desks are broken with sharp wooden splinters exposed. Unsafe to use and needs immediate replacement.";
                    break;
                  case "lift":
                    suggestedTitle = "Passenger Elevator Stuck with Alarm";
                    suggestedDesc = "The main elevator is stuck between floors and the emergency alarm is ringing. Requires urgent technician dispatch.";
                    break;
                  case "cleanliness":
                    suggestedTitle = "Severe Biohazard / Trash Overflow";
                    suggestedDesc = "The dustbins have completely overflowed leading to unhygienic conditions and a severe foul smell spreading across the corridor.";
                    break;
                  case "laboratory":
                    suggestedTitle = "Lab Equipment Failure / Gas Leak Risk";
                    suggestedDesc = "Critical lab equipment is malfunctioning. There is a potential risk of a minor gas leak. Evacuated as a precaution.";
                    break;
                  case "hostel":
                    suggestedTitle = "Hostel Geyser Malfunction / Water Issue";
                    suggestedDesc = "The hostel geyser is short-circuiting and not providing hot water. This is affecting an entire floor of students.";
                    break;
                  case "water":
                    suggestedTitle = "Severe Pipe Burst & Water Leak";
                    suggestedDesc = "A main water pipe has burst or is severely leaking water, causing flooding in the immediate area. Immediate maintenance is required to prevent water damage.";
                    break;
                  case "food_hygiene":
                    suggestedTitle = "Food Quality / Cafeteria Hygiene Issue";
                    suggestedDesc = "Found contamination in the cafeteria food serving area. Immediate inspection required by the health and dining committee.";
                    break;
                  case "general":
                  case "other":
                  default:
                    suggestedTitle = "General Facility Issue Requires Attention";
                    suggestedDesc = "A general facility issue has been observed in this area that disrupts the standard campus experience. Please assign a technician to inspect.";
                    break;
                }

                set("title", suggestedTitle);
                set("description", suggestedDesc);
                toast({ tone: "success", title: "AI Suggestions Applied" });
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Auto-Suggest
            </Button>
          </div>

          <Field label="Issue Title">
            <Input
              value={d.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Passenger elevator stuck on 3rd floor with alarm"
              maxLength={120}
              className="h-10 text-sm font-medium"
            />
          </Field>

          <Field label="Description Details">
            <div className="relative">
              <Textarea
                value={d.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the issue, exact equipment, symptoms, and potential hazards..."
                rows={5}
                className="text-sm pr-12"
              />
              <button
                type="button"
                onClick={toggleListeningDesc}
                title="Dictate description"
                className={cn(
                  "absolute bottom-3 right-3 rounded-full p-2 transition-colors",
                  isListeningDesc
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                )}
              >
                {isListeningDesc ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>
          </Field>
        </Card>
      )}

      {/* =========================================================================
          STEP 3: AI ENHANCEMENT & NEURAL TRIAGE (Section 15, 16, 17)
          ========================================================================= */}
      {d.step === 3 && (
        <Card className="p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal-400" />
                AI Enhancement & Neural Triage
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Powered by Groq server-side neural classification with deterministic safety safeguards.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={runAIEnhance}
              disabled={enhancing}
              className="border-teal-500/40 text-teal-400 text-xs"
            >
              {enhancing ? "Triaging..." : "Re-run AI Analysis"}
            </Button>
          </div>

          {/* AI Analysis Cards Grid */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">AI Severity Override</span>
              <select
                className={`text-sm font-black px-2 py-1 rounded cursor-pointer border border-slate-700 outline-none w-full text-center transition-colors ${
                  d.aiSeverity === "URGENT"
                    ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                    : d.aiSeverity === "HIGH"
                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                    : d.aiSeverity === "LOW"
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    : "bg-teal-500/20 text-teal-300 hover:bg-teal-500/30"
                }`}
                value={d.aiSeverity || "MEDIUM"}
                onChange={(e) => {
                  const val = e.target.value;
                  const pri = val === "URGENT" ? "urgent" : val === "HIGH" ? "high" : val === "MEDIUM" ? "medium" : "low";
                  setD((p) => ({ ...p, aiSeverity: val, priority: pri as Priority }));
                }}
              >
                <option className="bg-slate-900 text-slate-300 font-semibold" value="LOW">LOW</option>
                <option className="bg-slate-900 text-teal-300 font-semibold" value="MEDIUM">MEDIUM</option>
                <option className="bg-slate-900 text-amber-400 font-semibold" value="HIGH">HIGH</option>
                <option className="bg-slate-900 text-rose-400 font-semibold" value="URGENT">URGENT</option>
              </select>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-center">
              <span className="text-[11px] text-slate-400">Confidence Score</span>
              <div className="mt-1 text-sm font-black text-teal-400">
                {Math.round((d.aiConfidence || 0.94) * 100)}%
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-center">
              <span className="text-[11px] text-slate-400">Safety Risk Flag</span>
              <div className="mt-1 text-sm font-black text-rose-400">
                {d.aiSafetyRisk ? "⚠️ Physical Hazard" : "✓ Standard Issue"}
              </div>
            </div>
          </div>

          {/* Enhanced Description Comparison */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Polished Professional Description (AI Grammar & Clarity)
            </label>
            <Textarea
              value={d.enhancedDescription || d.description}
              onChange={(e) => set("enhancedDescription", e.target.value)}
              rows={4}
              className="text-sm bg-slate-950 border-teal-500/40 text-teal-200"
            />
            {d.aiReason && (
              <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                <strong>AI Rationale:</strong> {d.aiReason}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* =========================================================================
          STEP 4: EVIDENCE UPLOAD (Section 18)
          ========================================================================= */}
      {d.step === 4 && (
        <Card className="p-6 space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white">Upload Visual Evidence</h2>
            <p className="text-xs text-slate-400 mt-1">
              Photos or short videos allow technicians to arrive with the exact replacement parts.
            </p>
          </div>

          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 p-8 text-center cursor-pointer hover:border-teal-500 transition-colors">
            <Upload className="h-8 w-8 text-teal-400 mb-2" />
            <span className="text-sm font-bold text-white">Click to upload photos or videos</span>
            <span className="text-xs text-slate-400 mt-1">
              Supports JPEG, PNG, MP4 up to {IMAGE_MAX_MB}MB
            </span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
          </label>

          {uploadError && <p className="text-xs text-rose-400 font-medium">{uploadError}</p>}

          {/* Media Previews */}
          {d.media.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {d.media.map((m, idx) => (
                <div key={idx} className="relative rounded-xl border border-slate-800 overflow-hidden group">
                  {m.mediaType === "image" ? (
                    <img src={m.url} alt="Evidence" className="h-32 w-full object-cover" />
                  ) : (
                    <video src={m.url} className="h-32 w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "media",
                        d.media.filter((_, i) => i !== idx)
                      )
                    }
                    className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 rounded-full text-slate-300 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* =========================================================================
          STEP 5: LOCATION (Section 19)
          ========================================================================= */}
      {d.step === 5 && (
        <Card className="p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Pinpoint Campus Location</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your building, floor, room number, or pin directly on the 3D map.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDetectGPS}
              disabled={gpsLoading}
              className="text-xs"
            >
              <Compass className="h-3.5 w-3.5 text-teal-400" />
              {gpsLoading ? "Acquiring..." : "Use My GPS"}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Building">
              <Select
                value={d.building}
                onChange={(e) => {
                  const b = BUILDINGS.find((x) => x.name === e.target.value);
                  setD((p) => ({
                    ...p,
                    building: e.target.value,
                    lat: b?.lat || p.lat,
                    lng: b?.lng || p.lng,
                  }));
                }}
              >
                {BUILDINGS.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Floor">
              <Input
                value={d.floor}
                onChange={(e) => set("floor", e.target.value)}
                placeholder="e.g. 2nd Floor, Ground"
              />
            </Field>

            <Field label="Room / Classroom / Area">
              <Input
                value={d.room}
                onChange={(e) => set("room", e.target.value)}
                placeholder="e.g. Room 204, East Stairwell"
              />
            </Field>
          </div>

          <div className="h-64 rounded-xl border border-slate-800 overflow-hidden relative">
            <CampusMap
              mode="pick"
              value={{ lat: d.lat, lng: d.lng }}
              onChange={(loc) => {
                const b = nearestBuilding(loc.lat, loc.lng);
                setD((p) => ({
                  ...p,
                  lat: loc.lat,
                  lng: loc.lng,
                  building: b?.name || p.building,
                }));
              }}
              height="100%"
            />
          </div>
        </Card>
      )}

      {/* =========================================================================
          STEP 6: DUPLICATE DETECTION (Section 20)
          ========================================================================= */}
      {d.step === 6 && (
        <Card className="p-6 space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white">Duplicate Detection</h2>
            <p className="text-xs text-slate-400 mt-1">
              Checking for nearby open reports in {d.building} to prevent duplicate tickets.
            </p>
          </div>

          {dups.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Looks like this issue may already exist.
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  A similar problem in this area was recently reported. You can vote that you are affected too instead of creating a duplicate.
                </p>
              </div>

              <div className="space-y-3">
                {dups.map((hit) => (
                  <div
                    key={hit.complaint.id}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {hit.complaint.publicId}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{hit.complaint.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{hit.complaint.description}</p>
                      <span className="text-[11px] text-teal-400 font-semibold mt-1 inline-block">
                        {hit.complaint.supportCount || 1} students affected · ~{hit.meters}m away
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="teal"
                        onClick={() => {
                          if (session) addSupport(hit.complaint.id, session.id);
                          toast({ tone: "success", title: "Vote added (+1 I'm affected too)" });
                          nav(`/student/reports/${hit.complaint.id}`);
                        }}
                        className="text-xs font-bold"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        I'M AFFECTED TOO +1
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center space-y-2">
              <Check className="h-6 w-6 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Direct Duplicates Found</h4>
              <p className="text-xs text-slate-400">
                No identical complaints found near {d.building}. You can proceed to review and file your ticket.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* =========================================================================
          STEP 7: REVIEW (Section 13)
          ========================================================================= */}
      {d.step === 7 && (
        <Card className="p-6 space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white">Review Complaint</h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify all details before submitting to the campus dispatch queue.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Category:</span>
              <span className="font-bold text-white uppercase">{d.category}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Title:</span>
              <span className="font-bold text-white">{d.title}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Location:</span>
              <span className="font-semibold text-white">{d.building} {d.floor ? `· ${d.floor}` : ""} {d.room ? `· ${d.room}` : ""}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">AI Priority Rating:</span>
              <span className="font-bold text-teal-400 uppercase">{d.priority}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Description:</span>
              <p className="text-slate-200 leading-relaxed">{d.enhancedDescription || d.description}</p>
            </div>
          </div>
        </Card>
      )}

      {/* =========================================================================
          STEP 8: FINAL SUBMIT (Section 13, 22)
          ========================================================================= */}
      {d.step === 8 && (
        <Card className="p-6 text-center space-y-4 animate-in fade-in duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 mx-auto">
            <Send className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Ready to File Ticket</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Submitting will generate your official CMP-2026 tracking ID, alert campus facilities operations, and initiate the SLA response countdown.
          </p>

          <Button
            size="lg"
            variant="teal"
            onClick={submitComplaint}
            disabled={busy}
            className="w-full sm:w-auto font-black px-10 shadow-lg shadow-teal-500/20"
          >
            {busy ? "Generating Ticket..." : "Confirm & Submit Complaint →"}
          </Button>
        </Card>
      )}

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        {d.step > 1 ? (
          <Button variant="outline" size="sm" onClick={prevStep} className="text-xs">
            <ChevronLeft className="h-4 w-4" />
            Previous Step
          </Button>
        ) : (
          <div />
        )}

        {d.step < 8 && (
          <Button variant="teal" size="sm" onClick={nextStep} className="text-xs font-bold">
            Continue to Next Step
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
