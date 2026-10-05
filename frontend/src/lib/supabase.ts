import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Complaint, Profile, Status, Priority, Category } from "@/types";

const url =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://odtqxytzethpsygotxyc.supabase.co";
const anon =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kdHF4eXR6ZXRocHN5Z290eHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTExMTYsImV4cCI6MjEwNjA2NzExNn0.KLoOp5Y9blj5VKYhm6DuttooHku1XfuQdKz0NZMvhIk";

export const supabaseEnabled = Boolean(url && anon);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

// Convert string ID to a valid UUID format for PostgreSQL compatibility
export function toUUID(id: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `00000000-0000-4000-8000-${hex.repeat(2).slice(0, 12)}`;
}

const CATEGORY_TO_DEPT: Record<string, string> = {
  wifi: "it_network",
  water: "civil_maintenance",
  electricity: "electrical",
  furniture: "civil_maintenance",
  food_hygiene: "food_services",
  washroom: "housekeeping",
  classroom: "civil_maintenance",
  security: "security",
  infrastructure: "civil_maintenance",
  other: "civil_maintenance",
};

const STATUS_TO_SB: Record<string, string> = {
  submitted: "pending",
  under_review: "pending",
  assigned: "assigned",
  in_progress: "in_progress",
  resolved_pending_verification: "resolved",
  closed_verified: "closed",
  reopened: "reopened",
  rejected: "closed",
  auto_closed: "closed",
  merged: "closed",
};

const SB_TO_STATUS: Record<string, Status> = {
  pending: "submitted",
  assigned: "assigned",
  in_progress: "in_progress",
  resolved: "resolved_pending_verification",
  reopened: "reopened",
  closed: "closed_verified",
  escalated: "in_progress",
};

export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.from("departments").select("id").limit(1);
    return !error && Boolean(data);
  } catch {
    return false;
  }
}

export async function syncComplaintToSupabase(
  c: Complaint,
  user?: Profile | null
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Supabase client not initialized" };
  try {
    const deptId =
      CATEGORY_TO_DEPT[c.category] || c.departmentId || "civil_maintenance";
    const payload = {
      id: toUUID(c.id),
      ticket_number: c.publicId,
      reporter_id: toUUID(c.studentId || "student"),
      reporter_name: user?.fullName || "Campus Student",
      reporter_email: user?.email || "student@campus.edu",
      title: c.title,
      description: c.description,
      category: c.category,
      department_id: deptId,
      location_building: c.building || "Campus Main",
      location_floor: c.floor || "Ground Floor",
      location_room: c.room || "Main Area",
      location_details: c.placeName || null,
      priority: c.priority === "emergency" ? "urgent" : c.priority,
      status: STATUS_TO_SB[c.status] || "pending",
      upvotes: c.supportCount || 1,
      resolution_note: c.verificationReason || null,
      resolution_photo: c.verificationPhotoUrl || null,
      reopen_reason: c.status === "reopened" ? c.verificationReason || "Still broken" : null,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    };

    const { error } = await supabase.from("complaints").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn("[Supabase Sync Error]:", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    console.warn("[Supabase Sync Exception]:", err?.message);
    return { ok: false, error: err?.message };
  }
}

export async function fetchSupabaseComplaints(): Promise<Complaint[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      publicId: row.ticket_number,
      studentId: row.reporter_id,
      title: row.title,
      description: row.description,
      category: (row.category as Category) || "other",
      priority: (row.priority === "urgent" ? "emergency" : row.priority) || "medium",
      status: SB_TO_STATUS[row.status] || "submitted",
      latitude: 11.4969,
      longitude: 77.2766,
      placeName: row.location_details || `${row.location_building} ${row.location_floor}`,
      building: row.location_building,
      floor: row.location_floor,
      room: row.location_room,
      departmentId: row.department_id,
      reopenCount: row.reopen_reason ? 1 : 0,
      isOverdue: false,
      slaDueAt: new Date(Date.now() + 24 * 36e5).toISOString(),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      supportCount: row.upvotes || 1,
      verificationReason: row.resolution_note || row.reopen_reason || undefined,
      verificationPhotoUrl: row.resolution_photo || undefined,
    }));
  } catch {
    return [];
  }
}

export function subscribeToSupabaseComplaints(onChange: () => void): () => void {
  if (!supabase) return () => {};
  try {
    const channel = supabase
      .channel("complaints-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
}

export async function saveUserProfileToSupabase(
  profile: Profile
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Supabase client not initialized" };
  try {
    const uuid = toUUID(profile.id);
    const { error } = await supabase.from("profiles").upsert(
      {
        id: uuid,
        name: profile.fullName || "Student",
        email: profile.email.toLowerCase().trim(),
        role: profile.role || "student",
        avatar_url: profile.avatarUrl || null,
        verified: true,
        created_at: profile.createdAt || new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) {
      console.warn("Supabase profile save error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to save profile" };
  }
}

export async function fetchUserProfileFromSupabase(
  email: string
): Promise<Profile | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("email", email.toLowerCase().trim())
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      fullName: data.name,
      role: (data.role as any) || "student",
      department: data.department_id || "Computer Science",
      year: "3rd Year",
      hostel: "hostel",
      avatarUrl: data.avatar_url,
      createdAt: data.created_at || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function signInWithGoogleOAuth(): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Supabase client not initialized" };
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/student`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to initiate Google OAuth" };
  }
}

