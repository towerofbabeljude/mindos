from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AcademicTask
from ..schemas import TaskCreate, TaskUpdate, TaskResponse
from ..services.risk_service import evaluate_mindguard_risk

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=list[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    return (
        db.query(AcademicTask)
        .filter(AcademicTask.user_id == 1)
        .order_by(AcademicTask.deadline.asc())
        .all()
    )

@router.post("", response_model=TaskResponse)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    task = AcademicTask(
        user_id=1,
        title=task_in.title,
        course=task_in.course,
        deadline=task_in.deadline,
        estimated_hours=task_in.estimated_hours,
        priority=task_in.priority,
        difficulty=task_in.difficulty,
        status=task_in.status
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    evaluate_mindguard_risk(db, 1)
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(AcademicTask).filter(AcademicTask.id == task_id, AcademicTask.user_id == 1).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for k, v in task_in.model_dump(exclude_unset=True).items():
        setattr(task, k, v)

    db.commit()
    db.refresh(task)
    evaluate_mindguard_risk(db, 1)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(AcademicTask).filter(AcademicTask.id == task_id, AcademicTask.user_id == 1).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    evaluate_mindguard_risk(db, 1)
    return {"message": "Task deleted successfully"}
