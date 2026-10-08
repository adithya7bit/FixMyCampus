export type Role =
  | "student"
  | "admin"
  | "super_admin"
  | "worker"
  | "FACILITY_MANAGER"
  | "TECHNICIAN"
  | "DIRECTOR"
  | "STUDENT"
  | "ADMIN";

export type Category =
  | "wifi"
  | "water"
  | "electricity"
  | "power"
  | "furniture"
  | "food_hygiene"
  | "washroom"
  | "classroom"
  | "security"
  | "infrastructure"
  | "lift"
  | "cleanliness"
  | "laboratory"
  | "hostel"
  | "safety"
  | "general"
  | "other";

export type Priority = "low" | "medium" | "high" | "emergency" | "urgent" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";

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
  | "merged"
  | "pending"
  | "resolved"
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REOPENED";

export type MediaKind = "before" | "after" | "reopen" | "evidence" | "resolution";
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
  impactScore?: number;
  reportsSubmitted?: number;
  verifiedFixes?: number;
  communityVotes?: number;
}

export interface Department {
  id: string;
  name: string;
  categories: Category[];
}

export interface Technician {
  id: string;
  name: string;
  specialization: string;
  availability: "AVAILABLE" | "BUSY" | "OFF_DUTY";
  currentWorkload: number;
  activeTickets: number;
  averageResponseMins: number;
  phone: string;
  email?: string;
  rating: number;
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
  ticketId?: string; // alias for publicId
  studentId: string;
  studentName?: string;
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
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  parentComplaintId?: string;
  reopenCount: number;
  isOverdue: boolean;
  slaDueAt: string;
  slaDeadline?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  reopenedAt?: string;
  closedAt?: string;
  aiCategory?: string;
  aiSeverity?: string;
  aiConfidence?: number;
  aiReason?: string;
  aiSummary?: string;
  aiHash?: string;
  urgency?: string;
  safetyRisk?: boolean;
  affectedPeople?: number;
  supportCount: number;
  voteCount?: number;
  verificationReason?: string;
  verificationPhotoUrl?: string;
  resolutionPhoto?: string;
  resolutionNotes?: string;
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

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  unlocked?: boolean;
  progress?: number;
}

export interface AppSettings {
  campusName: string;
  campusCenterLat: number;
  campusCenterLng: number;
  slaHoursByPriority: Record<string, number>;
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
