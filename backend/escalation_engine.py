"""
FixMyCampus - SLA Auto-Escalation Engine
Monitors open complaints against Service Level Agreements (SLAs) and automatically
escalates breached tickets to higher campus authorities.
"""

from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Tuple, Optional

DEFAULT_SLAS = {
    "urgent": 2,    # 2 hours
    "high": 12,     # 12 hours
    "medium": 24,   # 24 hours
    "low": 48       # 48 hours
}

def parse_iso(ts: str) -> datetime:
    """Parse ISO timestamp string safely into UTC datetime."""
    try:
        # Handle trailing Z or offsets
        if ts.endswith("Z"):
            ts = ts[:-1] + "+00:00"
        return datetime.fromisoformat(ts).astimezone(timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)

def check_and_escalate_complaints(
    complaints: List[Dict[str, Any]],
    now: Optional[datetime] = None
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Checks all complaints for SLA breach and escalates eligible ones.
    Returns: (escalated_tickets, generated_notifications)
    """
    if now is None:
        now = datetime.now(timezone.utc)

    escalated = []
    notifications = []

    for c in complaints:
        status = c.get("status", "")
        # Only pending or assigned complaints are subject to initial response SLA escalation
        if status in ["pending", "assigned"]:
            priority = c.get("priority", "medium").lower()
            sla_hours = DEFAULT_SLAS.get(priority, 24)
            created_dt = parse_iso(c.get("created_at", now.isoformat()))
            
            elapsed_hours = (now - created_dt).total_seconds() / 3600.0

            if elapsed_hours >= sla_hours:
                # Mark as escalated
                c["status"] = "escalated"
                c["updated_at"] = now.isoformat()
                c["is_escalated"] = True
                c["escalated_at"] = now.isoformat()
                c["escalation_reason"] = f"Breached {priority.upper()} SLA threshold of {sla_hours}h (Pending for {round(elapsed_hours, 1)}h)"
                
                escalated.append(c)

                # Generate notification
                notifications.append({
                    "user_id": c.get("reporter_id"),
                    "complaint_id": c.get("id"),
                    "title": f"⚠️ Ticket {c.get('ticket_number')} Auto-Escalated",
                    "message": f"Your complaint '{c.get('title')}' exceeded the {priority} SLA ({sla_hours}h) and has been escalated to the Campus Operations Director.",
                    "type": "escalation"
                })

    return escalated, notifications
