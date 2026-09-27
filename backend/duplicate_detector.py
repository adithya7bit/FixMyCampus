"""
FixMyCampus - Duplicate Detection Module
Performs semantic and location-based duplicate detection for campus complaints.
Prevents duplicate tickets and allows students to upvote existing issues.
"""

import re
from typing import List, Dict, Any, Optional

def tokenize(text: str) -> set:
    """Extract clean lowercase alphanumeric tokens."""
    tokens = re.findall(r'\b[a-z0-9]{3,}\b', text.lower())
    # Exclude common stop words
    stopwords = {"the", "and", "for", "with", "this", "that", "there", "from", "have", "has", "not", "are", "was", "been"}
    return {t for t in tokens if t not in stopwords}

def jaccard_similarity(set1: set, set2: set) -> float:
    """Compute Jaccard similarity coefficient between two sets."""
    if not set1 or not set2:
        return 0.0
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union > 0 else 0.0

def find_duplicates(
    new_title: str,
    new_description: str,
    building: str,
    floor: str,
    room: str,
    existing_complaints: List[Dict[str, Any]],
    threshold: float = 0.35
) -> List[Dict[str, Any]]:
    """
    Scans active complaints to find potential duplicates based on location match
    and semantic token similarity.
    """
    new_text = f"{new_title} {new_description}"
    new_tokens = tokenize(new_text)
    
    matches = []

    for c in existing_complaints:
        # Ignore closed/resolved tickets older than window
        status = c.get("status", "")
        if status in ["closed"]:
            continue

        c_building = c.get("location_building", "")
        c_floor = c.get("location_floor", "")
        c_room = c.get("location_room", "")
        
        # Location matching score
        loc_score = 0.0
        if building.lower() == c_building.lower():
            loc_score += 0.4
            if floor.lower() == c_floor.lower():
                loc_score += 0.3
                if room.lower() and room.lower() == c_room.lower():
                    loc_score += 0.3

        # Text matching
        c_text = f"{c.get('title', '')} {c.get('description', '')}"
        c_tokens = tokenize(c_text)
        text_sim = jaccard_similarity(new_tokens, c_tokens)

        # Combined similarity score
        # If exact room/building matches, lower the text threshold
        final_score = (loc_score * 0.45) + (text_sim * 0.55)

        if final_score >= threshold or (loc_score >= 0.7 and text_sim >= 0.2):
            matches.append({
                "complaint_id": c.get("id"),
                "ticket_number": c.get("ticket_number"),
                "title": c.get("title"),
                "description": c.get("description"),
                "status": c.get("status"),
                "priority": c.get("priority"),
                "location": f"{c_building}, Floor {c_floor}, Room {c_room}",
                "upvotes": c.get("upvotes", 1),
                "created_at": c.get("created_at"),
                "similarity_score": round(final_score, 2),
                "reason": f"Matches location ({c_building}) and common keywords ({', '.join(list(new_tokens.intersection(c_tokens))[:3]) or 'similar context'})"
            })

    # Sort highest similarity first
    matches.sort(key=lambda x: x["similarity_score"], reverse=True)
    return matches
