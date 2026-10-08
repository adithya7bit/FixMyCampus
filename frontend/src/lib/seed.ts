import {
  CAMPUS_NAME,
  DEFAULT_SLA,
  DEMO_ACCOUNTS,
  DEPARTMENTS_SEED,
  PHOTO,
} from "@/lib/constants";
import { daysAgo, hoursFromNow, uid } from "@/lib/format";
import { nearestBuilding } from "@/lib/geo";
import type {
  AppSettings,
  Category,
  Comment,
  Complaint,
  ComplaintEvent,
  ComplaintMedia,
  ComplaintSupport,
  Department,
  Inspection,
  Notification,
  Priority,
  Profile,
  Status,
  Verification,
  Worker,
} from "@/types";

export interface SeedState {
  users: Profile[];
  departments: Department[];
  workers: Worker[];
  complaints: Complaint[];
  media: ComplaintMedia[];
  events: ComplaintEvent[];
  supports: ComplaintSupport[];
  comments: Comment[];
  verifications: Verification[];
  inspections: Inspection[];
  notifications: Notification[];
  settings: AppSettings;
  nextPublicSeq: number;
}

const S = DEMO_ACCOUNTS.student;
const A = DEMO_ACCOUNTS.admin;
const D = DEMO_ACCOUNTS.superAdmin;

function user(
  id: string,
  email: string,
  password: string,
  role: Profile["role"],
  fullName: string,
  department: string,
  year: string,
  hostel: Profile["hostel"],
  createdAt: string,
): Profile {
  return { id, email, password, role, fullName, department, year, hostel, createdAt };
}

function loc(lat: number, lng: number) {
  const b = nearestBuilding(lat, lng);
  return { lat, lng, building: b.name, placeName: `${b.name}, Meridian campus` };
}

interface CSpec {
  n: number;
  studentId: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  lat: number;
  lng: number;
  floor?: string;
  room?: string;
  days: number;
  hours?: number;
  workerId?: string;
  deptId?: string;
  photo?: string;
  afterPhoto?: string;
  reopenCount?: number;
  overdue?: boolean;
  support?: number;
}

