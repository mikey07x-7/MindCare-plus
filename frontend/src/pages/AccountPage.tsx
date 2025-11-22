import React, { useEffect, useState, useCallback } from "react";
import { getProfile, updateProfile, changePassword, getCredits, logout } from "../api";

export default function AccountPage({ darkMode }: { darkMode: boolean }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [privacyShare, setPrivacyShare] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMessage, setPwMessage] = useState<string | null>(null);

  const [credits, setCredits] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const profileRes = await getProfile();
      const p = profileRes.data;

      setUser(p);
      setName(p.name || "");
      setPhone(p.phone || "");
      setPrivacyShare((p.privacy?.shareData) ?? true);

      const creditsRes = await getCredits();
      setCredits(creditsRes.data.credits ?? 0);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("mc_token");
        window.location.href = "/";
        return;
      }
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const onSaveProfile = async () => {
    setSaving(true);
    setError(null);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        privacy: { shareData: privacyShare },
      });

      await load();
      alert("Profile saved.");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    if (!oldPassword || !newPassword)
      return setPwMessage("Enter both old and new password.");

    try {
      await changePassword(oldPassword, newPassword);
      setPwMessage("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      console.error(err);
      setPwMessage(
        err?.response?.data?.detail || "Failed to update password."
      );
    }
  };

  const onLogout = async () => {
    try {
      await logout();
    } catch {}
    localStorage.removeItem("mc_token");
    window.location.href = "/";
  };

  const inputClass = `
    w-full p-3 rounded-lg 
    ${darkMode ? "bg-gray-700 text-white placeholder-gray-400" : "bg-white text-gray-900"}
  `;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading account...
      </div>
    );

  return (
    <div
      className={`min-h-screen p-8 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Account Settings</h1>

        {error && <div className="mb-4 text-red-400">{error}</div>}

        {/* Profile section */}
        <div className={`p-6 rounded-2xl mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-xl font-semibold mb-4">Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email (readonly)</label>
              <input
                value={user?.email || ""}
                readOnly
                className={`w-full p-3 rounded-lg opacity-90 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-800"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <span>Privacy: Allow sharing anonymized usage data</span>
              <input
                type="checkbox"
                checked={privacyShare}
                onChange={(e) => setPrivacyShare(e.target.checked)}
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={onSaveProfile}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>

              <button
                onClick={() => {
                  setName(user?.name || "");
                  setPhone(user?.phone || "");
                }}
                className="px-6 py-2 rounded-lg bg-gray-600 text-white"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Password section */}
        <div className={`p-6 rounded-2xl mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-xl font-semibold mb-4">Password & Security</h2>

          <input
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={inputClass}
            type="password"
            placeholder="Current password"
          />

          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            type="password"
            placeholder="New password"
          />

          <button
            onClick={onChangePassword}
            className="mt-3 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
          >
            Change password
          </button>
          {pwMessage && <div className="text-sm mt-2">{pwMessage}</div>}
        </div>

        {/* Credits */}
        <div className={`p-6 rounded-2xl mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Credits</div>
              <div className="text-sm opacity-70">Points earned via exercises</div>
            </div>
            <div className="text-3xl font-bold">{credits ?? 0}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
