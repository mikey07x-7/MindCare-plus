# backend/app/jwt_handler.py

import jwt
from datetime import datetime, timedelta
from app.config import settings

def create_access_token(subject: str, role: str = "student", expires_minutes: int = None):
    """
    Create a JWT token for authentication.
    Uses settings.JWT_EXPIRATION_MINUTES for expiration.
    """

    expire = datetime.utcnow() + timedelta(
        minutes = expires_minutes or settings.JWT_EXPIRATION_MINUTES
    )

    payload = {
        "sub": subject,
        "role": role,
        "exp": expire
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )


def decode_access_token(token: str):
    """
    Decode and verify a JWT token.
    """
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM]
    )
