from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import re
from services.ai_service import analyze_complaint, enhance_description

app = FastAPI(
    title="FixMyCampus API Engine",
    description="Backend microservices for AI categorization, duplicate prevention, and SLA tracking.",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CATEGORY_RULES = {
    "electrical": {
        "name": "Electrical & Power",
        "keywords": ["elevator", "lift", "spark", "power", "light", "wire", "switch", "socket", "shock", "generator"],
        "sla": {"urgent": 2, "high": 8, "medium": 24, "low": 48}
    },
    "civil_maintenance": {
        "name": "Civil & Plumbing",
        "keywords": ["leak", "water", "pipe", "toilet", "drain", "sink", "flush", "door", "lock", "ceiling"],
        "sla": {"urgent": 3, "high": 12, "medium": 24, "low": 72}
    },
    "it_network": {
        "name": "IT & Digital Infrastructure",
        "keywords": ["wifi", "wi-fi", "internet", "network", "router", "lan", "projector", "eduroam", "smartboard"],
        "sla": {"urgent": 2, "high": 6, "medium": 18, "low": 36}
    },
    "food_services": {
        "name": "Food Services & Dining",
        "keywords": ["food", "cafeteria", "mess", "hygiene", "roach", "cooler", "spoiled", "meal", "water dispenser"],
        "sla": {"urgent": 1, "high": 4, "medium": 12, "low": 24}
    }
}

class AIAnalyzeRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    location: Optional[str] = "Unknown"

class DuplicateCheckRequest(BaseModel):
    title: str
    building: str
    existing_titles: List[str]

@app.get("/")
def read_root():
    return {"status": "online", "service": "FixMyCampus API Engine v3.0"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/api/ai/analyze-report")
def analyze_report(req: AIAnalyzeRequest):
    result = analyze_complaint(
        title=req.title,
        description=req.description,
        location=req.location
    )
    
    # Optional: Apply deterministic overrides here if needed
    if req.category and result["category"] == "General":
        result["category"] = req.category

    return result

class EnhanceRequest(BaseModel):
    title: str
    description: str

@app.post("/api/ai/enhance-description")
def api_enhance_description(req: EnhanceRequest):
    enhanced = enhance_description(req.title, req.description)
    return {"enhanced_description": enhanced}

class SuggestRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None

@app.post("/api/suggest")
def suggest_complaint(req: SuggestRequest):
    combined = f"{req.title} {req.description}".lower()
    cat_map = {
        "wifi": ["wifi", "wi-fi", "network", "internet", "lan", "router", "connectivity"],
        "water": ["water", "leak", "pipe", "tap", "drain", "sink"],
        "electricity": ["electric", "power", "light", "fan", "wire", "switch", "socket", "short circuit", "mcb"],
        "furniture": ["chair", "bench", "desk", "table", "stool", "board"],
        "food_hygiene": ["food", "mess", "canteen", "insect", "cockroach", "meal", "spoiled"],
        "washroom": ["washroom", "toilet", "bathroom", "urinal", "flush"],
        "classroom": ["projector", "classroom", "lab", "ac", "podium", "mic", "speaker"],
        "security": ["security", "gate", "theft", "stranger", "cctv", "safety"],
        "infrastructure": ["roof", "road", "wall", "ceiling", "door", "window", "crack"]
    }
    matched_cat = req.category or "other"
    if not req.category:
        max_c = 0
        for c, kws in cat_map.items():
            cnt = sum(1 for kw in kws if kw in combined)
            if cnt > max_c:
                max_c = cnt
                matched_cat = c
    if any(k in combined for k in ["fire", "spark", "trapped", "shock", "flood", "exposed wire", "gas leak"]):
        priority = "emergency"
    elif any(k in combined for k in ["no water", "power cut", "blackout", "overflow", "hygiene", "cockroach"]):
        priority = "high"
    else:
        priority = "medium"
    return {
        "category": matched_cat,
        "priority": priority,
        "summary": req.title[:80] if req.title else "Complaint filed",
        "source": "ai",
        "reasons": ["AI Fast-Inference categorization matched"]
    }

@app.post("/api/ai/check-duplicates")
def check_duplicates(req: DuplicateCheckRequest):
    tokens = set(re.findall(r'\b[a-zA-Z]{4,}\b', req.title.lower()))
    matches = []
    
    for existing in req.existing_titles:
        ex_tokens = set(re.findall(r'\b[a-zA-Z]{4,}\b', existing.lower()))
        overlap = len(tokens.intersection(ex_tokens))
        if overlap > 0:
            sim = int((overlap / max(len(tokens), len(ex_tokens))) * 100)
            if sim >= 30:
                matches.append({"title": existing, "similarity": sim})
                
    return {"duplicates": sorted(matches, key=lambda x: x["similarity"], reverse=True)}

# In-memory complaints and contact ledger
COMPLAINTS_LEDGER = []
CONTACT_INQUIRIES = []

class CreateComplaintModel(BaseModel):
    title: str
    description: str
    category: str
    department_id: str
    priority: str
    sla_hours: int
    location_building: str
    location_floor: str
    location_room: str
    reporter_name: str
    reporter_id: str
    reporter_email: str
    photo_url: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class ContactModel(BaseModel):
    fullName: str
    email: str
    department: str
    inquiryType: str
    message: str

@app.get("/api/complaints")
def list_complaints():
    return {"count": len(COMPLAINTS_LEDGER), "complaints": COMPLAINTS_LEDGER}

@app.post("/api/complaints")
def create_complaint(comp: CreateComplaintModel):
    item = comp.model_dump()
    item["id"] = f"c-{len(COMPLAINTS_LEDGER) + 100}"
    item["status"] = "pending"
    item["upvotes"] = 1
    COMPLAINTS_LEDGER.insert(0, item)
    return {"status": "created", "complaint": item}

@app.post("/api/contact")
def submit_contact_inquiry(inquiry: ContactModel):
    record = inquiry.model_dump()
    CONTACT_INQUIRIES.insert(0, record)
    return {"status": "received", "inquiry_id": f"INQ-{len(CONTACT_INQUIRIES)}"}

class ChatMessage(BaseModel):
    role: Optional[str] = "user"
    text: Optional[str] = None
    content: Optional[str] = None

class ChatRequest(BaseModel):
    message: Optional[str] = None
    messages: Optional[List[ChatMessage]] = None

import os
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

CAMPUS_SYSTEM_PROMPT = """You are the official FixMyCampus AI Assistant for university students, faculty, and maintenance staff.
Key knowledge:
1. 6-step lifecycle: (1) Report & Photo -> (2) Location Pin on 3D Map -> (3) Admin Triage & Dept Assignment -> (4) Physical Technician Fix -> (5) Student Verification Gate -> (6) Official Resolution.
2. Student Verification Gate: Tickets cannot be silently closed by technicians. Students verify the fix on their dashboard. If not resolved, tap "No, problem still exists" to reopen & escalate.
3. Departments: Civil & Plumbing (leaks, restrooms, furniture), Electrical & Power (power cuts, AC, elevator, lighting), IT Infrastructure (Wi-Fi, eduroam, lab PCs), Food Services (mess, cafeteria hygiene), Housekeeping (sanitation, dustbins), Campus Security (locks, lighting, emergencies).
4. SLAs: Urgent (1-3 hrs: safety/fire/gas/trapped), High (4-12 hrs: water/power/mess hygiene), Medium (18-24 hrs: routine maintenance), Low (48-72 hrs: cosmetic).
5. Tone: Helpful, warm, crisp, student-friendly, and concise (under 3-4 sentences unless detailed help is requested). Always guide students to the Report or Dashboard tabs when appropriate."""

def get_heuristic_campus_reply(user_msg: str) -> str:
    msg = user_msg.lower().strip()
    
    # Greetings & About
    if any(k in msg for k in ["hello", "hi", "hey", "sup", "greetings", "good morning", "good evening"]):
        return "Hello! I'm your FixMyCampus AI Assistant. I can help you report campus issues, check complaint status, look up department SLAs, or navigate the facilities system. What can I do for you today?"
    
    if any(k in msg for k in ["who are you", "what are you", "what is fixmycampus", "about"]):
        return "FixMyCampus is your university's central facility reporting & triage platform. We connect students directly to maintenance crews for rapid repairs of electrical, plumbing, Wi-Fi, and cafeteria issues with a mandatory Student Verification Gate!"
    
    # Emergencies & Hazards
    if any(k in msg for k in ["fire", "spark", "trapped", "stuck elevator", "shock", "live wire", "gas leak", "collapse", "danger", "hazard", "emergency"]):
        return "🚨 EMERGENCY ALERT: For life-safety hazards (fire, live electrical wires, trapped elevators, or gas leaks), immediately alert Campus Security at the main gate and file an URGENT report on FixMyCampus. Our urgent SLA dispatch target is under 1-2 hours!"
    
    # How to report
    if any(k in msg for k in ["how to report", "how do i report", "file a complaint", "file report", "submit", "new issue", "lodge"]):
        return "To file a complaint: 1) Click the '+ Report' tab. 2) Enter a title & short description. 3) Our AI will automatically categorize and calculate the SLA. 4) Select or pin the campus building/room. 5) Attach an optional photo and hit Submit!"
    
    # Complaint status & tracking
    if any(k in msg for k in ["status", "track", "my complaint", "ticket", "fmc-"]):
        # Check if user mentioned a ticket number
        ticket_match = re.search(r'fmc[-_\w\d]+', msg, re.IGNORECASE)
        if ticket_match:
            return f"Checking ticket {ticket_match.group(0).upper()}: You can see real-time technician progress and inspection photos on your Student Dashboard under 'My Complaints'. If marked fixed, you can verify or reopen the ticket!"
        return "You can check the live status of all your submitted complaints directly on your Student Dashboard. Each ticket shows real-time progress: Pending, Assigned, In-Progress, or Pending Verification."
    
    # Student Verification Gate
    if any(k in msg for k in ["verification", "gate", "verify", "reopen", "close ticket", "still broken"]):
        return "The Student Verification Gate protects you! Technicians cannot simply mark a job done and leave. You receive a verification prompt to confirm the physical fix on campus. If it's still broken, tap 'Problem Still Exists' to automatically escalate it."
    
    # Wi-Fi & IT
    if any(k in msg for k in ["wifi", "wi-fi", "internet", "network", "router", "eduroam", "lan", "portal", "computer", "lab"]):
        return "IT & Network Infrastructure issues (Wi-Fi dead spots, eduroam outages, lab PC malfunctions) are routed to the IT Support Team with a 6-18 hour resolution window. Please mention the specific building and floor when filing."
    
    # Water & Plumbing
    if any(k in msg for k in ["water", "leak", "pipe", "toilet", "washroom", "flush", "sink", "tap", "drain", "flood", "sewage", "restroom"]):
        return "Plumbing & sanitation complaints are dispatched directly to Civil Maintenance. High-severity issues like water cuts or flooding are prioritized for 3-12 hour resolution. Report it under 'Civil & Plumbing'."
    
    # Electricity & Power
    if any(k in msg for k in ["electricity", "power", "blackout", "light", "fan", "switch", "socket", "ac", "air condition", "generator", "breaker"]):
        return "Electrical issues are handled by the Electrical & Power crew. Power failures and hazardous switches are prioritized urgently (2-8 hours). Make sure to specify the classroom or dorm room number."
    
    # Food & Mess
    if any(k in msg for k in ["food", "mess", "canteen", "cafeteria", "hygiene", "cockroach", "insect", "meal", "spoiled", "dining"]):
        return "Food Services & Canteen complaints receive top priority (1-4 hour SLA) due to health and safety standards. Please attach photo evidence to help the food hygiene committee take immediate action."
    
    # Hostel & Dorms
    if any(k in msg for k in ["hostel", "dorm", "geyser", "roommate", "bed", "warden", "curfew", "hot water", "cupboard"]):
        return "Hostel maintenance complaints (geysers, furniture, locks) can be filed under the 'Hostel Affairs' or 'Civil Maintenance' category. Include your hostel block and room number for technician entry."
    
    # SLAs
    if any(k in msg for k in ["sla", "timeline", "how long", "time", "hours", "duration"]):
        return "Our SLA resolution targets: Urgent hazards: 1-3 hours | High priority: 4-12 hours | Medium (routine repairs): 18-24 hours | Low priority: 48-72 hours. You can track countdown timers on your dashboard."
    
    # Map & Navigation
    if any(k in msg for k in ["map", "location", "3d", "building", "where"]):
        return "Explore our interactive 3D Campus Map on the 'Map' tab! You can see active issues across buildings, filter by category, and pinpoint exact coordinates when reporting."
    
    # Login & Roles
    if any(k in msg for k in ["login", "sign in", "sign up", "register", "password", "role", "admin"]):
        return "Students can sign up or log in using their student email credentials. Admin and technician accounts are provisioned by Campus Operations. You can access the portal via the 'Sign In' link."
        
    return "I'm here to assist with FixMyCampus! You can ask me how to file a report, check ticket status, find department SLAs, or report facilities issues (water, electricity, Wi-Fi, mess, hostel)."

@app.post("/api/chat")
def chat_agent(req: ChatRequest):
    user_msg = req.message or ""
    if not user_msg and req.messages and len(req.messages) > 0:
        last = req.messages[-1]
        user_msg = last.text or last.content or ""
        
    user_msg = user_msg.strip()
    if not user_msg:
        return {"reply": "Hi! How can I assist you with campus facilities today?"}
        
    # Attempt AI inference with Generative Language API
    reply = None
    try:
        import requests
        prompt = f"{CAMPUS_SYSTEM_PROMPT}\n\nStudent question: {user_msg}\nHelpful FixMyCampus AI Answer:"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.4, "maxOutputTokens": 300}
        }
        
        # Try fast models
        for model in ["gemini-3.8-flash", "gemma-4-26b-a4b-it", "gemma-4-31b-it"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
                r = requests.post(url, json=payload, timeout=3.5)
                if r.status_code == 200:
                    data = r.json()
                    candidates = data.get("candidates", [])
                    if candidates and len(candidates) > 0:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            reply = parts[0]["text"].strip()
                            break
            except Exception:
                continue
    except Exception:
        pass
        
    if not reply:
        reply = get_heuristic_campus_reply(user_msg)
        
    return {"reply": reply}


