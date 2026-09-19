from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Profile
from ..schemas import UserResponse, ProfileResponse, ProfileBase, UserProfileDetails, UserProfileUpdate

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, email="alex.chen@university.edu", name="Alex Chen")
        profile = Profile(user_id=1, academic_year="Junior (Year 3)", course="Computer Science & Cognitive AI")
        db.add(user)
        db.add(profile)
        db.commit()
        db.refresh(user)
    return user

@router.get("/user-profile", response_model=UserProfileDetails)
def get_user_profile(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, email="alex.chen@university.edu", name="Alex Chen")
        profile = Profile(user_id=1, academic_year="Junior (Year 3)", course="Computer Science & Cognitive AI")
        db.add(user)
        db.add(profile)
        db.commit()
        db.refresh(user)
    
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id, academic_year="Junior (Year 3)", course="Computer Science & Cognitive AI")
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return UserProfileDetails(
        name=user.name,
        academic_standing=profile.academic_year or "Junior (Year 3)",
        degree_department=profile.course or "Computer Science & Cognitive AI",
        email=user.email
    )

@router.put("/user-profile", response_model=UserProfileDetails)
def update_user_profile(payload: UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)

    if payload.name is not None and payload.name.strip():
        user.name = payload.name.strip()
    if payload.academic_standing is not None:
        profile.academic_year = payload.academic_standing.strip()
    if payload.degree_department is not None:
        profile.course = payload.degree_department.strip()

    db.commit()
    db.refresh(user)
    db.refresh(profile)

    return UserProfileDetails(
        name=user.name,
        academic_standing=profile.academic_year or "Junior (Year 3)",
        degree_department=profile.course or "Computer Science & Cognitive AI",
        email=user.email
    )

@router.put("/profile", response_model=ProfileResponse)
def update_profile(profile_data: ProfileBase, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)

    for k, v in profile_data.model_dump().items():
        setattr(profile, k, v)

    db.commit()
    db.refresh(profile)
    return profile
