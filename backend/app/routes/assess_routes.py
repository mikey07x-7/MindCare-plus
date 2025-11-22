# backend/app/routes/assess_routes.py
from fastapi import APIRouter, Depends, Body
from pydantic import BaseModel
from app.storage import save_user_assessment
from app.auth import get_current_user

router = APIRouter(prefix="/assess", tags=["assess"])

class AssessIn(BaseModel):
    # adapt fields to your form
    gender: str
    age: int
    cgpa: str = ""
    # ... other fields as needed

@router.post("/predict")
async def predict(body: AssessIn = Body(...), user = Depends(get_current_user)):
    # Hook into your existing predict.py
    try:
        from app.predict import run_predict
        result = run_predict(body.dict())
        score = int(result.get("score", 0))
    except Exception as e:
        print("predict error:", e)
        score = 0
        result = {"score": score}
    try:
        uid = user.get("uid")
        if uid:
            save_user_assessment(uid, score, extra={"source": "web"})
    except Exception as e:
        print("save assessment error:", e)
    return {"score": score, "raw": result}
