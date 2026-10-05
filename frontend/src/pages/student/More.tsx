import { CampusMap } from "@/components/CampusMap";
import { CategoryChip, StatusBadge } from "@/components/badges";
import { Button, Card, EmptyState, PageHeader, Select } from "@/components/ui";
import { CATEGORIES, OPEN_STATUSES } from "@/lib/constants";
import { relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Category, Status } from "@/types";
import { Bell, LogOut, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextSizeControl } from "@/components/theme";

export function StudentMapPage() {
  const { state } = useStore();
  const nav = useNavigate();
  const [cat, setCat] = useState<Category | "all">("all");
  const [st, setSt] = useState<Status | "open" | "all">("open");
  const list = useMemo(() => {
    return state.complaints.filter((c) => {
      if (c.status === "merged") return false;
      if (cat !== "all" && c.category !== cat) return false;
      if (st === "open") return OPEN_STATUSES.includes(c.status);
      if (st !== "all" && c.status !== st) return false;
      return true;
    });
  }, [state.complaints, cat, st]);
  const [sel, setSel] = useState<string | null>(null);
  const chosen = list.find((c) => c.id === sel);

  return (
    <div className="relative w-full h-full flex-1 flex flex-col min-h-0 p-2 sm:p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Interactive 3D Campus Map</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 font-semibold border border-teal-500/30 uppercase tracking-wider hidden sm:inline-block">
              Full View
            </span>
          </h1>
          <span className="text-xs text-slate-400 hidden md:inline">
            · Click pins to inspect or click "Report Issue"
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={cat} onChange={(e) => setCat(e.target.value as Category | "all")} className="w-auto h-8 py-0 px-2 text-xs">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select value={st} onChange={(e) => setSt(e.target.value as Status | "open")} className="w-auto h-8 py-0 px-2 text-xs">
            <option value="open">Open only</option>
            <option value="all">All statuses</option>
          </Select>
        </div>
      </div>

      <div className="w-full flex-1 min-h-0 relative">
        <CampusMap 
          mode="view" 
          complaints={list} 
          onSelectPin={setSel} 
          onRequestReport={() => nav('/student/report')}
          height="100%" 
          className="h-full rounded-xl border-0 shadow-lg" 
        />

        {chosen && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30 animate-in fade-in slide-in-from-bottom-2">
            <Card className="p-4 shadow-2xl border-teal-500/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] text-slate-400 font-mono">{chosen.publicId}</p>
                  <h2 className="text-sm font-bold mt-0.5 text-slate-900 dark:text-white line-clamp-1">{chosen.title}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                    <CategoryChip category={chosen.category} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">📍 {chosen.building}</span>
                    {chosen.floor && <span>· F{chosen.floor}</span>}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{chosen.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button onClick={() => setSel(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-xs" title="Dismiss">✕</button>
                  <StatusBadge status={chosen.status} />
                </div>
              </div>
              <Link to={`/student/complaints/${chosen.id}`} className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
                View full ticket & timeline →
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export function StudentNotifications() {
  const { session, state, markRead, markAllRead } = useStore();
  const list = state.notifications.filter((n) => n.userId === session?.id);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Notifications"
        actions={
          <Button size="sm" variant="ghost" onClick={() => session && markAllRead(session.id)}>
            Mark all read
          </Button>
        }
      />
      {list.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-5 w-5" />}
          title="You’re up to date"
          body="Status changes, assignments and verification requests will land here."
        />
      ) : (
        <ul className="space-y-2">
          {list.map((n) => (
            <li key={n.id}>
              <Link
                to={n.complaintId ? `/student/complaints/${n.complaintId}` : "/student"}
                onClick={() => markRead(n.id)}
              >
                <Card className={`p-4 ${n.readAt ? "opacity-70" : "border-brand-200"}`}>
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-400">{relativeTime(n.createdAt)}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StudentProfile() {
  const { session, signOut, resetDemo } = useStore();
  const nav = useNavigate();
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <PageHeader title="Profile" />
      <Card className="p-5">
        <p className="text-lg font-semibold">{session?.fullName}</p>
        <p className="text-sm text-slate-500">{session?.email}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-slate-400">Department</dt>
            <dd>{session?.department}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Year</dt>
            <dd>{session?.year}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Residence</dt>
            <dd className="capitalize">{session?.hostel?.replace("_", " ") || "—"}</dd>
          </div>
        </dl>
      </Card>
      <Card className="p-5">
        <p className="text-sm font-semibold">Accessibility</p>
        <div className="mt-3">
          <TextSizeControl />
        </div>
      </Card>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={() => {
            signOut();
            nav("/student/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
        <Button variant="ghost" onClick={resetDemo}>
          Restore demo data
        </Button>
      </div>
      <p className="flex items-center gap-1 text-xs text-slate-400">
        <MapPin className="h-3 w-3" /> Other students never see your identity on the public map.
      </p>
    </div>
  );
}
