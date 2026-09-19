import json
from datetime import datetime, date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, DailyCheckIn, AcademicTask, ReMindSession, Intervention
from ..schemas import DashboardResponse, DashboardMetrics, WorkloadSummary, InterventionResponse
from ..services.baseline_service import calculate_user_baselines
from ..services.risk_service import evaluate_mindguard_risk

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    user_name = user.name if user else "Alex Chen"

    # Evaluate MindGuard
    risk_data = evaluate_mindguard_risk(db, 1)

    # Baselines
    baselines = calculate_user_baselines(db, 1)
    base_dict = {k: v["mean"] for k, v in baselines.items()}

    # Recent checkins for current metrics & trends
    checkins = (
        db.query(DailyCheckIn)
        .filter(DailyCheckIn.user_id == 1)
        .order_by(DailyCheckIn.date.desc())
        .limit(14)
        .all()
    )

    if checkins:
        latest = checkins[0]
        curr_metrics = DashboardMetrics(
            stress=latest.stress,
            sleep=latest.sleep_hours,
            workload=latest.workload,
            energy=latest.energy,
            productivity=latest.productivity
        )
    else:
        curr_metrics = DashboardMetrics(
            stress=3.2,
            sleep=7.4,
            workload=4.5,
            energy=7.5,
            productivity=7.0
        )

    # Academic tasks summary
    tasks = db.query(AcademicTask).filter(
        AcademicTask.user_id == 1,
        AcademicTask.status != "completed"
    ).all()

    today_str = date.today().strftime("%Y-%m-%d")
    total_hours = sum(t.estimated_hours for t in tasks)
    high_pri = sum(1 for t in tasks if t.priority == "high")
    overdue = sum(1 for t in tasks if t.deadline < today_str)
    pressure = min(round((total_hours / 14.0) * 100, 1), 100.0)

    workload_summary = WorkloadSummary(
        total_hours=round(total_hours, 1),
        high_priority_count=high_pri,
        overdue_count=overdue,
        pending_count=len(tasks),
        daily_pressure_score=pressure
    )

    # Trends in chronological order
    trend_list = []
    for c in reversed(checkins):
        trend_list.append({
            "date": c.date[5:], # MM-DD
            "sleep": c.sleep_hours,
            "stress": c.stress,
            "workload": c.workload,
            "energy": c.energy,
            "productivity": c.productivity,
            "happiness": getattr(c, 'happiness', 7.0) or 7.0
        })

    # Active intervention
    active_int = (
        db.query(Intervention)
        .filter(
            Intervention.user_id == 1,
            Intervention.is_dismissed == False,
            Intervention.is_accepted == None
        )
        .order_by(Intervention.created_at.desc())
        .first()
    )

    active_resp = None
    if active_int:
        steps_list = json.loads(active_int.steps) if active_int.steps else []
        active_resp = InterventionResponse(
            id=active_int.id,
            user_id=active_int.user_id,
            risk_event_id=active_int.risk_event_id,
            type=active_int.type,
            title=active_int.title,
            reason=active_int.reason,
            steps=steps_list,
            is_accepted=active_int.is_accepted,
            is_dismissed=active_int.is_dismissed,
            created_at=active_int.created_at
        )

    # ReMind today
    remind_today = (
        db.query(ReMindSession)
        .filter(
            ReMindSession.user_id == 1,
            ReMindSession.created_at >= datetime.utcnow().replace(hour=0, minute=0, second=0)
        )
        .first()
    )

    # Task deadlines for calendar widget
    task_deadlines = [t.deadline for t in tasks]

    return DashboardResponse(
        user_name=user_name,
        status=risk_data["status"],
        signal_strength=risk_data["signal_strength"],
        headline=risk_data["headline"],
        explanation=risk_data["explanation"],
        metrics=curr_metrics,
        baselines=base_dict,
        changes=risk_data["factors"],
        workload=workload_summary,
        recent_trend=trend_list,
        active_intervention=active_resp,
        remind_completed_today=bool(remind_today),
        task_deadlines=task_deadlines,
        is_crunch_mode=risk_data.get("is_crunch_mode", False)
    )
