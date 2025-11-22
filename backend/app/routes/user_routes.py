from fastapi import APIRouter, Depends, Body, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.auth import get_current_user
from app.storage import (
    get_user,
    save_user,
    get_total_credits,
    get_credit_transactions
)

router = APIRouter(prefix="/user", tags=["user"])


# ==========================
#  MODELS
# ==========================

class UpdateProfileIn(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    privacy: Optional[dict] = None


class ChangePasswordIn(BaseModel):
    old_password: str
    new_password: str


# ==========================
#  ROUTES
# ==========================

@router.get("/me")
async def me(user=Depends(get_current_user)):
    uid = user["uid"]
    u = get_user(uid)
    if not u:
        raise HTTPException(404, "User not found")

    u.pop("password_hash", None)  # Don't leak password hash
    return u


@router.post("/update")
async def update_profile(
    body: UpdateProfileIn = Body(...),
    user=Depends(get_current_user)
):
    uid = user["uid"]

    payload = {}
    if body.name is not None:
        payload["name"] = body.name
    if body.phone is not None:
        payload["phone"] = body.phone
    if body.privacy is not None:
        payload["privacy"] = body.privacy

    save_user(uid, payload)

    updated = get_user(uid)
    updated.pop("password_hash", None)
    return updated


@router.post("/change-password")
async def change_password(
    body: ChangePasswordIn,
    user=Depends(get_current_user)
):
    uid = user["uid"]
    u = get_user(uid)

    if not u:
        raise HTTPException(404, "User not found")

    if u.get("password_hash") != body.old_password:
        raise HTTPException(400, "Incorrect password")

    save_user(uid, {"password_hash": body.new_password})
    return {"msg": "Password updated"}


@router.get("/credits")
async def credits(user=Depends(get_current_user)):
    uid = user["uid"]
    total = get_total_credits(uid)
    return {"credits": total}


@router.get("/history")
async def credit_history(user=Depends(get_current_user)):
    uid = user["uid"]
    return {"history": get_credit_transactions(uid)}
