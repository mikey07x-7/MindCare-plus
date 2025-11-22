import React, { useState } from "react";

/**
 * AssessmentPage.tsx
 * - 8 core ML inputs (1-5 sliders)
 * - Low-intensity neon (teal + purple) 3D SaaS orb
 * - Calls backend predict endpoint to get score_0_100 and risk_label
 *
 * Notes:
 * - API base is read from import.meta.env.VITE_API_BASE (defaults to http://localhost:8000)
 * - Dev proxy (vite.config.ts) maps "/api" -> backend (so you can use "/api/predict")
 */

// If you want to call directly to backend: set VITE_API_BASE in .env
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

type InputsType = {
  anxiety_level: number;
  depression_level: number;
  stress_level: number;
  mental_fatigue: number;
  academic_pressure: number;
  academic_workload: number;
  study_satisfaction: number;
  social_media_usage: number;
};

type PredictResponse = {
  model_used: string;
  raw_prediction: any;
  score_0_100: number;
  risk_label: string;
  details?: Record<string, any>;
};

// Path to uploaded image from your environment (use this exact path or update)
const uploadedBg = "/mnt/data/a9abab14-6bff-4e6a-9f96-40cb5b128026.png";

export default function AssessmentPage(): JSX.Element {
  const [inputs, setInputs] = useState<InputsType>({
    anxiety_level: 3,
    depression_level: 3,
    stress_level: 3,
    mental_fatigue: 3,
    academic_pressure: 3,
    academic_workload: 3,
    study_satisfaction: 3,
    social_media_usage: 3,
  });

  const [score, setScore] = useState<number | null>(null);
  const [riskLabel, setRiskLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chipLayout = [
    { key: "anxiety_level", label: "Anxiety", top: "12%", left: "50%" },
    { key: "depression_level", label: "Depression", top: "22%", left: "73%" },
    { key: "stress_level", label: "Stress", top: "47%", left: "82%" },
    { key: "mental_fatigue", label: "Fatigue", top: "72%", left: "68%" },
    { key: "academic_pressure", label: "Acad. Pressure", top: "82%", left: "42%" },
    { key: "academic_workload", label: "Workload", top: "70%", left: "20%" },
    { key: "study_satisfaction", label: "Study Satisfaction", top: "40%", left: "10%" },
    { key: "social_media_usage", label: "Social Media", top: "18%", left: "27%" },
  ] as const;

  function update<K extends keyof InputsType>(key: K, value: number) {
    setInputs((p) => ({ ...p, [key]: value }));
  }

  function scoreToLabel(sc: number) {
    if (sc >= 80) return "High";
    if (sc >= 65) return "Medium+";
    if (sc >= 50) return "Medium";
    if (sc >= 30) return "Medium-";
    return "Low";
  }

  async function callPredictAPI() {
    setLoading(true);
    setError(null);

    const payload = { ...inputs };

    try {
      // Use the proxied "/api" path if you prefer; otherwise API_BASE/predict will be used.
      const url = (import.meta.env.VITE_USE_PROXY === "true")
        ? `/api/predict`
        : `${API_BASE}/predict`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Predict API error (${res.status}) ${txt}`);
      }

      const data: PredictResponse = await res.json();
      const s = Math.round(Number(data.score_0_100));
      setScore(s);
      setRiskLabel(data.risk_label ?? scoreToLabel(s));
    } catch (err: any) {
      console.error("Predict error", err);
      setError(String(err?.message ?? err));
      // fallback heuristic:
      const arr = Object.values(inputs);
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      const sc = Math.round((avg / 5) * 100);
      setScore(sc);
      setRiskLabel(scoreToLabel(sc));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-[#0c1118] text-white font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Wheel */}
        <div className="col-span-9">
          <h1 className="text-4xl font-extrabold mb-6">Mental Assessment</h1>

          <div className="relative bg-[#0a0f15] rounded-2xl p-6 border border-[#ffffff14] shadow-2xl" style={{ minHeight: 640 }}>
            <img src={uploadedBg} alt="subtle-bg" className="pointer-events-none absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.06 }} />

            <div className="mx-auto relative" style={{ width: 640, height: 640 }}>
              <div className="absolute inset-0 rounded-full"
                   style={{
                     background: "radial-gradient(circle at 35% 30%, rgba(0,255,200,0.04), rgba(110,70,255,0.05) 45%, rgba(10,16,22,0.95) 85%)",
                     boxShadow: "0 0 50px rgba(0,255,200,0.04), inset 0 -50px 100px rgba(120,80,255,0.07)",
                   }} />

              <div className="absolute top-12 left-12 right-12 bottom-12 rounded-full flex items-center justify-center"
                   style={{ backdropFilter: "blur(10px) saturate(110%)", background: "rgba(255,255,255,0.02)", boxShadow: "inset 0 5px 12px rgba(255,255,255,0.015)" }}>
                <button onClick={callPredictAPI} disabled={loading}
                        className="rounded-full text-lg font-semibold shadow-xl flex flex-col items-center justify-center"
                        style={{
                          width: 180, height: 180, color: "#eaffff",
                          border: "3px solid rgba(255,255,255,0.07)",
                          background: "radial-gradient(circle at 30% 20%, rgba(0,255,200,0.28), rgba(110,70,255,0.28))",
                          boxShadow: "0 25px 55px rgba(0,255,200,0.12), 0 25px 55px rgba(120,80,255,0.12), inset 0 -10px 24px rgba(0,0,0,0.35)"
                        }}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ color: "white" }}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span className="text-base font-medium">Assessing...</span>
                    </div>
                  ) : (
                    <>
                      <span>Assess</span>
                      <div className="text-sm font-medium mt-1">Risk</div>
                    </>
                  )}
                </button>
              </div>

              {/* chips */}
              {chipLayout.map((c) => (
                <div key={c.key} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: c.top, left: c.left }}>
                  <div className="bg-[#0d141c]/60 backdrop-blur-md rounded-xl px-4 py-3 w-44 text-center border border-[#ffffff18] shadow-lg">
                    <div className="text-sm text-[#bdeaff] font-medium">{c.label}</div>

                    <input type="range" min={1} max={5} value={(inputs as any)[c.key]} onChange={(e) => update(c.key as keyof InputsType, Number(e.target.value))} className="w-full mt-2" />
                    <div className="mt-2 text-xs text-[#9fb8ff]">{(inputs as any)[c.key]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-3">
          <div className="sticky top-8 mx-2 rounded-xl p-6 bg-[#0a0f15] border border-[#ffffff14] shadow-2xl" style={{ height: 640 }}>
            <h3 className="text-xl font-semibold mb-4">Risk Level</h3>

            <div className="flex flex-col items-center space-y-4">
              <div className="w-40 rounded-2xl p-4 bg-[#0e1620] border border-[#ffffff10] shadow-inner">
                <div className="space-y-3 py-2">
                  <div className="rounded-full text-center py-2 bg-red-500 font-semibold">High</div>
                  <div className="rounded-full text-center py-2 bg-orange-500 font-semibold">Medium+</div>
                  <div className="rounded-full text-center py-2 bg-yellow-400 font-semibold">Medium</div>
                  <div className="rounded-full text-center py-2 bg-green-400 font-semibold">Medium-</div>
                  <div className="rounded-full text-center py-2 bg-blue-500 font-semibold">Low</div>
                </div>

                <div className="mt-4 text-center text-sm text-[#97aef0]">Score</div>
                <div className="mt-2 text-3xl font-bold">{score ?? "--"}</div>
                <div className="mt-2 text-sm text-[#9fb8ff]">{riskLabel ?? "-"}</div>
              </div>

              <div className="h-64 w-6 rounded-full bg-[#101821] flex items-end justify-center p-1 relative overflow-hidden">
                <div className="absolute rounded-full transition-all duration-500"
                     style={{
                       width: 28,
                       height: 28,
                       bottom: `${Math.max(0, Math.min(100, score ?? 0))}%`,
                       left: "50%",
                       transform: "translate(-50%, 50%)",
                       background: "linear-gradient(180deg, rgba(0,255,200,0.45), rgba(120,80,255,0.45))",
                       boxShadow: "0 8px 18px rgba(120,80,255,0.12), 0 6px 10px rgba(0,255,200,0.06)",
                     }} />
              </div>

              <button onClick={callPredictAPI} disabled={loading} className="mt-4 px-6 py-3 rounded-xl font-semibold" style={{ background: "linear-gradient(90deg, rgba(0,255,200,0.22), rgba(120,80,255,0.22))", color: "#dff" }}>
                Run Assessment
              </button>

              {error && <div className="text-sm text-rose-400 mt-2 text-center">{error}</div>}

              <div className="text-xs text-[#89a3c7] mt-4 text-center">Using your Joblib model via FastAPI. <br/> Default API: <code>{API_BASE}/predict</code></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
