import React, { useState, useEffect, Suspense } from "react";

import Navigation from "./components/Navigation";
import MentalStatePopup from "./components/MentalStatePopup";

// Lazy-loaded pages
const HomePage = React.lazy(() => import("./pages/HomePage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const AssessmentPage = React.lazy(() => import("./pages/AssessmentPage"));
const ChatbotPage = React.lazy(() => import("./pages/ChatbotPage"));
const ExercisePage = React.lazy(() => import("./pages/ExercisePage"));
const SubscriptionPage = React.lazy(() => import("./pages/SubscriptionPage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const AccountPage = React.lazy(() => import("./pages/AccountPage"));

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState("login");
  const [showMentalState, setShowMentalState] = useState(false);

  const [formData, setFormData] = useState({
    sleepHours: 7,
    screenTime: 3,
    deadlineDays: 7,
    exerciseMinutes: 30,
    moodScore: 6,
    studyHours: 4,
    priorTherapy: "no"
  });

  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your 24/7 mental wellness companion. How can I assist you today?"
    }
  ]);

  // 🔥 AUTH GUARD — check token on app load and page changes
  useEffect(() => {
    const token = localStorage.getItem("mc_token");

    if (!token) {
      // Not logged in → force login page
      if (currentPage !== "login") setCurrentPage("login");
    } else {
      // Logged in → prevent going back to login page
      if (currentPage === "login") setCurrentPage("main");
    }
  }, [currentPage]);

  // Logout handler from Navigation
  const handleLogout = () => {
    localStorage.removeItem("mc_token");
    setCurrentPage("login");
  };

  const isAuthenticated = !!localStorage.getItem("mc_token");

  return (
    <div className={darkMode ? "dark bg-gray-900" : "bg-gray-100"}>

      {/* Mental State Popup */}
      {showMentalState && (
        <MentalStatePopup 
          darkMode={darkMode}
          onClose={() => setShowMentalState(false)}
        />
      )}

      {/* Navigation — only shown when logged in */}
      {isAuthenticated && currentPage !== "login" && (
        <Navigation
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setCurrentPage={setCurrentPage}
          setShowMentalState={setShowMentalState}
          onLogout={handleLogout}
        />
      )}

      <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading...</div>}>

        {/* LOGIN PAGE */}
        {currentPage === "login" && (
          <LoginPage
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onLogin={() => setCurrentPage("main")}
          />
        )}

        {/* BLOCK ALL OTHER PAGES IF NOT AUTHENTICATED */}
        {isAuthenticated && currentPage === "main" && (
          <HomePage darkMode={darkMode} setCurrentPage={setCurrentPage} />
        )}

        {isAuthenticated && currentPage === "dashboard" && (
          <DashboardPage
            darkMode={darkMode}
            setCurrentPage={setCurrentPage}
            setShowMentalState={setShowMentalState}
          />
        )}

        {isAuthenticated && currentPage === "assessment" && (
          <AssessmentPage
            darkMode={darkMode}
            formData={formData}
            setFormData={setFormData}
            setCurrentPage={setCurrentPage}
          />
        )}

        {isAuthenticated && currentPage === "chatbot" && (
          <ChatbotPage
            darkMode={darkMode}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
          />
        )}

        {isAuthenticated && currentPage === "exercise" && (
          <ExercisePage darkMode={darkMode} />
        )}

        {isAuthenticated && currentPage === "subscription" && (
          <SubscriptionPage darkMode={darkMode} />
        )}

        {isAuthenticated && currentPage === "about" && (
          <AboutPage darkMode={darkMode} />
        )}

        {isAuthenticated && currentPage === "account" && (
          <AccountPage darkMode={darkMode} setCurrentPage={setCurrentPage} />
        )}

      </Suspense>
    </div>
  );
}
