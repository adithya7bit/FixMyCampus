import type { Building, Category, Priority, Status, Badge } from "@/types";

export const APP_NAME = "CAMPUSIQ";
export const TAGLINE = "Smarter Campus. Faster Resolution.";
export const HERO_DESCRIPTION = "AI-powered campus facility management that transforms student complaints into faster, smarter action.";

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
  iconName?: string;
}[] = [
  { id: "wifi", label: "Wi-Fi", hint: "Outages, dead zones, router offline" },
  { id: "infrastructure", label: "Infrastructure", hint: "Roads, roofs, building cracks, drainage" },
  { id: "safety", label: "Safety", hint: "Emergency exits, perimeter hazards, security" },
  { id: "washroom", label: "Toilet / Sanitation", hint: "Restroom hygiene, flushes, soap, stalls" },
  { id: "electricity", label: "Electrical", hint: "Sparks, switches, loose wires, breakers" },
  { id: "power", label: "Power", hint: "Total power blackout, generator, substation" },
  { id: "classroom", label: "Classroom", hint: "Projectors, podium, mics, smartboards" },
  { id: "furniture", label: "Furniture", hint: "Desks, chairs, broken benches, podiums" },
  { id: "lift", label: "Lift / Elevator", hint: "Stuck elevator, jerky cab, door jam, alarm" },
  { id: "cleanliness", label: "Cleanliness", hint: "Trash overflow, cafeteria food hygiene" },
  { id: "laboratory", label: "Laboratory", hint: "Gas valves, lab safety, fume hoods, equipment" },
  { id: "hostel", label: "Hostel", hint: "Geysers, dorm doors, warden repairs, beds" },
  { id: "water", label: "Water", hint: "Pipe leaks, water supply, taps, washroom" },
  { id: "general", label: "General", hint: "Campus facility issues not listed above" },
  { id: "food_hygiene", label: "Food & Dining", hint: "Mess food quality, insects, cafeteria" },
  { id: "other", label: "Other", hint: "Miscellaneous campus inquiries" }
];

export const PRIORITIES: { id: Priority; label: string; hint: string }[] = [
  { id: "low", label: "LOW", hint: "Non-critical inconvenience, cosmetic repair" },
  { id: "medium", label: "MEDIUM", hint: "Routine issue affecting daily academic workflow" },
  { id: "high", label: "HIGH", hint: "Major failure affecting entire classrooms or dorms" },
  { id: "urgent", label: "URGENT", hint: "Immediate safety hazard or critical system failure" },
];

export const STATUSES: { id: Status; label: string }[] = [
  { id: "submitted", label: "PENDING" },
  { id: "under_review", label: "UNDER REVIEW" },
  { id: "assigned", label: "ASSIGNED" },
  { id: "in_progress", label: "IN PROGRESS" },
  { id: "resolved_pending_verification", label: "RESOLVED (PENDING VERIFICATION)" },
  { id: "closed_verified", label: "RESOLVED & VERIFIED" },
  { id: "reopened", label: "REOPENED" },
  { id: "rejected", label: "REJECTED" },
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
  "pending",
  "resolved_pending_verification",
];

export const TERMINAL_STATUSES: Status[] = [
  "closed_verified",
  "rejected",
  "auto_closed",
  "merged",
];

export const STATUS_COLOR: Record<
  string,
  { bg: string; text: string; dot: string; hex: string }
