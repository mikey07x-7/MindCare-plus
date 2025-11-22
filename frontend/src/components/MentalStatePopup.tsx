import React, { useEffect, useState } from "react";
import { X, TrendingUp, CreditCard } from "lucide-react";
import { getDashboard } from "../api";

type Props = {
  darkMode: boolean;
  onClose: () => void;
};

export default function MentalStatePopup({ darkMode, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const [risk, setRisk] = useState<string>("");
  const [credits, setCredits] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDashboard();
      const data = res.data;

      const assessments = data.assessments || [];
      const latest = assessments[0]; // newest

      // Latest score
      if (latest) {
        setScore(latest.score);
        setRisk(riskFromScore(latest.score));
      }

      // Credits
      setCredits(data.credits || 0);

      // Streak: count consecutive days where score < 60
      let streakCount = 0;
      for (const a of assessments) {
        if (a.score < 60) streakCount++;
        else break;
      }
      setStreak(streakCount);
    } catch (e) {
      console.error("Popup load error", e);
    }
    setLoading(false);
  };

  const riskFromScore = (score: number) => {
    if (score < 30) return "low";
    if (score < 60) return "medium";
    return "high";
  };

  const getDesc = (level: string) => {
    if (level === "low") return "Excellent mental wellbeing.";
    if (level === "medium") return "Stable, but improvements can help.";
    return "You might be experiencing elevated stress.";
  };

  const getColor = (level: string) => {
    if (level === "low") return "text-green-500";
    if (level === "medium") return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 w-full max-w-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Mental State Overview
          </h2>
          <button onClick={onClose} className={darkMode ? "text-gray-400" : "text-gray-600"}>
            <X />
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : (
          <>
            <div className="mb-4 text-center">
              <div className={`text-5xl font-bold ${getColor(risk)}`}>
                {score ?? "-"}
              </div>
              <div className="mt-2 text-gray-400">{getDesc(risk)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`${darkMode ? "bg-gray-700" : "bg-gray-100"} p-4 rounded-lg`}>
                <div className="flex items-center gap-2">
                  <TrendingUp />
                  <span>Streak</span>
                </div>
                <div className="text-xl font-bold mt-2">{streak} days</div>
              </div>

              <div className={`${darkMode ? "bg-gray-700" : "bg-gray-100"} p-4 rounded-lg`}>
                <div className="flex items-center gap-2">
                  <CreditCard />
                  <span>Credits</span>
                </div>
                <div className="text-xl font-bold mt-2">{credits}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
