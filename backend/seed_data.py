"""
FixMyCampus - Seed Data Module
Realistic campus complaints, departments, status histories, and food hygiene records
for hackathon demonstration and testing.
"""

from datetime import datetime, timezone, timedelta
import uuid

NOW = datetime.now(timezone.utc)

DEPARTMENTS = [
    {
        "id": "electrical",
        "name": "Electrical & Power",
        "description": "Power outlets, wiring, elevator lifts, generator, solar grid, lighting",
        "sla_urgent_hours": 2,
        "sla_high_hours": 8,
        "sla_medium_hours": 24,
        "sla_low_hours": 48,
        "icon": "Zap"
    },
    {
        "id": "civil_maintenance",
        "name": "Civil & Plumbing",
        "description": "Water leaks, broken taps, washrooms, potholes, masonry, doors & locks",
        "sla_urgent_hours": 3,
        "sla_high_hours": 12,
        "sla_medium_hours": 24,
        "sla_low_hours": 72,
        "icon": "Wrench"
    },
    {
        "id": "housekeeping",
        "name": "Housekeeping & Sanitation",
        "description": "Classroom cleanliness, garbage bins, restroom hygiene, pest control",
        "sla_urgent_hours": 4,
        "sla_high_hours": 12,
        "sla_medium_hours": 24,
        "sla_low_hours": 48,
        "icon": "Sparkles"
    },
    {
        "id": "it_network",
        "name": "IT & Digital Infrastructure",
        "description": "Campus Wi-Fi, lab PCs, smartboards, servers, LAN ports, audio-visual",
        "sla_urgent_hours": 2,
        "sla_high_hours": 6,
        "sla_medium_hours": 18,
        "sla_low_hours": 36,
        "icon": "Wifi"
    },
    {
        "id": "food_services",
        "name": "Food Services & Dining",
        "description": "Mess cleanliness, cafeteria food hygiene, drinking water coolers, kitchen safety",
        "sla_urgent_hours": 1,
        "sla_high_hours": 4,
        "sla_medium_hours": 12,
        "sla_low_hours": 24,
        "icon": "Utensils"
    },
    {
        "id": "hostel",
        "name": "Hostel Affairs",
        "description": "Dormitory amenities, furniture, geysers, room fixtures, warden oversight",
        "sla_urgent_hours": 3,
        "sla_high_hours": 12,
        "sla_medium_hours": 24,
        "sla_low_hours": 48,
        "icon": "Building"
    },
    {
        "id": "security",
        "name": "Campus Safety & Security",
        "description": "Gates, CCTV cameras, night lights, emergency access, trespass hazards",
        "sla_urgent_hours": 1,
        "sla_high_hours": 4,
        "sla_medium_hours": 12,
        "sla_low_hours": 24,
        "icon": "ShieldAlert"
    }
]

DEMO_USERS = [
    {
        "id": "std-001",
        "name": "Alex Rivera",
        "email": "alex.rivera@campus.edu",
        "role": "student",
        "roll_number": "CS2023-049",
        "department_id": None,
        "verified": True
    },
    {
        "id": "adm-elec-001",
        "name": "Marcus Vance",
        "email": "m.vance@campus.edu",
        "role": "admin",
        "department_id": "electrical",
        "verified": True
    },
    {
        "id": "adm-civil-001",
        "name": "Elena Rostova",
        "email": "e.rostova@campus.edu",
        "role": "admin",
        "department_id": "civil_maintenance",
        "verified": True
    },
    {
        "id": "adm-food-001",
        "name": "Dr. Sarah Lin",
        "email": "s.lin@campus.edu",
        "role": "admin",
        "department_id": "food_services",
        "verified": True
    },
    {
        "id": "adm-it-001",
        "name": "Priya Sharma",
        "email": "p.sharma@campus.edu",
        "role": "admin",
        "department_id": "it_network",
        "verified": True
    }
]

