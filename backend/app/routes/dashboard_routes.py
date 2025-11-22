# backend/app/routes/dashboard_routes.py
from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.storage import get_last_n_assessments, get_total_credits

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/me")
async def my_dashboard(user = Depends(get_current_user)):
    uid = user.get("uid")
    if not uid:
        return {"error": "unauthorized"}
    assessments = get_last_n_assessments(uid, 30)
    credits = get_total_credits(uid)
    # convert timestamps to ISO strings if needed (Firestore timestamp objects)
    for a in assessments:
        ts = a.get("timestamp")
        try:
            if hasattr(ts, "isoformat"):
                a["timestamp"] = ts.isoformat()
        except Exception:
            pass
    return {"assessments": assessments, "credits": credits}
