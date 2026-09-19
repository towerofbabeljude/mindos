import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models import User, Profile, DailyCheckIn, AcademicTask, ReMindSession, Intervention, RiskEvent, BaselineFeature
from .baseline_service import calculate_user_baselines
from .risk_service import evaluate_mindguard_risk
from .intervention_service import generate_intervention_for_risk

def seed_demo_data(db: Session, mode: str = "stressful"):
    """
    Seeds demo student data.
    mode: 'normal' (healthy baseline) or 'stressful' (burnout risk trigger demo)
    """
    # Ensure default user
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, email="alex.chen@university.edu", name="Alex Chen")
        db.add(user)
        db.commit()
        db.refresh(user)

    # Ensure profile
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(
            user_id=user.id,
            academic_year="Junior (Year 3)",
            course="Computer Science & Cognitive AI",
            typical_sleep=7.4,
            typical_study=4.5,
            typical_stress=3.2,
            preferred_study_period="Late Afternoon"
        )
        db.add(profile)
        db.commit()

    # Clear previous checkins, tasks, sessions, events, interventions
    db.query(DailyCheckIn).filter(DailyCheckIn.user_id == user.id).delete()
    db.query(AcademicTask).filter(AcademicTask.user_id == user.id).delete()
    db.query(ReMindSession).filter(ReMindSession.user_id == user.id).delete()
    db.query(RiskEvent).filter(RiskEvent.user_id == user.id).delete()
    db.query(Intervention).filter(Intervention.user_id == user.id).delete()
    db.commit()

    today = datetime.utcnow().date()

    # Generate 14 days of checkins
    for i in range(14, 0, -1):
        day_date = today - timedelta(days=i - 1)
        date_str = day_date.strftime("%Y-%m-%d")

        if mode == "normal" or i > 5:
            # Baseline period (healthy / normal student routine)
            sleep = round(7.2 + (0.4 * (i % 3 - 1)), 1)
            stress = round(3.2 + (0.5 * (i % 2)), 1)
            workload = round(4.5 + (0.6 * (i % 3)), 1)
            energy = round(7.4 + (0.3 * (i % 2 - 1)), 1)
            productivity = round(7.2 + (0.4 * (i % 2)), 1)
            happiness = round(7.5 + (0.3 * (i % 2)), 1)
            tags = ["Lecture", "Study Group"] if i % 2 == 0 else ["Labs"]
        else:
            # Stressful Crunch Mode (Last 5 days: exams, deadlines, sleep drops, stress rises)
            sleep = round(4.8 - (0.2 * (5 - i)), 1)
            stress = round(7.8 + (0.3 * (5 - i)), 1)
            workload = round(8.6 + (0.2 * (5 - i)), 1)
            energy = round(4.1 - (0.2 * (5 - i)), 1)
            productivity = round(5.2 - (0.3 * (5 - i)), 1)
            happiness = round(3.5 - (0.2 * (5 - i)), 1)
            tags = ["Exams", "Assignments", "Deadlines", "Late Night Study"]

        checkin = DailyCheckIn(
            user_id=user.id,
            date=date_str,
            sleep_hours=sleep,
            stress=stress,
            workload=workload,
            energy=energy,
            social_connection=6.5 if mode == "normal" or i > 5 else 3.8,
            productivity=productivity,
            happiness=happiness,
            tags=json.dumps(tags),
            notes="Demo day simulation"
        )
        db.add(checkin)

    # Seed academic tasks
    if mode == "normal":
        tasks_data = [
            ("Algorithms Problem Set 4", "CS 301", (today + timedelta(days=4)).strftime("%Y-%m-%d"), 3.0, "medium", "medium", "pending"),
            ("Cognitive Science Reading", "COG 210", (today + timedelta(days=6)).strftime("%Y-%m-%d"), 2.0, "low", "easy", "pending"),
            ("Database Normalization Lab", "CS 320", (today + timedelta(days=2)).strftime("%Y-%m-%d"), 2.5, "medium", "medium", "in_progress"),
            ("Linear Algebra Review", "MATH 240", (today - timedelta(days=1)).strftime("%Y-%m-%d"), 2.0, "medium", "medium", "completed"),
        ]
    else:
        tasks_data = [
            ("Distributed Systems Final Project", "CS 450", (today + timedelta(days=1)).strftime("%Y-%m-%d"), 8.5, "high", "hard", "pending"),
            ("Machine Learning Paper Reproduction", "CS 475", (today + timedelta(days=2)).strftime("%Y-%m-%d"), 6.0, "high", "hard", "in_progress"),
            ("Algorithms Midterm Prep", "CS 301", (today + timedelta(days=3)).strftime("%Y-%m-%d"), 5.0, "high", "hard", "pending"),
            ("Computer Ethics Position Essay", "HUM 202", (today + timedelta(days=5)).strftime("%Y-%m-%d"), 3.0, "medium", "medium", "pending"),
            ("Operating Systems Lab 4 (Late)", "CS 330", (today - timedelta(days=1)).strftime("%Y-%m-%d"), 4.0, "high", "hard", "pending"),
        ]

    for title, course, deadline, est_h, prio, diff, status in tasks_data:
        task = AcademicTask(
            user_id=user.id,
            title=title,
            course=course,
            deadline=deadline,
            estimated_hours=est_h,
            priority=prio,
            difficulty=diff,
            status=status
        )
        db.add(task)

    # Seed ReMind micro-sessions
    if mode == "normal":
        remind_data = [
            ("focus", 0.92, 420.0, 30.0, 95.0),
            ("memory", 0.88, None, 45.0, 90.0),
            ("reaction", 1.0, 240.0, 25.0, 96.0),
        ]
    else:
        remind_data = [
            ("focus", 0.61, 680.0, 42.0, 65.0),
            ("memory", 0.55, None, 58.0, 60.0),
            ("reaction", 0.75, 410.0, 38.0, 70.0),
        ]

    for act_type, acc, react_t, comp_t, score in remind_data:
        rs = ReMindSession(
            user_id=user.id,
            activity_type=act_type,
            accuracy=acc,
            reaction_time=react_t,
            completion_time=comp_t,
            score=score
        )
        db.add(rs)

    db.commit()

    # Re-evaluate baselines and MindGuard
    calculate_user_baselines(db, user.id)
    risk_info = evaluate_mindguard_risk(db, user.id)
    generate_intervention_for_risk(db, user.id, risk_info)

    return {"message": f"Successfully seeded demo data in '{mode}' mode.", "mode": mode}
