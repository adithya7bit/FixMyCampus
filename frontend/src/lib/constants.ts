import type { Building, Category, Priority, Status } from "@/types";

export const APP_NAME = "FixMyCampus";
export const TAGLINE = "See it. Report it. Get it fixed.";

export const CAMPUS_NAME =
  import.meta.env.VITE_CAMPUS_NAME || "Meridian Institute of Technology";

export const CAMPUS_CENTER = {
  lat: Number(import.meta.env.VITE_CAMPUS_LAT || 28.545),
  lng: Number(import.meta.env.VITE_CAMPUS_LNG || 77.193),
};

export const CATEGORIES: {
  id: Category;
  label: string;
  hint: string;
}[] = [
  { id: "wifi", label: "Wi-Fi / Network", hint: "Outages, dead zones, slow intranet" },
  { id: "water", label: "Water", hint: "Leaks, no supply, dirty water" },
  { id: "electricity", label: "Electricity", hint: "Outages, exposed wires, lights" },
  { id: "furniture", label: "Furniture", hint: "Chairs, benches, desks, boards" },
  { id: "food_hygiene", label: "Food & Hygiene", hint: "Insects, quality, kitchen cleanliness" },
  { id: "washroom", label: "Washroom / Cleanliness", hint: "Toilets, hygiene, housekeeping" },
  { id: "classroom", label: "Classroom / Lab", hint: "Projectors, benches, lab equipment" },
  { id: "security", label: "Security / Safety", hint: "Lighting, access, hazards" },
  { id: "infrastructure", label: "Infrastructure", hint: "Roads, roofs, drainage, buildings" },
  { id: "other", label: "Other", hint: "Anything that doesn't fit above" },
];

export const PRIORITIES: { id: Priority; label: string; hint: string }[] = [
  { id: "low", label: "Low", hint: "Annoying, not blocking anyone" },
  { id: "medium", label: "Medium", hint: "Affects daily use" },
  { id: "high", label: "High", hint: "Disrupts a class, hostel or mess" },
  { id: "emergency", label: "Emergency", hint: "Immediate danger — wires, gas, flood, food hazard" },
];

export const STATUSES: { id: Status; label: string }[] = [
  { id: "submitted", label: "Submitted" },
  { id: "under_review", label: "Under review" },
  { id: "assigned", label: "Assigned" },
  { id: "in_progress", label: "In progress" },
  { id: "resolved_pending_verification", label: "Awaiting verification" },
  { id: "closed_verified", label: "Closed (verified)" },
  { id: "rejected", label: "Rejected" },
  { id: "reopened", label: "Reopened" },
  { id: "auto_closed", label: "Auto-closed" },
  { id: "merged", label: "Merged" },
];

export const TIMELINE_STEPS: Status[] = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved_pending_verification",
  "closed_verified",
];

export const OPEN_STATUSES: Status[] = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "reopened",
  "resolved_pending_verification",
];

export const TERMINAL_STATUSES: Status[] = [
  "closed_verified",
  "rejected",
  "auto_closed",
  "merged",
];

export const STATUS_COLOR: Record<
  Status,
  { bg: string; text: string; dot: string; hex: string }
