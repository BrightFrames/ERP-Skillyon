import React, { useEffect, useState } from "react";
import ParentDashboard from "./ParentDashboard";
import ParentAttendance from "./ParentAttendance";
import ParentFees from "./ParentFees";
import ParentAcademics from "./ParentAcademics";
import ParentCommunication from "./ParentCommunication";
import ParentTransport from "./ParentTransport";
import ParentSettings from "./ParentSettings";
import ParentLogin from "./ParentLogin";
import Toast from "./Toast";
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  CreditCard,
  MessageSquare,
  Bus,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Search,
} from "lucide-react";
import { fetchAndApplySettings } from "./settings";
import { useLanguage, t } from "./i18n";
import ThemeToggle from "./components/ThemeToggle";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "academics", label: "Academics", icon: GraduationCap },
  { id: "fees", label: "Fees", icon: CreditCard },
  { id: "communication", label: "Messages", icon: MessageSquare },
  { id: "transport", label: "Transport", icon: Bus },
];

export default function App() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const lang = useLanguage();

  const userStr = localStorage.getItem("user");
  const loggedInUser = userStr
    ? (() => {
        try {
          return JSON.parse(userStr);
        } catch {
          return {};
        }
      })()
    : {};
  const displayName = loggedInUser.name || loggedInUser.email || "Parent";

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/parent/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch("/api/parent/notifications/read", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Initialize layout appearance settings (theme, density, language)
      fetchAndApplySettings();
      fetchNotifications();

      let user = null;
      try {
        const userStr = localStorage.getItem("user");
        user = userStr ? JSON.parse(userStr) : null;
        if (!user || !user.children || user.children.length === 0) {
          const token = localStorage.getItem("token");
          if (token) {
            const res = await fetch("/api/user/profile", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              user = await res.json();
              localStorage.setItem("user", JSON.stringify(user));
            } else if (res.status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.reload();
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
      const kids = user?.children || [];
      setChildren(kids);
      if (kids.length > 0) setSelectedChild(kids[0].id);
    };
    init();
  }, []);

  if (!localStorage.getItem("token") || !localStorage.getItem("user")) {
    return (
      <ParentLogin
        onSuccess={(user) => {
          const kids = user?.children || [];
          setChildren(kids);
          if (kids.length > 0) setSelectedChild(kids[0].id);
          setTab("dashboard");
          setToast("Signed in successfully");
          fetchNotifications();
        }}
      />
    );
  }

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "P";

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Toast message={toast} onClose={() => setToast(null)} />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Premium Theme */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-slate-800/50 flex flex-col transition-all duration-200 ease-out md:transform-none ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Brand */}
        <div className="p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
                Skill<span className="text-indigo-400">yon</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Parent Portal</p>
            </div>
            <button
              className="md:hidden text-zinc-400 hover:text-white ml-auto"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Child selector */}
        {children.length > 1 && (
          <div className="px-6 pb-2">
            <div className="relative">
              <select
                value={selectedChild || ""}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 text-slate-100 text-sm font-semibold rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0f172a] text-slate-100">
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto mt-2">
          {navItems.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all text-sm font-semibold relative overflow-hidden group cursor-pointer ${
                  active
                    ? 'text-indigo-300 bg-indigo-500/12 border border-indigo-500/30 shadow-[0_4px_12px_rgba(99,102,241,0.08)]'
                    : 'text-slate-400 hover:bg-indigo-500/5 hover:text-indigo-300'
                }`}
              >
                {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full" />}
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'} />
                {t(item.label, lang)}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-[#0f172a]/50 mb-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setChildren([]);
              setSelectedChild(null);
              setTab("dashboard");
              setToast("Logged out");
              window.location.reload();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 cursor-pointer"
          >
            <LogOut size={18} />
            {t("Sign out", lang)}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-[#f8fafc] dark:bg-slate-950 relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none dark:from-indigo-950/20"></div>
        {/* Top bar */}
        <header className="h-20 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0 dark:bg-slate-900/80 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-slate-850"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {t(
                navItems.find((n) => n.id === tab)?.label || "Dashboard",
                lang,
              )}
            </h1>
          </div>
          <div className="flex items-center gap-4 lg:gap-6 ml-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    markNotificationsAsRead();
                  }
                }}
                className="p-2 text-slate-450 hover:text-slate-650 hover:bg-slate-100 rounded-xl transition-colors relative dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
              >
                <Bell size={20} />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-slate-900"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200/60 shadow-2xl z-50 py-2 dark:bg-slate-900 dark:border-slate-800">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {t("Notifications", lang)}
                    </span>
                    {notifications.some((n) => !n.read) && (
                      <button
                        onClick={markNotificationsAsRead}
                        className="text-[10px] text-teal-600 hover:text-teal-700 font-bold uppercase cursor-pointer"
                      >
                        {t("Mark Read", lang)}
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/40">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400 font-semibold">
                        {t("No new notifications", lang)}
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-all ${!n.read ? "bg-teal-50/10 dark:bg-teal-950/5" : ""}`}
                        >
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {t(n.title, lang)}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                            {t(n.message, lang)}
                          </p>
                          <span className="text-[8px] text-slate-400 font-bold block mt-1">
                            {new Date(n.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-2 group">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-slate-900 leading-tight dark:text-slate-100">{displayName}</div>
                <div className="text-xs font-semibold text-slate-500">{t("Parent", lang)}</div>
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center text-sm font-bold border-2 border-white shadow-md shrink-0 dark:border-slate-800">
                {getInitials(displayName)}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10 relative">
          <div className="max-w-6xl mx-auto">
            {tab === "dashboard" && (
              <ParentDashboard
                selectedChild={selectedChild}
                onChildChange={setSelectedChild}
              />
            )}
            {tab === "attendance" && (
              <ParentAttendance childId={selectedChild} />
            )}
            {tab === "fees" && <ParentFees childId={selectedChild} />}
            {tab === "academics" && <ParentAcademics childId={selectedChild} />}
            {tab === "communication" && (
              <ParentCommunication childId={selectedChild} />
            )}
            {tab === "transport" && <ParentTransport childId={selectedChild} />}
            {tab === "settings" && <ParentSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}
