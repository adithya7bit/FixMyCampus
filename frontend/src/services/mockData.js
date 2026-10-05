export const INITIAL_COMPLAINTS = [
  {
    id: 'c-101',
    ticket_number: 'FMC-2026-001',
    title: 'Elevator Lift 2 Stuck Between 2nd & 3rd Floor',
    description: 'Elevator 2 made loud screeching noise and halted. Display shows E-04 error code. Potential electrical failure.',
    category: 'Electrical & Power',
    department_id: 'electrical',
    priority: 'urgent',
    status: 'assigned',
    location_building: 'Engineering Block A',
    location_floor: 'Floor 2-3 Shaft',
    location_room: 'Elevator Bay West',
    reporter_name: 'Alex Rivera',
    reporter_id: 'u-student-1',
    reporter_email: 'alex.rivera@campus.edu',
    assigned_to: 'Marcus Vance',
    upvotes: 8,
    sla_hours: 2,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80',
    admin_notes: 'Technician dispatched with hydraulic reset kit. ETA 15 mins.',
    updates: [
      { timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), author: 'AI Dispatch', message: 'Urgent priority assigned (2-hr SLA target). Auto-routed to Electrical.' },
      { timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), author: 'Marcus Vance', message: 'Assigned to senior electrician Rajesh Kumar.' }
    ]
  },
  {
    id: 'c-102',
    ticket_number: 'FMC-2026-002',
    title: 'Severe Water Pipe Leak in Men\'s Washroom 3F',
    description: 'Main supply pipe leaking water rapidly, flooding hallway floor. Slip hazard for students.',
    category: 'Civil & Plumbing',
    department_id: 'civil_maintenance',
    priority: 'high',
    status: 'resolved',
    location_building: 'Science & Research Center',
    location_floor: 'Floor 3',
    location_room: 'Restroom 302',
    reporter_name: 'Alex Rivera',
    reporter_id: 'u-student-1',
    reporter_email: 'alex.rivera@campus.edu',
    assigned_to: 'Elena Rostova',
    upvotes: 4,
    sla_hours: 12,
    created_at: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    photo_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    resolution_photo: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
    resolution_notes: 'Replaced ruptured brass connector ring and re-sealed shutoff valve. Pressure tests normal.',
    requires_student_verification: true,
    updates: [
      { timestamp: new Date(Date.now() - 130 * 60 * 1000).toISOString(), author: 'AI Dispatch', message: 'High priority assigned (12-hr SLA).' },
      { timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), author: 'Elena Rostova', message: 'Valve replaced. Waiting for student verification to close ticket.' }
    ]
  },
  {
    id: 'c-103',
    ticket_number: 'FMC-2026-003',
    title: 'Central Library West Wing Wi-Fi Access Point Offline',
    description: 'No student in Study Hall B can connect to EduRoam or Campus-Mesh. Signal completely missing since morning.',
    category: 'IT & Digital Infrastructure',
    department_id: 'it_network',
    priority: 'medium',
    status: 'pending',
    location_building: 'Central Library',
    location_floor: 'Floor 1',
    location_room: 'Reading Hall B',
    reporter_name: 'Sophia Chen',
    reporter_id: 'u-student-2',
    reporter_email: 'sophia.c@campus.edu',
    upvotes: 14,
    sla_hours: 18,
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updates: [
      { timestamp: new Date(Date.now() - 88 * 60 * 1000).toISOString(), author: 'AI Dispatch', message: 'Auto-routed to IT & Digital Network queue.' }
    ]
  },
  {
    id: 'c-104',
    ticket_number: 'FMC-2026-004',
    title: 'Cafeteria Water Cooler Filter Light Red & Odor',
    description: 'Main dining hall cooler dispenser water tastes metallic and inspection lamp is flashing service red.',
    category: 'Food Services & Dining',
    department_id: 'food_services',
    priority: 'urgent',
    status: 'in_progress',
    location_building: 'Main Cafeteria',
    location_floor: 'Ground Floor',
    location_room: 'Dispenser Bank East',
    reporter_name: 'David Kim',
    reporter_id: 'u-student-3',
    reporter_email: 'david.k@campus.edu',
    assigned_to: 'Dr. Sarah Lin',
    upvotes: 19,
    sla_hours: 4,
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    updates: [
      { timestamp: new Date(Date.now() - 100 * 60 * 1000).toISOString(), author: 'AI Dispatch', message: 'Urgent priority health trigger.' },
      { timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), author: 'Dr. Sarah Lin', message: 'Machine shut down. Replacement UV & sediment filter ordered.' }
    ]
  },
  {
    id: 'c-105',
    ticket_number: 'FMC-2026-005',
    title: 'Hostel Block 4 2nd Floor Corridor Lights Flickering',
    description: '3 tube fixtures flickering constantly causing migraine for studying residents.',
    category: 'Electrical & Power',
    department_id: 'electrical',
    priority: 'low',
    status: 'closed',
    location_building: 'Hostel Block 4',
    location_floor: 'Floor 2',
    location_room: 'North Hallway',
    reporter_name: 'Alex Rivera',
    reporter_id: 'u-student-1',
    reporter_email: 'alex.rivera@campus.edu',
    assigned_to: 'Marcus Vance',
    upvotes: 3,
    sla_hours: 48,
    created_at: new Date(Date.now() - 480 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    closed_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    resolution_notes: 'Replaced ballasts and upgraded bulbs to 18W Philips LED.',
    verified_by_student: true,
    updates: [
      { timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), author: 'Marcus Vance', message: 'Replaced with 18W LEDs.' },
      { timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), author: 'Alex Rivera', message: 'Verified fixed! Hallway is fully illuminated.' }
    ]
  }
]

export const DEMO_USERS = [
  {
    id: 'u-student-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@campus.edu',
    role: 'student',
    roll_number: 'CS2023-049',
    department: 'Computer Science',
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

export const CAMPUS_BUILDINGS = [
  { id: 'b-eng', name: 'Engineering Block A', floors: ['Ground', 'Floor 1', 'Floor 2', 'Floor 3', 'Roof Lab'], risk: 'high', open_issues: 3 },
  { id: 'b-sci', name: 'Science & Research Center', floors: ['Basement', 'Ground', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'], risk: 'critical', open_issues: 4 },
  { id: 'b-lib', name: 'Central Library', floors: ['Ground', 'Floor 1', 'Floor 2'], risk: 'moderate', open_issues: 2 },
  { id: 'b-caf', name: 'Main Cafeteria & Food Court', floors: ['Ground', 'Mezzanine'], risk: 'critical', open_issues: 3 },
  { id: 'b-h4', name: 'Hostel Block 4 (South)', floors: ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'], risk: 'low', open_issues: 1 },
  { id: 'b-admin', name: 'Administrative Center', floors: ['Ground', 'Floor 1', 'Floor 2'], risk: 'low', open_issues: 0 }
]