function buildComplaint(spec: CSpec, seq: number): {
  c: Complaint;
  media: ComplaintMedia[];
  events: ComplaintEvent[];
} {
  const ticketSeq = seq < 4820 ? 4820 + seq : seq;
  const id = `cmp_${String(ticketSeq).padStart(6, "0")}`;
  const publicId = `CMP-2026-${String(ticketSeq).padStart(6, "0")}`;
  const createdAt = daysAgo(spec.days, spec.hours ?? 9 + (seq % 8));
  const updatedAt = daysAgo(Math.max(0, spec.days - 1), 16);
  const pos = loc(spec.lat, spec.lng);
  const slaH = DEFAULT_SLA[spec.priority] || 24;
  const slaDueAt = new Date(new Date(createdAt).getTime() + slaH * 36e5).toISOString();
  const deptId =
    spec.deptId ||
    DEPARTMENTS_SEED.find((d) => d.categories.includes(spec.category))?.id ||
    "dept-maint";


  const c: Complaint = {
    id,
    publicId,
    studentId: spec.studentId,
    title: spec.title,
    description: spec.description,
    category: spec.category,
    priority: spec.priority,
    status: spec.status,
    latitude: pos.lat,
    longitude: pos.lng,
    placeName: pos.placeName,
    building: pos.building,
    floor: spec.floor ?? "",
    room: spec.room ?? "",
    departmentId: deptId,
    assignedWorkerId: spec.workerId,
    reopenCount: spec.reopenCount ?? 0,
    isOverdue: Boolean(spec.overdue),
    slaDueAt: spec.overdue ? daysAgo(1, 8) : slaDueAt,
    createdAt,
    updatedAt,
    resolvedAt:
      spec.status === "resolved_pending_verification" ||
      spec.status === "closed_verified" ||
      spec.status === "auto_closed"
        ? daysAgo(Math.max(0, spec.days - 2), 17)
        : undefined,
    closedAt:
      spec.status === "closed_verified" || spec.status === "auto_closed"
        ? daysAgo(Math.max(0, spec.days - 3), 11)
        : undefined,
    supportCount: spec.support ?? 1,
    aiSummary: spec.title,
  };

  const media: ComplaintMedia[] = [];
  if (spec.photo) {
    media.push({
      id: uid("med"),
      complaintId: id,
      storagePath: spec.photo,
      kind: "before",
      mediaType: "image",
      createdAt,
    });
  }
  if (spec.afterPhoto) {
    media.push({
      id: uid("med"),
      complaintId: id,
      storagePath: spec.afterPhoto,
      kind: "after",
      mediaType: "image",
      createdAt: updatedAt,
    });
  }

  const events: ComplaintEvent[] = [
    {
      id: uid("evt"),
      complaintId: id,
      actorId: spec.studentId,
      toStatus: "submitted",
      note: "Complaint submitted",
      visibility: "public",
      createdAt,
    },
  ];

  const push = (actor: string, to: Status, note: string, daysBack: number) => {
    events.push({
      id: uid("evt"),
      complaintId: id,
      actorId: actor,
      toStatus: to,
      note,
      visibility: "public",
      createdAt: daysAgo(Math.max(0, daysBack), 14),
    });
  };

  if (spec.status !== "submitted") push("u_admin", "under_review", "Accepted for review", spec.days);
  if (["assigned", "in_progress", "resolved_pending_verification", "closed_verified", "auto_closed"].includes(spec.status)) {
    push("u_admin", "assigned", "Assigned to staff", Math.max(0, spec.days - 1));
  }
  if (["in_progress", "resolved_pending_verification", "closed_verified", "auto_closed"].includes(spec.status)) {
    push("u_admin", "in_progress", "Work started", Math.max(0, spec.days - 1));
  }
  if (["resolved_pending_verification", "closed_verified", "auto_closed"].includes(spec.status)) {
    push("u_admin", "resolved_pending_verification", "Marked resolved — awaiting student confirmation", Math.max(0, spec.days - 2));
  }
  if (spec.status === "closed_verified") {
    push(spec.studentId, "closed_verified", "Student confirmed the fix", Math.max(0, spec.days - 3));
  }
  if (spec.status === "rejected") {
    events.push({
      id: uid("evt"),
      complaintId: id,
      actorId: "u_admin",
      toStatus: "rejected",
      note: "Outside campus maintenance scope — forwarded to city corporation.",
      visibility: "public",
      createdAt: daysAgo(Math.max(0, spec.days - 1), 12),
    });
  }
  if (spec.status === "auto_closed") {
    push("system", "auto_closed", "Auto-closed: no student response", Math.max(0, spec.days - 5));
  }

  return { c, media, events };
}

