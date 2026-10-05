import type { Complaint, UserPersona, BuildingInfo } from '../types/index'

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c-101',
    ticket_number: 'FMC-2026-001',
    title: 'Elevator Lift #2 Stuck Between Floor 2 & 3 in CS Block',
    description: 'Elevator 2 made a loud metallic screeching sound and abruptly stopped in Computer Science Block. Error code E-04 active. Potential high-voltage inverter failure.',
    category: 'Electrical & Power',
    department_id: 'electrical',
    priority: 'urgent',
    status: 'assigned',
    location_building: 'CS & IT Engineering Block',
    location_floor: 'Floor 2-3 Shaft',
    location_room: 'Elevator Bay West',
    reporter_name: 'Alex Rivera',
    reporter_id: 'u-student-1',
    reporter_email: 'alex.rivera@campus.edu',
    assigned_to: 'Marcus Vance',
    upvotes: 18,
    sla_hours: 2,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80',
    lat: 11.4984,
    lng: 77.2766,
    updates: [
      { timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), author: 'AI Dispatch', message: 'Urgent hazard detected (2-hr SLA target). Auto-routed to Electrical Maintenance.' },
      { timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), author: 'Marcus Vance', message: 'Assigned to senior electrician technician with hydraulic kit.' }
    ]
  },
  {
    id: 'c-102',
    ticket_number: 'FMC-2026-002',
    title: 'High-Pressure Water Line Leak in Mechanical Lab Restroom 3F',
    description: 'Brass connector ruptured under high pressure, flooding hallway corridor floor. Immediate slip hazard for students entering Thermodynamics Lab.',
    category: 'Civil & Plumbing',
    department_id: 'civil_maintenance',
    priority: 'high',
    status: 'resolved',
    location_building: 'Mechanical & Civil Block',
    location_floor: 'Floor 3',
    location_room: 'Restroom 302',
    reporter_name: 'Alex Rivera',
    reporter_id: 'u-student-1',
    reporter_email: 'alex.rivera@campus.edu',
    assigned_to: 'Elena Rostova',
    upvotes: 9,
    sla_hours: 12,
    created_at: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    photo_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    resolution_photo: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
    resolution_notes: 'Replaced ruptured brass connector ring and re-torqued main shutoff valve. Pressure tests nominal.',
    lat: 11.4990,
    lng: 77.2758,
    updates: [
      { timestamp: new Date(Date.now() - 130 * 60 * 1000).toISOString(), author: 'AI Dispatch', message: 'High priority assigned (12-hr SLA).' },
      { timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), author: 'Elena Rostova', message: 'Valve replaced. Waiting for student verification to close ticket.' }
    ]
  },
  {
    id: 'c-103',
    ticket_number: 'FMC-2026-003',
    title: 'Central Knowledge Library West Wing Wi-Fi AP Offline',
    description: 'Students in Digital Study Hall B cannot authenticate to Campus-Mesh or EduRoam. Signal dropped during afternoon study hours.',
    category: 'IT & Digital Infrastructure',
    department_id: 'it_network',
    priority: 'medium',
    status: 'pending',
    location_building: 'Central Knowledge Library',
    location_floor: 'Floor 1',
    location_room: 'Reading Hall B',
    reporter_name: 'Sophia Chen',
    reporter_id: 'u-student-2',
    reporter_email: 'sophia.c@campus.edu',
    upvotes: 24,
    sla_hours: 18,
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    lat: 11.4975,
    lng: 77.2770,
    updates: [
      { timestamp: new Date(Date.now() - 88 * 60 * 1000).toISOString(), author: 'AI Dispatch', message: 'Auto-routed to IT & Digital Network queue.' }
    ]
  },
  {
    id: 'c-104',
    ticket_number: 'FMC-2026-004',
    title: 'Campus Food Court Water Filter Lamp Flashing Service Red',
    description: 'Main dining hall dispenser water tastes metallic and inspection lamp is flashing service red. Potential filter membrane saturation.',
    category: 'Food Services & Dining',
    department_id: 'food_services',
    priority: 'urgent',
    status: 'in_progress',
    location_building: 'Campus Food Court & Dining',
    location_floor: 'Ground Floor',
    location_room: 'Dispenser Bank East',
    reporter_name: 'David Kim',
    reporter_id: 'u-student-3',
    reporter_email: 'david.k@campus.edu',
    assigned_to: 'Dr. Sarah Lin',
    upvotes: 31,
    sla_hours: 4,
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    lat: 11.4968,
    lng: 77.2760,
    updates: [
      { timestamp: new Date(Date.now() - 100 * 60 * 1000).toISOString(), author: 'AI Dispatch', message: 'Urgent priority health trigger.' },
      { timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), author: 'Dr. Sarah Lin', message: 'Machine shut down. Replacement UV & sediment filter ordered.' }
    ]
  },
  {
    id: 'c-105',
    ticket_number: 'FMC-2026-005',
    title: 'Diamond Jubilee Hostel 2nd Floor Corridor Light Flickering',
    description: 'Three tube fixtures strobing intermittently causing discomfort for studying residents in North Wing corridor.',
    category: 'Electrical & Power',
    department_id: 'electrical',
    priority: 'low',
    status: 'closed',
    location_building: 'Diamond Jubilee Hostel',
    location_floor: 'Floor 2',
    location_room: 'North Wing Hallway',
    reporter_name: 'Alex Rivera',
    reporter_id: 'u-student-1',
    reporter_email: 'alex.rivera@campus.edu',
    assigned_to: 'Marcus Vance',
    upvotes: 6,
    sla_hours: 48,
    created_at: new Date(Date.now() - 480 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    closed_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    resolution_notes: 'Replaced ballasts and upgraded bulbs to 18W Philips LED.',
    verified_by_student: true,
    lat: 11.4960,
    lng: 77.2782,
    updates: [
      { timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), author: 'Marcus Vance', message: 'Replaced with 18W LEDs.' },
      { timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), author: 'Alex Rivera', message: 'Verified fixed! Hallway is fully illuminated.' }
    ]
  },
  {
    id: 'c-106',
    ticket_number: 'FMC-2026-006',
    title: 'KPR Academic Block 1 - Classroom 204 Air Conditioner Tripping',
    description: 'Split AC unit trips circuit breaker within 5 minutes of turning on. Ambient temperature reaching 34C during afternoon lectures.',
    category: 'Electrical & Power',
    department_id: 'electrical',
    priority: 'high',
    status: 'in_progress',
    location_building: 'KPR Academic Block 1',
    location_floor: 'Floor 2',
    location_room: 'Classroom 204',
    reporter_name: 'Priya Sharma',
    reporter_id: 'u-admin-4',
    reporter_email: 'priya.s@campus.edu',
    assigned_to: 'Marcus Vance',
    upvotes: 15,
    sla_hours: 12,
    created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    lat: 11.0761,
    lng: 77.1415,
    updates: [
      { timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString(), author: 'AI Dispatch', message: 'Assigned to KPR on-site electrician team.' }
    ]
  }
]

