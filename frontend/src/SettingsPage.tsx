import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  Shield,
  Globe,
  Palette,
  Save,
  Eye,
  EyeOff,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import api from "./lib/api";
import { applySettings } from "./lib/settings";
import { useLanguage, t } from "./lib/i18n";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const lang = useLanguage();
  const [active, setActive] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};

  const [profile, setProfile] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "",
    phone: "",
    address: "",
  });

  const [notifications, setNotifications] = useState({
    emailGrades: true,
    emailFees: true,
    emailAnnouncements: false,
    browserAlerts: true,
    weeklyDigest: true,
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    density: "comfortable",
    language: "English",
  });

  useEffect(() => {
    api
      .get("/user/settings")
      .then((res) => {
        if (res.data) {
          if (res.data.profile && Object.keys(res.data.profile).length > 0)
            setProfile((prev) => ({ ...prev, ...res.data.profile }));
          if (
            res.data.notifications &&
            Object.keys(res.data.notifications).length > 0
          )
            setNotifications(res.data.notifications);
          if (
            res.data.appearance &&
            Object.keys(res.data.appearance).length > 0
          ) {
            setAppearance(res.data.appearance);
            applySettings(res.data.appearance);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    try {
      await api.put("/user/settings", { profile, notifications, appearance });
      applySettings(appearance);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save settings", error);
    }
  };

  const Toggle = ({
    value,
    onChange,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-background rounded-full shadow transition-all ${value ? "left-6" : "left-1"}`}
      />
    </button>
  );

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
          {t("Settings", lang)}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {t(
            "Manage your account, preferences, and system configuration.",
            lang,
          )}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-56 shrink-0">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold transition-colors border-b border-zinc-100 last:border-0 ${
                  active === s.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <s.icon size={16} />
                  {t(s.label, lang)}
                </div>
                {active === s.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            {/* Profile */}
            {active === "profile" && (
              <div>
                <h2 className="text-base font-bold text-foreground mb-5">
                  Profile Information
                </h2>
                <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shrink-0">
                    {profile.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {profile.name || "User"}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground mt-0.5">
                      {profile.role}
                    </p>
                    <button className="text-xs font-bold text-primary hover:underline mt-1.5">
                      Change Avatar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Full Name",
                      key: "name",
                      type: "text",
                      placeholder: "Your full name",
                    },
                    {
                      label: "Email Address",
                      key: "email",
                      type: "email",
                      placeholder: "your@email.com",
                    },
                    {
                      label: "Phone Number",
                      key: "phone",
                      type: "tel",
                      placeholder: "+91 00000 00000",
                    },
                    {
                      label: "Address",
                      key: "address",
                      type: "text",
                      placeholder: "City, Country",
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        value={(profile as any)[field.key]}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            [field.key]: e.target.value,
                          })
                        }
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:border-primary focus:outline-none transition-colors bg-background"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profile.role}
                      disabled
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {active === "security" && (
              <div>
                <h2 className="text-base font-bold text-foreground mb-5">
                  Security Settings
                </h2>
                <div className="flex flex-col gap-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="Enter current password"
                        className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:border-primary focus:outline-none pr-10 transition-colors bg-background"
                      />
                      <button
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        placeholder="Enter new password"
                        className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:border-primary focus:outline-none pr-10 transition-colors bg-background"
                      />
                      <button
                        onClick={() => setShowNewPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:border-primary focus:outline-none pr-10 transition-colors bg-background"
                      />
                      <button
                        onClick={() => setShowConfirmPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showConfirmPass ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-border">
                  <h3 className="text-sm font-bold text-foreground mb-3">
                    Active Sessions
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Current Browser Session
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        Active right now · {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {active === "notifications" && (
              <div>
                <h2 className="text-base font-bold text-foreground mb-5">
                  Notification Preferences
                </h2>
                <div className="flex flex-col divide-y divide-border">
                  {[
                    {
                      key: "emailGrades",
                      label: "Grade Updates",
                      desc: "When new marks are added or updated",
                    },
                    {
                      key: "emailFees",
                      label: "Fee Reminders",
                      desc: "Payment due dates and overdue notices",
                    },
                    {
                      key: "emailAnnouncements",
                      label: "Announcements",
                      desc: "School-wide notices and events",
                    },
                    {
                      key: "browserAlerts",
                      label: "Browser Alerts",
                      desc: "Real-time notifications in the browser",
                    },
                    {
                      key: "weeklyDigest",
                      label: "Weekly Digest",
                      desc: "A summary of the week every Monday",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {item.label}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                      <Toggle
                        value={(notifications as any)[item.key]}
                        onChange={(v) =>
                          setNotifications({ ...notifications, [item.key]: v })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance */}
            {active === "appearance" && (
              <div>
                <h2 className="text-base font-bold text-foreground mb-5">
                  {t("Appearance", lang)}
                </h2>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-3">
                      {t("Theme", lang)}
                    </label>
                    <div className="flex gap-3">
                      {["light", "dark", "system"].map((tName) => (
                        <button
                          key={tName}
                          onClick={() => {
                            const nextAppearance = {
                              ...appearance,
                              theme: tName,
                            };
                            setAppearance(nextAppearance);
                            applySettings(nextAppearance);
                          }}
                          className={`flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                            appearance.theme === tName
                              ? "bg-primary text-primary-foreground border-primary shadow-md"
                              : "bg-card text-muted-foreground border-border hover:border-border/80"
                          }`}
                        >
                          {t(tName, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-3">
                      {t("Display Density", lang)}
                    </label>
                    <div className="flex gap-3">
                      {["compact", "comfortable", "spacious"].map((d) => (
                        <button
                          key={d}
                          onClick={() =>
                            setAppearance({ ...appearance, density: d })
                          }
                          className={`flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                            appearance.density === d
                              ? "bg-primary text-primary-foreground border-primary shadow-md"
                              : "bg-card text-muted-foreground border-border hover:border-border/80"
                          }`}
                        >
                          {t(d, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                      {t("Language", lang)}
                    </label>
                    <select
                      value={appearance.language}
                      onChange={(e) =>
                        setAppearance({
                          ...appearance,
                          language: e.target.value,
                        })
                      }
                      className="w-full max-w-xs px-3 py-2.5 text-sm border border-border rounded-xl focus:border-primary focus:outline-none transition-colors bg-background"
                    >
                      {[
                        "English",
                        "Hindi",
                        "Marathi",
                        "Tamil",
                        "Telugu",
                        "Gujarati",
                      ].map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* System */}
            {active === "system" && (
              <div>
                <h2 className="text-base font-bold text-foreground mb-5">
                  System Information
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "System Version", value: "Skillyon ERP v2.0" },
                    { label: "Environment", value: "Development" },
                    { label: "Database", value: "PostgreSQL" },
                    { label: "Backend", value: "Express.js" },
                    { label: "Frontend", value: "React + Vite" },
                    { label: "Auth", value: "JWT" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-muted rounded-xl p-4 border border-border"
                    >
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 text-xs font-bold text-red-500 border border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                    Clear Cache
                  </button>
                  <button className="px-4 py-2.5 text-xs font-bold text-muted-foreground border border-border bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                    Export Logs
                  </button>
                </div>
              </div>
            )}

            {/* Save Button */}
            {active !== "system" && (
              <div className="flex items-center gap-3 mt-7 pt-5 border-t border-zinc-100">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Save size={15} />
                  {t("Save Changes", lang)}
                </button>
                {saved && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <CheckCircle size={14} />
                    {t("Saved successfully!", lang)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
