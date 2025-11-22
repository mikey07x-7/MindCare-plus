// frontend/src/pages/DashboardPage.tsx
import React, { useEffect, useState } from "react";
import { getDashboard } from "../api";

export default function DashboardPage({ darkMode }: { darkMode: boolean }) {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getDashboard();
      const data = res.data;
      setCredits(data.credits || 0);
      const arr = data.assessments || [];
      setAssessments(arr.slice(0, 30));
    } catch (e) {
      console.error("dashboard load err", e);
    } finally {
      setLoading(false);
    }
  }

  function getColorClass(score: number | null) {
    if (score === null || score === undefined) return "bg-gray-600";
    if (score <= 30) return "bg-green-500";
    if (score <= 60) return "bg-yellow-500";
    return "bg-red-500";
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} p-6`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">30-Day Mental Score Tracking</h1>

        <div className={`p-6 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 30 }).map((_, i) => {
                const item = assessments[i];
                const score = item ? item.score : null;
                return (
                  <div key={i} className={`p-4 rounded-lg text-white ${getColorClass(score)}`}>
                    <div className="text-sm">Day {i + 1}</div>
                    <div className="text-2xl font-bold mt-2">{score !== null ? score : "-"}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 p-4 rounded-lg bg-gray-700 text-white">
            <div className="text-sm">Credits</div>
            <div className="text-2xl font-bold">{credits} points</div>
          </div>
        </div>
      </div>
    </div>
  );
}
