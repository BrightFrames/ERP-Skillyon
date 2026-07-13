import React, { useEffect, useState } from "react";
import StudentLogin from "./StudentLogin";
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  CreditCard,
  LogOut,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  Settings,
  Menu,
  X,
} from "lucide-react";
import StudentSettings from "./StudentSettings";
import { fetchAndApplySettings } from "./settings";
import { useLanguage, t } from "./i18n";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lang = useLanguage();

  useEffect(() => {
    const init = async () => {
      // Fetch and apply global appearance settings
      fetchAndApplySettings();

      const userStr = localStorage.getItem("student_user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    };
    init();
  }, []);

  if (!localStorage.getItem("student_token") || !user) {
    return <StudentLogin onSuccess={(u) => setUser(u)} />;
  }

  const logout = () => {
    localStorage.removeItem("student_token");
    localStorage.removeItem("student_user");
    setUser(null);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "academics", label: "Academics", icon: GraduationCap },
    { id: "fees", label: "Fees", icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden selection:bg-indigo-500/30 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Premium Theme */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-slate-800/50 flex flex-col transform transition-transform duration-300 ease-in-out md:transform-none ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
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
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Student Portal</p>
            </div>
            <button
              className="md:hidden text-zinc-400 hover:text-white ml-auto"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto mt-2">
          {navItems.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setIsMobileMenuOpen(false);
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
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 cursor-pointer"
          >
            <LogOut size={18} />
            {t("Sign out", lang)}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full md:w-auto h-full overflow-hidden bg-[#f8fafc] dark:bg-slate-950 relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none dark:from-indigo-950/20"></div>
        {/* Top Header */}
        <header className="h-20 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0 dark:bg-slate-900/80 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-zinc-650 hover:text-zinc-900 bg-zinc-100 rounded-lg dark:bg-slate-800 dark:text-slate-350"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {t(navItems.find((item) => item.id === tab)?.label || "", lang)}
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6 ml-4">
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-2 group">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-slate-900 leading-tight dark:text-slate-100">
                  {user.name}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {t("Student", lang)}
                </div>
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center text-sm font-bold border-2 border-white shadow-md shrink-0 dark:border-slate-800">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 relative">
          <div className="max-w-5xl mx-auto h-full">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {tab === "dashboard" && <Dashboard user={user} setTab={setTab} />}
              {tab === "attendance" && <Attendance />}
              {tab === "academics" && <Academics />}
              {tab === "fees" && <Fees />}
              {tab === "settings" && <StudentSettings />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Dashboard({ user, setTab }) {
  return (
    <div className="space-y-6">
      <div className="bg-linear-to-br from-sky-500 to-blue-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-sky-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">
            Hello, {user.name}! 👋
          </h2>
          <p className="text-sky-100 max-w-md">
            Welcome back to your portal. Have a great day of learning ahead.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Link Cards */}
        <button
          onClick={() => setTab("attendance")}
          className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col items-start gap-4 hover:border-sky-200 hover:shadow-md transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Attendance</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Check your daily presence.
            </p>
          </div>
        </button>

        <button
          onClick={() => setTab("academics")}
          className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col items-start gap-4 hover:border-sky-200 hover:shadow-md transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Academics</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              View your exam results.
            </p>
          </div>
        </button>

        <div className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Today's Tip</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Stay consistent with your homework to keep stress away!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Attendance() {
  const [data, setData] = useState({ summary: null, active: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/student-portal/attendance", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("student_token")}`,
      },
    })
      .then((r) => r.json())
      .then((res) => {
        setData({ summary: res.summary, active: res.data || [] });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Attendance
        </h2>
        <p className="text-sm text-slate-500">
          Your presence record for the year.
        </p>
      </div>

      {data.summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">
              Percentage
            </span>
            <span
              className={`text-3xl font-bold ${data.summary.percent >= 75 ? "text-teal-500" : "text-rose-500"}`}
            >
              {data.summary.percent}%
            </span>
          </div>
          <div className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">
              Total Days
            </span>
            <span className="text-3xl font-bold text-slate-800">
              {data.summary.total}
            </span>
          </div>
          <div className="hidden sm:flex bg-white p-5 rounded-[20px] border border-slate-100 flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">
              Present
            </span>
            <span className="text-3xl font-bold text-teal-500">
              {data.summary.present}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-24 bg-slate-100 rounded-[20px] animate-pulse"></div>
      )}

      <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Recent Records</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin"></div>
              <span className="text-xs font-semibold text-slate-400">
                Loading attendance...
              </span>
            </div>
          ) : data.active.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">
              No recent records.
            </div>
          ) : (
            data.active.map((r, i) => (
              <div
                key={i}
                className="px-5 py-4 flex items-center justify-between hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-800">
                    {new Date(r.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(r.date).toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    r.status === "PRESENT"
                      ? "bg-teal-50 text-teal-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {r.status === "PRESENT" ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                  )}
                  {r.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Academics() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/student-portal/academics", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("student_token")}`,
      },
    })
      .then((r) => r.json())
      .then((res) => {
        setMarks(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Academics
        </h2>
        <p className="text-sm text-slate-500">Exam scores and performance.</p>
      </div>

      <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Exam</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Score</th>
                <th className="px-5 py-4">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin"></div>
                      <span className="text-xs font-semibold text-slate-400">
                        Loading academics...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : marks.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-8 text-center text-slate-400 text-sm font-medium"
                  >
                    No academics data found.
                  </td>
                </tr>
              ) : (
                marks.map((m, i) => {
                  const pct = Math.round((m.score / m.max_score) * 100);
                  return (
                    <tr
                      key={i}
                      className="hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {m.exam_name}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{m.subject}</td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900">
                          {m.score}
                        </span>
                        <span className="text-slate-400">/{m.max_score}</span>
                      </td>
                      <td className="px-5 py-4 min-w-37.5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 75 ? "bg-sky-500" : pct >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${pct >= 75 ? "text-sky-600" : pct >= 50 ? "text-amber-600" : "text-rose-600"}`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/student-portal/fees", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("student_token")}`,
      },
    })
      .then((r) => r.json())
      .then((res) => {
        setFees(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Fees</h2>
        <p className="text-sm text-slate-500">Your fee payment history.</p>
      </div>

      <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin"></div>
              <span className="text-xs font-semibold text-slate-400">
                Loading fees...
              </span>
            </div>
          ) : fees.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">
              No fee records found.
            </div>
          ) : (
            fees.map((f, i) => (
              <div
                key={i}
                className="px-5 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-800 text-lg mb-0.5">
                    {f.term}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Calendar size={14} /> Due:{" "}
                    {new Date(f.due_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <span className="font-bold text-xl text-slate-900">
                    ₹{f.amount}
                  </span>
                  <span
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                      f.status === "PAID"
                        ? "bg-teal-50 text-teal-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
