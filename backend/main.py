"""
FixMyCampus - FastAPI Backend Application
Closed-loop campus problem resolution API with Supabase integration,
AI classification, duplicate detection, SLA auto-escalation, and analytics.
"""

import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Query, Body, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import domain modules
from ai_classifier import classify_complaint
from duplicate_detector import find_duplicates
from escalation_engine import check_and_escalate_complaints, DEFAULT_SLAS
from food_hygiene import CHECKLIST_ITEMS, create_inspection_record
from seed_data import DEPARTMENTS, DEMO_USERS, generate_seed_complaints, generate_seed_inspections

load_dotenv()

app = FastAPI(
    title="FixMyCampus API",
    description="Campus Problem Resolution & SLA Management System",
    version="1.0.0"
)

# CORS setup for local React dev (Vite default 5173) and production Netlify
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store initialized with rich seed data for immediate reliability and zero-config demo
COMPLAINTS_DB: List[Dict[str, Any]] = generate_seed_complaints()
INSPECTIONS_DB: List[Dict[str, Any]] = generate_seed_inspections()
NOTIFICATIONS_DB: List[Dict[str, Any]] = [
    {
        "id": "notif-001",
        "user_id": "std-001",
        "complaint_id": "cpl-003",
        "title": "Fix Completed: Ready for Verification",
        "message": "Admin Marcus Vance marked ticket FMC-2026-1003 as Resolved. Please verify and confirm.",
        "type": "resolution_ready",
        "is_read": False,
        "created_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    },
    {
        "id": "notif-002",
        "user_id": "adm-elec-001",
        "complaint_id": "cpl-002",
        "title": "🚨 URGENT Fast-Track Ticket Assigned",
        "message": "Life-safety issue reported: Elevator stuck with passengers in Central Library.",
        "type": "urgent_assignment",
        "is_read": True,
        "created_at": (datetime.now(timezone.utc) - timedelta(hours=3, minutes=10)).isoformat()
    }
]

# --- PYDANTIC SCHEMAS ---

class AIClassifyRequest(BaseModel):
    title: str
    description: str
    attachment_desc: Optional[str] = ""

class DuplicateCheckRequest(BaseModel):
    title: str
    description: str
    location_building: str
    location_floor: str
    location_room: str

class ComplaintCreate(BaseModel):
    reporter_id: str = "std-001"
    reporter_name: str = "Alex Rivera"
    reporter_email: str = "alex.rivera@campus.edu"
    title: str
    description: str
    category: Optional[str] = None
    department_id: Optional[str] = None
    priority: Optional[str] = None
    location_building: str
    location_floor: str
    location_room: str
    location_details: Optional[str] = ""
    attachments: Optional[List[str]] = []
    is_food_hygiene: Optional[bool] = False
    food_hygiene_data: Optional[Dict[str, Any]] = {}

class StatusUpdateRequest(BaseModel):
    status: str
    changed_by_name: str
    changed_by_role: str = "admin"
    note: Optional[str] = ""
    assigned_to_id: Optional[str] = None
    assigned_to_name: Optional[str] = None
    resolution_note: Optional[str] = None
    resolution_photo: Optional[str] = None

class VerificationRequest(BaseModel):
    action: str # "confirm" or "reopen"
    verified_by_name: str
    note: Optional[str] = ""
    reopen_reason: Optional[str] = None

class UpvoteRequest(BaseModel):
    user_id: str

class InspectionCreate(BaseModel):
    facility_name: str
    inspector_name: str
    checklist: Dict[str, bool]
    notes: Optional[str] = ""
    corrective_actions: Optional[str] = ""
    complaint_id: Optional[str] = None

# --- ROUTES ---

@app.get("/")
@app.get("/api/health")
def health_check():
    """System health check and overview metrics."""
    return {
        "status": "healthy",
        "service": "FixMyCampus API",
        "version": "1.0.0",
        "time": datetime.now(timezone.utc).isoformat(),
        "total_complaints": len(COMPLAINTS_DB),
        "total_inspections": len(INSPECTIONS_DB)
    }

@app.get("/api/departments")
def get_departments():
    """Retrieve all campus maintenance departments and SLAs."""
    return DEPARTMENTS

@app.get("/api/users/demo")
def get_demo_users():
    """Provides quick login profiles for hackathon demo."""
    return DEMO_USERS

# --- AI & SMART ROUTING ---

@app.post("/api/ai/classify")
def classify_complaint_endpoint(payload: AIClassifyRequest):
    """
    AI category and priority auto-detection endpoint.
    Uses rule-based + keyword heuristic matching with explainable reasoning.
    """
    result = classify_complaint(
        title=payload.title,
        description=payload.description,
        attachment_desc=payload.attachment_desc or ""
    )
    return result

@app.post("/api/ai/check-duplicates")
def check_duplicates_endpoint(payload: DuplicateCheckRequest):
    """
    Scans existing open tickets to detect potential duplicates based on
    location matching and description token similarity.
    """
    duplicates = find_duplicates(
        new_title=payload.title,
        new_description=payload.description,
        building=payload.location_building,
        floor=payload.location_floor,
        room=payload.location_room,
        existing_complaints=COMPLAINTS_DB
    )
    return {
        "has_duplicate": len(duplicates) > 0,
        "count": len(duplicates),
        "duplicates": duplicates
    }

# --- COMPLAINTS MANAGEMENT ---

@app.get("/api/complaints")
def list_complaints(
    reporter_id: Optional[str] = None,
    department_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    building: Optional[str] = None,
    search: Optional[str] = None
):
    """List complaints with multi-criteria filtering."""
    results = COMPLAINTS_DB

    if reporter_id:
        results = [c for c in results if c.get("reporter_id") == reporter_id]
    if department_id:
        results = [c for c in results if c.get("department_id") == department_id]
    if status:
        results = [c for c in results if c.get("status") == status]
    if priority:
        results = [c for c in results if c.get("priority") == priority]
    if building:
        results = [c for c in results if c.get("location_building") == building]
    if search:
        s = search.lower()
        results = [
            c for c in results 
            if s in c.get("title", "").lower() 
            or s in c.get("description", "").lower() 
            or s in c.get("ticket_number", "").lower()
            or s in c.get("location_room", "").lower()
        ]

    # Priority ranking helper for sorting: urgent > high > medium > low
    p_order = {"urgent": 0, "high": 1, "medium": 2, "low": 3}
    sorted_results = sorted(
        results, 
        key=lambda x: (p_order.get(x.get("priority", "medium"), 2), x.get("created_at", "")),
        reverse=False
    )
    return sorted_results

@app.post("/api/complaints", status_code=status.HTTP_201_CREATED)
def create_complaint(payload: ComplaintCreate):
    """
    Creates a new complaint.
    Automatically runs AI classification if category/priority not specified.
    Generates ticket ID and initial status history.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # Run AI auto-classification if needed
    if not payload.department_id or not payload.priority:
        ai_res = classify_complaint(payload.title, payload.description)
        department_id = payload.department_id or ai_res["department_id"]
        priority = payload.priority or ai_res["priority"]
        category = payload.category or ai_res["category"]
        is_food_hygiene = payload.is_food_hygiene or ai_res["is_food_hygiene"]
    else:
        department_id = payload.department_id
        priority = payload.priority
        category = payload.category or "General Maintenance"
        is_food_hygiene = payload.is_food_hygiene

    # Generate sequential ticket number
    ticket_num = f"FMC-2026-{1000 + len(COMPLAINTS_DB) + 1}"
    complaint_id = f"cpl-{str(uuid.uuid4())[:8]}"

    new_complaint = {
        "id": complaint_id,
        "ticket_number": ticket_num,
        "reporter_id": payload.reporter_id,
        "reporter_name": payload.reporter_name,
        "reporter_email": payload.reporter_email,
        "title": payload.title,
        "description": payload.description,
        "category": category,
        "department_id": department_id,
        "location_building": payload.location_building,
        "location_floor": payload.location_floor,
        "location_room": payload.location_room,
        "location_details": payload.location_details,
        "attachments": payload.attachments or [],
        "priority": priority,
        "status": "pending",
        "assigned_to_id": None,
        "assigned_to_name": None,
        "duplicate_of": None,
        "upvotes": 1,
        "upvoter_ids": [payload.reporter_id],
        "is_food_hygiene": is_food_hygiene,
        "food_hygiene_data": payload.food_hygiene_data or {},
        "created_at": now_iso,
        "updated_at": now_iso,
        "history": [
            {
                "status": "pending",
                "changed_by_name": payload.reporter_name,
                "changed_by_role": "student",
                "note": "Issue reported via Student Portal.",
                "timestamp": now_iso
            }
        ]
    }

    COMPLAINTS_DB.insert(0, new_complaint)

    # If priority is urgent, generate fast-track admin alert notification
    if priority == "urgent":
        NOTIFICATIONS_DB.insert(0, {
            "id": f"notif-{str(uuid.uuid4())[:8]}",
            "user_id": f"adm-{department_id}-001",
            "complaint_id": complaint_id,
            "title": f"🚨 FAST-TRACK: Urgent Complaint {ticket_num}",
            "message": f"Critical issue in {payload.location_building}: {payload.title}",
            "type": "urgent_assignment",
            "is_read": False,
            "created_at": now_iso
        })

    return new_complaint

@app.get("/api/complaints/{complaint_id}")
def get_complaint_detail(complaint_id: str):
    """Retrieve full details of a specific complaint."""
    for c in COMPLAINTS_DB:
        if c.get("id") == complaint_id or c.get("ticket_number") == complaint_id:
            return c
    raise HTTPException(status_code=404, detail="Complaint not found")

@app.patch("/api/complaints/{complaint_id}/status")
def update_complaint_status(complaint_id: str, payload: StatusUpdateRequest):
    """
    Admin status update workflow (assigned, in_progress, resolved).
    Attaches resolution proof and appends to status timeline.
    """
    target = None
    for c in COMPLAINTS_DB:
        if c.get("id") == complaint_id:
            target = c
            break

    if not target:
        raise HTTPException(status_code=404, detail="Complaint not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    old_status = target["status"]
    new_status = payload.status

    target["status"] = new_status
    target["updated_at"] = now_iso

    if payload.assigned_to_name:
        target["assigned_to_name"] = payload.assigned_to_name
        target["assigned_to_id"] = payload.assigned_to_id

    if new_status == "resolved":
        target["resolved_at"] = now_iso
        if payload.resolution_note:
            target["resolution_note"] = payload.resolution_note
        if payload.resolution_photo:
            target["resolution_photo"] = payload.resolution_photo

        # Notify the reporting student for Closed-Loop Verification
        NOTIFICATIONS_DB.insert(0, {
            "id": f"notif-{str(uuid.uuid4())[:8]}",
            "user_id": target.get("reporter_id"),
            "complaint_id": target.get("id"),
            "title": f"Fix Ready for Verification: {target.get('ticket_number')}",
            "message": f"Department has marked '{target.get('title')}' as resolved. Please review and confirm or reopen.",
            "type": "resolution_ready",
            "is_read": False,
            "created_at": now_iso
        })

    # Record history
    history_entry = {
        "status": new_status,
        "changed_by_name": payload.changed_by_name,
        "changed_by_role": payload.changed_by_role,
        "note": payload.note or f"Status changed from {old_status} to {new_status}",
        "timestamp": now_iso
    }
    if "history" not in target:
        target["history"] = []
    target["history"].append(history_entry)

    return target

@app.post("/api/complaints/{complaint_id}/verify")
def verify_complaint_resolution(complaint_id: str, payload: VerificationRequest):
    """
    Closed-loop Student Verification:
    - confirm: Student confirms the fix -> status changes to 'closed'
    - reopen: Student reports the problem persists -> status changes to 'reopened'
    """
    target = None
    for c in COMPLAINTS_DB:
        if c.get("id") == complaint_id:
            target = c
            break

    if not target:
        raise HTTPException(status_code=404, detail="Complaint not found")

    now_iso = datetime.now(timezone.utc).isoformat()

    if payload.action == "confirm":
        target["status"] = "closed"
        target["closed_at"] = now_iso
        target["updated_at"] = now_iso
        note = payload.note or "Student verified and confirmed satisfactory resolution."
        target["history"].append({
            "status": "closed",
            "changed_by_name": payload.verified_by_name,
            "changed_by_role": "student",
            "note": note,
            "timestamp": now_iso
        })
    elif payload.action == "reopen":
        target["status"] = "reopened"
        target["reopen_reason"] = payload.reopen_reason or payload.note or "Issue still recurring or incomplete."
        target["updated_at"] = now_iso
        target["history"].append({
            "status": "reopened",
            "changed_by_name": payload.verified_by_name,
            "changed_by_role": "student",
            "note": f"REOPENED by student: {target['reopen_reason']}",
            "timestamp": now_iso
        })

        # Alert the admin
        NOTIFICATIONS_DB.insert(0, {
            "id": f"notif-{str(uuid.uuid4())[:8]}",
            "user_id": target.get("assigned_to_id") or f"adm-{target.get('department_id')}-001",
            "complaint_id": target.get("id"),
            "title": f"⚠️ Ticket Reopened: {target.get('ticket_number')}",
            "message": f"Student Alex Rivera reported unresolved issue: {target['reopen_reason']}",
            "type": "ticket_reopened",
            "is_read": False,
            "created_at": now_iso
        })
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'confirm' or 'reopen'.")

    return target

@app.post("/api/complaints/{complaint_id}/upvote")
def upvote_complaint(complaint_id: str, payload: UpvoteRequest):
    """Allows students to upvote an existing open complaint instead of duplicating."""
    target = None
    for c in COMPLAINTS_DB:
        if c.get("id") == complaint_id:
            target = c
            break

    if not target:
        raise HTTPException(status_code=404, detail="Complaint not found")

    upvoter_ids = target.get("upvoter_ids", [])
    if payload.user_id in upvoter_ids:
        # Toggle off
        upvoter_ids.remove(payload.user_id)
        target["upvotes"] = max(1, target.get("upvotes", 1) - 1)
        action = "removed"
    else:
        # Upvote
        upvoter_ids.append(payload.user_id)
        target["upvotes"] = target.get("upvotes", 0) + 1
        action = "added"

    target["upvoter_ids"] = upvoter_ids
    return {
        "complaint_id": complaint_id,
        "upvotes": target["upvotes"],
        "action": action
    }

# --- SLA AUTO-ESCALATION ENGINE ---

@app.post("/api/escalation/run")
def run_escalation_endpoint():
    """
    Executes SLA evaluation across all pending/assigned tickets.
    Auto-escalates any tickets exceeding the priority SLA threshold.
    """
    escalated_items, generated_notifs = check_and_escalate_complaints(COMPLAINTS_DB)
    NOTIFICATIONS_DB.extend(generated_notifs)
    return {
        "status": "success",
        "escalated_count": len(escalated_items),
        "escalated_tickets": [c.get("ticket_number") for c in escalated_items],
        "evaluated_at": datetime.now(timezone.utc).isoformat()
    }

# --- ANALYTICS & CAMPUS HEATMAP ---

@app.get("/api/analytics/overview")
def get_analytics_overview():
    """Comprehensive performance and resolution metrics."""
    total = len(COMPLAINTS_DB)
    resolved = len([c for c in COMPLAINTS_DB if c.get("status") in ["resolved", "closed"]])
    open_count = total - resolved
    escalated = len([c for c in COMPLAINTS_DB if c.get("status") == "escalated" or c.get("is_escalated")])
    urgent_count = len([c for c in COMPLAINTS_DB if c.get("priority") == "urgent"])

    # Average resolution time computation (hours)
    resolution_times = []
    for c in COMPLAINTS_DB:
        if c.get("resolved_at") and c.get("created_at"):
            try:
                c_dt = datetime.fromisoformat(c["created_at"].replace("Z", "+00:00"))
                r_dt = datetime.fromisoformat(c["resolved_at"].replace("Z", "+00:00"))
                hrs = max(0.5, (r_dt - c_dt).total_seconds() / 3600.0)
                resolution_times.append(hrs)
            except Exception:
                pass

    avg_res_time = round(sum(resolution_times) / len(resolution_times), 1) if resolution_times else 4.2

    # Department breakdown
    dept_counts = {}
    for d in DEPARTMENTS:
        dept_counts[d["id"]] = {
            "name": d["name"],
            "total": 0,
            "open": 0,
            "resolved": 0
        }

    for c in COMPLAINTS_DB:
        d_id = c.get("department_id", "civil_maintenance")
        if d_id in dept_counts:
            dept_counts[d_id]["total"] += 1
            if c.get("status") in ["resolved", "closed"]:
                dept_counts[d_id]["resolved"] += 1
            else:
                dept_counts[d_id]["open"] += 1

    return {
        "total_complaints": total,
        "resolved_complaints": resolved,
        "open_complaints": open_count,
        "escalated_complaints": escalated,
        "urgent_complaints": urgent_count,
        "avg_resolution_time_hours": avg_res_time,
        "resolution_rate_percent": round((resolved / total * 100), 1) if total > 0 else 0,
        "departments": dept_counts
    }

@app.get("/api/analytics/heatmap")
def get_campus_heatmap():
    """
    Provides building-level complaint density and severity for the campus problem heatmap.
    """
    buildings = {
        "Engineering Block A": {"x": 22, "y": 30, "zone": "Academic North", "floors": 4},
        "Science Center": {"x": 45, "y": 28, "zone": "Science Quad", "floors": 3},
        "Central Library": {"x": 50, "y": 55, "zone": "Central Commons", "floors": 4},
        "Main Cafeteria & Dining Hall": {"x": 75, "y": 42, "zone": "Dining & Recreation", "floors": 2},
        "Hostel Block 4": {"x": 80, "y": 78, "zone": "Residential South", "floors": 5},
        "Hostel Block 2": {"x": 25, "y": 80, "zone": "Residential West", "floors": 4},
        "Lecture Hall Complex": {"x": 35, "y": 50, "zone": "Academic Central", "floors": 3}
    }

    heatmap_data = []
    for b_name, b_meta in buildings.items():
        b_complaints = [c for c in COMPLAINTS_DB if c.get("location_building") == b_name]
        urgent_in_building = len([c for c in b_complaints if c.get("priority") == "urgent"])
        open_in_building = len([c for c in b_complaints if c.get("status") not in ["resolved", "closed"]])

        # Density score calculation: base count + urgent weight (x3)
        density_score = len(b_complaints) + (urgent_in_building * 3)

        if density_score >= 10:
            heat_level = "critical"  # Red
        elif density_score >= 5:
            heat_level = "warning"   # Orange
        elif density_score >= 2:
            heat_level = "moderate"  # Yellow
        else:
            heat_level = "low"       # Green

        top_categories = {}
        for c in b_complaints:
            cat = c.get("category", "Other")
            top_categories[cat] = top_categories.get(cat, 0) + 1

        sorted_cats = sorted(top_categories.items(), key=lambda x: x[1], reverse=True)

        heatmap_data.append({
            "building": b_name,
            "coords": {"x": b_meta["x"], "y": b_meta["y"]},
            "zone": b_meta["zone"],
            "floors": b_meta["floors"],
            "total_complaints": len(b_complaints),
            "open_complaints": open_in_building,
            "urgent_complaints": urgent_in_building,
            "density_score": density_score,
            "heat_level": heat_level,
            "top_category": sorted_cats[0][0] if sorted_cats else "None",
            "complaints": [
                {
                    "id": c.get("id"),
                    "ticket_number": c.get("ticket_number"),
                    "title": c.get("title"),
                    "priority": c.get("priority"),
                    "status": c.get("status"),
                    "floor": c.get("location_floor")
                }
                for c in b_complaints
            ]
        })

    return heatmap_data

# --- FOOD HYGIENE SPECIALIZED MODULE ---

@app.get("/api/food-hygiene/checklist-items")
def get_food_hygiene_checklist_schema():
    """Returns the standardized food hygiene inspection checklist."""
    return CHECKLIST_ITEMS

@app.get("/api/food-hygiene/inspections")
def list_food_inspections():
    """Lists all food hygiene inspection audits and compliance scores."""
    return sorted(INSPECTIONS_DB, key=lambda x: x.get("inspection_date", ""), reverse=True)

@app.post("/api/food-hygiene/inspections", status_code=status.HTTP_201_CREATED)
def submit_food_inspection(payload: InspectionCreate):
    """
    Submits a new food safety audit inspection.
    Computes score, generates compliance status, and saves record.
    """
    record = create_inspection_record(
        facility_name=payload.facility_name,
        inspector_name=payload.inspector_name,
        checklist_answers=payload.checklist,
        notes=payload.notes or "",
        corrective_actions=payload.corrective_actions or "",
        complaint_id=payload.complaint_id
    )
    INSPECTIONS_DB.insert(0, record)
    return record

# --- NOTIFICATIONS ---

@app.get("/api/notifications")
def get_notifications(user_id: Optional[str] = None):
    """Retrieve notifications, optionally filtered by user ID."""
    if user_id:
        return [n for n in NOTIFICATIONS_DB if n.get("user_id") == user_id]
    return NOTIFICATIONS_DB

@app.patch("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str):
    """Marks a notification as read."""
    for n in NOTIFICATIONS_DB:
        if n.get("id") == notification_id:
            n["is_read"] = True
            return n
    raise HTTPException(status_code=404, detail="Notification not found")

# --- RESET DEMO DATA ---

@app.post("/api/seed/reset")
def reset_demo_data():
    """Restores realistic seed complaints and inspections for demo resets."""
    global COMPLAINTS_DB, INSPECTIONS_DB
    COMPLAINTS_DB = generate_seed_complaints()
    INSPECTIONS_DB = generate_seed_inspections()
    return {"status": "reset_successful", "complaints_count": len(COMPLAINTS_DB)}
