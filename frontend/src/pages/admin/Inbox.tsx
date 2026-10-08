import { CategoryChip, PriorityBadge, StatusBadge, SLACountdownBadge } from "@/components/badges";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { CATEGORIES, STATUSES } from "@/lib/constants";
import { relativeTime, formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Category, Priority, Status } from "@/types";
import { cn } from "@/utils/cn";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const PAGE = 12;

export function AdminInbox() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const [cat, setCat] = useState<Category | "all">("all");
  const [pri, setPri] = useState<Priority | "all">("all");
  const [dept, setDept] = useState("all");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<"new" | "sla" | "priority">("priority");

  const list = useMemo(() => {
    let rows = state.complaints.filter((c) => c.status !== "merged");
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.title.toLowerCase().includes(s) ||
          c.publicId.toLowerCase().includes(s) ||
          c.building.toLowerCase().includes(s),
      );
    }
    if (status !== "all") rows = rows.filter((c) => c.status === status);
    if (cat !== "all") rows = rows.filter((c) => c.category === cat);
    if (pri !== "all") rows = rows.filter((c) => c.priority === pri);
    if (dept !== "all") rows = rows.filter((c) => c.departmentId === dept);

    const rank: Record<Priority, number> = { emergency: 0, high: 1, medium: 2, low: 3 };
    rows = [...rows].sort((a, b) => {
      const pinA = a.priority === "emergency" || a.isOverdue ? 0 : 1;
      const pinB = b.priority === "emergency" || b.isOverdue ? 0 : 1;
      if (pinA !== pinB) return pinA - pinB;
      if (sort === "priority") return rank[a.priority] - rank[b.priority];
      if (sort === "sla") return +new Date(a.slaDueAt) - +new Date(b.slaDueAt);
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    return rows;
  }, [state.complaints, q, status, cat, pri, dept, sort]);

  const slice = list.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));

  return (
    <div>
      <PageHeader title="Inbox" description={`${list.length} complaints in this filter`} />
      <Card className="mb-4 p-3">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search ID, title, building"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            className="h-9 max-w-xs"
          />
          <Select value={status} onChange={(e) => setStatus(e.target.value as Status | "all")} className="h-9 w-auto">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
          <Select value={cat} onChange={(e) => setCat(e.target.value as Category | "all")} className="h-9 w-auto">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select value={pri} onChange={(e) => setPri(e.target.value as Priority | "all")} className="h-9 w-auto">
            <option value="all">All priorities</option>
            <option value="emergency">Emergency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select value={dept} onChange={(e) => setDept(e.target.value)} className="h-9 w-auto">
            <option value="all">All departments</option>
            {state.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-9 w-auto">
            <option value="priority">Sort: priority</option>
            <option value="new">Sort: newest</option>
            <option value="sla">Sort: SLA</option>
          </Select>
        </div>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Complaint</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Location</th>
              <th className="px-3 py-3">Reported</th>
              <th className="px-3 py-3">SLA Timer</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((c) => (
              <tr
                key={c.id}
                className={cn(
                  "border-b border-slate-100 dark:border-slate-800",
                  (c.priority === "emergency" || c.isOverdue) && "bg-red-50/70 dark:bg-red-950/20",
                )}
              >
                <td className="px-4 py-3">
                  <Link to={`/admin/inbox/${c.id}`} className="block">
                    <p className="text-[11px] font-medium text-slate-400">{c.publicId}</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{c.title}</p>
                    {c.supportCount > 1 && (
                      <p className="text-[11px] text-slate-500">+{c.supportCount - 1} supporting</p>
                    )}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <CategoryChip category={c.category} />
                </td>
                <td className="px-3 py-3">
                  <PriorityBadge priority={c.priority} />
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={c.status} overdue={c.isOverdue} />
                </td>
                <td className="px-3 py-3 text-xs text-slate-500">{c.building}</td>
                <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(c.createdAt)}</td>
                <td className="px-3 py-3">
                  <SLACountdownBadge dueAt={c.slaDueAt} status={c.status} isOverdue={c.isOverdue} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <p className="text-slate-500">
          Page {page + 1} of {pages}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button size="sm" variant="outline" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