export function createSeed(): SeedState {
  const users: Profile[] = [
    user("u_priya", S.email, S.password, "student", S.name, "Computer Science", "3rd year", "hostel", daysAgo(80, 10)),
    user("u_admin", A.email, A.password, "admin", A.name, "Estate Office", "", "", daysAgo(200, 9)),
    user("u_director", D.email, D.password, "super_admin", D.name, "Directorate", "", "", daysAgo(400, 9)),
    user("u_arjun", "arjun@meridian.edu", "demo1234", "student", "Arjun Mehta", "Electronics", "2nd year", "day_scholar", daysAgo(60, 11)),
    user("u_ananya", "ananya@meridian.edu", "demo1234", "student", "Ananya Reddy", "Mechanical", "4th year", "hostel", daysAgo(90, 10)),
    user("u_rahul", "rahul@meridian.edu", "demo1234", "student", "Rahul Iyer", "Civil", "1st year", "hostel", daysAgo(40, 12)),
    user("u_meera", "meera@meridian.edu", "demo1234", "student", "Meera Joshi", "Biotechnology", "3rd year", "hostel", daysAgo(70, 9)),
    user("u_kabir", "kabir@meridian.edu", "demo1234", "student", "Kabir Singh", "Electrical", "2nd year", "day_scholar", daysAgo(55, 14)),
    user("u_zara", "zara@meridian.edu", "demo1234", "student", "Zara Khan", "Architecture", "4th year", "hostel", daysAgo(100, 8)),
    user("u_dev", "dev@meridian.edu", "demo1234", "student", "Dev Patel", "Computer Science", "1st year", "hostel", daysAgo(20, 13)),
  ];

  const departments: Department[] = DEPARTMENTS_SEED.map((d) => ({ ...d }));

  const workers: Worker[] = [
    { id: "w_ramesh", departmentId: "dept-maint", name: "Ramesh Kumar", phone: "98XXXX1101", specialties: ["water", "infrastructure"], isActive: true },
    { id: "w_suresh", departmentId: "dept-it", name: "Suresh Nair", phone: "98XXXX1102", specialties: ["wifi", "classroom"], isActive: true },
    { id: "w_lakshmi", departmentId: "dept-house", name: "Lakshmi Devi", phone: "98XXXX1103", specialties: ["washroom"], isActive: true },
    { id: "w_vijay", departmentId: "dept-elec", name: "Vijay Sharma", phone: "98XXXX1104", specialties: ["electricity"], isActive: true },
    { id: "w_raman", departmentId: "dept-mess", name: "Chef Raman", phone: "98XXXX1105", specialties: ["food_hygiene"], isActive: true },
    { id: "w_farhan", departmentId: "dept-sec", name: "Farhan Qureshi", phone: "98XXXX1106", specialties: ["security"], isActive: true },
    { id: "w_geeta", departmentId: "dept-house", name: "Geeta Pawar", phone: "98XXXX1107", specialties: ["washroom"], isActive: true },
    { id: "w_amit", departmentId: "dept-maint", name: "Amit Verma", phone: "98XXXX1108", specialties: ["furniture", "infrastructure"], isActive: true },
    { id: "w_neha", departmentId: "dept-it", name: "Neha Gupta", phone: "98XXXX1109", specialties: ["wifi"], isActive: false },
  ];

  const specs: CSpec[] = [
    // Section 47 Core Demo Reports
    {
      n: 1, // CMP-2026-004821
      studentId: "u_priya",
      title: "Broken Elevator",
      description: "Main passenger elevator stuck on 3rd floor with jerky movements and alarm chiming repeatedly.",
      category: "lift",
      priority: "emergency", // mapped to URGENT
      status: "submitted",
      lat: 28.5458,
      lng: 77.1922,
      floor: "3rd Floor",
      room: "Lift Shaft 1",
      days: 0,
      hours: 2,
      photo: PHOTO.elevator,
      support: 14,
    },
    {
      n: 2, // CMP-2026-004822
      studentId: "u_priya",
      title: "Water Leakage",
      description: "Major pipe rupture under corridor washroom basin causing water accumulation on floor.",
      category: "water",
      priority: "high",
      status: "in_progress",
      lat: 28.5436,
      lng: 77.1932,
      floor: "2nd Floor",
      room: "Washroom B2",
      days: 1,
      workerId: "w_ramesh",
      photo: PHOTO.water,
      support: 8,
    },
    {
      n: 3, // CMP-2026-004823
      studentId: "u_arjun",
      title: "Wi-Fi Down",
      description: "Eduroam access point offline across south wing classrooms. Zero connectivity during lecture.",
      category: "wifi",
      priority: "medium",
      status: "submitted",
      lat: 28.5452,
      lng: 77.1942,
      floor: "1st Floor",
      room: "Room 104",
      days: 2,
      workerId: "w_suresh",
      photo: PHOTO.classroom,
      support: 11,
    },
    {
      n: 4, // CMP-2026-004824
      studentId: "u_ananya",
      title: "Electrical Hazard",
      description: "Exposed 440V wire near lab workbench with occasional sparking when switch is activated.",
      category: "electricity",
      priority: "emergency",
      status: "in_progress",
      lat: 28.5450,
      lng: 77.1915,
      floor: "Ground Floor",
      room: "Lab 03",
      days: 0,
      workerId: "w_vijay",
      photo: PHOTO.electrical,
      support: 18,
    },
    {
      n: 5, // CMP-2026-004825
      studentId: "u_priya",
      title: "Broken Classroom Fan",
      description: "Ceiling fan regulator not working and blades produce severe rattling vibration.",
      category: "classroom",
      priority: "low",
      status: "resolved_pending_verification",
      lat: 28.5456,
      lng: 77.1935,
      floor: "2nd Floor",
      room: "Classroom 204",
      days: 3,
      workerId: "w_vijay",
      photo: PHOTO.classroom,
      afterPhoto: PHOTO.fan_fixed,
      support: 3,
    },
    // Nearby open water complaint — duplicate detection for demo
    {
      n: 6,
      studentId: "u_ananya",
      title: "Leaking tap in Hostel H1 second floor",
      description: "Washbasin tap in the common bathroom won't close. Water running all night. Same wing as the ceiling drip.",
      category: "water",
      priority: "high",
      status: "under_review",
      lat: 28.54384,
      lng: 77.1919,
      floor: "2",
      room: "Common bath",
      days: 1,
      photo: PHOTO.water,
      support: 4,
    },
    {
      n: 7,
      studentId: "u_arjun",
      title: "Projector in Block B-204 not powering on",
      description: "Classroom B-204 projector shows red LED then shuts off. Lecture delayed twice this week.",
      category: "classroom",
      priority: "medium",
      status: "in_progress",
      lat: 28.54555,
      lng: 77.19348,
      floor: "2",
      room: "B-204",
      days: 3,
      workerId: "w_suresh",
      photo: PHOTO.classroom,
    },
    {
      n: 8,
      studentId: "u_rahul",
      title: "Hostel H2 washroom drain overflowing",
      description: "Ground floor washroom drain is overflowing. Floor is wet and slippery. Strong smell.",
      category: "washroom",
      priority: "high",
      status: "in_progress",
      lat: 28.54362,
      lng: 77.19322,
      floor: "Ground",
      days: 1,
      workerId: "w_lakshmi",
      photo: PHOTO.washroom,
      overdue: true,
    },
    {
      n: 9,
      studentId: "u_meera",
      title: "No drinking water on Labs Complex floor 2",
      description: "Water cooler empty since Monday. Filters look filthy. Students filling bottles from restroom taps.",
      category: "water",
      priority: "high",
      status: "assigned",
      lat: 28.54518,
      lng: 77.19418,
      floor: "2",
      days: 2,
      workerId: "w_ramesh",
      photo: PHOTO.water,
    },
    {
      n: 10,
      studentId: "u_kabir",
      title: "Exposed wiring behind Block A staircase",
      description: "Open junction box with exposed live wires at eye level. Sparks when it rains. Emergency.",
      category: "electricity",
      priority: "emergency",
      status: "under_review",
      lat: 28.5457,
      lng: 77.19205,
      floor: "Ground",
      days: 0,
      hours: 7,
      photo: PHOTO.electrical,
      overdue: true,
    },
    {
      n: 11,
      studentId: "u_zara",
      title: "Broken studio stools in Architecture studio",
      description: "Four metal stools have cracked welds. One collapsed yesterday. Please replace before jury week.",
      category: "furniture",
      priority: "medium",
      status: "submitted",
      lat: 28.54558,
      lng: 77.1936,
      floor: "3",
      room: "Studio 2",
      days: 0,
      photo: PHOTO.furniture,
    },
    {
      n: 12,
      studentId: "u_dev",
      title: "Canteen kitchen floor greasy and uncleaned",
      description: "The kitchen visible from the serving counter has not been mopped. Food residue and a fruit fly cluster near the sink.",
      category: "food_hygiene",
      priority: "high",
      status: "under_review",
      lat: 28.54442,
      lng: 77.19382,
      days: 1,
      photo: PHOTO.food,
      support: 6,
    },
    {
      n: 13,
      studentId: "u_arjun",
      title: "Wi-Fi down in Hostel H3 entire wing B",
      description: "No connectivity since last night in H3-B. Access point LEDs are off. LAN ports dead too.",
      category: "wifi",
      priority: "high",
      status: "assigned",
      lat: 28.54352,
      lng: 77.19442,
      floor: "All",
      room: "Wing B",
      days: 1,
      workerId: "w_suresh",
    },
    {
      n: 14,
      studentId: "u_ananya",
      title: "Street light dark on path to Sports Complex",
      description: "The stretch between H3 and sports ground is unlit. Two students reported feeling unsafe walking back after practice.",
      category: "security",
      priority: "high",
      status: "in_progress",
      lat: 28.54335,
      lng: 77.19395,
      days: 5,
      workerId: "w_farhan",
    },
    {
      n: 15,
      studentId: "u_rahul",
      title: "Cracked paving near Main Gate causing trips",
      description: "Broken paving stones at the main gate pedestrian entry. A first-year twisted an ankle yesterday.",
      category: "infrastructure",
      priority: "medium",
      status: "under_review",
      lat: 28.54655,
      lng: 77.19302,
      days: 3,
    },
    {
      n: 16,
      studentId: "u_meera",
      title: "AC not cooling in Biotech lab",
      description: "Lab temperature stays above 30°C. Samples are at risk. Technician already visited once.",
      category: "classroom",
      priority: "high",
      status: "resolved_pending_verification",
      lat: 28.54522,
      lng: 77.19425,
      floor: "1",
      room: "BT-Lab",
      days: 7,
      workerId: "w_amit",
      photo: PHOTO.classroom,
    },
    {
      n: 17,
      studentId: "u_kabir",
      title: "Fan falling from ceiling, Workshop bay 2",
      description: "Ceiling fan wobbles violently and one blade is cracked. Bay has been informally closed by students.",
      category: "electricity",
      priority: "emergency",
      status: "assigned",
      lat: 28.54502,
      lng: 77.19155,
      floor: "Ground",
      room: "Bay 2",
      days: 1,
      workerId: "w_vijay",
      photo: PHOTO.electrician,
    },
    {
      n: 18,
      studentId: "u_zara",
      title: "Library washroom out of soap and water",
      description: "Both taps dry. No soap. Dustbins overflowing. Used by hundreds of students a day.",
      category: "washroom",
      priority: "medium",
      status: "closed_verified",
      lat: 28.54475,
      lng: 77.1929,
      floor: "Ground",
      days: 12,
      workerId: "w_geeta",
      photo: PHOTO.washroom,
    },
    {
      n: 19,
      studentId: "u_dev",
      title: "Mess breakfast quality — sour milk",
      description: "Milk served at breakfast was sour. Several students returned trays. Please inspect the cold storage.",
      category: "food_hygiene",
      priority: "high",
      status: "in_progress",
      lat: 28.54398,
      lng: 77.19248,
      days: 2,
      workerId: "w_raman",
      photo: PHOTO.food,
      support: 11,
    },
    {
      n: 20,
      studentId: "u_arjun",
      title: "Auditorium rear door lock jammed",
      description: "Emergency exit at the rear of the auditorium does not open from inside. Safety issue for events.",
      category: "security",
      priority: "emergency",
      status: "submitted",
      lat: 28.54598,
      lng: 77.19402,
      days: 0,
      hours: 11,
    },
    {
      n: 21,
      studentId: "u_ananya",
      title: "Desk missing a plank in Block A-105",
      description: "Middle row, third desk. The writing surface is split. Notes fall through.",
      category: "furniture",
      priority: "low",
      status: "closed_verified",
      lat: 28.54572,
      lng: 77.19228,
      floor: "1",
      room: "A-105",
      days: 20,
      workerId: "w_amit",
      photo: PHOTO.furniture,
    },
    {
      n: 22,
      studentId: "u_rahul",
      title: "Standing water after rain near Hostel H2",
      description: "The storm drain is blocked. Mosquitoes already. Water enters the ground-floor corridor.",
      category: "infrastructure",
      priority: "high",
      status: "assigned",
      lat: 28.54358,
      lng: 77.1931,
      days: 2,
      workerId: "w_ramesh",
      overdue: true,
    },
    {
      n: 23,
      studentId: "u_meera",
      title: "Hostel H3 bathroom taps run brown water",
      description: "Morning supply is muddy. Not drinkable, barely usable for bathing. Started after tank cleaning.",
      category: "water",
      priority: "high",
      status: "in_progress",
      lat: 28.54348,
      lng: 77.19435,
      floor: "3",
      days: 3,
      workerId: "w_ramesh",
      photo: PHOTO.water,
    },
    {
      n: 24,
      studentId: "u_kabir",
      title: "Lab computers in ECE lab 2 will not boot",
      description: "8 of 20 systems stuck on BIOS. Lab session moved twice.",
      category: "classroom",
      priority: "medium",
      status: "under_review",
      lat: 28.5455,
      lng: 77.19342,
      floor: "1",
      room: "ECE-2",
      days: 4,
      photo: PHOTO.classroom,
    },
    {
      n: 25,
      studentId: "u_zara",
      title: "Canteen serving counter had flies on snacks",
      description: "Samosas left uncovered. Flies sitting on the tray. Photo attached. Repeat of last month.",
      category: "food_hygiene",
      priority: "high",
      status: "resolved_pending_verification",
      lat: 28.54438,
      lng: 77.19375,
      days: 5,
      workerId: "w_raman",
      photo: PHOTO.food,
      support: 8,
    },
    {
      n: 26,
      studentId: "u_dev",
      title: "Broken window latch in H1 room 214",
      description: "Latch is sheared. Window slams in wind and does not lock. Rain comes in.",
      category: "infrastructure",
      priority: "medium",
      status: "submitted",
      lat: 28.54388,
      lng: 77.19175,
      floor: "2",
      room: "214",
      days: 1,
    },
    {
      n: 27,
      studentId: "u_arjun",
      title: "Printer in library IT corner paper jam loop",
      description: "Public printer endlessly jams. Students cannot print records for scholarship desk.",
      category: "wifi",
      priority: "low",
      status: "rejected",
      lat: 28.54485,
      lng: 77.19272,
      days: 9,
    },
    {
      n: 28,
      studentId: "u_ananya",
      title: "Housekeeping skipped H2 third floor for 4 days",
      description: "Bins overflowing, bathrooms not mopped. Request regular roster, not a one-off sweep.",
      category: "washroom",
      priority: "medium",
      status: "auto_closed",
      lat: 28.54365,
      lng: 77.19328,
      floor: "3",
      days: 14,
      workerId: "w_lakshmi",
      photo: PHOTO.washroom,
    },
    {
      n: 29,
      studentId: "u_rahul",
      title: "Sports Complex changing room shower dry",
      description: "No water in changing rooms after 5pm when teams practice. Taps hiss air.",
      category: "water",
      priority: "medium",
      status: "closed_verified",
      lat: 28.54322,
      lng: 77.19405,
      days: 16,
      workerId: "w_ramesh",
    },
    {
      n: 30,
      studentId: "u_meera",
      title: "Loose handrail on Admin Block stairs",
      description: "The right-hand rail on the front stairs moves by several centimetres. A visitor almost fell.",
      category: "infrastructure",
      priority: "high",
      status: "in_progress",
      lat: 28.54615,
      lng: 77.19282,
      days: 4,
      workerId: "w_amit",
    },
    {
      n: 31,
      studentId: "u_kabir",
      title: "Network rack overheating in Block B IT closet",
      description: "IT closet is hot to the touch, fans loud. Risk of another outage like last semester.",
      category: "wifi",
      priority: "high",
      status: "submitted",
      lat: 28.54562,
      lng: 77.19355,
      floor: "Ground",
      room: "IT closet",
      days: 0,
      hours: 12,
    },
    {
      n: 32,
      studentId: "u_zara",
      title: "Bench on library lawn split down the middle",
      description: "Outdoor wooden bench is unusable. Splinters. Popular evening spot.",
      category: "furniture",
      priority: "low",
      status: "assigned",
      lat: 28.5447,
      lng: 77.19295,
      days: 8,
      workerId: "w_amit",
      photo: PHOTO.furniture,
    },
  ];

  const complaints: Complaint[] = [];
  const media: ComplaintMedia[] = [];
  const events: ComplaintEvent[] = [];
  specs.forEach((s) => {
    const built = buildComplaint(s, s.n);
    complaints.push(built.c);
    media.push(...built.media);
    events.push(...built.events);
  });

  const comments: Comment[] = [
    {
      id: "cmt_1",
      complaintId: "cmp_002",
      authorId: "u_admin",
      body: "IT is replacing the access point in Lab 3 this afternoon. Please keep devices off the lab switch until 5pm.",
      visibility: "public",
      createdAt: daysAgo(1, 11),
    },
    {
      id: "cmt_2",
      complaintId: "cmp_003",
      authorId: "u_admin",
      body: "Carpenter replaced the bench leg. Please confirm if it feels stable.",
      visibility: "public",
      createdAt: daysAgo(2, 16),
    },
    {
      id: "cmt_3",
      complaintId: "cmp_004",
      authorId: "u_admin",
      body: "Kitchen inspected. Counter 2 shut for 24h. Pest control completed. Findings on the inspection record.",
      visibility: "public",
      createdAt: daysAgo(16, 10),
    },
  ];

  const supports: ComplaintSupport[] = [
    { complaintId: "cmp_001", studentId: "u_ananya", createdAt: daysAgo(0, 9) },
    { complaintId: "cmp_001", studentId: "u_dev", createdAt: daysAgo(0, 10) },
    { complaintId: "cmp_006", studentId: "u_priya", createdAt: daysAgo(1, 12) },
    { complaintId: "cmp_006", studentId: "u_dev", createdAt: daysAgo(1, 13) },
    { complaintId: "cmp_006", studentId: "u_rahul", createdAt: daysAgo(0, 18) },
    { complaintId: "cmp_012", studentId: "u_priya", createdAt: daysAgo(1, 15) },
    { complaintId: "cmp_019", studentId: "u_priya", createdAt: daysAgo(2, 8) },
    { complaintId: "cmp_025", studentId: "u_priya", createdAt: daysAgo(5, 9) },
  ];

  const verifications: Verification[] = [
    {
      id: "ver_1",
      complaintId: "cmp_004",
      studentId: "u_priya",
      outcome: "fixed",
      createdAt: daysAgo(15, 9),
    },
    {
      id: "ver_2",
      complaintId: "cmp_018",
      studentId: "u_zara",
      outcome: "fixed",
      createdAt: daysAgo(10, 12),
    },
  ];

  const inspections: Inspection[] = [
    {
      id: "ins_1",
      complaintId: "cmp_004",
      inspectorId: "u_admin",
      findings: "Cockroach infestation around dal counter drainage. Food uncovered during service.",
      actionTaken: "Closed counter 2 for 24h. Pest control, staff briefing, covered trays mandated.",
      followUpDate: daysAgo(-7, 10),
      createdAt: daysAgo(16, 10),
    },
    {
      id: "ins_2",
      complaintId: "cmp_012",
      inspectorId: "u_admin",
      findings: "Grease film on kitchen tiles. Fruit flies at wash sink. Cleaning roster not signed for 3 days.",
      actionTaken: "Warning issued to contractor. Deep clean scheduled.",
      followUpDate: hoursFromNow(48).slice(0, 10),
      createdAt: daysAgo(1, 15),
    },
  ];

  const notifications: Notification[] = [
    {
      id: "nt_1",
      userId: "u_priya",
      type: "verification",
      complaintId: "cmp_003",
      title: "Is this problem actually fixed?",
      body: "The broken bench in Central Library was marked resolved. Please confirm.",
      createdAt: daysAgo(2, 16),
    },
    {
      id: "nt_2",
      userId: "u_priya",
      type: "status",
      complaintId: "cmp_002",
      title: "Wi-Fi complaint is in progress",
      body: "IT Services started work on Lab 3 connectivity.",
      createdAt: daysAgo(1, 11),
    },
    {
      id: "nt_3",
      userId: "u_priya",
      type: "comment",
      complaintId: "cmp_002",
      title: "New update from campus admin",
      body: "IT is replacing the access point in Lab 3 this afternoon.",
      createdAt: daysAgo(1, 11),
    },
    {
      id: "nt_4",
      userId: "u_admin",
      type: "emergency",
      complaintId: "cmp_010",
      title: "Emergency: exposed wiring, Block A",
      body: "A new emergency complaint needs immediate review.",
      createdAt: daysAgo(0, 7),
    },
  ];

  return {
    users,
    departments,
    workers,
    complaints,
    media,
    events,
    supports,
    comments,
    verifications,
    inspections,
    notifications,
    settings: {
      campusName: CAMPUS_NAME,
      campusCenterLat: 28.545,
      campusCenterLng: 77.193,
      slaHoursByPriority: { ...DEFAULT_SLA },
      autoCloseDays: 3,
    },
    nextPublicSeq: 33,
  };
}
