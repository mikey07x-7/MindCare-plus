# backend/app/storage.py
import os
from typing import List, Dict, Any, Optional
import firebase_admin
from firebase_admin import credentials, firestore

_firebase_app = None
_db = None

def init_firebase():
    global _firebase_app, _db
    if _firebase_app is None:
        cred_path = os.environ.get("FIREBASE_CREDENTIALS_PATH") or os.getenv("FIREBASE_CREDENTIALS_PATH")
        if not cred_path:
            raise RuntimeError("FIREBASE_CREDENTIALS_PATH not set in environment")
        cred = credentials.Certificate(cred_path)
        _firebase_app = firebase_admin.initialize_app(cred)
        _db = firestore.client()
    return _db

def _get_db():
    global _db
    if _db is None:
        _db = init_firebase()
    return _db

def save_user(uid: str, payload: Dict[str, Any]) -> None:
    db = _get_db()
    doc_ref = db.collection("users").document(uid)
    doc_ref.set(payload, merge=True)

def get_user(uid: str) -> Optional[Dict[str, Any]]:
    db = _get_db()
    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        return None
    return doc.to_dict()

def save_user_assessment(uid: str, score: int, extra: Optional[Dict[str, Any]] = None) -> None:
    db = _get_db()
    collection = db.collection("users").document(uid).collection("assessments")
    data = {"score": int(score), "timestamp": firestore.SERVER_TIMESTAMP}
    if extra:
        data.update(extra)
    collection.add(data)

def get_last_n_assessments(uid: str, n: int = 30) -> List[Dict[str, Any]]:
    db = _get_db()
    coll = db.collection("users").document(uid).collection("assessments")
    docs = coll.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(n).stream()
    out = []
    for d in docs:
        dd = d.to_dict()
        out.append(dd)
    return out

def add_user_credits(uid: str, points: int, metadata: Optional[Dict[str, Any]] = None) -> None:
    db = _get_db()
    coll = db.collection("users").document(uid).collection("credits")
    data = {"points": int(points), "timestamp": firestore.SERVER_TIMESTAMP}
    if metadata:
        data.update(metadata)
    coll.add(data)

def get_total_credits(uid: str) -> int:
    db = _get_db()
    coll = db.collection("users").document(uid).collection("credits")
    docs = coll.stream()
    total = 0
    for d in docs:
        dd = d.to_dict()
        total += int(dd.get("points", 0))
    return total

def get_credit_transactions(uid: str, n: int = 50) -> List[Dict[str, Any]]:
    db = _get_db()
    coll = db.collection("users").document(uid).collection("credits")
    docs = coll.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(n).stream()
    out = []
    for d in docs:
        out.append(d.to_dict())
    return out
