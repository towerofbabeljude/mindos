import numpy as np
from sqlalchemy.orm import Session
from ..models import DailyCheckIn, BaselineFeature, Profile

FEATURES = ["sleep_hours", "stress", "workload", "energy", "productivity"]

def calculate_user_baselines(db: Session, user_id: int) -> dict[str, dict[str, float]]:
    """
    Computes running personal baseline statistics (mean, std_dev, median)
    from user's check-in history. If insufficient check-ins (<3), defaults to profile preferences.
    """
    checkins = db.query(DailyCheckIn).filter(DailyCheckIn.user_id == user_id).order_by(DailyCheckIn.date.asc()).all()
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    results = {}

    default_sleep = profile.typical_sleep if profile else 7.5
    default_stress = profile.typical_stress if profile else 3.5
    defaults = {
        "sleep_hours": (default_sleep, 0.7),
        "stress": (default_stress, 0.8),
        "workload": (4.5, 0.9),
        "energy": (7.2, 0.7),
        "productivity": (7.0, 0.8)
    }

    if len(checkins) < 14:
        for feat, (m, s) in defaults.items():
            results[feat] = {
                "mean": m,
                "std_dev": s,
                "median": m,
                "count": len(checkins)
            }
        return results

    # Group values
    data = {f: [] for f in FEATURES}
    for c in checkins:
        data["sleep_hours"].append(c.sleep_hours)
        data["stress"].append(c.stress)
        data["workload"].append(c.workload)
        data["energy"].append(c.energy)
        data["productivity"].append(c.productivity)

    for feat in FEATURES:
        vals = np.array(data[feat])
        mean_val = float(np.mean(vals))
        std_val = float(np.std(vals))
        if std_val < 0.2:
            std_val = 0.5 # prevent division by zero
        median_val = float(np.median(vals))

        results[feat] = {
            "mean": round(mean_val, 2),
            "std_dev": round(std_val, 2),
            "median": round(median_val, 2),
            "count": len(vals)
        }

        # Update or persist in BaselineFeature table
        b_entry = db.query(BaselineFeature).filter(
            BaselineFeature.user_id == user_id,
            BaselineFeature.feature_name == feat
        ).first()
        if not b_entry:
            b_entry = BaselineFeature(
                user_id=user_id,
                feature_name=feat,
                mean=mean_val,
                std_dev=std_val,
                median=median_val,
                sample_count=len(vals)
            )
            db.add(b_entry)
        else:
            b_entry.mean = mean_val
            b_entry.std_dev = std_val
            b_entry.median = median_val
            b_entry.sample_count = len(vals)

    db.commit()
    return results
