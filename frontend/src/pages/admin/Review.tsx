import { CampusMap } from "@/components/CampusMap";
import { CategoryChip, PriorityBadge, StatusBadge } from "@/components/badges";
import { Button, Card, Field, Select, Textarea } from "@/components/ui";
import { compressImage } from "@/lib/compress";
import { CATEGORIES, PRIORITIES } from "@/lib/constants";
import { formatDateTime, relativeTime } from "@/lib/format";
import { haversineMeters } from "@/lib/geo";
import { canTransition } from "@/lib/status";
import { useStore } from "@/lib/store";
import type { Category, Priority, Status } from "@/types";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

export function AdminReview() {
  const { id } = useParams();
  const store = useStore();
  const { state, session, toast } = store;
  const c = state.complaints.find((x) => x.id === id);
  const [note, setNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [deptId, setDeptId] = useState(c?.departmentId ?? "");
  const [workerId, setWorkerId] = useState(c?.assignedWorkerId ?? "");
  const [cat, setCat] = useState<Category>(c?.category ?? "other");
  const [pri, setPri] = useState<Priority>(c?.priority ?? "medium");
  const [internal, setInternal] = useState("");
  const [publicNote, setPublicNote] = useState("");
  const [afterUrl, setAfterUrl] = useState("");
  const [mergeId, setMergeId] = useState("");

  if (!c) return <p>Not found</p>;

  const student = state.users.find((u) => u.id === c.studentId);
  const media = state.media.filter((m) => m.complaintId === c.id);
  const events = state.events
    .filter((e) => e.complaintId === c.id)
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const comments = state.comments.filter((x) => x.complaintId === c.id);
  const dups = state.complaints.filter((o) => {
    if (o.id === c.id || o.status === "merged") return false;
    if (o.category !== c.category) return false;
    return haversineMeters({ lat: o.latitude, lng: o.longitude }, { lat: c.latitude, lng: c.longitude }) < 80;
  });
  const workers = state.workers.filter((w) => !deptId || w.departmentId === deptId);
  const sug = store.suggestAssignment(cat);

  const act = (to: Status, n: string) => {
    const r = store.transition({
      complaintId: c.id,
      to,
      actorId: session!.id,
      note: n,
    });
    if (!r.ok) toast({ tone: "error", title: r.error ?? "Cannot transition" });
    else toast({ tone: "success", title: "Updated" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div>
          <Link to="/admin/inbox" className="text-xs font-medium text-slate-500">
            ← Inbox
          </Link>
          <p className="mt-2 text-xs text-slate-400">{c.publicId}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{c.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={c.status} overdue={c.isOverdue} />
            <PriorityBadge priority={c.priority} />
            <CategoryChip category={c.category} />
            {c.reopenCount > 0 && (
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-800">
                Reopened ×{c.reopenCount}
              </span>
            )}
          </div>
        </div>

        <Card className="p-4">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{c.description}</p>
          <p className="mt-3 text-xs text-slate-500">
            Reporter {student?.fullName} · {student?.department} · {relativeTime(c.createdAt)} · {c.building}
            {c.floor ? ` · Floor ${c.floor}` : ""} {c.room ? ` · ${c.room}` : ""} · {c.supportCount} supporting
          </p>
          {(c.aiSummary || c.aiPriority) && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-900">
              <Sparkles className="mt-0.5 h-3.5 w-3.5" />
              AI suggestion: {c.aiSummary ?? c.title}
              {c.aiCategory ? ` · ${c.aiCategory}` : ""} {c.aiPriority ? ` · ${c.aiPriority}` : ""}. Human decides.
            </p>
          )}
        </Card>

        {media.length > 0 && (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {media.map((m) => (
              <figure key={m.id}>
                <img src={m.storagePath} alt={m.kind} className="h-36 w-full rounded-xl object-cover" />
                <figcaption className="mt-1 text-[11px] text-slate-500 capitalize">{m.kind}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <CampusMap
          mode="view"
          pins={[{ id: c.id, lat: c.latitude, lng: c.longitude, category: c.category }]}
          height={220}
        />

        {dups.length > 0 && (
          <Card className="p-4">
            <h2 className="text-sm font-semibold">Nearby similar ({dups.length})</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {dups.map((d) => (
                <li key={d.id} className="flex items-center justify-between">
                  <Link to={`/admin/inbox/${d.id}`} className="text-brand-700">
                    {d.publicId} · {d.title}
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      store.merge(c.id, d.id, session!.id);
                      toast({ tone: "success", title: "Merged" });
                    }}
                  >
                    Merge into this
                  </Button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <Select value={mergeId} onChange={(e) => setMergeId(e.target.value)} className="h-9">
                <option value="">Merge another ID…</option>
                {state.complaints
                  .filter((x) => x.id !== c.id && x.status !== "merged")
                  .slice(0, 20)
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.publicId}
                    </option>
                  ))}
              </Select>
              <Button
                size="sm"
                variant="outline"
                disabled={!mergeId}
                onClick={() => mergeId && store.merge(c.id, mergeId, session!.id)}
              >
                Merge
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h2 className="text-sm font-semibold">Timeline & notes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {events.map((e) => (
              <li key={e.id}>
                <span className={e.visibility === "internal" ? "text-amber-800" : ""}>
                  {e.note}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  {e.visibility} · {formatDateTime(e.createdAt)}
                </span>
              </li>
            ))}
          </ul>
          <ul className="mt-3 space-y-2">
            {comments.map((cm) => (
              <li key={cm.id} className="rounded-lg bg-slate-50 p-2 text-sm dark:bg-slate-800">
                {cm.body}
                <span className="ml-2 text-xs text-slate-400">{cm.visibility}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid gap-2">
            <Textarea
              rows={2}
              placeholder="Public update (visible to student)"
              value={publicNote}
              onChange={(e) => setPublicNote(e.target.value)}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!publicNote.trim()) return;
                store.addComment({
                  complaintId: c.id,
                  authorId: session!.id,
                  body: publicNote.trim(),
                  visibility: "public",
                });
                setPublicNote("");
              }}
            >
              Post public update
            </Button>
            <Textarea
              rows={2}
              placeholder="Internal note (hidden from students)"
              value={internal}
              onChange={(e) => setInternal(e.target.value)}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (!internal.trim()) return;
                store.addComment({
                  complaintId: c.id,
                  authorId: session!.id,
                  body: internal.trim(),
                  visibility: "internal",
                });
                setInternal("");
                toast({ tone: "info", title: "Internal note saved" });
              }}
            >
              Save internal note
            </Button>
          </div>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <Card className="p-4">
          <h2 className="text-sm font-semibold">Triage</h2>
          <div className="mt-3 space-y-3">
            <Field label="Category">
              <Select value={cat} onChange={(e) => setCat(e.target.value as Category)} className="h-9">
                {CATEGORIES.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={pri} onChange={(e) => setPri(e.target.value as Priority)} className="h-9">
                {PRIORITIES.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                store.updateComplaintMeta({
                  complaintId: c.id,
                  actorId: session!.id,
                  category: cat,
                  priority: pri,
                });
                toast({ tone: "success", title: "Saved" });
              }}
            >
              Save category / priority
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold">Assign</h2>
          <p className="mt-1 text-[11px] text-slate-500">
            Suggestion: {state.departments.find((d) => d.id === sug.departmentId)?.name ?? "—"} /{" "}
            {state.workers.find((w) => w.id === sug.workerId)?.name ?? "least-loaded"}
          </p>
          <div className="mt-3 space-y-2">
            <Select
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              className="h-9"
            >
              <option value="">Department</option>
              {state.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
            <Select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className="h-9">
              <option value="">Worker</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                  {!w.isActive ? " (inactive)" : ""}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              variant="teal"
              className="w-full"
              onClick={() => {
                if (!deptId) return toast({ tone: "error", title: "Pick a department" });
                store.assign({
                  complaintId: c.id,
                  actorId: session!.id,
                  departmentId: deptId,
                  workerId: workerId || undefined,
                });
                toast({ tone: "success", title: "Assigned" });
              }}
            >
              Assign
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setDeptId(sug.departmentId ?? "");
                setWorkerId(sug.workerId ?? "");
              }}
            >
              Use auto-assignment
            </Button>
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <h2 className="text-sm font-semibold">Actions</h2>
          {canTransition(c.status, "under_review") && (
            <Button size="sm" variant="outline" className="w-full" onClick={() => act("under_review", "Accepted for review")}>
              Accept / under review
            </Button>
          )}
          {canTransition(c.status, "in_progress") && (
            <Button size="sm" variant="outline" className="w-full" onClick={() => act("in_progress", "Work started")}>
              Mark in progress
            </Button>
          )}
          {canTransition(c.status, "resolved_pending_verification") && (
            <div className="space-y-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700">
              <Field label="Resolution note">
                <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
              <label className="block text-xs">
                After photo (encouraged)
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-xs"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const { dataUrl } = await compressImage(f);
                    setAfterUrl(dataUrl);
                  }}
                />
              </label>
              <Button
                size="sm"
                variant="teal"
                className="w-full"
                onClick={() => {
                  if (!note.trim()) return toast({ tone: "error", title: "Resolution note required" });
                  if (afterUrl) store.addMedia({ complaintId: c.id, url: afterUrl, kind: "after", mediaType: "image" });
                  act("resolved_pending_verification", note.trim());
                }}
              >
                Mark resolved
              </Button>
            </div>
          )}
          {canTransition(c.status, "rejected") && (
            <div className="space-y-2">
              <Textarea
                rows={2}
                placeholder="Rejection reason (shown to student)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <Button
                size="sm"
                variant="danger"
                className="w-full"
                onClick={() => {
                  if (!rejectReason.trim()) return toast({ tone: "error", title: "Reason required" });
                  act("rejected", rejectReason.trim());
                }}
              >
                Reject
              </Button>
            </div>
          )}
        </Card>
      </aside>
    </div>
  );
}
