# backend/api/predict_api.py
import os
import glob
import logging
from typing import Optional, Dict, Any, List

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("inference_api")

# === Configurable paths ===
MODELS_DIR = os.getenv("MODELS_DIR", "backend/model_tabular")
# Optionally set MODEL_FILE environment variable to pick a specific model
MODEL_FILE = os.getenv("MODEL_FILE", None)

PREPROCESSOR_FILE = os.path.join(MODELS_DIR, "preprocessor_xgb.joblib")

# === Pydantic schema for incoming request ===
class WheelFeatures(BaseModel):
    anxiety_level: int = Field(..., ge=1, le=5)
    depression_level: int = Field(..., ge=1, le=5)
    stress_level: int = Field(..., ge=1, le=5)
    mental_fatigue: int = Field(..., ge=1, le=5)
    academic_pressure: int = Field(..., ge=1, le=5)
    academic_workload: int = Field(..., ge=1, le=5)
    study_satisfaction: int = Field(..., ge=1, le=5)
    social_media_usage: int = Field(..., ge=1, le=5)

class PredictionResponse(BaseModel):
    model_used: str
    raw_prediction: Any
    score_0_100: float
    risk_label: str
    details: Optional[Dict[str, Any]] = None

app = FastAPI(title="Mental Assessment Inference API", version="1.0")

# === Utility functions ===
def find_model_file() -> Optional[str]:
    """
    Attempt to locate a reasonable xgb_*.joblib model in the models directory.
    Priority:
      1) MODEL_FILE env var (absolute or relative path)
      2) preprocessor + model named 'xgb_overall.joblib' if present
      3) first xgb_*.joblib found
    """
    # 1) explicit environment override
    if MODEL_FILE:
        candidate = MODEL_FILE
        if not os.path.isabs(candidate):
            candidate = os.path.join(MODELS_DIR, candidate)
        if os.path.exists(candidate):
            logger.info(f"Using model from MODEL_FILE env var: {candidate}")
            return candidate
        else:
            logger.warning(f"MODEL_FILE set but not found: {candidate}")

    # 2) preferred filename
    preferred = os.path.join(MODELS_DIR, "xgb_overall.joblib")
    if os.path.exists(preferred):
        logger.info(f"Found preferred overall model: {preferred}")
        return preferred

    # 3) fallback: first xgb_*.joblib
    candidates = sorted(glob.glob(os.path.join(MODELS_DIR, "xgb_*.joblib")))
    if candidates:
        logger.info(f"Found {len(candidates)} xgb_*.joblib files, selecting first: {candidates[0]}")
        return candidates[0]

    # 4) fallback: any .joblib in folder
    any_joblibs = sorted(glob.glob(os.path.join(MODELS_DIR, "*.joblib")))
    if any_joblibs:
        logger.info(f"No xgb_*.joblib found, selecting first joblib: {any_joblibs[0]}")
        return any_joblibs[0]

    return None

def load_labelmaps(models_dir: str) -> Dict[str, Any]:
    """
    Load any labelmap_*.joblib files into a dict {name: mapping}
    """
    out = {}
    for path in glob.glob(os.path.join(models_dir, "labelmap_*.joblib")):
        name = os.path.basename(path).replace("labelmap_", "").replace(".joblib", "")
        try:
            out[name] = joblib.load(path)
            logger.info(f"Loaded labelmap: {path} as {name}")
        except Exception as e:
            logger.warning(f"Failed to load labelmap {path}: {e}")
    return out

# === Load model + optional preprocessor on startup ===
logger.info("Starting model discovery...")
MODEL_PATH = find_model_file()
if MODEL_PATH is None:
    logger.error(f"No model found in {MODELS_DIR}. Please put your joblib model(s) there.")
    # We still let app start but will raise helpful errors on predict.

preprocessor = None
if os.path.exists(PREPROCESSOR_FILE):
    try:
        preprocessor = joblib.load(PREPROCESSOR_FILE)
        logger.info(f"Loaded preprocessor: {PREPROCESSOR_FILE}")
    except Exception as e:
        logger.error(f"Failed to load preprocessor {PREPROCESSOR_FILE}: {e}")
        preprocessor = None
else:
    logger.info("No preprocessor_xgb.joblib found; using raw numeric features.")

labelmaps = load_labelmaps(MODELS_DIR)

model = None
if MODEL_PATH:
    try:
        model = joblib.load(MODEL_PATH)
        logger.info(f"Loaded model: {MODEL_PATH}")
    except Exception as e:
        logger.error(f"Failed to load model {MODEL_PATH}: {e}")
        model = None

# Simple risk label mapping function
def label_from_score(score: float) -> str:
    if score >= 80:
        return "High"
    if score >= 65:
        return "Medium+"
    if score >= 50:
        return "Medium"
    if score >= 30:
        return "Medium-"
    return "Low"

@app.post("/predict", response_model=PredictionResponse)
def predict(w: WheelFeatures):
    # Build feature array expected by your preprocessor/model.
    # NOTE: The order below must match ordering used during training.
    feature_order = [
        "anxiety_level",
        "depression_level",
        "stress_level",
        "mental_fatigue",
        "academic_pressure",
        "academic_workload",
        "study_satisfaction",
        "social_media_usage",
    ]

    x = np.array([[ getattr(w, f) for f in feature_order ]], dtype=float)

    if model is None:
        raise HTTPException(status_code=500, detail=f"No model loaded. Check server logs and ensure joblib model exists in {MODELS_DIR}")

    # If a preprocessor exists, use it
    try:
        if preprocessor is not None:
            logger.debug("Applying preprocessor transform")
            x_transformed = preprocessor.transform(x)
        else:
            x_transformed = x
    except Exception as e:
        logger.exception("Error applying preprocessor")
        raise HTTPException(status_code=500, detail=f"Preprocessing failed: {e}")

    # Predict
    try:
        # If model supports predict_proba (classification), attempt to use it
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(x_transformed)
            # Here we convert to a single 0-100 score using probability of positive class if 2-class
            if probs.shape[1] == 2:
                positive_prob = float(probs[0, 1])
                score_0_100 = round(positive_prob * 100, 2)
                raw_prediction = {"proba": probs.tolist()}
            else:
                # multiclass: take max class prob normalized
                max_prob = float(np.max(probs[0]))
                score_0_100 = round(max_prob * 100, 2)
                raw_prediction = {"proba": probs.tolist()}
        else:
            # regression or other model returning scalar
            pred = model.predict(x_transformed)
            if isinstance(pred, (list, np.ndarray)):
                pred0 = float(pred[0])
            else:
                pred0 = float(pred)
            # Map prediction into 0-100. If the model was trained as 1-5, normalize:
            if pred0 <= 5:  # likely 1-5 scale
                score_0_100 = round(((pred0 - 1) / 4) * 100, 2)
            else:
                # otherwise scale by a heuristic: clamp between 0-100
                score_0_100 = max(0.0, min(100.0, pred0))
            raw_prediction = {"pred": pred0}
    except Exception as e:
        logger.exception("Prediction error")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    risk = label_from_score(score_0_100)

    response = PredictionResponse(
        model_used=os.path.basename(MODEL_PATH) if MODEL_PATH else "none",
        raw_prediction=raw_prediction,
        score_0_100=score_0_100,
        risk_label=risk,
        details={"feature_order": feature_order}
    )

    return response

# Simple healthcheck
@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": bool(model is not None)}