def generate_seed_complaints():
    return [
        {
            "id": "cpl-001",
            "ticket_number": "FMC-2026-1001",
            "reporter_id": "std-001",
            "reporter_name": "Alex Rivera",
            "reporter_email": "alex.rivera@campus.edu",
            "title": "Severe Water Leak from Ceiling in Washroom",
            "description": "The ceiling pipe over the 3rd cubicle is continuously leaking water, creating a large pool on the floor and slip hazard.",
            "category": "Civil & Plumbing",
            "department_id": "civil_maintenance",
            "location_building": "Engineering Block A",
            "location_floor": "2nd Floor",
            "location_room": "Male Washroom East Wing",
            "location_details": "Right next to staircase B",
            "priority": "high",
            "status": "in_progress",
            "assigned_to_id": "adm-civil-001",
            "assigned_to_name": "Elena Rostova",
            "upvotes": 5,
            "upvoter_ids": ["std-001", "std-002", "std-003", "std-004", "std-005"],
            "created_at": (NOW - timedelta(hours=8)).isoformat(),
            "updated_at": (NOW - timedelta(hours=3)).isoformat(),
            "history": [
                {
                    "status": "pending",
                    "changed_by_name": "Alex Rivera",
                    "changed_by_role": "student",
                    "note": "Complaint filed with location coordinates.",
                    "timestamp": (NOW - timedelta(hours=8)).isoformat()
                },
                {
                    "status": "assigned",
                    "changed_by_name": "System AI Router",
                    "changed_by_role": "system",
                    "note": "Auto-routed to Civil & Plumbing. Priority evaluated as HIGH.",
                    "timestamp": (NOW - timedelta(hours=7, minutes=50)).isoformat()
                },
                {
                    "status": "in_progress",
                    "changed_by_name": "Elena Rostova",
                    "changed_by_role": "admin",
                    "note": "Plumber dispatched to isolate the floor valve and inspect pipe coupling.",
                    "timestamp": (NOW - timedelta(hours=3)).isoformat()
                }
            ]
        },
        {
            "id": "cpl-002",
            "ticket_number": "FMC-2026-1002",
            "reporter_id": "std-001",
            "reporter_name": "Alex Rivera",
            "reporter_email": "alex.rivera@campus.edu",
            "title": "Elevator Lift B Stuck between Floor 3 and 4 with Warning Alarm",
            "description": "Lift B abruptly stopped with 2 passengers inside. Alarm buzzer is ringing. Immediate power reset and technician required.",
            "category": "Electrical & Power",
            "department_id": "electrical",
            "location_building": "Central Library",
            "location_floor": "3rd Floor",
            "location_room": "Main Shaft Lift B",
            "location_details": "Central elevator bank",
            "priority": "urgent",
            "status": "escalated",
            "is_escalated": True,
            "escalated_at": (NOW - timedelta(hours=1)).isoformat(),
            "escalation_reason": "Breached URGENT SLA threshold of 2 hours",
            "assigned_to_id": "adm-elec-001",
            "assigned_to_name": "Marcus Vance",
            "upvotes": 12,
            "upvoter_ids": ["std-001", "std-006", "std-007"],
            "created_at": (NOW - timedelta(hours=3, minutes=15)).isoformat(),
            "updated_at": (NOW - timedelta(hours=1)).isoformat(),
            "history": [
                {
                    "status": "pending",
                    "changed_by_name": "Alex Rivera",
                    "changed_by_role": "student",
                    "note": "Urgent life-safety distress flag raised.",
                    "timestamp": (NOW - timedelta(hours=3, minutes=15)).isoformat()
                },
                {
                    "status": "assigned",
                    "changed_by_name": "System AI Router",
                    "changed_by_role": "system",
                    "note": "Emergency fast-track triggered. SMS sent to Electrical Chief.",
                    "timestamp": (NOW - timedelta(hours=3, minutes=10)).isoformat()
                },
                {
                    "status": "escalated",
                    "changed_by_name": "SLA Escalation Engine",
                    "changed_by_role": "system",
                    "note": "BREACH ALERT: 2hr Urgent SLA elapsed without resolution. Escalated to Campus Operations Director.",
                    "timestamp": (NOW - timedelta(hours=1)).isoformat()
                }
            ]
        },
        {
            "id": "cpl-003",
            "ticket_number": "FMC-2026-1003",
            "reporter_id": "std-001",
            "reporter_name": "Alex Rivera",
            "reporter_email": "alex.rivera@campus.edu",
            "title": "Sparks and Burning Smell from Ceiling Projector in Lab 4",
            "description": "During afternoon presentation, the ceiling Epson projector emitted visible sparks and pungent burnt plastic odor. Power switched off immediately.",
            "category": "Electrical & Power",
            "department_id": "electrical",
            "location_building": "Science Center",
            "location_floor": "1st Floor",
            "location_room": "Physics Lab 104",
            "priority": "high",
            "status": "resolved",
            "assigned_to_id": "adm-elec-001",
            "assigned_to_name": "Marcus Vance",
            "resolution_note": "Replaced burned capacitor and power supply on projector ceiling mount. Tested surge voltage and certified safe.",
            "resolution_photo": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
            "resolved_at": (NOW - timedelta(hours=2)).isoformat(),
            "upvotes": 3,
            "created_at": (NOW - timedelta(hours=14)).isoformat(),
            "updated_at": (NOW - timedelta(hours=2)).isoformat(),
            "history": [
                {
                    "status": "pending",
                    "changed_by_name": "Alex Rivera",
                    "changed_by_role": "student",
                    "note": "Ticket created.",
                    "timestamp": (NOW - timedelta(hours=14)).isoformat()
                },
                {
                    "status": "in_progress",
                    "changed_by_name": "Marcus Vance",
                    "changed_by_role": "admin",
                    "note": "Power isolated and testing equipment connected.",
                    "timestamp": (NOW - timedelta(hours=10)).isoformat()
                },
                {
                    "status": "resolved",
                    "changed_by_name": "Marcus Vance",
                    "changed_by_role": "admin",
                    "note": "Capacitor replaced. Awaiting student verification.",
                    "timestamp": (NOW - timedelta(hours=2)).isoformat()
                }
            ]
        },
        {
            "id": "cpl-004",
            "ticket_number": "FMC-2026-1004",
            "reporter_id": "std-002",
            "reporter_name": "Maya Patel",
            "reporter_email": "m.patel@campus.edu",
            "title": "Undercooked Chicken and Uncovered Food in Mess Dining Hall",
            "description": "Several students noticed chicken in the lunch curry was raw in the center with pink meat. Food counters were uncovered with flies hovering.",
            "category": "Food Services & Dining",
            "department_id": "food_services",
            "location_building": "Main Cafeteria & Dining Hall",
            "location_floor": "Ground Floor",
            "location_room": "Central Mess Serving Area",
            "priority": "urgent",
            "status": "in_progress",
            "is_food_hygiene": True,
            "food_hygiene_data": {
                "facility": "Central Mess Serving Area",
                "risk_type": "Food Contamination & Temperature Violation",
                "inspection_scheduled": True
            },
            "assigned_to_id": "adm-food-001",
            "assigned_to_name": "Dr. Sarah Lin",
            "upvotes": 18,
            "created_at": (NOW - timedelta(hours=5)).isoformat(),
            "updated_at": (NOW - timedelta(hours=1)).isoformat(),
            "history": [
                {
                    "status": "pending",
                    "changed_by_name": "Maya Patel",
                    "changed_by_role": "student",
                    "note": "Food health alert filed.",
                    "timestamp": (NOW - timedelta(hours=5)).isoformat()
                },
                {
                    "status": "in_progress",
                    "changed_by_name": "Dr. Sarah Lin",
                    "changed_by_role": "admin",
                    "note": "Food inspection officer dispatched. Batch samples retained for bacterial culture.",
                    "timestamp": (NOW - timedelta(hours=1)).isoformat()
                }
            ]
        },
        {
            "id": "cpl-005",
            "ticket_number": "FMC-2026-1005",
            "reporter_id": "std-003",
            "reporter_name": "Liam Connor",
            "reporter_email": "l.connor@campus.edu",
            "title": "Wi-Fi Access Point Offline in Computer Science Lab 3",
            "description": "Entire room unable to connect to 'CAMPUS-STUDENT-5G'. Signal drops immediately. Affecting lab session coding practicals.",
            "category": "IT & Digital Infrastructure",
            "department_id": "it_network",
            "location_building": "Engineering Block A",
            "location_floor": "1st Floor",
            "location_room": "CS Lab 102",
            "priority": "medium",
            "status": "assigned",
            "assigned_to_id": "adm-it-001",
            "assigned_to_name": "Priya Sharma",
            "upvotes": 7,
            "created_at": (NOW - timedelta(hours=6)).isoformat(),
            "updated_at": (NOW - timedelta(hours=4)).isoformat(),
            "history": [
                {
                    "status": "pending",
                    "changed_by_name": "Liam Connor",
                    "changed_by_role": "student",
                    "note": "Network outage reported.",
                    "timestamp": (NOW - timedelta(hours=6)).isoformat()
                },
                {
                    "status": "assigned",
                    "changed_by_name": "Priya Sharma",
                    "changed_by_role": "admin",
                    "note": "Remote ping failed. Cisco AP reboot scheduled via PoE switch.",
                    "timestamp": (NOW - timedelta(hours=4)).isoformat()
                }
            ]
        },
        {
            "id": "cpl-006",
            "ticket_number": "FMC-2026-1006",
            "reporter_id": "std-001",
            "reporter_name": "Alex Rivera",
            "reporter_email": "alex.rivera@campus.edu",
            "title": "Broken Door Lock & Latch on Hostel Room 214",
            "description": "The mortise lock key cylinder is spinning loose and will not lock from the outside. Personal belongings left unsecured during lectures.",
            "category": "Hostel Affairs",
            "department_id": "hostel",
            "location_building": "Hostel Block 4",
            "location_floor": "2nd Floor",
            "location_room": "Room 214",
            "priority": "high",
            "status": "pending",
            "upvotes": 1,
            "created_at": (NOW - timedelta(hours=2)).isoformat(),
            "updated_at": (NOW - timedelta(hours=2)).isoformat(),
            "history": [
                {
                    "status": "pending",
                    "changed_by_name": "Alex Rivera",
                    "changed_by_role": "student",
                    "note": "Hostel security issue logged.",
                    "timestamp": (NOW - timedelta(hours=2)).isoformat()
                }
            ]
        }
    ]

