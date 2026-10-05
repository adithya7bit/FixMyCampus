export type Role = "student" | "admin" | "super_admin" | "worker";

export type Category =
  | "wifi"
  | "water"
  | "electricity"
  | "furniture"
  | "food_hygiene"
  | "washroom"
  | "classroom"
  | "security"
  | "infrastructure"
  | "other";

export type Priority = "low" | "medium" | "high" | "emergency";

export type Status =
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved_pending_verification"
  | "closed_verified"
  | "rejected"
  | "reopened"
  | "auto_closed"
  | "merged";

export type MediaKind = "before" | "after" | "reopen";
export type MediaType = "image" | "video";
export type Visibility = "public" | "internal";
export type Residence = "hostel" | "day_scholar" | "";

export interface Profile {
  id: string;
  email: string;
  password?: string;
  role: Role;
  fullName: string;
  department: string;
  year: string;
  hostel: Residence;
  avatarUrl?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  categories: Category[];
}

export interface Worker {
  id: string;
  departmentId: string;
  name: string;
  phone: string;
  specialties: Category[];
  isActive: boolean;
  userId?: string | null;
}

export interface Complaint {
  id: string;
  publicId: string;
  studentId: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  latitude: number;
  longitude: number;
  placeName: string;
  building: string;
  floor: string;
  room: string;
  departmentId?: string;
  assignedWorkerId?: string;
  parentComplaintId?: string;
  reopenCount: number;
  isOverdue: boolean;
  slaDueAt: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  aiCategory?: Category;
  aiPriority?: Priority;
  aiSummary?: string;
  aiHash?: string;
  supportCount: number;
}

export interface ComplaintMedia {
  id: string;
  complaintId: string;
  storagePath: string;
  kind: MediaKind;
  mediaType: MediaType;
  createdAt: string;
}

export interface ComplaintEvent {
  id: string;
  complaintId: string;
  actorId: string;
  fromStatus?: Status;
  toStatus?: Status;
  note: string;
  visibility: Visibility;
  createdAt: string;
}

export interface ComplaintSupport {
  complaintId: string;
  studentId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  complaintId: string;
  authorId: string;
  body: string;
  visibility: Visibility;
  createdAt: string;
}

export interface Verification {
  id: string;
  complaintId: string;
  studentId: string;
  outcome: "fixed" | "not_fixed";
  reason?: string;
  createdAt: string;
}

export interface Inspection {
  id: string;
  complaintId: string;
  inspectorId: string;
  findings: string;
  actionTaken: string;
  followUpDate?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  complaintId?: string;
  title: string;
  body: string;
  readAt?: string;
  createdAt: string;
}

export interface AppSettings {
  campusName: string;
  campusCenterLat: number;
  campusCenterLng: number;
  slaHoursByPriority: Record<Priority, number>;
  autoCloseDays: number;
}

export interface Building {
  id: string;
  name: string;
  kind: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  tone: "success" | "error" | "info";
}
