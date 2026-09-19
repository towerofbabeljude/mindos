import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Intervention, InterventionFeedback
from ..schemas import InterventionResponse, InterventionFeedbackCreate
from ..services.intervention_service import record_feedback

router = APIRouter(prefix="/interventions", tags=["interventions"])

@router.get("", response_model=list[InterventionResponse])
def list_interventions(limit: int = 15, db: Session = Depends(get_db)):
    items = (
        db.query(Intervention)
        .filter(Intervention.user_id == 1)
        .order_by(Intervention.created_at.desc())
        .limit(limit)
        .all()
    )
    result = []
    for it in items:
        steps_list = json.loads(it.steps) if it.steps else []
        result.append(
            InterventionResponse(
                id=it.id,
                user_id=it.user_id,
                risk_event_id=it.risk_event_id,
                type=it.type,
                title=it.title,
                reason=it.reason,
                steps=steps_list,
                is_accepted=it.is_accepted,
                is_dismissed=it.is_dismissed,
                created_at=it.created_at
            )
        )
    return result

@router.post("/{intervention_id}/action")
def take_action(intervention_id: int, action: str, db: Session = Depends(get_db)):
    """action can be 'accept' or 'dismiss'"""
    item = db.query(Intervention).filter(Intervention.id == intervention_id, Intervention.user_id == 1).first()
    if not item:
        raise HTTPException(status_code=404, detail="Intervention not found")

    if action == "accept":
        item.is_accepted = True
    elif action == "dismiss":
        item.is_dismissed = True
        item.is_accepted = False

    db.commit()
    return {"status": "ok", "action": action, "id": intervention_id}

@router.post("/{intervention_id}/feedback")
def submit_feedback(intervention_id: int, fb: InterventionFeedbackCreate, db: Session = Depends(get_db)):
    item = db.query(Intervention).filter(Intervention.id == intervention_id, Intervention.user_id == 1).first()
    if not item:
        raise HTTPException(status_code=404, detail="Intervention not found")

    record_feedback(db, intervention_id, fb.rating, fb.helpful, fb.feedback)
    return {"status": "ok", "message": "Thank you for your feedback! MindOS uses this to tailor future recommendations."}
