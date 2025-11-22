# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.routes.assess_routes import router as assess_router
from app.routes.chatbot_routes import router as chatbot_router
from app.routes.user_routes import router as user_router  # ✅ FIX

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(assess_router)
app.include_router(chatbot_router)
app.include_router(user_router)   # 🚀 PROFILE + CREDITS NOW WORK
