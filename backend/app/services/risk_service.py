import json
from datetime import datetime
from sqlalchemy.orm import Session
from ..models import RiskEvent, AcademicTask, ReMindSession, Intervention, DailyCheckIn
from ..ml.isolation_forest import anomaly_detector
from .signal_service import compute_silent_signals

def evaluate_mindguard_risk(db: Session, user_id: int):
    """
    MindGuard aggregates SilentSignals deviations, ML Isolation Forest anomaly scores,
    and task workload pressure to assess burnout early warning signals.
    """
    feature_analysis, factors = compute_silent_signals(db, user_id)

    # Build feature vector for ML Isolation Forest
    # [sleep, sleep_diff, stress, stress_diff, workload, workload_diff, energy, energy_diff]
    sleep_f = feature_analysis.get("sleep_hours", {})
    stress_f = feature_analysis.get("stress", {})
    workload_f = feature_analysis.get("workload", {})
    energy_f = feature_analysis.get("energy", {})

    ml_vector = [
        sleep_f.get("current_7d_avg", 7.2),
        sleep_f.get("deviation", 0.0),
        stress_f.get("current_7d_avg", 3.5),
        stress_f.get("deviation", 0.0),
        workload_f.get("current_7d_avg", 4.5),
        workload_f.get("deviation", 0.0),
        energy_f.get("current_7d_avg", 7.0),
        energy_f.get("deviation", 0.0),
    ]

    is_ml_anomaly, ml_score = anomaly_detector.predict(ml_vector)

    # Check academic tasks pressure
    tasks = db.query(AcademicTask).filter(
        AcademicTask.user_id == user_id,
        AcademicTask.status != "completed"
    ).all()

    high_pri = sum(1 for t in tasks if t.priority == "high")
    total_task_hours = sum(t.estimated_hours for t in tasks)

    if high_pri >= 3:
        factors.append(f"{high_pri} high-priority deadlines are pending")
    elif total_task_hours >= 14:
        factors.append(f"Upcoming task queue exceeds {round(total_task_hours, 1)} hours")

    # Check ReMind signals (optional micro-interactions)
    recent_remind = db.query(ReMindSession).filter(
        ReMindSession.user_id == user_id
    ).order_by(ReMindSession.created_at.desc()).limit(3).all()

    if recent_remind:
        avg_acc = sum(r.accuracy for r in recent_remind) / len(recent_remind)
        if avg_acc < 0.65:
            factors.append("Recent ReMind focus micro-interaction accuracy varied from normal")

    # Crunch Mode detection: stress >= 8 for more than 3 consecutive recent days
    recent_checkins_for_crunch = (
        db.query(DailyCheckIn)
        .filter(DailyCheckIn.user_id == user_id)
        .order_by(DailyCheckIn.date.desc())
        .limit(7)
        .all()
    )
    crunch_streak = 0
    is_crunch_mode = False
    for ci in recent_checkins_for_crunch:
        if ci.stress >= 8.0:
            crunch_streak += 1
        else:
            break  # streak broken, stop counting
    if crunch_streak > 3:
        is_crunch_mode = True
        if "🚨 Crunch Mode active: stress severely elevated for over 3 days" not in factors:
            factors.append("🚨 Crunch Mode active: stress severely elevated for over 3 days")

    # Aggregate signal strength (weighted score between 0.0 and 1.0)
    # ML score (40%) + factor count (40%) + workload pressure (20%)
    factor_weight = min(len(factors) * 0.20, 0.40)
    workload_weight = min(total_task_hours / 25.0 * 0.20, 0.20)
    ml_weight = ml_score * 0.40

    signal_strength = round(min(factor_weight + workload_weight + ml_weight, 0.98), 2)

    # Categorize product status
    if signal_strength >= 0.70 or len(factors) >= 3 or (is_ml_anomaly and signal_strength >= 0.60):
        status = "SIGNIFICANT_CHANGE"
        headline = "Noticeable routine & workload shift detected"
        explanation = "Multiple signals show meaningful deviation from your personal baseline. We recommend taking a proactive pause or restructuring your tasks."
    elif signal_strength >= 0.45 or len(factors) >= 2:
        status = "CHANGES_DETECTED"
        headline = "Early pattern shift observed"
        explanation = "A few indicators differ from your usual balance. MindOS flagged this so you can make slight adjustments before fatigue sets in."
    elif signal_strength >= 0.25 or len(factors) == 1:
        status = "WATCH"
        headline = "Routine is generally stable with minor shifts"
        explanation = "Your pattern is close to normal with slight variance. Keep maintaining your steady rhythm."
    else:
        status = "STABLE"
        headline = "Your pattern is balanced and consistent"
        explanation = "Your sleep, stress, and workload are aligning well with your personal baseline."

    # Record risk event if not recent duplicate
    last_event = db.query(RiskEvent).filter(
        RiskEvent.user_id == user_id
    ).order_by(RiskEvent.created_at.desc()).first()

    should_save = False
    if not last_event or last_event.status != status or abs(last_event.signal_strength - signal_strength) > 0.15:
        should_save = True

    if should_save:
        risk_event = RiskEvent(
            user_id=user_id,
            status=status,
            signal_strength=signal_strength,
            factors=json.dumps(factors),
            is_dismissed=False
        )
        db.add(risk_event)
        db.commit()
        db.refresh(risk_event)
    else:
        risk_event = last_event

    return {
        "status": status,
        "signal_strength": signal_strength,
        "headline": headline,
        "explanation": explanation,
        "factors": factors,
        "ml_anomaly_score": ml_score,
        "is_anomaly": is_ml_anomaly,
        "feature_analysis": feature_analysis,
        "risk_event_id": risk_event.id if risk_event else None,
        "is_crunch_mode": is_crunch_mode
    }
