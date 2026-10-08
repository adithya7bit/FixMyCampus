import { CategoryChip, PriorityBadge, StatusBadge } from "@/components/badges";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Status } from "@/types";
import { ClipboardList, Plus, Map } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useMemo } from "react";

const CHIPS: { id: string; label: string; match: (s: Status) => boolean }[] = [
  { id: "open", label: "Open", match: (s) => s === "submitted" || s === "under_review" },
  { id: "progress", label: "In progress", match: (s) => s === "assigned" || s === "in_progress" },
  { id: "verify", label: "Awaiting my verification", match: (s) => s === "resolved_pending_verification" },
  { id: "resolved", label: "Resolved", match: (s) => s === "closed_verified" || s === "auto_closed" },
];

export function StudentHome() {
  const { session, state } = useStore();
  const mine = useMemo(
    () => state.complaints.filter((c) => c.studentId === session?.id && c.status !== "merged"),
    [state.complaints, session],
  );
  const awaiting = mine.filter((c) => c.status === "resolved_pending_verification");
  const counts = CHIPS.map((chip) => ({
    ...chip,
    n: mine.filter((c) => chip.match(c.status)).length,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="My complaints"
        title={`Hello, ${session?.fullName.split(" ")[0]}`}
        description="Track every report until you confirm it is actually fixed."
        actions={
          <Link to="/student/report" className="hidden md:inline-flex">
            <Button variant="teal">
              <Plus className="h-4 w-4" />
              New report
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
        {counts.map((c) => (
          <Link key={c.id} to={`/student/reports?f=${c.id}`}>
            <Card className="px-4 py-3 transition hover:border-brand-300">
              <p className="text-xs font-medium text-slate-500">{c.label}</p>
              <p className="tabular mt-1 text-2xl font-semibold">{c.n}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick 3D Campus Map Access Banner */}
      <div className="mb-6 rounded-2xl border border-teal-500/30 bg-teal-50/60 dark:bg-slate-900/90 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Interactive 3D Campus Map
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 font-semibold uppercase tracking-wider">Live GIS</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse 3D buildings, view live geotagged issues across campus, or click to inspect.
            </p>
          </div>
        </div>
        <Link to="/student/map">
          <Button variant="teal" size="sm" className="font-bold shrink-0">
            Open 3D Map →
          </Button>
        </Link>
      </div>

      {awaiting.length > 0 && (
        <section className="mb-8" aria-live="polite">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-amber-600 dark:text-amber-400 uppercase">
            Awaiting your verification
          </h2>
          <div className="space-y-3">
            {awaiting.map((c) => (
              <Card key={c.id} className="border-amber-400/50 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-950/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-amber-600/70 dark:text-amber-400/70">{c.publicId}</p>
                    <h3 className="mt-0.5 font-semibold text-amber-900 dark:text-amber-100">{c.title}</h3>
                    <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-200/80">
                      Admin marked this resolved. Is the problem actually fixed?
                    </p>
                  </div>
                  <Link to={`/student/reports/${c.id}`}>
                    <Button className="bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700" size="sm">
                      Confirm
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Recent</h2>
      {mine.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ClipboardList className="h-5 w-5" />}
            title="No complaints yet"
            body="When something on campus is broken, file it here. We’ll keep the loop closed."
            action={
              <Link to="/student/report">
                <Button variant="teal">File a complaint</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {mine.slice(0, 8).map((c) => (
            <li key={c.id}>
              <Link to={`/student/reports/${c.id}`}>
                <Card className="p-4 transition hover:border-slate-300">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-medium text-slate-400">{c.publicId}</p>
                    <StatusBadge status={c.status} overdue={c.isOverdue} />
                  </div>
                  <h3 className="mt-1 font-semibold">{c.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <CategoryChip category={c.category} />
                    <PriorityBadge priority={c.priority} />
                    <span>{c.building}</span>
                    <span>{relativeTime(c.createdAt)}</span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StudentList() {
  const { session, state } = useStore();
  const [params] = useSearchParams();
  const f = params.get("f");
  const mine = state.complaints.filter((c) => c.studentId === session?.id && c.status !== "merged");
  const chip = CHIPS.find((c) => c.id === f);
  const list = chip ? mine.filter((c) => chip.match(c.status)) : mine;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="My complaints" description={`${list.length} in this view`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          to="/student/reports"
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${!f ? "bg-teal-600 text-white dark:bg-teal-500 dark:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800"}`}
        >
          All
        </Link>
        {CHIPS.map((c) => (
          <Link
            key={c.id}
            to={`/student/reports?f=${c.id}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${f === c.id ? "bg-teal-600 text-white dark:bg-teal-500 dark:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800"}`}
          >
            {c.label}
          </Link>
        ))}
      </div>
      <ul className="space-y-2">
        {list.map((c) => (
          <li key={c.id}>
            <Link to={`/student/reports/${c.id}`}>
              <Card className="p-4 hover:border-slate-300">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-400">{c.publicId}</p>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {c.building} · {relativeTime(c.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={c.status} overdue={c.isOverdue} />
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
