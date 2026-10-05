// campus-data.js - Campus presets, buildings, and initial mock data
window.CAMPUS_PRESETS = {
  "bannari-amman": {
    name: "Bannari Amman Institute of Technology (BIT)",
    center: [11.4982, 77.2764],
    zoom: 17
  },
  "kpr-iet": {
    name: "KPR Institute of Engineering and Technology (KPR)",
    center: [11.0761, 77.1415],
    zoom: 17
  }
};

window.INITIAL_COMPLAINTS = [
  // --- Bannari Amman Institute of Technology (BIT) Complaints ---
  {
    id: "BIT-104",
    title: "RO Drinking Water Dispenser Leakage at CSE 2nd Floor Corridor",
    category: "plumbing",
    urgency: "urgent",
    status: "in-progress",
    lat: 11.4990,
    lng: 77.2768,
    floor: "2nd Floor",
    room: "Near Cloud Computing Lab",
    locationName: "Outside Lab 4 corridor, CSE Block",
    nearestBuilding: "Computer Science & IT Block",
    description: "The RO cooler valve is cracked and leaking continuously over the tiled walkway. Floor is extremely slippery for students entering the laboratory.",
    reporterName: "Kavitha S",
    rollNumber: "22CS142",
    department: "Computer Science & Engineering",
    anonymous: false,
    timestamp: "2026-09-28T10:15:00Z",
    upvotes: 38,
    hasUpvoted: false,
    photos: ["https://images.unsplash.com/photo-1585672840546-d5eb3914a520?auto=format&fit=crop&w=600&q=80"],
    timeline: [
      { title: "Complaint Filed by Student", time: "Sep 28, 2026 • 10:15 AM", desc: "Reported with URGENT priority." },
      { title: "Plumbing Wing Assigned", time: "Sep 28, 2026 • 11:30 AM", desc: "Maintenance Technician Murugesan assigned to repair solenoid valve." }
    ]
  },
  {
    id: "BIT-109",
    title: "Floodlight Failure at BIT Athletic Stadium Basketball Court",
    category: "electrical",
    urgency: "high",
    status: "reported",
    lat: 11.4955,
    lng: 77.2750,
    floor: "Outdoor Ground",
    room: "Court 1",
    locationName: "North basketball court, near pavilion",
    nearestBuilding: "BIT Athletic Stadium & Sports Complex",
    description: "The north-east floodlight tower tripped yesterday during evening team practice. Matches cannot be conducted after 6:30 PM.",
    reporterName: "Dinesh Kumar",
    rollNumber: "21ME089",
    department: "Mechanical Engineering",
    anonymous: false,
    timestamp: "2026-09-27T18:45:00Z",
    upvotes: 45,
    hasUpvoted: false,
    photos: ["https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80"],
    timeline: [
      { title: "Complaint Registered", time: "Sep 27, 2026 • 6:45 PM", desc: "Sports council raised electrical ticket." }
    ]
  },
  {
    id: "BIT-115",
    title: "Wi-Fi Signal Drop at Campus Food Court Outdoor Deck",
    category: "it-network",
    urgency: "medium",
    status: "reported",
    lat: 11.4970,
    lng: 77.2770,
    floor: "Outdoor Ground",
    room: "Gazebo Tables",
    locationName: "Between Food Court and Central Lawn",
    nearestBuilding: "Campus Food Court & Canteen",
    description: "Students cannot connect to BIT-Student Wi-Fi from the outdoor canopy seating. Signal strength drops below 1 bar.",
    reporterName: "Anonymous Student",
    rollNumber: "",
    department: "Electronics & Communication",
    anonymous: true,
    timestamp: "2026-09-28T12:00:00Z",
    upvotes: 23,
    hasUpvoted: false,
    photos: [],
    timeline: [
      { title: "Ticket Created", time: "Sep 28, 2026 • 12:00 PM", desc: "Logged to BIT IT Network Services." }
    ]
  },

  // --- KPR Institute of Engineering and Technology Complaints ---
  {
    id: "KPR-201",
    title: "Broken Paver Blocks along Thangam Boys Hostel Pathway",
    category: "roads",
    urgency: "high",
    status: "in-progress",
    lat: 11.0745,
    lng: 77.1432,
    floor: "Outdoor Walkway",
    room: "Hostel Pathway",
    locationName: "Pedestrian walkway approaching Thangam Hostel Gate",
    nearestBuilding: "Thangam Boys Hostel",
    description: "Multiple interlock tiles have sunk and cracked creating an uneven ridge. A student tripped in the dark two days ago.",
    reporterName: "Vigneshwaran M",
    rollNumber: "22CB108",
    department: "Computer Science & Business Systems",
    anonymous: false,
    timestamp: "2026-09-26T16:20:00Z",
    upvotes: 52,
    hasUpvoted: false,
    photos: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80"],
    timeline: [
      { title: "Complaint Logged", time: "Sep 26, 2026 • 4:20 PM", desc: "Reported with high urgency." },
      { title: "Civil Works Inspected", time: "Sep 27, 2026 • 10:00 AM", desc: "Civil maintenance crew marked section for relaying." }
    ]
  },
  {
    id: "KPR-208",
    title: "AC Unit Tripping in Central Library Digital Research Section",
    category: "facilities",
    urgency: "urgent",
    status: "reported",
    lat: 11.0768,
    lng: 77.1410,
    floor: "1st Floor",
    room: "Digital Library Hall",
    locationName: "Dr. K.P. Ramasamy Library, 1st Floor East",
    nearestBuilding: "Dr. K.P. Ramasamy Central Library",
    description: "Cassette AC unit turns off after 10 minutes with breaker trip sound. The room gets extremely stuffy for 80 students preparing for campus placements.",
    reporterName: "Ananya P",
    rollNumber: "23AD045",
    department: "Artificial Intelligence & Data Science",
    anonymous: false,
    timestamp: "2026-09-28T09:30:00Z",
    upvotes: 41,
    hasUpvoted: false,
    photos: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80"],
    timeline: [
      { title: "Complaint Filed", time: "Sep 28, 2026 • 9:30 AM", desc: "Routed to KPR HVAC Facilities Team." }
    ]
  },
  {
    id: "KPR-214",
    title: "Overflowing Waste Sorting Bin at Food Court Parking",
    category: "sanitation",
    urgency: "medium",
    status: "resolved",
    lat: 11.0750,
    lng: 77.1425,
    floor: "Ground Floor",
    room: "Food Court Rear Exit",
    locationName: "Adjacent to Cafeteria Parking Lot",
    nearestBuilding: "Student Food Court & Cafeteria",
    description: "Plastic and food waste bins were overflowing after lunch peak hours.",
    reporterName: "Manojkumar S",
    rollNumber: "22EE062",
    department: "Electrical & Electronics Eng",
    anonymous: false,
    timestamp: "2026-09-27T13:10:00Z",
    upvotes: 19,
    hasUpvoted: false,
    photos: ["https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80"],
    timeline: [
      { title: "Reported", time: "Sep 27, 2026 • 1:10 PM", desc: "Sanitation lead notified." },
      { title: "Cleaned & Disinfected", time: "Sep 27, 2026 • 2:30 PM", desc: "Bins emptied and washed with disinfectant." }
    ]
  }
];

