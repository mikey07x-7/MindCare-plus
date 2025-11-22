"""
admin_routes.py

- Endpoints for admin/consultant dashboards:
  - list recent assessments
  - fetch students under high risk
  - mark an assessment as reviewed

Note: This uses the same JWT pattern used throughout the app.
"""

from fastapi import APIRouter, Header, HTTPException
from app.util.jwt_handler import decode_token
from app.util.storage import db  # firestore client exposed in storage.py
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])

def require_role(authorization: str = Header(...), allowed_roles: List[str] = None):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid auth header")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    role = payload.get("role")
    if allowed_roles and role not in allowed_roles:
        raise HTTPException(403, "Access forbidden for role")
    return payload

@router.get("/recent-assessments")
def recent_assessments(authorization: str = Header(...), limit: int = 50):
    payload = require_role(authorization, allowed_roles=["consultant", "admin"])
    # Query Firestore for recent assessments (collection per user)
    coll = db.collection_group("assessments").order_by("timestamp", direction="DESCENDING").limit(limit)
    docs = coll.stream()
    results = []
    for d in docs:
        data = d.to_dict()
        ref = d.reference
        # include document path to allow marking reviewed
        results.append({"id": ref.path, "data": data})
    return {"assessments": results}

@router.get("/high-risk")
def high_risk(authorization: str = Header(...)):
    payload = require_role(authorization, allowed_roles=["consultant", "admin"])
    coll = db.collection_group("assessments").where("risk", "==", "high").limit(200)
    docs = coll.stream()
    results = []
    for d in docs:
        data = d.to_dict()
        ref = d.reference
        results.append({"id": ref.path, "data": data})
    return {"high_risk": results}

@router.post("/mark-reviewed")
def mark_reviewed(doc_path: str, authorization: str = Header(...)):
    payload = require_role(authorization, allowed_roles=["consultant", "admin"])
    # doc_path should be the full document path returned earlier
    try:
        doc_ref = db.document(doc_path)
        doc_ref.update({"reviewed": True, "reviewed_by": payload.get("sub")})
        return {"ok": True}
    except Exception as e:
        raise HTTPException(400, f"Could not mark reviewed: {e}")
