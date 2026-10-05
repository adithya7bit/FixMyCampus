import { CampusMap } from "@/components/CampusMap";
import { CategoryChip, PriorityBadge, StatusBadge } from "@/components/badges";
import { Button, Card, Field, Textarea } from "@/components/ui";
import { compressImage, validateFile } from "@/lib/compress";
import { TIMELINE_STEPS } from "@/lib/constants";
import { formatDateTime, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Status } from "@/types";
import { cn } from "@/utils/cn";
import { MessageSquare, Shield } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import confetti from "canvas-confetti";

function stepIndex(status: Status): number {
  if (status === "reopened") return 1;
  if (status === "rejected" || status === "merged" || status === "auto_closed") return 5;
  const i = TIMELINE_STEPS.indexOf(status);
  return i < 0 ? 0 : i;
}

export function StudentDetail() {
  const { id } = useParams();
  const { session, state, verify, addComment, toast } = useStore();
  const c = state.complaints.find((x) => x.id === id);
  const [reason, setReason] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [body, setBody] = useState("");

  const media = state.media.filter((m) => m.complaintId === id);
  const events = state.events
    .filter((e) => e.complaintId === id && e.visibility === "public")
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const comments = state.comments
    .filter((x) => x.complaintId === id && x.visibility === "public")
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const worker = state.workers.find((w) => w.id === c?.assignedWorkerId);
  const dept = state.departments.find((d) => d.id === c?.departmentId);
  const idx = c ? stepIndex(c.status) : 0;

  const isMine = c?.studentId === session?.id;

  const onFile = async (file?: File) => {
    if (!file) return;
    const err = validateFile(file);
    if (err) return toast({ tone: "error", title: err });
    const { dataUrl } = await compressImage(file);
    setPhoto(dataUrl);
  };

  if (!c) {
    return (
      <p className="text-sm text-slate-500">
        Complaint not found. <Link to="/student">Back</Link>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-400">{c.publicId}</p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{c.title}</h1>
          <StatusBadge status={c.status} overdue={c.isOverdue} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <CategoryChip category={c.category} />
          <PriorityBadge priority={c.priority} />

          <span>{relativeTime(c.createdAt)}</span>
          {c.supportCount > 1 && <span>{c.supportCount} students supporting</span>}
        </div>
      </div>

      {c.status === "resolved_pending_verification" && isMine && (
        <Card className="border-violet-300 bg-violet-50 p-5 dark:bg-violet-950/30">
          <h2 className="text-lg font-semibold">Is this problem actually fixed?</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Staff marked it resolved. Please confirm — this is how we close the loop.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="teal"
              onClick={() => {
                confetti({
                  particleCount: 90,
                  spread: 60,
                  origin: { y: 0.6 },
                });
                const r = verify({ complaintId: c.id, studentId: session!.id, outcome: "fixed" });
                if (r.ok) toast({ tone: "success", title: "Confirmed Fixed! Closed successfully." });
              }}
            >
              Yes, it’s fixed
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                /* show reopen fields */
                document.getElementById("reopen-reason")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              No, still a problem
            </Button>
          </div>
          <div id="reopen-reason" className="mt-4 space-y-2">
            <Field label="What is still wrong?">
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            </Field>
            <label className="text-xs font-medium text-slate-600">
              Optional new photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="mt-1 block text-sm"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
            {photo && <img src={photo} alt="" className="h-24 rounded-lg object-cover" />}
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (!reason.trim()) return toast({ tone: "error", title: "Please explain what’s still wrong" });
                const r = verify({
                  complaintId: c.id,
                  studentId: session!.id,
                  outcome: "not_fixed",
                  reason,
                  photoUrl: photo,
                });
                if (r.ok) toast({ tone: "info", title: "Reopened — admin has been alerted" });
              }}
            >
              Reopen complaint
            </Button>
          </div>
        </Card>
      )}

      {c.status === "rejected" && (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          This report was rejected.
          {events.filter((e) => e.toStatus === "rejected").slice(-1)[0]?.note}
        </Card>
      )}

      <Card className="p-5">
        <h2 className="text-sm font-semibold">Timeline</h2>
        <ol className="mt-4 space-y-0">
          {TIMELINE_STEPS.map((s, i) => {
            const reached = i <= idx && c.status !== "rejected";
            const current = i === idx;
            return (
              <li key={s} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "mt-0.5 h-3 w-3 rounded-full ring-4",
                      reached ? "bg-brand-700 ring-brand-100" : "bg-slate-200 ring-transparent",
                      current && "ring-brand-200",
                    )}
                  />
                  {i < TIMELINE_STEPS.length - 1 && (
                    <span className={cn("w-px flex-1", reached ? "bg-brand-200" : "bg-slate-200")} />
                  )}
                </div>
                <div className="pb-5">
                  <p className={cn("text-sm font-medium", reached ? "text-slate-900 dark:text-white" : "text-slate-400")}>
                    {s.replace(/_/g, " ")}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <ul className="mt-2 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          {events.map((e) => {
            const actor = state.users.find((u) => u.id === e.actorId);
            const name =
              actor?.role === "student"
                ? "You"
                : actor?.role === "admin" || actor?.role === "super_admin"
                  ? "Campus admin"
                  : "System";
            return (
              <li key={e.id} className="text-sm">
                <p className="font-medium">{e.note}</p>
                <p className="text-xs text-slate-500">
                  {name} · {formatDateTime(e.createdAt)}
                </p>
              </li>
            );
          })}
        </ul>
        {(worker || dept) && (
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <Shield className="h-4 w-4" />
            Assigned to {dept?.name}
            {worker ? ` · ${worker.name}` : ""}
          </p>
        )}
      </Card>

      {media.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Evidence</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {media.map((m) => (
              <figure key={m.id} className="overflow-hidden rounded-xl">
                {m.mediaType === "video" ? (
                  <video src={m.storagePath} controls className="h-36 w-full object-cover" />
                ) : (
                  <img src={m.storagePath} alt={`${m.kind} photo`} className="h-36 w-full object-cover" />
                )}
                <figcaption className="bg-slate-50 px-2 py-1 text-[11px] text-slate-500 capitalize">
                  {m.kind}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      <CampusMap
        mode="view"
        pins={[{ id: c.id, lat: c.latitude, lng: c.longitude, category: c.category, label: c.title }]}
        height={220}
      />

      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="h-4 w-4" />
          Updates
        </h2>
        <ul className="space-y-3">
          {comments.length === 0 && <li className="text-sm text-slate-500">No public updates yet.</li>}
          {comments.map((cm) => {
            const a = state.users.find((u) => u.id === cm.authorId);
            const label = a?.id === session?.id ? "You" : a?.role === "student" ? "Student" : "Admin";
            return (
              <li key={cm.id} className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
                <p>{cm.body}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {label} · {relativeTime(cm.createdAt)}
                </p>
              </li>
            );
          })}
        </ul>
        {isMine && (
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!body.trim()) return;
              addComment({
                complaintId: c.id,
                authorId: session!.id,
                body: body.trim(),
                visibility: "public",
              });
              setBody("");
            }}
          >
            <input
              className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ask a question…"
            />
            <Button type="submit" size="sm">
              Send
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
