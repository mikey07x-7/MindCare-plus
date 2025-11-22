# backend/app/routes/exercise_routes.py
from fastapi import APIRouter, Depends, Body
from pydantic import BaseModel
from app.auth import get_current_user
from app.storage import add_user_credits

router = APIRouter(prefix="/exercise", tags=["exercise"])

class ExerciseCompleteIn(BaseModel):
    exercise_id: int
    points: int
    metadata: dict = {}

@router.post("/complete")
async def complete_exercise(body: ExerciseCompleteIn = Body(...), user = Depends(get_current_user)):
    uid = user.get("uid")
    if not uid:
        return {"error": "unauthorized"}
    add_user_credits(uid, body.points, metadata={"exercise_id": body.exercise_id, **(body.metadata or {})})
    return {"msg": "ok", "points": body.points}
