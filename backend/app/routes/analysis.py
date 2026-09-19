from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.risk_service import evaluate_mindguard_risk

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/insights")
def get_insights(db: Session = Depends(get_db)):
    risk_info = evaluate_mindguard_risk(db, 1)
    return {
        "status": risk_info["status"],
        "signal_strength": risk_info["signal_strength"],
        "headline": risk_info["headline"],
        "explanation": risk_info["explanation"],
        "factors": risk_info["factors"],
        "ml_anomaly_score": risk_info["ml_anomaly_score"],
        "is_ml_anomaly": risk_info["is_anomaly"],
        "feature_analysis": risk_info["feature_analysis"]
    }
