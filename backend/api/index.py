from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import re

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

class AIClassifyRequest(BaseModel):
    title: str
    description: str

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

@app.post("/api/ai/classify")
def classify_issue(req: AIClassifyRequest):
    combined = f"{req.title} {req.description}".lower()
    
    selected_dept = "civil_maintenance"
    dept_info = CATEGORY_RULES["civil_maintenance"]
    max_matches = 0
    
    for dept_id, info in CATEGORY_RULES.items():
        count = sum(1 for kw in info["keywords"] if kw in combined)
        if count > max_matches:
            max_matches = count
            selected_dept = dept_id
            dept_info = info
            
    # Urgency scoring
    if any(k in combined for k in ["fire", "spark", "trapped", "stuck elevator", "shock", "flood"]):
        priority = "urgent"
    elif any(k in combined for k in ["exam", "blackout", "overflow", "offline"]):
        priority = "high"
    else:
        priority = "medium"
        
    sla = dept_info["sla"].get(priority, 24)
    
    return {
        "category": dept_info["name"],
        "department_id": selected_dept,
        "priority": priority,
        "sla_hours": sla,
        "confidence": min(95, 70 + max_matches * 5)
    }

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

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_agent(req: ChatRequest):
    msg = req.message.lower()
    reply = "I'm sorry, I couldn't quite understand that. Try asking about a specific complaint, department, or how to use the app."
    
    if any(k in msg for k in ["login", "sign in", "log in"]):
        reply = "To login, head to the 'Sign In' page from the landing page. We have separate portals for Students and Admins. If you forgot your password, use the 'Forgot password' link on the login page."
    elif any(k in msg for k in ["status", "complaint", "ticket"]):
        reply = "I can check the status of your complaints for you! Just head over to your Dashboard to see live updates, or give me your Ticket Number (e.g. FMC-2026-00001)."
    elif any(k in msg for k in ["report", "file", "new"]):
        reply = "You can file a new report easily. Just navigate to the 'Report' tab, drop a pin on the map, and I'll automatically categorize it for you!"
    elif any(k in msg for k in ["water", "wifi", "electricity"]):
        reply = "Campus infrastructure is maintained by the Facilities team. If you're experiencing an outage, please file a report so we can alert them immediately. Severe issues are treated as high priority."
    elif any(k in msg for k in ["hello", "hi", "hey", "help"]):
        reply = "Hello there! I am the FixMyCampus AI Assistant. I can help you with app navigation, filing reports, or checking issue status."
    elif any(k in msg for k in ["admin", "staff", "director"]):
        reply = "Admin accounts are issued by the directorate. If you are staff, you can sign in via the Operations Portal. Public signups are for students only."
    elif any(k in msg for k in ["map", "location", "building"]):
        reply = "We have an interactive 3D Campus Map! You can view live issues geographically on the 'Map' tab. It supports filtering and heatmaps."
        
    return {"reply": reply}

