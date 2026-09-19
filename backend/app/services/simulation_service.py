from sqlalchemy.orm import Session
from ..models import AcademicTask

def run_workload_simulation(db: Session, user_id: int, postponed_task_ids: list[int], reduced_hours_pct: float):
    """
    Computes workload relief when postponing specific tasks or scaling study target hours.
    """
    tasks = db.query(AcademicTask).filter(
        AcademicTask.user_id == user_id,
        AcademicTask.status != "completed"
    ).all()

    orig_total_hours = sum(t.estimated_hours for t in tasks)
    
    # Exclude postponed tasks
    active_tasks = [t for t in tasks if t.id not in postponed_task_ids]
    sim_hours = sum(t.estimated_hours for t in active_tasks)

    # Apply reduction percent if any
    if reduced_hours_pct > 0:
        sim_hours = sim_hours * (1.0 - min(reduced_hours_pct / 100.0, 0.5))

    # Pressure metric: standard capacity benchmark is ~10-12 hours upcoming
    orig_pressure = min(round((orig_total_hours / 14.0) * 100, 1), 100.0)
    sim_pressure = min(round((sim_hours / 14.0) * 100, 1), 100.0)

    relief = round(max(orig_pressure - sim_pressure, 0.0), 1)

    postponed_count = len(postponed_task_ids)
    if postponed_count > 0:
        explanation = f"Postponing {postponed_count} task(s) reduces your immediate workload by {round(orig_total_hours - sim_hours, 1)} hours ({relief}% pressure relief)."
    else:
        explanation = f"Adjusting study intensity yields an estimated {relief}% reduction in immediate workload pressure."

    return {
        "original_workload_hours": round(orig_total_hours, 1),
        "simulated_workload_hours": round(sim_hours, 1),
        "original_pressure_percent": orig_pressure,
        "simulated_pressure_percent": sim_pressure,
        "relief_percent": relief,
        "explanation": explanation
    }
