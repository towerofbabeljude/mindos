import numpy as np
from sqlalchemy.orm import Session
from ..models import DailyCheckIn
from .baseline_service import calculate_user_baselines, FEATURES

def compute_silent_signals(db: Session, user_id: int):
    """
    SilentSignals analyzes rolling 7-day windows against the user's personal baseline
    to detect meaningful deviations in sleep, stress, workload, energy, and productivity.
    """
    baselines = calculate_user_baselines(db, user_id)
    
    # Get last 7 check-ins
    recent_checkins = (
        db.query(DailyCheckIn)
        .filter(DailyCheckIn.user_id == user_id)
        .order_by(DailyCheckIn.date.desc())
        .limit(7)
        .all()
    )

    feature_analysis = {}
    detected_factors = []

    if not recent_checkins:
        # Defaults if no checkins yet
        for f in FEATURES:
            m = baselines[f]["mean"]
            feature_analysis[f] = {
                "feature_name": f,
                "mean": m,
                "std_dev": baselines[f]["std_dev"],
                "current_7d_avg": m,
                "deviation": 0.0,
                "deviation_percent": 0.0,
                "trend": "stable"
            }
        return feature_analysis, detected_factors

    # Checkins in chronological order for trend
    checkins_chrono = list(reversed(recent_checkins))

    for f in FEATURES:
        vals = [getattr(c, f) for c in checkins_chrono]
        curr_avg = float(np.mean(vals))
        base_mean = baselines[f]["mean"]
        base_std = baselines[f]["std_dev"]

        diff = curr_avg - base_mean
        diff_pct = (diff / base_mean * 100) if base_mean != 0 else 0.0

        # Calculate trend using slope if >= 3 data points
        if len(vals) >= 3:
            x = np.arange(len(vals))
            slope, _ = np.polyfit(x, vals, 1)
            if slope > 0.15:
                trend = "increasing"
            elif slope < -0.15:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "stable"

        feature_analysis[f] = {
            "feature_name": f,
            "mean": round(base_mean, 2),
            "std_dev": round(base_std, 2),
            "current_7d_avg": round(curr_avg, 2),
            "deviation": round(diff, 2),
            "deviation_percent": round(diff_pct, 1),
            "trend": trend
        }

        # Identify meaningful factors (> 1.2 standard deviations or significant percentage)
        z_score = abs(diff) / base_std if base_std > 0 else 0
        if f == "sleep_hours" and (diff <= -1.2 or z_score >= 1.3):
            detected_factors.append(f"Sleep is {abs(round(diff, 1))}h below your usual baseline")
        elif f == "stress" and (diff >= 1.5 or z_score >= 1.3):
            detected_factors.append(f"Stress has increased by {abs(round(diff_pct, 0))}% above normal")
        elif f == "workload" and (diff >= 1.8 or z_score >= 1.3):
            detected_factors.append(f"Academic workload is {abs(round(diff_pct, 0))}% higher than your recent pattern")
        elif f == "energy" and (diff <= -1.5 or z_score >= 1.3):
            detected_factors.append(f"Daily energy is down {abs(round(diff_pct, 0))}% compared to baseline")
        elif f == "productivity" and (diff <= -1.8 or z_score >= 1.4):
            detected_factors.append(f"Productivity self-rating dropped below normal")

    # Sleep baseline anomaly: flag if baseline mean is clinically unusual
    sleep_base = feature_analysis.get("sleep_hours", {})
    sleep_base_mean = sleep_base.get("mean", 7.5)
    if sleep_base_mean < 5.0:
        detected_factors.append(
            f"⚠️ Sleep baseline anomaly: your average sleep of {round(sleep_base_mean, 1)}h is critically low (below 5h). This is a serious health concern."
        )
    elif sleep_base_mean > 10.0:
        detected_factors.append(
            f"⚠️ Sleep baseline anomaly: your average sleep of {round(sleep_base_mean, 1)}h is unusually high (over 10h). Consider speaking to a health professional."
        )

    return feature_analysis, detected_factors
