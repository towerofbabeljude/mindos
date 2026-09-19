from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Profile Schemas
class ProfileBase(BaseModel):
    academic_year: str = "Sophomore"
    course: str = "Computer Science & Data Science"
    typical_sleep: float = 7.5
    typical_study: float = 4.0
    typical_stress: float = 3.5
    preferred_study_period: str = "Evening"
    timezone: str = "UTC"

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    email: str
    name: str = "Student"

class UserCreate(UserBase):
    password: Optional[str] = "demopassword"

class UserResponse(UserBase):
    id: int
    created_at: datetime
    profile: Optional[ProfileResponse] = None
    class Config:
        from_attributes = True

class UserProfileDetails(BaseModel):
    name: str = "Alex Chen"
    academic_standing: str = "Junior (Year 3)"
    degree_department: str = "Computer Science & Cognitive AI"
    email: Optional[str] = "alex.chen@university.edu"

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    academic_standing: Optional[str] = None
    degree_department: Optional[str] = None

# Check-In Schemas
class CheckInCreate(BaseModel):
    date: Optional[str] = None # defaults to current date if omitted
    stress: float = Field(..., ge=1.0, le=10.0)
    energy: float = Field(..., ge=1.0, le=10.0)
    sleep_hours: float = Field(..., ge=0.0, le=24.0)
    workload: float = Field(..., ge=1.0, le=10.0)
    social_connection: float = Field(7.0, ge=1.0, le=10.0)
    productivity: float = Field(7.0, ge=1.0, le=10.0)
    happiness: float = Field(7.0, ge=1.0, le=10.0)
    tags: List[str] = []
    notes: Optional[str] = None

class CheckInResponse(BaseModel):
    id: int
    user_id: int
    date: str
    stress: float
    energy: float
    sleep_hours: float
    workload: float
    social_connection: float
    productivity: float
    happiness: float
    tags: List[str]
    notes: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# Task Schemas
class TaskCreate(BaseModel):
    title: str
    course: str = "General"
    deadline: str # YYYY-MM-DD
    estimated_hours: float = 2.0
    priority: str = "medium" # low, medium, high
    difficulty: str = "medium" # easy, medium, hard
    status: str = "pending"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    course: Optional[str] = None
    deadline: Optional[str] = None
    estimated_hours: Optional[float] = None
    priority: Optional[str] = None
    difficulty: Optional[str] = None
    status: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    course: str
    deadline: str
    estimated_hours: float
    priority: str
    difficulty: str
    status: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# ReMind Schemas
class ReMindSessionCreate(BaseModel):
    activity_type: str # focus, memory, reaction, reset, reflection
    accuracy: float = 1.0
    reaction_time: Optional[float] = None
    completion_time: Optional[float] = None
    score: float = 100.0
    metadata_info: Optional[str] = None

class ReMindSessionResponse(BaseModel):
    id: int
    user_id: int
    activity_type: str
    accuracy: float
    reaction_time: Optional[float]
    completion_time: Optional[float]
    score: float
    metadata_info: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# Intervention Schemas
class InterventionResponse(BaseModel):
    id: int
    user_id: int
    risk_event_id: Optional[int]
    type: str
    title: str
    reason: str
    steps: List[str]
    is_accepted: Optional[bool]
    is_dismissed: bool
    created_at: datetime
    class Config:
        from_attributes = True

class InterventionFeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    helpful: str # yes_a_lot, somewhat, not_really, no
    feedback: Optional[str] = None

# Baseline & Anomaly Schemas
class FeatureBaseline(BaseModel):
    feature_name: str
    mean: float
    std_dev: float
    current_7d_avg: float
    deviation: float
    deviation_percent: float
    trend: str # increasing, decreasing, stable

class SilentSignalReport(BaseModel):
    status: str # STABLE, WATCH, CHANGES_DETECTED, SIGNIFICANT_CHANGE
    signal_strength: float # 0.0 to 1.0
    features: Dict[str, FeatureBaseline]
    factors: List[str]
    ml_anomaly_score: float
    is_anomaly: bool

# Dashboard Response
class DashboardMetrics(BaseModel):
    stress: float
    sleep: float
    workload: float
    energy: float
    productivity: float

class WorkloadSummary(BaseModel):
    total_hours: float
    high_priority_count: int
    overdue_count: int
    pending_count: int
    daily_pressure_score: float

class DashboardResponse(BaseModel):
    user_name: str
    status: str
    signal_strength: float
    headline: str
    explanation: str
    metrics: DashboardMetrics
    baselines: Dict[str, float]
    changes: List[str]
    workload: WorkloadSummary
    recent_trend: List[Dict[str, Any]]
    active_intervention: Optional[InterventionResponse]
    remind_completed_today: bool
    task_deadlines: List[str] = []
    is_crunch_mode: bool = False

# Simulation Schema
class SimulationRequest(BaseModel):
    postponed_task_ids: List[int] = []
    reduced_hours_percent: float = 0.0 # 0 - 50%
    target_sleep_hours: Optional[float] = None

class SimulationResponse(BaseModel):
    original_workload_hours: float
    simulated_workload_hours: float
    original_pressure_percent: float
    simulated_pressure_percent: float
    relief_percent: float
    explanation: str
