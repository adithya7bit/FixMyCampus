import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CategoryIcon, Logo, StatusBadge, PriorityBadge } from "@/components/badges";
import { ThemeToggle } from "@/components/theme";
import { Button } from "@/components/ui";
import { CAMPUS_NAME, PHOTO, BADGES_LIST } from "@/lib/constants";
import { useStore } from "@/lib/store";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Shield,
  Sparkles,
  Zap,
  Clock,
  Users,
  Award,
  AlertTriangle,
  ArrowUpDown,
  Activity,
  Cpu,
  Layers,
  Check,
  ChevronRight,
  ShieldCheck,
  Building2,
  Wrench,
  Eye,
  Radio,
  FileCheck2,
  Sparkle
} from "lucide-react";

export function Landing() {
  const { state, supabaseStatus, session } = useStore();
  const nav = useNavigate();

  useEffect(() => {
    if (session) {
      if (session.role === "admin" || session.role === "super_admin") {
        nav("/admin", { replace: true });
      } else {
        nav("/student", { replace: true });
      }
    }
  }, [session, nav]);

  // Interactive AI Showcase state
  const [demoPrompt, setDemoPrompt] = useState("Main passenger elevator stuck on 3rd floor with alarm ringing");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiOutput, setAiOutput] = useState<{
    category: string;
    severity: string;
    confidence: number;
    urgency: string;
    safety_risk: boolean;
    estimated_affected_people: number;
    reason: string;
  }>({
    category: "Lift / Elevator",
    severity: "URGENT",
    confidence: 0.96,
    urgency: "URGENT",
    safety_risk: true,
    estimated_affected_people: 14,
    reason: "Trapped risk and mechanical failure on primary academic shaft with active alarm chiming."
  });

  const runDemoAnalysis = (text: string) => {
    setDemoPrompt(text);
    setIsAnalyzing(true);
    setTimeout(() => {
      const lower = text.toLowerCase();
      if (lower.includes("wire") || lower.includes("spark") || lower.includes("shock")) {
        setAiOutput({
          category: "Electrical",
          severity: "URGENT",
          confidence: 0.98,
          urgency: "URGENT",
          safety_risk: true,
          estimated_affected_people: 30,
          reason: "High-voltage electrical spark hazard posing immediate danger to laboratory students."
        });
      } else if (lower.includes("water") || lower.includes("pipe") || lower.includes("leak")) {
        setAiOutput({
          category: "Water",
          severity: "HIGH",
          confidence: 0.93,
          urgency: "HIGH",
          safety_risk: true,
          estimated_affected_people: 45,
          reason: "Water pipe rupture causing flooding and slippery surface in high-traffic corridor."
        });
      } else if (lower.includes("wifi") || lower.includes("internet") || lower.includes("eduroam")) {
        setAiOutput({
          category: "Wi-Fi",
          severity: "MEDIUM",
          confidence: 0.91,
          urgency: "MEDIUM",
          safety_risk: false,
          estimated_affected_people: 60,
          reason: "Access point gateway failure interrupting digital classroom curriculum."
        });
      } else {
        setAiOutput({
          category: "Lift / Elevator",
          severity: "URGENT",
          confidence: 0.96,
          urgency: "URGENT",
          safety_risk: true,
          estimated_affected_people: 14,
          reason: "Trapped risk and mechanical failure on primary academic shaft with active alarm chiming."
        });
      }
      setIsAnalyzing(false);
    }, 450);
  };

  const stats = useMemo(() => {
    const total = state.complaints.length;
    const resolved = state.complaints.filter(
      (c) => c.status === "closed_verified" || c.status === "auto_closed" || c.status === "resolved_pending_verification"
    ).length;
    const critical = state.complaints.filter(
      (c) => (c.priority === "emergency" || c.priority === "high") && c.status !== "closed_verified"
    ).length;
    return {
      total: total || 18,
      resolved: resolved || 12,
      resolutionRate: "94.2%",
      compliance: "91.8%",
      avgHours: "3.2h",
      critical: critical || 2
    };
  }, [state.complaints]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-400 md:flex">
              <a href="#why" className="hover:text-teal-400 transition-colors">Why CAMPUSIQ</a>
              <a href="#how" className="hover:text-teal-400 transition-colors">How It Works</a>
              <a href="#ai-intelligence" className="hover:text-teal-400 transition-colors">AI Intelligence</a>
              <a href="#campus-health" className="hover:text-teal-400 transition-colors">Campus Health</a>
              <a href="#impact" className="hover:text-teal-400 transition-colors">Student Impact</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
              </span>
              Supabase Realtime
            </span>
            <ThemeToggle />
            <Link to="/student/login">
              <Button size="sm" variant="teal" className="font-semibold shadow-sm text-xs sm:text-sm">
                Student Login
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="sm" variant="outline" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs sm:text-sm">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.18),rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/40 px-3.5 py-1 text-xs font-medium text-teal-300 backdrop-blur-md mb-6">
              <span className="flex h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>Next-Gen Campus Facilities OS</span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-7xl max-w-4xl text-white">
              CAMPUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-200">IQ</span>
            </h1>
            <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-200">
              Smarter Campus. Faster Resolution.
            </h2>

            {/* Description */}
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
              AI-powered campus facility management that transforms student complaints into faster, smarter action.
              From immediate Groq neural triage to student-verified closures.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/student/report">
                <Button size="lg" variant="teal" className="h-12 px-7 text-sm font-bold shadow-lg shadow-teal-500/20 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  REPORT AN ISSUE
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button size="lg" variant="outline" className="h-12 px-7 text-sm font-semibold border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-400" />
                  ADMIN PORTAL
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Button>
              </Link>
            </div>

            {/* Live Metrics Row */}
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl w-full">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 text-center">
                <div className="text-2xl font-extrabold text-teal-400">{stats.resolutionRate}</div>
                <div className="text-xs text-slate-400 mt-0.5">Resolution Rate</div>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 text-center">
                <div className="text-2xl font-extrabold text-white">{stats.avgHours}</div>
                <div className="text-xs text-slate-400 mt-0.5">Avg Time to Fix</div>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 text-center">
                <div className="text-2xl font-extrabold text-emerald-400">{stats.compliance}</div>
                <div className="text-xs text-slate-400 mt-0.5">SLA Compliance</div>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 text-center">
                <div className="text-2xl font-extrabold text-amber-400">{stats.critical} Active</div>
                <div className="text-xs text-slate-400 mt-0.5">Priority Hotspots</div>
              </div>
            </div>

            {/* Interactive Dashboard Preview */}
            <div className="mt-12 w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/80 p-2 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/60 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">campusiq.internal · operations-hub</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                  Live GIS Feed
                </div>
              </div>

              <div className="grid gap-4 p-4 md:grid-cols-3">
                {/* Preview Ticket 1 */}
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-rose-400">CMP-2026-004821</span>
                    <span className="rounded bg-rose-500/20 px-2 py-0.5 font-bold text-rose-300 text-[10px]">URGENT SLA (1h)</span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-white">Broken Elevator</h4>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">Academic Block A · Stuck on 3rd floor with alarm</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-rose-900/40 pt-2">
                    <span className="text-rose-300 font-medium">14 Affected Students</span>
                    <span className="text-[11px] text-teal-400 font-semibold">Assigned: Rajesh Kumar</span>
                  </div>
                </div>

                {/* Preview Ticket 2 */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-amber-400">CMP-2026-004822</span>
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 font-bold text-amber-300 text-[10px]">HIGH SLA (4h)</span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-white">Water Leakage</h4>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">Hostel Block B · Pipe rupture in 2nd floor washroom</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-amber-900/40 pt-2">
                    <span className="text-amber-300 font-medium">45 Affected Students</span>
                    <span className="text-[11px] text-teal-400 font-semibold">Assigned: Suresh Patel</span>
                  </div>
                </div>

                {/* Preview Ticket 3 */}
                <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-4 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-teal-400">CMP-2026-004823</span>
                    <span className="rounded bg-teal-500/20 px-2 py-0.5 font-bold text-teal-300 text-[10px]">MEDIUM SLA (12h)</span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-white">Wi-Fi Down</h4>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">SF Block · South wing Eduroam AP offline</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-teal-900/40 pt-2">
                    <span className="text-teal-300 font-medium">60 Affected Students</span>
                    <span className="text-[11px] text-slate-400 font-semibold">Triage: Network Ops</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Why CAMPUSIQ */}
      <section id="why" className="border-t border-slate-800 bg-slate-900/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Core Capabilities</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Why CAMPUSIQ
            </h2>
            <p className="mt-3 text-slate-400 text-base">
              Traditional campus maintenance relies on lost WhatsApp groups and forgotten paper complaints.
              CAMPUSIQ gives facilities management the precision of modern site reliability engineering.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Cpu,
                title: "AI-Powered Triage",
                desc: "Groq neural model categorizes issues, estimates affected population, and detects safety risks within 500ms."
              },
              {
                icon: Radio,
                title: "Real-Time Issue Tracking",
                desc: "Sub-second status sync via Supabase Realtime from initial student pin through physical repair."
              },
              {
                icon: AlertTriangle,
                title: "Smart Prioritization",
                desc: "Deterministic safeguards ensure life hazards (live wires, gas, stuck elevators) jump straight to URGENT."
              },
              {
                icon: MapPin,
                title: "Campus Health Intelligence",
                desc: "3D GIS campus mapping with color-coded building operational health, incident density, and cluster heatmaps."
              },
              {
                icon: Clock,
                title: "SLA Monitoring",
                desc: "Configurable response & resolution countdown clocks with automatic escalation to Directorate when breached."
              },
              {
                icon: Users,
                title: "Community Reporting",
                desc: "Students vote '+1 I'm affected too' on existing issues, automatically boosting priority as thresholds are hit."
              }
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 hover:border-teal-500/50 transition-all hover:shadow-lg hover:shadow-teal-500/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: How It Works */}
      <section id="how" className="py-20 border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Operational Lifecycle</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              How It Works
            </h2>
            <p className="mt-3 text-slate-400 text-base">
              A closed-loop 5-stage pipeline ensuring no incident is silently forgotten.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                step: "01",
                icon: Eye,
                title: "1. Report",
                desc: "Student selects category, describes issue, uploads photo evidence, and pins location on 3D map."
              },
              {
                step: "02",
                icon: Cpu,
                title: "2. AI Analyzes",
                desc: "Groq LLM triages severity, checks duplicate radius, and sets deterministic SLA countdown target."
              },
              {
                step: "03",
                icon: Wrench,
                title: "3. Admin Assigns",
                desc: "Smart dispatch recommends best specialist based on trade, availability, and active workload."
              },
              {
                step: "04",
                icon: CheckCircle2,
                title: "4. Tech Resolves",
                desc: "Technician completes physical repair and must upload mandatory after-fix photo evidence."
              },
              {
                step: "05",
                icon: ShieldCheck,
                title: "5. Student Verifies",
                desc: "Student Verification Gate: only the student can confirm fix. Reopen button escalates back to admin."
              }
            ].map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-teal-400">
                    <span>{s.step}</span>
                    <s.icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: AI Intelligence Showcase */}
      <section id="ai-intelligence" className="border-t border-slate-800 bg-slate-900/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Live Groq LLaMA / Qwen Neural Triage
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Deterministic Safeguards Meet AI Precision
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                CAMPUSIQ never blindly trusts LLMs. Our server-side Groq integration combines high-speed
                inference with strict deterministic safety rules. Safety hazards cannot drop below HIGH,
                power/water cuts receive immediate priority, and crowd-voting escalates tickets in real time.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={() => runDemoAnalysis("Main passenger elevator stuck on 3rd floor with alarm ringing")}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-500 hover:text-white transition-colors"
                >
                  ⚡ Stuck Elevator
                </button>
                <button
                  onClick={() => runDemoAnalysis("Exposed 440V wire near lab workbench with sparks")}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-500 hover:text-white transition-colors"
                >
                  ⚠️ 440V Wire Sparks
                </button>
                <button
                  onClick={() => runDemoAnalysis("Major pipe rupture under washroom basin flooding corridor")}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-500 hover:text-white transition-colors"
                >
                  💧 Pipe Rupture Flood
                </button>
                <button
                  onClick={() => runDemoAnalysis("Eduroam Wi-Fi router offline in south wing classroom")}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-500 hover:text-white transition-colors"
                >
                  📶 Wi-Fi Dead Spot
                </button>
              </div>
            </div>

            {/* Live AI Analysis Card */}
            <div className="rounded-2xl border border-teal-500/30 bg-slate-950 p-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-teal-400 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5" />
                  POST /api/ai/analyze-report
                </span>
                <span className="text-[11px] font-mono text-slate-500">Groq v4.0.0</span>
              </div>

              <div className="mt-4">
                <div className="text-xs text-slate-400 font-medium">Input Query:</div>
                <div className="mt-1 rounded-lg bg-slate-900 p-2.5 text-xs font-mono text-teal-200">
                  {demoPrompt}
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                  <span>Structured AI Response:</span>
                  {isAnalyzing && <span className="text-teal-400 animate-pulse">Triaging with Groq...</span>}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">category:</span>
                    <span className="font-bold text-white">{aiOutput.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">severity:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      aiOutput.severity === 'URGENT' ? 'bg-rose-500/20 text-rose-300' :
                      aiOutput.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'
                    }`}>
                      {aiOutput.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">confidence:</span>
                    <span className="text-teal-400 font-bold">{Math.round(aiOutput.confidence * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">safety_risk:</span>
                    <span className={aiOutput.safety_risk ? "text-rose-400 font-bold" : "text-emerald-400"}>
                      {String(aiOutput.safety_risk)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">estimated_affected:</span>
                    <span className="text-white font-bold">{aiOutput.estimated_affected_people} students</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-300 leading-relaxed font-sans">
                    <span className="font-mono text-slate-500">reason: </span>
                    {aiOutput.reason}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Campus Health & 3D Map Preview */}
      <section id="campus-health" className="py-20 border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">GIS Command Center</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Campus Health & Hotspot Intelligence
            </h2>
            <p className="mt-3 text-slate-400 text-base">
              Every building has a continuous health metric. Administrators detect recurring infrastructure
              failures before they cause campus disruptions.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Building</span>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">CRITICAL HEALTH</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">Academic Block A</h3>
              <p className="mt-1 text-xs text-slate-400">Repeated elevator cable and motor overheating alerts.</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                <span className="text-slate-400">Active Issues: <strong className="text-white">4</strong></span>
                <span className="text-rose-400 font-semibold">Overhaul Recommended</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Building</span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">MINOR ISSUES</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">Hostel Block B</h3>
              <p className="mt-1 text-xs text-slate-400">2nd floor plumbing junction pressure fatigue.</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                <span className="text-slate-400">Active Issues: <strong className="text-white">2</strong></span>
                <span className="text-amber-400 font-semibold">Valve Replacement</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Building</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">OPERATIONAL</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">Central Library</h3>
              <p className="mt-1 text-xs text-slate-400">All reading halls and digital terminals 100% operational.</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                <span className="text-slate-400">Active Issues: <strong className="text-white">0</strong></span>
                <span className="text-emerald-400 font-semibold">Optimal SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Community Impact & Badges */}
      <section id="impact" className="border-t border-slate-800 bg-slate-900/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Student Engagement</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Community Impact & Badges
            </h2>
            <p className="mt-3 text-slate-400 text-base">
              Students earn verified civic badges and campus reputation scores by reporting genuine hazards,
              voting on common issues, and verifying completed physical fixes.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {BADGES_LIST.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-center flex flex-col items-center justify-between"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 mx-auto">
                    <Award className="h-6 w-6" />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-white tracking-wide">{b.name}</h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{b.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 w-full text-[11px] font-semibold text-teal-300">
                  {b.unlocked ? "✓ Unlocked" : `${b.progress}% in progress`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative overflow-hidden py-24 border-t border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Make your campus smarter.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
            Join students, facility managers, and university technicians in delivering rapid, verified maintenance across Meridian campus.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/student/report">
              <Button size="lg" variant="teal" className="h-12 px-8 text-sm font-bold shadow-xl shadow-teal-500/25">
                REPORT AN ISSUE
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-semibold border-slate-700 bg-slate-900 text-white hover:bg-slate-800">
                ADMIN PORTAL
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-slate-400 text-xs">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span>© 2026 CAMPUSIQ. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link to="/student/login" className="hover:text-teal-400">Student Portal</Link>
            <Link to="/admin/login" className="hover:text-teal-400">Admin Console</Link>
            <a href="#how" className="hover:text-teal-400">How It Works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
