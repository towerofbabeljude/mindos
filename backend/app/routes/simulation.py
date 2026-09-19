from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import SimulationRequest, SimulationResponse
from ..services.simulation_service import run_workload_simulation

router = APIRouter(prefix="/simulation", tags=["simulation"])

@router.post("/workload", response_model=SimulationResponse)
def simulate_workload(req: SimulationRequest, db: Session = Depends(get_db)):
    res = run_workload_simulation(
        db,
        user_id=1,
        postponed_task_ids=req.postponed_task_ids,
        reduced_hours_pct=req.reduced_hours_percent
    )
    return SimulationResponse(**res)
