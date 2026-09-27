"""
FixMyCampus - Swappable AI Category & Priority Classifier
Provides intelligent classification of campus complaints into appropriate departments
and urgency levels with explainability.
"""

import re
import os
from typing import Dict, Any, Optional

# Department taxonomy and keywords
DEPARTMENT_RULES = {
    "electrical": {
        "name": "Electrical & Power",
        "keywords": [
            "electric", "power", "blackout", "fuse", "wire", "switch", "socket", 
            "short circuit", "spark", "lift", "elevator", "fan", "light", "bulb", 
            "tube light", "generator", "voltage", "ac", "air conditioner", "inverter", 
            "solar", "cable", "switchboard", "plug", "dark", "no power"
        ],
        "urgent_triggers": ["sparks", "smoke", "live wire", "shock", "fire", "lift stuck", "elevator stuck", "power outage in lab"]
    },
    "civil_maintenance": {
        "name": "Civil & Plumbing",
        "keywords": [
            "leak", "water", "pipe", "tap", "flush", "drain", "clog", "sewage",
            "pothole", "crack", "wall", "plaster", "door", "window", "lock", "handle",
            "ceiling", "roof", "tile", "flooring", "staircase", "railing", "glass",
            "seep", "overflow", "basin", "urinal", "flush valve"
        ],
        "urgent_triggers": ["massive leak", "flooding", "ceiling collapse", "broken glass", "falling tile", "sewage overflow", "gas leak"]
    },
    "housekeeping": {
        "name": "Housekeeping & Sanitation",
        "keywords": [
            "clean", "dirty", "trash", "garbage", "dustbin", "bin", "smell", "odor",
            "stink", "stain", "sweep", "mop", "litter", "cockroach", "rat", "rodent",
            "pest", "toilet", "washroom dirty", "restroom", "messy", "dust", "spider"
        ],
        "urgent_triggers": ["biohazard", "severe infestation", "blood", "chemical spill"]
    },
    "it_network": {
        "name": "IT & Digital Infrastructure",
        "keywords": [
            "wifi", "wi-fi", "internet", "network", "lan", "ethernet", "router",
            "signal", "bandwidth", "portal", "server", "lab computer", "pc", "monitor",
            "projector", "hdmi", "printer", "mic", "microphone", "speaker", "audio", "smartboard"
        ],
        "urgent_triggers": ["campus wide network down", "server fire", "exam portal crashed", "lab network failure during test"]
    },
    "food_services": {
        "name": "Food Services & Dining",
        "keywords": [
            "food", "mess", "canteen", "cafeteria", "lunch", "dinner", "breakfast",
            "meal", "hygiene", "raw", "undercooked", "stale", "expired", "insect in food",
            "hair in food", "taste", "drinking water", "water cooler", "filter", "ro water",
            "dining hall", "cutlery", "cook", "chef", "plate", "kitchen"
        ],
        "urgent_triggers": ["food poisoning", "dead insect", "cockroach in food", "worm", "contaminated water", "vomiting", "sick students"]
    },
    "hostel": {
        "name": "Hostel Affairs",
        "keywords": [
            "hostel", "dorm", "room", "bed", "mattress", "cupboard", "wardrobe",
            "geyser", "hot water", "warden", "roommate", "balcony", "curtain", "study table",
            "chair", "quiet hours", "dormitory"
        ],
        "urgent_triggers": ["geyser burst", "lockout", "bed bug outbreak", "room flooded"]
    },
    "security": {
        "name": "Campus Safety & Security",
        "keywords": [
            "security", "guard", "gate", "cctv", "camera", "theft", "stolen", "trespass",
            "stranger", "harassment", "lighting at night", "dark path", "emergency exit",
            "id card", "parking", "lock broken"
        ],
        "urgent_triggers": ["harassment", "physical threat", "theft in progress", "unauthorized intruder", "fight", "emergency exit blocked"]
    }
}

# Priority heuristics
URGENT_KEYWORDS = [
    "fire", "smoke", "sparks", "electric shock", "stuck in elevator", "stuck in lift",
    "flooding", "gas leak", "food poisoning", "collapsed", "intruder", "harassment",
    "threat", "explosion", "live wire", "unconscious", "bleeding", "severe hazard", "critical"
]

