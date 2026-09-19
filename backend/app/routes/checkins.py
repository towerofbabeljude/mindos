import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import DailyCheckIn
from ..schemas import CheckInCreate, CheckInResponse
from ..services.baseline_service import calculate_user_baselines
from ..services.risk_service import evaluate_mindguard_risk
from ..services.intervention_service import generate_intervention_for_risk

router = APIRouter(prefix="/checkins", tags=["checkins"])

@router.get("", response_model=list[CheckInResponse])
def list_checkins(limit: int = 30, db: Session = Depends(get_db)):
    items = (
        db.query(DailyCheckIn)
        .filter(DailyCheckIn.user_id == 1)
        .order_by(DailyCheckIn.date.desc())
        .limit(limit)
        .all()
    )
    result = []
    for it in items:
        tags_list = []
        try:
            tags_list = json.loads(it.tags) if it.tags else []
        except Exception:
            pass
        result.append(
            CheckInResponse(
                id=it.id,
                user_id=it.user_id,
                date=it.date,
                stress=it.stress,
                energy=it.energy,
                sleep_hours=it.sleep_hours,
                workload=it.workload,
                social_connection=it.social_connection,
                productivity=it.productivity,
                happiness=getattr(it, 'happiness', 7.0) or 7.0,
                tags=tags_list,
                notes=it.notes,
                created_at=it.created_at
            )
        )
    return result

@router.post("", response_model=CheckInResponse)
def submit_checkin(checkin_in: CheckInCreate, db: Session = Depends(get_db)):
    date_str = checkin_in.date or datetime.utcnow().strftime("%Y-%m-%d")

    # Check if entry exists for this date, update or create
    existing = (
        db.query(DailyCheckIn)
        .filter(DailyCheckIn.user_id == 1, DailyCheckIn.date == date_str)
        .first()
    )

    tags_str = json.dumps(checkin_in.tags)

    if existing:
        existing.stress = checkin_in.stress
        existing.energy = checkin_in.energy
        existing.sleep_hours = checkin_in.sleep_hours
        existing.workload = checkin_in.workload
        existing.social_connection = checkin_in.social_connection
        existing.productivity = checkin_in.productivity
        existing.happiness = checkin_in.happiness
        existing.tags = tags_str
        existing.notes = checkin_in.notes
        entry = existing
    else:
        entry = DailyCheckIn(
            user_id=1,
            date=date_str,
            stress=checkin_in.stress,
            energy=checkin_in.energy,
            sleep_hours=checkin_in.sleep_hours,
            workload=checkin_in.workload,
            social_connection=checkin_in.social_connection,
            productivity=checkin_in.productivity,
            happiness=checkin_in.happiness,
            tags=tags_str,
            notes=checkin_in.notes
        )
        db.add(entry)

    db.commit()
    db.refresh(entry)

    # Trigger baseline & MindGuard update
    calculate_user_baselines(db, 1)
    risk_info = evaluate_mindguard_risk(db, 1)
    generate_intervention_for_risk(db, 1, risk_info)

    tags_list = json.loads(entry.tags) if entry.tags else []
    return CheckInResponse(
        id=entry.id,
        user_id=entry.user_id,
        date=entry.date,
        stress=entry.stress,
        energy=entry.energy,
        sleep_hours=entry.sleep_hours,
        workload=entry.workload,
        social_connection=entry.social_connection,
        productivity=entry.productivity,
        happiness=getattr(entry, 'happiness', 7.0) or 7.0,
        tags=tags_list,
        notes=entry.notes,
        created_at=entry.created_at
    )
