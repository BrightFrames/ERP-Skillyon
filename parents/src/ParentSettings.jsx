import React, { useState, useEffect } from "react";
import { Palette, Save, CheckCircle } from "lucide-react";
import { applySettings } from "./settings";
import { useLanguage, t } from "./i18n";

export default function ParentSettings() {
  const lang = useLanguage();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [notifications, setNotifications] = useState({});
  const [appearance, setAppearance] = useState({
    theme: "light",
    density: "comfortable",
    language: "English",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/user/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) setProfile(data.profile);
          if (data.notifications) setNotifications(data.notifications);
          if (data.appearance && Object.keys(data.appearance).length > 0) {
            setAppearance({ ...data.appearance, theme: "light" });
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const normalizedAppearance = { ...appearance, theme: "light" };
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profile,
          notifications,
          appearance: normalizedAppearance,
        }),
      });

      if (res.ok) {
        setAppearance(normalizedAppearance);
        applySettings(normalizedAppearance);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center dark:bg-slate-800 dark:text-teal-400">
          <Palette size={20} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
            {t("Appearance", lang)}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Customize your theme, display layout, and language
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 max-w-xl">
        {/* Theme Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
            {t("Theme", lang)}
          </label>
          <div className="flex gap-3">
            {["light", "dark", "system"].map((tName) => (
              <button
                key={tName}
                onClick={() => setAppearance({ ...appearance, theme: tName })}
                className={`flex-1 py-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                  appearance.theme === tName
                    ? "bg-teal-600 text-white border-teal-600 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {t(tName.charAt(0).toUpperCase() + tName.slice(1), lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Display Density Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
            {t("Display Density", lang)}
          </label>
          <div className="flex gap-3">
            {["compact", "comfortable", "spacious"].map((d) => (
              <button
                key={d}
                onClick={() => setAppearance({ ...appearance, density: d })}
                className={`flex-1 py-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                  appearance.density === d
                    ? "bg-teal-600 text-white border-teal-600 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {t(d.charAt(0).toUpperCase() + d.slice(1), lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
            {t("Language", lang)}
          </label>
          <select
            value={appearance.language}
            onChange={(e) =>
              setAppearance({ ...appearance, language: e.target.value })
            }
            className="w-full max-w-xs bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-300"
          >
            {["English", "Hindi", "Marathi", "Tamil", "Telugu", "Gujarati"].map(
              (l) => (
                <option key={l}>{l}</option>
              ),
            )}
          </select>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-3 mt-4 pt-5 border-t border-gray-100 dark:border-slate-800/60">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Save size={14} />
            {t("Save Changes", lang)}
          </button>
          {saved && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <CheckCircle size={14} />
              {t("Saved successfully!", lang)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
