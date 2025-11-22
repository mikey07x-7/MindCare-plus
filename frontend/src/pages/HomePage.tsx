import React from "react";
import { Brain, Sparkles, MessageCircle, Activity, BarChart } from "lucide-react";

export default function HomePage({ darkMode, setCurrentPage }: any) {
  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-cyan-50 to-blue-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 text-center">
        {/* Hero Logo */}
        <div className={`mx-auto w-28 h-28 rounded-full shadow-2xl flex items-center justify-center mb-6 
          ${darkMode ? "bg-gradient-to-br from-cyan-500 to-purple-600" : "bg-gradient-to-br from-cyan-400 to-purple-500"}
        `}>
          <Brain size={48} className="text-white" />
        </div>

        {/* Main Title */}
        <h1 className={`text-5xl font-extrabold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Welcome to <span className="text-cyan-500">Mindcare+</span>
        </h1>

        <p className={`max-w-2xl mx-auto text-lg mb-10 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          Your personal AI-powered mental wellbeing companion — designed to help students track, improve, and maintain emotional balance every day.
        </p>

        {/* Main CTA Buttons */}
        <div className="flex justify-center gap-4 mb-16">
          <button
            onClick={() => setCurrentPage("assessment")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            Start Assessment
          </button>

          <button
            onClick={() => setCurrentPage("dashboard")}
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition ${
              darkMode
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-white text-gray-900 hover:bg-gray-100"
            }`}
          >
            View Dashboard
          </button>
        </div>

        {/* Features Section */}
        <h2 className={`text-3xl font-bold mb-8 ${darkMode ? "text-white" : "text-gray-900"}`}>
          What You Can Do
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Box 1 */}
          <div
            className={`p-8 rounded-3xl shadow-xl transition ${
              darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"
            }`}
          >
            <MessageCircle size={40} className="text-cyan-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">24/7 AI Chatbot</h3>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Talk anytime — get real-time advice when you're stressed or confused.
            </p>
            <button
              onClick={() => setCurrentPage("chatbot")}
              className="mt-4 underline text-cyan-500"
            >
              Try Chatbot →
            </button>
          </div>

          {/* Box 2 */}
          <div
            className={`p-8 rounded-3xl shadow-xl transition ${
              darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"
            }`}
          >
            <Activity size={40} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Exercises</h3>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Personalized exercises to refresh your mood and improve mental state.
            </p>
            <button
              onClick={() => setCurrentPage("exercise")}
              className="mt-4 underline text-green-500"
            >
              Explore Exercises →
            </button>
          </div>

          {/* Box 3 */}
          <div
            className={`p-8 rounded-3xl shadow-xl transition ${
              darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"
            }`}
          >
            <BarChart size={40} className="text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Detailed Analytics</h3>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Track your emotional patterns over 30 days and find improvement areas.
            </p>
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="mt-4 underline text-purple-500"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
