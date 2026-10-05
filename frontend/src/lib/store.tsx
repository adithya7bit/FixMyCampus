import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DUPLICATE_METERS, RATE_LIMIT_PER_DAY } from "@/lib/constants";
import { haversineMeters, jaccard, nearestBuilding, placeNameFrom } from "@/lib/geo";
import { uid } from "@/lib/format";
import { createSeed, type SeedState } from "@/lib/seed";
import { assertTransition, canTransition, isOpen, isTerminal } from "@/lib/status";
import type {
  AppSettings,
  Category,
  Complaint,
  ComplaintEvent,
  ComplaintMedia,
  Inspection,
  Notification,
  Priority,
  Profile,
  Status,
  ToastItem,
  Worker,
} from "@/types";

const KEY = "fmc-store-v1";

function load(): SeedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SeedState;
      if (parsed?.users?.length && parsed?.complaints?.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return createSeed();
}

function persist(s: SeedState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

function publicId(seq: number) {
  return `FMC-2026-${String(seq).padStart(6, "0")}`;
}

function slaDue(priority: Priority, hours: Record<Priority, number>) {
  return new Date(Date.now() + hours[priority] * 36e5).toISOString();
}

export interface DuplicateHit {
  complaint: Complaint;
  meters: number;
  similarity: number;
}

export interface CreateComplaintInput {
  studentId: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  latitude: number;
  longitude: number;
  building: string;
  floor: string;
  room: string;
  mediaDataUrls: { url: string; mediaType: "image" | "video" }[];
  aiSummary?: string;
  aiCategory?: Category;
  aiPriority?: Priority;
}

interface StoreCtx {
  state: SeedState;
  session: Profile | null;
  toasts: ToastItem[];
  signIn: (email: string, password: string) => { ok: boolean; error?: string; user?: Profile };
  signUp: (input: {
    fullName: string;
    email: string;
    password: string;
    department: string;
    year: string;
    hostel: Profile["hostel"];
  }) => { ok: boolean; error?: string };
  signOut: () => void;
  requestReset: (email: string) => { ok: boolean; error?: string };
  createComplaint: (input: CreateComplaintInput) => { ok: boolean; complaint?: Complaint; error?: string };
  addSupport: (complaintId: string, studentId: string) => { ok: boolean; error?: string };
  findDuplicates: (input: {
    category: Category;
    lat: number;
    lng: number;
    description: string;
    excludeId?: string;
  }) => DuplicateHit[];
  transition: (input: {
    complaintId: string;
    to: Status;
    actorId: string;
    note: string;
    visibility?: "public" | "internal";
  }) => { ok: boolean; error?: string };
  assign: (input: {
    complaintId: string;
    actorId: string;
    departmentId: string;
    workerId?: string;
    note?: string;
  }) => { ok: boolean; error?: string };
  updateComplaintMeta: (input: {
    complaintId: string;
    actorId: string;
    category?: Category;
    priority?: Priority;
    departmentId?: string;
  }) => void;
  addComment: (input: {
    complaintId: string;
    authorId: string;
    body: string;
    visibility: "public" | "internal";
  }) => void;
  addMedia: (input: {
    complaintId: string;
    url: string;
    kind: "before" | "after" | "reopen";
    mediaType: "image" | "video";
  }) => void;
  verify: (input: {
    complaintId: string;
    studentId: string;
    outcome: "fixed" | "not_fixed";
    reason?: string;
    photoUrl?: string;
  }) => { ok: boolean; error?: string };
  merge: (parentId: string, childId: string, actorId: string) => { ok: boolean; error?: string };
  suggestAssignment: (category: Category) => { departmentId?: string; workerId?: string };
  saveWorker: (w: Worker) => void;
  deleteWorker: (id: string) => void;
  saveDepartment: (d: SeedState["departments"][number]) => void;
  addInspection: (input: Omit<Inspection, "id" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: (userId: string) => void;
  saveSettings: (s: AppSettings) => void;
  createAdmin: (input: { fullName: string; email: string; password: string; department: string }) => {
    ok: boolean;
    error?: string;
  };
  resetDemo: () => void;
  dismissToast: (id: string) => void;
  toast: (t: Omit<ToastItem, "id">) => void;
  todayCount: (studentId: string) => number;
  runMaintenance: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SeedState>(() => load());
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem("fmc-session"));
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const session = state.users.find((u) => u.id === sessionId) ?? null;

  useEffect(() => persist(state), [state]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue) as SeedState);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const patch = useCallback((fn: (s: SeedState) => SeedState) => {
    setState((prev) => fn(prev));
  }, []);

  const toast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = uid("toast");
    setToasts((prev) => [...prev, { ...t, id }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const notify = useCallback(
    (n: Omit<Notification, "id" | "createdAt">) => {
      patch((s) => ({
        ...s,
        notifications: [
          {
            ...n,
            id: uid("nt"),
            createdAt: new Date().toISOString(),
          },
          ...s.notifications,
        ],
      }));
    },
    [patch],
  );

  const signIn: StoreCtx["signIn"] = (email, password) => {
    const user = state.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );
    if (!user) return { ok: false, error: "Those credentials don’t match our records." };
    setSessionId(user.id);
    localStorage.setItem("fmc-session", user.id);
    return { ok: true, user };
  };

  const signUp: StoreCtx["signUp"] = (input) => {
    if (state.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (input.password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
    const id = uid("u");
    const user: Profile = {
      id,
      email: input.email.trim(),
      password: input.password,
      role: "student",
      fullName: input.fullName.trim(),
      department: input.department,
      year: input.year,
      hostel: input.hostel,
      createdAt: new Date().toISOString(),
    };
    patch((s) => ({ ...s, users: [...s.users, user] }));
    setSessionId(id);
    localStorage.setItem("fmc-session", id);
    return { ok: true };
  };

  const signOut = () => {
    setSessionId(null);
    localStorage.removeItem("fmc-session");
  };

  const requestReset: StoreCtx["requestReset"] = (email) => {
    const exists = state.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) return { ok: false, error: "No account found for that email." };
    return { ok: true };
  };

  const todayCount = (studentId: string) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return state.complaints.filter(
      (c) => c.studentId === studentId && new Date(c.createdAt) >= start && c.status !== "merged",
    ).length;
  };

  const findDuplicates: StoreCtx["findDuplicates"] = (input) => {
    const hits: DuplicateHit[] = [];
    for (const c of state.complaints) {
      if (input.excludeId && c.id === input.excludeId) continue;
      if (c.category !== input.category) continue;
      if (!isOpen(c.status) || c.status === "resolved_pending_verification") continue;
      const meters = haversineMeters(
        { lat: input.lat, lng: input.lng },
        { lat: c.latitude, lng: c.longitude },
      );
      const similarity = jaccard(input.description, `${c.title} ${c.description}`);
      if (meters <= DUPLICATE_METERS || similarity >= 0.32) {
        hits.push({ complaint: c, meters, similarity });
      }
    }
    return hits.sort((a, b) => a.meters - b.meters).slice(0, 4);
  };

  const createComplaint: StoreCtx["createComplaint"] = (input) => {
    if (todayCount(input.studentId) >= RATE_LIMIT_PER_DAY) {
      return { ok: false, error: `Daily limit reached (${RATE_LIMIT_PER_DAY} reports).` };
    }
    if (!input.title.trim() || input.title.trim().length < 8) {
      return { ok: false, error: "Please write a clearer title (at least 8 characters)." };
    }
    if (!input.description.trim() || input.description.trim().length < 20) {
      return { ok: false, error: "Please describe the problem in a bit more detail." };
    }
    const now = new Date().toISOString();
    const id = uid("cmp");
    const seq = state.nextPublicSeq;
    const building = input.building || nearestBuilding(input.latitude, input.longitude).name;
    const dept = state.departments.find((d) => d.categories.includes(input.category));
    const created: Complaint = {
      id,
      publicId: publicId(seq),
      studentId: input.studentId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      priority:
        input.category === "food_hygiene" && input.priority !== "emergency"
          ? "high"
          : input.priority,
      status: "submitted",
      latitude: input.latitude,
      longitude: input.longitude,
      placeName: placeNameFrom(input.latitude, input.longitude, building),
      building,
      floor: input.floor,
      room: input.room,
      departmentId: dept?.id,
      reopenCount: 0,
      isOverdue: false,
      slaDueAt: slaDue(input.priority, state.settings.slaHoursByPriority),
      createdAt: now,
      updatedAt: now,
      supportCount: 1,
      aiSummary: input.aiSummary,
      aiCategory: input.aiCategory,
      aiPriority: input.aiPriority,
    };
    const media: ComplaintMedia[] = input.mediaDataUrls.map((m) => ({
      id: uid("med"),
      complaintId: id,
      storagePath: m.url,
      kind: "before",
      mediaType: m.mediaType,
      createdAt: now,
    }));
    const event: ComplaintEvent = {
      id: uid("evt"),
      complaintId: id,
      actorId: input.studentId,
      toStatus: "submitted",
      note: "Complaint submitted",
      visibility: "public",
      createdAt: now,
    };
    patch((s) => ({
      ...s,
      nextPublicSeq: seq + 1,
      complaints: [created, ...s.complaints],
      media: [...media, ...s.media],
      events: [event, ...s.events],
    }));
    const admins = state.users.filter((u) => u.role === "admin" || u.role === "super_admin");
    admins.forEach((a) =>
      notify({
        userId: a.id,
        type: input.priority === "emergency" ? "emergency" : "new",
        complaintId: id,
        title:
          input.priority === "emergency"
            ? `Emergency: ${input.title}`
            : `New complaint ${created.publicId}`,
        body: `${input.category} · ${input.title}`,
      }),
    );
    return { ok: true, complaint: created };
  };

  const addSupport: StoreCtx["addSupport"] = (complaintId, studentId) => {
    const already = state.supports.some((x) => x.complaintId === complaintId && x.studentId === studentId);
    if (already) return { ok: false, error: "You have already supported this report." };
    const now = new Date().toISOString();
    patch((s) => ({
      ...s,
      supports: [...s.supports, { complaintId, studentId, createdAt: now }],
      complaints: s.complaints.map((c) =>
        c.id === complaintId ? { ...c, supportCount: c.supportCount + 1, updatedAt: now } : c,
      ),
    }));
    return { ok: true };
  };

  const transition: StoreCtx["transition"] = ({ complaintId, to, actorId, note, visibility = "public" }) => {
    const c = state.complaints.find((x) => x.id === complaintId);
    if (!c) return { ok: false, error: "Complaint not found." };
    if (!canTransition(c.status, to)) {
      return { ok: false, error: `Cannot move from ${c.status} to ${to}.` };
    }
    try {
      assertTransition(c.status, to);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Invalid transition" };
    }
    const now = new Date().toISOString();
    const from = c.status;
    let nextStatus: Status = to;
    let reopenCount = c.reopenCount;
    if (to === "reopened") {
      nextStatus = "under_review";
      reopenCount += 1;
    }
    patch((s) => ({
      ...s,
      complaints: s.complaints.map((x) =>
        x.id === complaintId
          ? {
              ...x,
              status: nextStatus,
              reopenCount,
              updatedAt: now,
              resolvedAt: nextStatus === "resolved_pending_verification" ? now : x.resolvedAt,
              closedAt:
                nextStatus === "closed_verified" || nextStatus === "auto_closed" ? now : x.closedAt,
              isOverdue: isTerminal(nextStatus) ? false : x.isOverdue,
            }
          : x,
      ),
      events: [
        {
          id: uid("evt"),
          complaintId,
          actorId,
          fromStatus: from,
          toStatus: to,
          note,
          visibility,
          createdAt: now,
        },
        ...s.events,
      ],
    }));

    const student = c.studentId;
    if (to === "resolved_pending_verification") {
      notify({
        userId: student,
        type: "verification",
        complaintId,
        title: "Is this problem actually fixed?",
        body: `${c.publicId} was marked resolved. Please confirm.`,
      });
    } else if (to === "reopened" || nextStatus === "under_review" && from === "resolved_pending_verification") {
      state.users
        .filter((u) => u.role === "admin" || u.role === "super_admin")
        .forEach((a) =>
          notify({
            userId: a.id,
            type: "reopen",
            complaintId,
            title: `${c.publicId} was reopened`,
            body: note || "The student says the problem is still there.",
          }),
        );
    } else if (student !== actorId) {
      notify({
        userId: student,
        type: "status",
        complaintId,
        title: `Update on ${c.publicId}`,
        body: note || `Status is now ${nextStatus.replace(/_/g, " ")}.`,
      });
    }
    return { ok: true };
  };

  const assign: StoreCtx["assign"] = ({ complaintId, actorId, departmentId, workerId, note }) => {
    const c = state.complaints.find((x) => x.id === complaintId);
    if (!c) return { ok: false, error: "Not found" };
    const now = new Date().toISOString();
    const worker = state.workers.find((w) => w.id === workerId);
    const dept = state.departments.find((d) => d.id === departmentId);
    const to: Status = c.status === "submitted" || c.status === "under_review" || c.status === "reopened" ? "assigned" : c.status;
    if (to === "assigned" && c.status !== "assigned") {
      const t = transition({
        complaintId,
        to: "assigned",
        actorId,
        note: note || `Assigned to ${worker?.name ?? dept?.name ?? "department"}`,
      });
      if (!t.ok) return t;
    }
    patch((s) => ({
      ...s,
      complaints: s.complaints.map((x) =>
        x.id === complaintId
          ? { ...x, departmentId, assignedWorkerId: workerId, updatedAt: now }
          : x,
      ),
    }));
    return { ok: true };
  };

  const updateComplaintMeta: StoreCtx["updateComplaintMeta"] = ({
    complaintId,
    actorId,
    category,
    priority,
    departmentId,
  }) => {
    const now = new Date().toISOString();
    patch((s) => ({
      ...s,
      complaints: s.complaints.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              category: category ?? c.category,
              priority: priority ?? c.priority,
              departmentId: departmentId ?? c.departmentId,
              updatedAt: now,
            }
          : c,
      ),
      events: [
        {
          id: uid("evt"),
          complaintId,
          actorId,
          note: "Updated category / priority / department",
          visibility: "internal",
          createdAt: now,
        },
        ...s.events,
      ],
    }));
  };

  const addComment: StoreCtx["addComment"] = ({ complaintId, authorId, body, visibility }) => {
    const now = new Date().toISOString();
    patch((s) => ({
      ...s,
      comments: [
        { id: uid("cmt"), complaintId, authorId, body, visibility, createdAt: now },
        ...s.comments,
      ],
    }));
    const c = state.complaints.find((x) => x.id === complaintId);
    if (c && visibility === "public" && authorId !== c.studentId) {
      notify({
        userId: c.studentId,
        type: "comment",
        complaintId,
        title: "New update from campus admin",
        body,
      });
    }
  };

  const addMedia: StoreCtx["addMedia"] = ({ complaintId, url, kind, mediaType }) => {
    const now = new Date().toISOString();
    patch((s) => ({
      ...s,
      media: [
        { id: uid("med"), complaintId, storagePath: url, kind, mediaType, createdAt: now },
        ...s.media,
      ],
    }));
  };

  const verify: StoreCtx["verify"] = ({ complaintId, studentId, outcome, reason, photoUrl }) => {
    const c = state.complaints.find((x) => x.id === complaintId);
    if (!c) return { ok: false, error: "Not found" };
    if (c.studentId !== studentId) return { ok: false, error: "Only the reporter can verify." };
    if (c.status !== "resolved_pending_verification") {
      return { ok: false, error: "This complaint is not waiting for verification." };
    }
    const now = new Date().toISOString();
    patch((s) => ({
      ...s,
      verifications: [
        {
          id: uid("ver"),
          complaintId,
          studentId,
          outcome,
          reason,
          createdAt: now,
        },
        ...s.verifications,
      ],
    }));
    if (photoUrl) addMedia({ complaintId, url: photoUrl, kind: "reopen", mediaType: "image" });
    if (outcome === "fixed") {
      return transition({
        complaintId,
        to: "closed_verified",
        actorId: studentId,
        note: "Student confirmed the fix",
      });
    }
    return transition({
      complaintId,
      to: "reopened",
      actorId: studentId,
      note: reason || "Student reports the problem is still there",
    });
  };

  const merge: StoreCtx["merge"] = (parentId, childId, actorId) => {
    if (parentId === childId) return { ok: false, error: "Cannot merge into itself." };
    const child = state.complaints.find((c) => c.id === childId);
    if (!child) return { ok: false, error: "Not found" };
    const now = new Date().toISOString();
    patch((s) => ({
      ...s,
      complaints: s.complaints.map((c) => {
        if (c.id === childId) {
          return { ...c, status: "merged" as Status, parentComplaintId: parentId, updatedAt: now };
        }
        if (c.id === parentId) {
          return { ...c, supportCount: c.supportCount + child.supportCount, updatedAt: now };
        }
        return c;
      }),
      events: [
        {
          id: uid("evt"),
          complaintId: childId,
          actorId,
          fromStatus: child.status,
          toStatus: "merged",
          note: `Merged into parent complaint`,
          visibility: "public",
          createdAt: now,
        },
        ...s.events,
      ],
    }));
    return { ok: true };
  };

  const suggestAssignment: StoreCtx["suggestAssignment"] = (category) => {
    const dept = state.departments.find((d) => d.categories.includes(category));
    if (!dept) return {};
    const active = state.workers.filter((w) => w.departmentId === dept.id && w.isActive);
    const load = (id: string) =>
      state.complaints.filter(
        (c) => c.assignedWorkerId === id && isOpen(c.status) && c.status !== "resolved_pending_verification",
      ).length;
    const sorted = [...active].sort((a, b) => load(a.id) - load(b.id));
    return { departmentId: dept.id, workerId: sorted[0]?.id };
  };

  const saveWorker: StoreCtx["saveWorker"] = (w) => {
    patch((s) => {
      const exists = s.workers.some((x) => x.id === w.id);
      return {
        ...s,
        workers: exists ? s.workers.map((x) => (x.id === w.id ? w : x)) : [...s.workers, w],
      };
    });
  };

  const deleteWorker: StoreCtx["deleteWorker"] = (id) => {
    patch((s) => ({ ...s, workers: s.workers.filter((w) => w.id !== id) }));
  };

  const saveDepartment: StoreCtx["saveDepartment"] = (d) => {
    patch((s) => {
      const exists = s.departments.some((x) => x.id === d.id);
      return {
        ...s,
        departments: exists ? s.departments.map((x) => (x.id === d.id ? d : x)) : [...s.departments, d],
      };
    });
  };

  const addInspection: StoreCtx["addInspection"] = (input) => {
    patch((s) => ({
      ...s,
      inspections: [
        { ...input, id: uid("ins"), createdAt: new Date().toISOString() },
        ...s.inspections,
      ],
    }));
  };

  const markRead = (id: string) => {
    const now = new Date().toISOString();
    patch((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, readAt: now } : n)),
    }));
  };

  const markAllRead = (userId: string) => {
    const now = new Date().toISOString();
    patch((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.userId === userId && !n.readAt ? { ...n, readAt: now } : n,
      ),
    }));
  };

  const saveSettings = (settings: AppSettings) => patch((s) => ({ ...s, settings }));

  const createAdmin: StoreCtx["createAdmin"] = (input) => {
    if (state.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return { ok: false, error: "Email already in use." };
    }
    const user: Profile = {
      id: uid("u"),
      email: input.email,
      password: input.password,
      role: "admin",
      fullName: input.fullName,
      department: input.department,
      year: "",
      hostel: "",
      createdAt: new Date().toISOString(),
    };
    patch((s) => ({ ...s, users: [...s.users, user] }));
    return { ok: true };
  };

  const resetDemo = () => {
    const fresh = createSeed();
    setState(fresh);
    persist(fresh);
    toast({ tone: "info", title: "Demo data restored" });
  };

  const dismissToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const runMaintenance = useCallback(() => {
    const now = Date.now();
    patch((s) => {
      let complaints = s.complaints;
      const events = [...s.events];
      const notifications = [...s.notifications];
      complaints = complaints.map((c) => {
        if (isOpen(c.status) && c.status !== "resolved_pending_verification" && now > new Date(c.slaDueAt).getTime() && !c.isOverdue) {
          notifications.unshift({
            id: uid("nt"),
            userId: "u_director",
            type: "escalation",
            complaintId: c.id,
            title: `${c.publicId} is overdue`,
            body: `${c.title} passed its SLA.`,
            createdAt: new Date().toISOString(),
          });
          return { ...c, isOverdue: true };
        }
        if (c.status === "resolved_pending_verification") {
          const resolved = c.resolvedAt ? new Date(c.resolvedAt).getTime() : new Date(c.updatedAt).getTime();
          const days = (now - resolved) / 864e5;
          if (days >= s.settings.autoCloseDays) {
            events.unshift({
              id: uid("evt"),
              complaintId: c.id,
              actorId: "system",
              fromStatus: c.status,
              toStatus: "auto_closed",
              note: "Auto-closed: no student response",
              visibility: "public",
              createdAt: new Date().toISOString(),
            });
            return { ...c, status: "auto_closed", closedAt: new Date().toISOString(), isOverdue: false };
          }
        }
        return c;
      });
      return { ...s, complaints, events, notifications };
    });
  }, [patch]);

  useEffect(() => {
    runMaintenance();
  }, [runMaintenance]);

  const value = useMemo<StoreCtx>(
    () => ({
      state,
      session,
      toasts,
      signIn,
      signUp,
      signOut,
      requestReset,
      createComplaint,
      addSupport,
      findDuplicates,
      transition,
      assign,
      updateComplaintMeta,
      addComment,
      addMedia,
      verify,
      merge,
      suggestAssignment,
      saveWorker,
      deleteWorker,
      saveDepartment,
      addInspection,
      markRead,
      markAllRead,
      saveSettings,
      createAdmin,
      resetDemo,
      dismissToast,
      toast,
      todayCount,
      runMaintenance,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, session, toasts, toast, runMaintenance],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
