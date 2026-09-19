import json
from sqlalchemy.orm import Session
from ..models import Intervention, InterventionFeedback, RiskEvent

def generate_intervention_for_risk(db: Session, user_id: int, risk_data: dict) -> Intervention:
    """
    Creates or retrieves an actionable intervention aligned with the detected factors.
    Uses reliable structured templates that address high workload, sleep deficit, and elevated stress.
    """
    status = risk_data.get("status", "STABLE")
    factors = risk_data.get("factors", [])
    risk_event_id = risk_data.get("risk_event_id")

    # If stable, suggest gentle maintenance or reflection
    if status == "STABLE":
        int_type = "routine"
        title = "Maintain your steady momentum"
        reason = "Your recent wellbeing signals match your personal baseline well."
        steps = [
            "Keep your regular sleep bedtime tonight.",
            "Take 5 minutes at the end of the day for mindful reflection in ReMind.",
            "Review tomorrow's tasks so you start clear and organized."
        ]
    elif "Sleep" in " ".join(factors) and "workload" in " ".join(factors).lower():
        int_type = "workload"
        title = "Optimize study blocks to protect sleep"
        reason = "Your academic workload has risen while your sleep has dropped below your normal 7.3h baseline."
        steps = [
            "Postpone one secondary task to tomorrow morning using the Simulator.",
            "Cap tonight's study session at 9:30 PM to allow a 45-minute wind-down.",
            "Do a 60-second guided breathing reset in ReMind before sleeping."
        ]
    elif "Stress" in " ".join(factors) or status == "SIGNIFICANT_CHANGE":
        int_type = "reset"
        title = "Take a 10-minute micro-recovery pause"
        reason = "Your stress level is currently elevated compared to your typical baseline."
        steps = [
            "Step away from study screens and hydrate.",
            "Complete a 60-second Guided Reset breathing cycle.",
            "Break your next large academic task into 25-minute focused intervals."
        ]
    else:
        int_type = "workload"
        title = "Rebalance upcoming study priorities"
        reason = "MindOS detected early changes in your study routine and workload."
        steps = [
            "Focus on the single highest-priority deadline first.",
            "Take a short 5-minute cognitive reset between study tasks.",
            "Mark completed tasks to reduce mental clutter."
        ]

    # Check if there is already an active (undismissed and unaccepted) intervention
    existing = db.query(Intervention).filter(
        Intervention.user_id == user_id,
        Intervention.is_dismissed == False,
        Intervention.is_accepted == None
    ).order_by(Intervention.created_at.desc()).first()

    if existing:
        return existing

    new_intervention = Intervention(
        user_id=user_id,
        risk_event_id=risk_event_id,
        type=int_type,
        title=title,
        reason=reason,
        steps=json.dumps(steps),
        is_accepted=None,
        is_dismissed=False
    )
    db.add(new_intervention)
    db.commit()
    db.refresh(new_intervention)
    return new_intervention

def record_feedback(db: Session, intervention_id: int, rating: int, helpful: str, feedback: str | None):
    entry = InterventionFeedback(
        intervention_id=intervention_id,
        rating=rating,
        helpful=helpful,
        feedback=feedback
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
