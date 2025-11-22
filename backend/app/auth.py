# backend/app/auth.py
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel, EmailStr
import random, time
from app.jwt_handler import create_access_token, decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.storage import save_user, get_user

router = APIRouter(prefix="/auth", tags=["auth"])

_otp_store = {}  # in-memory: email -> (otp, ts)

class VerifyIn(BaseModel):
    email: EmailStr
    otp: str
    password: str
    role: str = "student"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

@router.post("/send-otp")
async def send_otp(email: EmailStr = Body(..., embed=False)):
    otp = f"{random.randint(0, 999999):06d}"
    _otp_store[email] = (otp, time.time())
    try:
        from app.util.emailer import send_otp_email
        send_otp_email(str(email), otp)
    except Exception as e:
        print("emailer error:", e)
    return {"msg": "OTP sent"}

@router.post("/verify-register")
async def verify_register(body: VerifyIn = Body(...)):
    entry = _otp_store.get(body.email)
    if not entry:
        raise HTTPException(400, "OTP not found")
    otp, ts = entry
    if time.time() - ts > 600:
        raise HTTPException(400, "OTP expired")
    if otp != body.otp:
        raise HTTPException(400, "Invalid OTP")
    uid = body.email.replace("@", "_at_")
    save_user(uid, {"email": body.email, "role": body.role, "password_hash": body.password})
    token = create_access_token(subject=uid, role=body.role)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login")
async def login(body: LoginIn = Body(...)):
    uid = body.email.replace("@", "_at_")
    user = get_user(uid)
    if not user:
        raise HTTPException(404, "User not found")
    # NOTE: in production compare hashed passwords (bcrypt). Here we check the stored password_hash.
    stored = user.get("password_hash", "")
    if body.password != stored:
        raise HTTPException(400, "Invalid credentials")
    token = create_access_token(subject=uid, role=user.get("role", "student"))
    return {"access_token": token, "token_type": "bearer"}

# ---- auth dependency to get current user ----
from fastapi.security import HTTPBearer
security = HTTPBearer()

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds:
        raise HTTPException(401, "Missing authorization header")
    token = creds.credentials
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    # payload uses "sub"
    uid = payload.get("sub")
    if not uid:
        raise HTTPException(401, "Invalid token payload")
    user = get_user(uid)
    if not user:
        raise HTTPException(404, "User not found")
    return {"uid": uid, "email": user.get("email"), "role": user.get("role")}
