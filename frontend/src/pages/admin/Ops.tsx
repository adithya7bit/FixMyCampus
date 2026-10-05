import { CampusMap } from "@/components/CampusMap";
import { StatusBadge } from "@/components/badges";
import { Button, Card, Field, Input, Modal, PageHeader, Select, Textarea } from "@/components/ui";
import { csvEscape, formatDate, uid } from "@/lib/format";
import { isOpen } from "@/lib/status";
import { useStore } from "@/lib/store";
import type { Category, Worker } from "@/types";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export function AdminMapPage() {
  const { state } = useStore();
  const [mode, setMode] = useState<"view" | "heatmap">("heatmap");
  return (
    <div className="w-full h-full flex-1 flex flex-col min-h-0 p-2 sm:p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
        <div>
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>3D GIS Operations Console</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/30 uppercase tracking-wider">
              Admin Telemetry
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Live incident density heatmap, 3D building pins, and real-time campus facility status.
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant={mode === "heatmap" ? "primary" : "outline"} onClick={() => setMode("heatmap")} className="h-8 text-xs">
            Heatmap Mode
          </Button>
          <Button size="sm" variant={mode === "view" ? "primary" : "outline"} onClick={() => setMode("view")} className="h-8 text-xs">
            Incident Pins
          </Button>
        </div>
      </div>
      <div className="w-full flex-1 min-h-0 relative">
        <CampusMap mode={mode} complaints={state.complaints} height="100%" className="h-full rounded-xl border-0 shadow-lg" />
      </div>
    </div>
  );
}

