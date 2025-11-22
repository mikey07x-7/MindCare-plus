# backend/app/config.py
import os
from dotenv import load_dotenv
load_dotenv()

class Settings:
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))

    JWT_SECRET = os.getenv("JWT_SECRET", "devsecret")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_ACCESS_EXPIRE_MINUTES", 60))

    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_APP_PASSWORD = os.getenv("SMTP_APP_PASSWORD")

    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH")
    FIREBASE_DB_URL = os.getenv("FIREBASE_DATABASE_URL")

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_API_URL = os.getenv("GROQ_API_URL")

    MODEL_DIR = os.getenv("MODEL_DIR", "./models")
    LSTM_MODEL_PATH = os.getenv("LSTM_MODEL_PATH", "./models/lstm_emotion.pt")
    TRANSFORMER_MODEL_PATH = os.getenv("TRANSFORMER_MODEL_PATH", "./models/transformer_sentiment.pt")

settings = Settings()
