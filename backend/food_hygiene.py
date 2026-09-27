"""
FixMyCampus - Specialized Food Hygiene Module
Provides inspection checklist workflows, health score computation,
and compliance logging for campus dining halls, cafeterias, and food kiosks.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
import uuid

CHECKLIST_ITEMS = [
    {
        "id": "storage_temp",
        "category": "Food Storage",
        "label": "Cold Storage & Hot Holding Temperatures",
        "description": "Refrigeration at ≤ 4°C, freezers at ≤ -18°C, hot holding at ≥ 60°C",
        "weight": 20
    },
    {
        "id": "cross_contamination",
        "category": "Preparation",
        "label": "Segregation of Raw & Cooked Items",
        "description": "Dedicated color-coded cutting boards, separate knives, and safe prep surfaces",
        "weight": 15
    },
    {
        "id": "pest_control",
        "category": "Pest & Vector",
        "label": "Absence of Pests & Insects",
        "description": "Functional fly catchers, sealed windows, zero signs of rodents or roaches",
        "weight": 20
    },
    {
        "id": "water_quality",
        "category": "Water & Ice",
        "label": "RO Drinking Water & Filter Certification",
        "description": "Certified water filtration, clean ice machines, and TDS levels logged",
        "weight": 15
    },
    {
        "id": "staff_hygiene",
        "category": "Personal Hygiene",
        "label": "Staff PPE, Hairnets & Clean Attire",
        "description": "Hairnets, clean gloves, aprons worn, no exposed cuts or illness",
        "weight": 15
    },
    {
        "id": "waste_drainage",
        "category": "Sanitation",
        "label": "Waste Disposal & Grease Trap Sanitation",
        "description": "Covered foot-operated trash bins, clean grease traps, unclogged drains",
        "weight": 15
    }
]

def calculate_hygiene_score(checklist_answers: Dict[str, bool]) -> Dict[str, Any]:
    """
    Computes weighted score from checklist answers.
    """
    total_score = 0
    passed_items = []
    failed_items = []

    for item in CHECKLIST_ITEMS:
        item_id = item["id"]
        is_passed = checklist_answers.get(item_id, False)
        if is_passed:
            total_score += item["weight"]
            passed_items.append(item["label"])
        else:
            failed_items.append(item["label"])

    if total_score >= 90:
        grade = "A (Excellent)"
        status = "compliant"
    elif total_score >= 75:
        grade = "B (Satisfactory)"
        status = "compliant"
    elif total_score >= 60:
        grade = "C (Notice Issued)"
        status = "warning_issued"
    else:
        grade = "F (Critical Violation)"
        status = "immediate_closure_ordered"

    return {
        "score": total_score,
        "grade": grade,
        "status": status,
        "passed_items": passed_items,
        "failed_items": failed_items,
        "requires_reinspection": total_score < 75
    }

def create_inspection_record(
    facility_name: str,
    inspector_name: str,
    checklist_answers: Dict[str, bool],
    notes: str,
    corrective_actions: str,
    complaint_id: str = None
) -> Dict[str, Any]:
    """Creates a full inspection record with score calculation."""
    result = calculate_hygiene_score(checklist_answers)
    
    return {
        "id": str(uuid.uuid4()),
        "complaint_id": complaint_id,
        "facility_name": facility_name,
        "inspector_name": inspector_name,
        "inspection_date": datetime.now(timezone.utc).isoformat(),
        "checklist": checklist_answers,
        "score": result["score"],
        "grade": result["grade"],
        "status": result["status"],
        "notes": notes,
        "corrective_actions": corrective_actions,
        "requires_reinspection": result["requires_reinspection"]
    }
