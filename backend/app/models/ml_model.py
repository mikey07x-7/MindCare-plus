"""
ml_model.py

- Functions to load saved LSTM model (PyTorch) and Transformer (HuggingFace) for inference.
- Lightweight wrappers convert text -> predicted emotion / risk score.
"""

import os
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from app.config import settings
import re
from typing import Tuple, Dict

# ---------- LSTM small model inference (compatible with train_lstm.py) ----------

class LSTNWrapper:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.device = torch.device("cpu")
        self._load()

    def _load(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"LSTM model not found at {self.model_path}")
        ckpt = torch.load(self.model_path, map_location=self.device)
        # Recreate a minimal model architecture matching train_lstm
        stoi = ckpt["vocab"]
        label_map = ckpt["label_map"]
        num_classes = len(label_map)
        vocab_size = max(stoi.values()) + 1
        emb_dim = 64
        hidden_dim = 128
        class SimpleLSTM(nn.Module):
            def __init__(self, vocab_size, emb_dim, hidden_dim, num_classes):
                super().__init__()
                self.embedding = nn.Embedding(vocab_size, emb_dim, padding_idx=0)
                self.lstm = nn.LSTM(emb_dim, hidden_dim, batch_first=True)
                self.fc = nn.Linear(hidden_dim, num_classes)
            def forward(self, x):
                emb = self.embedding(x)
                _, (hn, _) = self.lstm(emb)
                logits = self.fc(hn[-1])
                return logits
        self.stoi = stoi
        self.itos = {v:k for k,v in stoi.items()}
        self.label_map = label_map
        self.model = SimpleLSTM(vocab_size, emb_dim, hidden_dim, num_classes)
        self.model.load_state_dict(ckpt["model_state"])
        self.model.to(self.device)
        self.model.eval()

    def _tokenize(self, text: str, max_len: int = 50):
        text = text.lower()
        text = re.sub(r'[^a-z0-9\s]', '', text)
        toks = text.split()[:max_len]
        ids = [self.stoi.get(t, 1) for t in toks]
        ids += [0]*(max_len - len(ids))
        return torch.tensor([ids], dtype=torch.long)

    def predict(self, text: str) -> Dict:
        xb = self._tokenize(text)
        with torch.no_grad():
            logits = self.model(xb)
            probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
            pred_idx = int(probs.argmax())
            # reverse label_map
            rev = {v:k for k,v in self.label_map.items()}
            emotion = rev[pred_idx]
            return {"emotion": emotion, "probs": probs.tolist()}

# ---------- Transformer inference (HuggingFace) ----------

class TransformerWrapper:
    def __init__(self, model_dir: str):
        if not os.path.exists(model_dir):
            raise FileNotFoundError(f"Transformer model dir not found at {model_dir}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_dir)
        self.model.eval()

    def predict(self, text: str):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1).cpu().numpy()[0].tolist()
            pred_idx = int(torch.argmax(logits, dim=-1).cpu().numpy()[0])
        # label mapping is not saved here; consumer should map indices to labels stored elsewhere
        return {"pred_idx": pred_idx, "probabilities": probs}

# ---------- Convenience loader functions ----------

_lstm_wrapper = None
_transformer_wrapper = None

def get_lstm_model():
    global _lstm_wrapper
    if _lstm_wrapper is None:
        _lstm_wrapper = LSTNWrapper(settings.LSTM_MODEL_PATH)
    return _lstm_wrapper

def get_transformer_model():
    global _transformer_wrapper
    if _transformer_wrapper is None:
        _transformer_wrapper = TransformerWrapper(settings.TRANSFORMER_MODEL_PATH)
    return _transformer_wrapper

# Example risk mapper: convert predicted emotion and metadata into risk level
def map_emotion_to_risk(emotion: str, sleep_hours: float = 7.0, mood_score: int = 5) -> str:
    score = 0
    if emotion in ("sad", "anxious", "stressed", "angry"):
        score += 2
    if sleep_hours < 5:
        score += 2
    if mood_score <= 3:
        score += 3
    if score >= 5:
        return "high"
    if score >= 3:
        return "medium"
    return "low"
