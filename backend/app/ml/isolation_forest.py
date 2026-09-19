import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest.joblib")

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self._ensure_model()

    def _ensure_model(self):
        os.makedirs(MODEL_DIR, exist_ok=True)
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                return
            except Exception:
                pass
        
        # Train default baseline model with synthesized standard student distributions
        self.train_baseline_model()

    def train_baseline_model(self):
        np.random.seed(42)
        # Features: [sleep_hours, sleep_change, stress, stress_change, workload, workload_change, energy, energy_change]
        # Normal student baseline distributions (mean sleep: 7.3, stress: 3.5, workload: 4.5, energy: 7.2)
        n_samples = 400
        normal_sleep = np.random.normal(7.3, 0.6, n_samples)
        sleep_change = np.random.normal(0.0, 0.4, n_samples)
        normal_stress = np.random.normal(3.5, 0.7, n_samples)
        stress_change = np.random.normal(0.0, 0.5, n_samples)
        normal_workload = np.random.normal(4.5, 0.8, n_samples)
        workload_change = np.random.normal(0.0, 0.6, n_samples)
        normal_energy = np.random.normal(7.2, 0.6, n_samples)
        energy_change = np.random.normal(0.0, 0.4, n_samples)

        X_train = np.column_stack([
            normal_sleep, sleep_change,
            normal_stress, stress_change,
            normal_workload, workload_change,
            normal_energy, energy_change
        ])

        self.model = IsolationForest(
            n_estimators=150,
            contamination=0.08,
            random_state=42
        )
        self.model.fit(X_train)
        joblib.dump(self.model, MODEL_PATH)

    def predict(self, feature_vector: list[float]) -> tuple[bool, float]:
        """
        Takes [sleep, sleep_diff, stress, stress_diff, workload, workload_diff, energy, energy_diff]
        Returns (is_anomaly, anomaly_score_normalized)
        """
        if self.model is None:
            self._ensure_model()

        X = np.array([feature_vector])
        pred = self.model.predict(X)[0] # -1 is anomaly, 1 is inlier
        raw_score = self.model.decision_function(X)[0]

        # raw_score is positive for inliers, negative for outliers.
        # Normalize into a 0.0 (safe) to 1.0 (strong anomaly) signal
        # typically raw_score ranges between -0.3 and +0.25
        normalized_anomaly = float(np.clip(1.0 - (raw_score + 0.25) / 0.5, 0.0, 1.0))
        is_anomaly = bool(pred == -1 or normalized_anomaly > 0.60)

        return is_anomaly, round(normalized_anomaly, 3)

anomaly_detector = AnomalyDetector()
