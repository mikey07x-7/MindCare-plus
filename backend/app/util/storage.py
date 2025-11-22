import firebase_admin
from firebase_admin import credentials, firestore
from app.config import settings

cred = None
if settings.FIREBASE_CREDENTIALS_PATH:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred, {"databaseURL": settings.FIREBASE_DB_URL})
db = firestore.client()

def save_user(uid: str, data: dict):
    db.collection("users").document(uid).set(data)

def get_user(uid: str):
    doc = db.collection("users").document(uid).get()
    return doc.to_dict() if doc.exists else None

def save_assessment(uid: str, assessment: dict):
    db.collection("users").document(uid).collection("assessments").add(assessment)