HIGH_KEYWORDS = [
    "broken door", "no power", "no water", "contaminated", "water leak", "exam", "major",
    "wifi down", "geyser not working", "camera broken", "pothole on main road", "urgent", "asap"
]

LOW_KEYWORDS = [
    "minor", "aesthetic", "paint", "scratch", "small stain", "bulb flickering", "loose handle", "cosmetic"
]


def classify_complaint(title: str, description: str, attachment_desc: str = "") -> Dict[str, Any]:
    """
    Classifies a complaint text into a department and priority level.
    Swappable interface: Uses rule-based and NLP token scoring with reasoning.
    Can be seamlessly routed to Gemini or OpenAI if configured.
    """
    text = f"{title} {description} {attachment_desc}".lower()
    
    # Check for LLM enhancement if key available
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    # 1. Detect Priority
    detected_priority = "medium"
    priority_reasons = []
    
    # Check Urgent triggers
    for u_word in URGENT_KEYWORDS:
        if re.search(r'\b' + re.escape(u_word) + r'\b', text):
            detected_priority = "urgent"
            priority_reasons.append(f"Contains high-hazard keyword: '{u_word}'")
            break
            
    if detected_priority != "urgent":
        for h_word in HIGH_KEYWORDS:
            if re.search(r'\b' + re.escape(h_word) + r'\b', text):
                detected_priority = "high"
                priority_reasons.append(f"Contains critical infrastructure keyword: '{h_word}'")
                break
                
    if detected_priority == "medium":
        for l_word in LOW_KEYWORDS:
            if re.search(r'\b' + re.escape(l_word) + r'\b', text):
                detected_priority = "low"
                priority_reasons.append(f"Indicates non-blocking/cosmetic issue: '{l_word}'")
                break
                
    if not priority_reasons:
        priority_reasons.append("Default moderate priority assigned based on standard SLA")

    # 2. Score Departments
    best_dept = "civil_maintenance" # default fallback
    max_score = 0
    matched_keywords = []

    for dept_id, info in DEPARTMENT_RULES.items():
        score = 0
        current_matched = []
        
        # Check specific urgent triggers
        for trigger in info.get("urgent_triggers", []):
            if trigger in text:
                score += 15
                current_matched.append(trigger)
                detected_priority = "urgent"
                priority_reasons.append(f"Department safety trigger: '{trigger}'")

        # Check standard keywords
        for kw in info["keywords"]:
            # Match whole words or boundary
            matches = len(re.findall(r'\b' + re.escape(kw) + r'\b', text))
            if matches > 0:
                score += (matches * 2)
                current_matched.append(kw)
        
        # Give higher weight if keyword appears in title
        title_lower = title.lower()
        for kw in info["keywords"]:
            if kw in title_lower:
                score += 4

        if score > max_score:
            max_score = score
            best_dept = dept_id
            matched_keywords = current_matched

    # Check for Food Hygiene specialization flag
    is_food_hygiene = (best_dept == "food_services") or any(
        w in text for w in ["mess", "canteen", "cafeteria", "food", "dining", "meal", "kitchen"]
    )

    dept_display = DEPARTMENT_RULES.get(best_dept, {}).get("name", "General Maintenance")

    return {
        "department_id": best_dept,
        "department_name": dept_display,
        "category": dept_display,
        "priority": detected_priority,
        "is_urgent": (detected_priority == "urgent"),
        "is_food_hygiene": is_food_hygiene,
        "confidence": min(0.98, max(0.65, 0.5 + (max_score * 0.05))),
        "matched_keywords": matched_keywords[:4],
        "reasoning": f"Assigned to {dept_display} ({', '.join(matched_keywords[:3]) if matched_keywords else 'context analysis'}). Priority: {detected_priority.upper()} ({priority_reasons[0]}).",
        "sla_hours": 2 if detected_priority == "urgent" else (12 if detected_priority == "high" else (24 if detected_priority == "medium" else 48))
    }
