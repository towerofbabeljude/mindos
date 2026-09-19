from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, default="Student")
    hashed_password = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    checkins = relationship("DailyCheckIn", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("AcademicTask", back_populates="user", cascade="all, delete-orphan")
    remind_sessions = relationship("ReMindSession", back_populates="user", cascade="all, delete-orphan")
    baselines = relationship("BaselineFeature", back_populates="user", cascade="all, delete-orphan")
    risk_events = relationship("RiskEvent", back_populates="user", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    academic_year = Column(String(50), default="Sophomore")
    course = Column(String(100), default="Computer Science & Data Science")
    typical_sleep = Column(Float, default=7.5)
    typical_study = Column(Float, default=4.0)
    typical_stress = Column(Float, default=3.5)
    preferred_study_period = Column(String(50), default="Evening")
    timezone = Column(String(50), default="UTC")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class DailyCheckIn(Base):
    __tablename__ = "daily_checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String(20), nullable=False) # YYYY-MM-DD
    stress = Column(Float, nullable=False) # 1-10
    energy = Column(Float, nullable=False) # 1-10
    sleep_hours = Column(Float, nullable=False) # hours
    workload = Column(Float, nullable=False) # 1-10
    social_connection = Column(Float, default=7.0) # 1-10
    productivity = Column(Float, default=7.0) # 1-10
    happiness = Column(Float, default=7.0) # 1-10 (1=Terrible, 10=Awesome)
    tags = Column(Text, default="[]") # JSON list of strings e.g. ["Exams", "Assignments"]
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="checkins")

class AcademicTask(Base):
    __tablename__ = "academic_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    course = Column(String(100), default="General")
    deadline = Column(String(20), nullable=False) # YYYY-MM-DD
    estimated_hours = Column(Float, default=2.0)
    priority = Column(String(20), default="medium") # low, medium, high
    difficulty = Column(String(20), default="medium") # easy, medium, hard
    status = Column(String(20), default="pending") # pending, in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="tasks")

class ReMindSession(Base):
    __tablename__ = "remind_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String(50), nullable=False) # focus, memory, reaction, reset, reflection
    accuracy = Column(Float, default=1.0) # 0.0 - 1.0
    reaction_time = Column(Float, nullable=True) # milliseconds
    completion_time = Column(Float, nullable=True) # seconds
    score = Column(Float, default=100.0)
    metadata_info = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="remind_sessions")

class BaselineFeature(Base):
    __tablename__ = "baseline_features"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feature_name = Column(String(100), nullable=False)
    mean = Column(Float, nullable=False)
    std_dev = Column(Float, nullable=False)
    median = Column(Float, nullable=False)
    sample_count = Column(Integer, default=1)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="baselines")

class RiskEvent(Base):
    __tablename__ = "risk_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="STABLE") # STABLE, WATCH, CHANGES_DETECTED, SIGNIFICANT_CHANGE
    signal_strength = Column(Float, default=0.1) # 0.0 to 1.0
    factors = Column(Text, default="[]") # JSON list of detected factors
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="risk_events")
    interventions = relationship("Intervention", back_populates="risk_event")

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    risk_event_id = Column(Integer, ForeignKey("risk_events.id"), nullable=True)
    type = Column(String(50), default="workload") # workload, break, reset, human_support, routine
    title = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)
    steps = Column(Text, default="[]") # JSON list of steps
    is_accepted = Column(Boolean, nullable=True) # None=pending, True=accepted, False=declined
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interventions")
    risk_event = relationship("RiskEvent", back_populates="interventions")
    feedback = relationship("InterventionFeedback", back_populates="intervention", uselist=False)

class InterventionFeedback(Base):
    __tablename__ = "intervention_feedback"

    id = Column(Integer, primary_key=True, index=True)
    intervention_id = Column(Integer, ForeignKey("interventions.id"), unique=True, nullable=False)
    rating = Column(Integer, nullable=False) # 1-5
    helpful = Column(String(50), nullable=False) # yes_a_lot, somewhat, not_really, no
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    intervention = relationship("Intervention", back_populates="feedback")
