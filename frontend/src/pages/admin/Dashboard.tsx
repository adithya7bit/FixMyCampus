import { CampusMap } from "@/components/CampusMap";
import { PageHeader, Card, Select } from "@/components/ui";
import { CATEGORIES, CATEGORY_COLOR, STATUS_COLOR } from "@/lib/constants";
import { categoryLabel, hoursBetween } from "@/lib/format";
import { isOpen } from "@/lib/status";
import { useStore } from "@/lib/store";
import type { Category, Status } from "@/types";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function AdminDashboard() {
  const { state } = useStore();
  const [cat, setCat] = useState<Category | "all">("all");
  const [range, setRange] = useState<"7" | "30" | "90">("30");

  const kpis = useMemo(() => {
    const all = state.complaints.filter((c) => c.status !== "merged");
    const today = startOfDay(new Date()).getTime();
    const week = Date.now() - 7 * 864e5;
    const newToday = all.filter((c) => new Date(c.createdAt).getTime() >= today).length;
    const open = all.filter((c) => isOpen(c.status)).length;
    const inProgress = all.filter((c) => c.status === "in_progress" || c.status === "assigned").length;
    const overdue = all.filter((c) => c.isOverdue && isOpen(c.status)).length;
    const resolvedWeek = all.filter(
      (c) => c.closedAt && new Date(c.closedAt).getTime() >= week && (c.status === "closed_verified" || c.status === "auto_closed"),
    ).length;
    const closed = all.filter((c) => c.status === "closed_verified" || c.status === "auto_closed" || c.reopenCount > 0);
    const reopened = all.filter((c) => c.reopenCount > 0).length;
    const reopenRate = closed.length ? Math.round((reopened / closed.length) * 100) : 0;
    const timed = all.filter((c) => c.resolvedAt);
    const avg =
      timed.length === 0
        ? 0
        : timed.reduce((n, c) => n + hoursBetween(c.createdAt, c.resolvedAt!), 0) / timed.length;
    return { total: all.length, newToday, open, inProgress, overdue, resolvedWeek, reopenRate, avg: Math.round(avg) };
  }, [state.complaints]);

  const byCategory = CATEGORIES.map((c) => ({
    name: c.label.split(" ")[0],
    n: state.complaints.filter((x) => x.category === c.id).length,
    fill: CATEGORY_COLOR[c.id],
  }));

  const byStatus = (Object.keys(STATUS_COLOR) as Status[]).map((s) => ({
    name: s.replace(/_/g, " "),
    n: state.complaints.filter((c) => c.status === s).length,
    fill: STATUS_COLOR[s].hex,
  })).filter((x) => x.n > 0);

  const trend = useMemo(() => {
    const days = Number(range);
    const out: { d: string; n: number; r: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const key = day.toISOString().slice(5, 10);
      const start = startOfDay(day).getTime();
      const end = start + 864e5;
      out.push({
        d: key,
        n: state.complaints.filter((c) => {
          const t = new Date(c.createdAt).getTime();
          return t >= start && t < end;
        }).length,
        r: state.complaints.filter((c) => {
          if (!c.resolvedAt) return false;
          const t = new Date(c.resolvedAt).getTime();
          return t >= start && t < end;
        }).length,
      });
    }
    return out;
  }, [state.complaints, range]);

  const deptTime = state.departments.map((d) => {
    const cs = state.complaints.filter((c) => c.departmentId === d.id && c.resolvedAt);
    const avg =
      cs.length === 0 ? 0 : cs.reduce((n, c) => n + hoursBetween(c.createdAt, c.resolvedAt!), 0) / cs.length;
    return { name: d.name.split(" ")[0], hrs: Math.round(avg) };
  });

  const heat = state.complaints.filter((c) => {
    if (cat !== "all" && c.category !== cat) return false;
    return true;
  });

  const cards = [
    { l: "Total", v: kpis.total },
    { l: "New today", v: kpis.newToday },
    { l: "Open", v: kpis.open },
    { l: "In progress", v: kpis.inProgress },
    { l: "Overdue", v: kpis.overdue, alert: true },
    { l: "Resolved this week", v: kpis.resolvedWeek },
    { l: "Reopen rate", v: `${kpis.reopenRate}%` },
    { l: "Avg resolution", v: `${kpis.avg}h` },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Campus dashboard"
        description="Live picture of every open loop on campus."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.l} className={`p-4 ${c.alert && kpis.overdue ? "border-red-300" : ""}`}>
            <p className="text-xs font-medium text-slate-500">{c.l}</p>
            <p className={`tabular mt-1 text-2xl font-semibold ${c.alert && kpis.overdue ? "text-red-600" : ""}`}>
              {c.v}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Trend</h2>
            <Select value={range} onChange={(e) => setRange(e.target.value as "7" | "30" | "90")} className="h-9 w-28">
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </Select>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" stroke="" />
                <XAxis dataKey="d" tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-500" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-500" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--tw-prose-bg, #0f172a)', borderColor: '#1e293b', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} />
                <Line type="monotone" dataKey="n" name="Filed" stroke="#0f766e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="r" name="Resolved" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">By category</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" stroke="" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-500" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-500" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--tw-prose-bg, #0f172a)', borderColor: '#1e293b', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} cursor={{ fill: 'var(--tw-prose-bg, #1e293b)' }} />
                <Bar dataKey="n" radius={[4, 4, 0, 0]}>
                  {byCategory.map((e) => (
                    <Cell key={e.name} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">By status</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" stroke="" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-500" />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-500" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--tw-prose-bg, #0f172a)', borderColor: '#1e293b', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} cursor={{ fill: 'var(--tw-prose-bg, #1e293b)' }} />
                <Bar dataKey="n" radius={[0, 4, 4, 0]}>
                  {byStatus.map((e) => (
                    <Cell key={e.name} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Avg hours to resolve, by department</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" stroke="" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-500" />
                <YAxis tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-500" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--tw-prose-bg, #0f172a)', borderColor: '#1e293b', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} cursor={{ fill: 'var(--tw-prose-bg, #1e293b)' }} />
                <Bar dataKey="hrs" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">Campus Issue Heatmap</h2>
            <Link to="/admin/map" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              Open Full 3D Map Console →
            </Link>
          </div>
          <Select value={cat} onChange={(e) => setCat(e.target.value as Category | "all")} className="h-9 w-48">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {categoryLabel(c.id)}
              </option>
            ))}
          </Select>
        </div>
        <CampusMap mode="heatmap" complaints={heat} height={460} />
      </div>
    </div>
  );
}
