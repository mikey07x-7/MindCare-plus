// frontend/src/pages/LoginPage.tsx
import React from "react";
import { Brain, Sun, Moon } from "lucide-react";
import { sendOtp, verifyRegister, login } from "../api";

type Props = {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  onLogin: () => void;
};

export default function LoginPage({ darkMode, setDarkMode, onLogin }: Props) {
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const extractError = (err: any) => {
    const data = err?.response?.data;
    if (!data) return err?.message || "Unknown error";
    if (typeof data === "string") return data;
    if (typeof data === "object") {
      return data.detail || data.msg || data.error || JSON.stringify(data);
    }
    return String(data);
  };

  const handleSendOtp = async () => {
    if (!email) return setError("Email is required");
    setLoading(true);
    setError(null);
    try {
      await sendOtp(email);
      setOtpSent(true);
    } catch (err: any) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!email || !otp || !password) return setError("All fields required");
    setLoading(true);
    setError(null);
    try {
      const res = await verifyRegister(email, otp, password);
      // verifyRegister in api.ts already saves token to localStorage,
      // but to be 100% sure, set it here again if present:
      const token = res?.access_token || res?.accessToken || null;
      if (token) localStorage.setItem("mc_token", token);
      onLogin();
    } catch (err: any) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return setError("Enter email and password");
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      const token = res?.access_token || res?.accessToken || null;
      if (token) localStorage.setItem("mc_token", token);
      onLogin();
    } catch (err: any) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900"
          : "bg-gradient-to-br from-blue-50 via-white to-cyan-50"
      } flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6">
          <div
            className={`w-24 h-24 rounded-full ${
              darkMode
                ? "bg-gradient-to-br from-cyan-500 to-purple-600"
                : "bg-gradient-to-br from-cyan-400 to-purple-500"
            } flex items-center justify-center shadow-2xl mx-auto`}
          >
            <Brain size={48} className="text-white" />
          </div>
          <h1 className={`text-5xl font-bold mt-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Mind<span className="text-cyan-500">care+</span>
          </h1>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>Student Mental Wellbeing Platform</p>
        </div>

        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-8 rounded-3xl shadow-2xl`}>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setAuthMode("login"); setOtpSent(false); }}
              className={`flex-1 py-3 rounded-xl ${authMode === "login" ? "bg-cyan-500 text-white" : "bg-gray-100"}`}
            >
              Login
            </button>
            <button
              onClick={() => { setAuthMode("register"); setOtpSent(false); }}
              className={`flex-1 py-3 rounded-xl ${authMode === "register" ? "bg-cyan-500 text-white" : "bg-gray-100"}`}
            >
              Register
            </button>
          </div>

          <div className="space-y-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl"
              placeholder="Email"
            />

            {/* Password shown for both login & register to ensure consistent UX */}
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full p-3 rounded-xl"
              placeholder="Password"
            />

            {!otpSent && (
              <>
                <button
                  onClick={authMode === "login" ? handleLogin : handleSendOtp}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                >
                  {loading ? (authMode === "login" ? "Logging in..." : "Sending...") : (authMode === "login" ? "Login" : "Send OTP")}
                </button>
              </>
            )}

            {otpSent && (
              <>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 rounded-xl"
                  placeholder="Enter OTP"
                />

                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                >
                  {loading ? "Verifying..." : "Verify & Register"}
                </button>
              </>
            )}
          </div>

          {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mt-6 px-4 py-2 rounded-full bg-gray-800 text-white mx-auto block"
        >
          {darkMode ? (
            <span className="flex items-center gap-2">
              <Sun size={16} /> Light Mode
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Moon size={16} /> Dark Mode
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
