# MindOS — Student Wellbeing & Early Signal Intelligence

> **Notice the change. Understand the signal. Act early.**

MindOS is a software-only student wellbeing platform that learns what "normal" looks like for each individual student, detects meaningful deviations from their personal baseline, and proactively offers actionable next steps before burnout or academic exhaustion escalate.

---

## 🌟 Core Pillars

1. **MindGuard**: Early-warning anomaly detection combining ML (`IsolationForest`), personal baseline variance, deadline pressure, and cognitive interaction stability into actionable product states:
   - `STABLE`
   - `WATCH`
   - `CHANGES_DETECTED`
   - `SIGNIFICANT_CHANGE`
2. **SilentSignals**: Personalized baseline deviation engine that tracks running means ($\mu$) and standard deviations ($\sigma$) across sleep, stress, workload, energy, and productivity, rather than applying a generic population average.
3. **ReMind**: Optional 30–60 second micro-activities (Focus Challenge, Reaction Time, Guided 4-4-4 Reset Breathing, Mindful Reflection) providing non-invasive cognitive wellbeing signals.
4. **What-If Simulator**: Interactive workload recalculation simulator allowing students to test moving deadlines and scaling down study hours to visualize estimated pressure relief.
5. **Proactive Interventions & Feedback Loop**: Student-directed recommendations with rating and outcome feedback that adapts future suggestions to the student's preferences.

---

## 🛠️ Architecture & Technology Stack

```text
┌──────────────────────────────────────────────────────────────┐
│                         MINDOS UI                            │
│  React 19 + TypeScript + Vite + Custom Glassmorphism Design  │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTPS / REST (Proxy :5173 -> :8000)
┌──────────────────────────────▼───────────────────────────────┐
│                    FASTAPI BACKEND (:8000)                   │
├──────────────────────────────┬───────────────────────────────┤
│ • Pydantic v2 validation     │ • scikit-learn IsolationForest│
│ • SQLAlchemy ORM             │ • Baseline Engine (μ, σ)      │
│ • SQLite (zero-config local) │ • SilentSignals Deviation     │
│   or PostgreSQL / Supabase   │ • What-If Simulator           │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart Guide

### 1-Click Launch (Windows)
Double-click:
```text
start_mindos.bat
```
*(or run `powershell -ExecutionPolicy Bypass -File .\start_mindos.ps1`)*

This launches:
- **Backend API & Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Frontend Web Application**: [http://localhost:5173](http://localhost:5173)

---

### Manual Launch

#### Backend
```powershell
cd backend
python run.py
```

#### Frontend
```powershell
cd frontend
npm run dev
```

---

## 🔬 Hackathon Live Demo Mode

In the top navigation bar, toggle the **Demo Scenario**:
- **Normal**: Seeds 14 days of healthy student baseline data (Sleep: ~7.4h, Stress: 3.2, Workload: 4.5). MindGuard displays `STABLE`.
- **Crunch Period**: Seeds simulated exam crunch (Sleep drops to ~4.6h, Stress spikes to 7.9, Workload spikes to 8.6, high-priority tasks queue). MindGuard immediately detects `SIGNIFICANT_CHANGE`, reveals explainable factor deviations, and triggers proactive intervention cards!

---

## ⚖️ Important Product Boundary

MindOS is a **wellbeing-support and early-signal product, not a medical diagnostic tool**. It never claims to diagnose depression, anxiety, clinical burnout, or any psychiatric condition. Clear campus counseling and 24/7 crisis resources (e.g. 988 Lifeline) are always directly accessible within the app.
