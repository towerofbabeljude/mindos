from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.demo_service import seed_demo_data

router = APIRouter(prefix="/demo", tags=["demo"])

@router.post("/seed")
def trigger_seed(mode: str = "stressful", db: Session = Depends(get_db)):
    """
    mode can be 'normal' (healthy balanced baseline)
    or 'stressful' (burnout risk trigger demo)
    """
    result = seed_demo_data(db, mode=mode)
    return result
