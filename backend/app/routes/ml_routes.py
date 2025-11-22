from fastapi import APIRouter
from pydantic import BaseModel
from predict import predict_all  # because predict.py is in backend root

router = APIRouter(
    prefix="/ml",
    tags=["ML Predictions"]
)

class SurveyInput(BaseModel):
    gender: str
    age: int
    university: str
    degree_level: str
    degree_major: str
    academic_year: str
    cgpa: str
    residential_status: str
    campus_discrimination: str
    sports_engagement: str

@router.post("/predict")
async def ml_predict(data: SurveyInput):
    result = predict_all(data.dict())
    return {"prediction": result}
