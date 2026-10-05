import { CampusMap } from "@/components/CampusMap";
import { CategoryIcon, PriorityBadge, StatusBadge } from "@/components/badges";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { suggestComplaint } from "@/lib/ai";
import { compressImage, validateFile } from "@/lib/compress";
import {
  BUILDINGS,
  CATEGORIES,
  DUPLICATE_METERS,
  IMAGE_MAX_MB,
  PRIORITIES,
  RATE_LIMIT_PER_DAY,
  VIDEO_MAX_MB,
} from "@/lib/constants";
import { categoryLabel } from "@/lib/format";
import { nearestBuilding } from "@/lib/geo";
import { useStore, type DuplicateHit } from "@/lib/store";
import type { Category, Priority } from "@/types";
import { cn } from "@/utils/cn";
import { 
  Check, 
  ChevronLeft, 
  Compass, 
  ImagePlus, 
  MapPin, 
  Navigation, 
  Send, 
  Sparkles, 
  X 
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DRAFT_KEY = "fmc-draft-v2";

interface Draft {
  step: 1 | 2;
  category: Category | "";
  title: string;
  description: string;
  media: { url: string; mediaType: "image" | "video"; name: string }[];
  lat: number;
  lng: number;
  building: string;
  floor: string;
  room: string;
  priority: Priority;
}

const empty: Draft = {
  step: 1,
  category: "",
  title: "",
  description: "",
  media: [],
  lat: 11.4984,
  lng: 77.2766,
  building: "Main Academic Block",
  floor: "",
  room: "",
  priority: "medium",
};

export function Report() {
  const { session, createComplaint, findDuplicates, addSupport, todayCount, toast } = useStore();
  const nav = useNavigate();
  const [d, setD] = useState<Draft>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? { ...empty, ...JSON.parse(raw) } : empty;
    } catch {
      return empty;
    }
  });
  const [busy, setBusy] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [suggestNote, setSuggestNote] = useState("");
  const [dups, setDups] = useState<DuplicateHit[]>([]);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [donePublic, setDonePublic] = useState("");

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  }, [d]);

  const remaining = session ? RATE_LIMIT_PER_DAY - todayCount(session.id) : RATE_LIMIT_PER_DAY;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!d.title && !d.description) return;
    const t = window.setTimeout(async () => {
      const s = await suggestComplaint({
        title: d.title,
        description: d.description,
        category: d.category || undefined,
      });
      if (!d.category && s.category) set("category", s.category);
      set("priority", s.priority);
      setSuggestNote(
        s.source === "ai"
          ? "AI detected suggestion — you can modify"
          : `Suggested from description${s.reasons[0] ? ` · ${s.reasons[0]}` : ""}`,
      );
    }, 450);
    return () => window.clearTimeout(t);
  }, [d.title, d.description]);

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
        setUploadError("Could not read that file.");
      } finally {
        setBusy(false);
        setProgress(null);
      }
    }
  };

  // Step 1 -> Step 2: Validate details and open the accurate Map section
  const goToLocationMap = () => {
    if (!d.category) return toast({ tone: "error", title: "Select an issue category" });
    if (d.title.trim().length < 5) return toast({ tone: "error", title: "Enter a brief descriptive title" });
    if (d.description.trim().length < 10)
      return toast({ tone: "error", title: "Please provide a little more detail in description" });

    // Look for duplicate hits within 50 meters
    if (d.lat && d.lng && d.category) {
      setDups(
        findDuplicates({
          category: d.category as Category,
          lat: d.lat,
          lng: d.lng,
          description: `${d.title} ${d.description}`,
        }),
      );
    }
    set("step", 2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Geolocation detector for live GPS
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
        toast({ tone: "success", title: "Live GPS acquired", message: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      },
      (err) => {
        setGpsLoading(false);
        toast({ tone: "error", title: "Could not retrieve GPS", message: err.message });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Final submission with the accurate coordinates and all complaint details
  const submitComplaint = () => {
    if (!session) return;
    if (remaining <= 0) {
      toast({ tone: "error", title: "Daily limit reached" });
      return;
    }
    setBusy(true);
    const r = createComplaint({
      studentId: session.id,
      title: d.title,
      description: d.description,
      category: d.category as Category,
      priority: d.priority,
      latitude: d.lat,
      longitude: d.lng,
      building: d.building || "Campus Area",
      floor: d.floor,
      room: d.room,
      mediaDataUrls: d.media.map((m) => ({ url: m.url, mediaType: m.mediaType })),
    });
    setBusy(false);

    if (!r.ok) {
      toast({ tone: "error", title: r.error ?? "Could not submit complaint" });
      return;
    }
    localStorage.removeItem(DRAFT_KEY);
    setDoneId(r.complaint?.id ?? null);
    setDonePublic(r.complaint?.publicId ?? "");
    toast({ tone: "success", title: "Complaint filed successfully!", message: r.complaint?.publicId });
  };

  const support = (id: string) => {
    if (!session) return;
    const r = addSupport(id, session.id);
    if (!r.ok) toast({ tone: "info", title: r.error ?? "Already supported" });
    else {
      toast({ tone: "success", title: "Added your support" });
      localStorage.removeItem(DRAFT_KEY);
      nav(`/student/complaints/${id}`);
    }
  };

  // --- Success Screen ---
  if (donePublic) {
    return (
      <div className="mx-auto max-w-lg py-12 px-4 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-lg">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Complaint Successfully Logged!
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your official tracking ticket number is:
        </p>
        <p className="tabular mt-2 text-2xl font-black text-brand-700 dark:text-teal-400 tracking-wider">
          {donePublic}
        </p>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
          📍 Accurately geotagged at <strong>{d.building}</strong> ({d.lat.toFixed(5)}, {d.lng.toFixed(5)}). Campus maintenance dispatch and automated notification queues have received this ticket.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button 
            variant="teal" 
            className="w-full sm:w-auto"
            onClick={() => nav(`/student/complaints/${doneId}`)}
          >
            Track Ticket & Timeline →
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => nav(`/student/map`)}
          >
            View on Campus 3D Map
          </Button>
          <Button
            variant="ghost"
            className="w-full sm:w-auto text-xs"
            onClick={() => {
              setD(empty);
              setDoneId(null);
              setDonePublic("");
            }}
          >
            File Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-10 px-2 sm:px-4">
      {/* Top Breadcrumb & Progress */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {d.step === 2 && (
            <button
              type="button"
              onClick={() => set("step", 1)}
              className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              aria-label="Back to details"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              {d.step === 1 ? "Step 1 of 2: Complaint Information" : "Step 2 of 2: Pinpoint Accurate Location"}
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {d.step === 1 ? "File a Campus Complaint" : "Accurate Location Pinpointing"}
            </h1>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
            d.step === 1 
              ? "bg-teal-600 text-white shadow-md ring-4 ring-teal-500/20" 
              : "bg-emerald-500 text-white"
          )}>
            {d.step > 1 ? "✓" : "1"}
          </div>
          <div className={cn("w-6 h-0.5", d.step === 2 ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700")} />
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
            d.step === 2 
              ? "bg-teal-600 text-white shadow-md ring-4 ring-teal-500/20" 
              : "bg-slate-200 dark:bg-slate-800 text-slate-500"
          )}>
            2
          </div>
        </div>
      </div>

      {/* =========================================================================
          STEP 1: COMPLAINT TYPE & ALL DETAILS
          ========================================================================= */}
      {d.step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Issue Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set("category", c.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                    d.category === c.id
                      ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/30 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 mb-1.5">
                    <CategoryIcon category={c.id} className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold leading-tight line-clamp-1">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <Field label="Complaint Title">
              <Input
                value={d.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Water leak near second-floor restrooms"
                maxLength={120}
                className="h-10 text-sm font-medium"
              />
            </Field>

            <Field label="Detailed Description">
              <Textarea
                value={d.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Explain what is broken or needed, exact spot, and how it impacts students..."
                rows={4}
                className="text-sm"
              />
            </Field>
          </div>

          {/* Photos / Media Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Photo or Video Evidence
              </p>
              <span className="text-[11px] text-slate-400">Max {IMAGE_MAX_MB}MB photo / {VIDEO_MAX_MB}MB video</span>
            </div>
            
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-6 text-sm text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all">
              <ImagePlus className="mb-1.5 h-6 w-6 text-teal-600 dark:text-teal-400" />
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Click or drag photos / videos here
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Supports camera capture on mobile</span>
              <input
                type="file"
                accept="image/*,video/*"
                capture="environment"
                multiple
                className="sr-only"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>

            {progress != null && (
              <div className="mt-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full bg-teal-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Processing file {progress}%</p>
              </div>
            )}
            {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}

            {d.media.length > 0 && (
              <ul className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {d.media.map((m, i) => (
                  <li key={i} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    {m.mediaType === "image" ? (
                      <img src={m.url} alt="" className="h-20 w-full object-cover" />
                    ) : (
                      <video src={m.url} className="h-20 w-full object-cover" />
                    )}
                    <button
                      type="button"
                      className="absolute top-1 right-1 rounded-full bg-slate-900/80 p-1 text-white hover:bg-red-600 transition-colors"
                      aria-label="Remove"
                      onClick={() => set("media", d.media.filter((_, j) => j !== i))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Urgency & Priority */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Urgency & Priority
              </label>
              {suggestNote && (
                <span className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                  <Sparkles className="h-3 w-3" />
                  {suggestNote}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set("priority", p.id)}
                  className={cn(
                    "flex flex-col p-3 rounded-xl border text-left transition-all",
                    d.priority === p.id
                      ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold capitalize">{p.label}</span>
                    <PriorityBadge priority={p.id} />
                  </div>
                  <span className="text-[10px] text-slate-500 leading-tight">{p.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Building / Block Initial Selection */}
          <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                Campus Building / Zone
              </span>
              <span className="text-[11px] text-slate-400">Pre-centers map in next step</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Building / Block">
                <Select
                  value={d.building}
                  onChange={(e) => {
                    const b = BUILDINGS.find((x) => x.name === e.target.value);
                    setD((p) => ({
                      ...p,
                      building: e.target.value,
                      lat: b?.lat ?? p.lat,
                      lng: b?.lng ?? p.lng,
                    }));
                  }}
                  className="h-9 text-xs"
                >
                  <option value="">Select a block</option>
                  {BUILDINGS.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Floor (Optional)">
                <Input
                  value={d.floor}
                  onChange={(e) => set("floor", e.target.value)}
                  placeholder="e.g. 2nd Floor"
                  className="h-9 text-xs"
                />
              </Field>

              <Field label="Room / Spot (Optional)">
                <Input
                  value={d.room}
                  onChange={(e) => set("room", e.target.value)}
                  placeholder="e.g. Lab 204 or Corridor"
                  className="h-9 text-xs"
                />
              </Field>
            </div>
          </div>

          {/* Proceed to Map Button */}
          <div className="pt-2">
            <Button 
              variant="teal" 
              className="w-full h-12 text-sm font-bold shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2"
              onClick={goToLocationMap}
            >
              <span>Next: Set Accurate Location on Map</span>
              <Navigation className="h-4 w-4" />
            </Button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              In the next step, tap or drag the target marker to send the exact incident coordinates.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: MAP SECTION — ONLY FOR ACCURATE LOCATION SENDING
          ========================================================================= */}
      {d.step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Location HUD & Precision Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  📍 {d.building || nearestBuilding(d.lat, d.lng).name}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Exact Coordinates: {d.lat.toFixed(5)}° N, {d.lng.toFixed(5)}° E
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs flex items-center gap-1.5"
                onClick={handleDetectGPS}
                loading={gpsLoading}
                title="Detect live GPS from your current device"
              >
                <Navigation className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>Use My Live GPS</span>
              </Button>

              <Select
                value={d.building}
                onChange={(e) => {
                  const b = BUILDINGS.find((x) => x.name === e.target.value);
                  if (b) {
                    setD((p) => ({
                      ...p,
                      building: b.name,
                      lat: b.lat,
                      lng: b.lng,
                    }));
                  }
                }}
                className="h-8 text-xs w-auto"
              >
                <option value="">Jump to Building</option>
                {BUILDINGS.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Interactive Map Component in Pick Mode */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-[#07090e]">
            {/* Instruction banner overlay */}
            <div className="absolute top-3 inset-x-3 z-10 pointer-events-none flex justify-center">
              <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-500/40 text-xs font-semibold text-teal-300 shadow-lg flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-400 animate-bounce" />
                <span>Tap or drag the red marker to set accurate location</span>
              </div>
            </div>

            <CampusMap
              mode="pick"
              value={{ lat: d.lat, lng: d.lng }}
              onChange={(loc) => {
                const b = nearestBuilding(loc.lat, loc.lng);
                setD((prev) => ({
                  ...prev,
                  lat: loc.lat,
                  lng: loc.lng,
                  building: loc.building || b?.name || prev.building,
                }));
              }}
              height={520}
              className="h-[520px] rounded-2xl border-0"
            />
          </div>

          {/* Nearby Duplicate Check Alert */}
          {dups.length > 0 && (
            <Card className="border-amber-400/40 bg-amber-500/10 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  ⚠️ {dups.length} Similar Issue{dups.length > 1 ? "s" : ""} Reported Nearby
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Within 50m</span>
              </div>
              <ul className="space-y-1.5">
                {dups.slice(0, 2).map((hit) => (
                  <li key={hit.complaint.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-amber-500/20 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{hit.complaint.title}</span>
                      <p className="text-[11px] text-slate-400">{Math.round(hit.meters)}m away · {hit.complaint.supportCount} supporters</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => support(hit.complaint.id)}>
                      +1 Add Support
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Complaint Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">{d.title}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 capitalize">{categoryLabel(d.category as Category)}</span>
              <span className="text-slate-400">·</span>
              <PriorityBadge priority={d.priority} />
            </div>
            <div className="text-slate-500 font-medium">
              {d.floor && `${d.floor} `}{d.room && `(${d.room})`}
            </div>
          </div>

          {/* Action Buttons: Back & Submit */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 text-xs font-semibold"
              onClick={() => set("step", 1)}
            >
              ← Back to Edit Details
            </Button>

            <Button
              type="button"
              variant="teal"
              className="flex-[2] h-11 text-sm font-bold shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2"
              onClick={submitComplaint}
              loading={busy}
            >
              <Send className="h-4 w-4" />
              <span>Confirm & Submit Complaint with this Location</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
