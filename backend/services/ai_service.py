import os
import json
from pydantic import BaseModel, Field
import requests

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

class AIAnalysisResult(BaseModel):
    category: str = Field(description="The category of the issue (e.g., Electrical, Plumbing, IT & Wi-Fi, Food Services, Hostel Affairs)")
    severity: str = Field(description="The severity of the issue: LOW, MEDIUM, HIGH, or URGENT")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")
    urgency: str = Field(description="Urgency: LOW, MEDIUM, HIGH, or URGENT")
    safety_risk: bool = Field(description="True if the issue poses a physical safety risk")
    estimated_affected_people: int = Field(description="Estimated number of people affected based on location and issue type")
    reason: str = Field(description="A brief explanation for the chosen severity and urgency")

def analyze_complaint(title: str, description: str, location: str) -> dict:
    if not GROQ_API_KEY:
        # Fallback deterministic analysis if no key is provided
        return _deterministic_fallback(title, description, location)
        
    system_prompt = """You are an expert AI campus facility management system.
Your job is to analyze a student's facility complaint and output a precise JSON analysis.
Evaluate the severity, urgency, safety risks, and estimated impact.
Output ONLY valid JSON matching this exact structure:
{
  "category": "Electrical",
  "severity": "URGENT",
  "confidence": 0.95,
  "urgency": "URGENT",
  "safety_risk": true,
  "estimated_affected_people": 15,
  "reason": "Exposed wires and sparking pose immediate fire and electrocution hazards."
}"""

    user_prompt = f"Title: {title}\nDescription: {description}\nLocation: {location}\n\nPlease analyze this issue and output JSON."

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # We use openai/gpt-oss-20b
    payload = {
        "model": "openai/gpt-oss-20b",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1
    }
    
    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=10)
        if response.status_code != 200:
            print(f"Groq API Error {response.status_code}: {response.text}")
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        # Parse the JSON response
        parsed = json.loads(content)
        
        # Enforce schema structure manually for reliability
        return {
            "category": str(parsed.get("category", "General")),
            "severity": str(parsed.get("severity", "MEDIUM")).upper(),
            "confidence": float(parsed.get("confidence", 0.85)),
            "urgency": str(parsed.get("urgency", "MEDIUM")).upper(),
            "safety_risk": bool(parsed.get("safety_risk", False)),
            "estimated_affected_people": int(parsed.get("estimated_affected_people", 1)),
            "reason": str(parsed.get("reason", "AI analyzed severity based on keywords."))
        }
    except Exception as e:
        print(f"Groq API Error: {e}")
        return _deterministic_fallback(title, description, location)

def enhance_description(title: str, description: str) -> str:
    if not GROQ_API_KEY:
        return description
        
    system_prompt = """You are an AI assistant that improves the clarity, grammar, and professionalism of facility complaints.
Fix typos and structure the text better. DO NOT change the factual meaning or location.
Output ONLY the enhanced description text."""

    user_prompt = f"Original Title: {title}\nOriginal Description: {description}"
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "openai/gpt-oss-20b",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.3
    }
    
    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Groq Enhance API Error: {e}")
        return description

def _deterministic_fallback(title: str, description: str, location: str) -> dict:
    """Fallback if Groq is unavailable."""
    combined = f"{title} {description} {location}".lower()
    
    safety_risk = any(word in combined for word in ["fire", "spark", "shock", "blood", "glass", "trapped", "gas"])
    
    if safety_risk:
        severity = "URGENT"
        urgency = "URGENT"
    elif any(word in combined for word in ["water", "leak", "power", "outage", "blackout", "offline"]):
        severity = "HIGH"
        urgency = "HIGH"
    else:
        severity = "MEDIUM"
        urgency = "MEDIUM"
        
    category = "General"
    if any(word in combined for word in ["wifi", "internet", "network"]):
        category = "IT & Wi-Fi"
    elif any(word in combined for word in ["power", "light", "electrical", "spark"]):
        category = "Electrical"
        
    return {
        "category": category,
        "severity": severity,
        "confidence": 0.75,
        "urgency": urgency,
        "safety_risk": safety_risk,
        "estimated_affected_people": 5 if severity == "HIGH" else 1,
        "reason": "Analyzed using local deterministic fallback engine due to API unavailability."
    }