export function WorkersPage() {
  const { state, saveWorker, deleteWorker } = useStore();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Worker | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    departmentId: state.departments[0]?.id ?? "",
    specialties: "" as string,
    isActive: true,
  });

  const load = (w?: Worker) => {
    setEdit(w ?? null);
    setForm({
      name: w?.name ?? "",
      phone: w?.phone ?? "",
      departmentId: w?.departmentId ?? state.departments[0]?.id ?? "",
      specialties: w?.specialties.join(",") ?? "",
      isActive: w?.isActive ?? true,
    });
    setOpen(true);
  };

  const save = () => {
    const w: Worker = {
      id: edit?.id ?? uid("w"),
      name: form.name,
      phone: form.phone,
      departmentId: form.departmentId,
      specialties: form.specialties.split(",").map((s) => s.trim()).filter(Boolean) as Category[],
      isActive: form.isActive,
    };
    saveWorker(w);
    setOpen(false);
  };

  const loadOf = (id: string) =>
    state.complaints.filter((c) => c.assignedWorkerId === id && isOpen(c.status)).length;
  const doneOf = (id: string) =>
    state.complaints.filter((c) => c.assignedWorkerId === id && (c.status === "closed_verified" || c.status === "auto_closed")).length;

  return (
    <div>
      <PageHeader
        title="Workers & departments"
        description="Staff do not log in in v1. Schema is ready for worker accounts later."
        actions={
          <Button size="sm" variant="teal" onClick={() => load()}>
            Add worker
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {state.departments.map((d) => (
          <Card key={d.id} className="p-4">
            <h2 className="font-semibold">{d.name}</h2>
            <p className="text-xs text-slate-500">{d.categories.join(", ")}</p>
            <ul className="mt-3 space-y-2">
              {state.workers
                .filter((w) => w.departmentId === d.id)
                .map((w) => (
                  <li key={w.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                    <div>
                      <p className="font-medium">
                        {w.name} {!w.isActive && <span className="text-xs text-slate-400">(inactive)</span>}
                      </p>
                      <p className="text-xs text-slate-500">
                        {w.phone} · {loadOf(w.id)} open · {doneOf(w.id)} closed
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => load(w)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteWorker(w.id)}>
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
            </ul>
          </Card>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={edit ? "Edit worker" : "New worker"}>
        <div className="space-y-3">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Department">
            <Select
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            >
              {state.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Specialties" hint="Comma-separated category ids">
            <Input
              value={form.specialties}
              onChange={(e) => setForm({ ...form, specialties: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
          <Button variant="teal" className="w-full" onClick={save}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function HygienePage() {
  const { state, addInspection, session } = useStore();
  const food = state.complaints.filter((c) => c.category === "food_hygiene");
  const [open, setOpen] = useState<string | null>(null);
  const [findings, setFindings] = useState("");
  const [action, setAction] = useState("");
  const [follow, setFollow] = useState("");

  const offenders = useMemo(() => {
    const map = new Map<string, number>();
    food.forEach((c) => map.set(c.building, (map.get(c.building) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [food]);

  return (
    <div>
      <PageHeader
        title="Food & hygiene"
        description="Always high priority. Photo evidence is required where possible. Inspections are recorded here."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {offenders.map(([b, n]) => (
          <Card key={b} className="p-4">
            <p className="text-xs text-slate-500">Repeat location</p>
            <p className="font-semibold">{b}</p>
            <p className="tabular text-2xl">{n}</p>
          </Card>
        ))}
      </div>
      <ul className="space-y-2">
        {food.map((c) => (
          <li key={c.id}>
            <Card className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link to={`/admin/inbox/${c.id}`} className="font-semibold hover:underline">
                    {c.publicId} · {c.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {c.building} · {formatDate(c.createdAt)}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-3">
                {state.inspections
                  .filter((i) => i.complaintId === c.id)
                  .map((i) => (
                    <p key={i.id} className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800">
                      <strong>Inspection:</strong> {i.findings} — {i.actionTaken}
                      {i.followUpDate ? ` · follow-up ${i.followUpDate}` : ""}
                    </p>
                  ))}
              </div>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setOpen(c.id)}>
                Add inspection
              </Button>
            </Card>
          </li>
        ))}
      </ul>
      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title="Inspection record">
        <div className="space-y-3">
          <Field label="Findings">
            <Textarea value={findings} onChange={(e) => setFindings(e.target.value)} />
          </Field>
          <Field label="Action taken">
            <Textarea value={action} onChange={(e) => setAction(e.target.value)} />
          </Field>
          <Field label="Follow-up date">
            <Input type="date" value={follow} onChange={(e) => setFollow(e.target.value)} />
          </Field>
          <Button
            variant="teal"
            className="w-full"
            onClick={() => {
              if (!open || !session) return;
              addInspection({
                complaintId: open,
                inspectorId: session.id,
                findings,
                actionTaken: action,
                followUpDate: follow || undefined,
              });
              setOpen(null);
              setFindings("");
              setAction("");
              setFollow("");
            }}
          >
            Save inspection
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function ReportsPage() {
  const { state } = useStore();
  const exportCsv = () => {
    const header = [
      "public_id",
      "title",
      "category",
      "priority",
      "status",
      "building",
      "created_at",
      "resolved_at",
      "reopen_count",
      "overdue",
    ];
    const rows = state.complaints.map((c) =>
      [
        c.publicId,
        c.title,
        c.category,
        c.priority,
        c.status,
        c.building,
        c.createdAt,
        c.resolvedAt ?? "",
        c.reopenCount,
        c.isOverdue,
      ]
        .map(csvEscape)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fixmycampus-complaints.csv";
    a.click();
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Export or print a summary. No personal student contact details."
        actions={
          <div className="flex gap-2 no-print">
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              Print
            </Button>
            <Button size="sm" variant="teal" onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
        }
      />
      <Card className="overflow-x-auto p-4">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-slate-500 uppercase">
            <tr>
              <th className="py-2">ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Building</th>
              <th>Filed</th>
            </tr>
          </thead>
          <tbody>
            {state.complaints.map((c) => (
              <tr key={c.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-2 font-mono text-xs">{c.publicId}</td>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td>{c.status}</td>
                <td>{c.building}</td>
                <td>{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function SettingsPage() {
  const { state, session, saveSettings, createAdmin, resetDemo, signOut, toast } = useStore();
  const [s, setS] = useState(state.settings);
  const [admin, setAdmin] = useState({ fullName: "", email: "", password: "demo1234", department: "Estate Office" });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" />
      <Card className="space-y-3 p-5">
        <h2 className="font-semibold">Campus</h2>
        <Field label="Campus name">
          <Input value={s.campusName} onChange={(e) => setS({ ...s, campusName: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Center latitude">
            <Input
              type="number"
              step="0.0001"
              value={s.campusCenterLat}
              onChange={(e) => setS({ ...s, campusCenterLat: Number(e.target.value) })}
            />
          </Field>
          <Field label="Center longitude">
            <Input
              type="number"
              step="0.0001"
              value={s.campusCenterLng}
              onChange={(e) => setS({ ...s, campusCenterLng: Number(e.target.value) })}
            />
          </Field>
        </div>
        <Field label="Auto-close after N days without student response">
          <Input
            type="number"
            value={s.autoCloseDays}
            onChange={(e) => setS({ ...s, autoCloseDays: Number(e.target.value) })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["emergency", "high", "medium", "low"] as const).map((p) => (
            <Field key={p} label={`SLA ${p} (h)`}>
              <Input
                type="number"
                value={s.slaHoursByPriority[p]}
                onChange={(e) =>
                  setS({
                    ...s,
                    slaHoursByPriority: { ...s.slaHoursByPriority, [p]: Number(e.target.value) },
                  })
                }
              />
            </Field>
          ))}
        </div>
        <Button variant="teal" onClick={() => { saveSettings(s); toast({ tone: "success", title: "Settings saved" }); }}>
          Save settings
        </Button>
      </Card>

      {session?.role === "super_admin" && (
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">Create department admin</h2>
          <p className="text-xs text-slate-500">Admins cannot self-register. Super-admin issues accounts.</p>
          <Field label="Name">
            <Input value={admin.fullName} onChange={(e) => setAdmin({ ...admin, fullName: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} />
          </Field>
          <Button
            size="sm"
            onClick={() => {
              const r = createAdmin(admin);
              toast({ tone: r.ok ? "success" : "error", title: r.ok ? "Admin created" : r.error ?? "Failed" });
            }}
          >
            Create admin
          </Button>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={resetDemo}>
          Restore demo data
        </Button>
        <Button variant="ghost" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
