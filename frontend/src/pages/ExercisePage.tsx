// frontend/src/pages/ExercisePage.tsx
import React, { useState, useEffect } from "react";
import { completeExercise } from "../api";

export default function ExercisePage({ darkMode }: { darkMode: boolean }) {
  const [active, setActive] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [running, setRunning] = useState(false);

  const exercises = [
    { id: 1, title: "Creative Arts", minutes: 30, points: 10 },
    { id: 2, title: "Music & Rhythm", minutes: 20, points: 10 },
    { id: 3, title: "Reading & Writing", minutes: 25, points: 10 },
    { id: 4, title: "Talk About Your Mind", minutes: 15, points: 15 }
  ];

  useEffect(() => {
    let t: any;
    if (running && timeLeft > 0) {
      t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    }
    if (timeLeft === 0 && running) {
      setRunning(false);
      onComplete();
    }
    return () => clearInterval(t);
  }, [running, timeLeft]);

  const startExercise = (ex: any) => {
    setActive(ex);
    setTimeLeft(ex.minutes * 60);
    setRunning(true);
  };

  const onComplete = async () => {
    if (!active) return;
    try {
      await completeExercise({ exercise_id: active.id, points: active.points });
      alert(`Exercise completed — you earned ${active.points} points`);
    } catch (e) {
      console.error(e);
      alert("Failed to record points. Try again later.");
    } finally {
      setActive(null);
      setTimeLeft(0);
      setRunning(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} p-6`}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        {exercises.map((ex) => (
          <div key={ex.id} className={`p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h2 className="text-xl font-bold">{ex.title}</h2>
            <p className="mt-2">Duration: {ex.minutes} min</p>
            <p className="mt-2">Reward: {ex.points} points</p>
            <button onClick={() => startExercise(ex)} className="mt-4 bg-cyan-500 text-white px-4 py-2 rounded">Start</button>
          </div>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h3 className="text-xl font-bold mb-2">{active.title}</h3>
            <div className="text-4xl font-mono my-4">{formatTime(timeLeft)}</div>
            <div className="flex gap-2">
              {running ? (
                <button onClick={() => setRunning(false)} className="px-4 py-2 bg-yellow-500 text-white rounded">Pause</button>
              ) : (
                <button onClick={() => setRunning(true)} className="px-4 py-2 bg-green-500 text-white rounded">Resume</button>
              )}
              <button onClick={() => { setRunning(false); onComplete(); }} className="px-4 py-2 bg-red-500 text-white rounded">End</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