def generate_seed_inspections():
    return [
        {
            "id": "insp-001",
            "complaint_id": "cpl-004",
            "facility_name": "Main Dining Hall (Mess A)",
            "inspector_name": "Dr. Sarah Lin (Chief Health Officer)",
            "inspection_date": (NOW - timedelta(hours=1)).isoformat(),
            "checklist": {
                "storage_temp": True,
                "cross_contamination": False,
                "pest_control": False,
                "water_quality": True,
                "staff_hygiene": True,
                "waste_drainage": True
            },
            "score": 65,
            "grade": "C (Notice Issued)",
            "status": "warning_issued",
            "notes": "Meat prep table lacked separate cutting boards. Fly screen at delivery dock torn and required immediate patching.",
            "corrective_actions": "1. Replace colored cutting boards within 12h. 2. Install industrial air curtain at dock. 3. Retrain kitchen staff on internal cook temperature probing (min 74°C).",
            "requires_reinspection": True
        },
        {
            "id": "insp-002",
            "facility_name": "Library Cafe Kiosk",
            "inspector_name": "Dr. Sarah Lin",
            "inspection_date": (NOW - timedelta(days=2)).isoformat(),
            "checklist": {
                "storage_temp": True,
                "cross_contamination": True,
                "pest_control": True,
                "water_quality": True,
                "staff_hygiene": True,
                "waste_drainage": True
            },
            "score": 100,
            "grade": "A (Excellent)",
            "status": "compliant",
            "notes": "Flawless cold chain maintenance at 3.2°C. Excellent barista hygiene and daily water filtration logs updated.",
            "corrective_actions": "None. Certified compliant for Q3.",
            "requires_reinspection": False
        }
    ]
