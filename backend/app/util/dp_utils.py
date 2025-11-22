"""
dp_utils.py

- Helpers for integrating Opacus differential privacy into PyTorch training loops.
- Simple symmetric encryption helper using Fernet (cryptography) for storing
  encrypted user vault entries before saving to Firestore/S3.
"""

from typing import Any, Dict, Tuple
import torch
from opacus import PrivacyEngine
from cryptography.fernet import Fernet
import base64
import os

# ---------- Differential Privacy helpers (Opacus) ----------

def make_private(optimizer: torch.optim.Optimizer, model: torch.nn.Module,
                 sample_rate: float, noise_multiplier: float, max_grad_norm: float):
    """
    Wrap the optimizer with Opacus PrivacyEngine, returning (privacy_engine, optimizer).
    Call privacy_engine.attach(optimizer) has been integrated in make_private.
    """
    privacy_engine = PrivacyEngine(
        model,
        sample_rate=sample_rate,
        noise_multiplier=noise_multiplier,
        max_grad_norm=max_grad_norm,
    )
    privacy_engine.attach(optimizer)
    return privacy_engine, optimizer

def get_epsilon(privacy_engine: PrivacyEngine, steps: int, target_delta: float = 1e-5):
    """
    Compute epsilon for the given steps and delta. Returns (epsilon, delta).
    """
    try:
        eps, delta = privacy_engine.accountant.get_privacy_spent(target_delta)
        return eps, delta
    except Exception:
        # For newer opacus versions privacy accounting API differs; try helper
        try:
            eps = privacy_engine.get_epsilon(target_delta)
            return eps, target_delta
        except Exception:
            return None, target_delta

# ---------- Simple encryption helpers (Fernet) ----------

def generate_vault_key() -> str:
    """
    Generate a URL-safe base64-encoded key for Fernet.
    Save securely in production (KMS / secret manager).
    """
    return Fernet.generate_key().decode()

def encrypt_vault_data(key: str, data: bytes) -> bytes:
    """
    Encrypt bytes using Fernet key.
    """
    f = Fernet(key.encode())
    return f.encrypt(data)

def decrypt_vault_data(key: str, token: bytes) -> bytes:
    f = Fernet(key.encode())
    return f.decrypt(token)

# ---------- Example wrapping function for training loop ----------

def attach_dp_to_training(optimizer, model, train_dataset_size, batch_size, noise_multiplier=1.0, max_grad_norm=1.0):
    """
    Convenience function to attach Opacus to a training run.
    sample_rate computed as batch_size / train_dataset_size.
    Returns (privacy_engine, optimizer).
    """
    sample_rate = batch_size / float(max(1, train_dataset_size))
    pe, opt = make_private(optimizer, model, sample_rate, noise_multiplier, max_grad_norm)
    return pe, opt
