// frontend/src/api.ts
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
});

// Attach token automatically
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("mc_token");
  if (token) {
    cfg.headers = cfg.headers || {};
    cfg.headers["Authorization"] = `Bearer ${token}`;
  }
  return cfg;
});

/* ================================
   AUTH
================================== */
// LOGIN (email + password)
export async function login(email: string, password: string) {
  const r = await api.post("/auth/login", { email, password });
  const token = r.data?.access_token;

  if (token) localStorage.setItem("mc_token", token);

  return r.data;
}

// Send OTP to email
export async function sendOtp(email: string) {
  return api.post("/auth/send-otp", JSON.stringify(email), {
    headers: { "Content-Type": "application/json" },
  });
}

// Registration (verify OTP + save)
export async function verifyRegister(
  email: string,
  otp: string,
  password: string,
  role = "student"
) {
  const r = await api.post("/auth/verify-register", {
    email,
    otp,
    password,
    role,
  });

  const token = r.data?.access_token;
  if (token) localStorage.setItem("mc_token", token);

  return r.data;
}

// Logout (optional server-side)
export async function logout() {
  try {
    return api.post("/auth/logout");
  } catch {
    return null;
  }
}

/* ================================
   USER PROFILE
================================== */

export async function getProfile() {
  return api.get("/user/me");
}

export async function updateProfile(payload: {
  name?: string;
  phone?: string;
  privacy?: any;
}) {
  return api.post("/user/update", payload);
}

export async function changePassword(oldPassword: string, newPassword: string) {
  return api.post("/user/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
}

export async function getCredits() {
  return api.get("/user/credits");
}

/* ================================
   ASSESSMENT (ML model)
================================== */

export async function predictAssess(payload: any) {
  return api.post("/assess/predict", payload);
}

/* ================================
   DASHBOARD
================================== */

export async function getDashboard() {
  return api.get("/dashboard/me");
}

/* ================================
   EXERCISES
================================== */

export async function completeExercise(payload: {
  exercise_id: number;
  points: number;
  metadata?: any;
}) {
  return api.post("/exercise/complete", payload);
}

/* ================================
   CHATBOT (Groq API)
================================== */

export async function chatGpt(message: string, context: any = {}) {
  return api.post("/chat/gpt", { message, context });
}

export default api;