> = {
  submitted: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200", dot: "bg-slate-500", hex: "#64748b" },
  under_review: { bg: "bg-blue-50 dark:bg-blue-950/50", text: "text-blue-800 dark:text-blue-200", dot: "bg-blue-500", hex: "#3b82f6" },
  assigned: { bg: "bg-indigo-50 dark:bg-indigo-950/50", text: "text-indigo-800 dark:text-indigo-200", dot: "bg-indigo-500", hex: "#6366f1" },
  in_progress: { bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-800 dark:text-amber-200", dot: "bg-amber-500", hex: "#f59e0b" },
  resolved_pending_verification: { bg: "bg-violet-50 dark:bg-violet-950/50", text: "text-violet-800 dark:text-violet-200", dot: "bg-violet-500", hex: "#8b5cf6" },
  closed_verified: { bg: "bg-emerald-50 dark:bg-emerald-950/50", text: "text-emerald-800 dark:text-emerald-200", dot: "bg-emerald-600", hex: "#059669" },
  rejected: { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-800 dark:text-rose-200", dot: "bg-rose-500", hex: "#f43f5e" },
  reopened: { bg: "bg-orange-50 dark:bg-orange-950/50", text: "text-orange-800 dark:text-orange-200", dot: "bg-orange-500", hex: "#f97316" },
  auto_closed: { bg: "bg-stone-100 dark:bg-stone-800", text: "text-stone-700 dark:text-stone-200", dot: "bg-stone-500", hex: "#78716c" },
  merged: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-700 dark:text-zinc-200", dot: "bg-zinc-500", hex: "#71717a" },
};

export const PRIORITY_COLOR: Record<Priority, { bg: string; text: string; hex: string }> = {
  low: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200", hex: "#64748b" },
  medium: { bg: "bg-sky-50 dark:bg-sky-950/50", text: "text-sky-800 dark:text-sky-200", hex: "#0ea5e9" },
  high: { bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-900 dark:text-amber-200", hex: "#d97706" },
  emergency: { bg: "bg-red-50 dark:bg-red-950/50", text: "text-red-800 dark:text-red-200", hex: "#dc2626" },
};

export const CATEGORY_COLOR: Record<Category, string> = {
  wifi: "#0284c7",
  water: "#2563eb",
  electricity: "#ca8a04",
  furniture: "#7c3aed",
  food_hygiene: "#dc2626",
  washroom: "#0f766e",
  classroom: "#4f46e5",
  security: "#be123c",
  infrastructure: "#57534e",
  other: "#64748b",
};

export const DEFAULT_SLA: Record<Priority, number> = {
  emergency: 4,
  high: 24,
  medium: 72,
  low: 168,
};

export const RATE_LIMIT_PER_DAY = 10;
export const DUPLICATE_METERS = 50;
export const IMAGE_MAX_MB = 10;
export const VIDEO_MAX_MB = 50;

export const DEPARTMENTS_SEED = [
  { id: "dept-maint", name: "Maintenance", categories: ["water", "furniture", "infrastructure"] as Category[] },
  { id: "dept-it", name: "IT Services", categories: ["wifi", "classroom"] as Category[] },
  { id: "dept-elec", name: "Electrical", categories: ["electricity"] as Category[] },
  { id: "dept-house", name: "Housekeeping", categories: ["washroom"] as Category[] },
  { id: "dept-mess", name: "Mess & Canteen", categories: ["food_hygiene"] as Category[] },
  { id: "dept-sec", name: "Security", categories: ["security"] as Category[] },
  { id: "dept-estate", name: "Estate Office", categories: ["infrastructure", "other"] as Category[] },
];

export const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Postgraduate", "Faculty / Staff"];

export const ACADEMIC_DEPTS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "Biotechnology",
  "Architecture",
  "Business",
  "Other",
];

export const BUILDINGS: Building[] = [
  { id: "admin", name: "Admin Block", kind: "admin", lat: 28.5462, lng: 77.1928, x: 42, y: 8, w: 16, h: 10 },
  { id: "block-a", name: "Academic Block A", kind: "academic", lat: 28.5458, lng: 77.1922, x: 14, y: 18, w: 22, h: 14 },
  { id: "block-b", name: "Academic Block B", kind: "academic", lat: 28.5456, lng: 77.1935, x: 64, y: 16, w: 22, h: 14 },
  { id: "library", name: "Central Library", kind: "library", lat: 28.5448, lng: 77.1928, x: 40, y: 28, w: 18, h: 12 },
  { id: "labs", name: "Labs Complex", kind: "lab", lat: 28.5452, lng: 77.1942, x: 78, y: 34, w: 16, h: 12 },
  { id: "auditorium", name: "Auditorium", kind: "hall", lat: 28.546, lng: 77.194, x: 64, y: 6, w: 18, h: 8 },
  { id: "workshop", name: "Workshop", kind: "infra", lat: 28.545, lng: 77.1915, x: 6, y: 38, w: 16, h: 10 },
  { id: "mess", name: "Central Mess", kind: "mess", lat: 28.544, lng: 77.1925, x: 28, y: 52, w: 18, h: 10 },
  { id: "canteen", name: "Canteen", kind: "mess", lat: 28.5444, lng: 77.1938, x: 54, y: 48, w: 14, h: 8 },
  { id: "h1", name: "Hostel H1", kind: "hostel", lat: 28.5438, lng: 77.1918, x: 8, y: 66, w: 20, h: 14 },
  { id: "h2", name: "Hostel H2", kind: "hostel", lat: 28.5436, lng: 77.1932, x: 36, y: 68, w: 20, h: 14 },
  { id: "h3", name: "Hostel H3", kind: "hostel", lat: 28.5435, lng: 77.1944, x: 64, y: 66, w: 20, h: 14 },
  { id: "sports", name: "Sports Complex", kind: "sports", lat: 28.5432, lng: 77.194, x: 78, y: 52, w: 16, h: 10 },
  { id: "gate", name: "Main Gate", kind: "gate", lat: 28.5466, lng: 77.193, x: 44, y: 1, w: 12, h: 5 },
];

export const PHOTO = {
  hero: "https://images.pexels.com/photos/38248723/pexels-photo-38248723.jpeg?auto=compress&cs=tinysrgb&w=1800",
  campus: "https://images.pexels.com/photos/31156623/pexels-photo-31156623.jpeg?auto=compress&cs=tinysrgb&w=1600",
  arches: "https://images.pexels.com/photos/39257919/pexels-photo-39257919.jpeg?auto=compress&cs=tinysrgb&w=1600",
  students: "https://images.pexels.com/photos/7972324/pexels-photo-7972324.jpeg?auto=compress&cs=tinysrgb&w=1600",
  students2: "https://images.pexels.com/photos/7972373/pexels-photo-7972373.jpeg?auto=compress&cs=tinysrgb&w=1200",
  admin: "https://images.pexels.com/photos/7580938/pexels-photo-7580938.jpeg?auto=compress&cs=tinysrgb&w=1200",
  water: "https://images.pexels.com/photos/4406597/pexels-photo-4406597.jpeg?auto=compress&cs=tinysrgb&w=1200",
  furniture: "https://images.pexels.com/photos/36650154/pexels-photo-36650154.jpeg?auto=compress&cs=tinysrgb&w=1200",
  classroom: "https://images.pexels.com/photos/9780101/pexels-photo-9780101.jpeg?auto=compress&cs=tinysrgb&w=1200",
  electrical: "https://images.pexels.com/photos/8488059/pexels-photo-8488059.jpeg?auto=compress&cs=tinysrgb&w=1200",
  electrician: "https://images.pexels.com/photos/27928762/pexels-photo-27928762.jpeg?auto=compress&cs=tinysrgb&w=1200",
  washroom: "https://images.pexels.com/photos/17461785/pexels-photo-17461785.jpeg?auto=compress&cs=tinysrgb&w=1200",
  food: "https://images.pexels.com/photos/34570/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200",
};

export const DEMO_ACCOUNTS = {
  student: { email: "priya@meridian.edu", password: "demo1234", name: "Priya Sharma" },
  admin: { email: "admin@meridian.edu", password: "demo1234", name: "Kavita Nair" },
  superAdmin: { email: "director@meridian.edu", password: "demo1234", name: "Dr. Anil Rao" },
};