window.CATEGORIES_CONFIG = {
  plumbing: {
    label: "Water & Plumbing",
    icon: "droplet",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    border: "#38bdf8"
  },
  electrical: {
    label: "Electrical & Lighting",
    icon: "zap",
    color: "#d97706",
    bgColor: "#fef3c7",
    border: "#fbbf24"
  },
  roads: {
    label: "Roads & Walkways",
    icon: "navigation",
    color: "#ea580c",
    bgColor: "#ffedd5",
    border: "#fb923c"
  },
  sanitation: {
    label: "Cleanliness & Trash",
    icon: "trash-2",
    color: "#059669",
    bgColor: "#d1fae5",
    border: "#34d399"
  },
  facilities: {
    label: "Furniture & AC",
    icon: "armchair",
    color: "#7c3aed",
    bgColor: "#ede9fe",
    border: "#a78bfa"
  },
  safety: {
    label: "Safety & Security",
    icon: "shield-alert",
    color: "#dc2626",
    bgColor: "#fee2e2",
    border: "#f87171"
  },
  "it-network": {
    label: "Campus Wi-Fi / IT",
    icon: "wifi",
    color: "#0891b2",
    bgColor: "#cffafe",
    border: "#22d3ee"
  }
};

window.CAMPUS_HELPLINES = {
  "bannari-amman": [
    {
      role: "BIT Campus Security & Main Gate Control",
      phone: "+91 4295 226000",
      alt: "Ext: 222 (24x7 Security Desk)",
      type: "alert-blue",
      icon: "shield"
    },
    {
      role: "BIT Campus Health Centre & Ambulance",
      phone: "+91 94437 26000",
      alt: "24/7 Medical Care / Emergency",
      type: "alert-red",
      icon: "ambulance"
    },
    {
      role: "BIT Power Substation & Electrical Emergency",
      phone: "+91 4295 226120",
      alt: "High Tension & Generator Backup",
      type: "alert-amber",
      icon: "zap"
    },
    {
      role: "BIT Estate Office & Plumbing Support",
      phone: "+91 4295 226130",
      alt: "Hostel Water Supply & RO Plants",
      type: "alert-amber",
      icon: "wrench"
    },
    {
      role: "BIT Student Affairs & Anti-Ragging Cell",
      phone: "+91 99429 21289",
      alt: "Toll-Free: 1800-180-5522",
      type: "alert-purple",
      icon: "heart-handshake"
    }
  ],
  "kpr-iet": [
    {
      role: "KPR Campus Security & Main Gate Control",
      phone: "+91 422 2635600",
      alt: "Ext: 101 (24x7 Control Room)",
      type: "alert-blue",
      icon: "shield"
    },
    {
      role: "KPR Health Centre & Emergency Ambulance",
      phone: "+91 98422 10800",
      alt: "24/7 Campus Medical Dispatch",
      type: "alert-red",
      icon: "ambulance"
    },
    {
      role: "KPR Electrical & Power Breakdown Desk",
      phone: "+91 75503 16702",
      alt: "Substation & Campus Lighting",
      type: "alert-amber",
      icon: "zap"
    },
    {
      role: "KPR Civil & Water Pipeline Maintenance",
      phone: "+91 75503 16703",
      alt: "Hostels Water & Pavers Repair",
      type: "alert-amber",
      icon: "wrench"
    },
    {
      role: "KPR Student Grievance & Women Safety Cell",
      phone: "+91 75503 16701",
      alt: "Toll-Free: 1800-180-5522",
      type: "alert-purple",
      icon: "heart-handshake"
    }
  ],
  "national": [
    {
      role: "National Emergency Response (All-in-One)",
      phone: "112",
      alt: "Police, Fire & Medical 24x7",
      type: "alert-red",
      icon: "phone-forwarded"
    },
    {
      role: "Emergency Ambulance Service (Tamil Nadu)",
      phone: "108",
      alt: "Govt. Free 24x7 Ambulance",
      type: "alert-red",
      icon: "ambulance"
    },
    {
      role: "Tamil Nadu Fire & Rescue Department",
      phone: "101",
      alt: "Fire & Hazard Disaster Desk",
      type: "alert-amber",
      icon: "flame"
    },
    {
      role: "Women Safety Helpline (Tamil Nadu)",
      phone: "1091",
      alt: "Emergency Women Distress Support (181)",
      type: "alert-purple",
      icon: "shield-alert"
    }
  ]
};
