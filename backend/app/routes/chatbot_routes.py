# backend/app/routes/chatbot_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from app.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatIn(BaseModel):
    message: str
    context: dict = {}

@router.post("/gpt")
async def chat_gpt(body: ChatIn):
    try:
        url = settings.GROQ_API_URL
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",  # recommended working model (adjust if your key needs different)
            "messages": [
                {"role": "system", "content": "You are a kind and supportive mental wellness assistant."},
                {"role": "user", "content": body.message}
            ],
            "temperature": 0.7
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        if resp.status_code != 200:
            raise Exception(resp.text)
        data = resp.json()
        # support common openai-style and groq responses
        if "choices" in data and len(data["choices"]) > 0:
            reply = data["choices"][0]["message"]["content"]
        elif "reply" in data:
            reply = data["reply"]
        else:
            reply = data.get("output") or str(data)
        return {"reply": reply}
    except Exception as e:
        print("Groq API error:", e)
        raise HTTPException(500, "Groq API error")