> = {
  submitted: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200", dot: "bg-slate-500", hex: "#64748b" },
  pending: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200", dot: "bg-slate-500", hex: "#64748b" },
  PENDING: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200", dot: "bg-slate-500", hex: "#64748b" },
  under_review: { bg: "bg-blue-50 dark:bg-blue-950/50", text: "text-blue-800 dark:text-blue-200", dot: "bg-blue-500", hex: "#3b82f6" },
  assigned: { bg: "bg-indigo-50 dark:bg-indigo-950/50", text: "text-indigo-800 dark:text-indigo-200", dot: "bg-indigo-500", hex: "#6366f1" },
  in_progress: { bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-800 dark:text-amber-200", dot: "bg-amber-500", hex: "#f59e0b" },
  IN_PROGRESS: { bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-800 dark:text-amber-200", dot: "bg-amber-500", hex: "#f59e0b" },
  resolved_pending_verification: { bg: "bg-violet-50 dark:bg-violet-950/50", text: "text-violet-800 dark:text-violet-200", dot: "bg-violet-500", hex: "#8b5cf6" },
  resolved: { bg: "bg-emerald-50 dark:bg-emerald-950/50", text: "text-emerald-800 dark:text-emerald-200", dot: "bg-emerald-600", hex: "#059669" },
  RESOLVED: { bg: "bg-emerald-50 dark:bg-emerald-950/50", text: "text-emerald-800 dark:text-emerald-200", dot: "bg-emerald-600", hex: "#059669" },
  closed_verified: { bg: "bg-emerald-50 dark:bg-emerald-950/50", text: "text-emerald-800 dark:text-emerald-200", dot: "bg-emerald-600", hex: "#059669" },
  reopened: { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-800 dark:text-rose-200", dot: "bg-rose-500", hex: "#f43f5e" },
  REOPENED: { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-800 dark:text-rose-200", dot: "bg-rose-500", hex: "#f43f5e" },
  rejected: { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-800 dark:text-rose-200", dot: "bg-rose-500", hex: "#f43f5e" },
  auto_closed: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200", dot: "bg-slate-500", hex: "#64748b" },
  merged: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200", dot: "bg-slate-500", hex: "#64748b" },
};

export const PRIORITY_COLOR: Record<string, { bg: string; text: string; hex: string }> = {
  low: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200", hex: "#64748b" },
  LOW: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200", hex: "#64748b" },
  medium: { bg: "bg-sky-50 dark:bg-sky-950/50", text: "text-sky-800 dark:text-sky-200", hex: "#0ea5e9" },
  MEDIUM: { bg: "bg-sky-50 dark:bg-sky-950/50", text: "text-sky-800 dark:text-sky-200", hex: "#0ea5e9" },
  high: { bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-900 dark:text-amber-200", hex: "#d97706" },
  HIGH: { bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-900 dark:text-amber-200", hex: "#d97706" },
  emergency: { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-800 dark:text-rose-200", hex: "#e11d48" },
  urgent: { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-800 dark:text-rose-200", hex: "#e11d48" },
  URGENT: { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-800 dark:text-rose-200", hex: "#e11d48" },
};

export const CATEGORY_COLOR: Record<string, string> = {
  wifi: "#0284c7",
  water: "#2563eb",
  electricity: "#ca8a04",
  power: "#d97706",
  furniture: "#7c3aed",
  food_hygiene: "#dc2626",
  washroom: "#0f766e",
  classroom: "#4f46e5",
  security: "#be123c",
  infrastructure: "#57534e",
  lift: "#e11d48",
  cleanliness: "#059669",
  laboratory: "#7c2d12",
  hostel: "#0369a1",
  safety: "#b91c1c",
  general: "#64748b",
  other: "#64748b",
};

export const DEFAULT_SLA: Record<string, number> = {
  URGENT: 2,
  urgent: 2,
  emergency: 2,
  HIGH: 6,
  high: 6,
  MEDIUM: 18,
  medium: 18,
  LOW: 48,
  low: 48,
};

export const RATE_LIMIT_PER_DAY = 15;
export const DUPLICATE_METERS = 50;
export const IMAGE_MAX_MB = 10;
export const VIDEO_MAX_MB = 50;

export const BADGES_LIST: Badge[] = [
  {
    id: "campus-scout",
    name: "CAMPUS SCOUT",
    description: "Submitted your first 5 verified campus facility reports.",
    icon: "Award",
    criteria: "First 5 reports",
    unlocked: true,
    progress: 100,
  },
  {
    id: "hawk-eye",
    name: "HAWK EYE",
    description: "First student to report an urgent electrical or safety hazard.",
    icon: "Zap",
    criteria: "First electrical hazard",
    unlocked: true,
    progress: 100,
  },
  {
    id: "civic-hero",
    name: "CIVIC HERO",
    description: "Maintained a 100% verified fix rate across your campus complaints.",
    icon: "ShieldCheck",
    criteria: "100% verified fixes",
    unlocked: true,
    progress: 100,
  },
  {
    id: "speed-resolver",
    name: "SPEED RESOLVER",
    description: "Verified issue fixed within 2 hours of technician completion.",
    icon: "Clock",
    criteria: "Fast fix verification",
    unlocked: false,
    progress: 60,
  },
  {
    id: "eco-guardian",
    name: "ECO GUARDIAN",
    description: "Reported water leakage or power waste preventing utility loss.",
    icon: "Droplets",
    criteria: "Reported water/power wastage",
    unlocked: true,
    progress: 100,
  },
];

export const DEPARTMENTS_SEED = [
  { id: "dept-elec", name: "Electrical & Power", categories: ["electricity", "power", "lift"] as Category[] },
  { id: "dept-maint", name: "Civil & Plumbing", categories: ["water", "furniture", "infrastructure", "washroom"] as Category[] },
  { id: "dept-it", name: "IT & Digital Infrastructure", categories: ["wifi", "classroom"] as Category[] },
  { id: "dept-house", name: "Housekeeping & Sanitation", categories: ["washroom", "cleanliness"] as Category[] },
  { id: "dept-mess", name: "Food Services & Dining", categories: ["food_hygiene"] as Category[] },
  { id: "dept-sec", name: "Campus Security & Safety", categories: ["security", "safety"] as Category[] },
  { id: "dept-hostel", name: "Hostel Affairs", categories: ["hostel"] as Category[] },
  { id: "dept-lab", name: "Laboratory Facilities", categories: ["laboratory"] as Category[] },
];

export const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Postgraduate", "Faculty / Staff"];

export const ACADEMIC_DEPTS = [
  "Computer Science",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biotechnology",
  "Architecture & Design",
  "Business & Management",
  "Basic Sciences",
];

export const BUILDINGS: Building[] = [
  { id: "block-a", name: "Academic Block A", kind: "academic", lat: 28.5458, lng: 77.1922, x: 14, y: 18, w: 22, h: 14 },
  { id: "block-b", name: "Academic Block B", kind: "academic", lat: 28.5456, lng: 77.1935, x: 64, y: 16, w: 22, h: 14 },
  { id: "sf-block", name: "SF Block", kind: "academic", lat: 28.5452, lng: 77.1942, x: 78, y: 34, w: 16, h: 12 },
  { id: "library", name: "Central Library", kind: "library", lat: 28.5448, lng: 77.1928, x: 40, y: 28, w: 18, h: 12 },
  { id: "labs", name: "Laboratory Block", kind: "lab", lat: 28.545, lng: 77.1915, x: 6, y: 38, w: 16, h: 10 },
  { id: "admin", name: "Admin Block", kind: "admin", lat: 28.5462, lng: 77.1928, x: 42, y: 8, w: 16, h: 10 },
  { id: "auditorium", name: "Auditorium", kind: "hall", lat: 28.546, lng: 77.194, x: 64, y: 6, w: 18, h: 8 },
  { id: "mess", name: "Central Mess", kind: "mess", lat: 28.544, lng: 77.1925, x: 28, y: 52, w: 18, h: 10 },
  { id: "h1", name: "Hostel Block A", kind: "hostel", lat: 28.5438, lng: 77.1918, x: 8, y: 66, w: 20, h: 14 },
  { id: "h2", name: "Hostel Block B", kind: "hostel", lat: 28.5436, lng: 77.1932, x: 36, y: 68, w: 20, h: 14 },
  { id: "h3", name: "Hostel Block C", kind: "hostel", lat: 28.5435, lng: 77.1944, x: 64, y: 66, w: 20, h: 14 },
  { id: "sports", name: "Sports Complex", kind: "sports", lat: 28.5432, lng: 77.194, x: 78, y: 52, w: 16, h: 10 },
  { id: "gate", name: "Main Campus Gate", kind: "gate", lat: 28.5466, lng: 77.193, x: 44, y: 1, w: 12, h: 5 },
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
  elevator: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
  fan_fixed: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
};

export const DEMO_ACCOUNTS = {
  student: { email: "priya@meridian.edu", password: "demo1234", name: "Priya Sharma" },
  admin: { email: "admin@meridian.edu", password: "demo1234", name: "Kavita Nair" },
  superAdmin: { email: "director@meridian.edu", password: "demo1234", name: "Dr. Anil Rao" },
};
