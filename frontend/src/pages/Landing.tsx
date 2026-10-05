import { CategoryIcon, Logo, StatusBadge } from "@/components/badges";
import { ThemeToggle } from "@/components/theme";
import { Button } from "@/components/ui";
import { CAMPUS_NAME, CATEGORIES, PHOTO } from "@/lib/constants";
import { hoursBetween } from "@/lib/format";
import { OPEN_STATUSES } from "@/lib/constants";
import { useStore } from "@/lib/store";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  MapPin,
  ShieldCheck,
  Wrench,
  GraduationCap,
  Shield,
  Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";

const LOOP = [
  { icon: Eye, title: "Report", body: "A student pins the problem, adds a photo, and files it in under a minute." },
  { icon: ClipboardCheck, title: "Assign", body: "Admin reviews, accepts, and hands it to the right worker — not a WhatsApp group." },
  { icon: Wrench, title: "Fix", body: "Work is tracked. Overdue items escalate. Nothing sits unseen." },
  { icon: ShieldCheck, title: "Verify", body: "Only the student can close it. If it isn’t fixed, it reopens." },
];

export function Landing() {
  const { state, signIn, supabaseStatus } = useStore();
  const nav = useNavigate();
  const stats = useMemo(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const resolved = state.complaints.filter(
      (c) =>
        (c.status === "closed_verified" || c.status === "auto_closed") &&
        c.closedAt &&
        new Date(c.closedAt) >= monthStart,
    );
    const withTime = state.complaints.filter((c) => c.resolvedAt);
    const avg =
      withTime.length === 0
        ? 0
        : withTime.reduce((n, c) => n + hoursBetween(c.createdAt, c.resolvedAt!), 0) / withTime.length;
    const open = state.complaints.filter((c) => OPEN_STATUSES.includes(c.status)).length;
    return { resolved: resolved.length, avgHrs: Math.round(avg), open };
  }, [state.complaints]);

  return (
    <div className="min-h-dvh bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#how" className="hover:text-slate-900 dark:hover:text-white">
              How it works
            </a>
            <a href="#categories" className="hover:text-slate-900 dark:hover:text-white">
              Categories
            </a>
            <a href="#transparency" className="hover:text-slate-900 dark:hover:text-white">
              Transparency
            </a>
          </nav>
          <div className="flex items-center gap-2.5">
            {supabaseStatus === "connected" ? (
              <span
                className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 sm:inline-flex"
                title="Live Supabase Cloud Database Connected"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                Supabase Live
              </span>
            ) : (
              <span className="hidden items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                {supabaseStatus === "connecting" ? "Connecting DB..." : "Local Mode"}
              </span>
            )}
            <ThemeToggle />
            <Link to="/student/login">
              <Button size="sm" variant="teal" className="flex items-center gap-1.5 font-bold shadow-sm">
                <GraduationCap className="h-4 w-4" />
                Student Login
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5 font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Shield className="h-4 w-4 text-teal-500" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate min-h-[92dvh] overflow-hidden">
        <img
          src={PHOTO.hero}
          alt="University campus at dusk"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/80 to-slate-950/45" />
        <div className="relative mx-auto flex min-h-[92dvh] max-w-6xl flex-col justify-center px-4 py-16">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-teal-300 uppercase flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
            {CAMPUS_NAME} · Smart Campus Maintenance
          </p>
          <h1 className="max-w-3xl text-4xl leading-[1.08] font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
            Campus problems shouldn’t disappear into silence.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-200 md:text-lg">
            {TAGLINE_LINE} A closed loop from the student who saw it to the worker who fixed it —
            and back to the student who confirms it.
          </p>

          {/* Production Dual Portals: Student & Admin */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-3xl">
            {/* Student Portal Card */}
            <div className="rounded-2xl border border-teal-500/40 bg-slate-950/85 p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between hover:border-teal-400 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Student Portal
                  </div>
                  <span className="text-[11px] text-teal-200/70">Campus Life</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">
                  Student Services
                </h3>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                  Pin issues on the 3D campus map, submit photo tickets, track resolution SLAs in real time, and verify fixes when completed.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
                <Link to="/student/login" className="w-full">
                  <Button size="md" variant="teal" className="w-full justify-between font-bold shadow-md">
                    <span>Student Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center justify-between text-xs px-1 pt-1">
                  <Link to="/student/signup" className="text-teal-300 hover:text-teal-200 font-medium">
                    New student? Register account →
                  </Link>
                  <Link to="/student/login" className="text-slate-400 hover:text-slate-300">
                    Fast Sign-in
                  </Link>
                </div>
              </div>
            </div>

            {/* Admin Portal Card */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/85 p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between hover:border-slate-500 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                    <Shield className="h-3.5 w-3.5 text-teal-400" />
                    Operations Console
                  </div>
                  <span className="text-[11px] text-slate-400">Staff & Faculty</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">
                  Admin & Maintenance
                </h3>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                  Centralized dispatch console: triage incoming alerts, dispatch technicians, track SLA metrics, and manage facility operations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
                <Link to="/admin/login" className="w-full">
                  <Button
                    size="md"
                    variant="outline"
                    className="w-full justify-between font-semibold border-slate-700 bg-slate-900/90 text-white hover:bg-slate-800 shadow-md"
                  >
                    <span>Staff & Admin Console</span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Button>
                </Link>
                <p className="text-center text-[11px] text-slate-400 pt-1">
                  Authorized campus officers, department admins & directors
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800">
          {[
            { n: stats.resolved, l: "Resolved this month" },
            { n: `${stats.avgHrs}h`, l: "Average time to fix" },
            { n: stats.open, l: "Open on campus now" },
          ].map((s) => (
            <div key={s.l} className="px-4 py-6 text-center md:py-8">
              <p className="tabular text-2xl font-semibold text-slate-900 md:text-3xl dark:text-white">
                {s.n}
              </p>
              <p className="mt-1 text-xs text-slate-500 md:text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <main id="main">
        <section className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-700 uppercase">The loop</p>
          <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight">
            Report → Assign → Fix → Verify
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
            WhatsApp groups lose messages. Paper letters stall. Verbal requests never happened.
            FixMyCampus keeps every complaint on a visible timeline until the student says it is
            actually done.
          </p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOOP.map((s, i) => (
              <li
                key={s.title}
                className="relative rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="tabular text-xs font-semibold text-slate-400">0{i + 1}</span>
                <s.icon className="mt-4 h-5 w-5 text-brand-700" />
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="how" className="bg-slate-900 py-20 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-teal-400 uppercase">
                How it works
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Built for a real campus, not a ticket queue.
              </h2>
              <ul className="mt-8 space-y-5">
                {[
                  "Pin the exact bench, tap, or corridor — not a vague “somewhere in Block A”.",
                  "Emergency reports (exposed wires, gas, flooding, food hazard) jump the line.",
                  "Similar nearby issues are clustered so the plumber isn’t sent twice.",
                  "If the student doesn’t confirm in 3 days, it auto-closes — distinctly, not as a fake success.",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img src={PHOTO.students} alt="Students walking on campus" className="h-80 w-full object-cover" />
            </div>
          </div>
        </section>

        {/* 3D GIS Map feature highlight - full map lives inside student and admin portals */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 md:p-12 text-white shadow-xl">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 mb-4">
                <MapPin className="h-3.5 w-3.5 text-teal-400" />
                Integrated 3D Campus GIS Engine
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Geotagged pinpointing for students & live SLA heatmaps for admin.
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-300 leading-relaxed">
                No more vague "somewhere in the corridor". Students pinpoint broken facilities directly on real 3D campus buildings, while campus administrators monitor live department density heatmaps.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link to="/student/login">
                  <Button variant="teal" size="md" className="font-bold flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    Student Map Access
                  </Button>
                </Link>
                <Link to="/admin/login">
                  <Button variant="outline" size="md" className="font-semibold text-white border-slate-700 bg-slate-800/80 hover:bg-slate-700 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-teal-400" />
                    Admin Operations Heatmap
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 top-0 hidden w-1/3 opacity-20 pointer-events-none lg:block bg-gradient-to-l from-teal-500/20 to-transparent" />
          </div>
        </section>

        <section id="categories" className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-semibold tracking-tight">What you can report</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              From a broken chair to a cockroach in the dal. Each category routes to the department
              that actually owns it.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {CATEGORIES.map((c) => (
                <li
                  key={c.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <CategoryIcon category={c.id} className="h-5 w-5" />
                  <p className="mt-3 text-sm font-semibold">{c.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{c.hint}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="transparency" className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-brand-700 uppercase">
                Transparency
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Every complaint has a visible timeline.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Submitted, reviewed, assigned, in progress, marked resolved, verified. Internal
                notes stay internal. Public updates stay public. Nothing is “done” until the
                student says so.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <StatusBadge status="submitted" />
                <StatusBadge status="assigned" />
                <StatusBadge status="in_progress" />
                <StatusBadge status="resolved_pending_verification" />
                <StatusBadge status="closed_verified" />
              </div>
            </div>
            <img
              src={PHOTO.arches}
              alt="Historic campus architecture"
              className="h-80 w-full rounded-2xl object-cover"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 py-12 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo className="[&_span:last-child]:text-white" />
            <p className="mt-2 max-w-sm text-sm">
              See it. Report it. Get it fixed. A closed-loop service for {CAMPUS_NAME}.
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/student/login">Student</Link>
            <Link to="/admin/login">Admin portal</Link>
            <a href="#how">How it works</a>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl px-4 text-xs text-slate-500">
          Campus Facility Incident & Operations Tracking System. Student privacy protected by anonymized reporting.
        </p>
      </footer>
    </div>
  );
}

const TAGLINE_LINE = "See it. Report it. Get it fixed.";
