from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ReMindSession
from ..schemas import ReMindSessionCreate, ReMindSessionResponse

router = APIRouter(prefix="/remind", tags=["remind"])

@router.get("/history", response_model=list[ReMindSessionResponse])
def get_remind_history(limit: int = 20, db: Session = Depends(get_db)):
    return (
        db.query(ReMindSession)
        .filter(ReMindSession.user_id == 1)
        .order_by(ReMindSession.created_at.desc())
        .limit(limit)
        .all()
    )

@router.post("/session", response_model=ReMindSessionResponse)
def record_remind_session(session_in: ReMindSessionCreate, db: Session = Depends(get_db)):
    session = ReMindSession(
        user_id=1,
        activity_type=session_in.activity_type,
        accuracy=session_in.accuracy,
        reaction_time=session_in.reaction_time,
        completion_time=session_in.completion_time,
        score=session_in.score,
        metadata_info=session_in.metadata_info
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