export const DEMO_USERS: UserPersona[] = [
  {
    id: 'u-student-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@campus.edu',
    role: 'student',
    roll_number: '7376231CS101',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'u-admin-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@campus.edu',
    role: 'admin',
    department_id: 'electrical',
    department_name: 'Electrical & Power Infrastructure',
    badge: 'Chief Electrical Inspector',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'u-admin-2',
    name: 'Elena Rostova',
    email: 'elena.r@campus.edu',
    role: 'admin',
    department_id: 'civil_maintenance',
    department_name: 'Civil & Plumbing Maintenance',
    badge: 'Facilities Director',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'u-admin-3',
    name: 'Dr. Sarah Lin',
    email: 'sarah.lin@campus.edu',
    role: 'admin',
    department_id: 'food_services',
    department_name: 'Food Services & Dining',
    badge: 'Campus Health Officer',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'u-admin-4',
    name: 'Priya Sharma',
    email: 'priya.s@campus.edu',
    role: 'admin',
    department_id: 'it_network',
    department_name: 'IT & Digital Infrastructure',
    badge: 'Senior Network Admin',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80'
  }
]

export const CAMPUS_BUILDINGS: BuildingInfo[] = [
  { id: 'b-cs', name: 'CS & IT Engineering Block', floors: ['Ground', 'Floor 1', 'Floor 2', 'Floor 3', 'AI Innovation Lab'], risk: 'high', open_issues: 3, lat: 11.4984, lng: 77.2766 },
  { id: 'b-me', name: 'Mechanical & Civil Block', floors: ['Ground', 'Floor 1', 'Floor 2', 'Floor 3', 'Workshop Bay'], risk: 'critical', open_issues: 4, lat: 11.4990, lng: 77.2758 },
  { id: 'b-lib', name: 'Central Knowledge Library', floors: ['Ground', 'Floor 1', 'Digital Archives'], risk: 'moderate', open_issues: 2, lat: 11.4975, lng: 77.2770 },
  { id: 'b-food', name: 'Campus Food Court & Dining', floors: ['Ground', 'Mezzanine'], risk: 'critical', open_issues: 3, lat: 11.4968, lng: 77.2760 },
  { id: 'b-hostel', name: 'Diamond Jubilee Hostel', floors: ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'], risk: 'low', open_issues: 1, lat: 11.4960, lng: 77.2782 },
  { id: 'b-kpr1', name: 'KPR Academic Block 1', floors: ['Ground', 'Floor 1', 'Floor 2', 'Floor 3'], risk: 'moderate', open_issues: 2, lat: 11.0761, lng: 77.1415 },
  { id: 'b-kpr2', name: 'KPR Innovation & Computing Hub', floors: ['Ground', 'Floor 1', 'IoT Lab'], risk: 'low', open_issues: 0, lat: 11.0770, lng: 77.1422 }
]
