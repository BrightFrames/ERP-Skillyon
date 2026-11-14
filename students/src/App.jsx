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
  BookOpen,
  Award,
  Upload,
  Download,
  Paperclip,
  AlertCircle,
  ArrowLeft,
  Send,
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
    { id: "assignments", label: "Assignments", icon: FileText },
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
              {tab === "assignments" && <Assignments />}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quick Link Cards */}
        <button
          onClick={() => setTab("assignments")}
          className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col items-start gap-4 hover:border-indigo-200 hover:shadow-md transition-all group text-left dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform dark:bg-indigo-950/40 dark:text-indigo-400">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Assignments</h3>
            <p className="text-sm text-slate-500 mt-0.5 dark:text-slate-400">
              Check tasks & homework.
            </p>
          </div>
        </button>

        <button
          onClick={() => setTab("attendance")}
          className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col items-start gap-4 hover:border-sky-200 hover:shadow-md transition-all group text-left dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform dark:bg-teal-950/40 dark:text-teal-400">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Attendance</h3>
            <p className="text-sm text-slate-500 mt-0.5 dark:text-slate-400">
              Check your daily presence.
            </p>
          </div>
        </button>

        <button
          onClick={() => setTab("academics")}
          className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col items-start gap-4 hover:border-sky-200 hover:shadow-md transition-all group text-left dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform dark:bg-sky-950/40 dark:text-sky-400">
            <GraduationCap size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Academics</h3>
            <p className="text-sm text-slate-500 mt-0.5 dark:text-slate-400">
              View your exam results.
            </p>
          </div>
        </button>

        <div className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col items-start gap-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center dark:bg-orange-950/40 dark:text-orange-400">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Today's Tip</h3>
            <p className="text-sm text-slate-500 mt-0.5 dark:text-slate-400">
              Stay consistent with your homework to keep stress away!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Assignments() {
  const [data, setData] = useState({ list: [], summary: { total: 0, pending: 0, submitted: 0, completed: 0 } });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Student upload & submission form state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadData, setUploadData] = useState("");
  const [uploadSize, setUploadSize] = useState("");
  const [studentNotes, setStudentNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchAssignments = () => {
    setLoading(true);
    fetch("/api/student-portal/assignments", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("student_token")}`,
      },
    })
      .then((r) => r.json())
      .then((res) => {
        setData({
          list: res.data || [],
          summary: res.summary || { total: 0, pending: 0, submitted: 0, completed: 0 },
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const openAssignmentModal = (item) => {
    setSelectedAssignment(item);
    setUploadFile(null);
    setUploadData("");
    setUploadSize("");
    setStudentNotes(item.submission_notes || "");
    setSubmitSuccess(false);
  };

  const handleStudentFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert("File size exceeds 25MB limit.");
      return;
    }
    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setUploadFile(file.name);
    setUploadSize(sizeStr);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!uploadData && !studentNotes.trim()) {
      alert("Please upload an assignment file or enter your written answers/notes.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/student-portal/assignments/${selectedAssignment.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("student_token")}`,
        },
        body: JSON.stringify({
          file_name: uploadFile || selectedAssignment.submission_file_name,
          file_data: uploadData || selectedAssignment.submission_file_data,
          file_size: uploadSize || selectedAssignment.submission_file_size,
          notes: studentNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Submission failed");
      }
      setSubmitSuccess(true);
      fetchAssignments();
      // Update current modal state
      setSelectedAssignment((prev) => ({
        ...prev,
        status: prev.status === "Graded" ? "Graded" : "Submitted",
        submission_file_name: uploadFile || prev.submission_file_name,
        submission_file_data: uploadData || prev.submission_file_data,
        submission_file_size: uploadSize || prev.submission_file_size,
        submission_notes: studentNotes,
        submitted_at: new Date().toISOString(),
      }));
    } catch (err) {
      alert(err.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = data.list.filter((item) => {
    if (filter === "PENDING") return item.status === "Pending";
    if (filter === "SUBMITTED") return item.status === "Submitted";
    if (filter === "GRADED") return item.status === "Graded";
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Assignments & Tasks
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Assignments, homework, and projects assigned by your teachers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[20px] border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {data.summary.total}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {data.summary.pending}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0">
            <Upload size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Submitted
            </div>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {data.summary.submitted || 0}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Graded
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {data.summary.completed}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === "ALL"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          All ({data.summary.total})
        </button>
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === "PENDING"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          Pending ({data.summary.pending})
        </button>
        <button
          onClick={() => setFilter("SUBMITTED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === "SUBMITTED"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          Submitted ({data.summary.submitted || 0})
        </button>
        <button
          onClick={() => setFilter("GRADED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === "GRADED"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          Graded ({data.summary.completed})
        </button>
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin"></div>
            <span className="text-xs font-semibold text-slate-400">Loading assignments...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 p-12 text-center">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mx-auto rounded-2xl flex items-center justify-center mb-3">
              <FileText size={28} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
              No assignments found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {filter === "ALL"
                ? "Your teachers haven't assigned any homework or tasks yet."
                : `No assignments matching the "${filter.toLowerCase()}" filter.`}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isGraded = item.status === "Graded";
            const isSubmitted = item.status === "Submitted";
            const scorePct =
              isGraded && item.max_score > 0
                ? Math.round((Number(item.my_score) / Number(item.max_score)) * 100)
                : null;

            const questionsCount = Array.isArray(item.questions)
              ? item.questions.length
              : typeof item.questions === "string"
              ? (JSON.parse(item.questions || "[]") || []).length
              : 0;

            return (
              <div
                key={item.id}
                onClick={() => openAssignmentModal(item)}
                className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 p-5 sm:p-6 hover:shadow-md hover:border-indigo-200 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      {item.type || "Assignment"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {item.subject}
                    </span>
                    {item.class_name && (
                      <span className="text-xs text-slate-400">
                        • {item.class_name}
                      </span>
                    )}
                    {questionsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 flex items-center gap-1">
                        <BookOpen size={12} /> {questionsCount} {questionsCount === 1 ? "Question" : "Questions"}
                      </span>
                    )}
                    {item.attachment_name && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 flex items-center gap-1">
                        <Paperclip size={12} /> Question Paper Attached
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Teacher: <strong className="text-slate-700 dark:text-slate-200">{item.teacher_name}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {item.due_date ? (
                        <span className="text-rose-500 font-bold">
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>Assigned: {item.date ? new Date(item.date).toLocaleDateString() : "Recent"}</span>
                      )}
                    </span>
                    <span>•</span>
                    <span>Max Marks: <strong>{item.max_score || 100}</strong></span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                  {isGraded ? (
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <CheckCircle2 size={13} />
                        Graded
                      </div>
                      <div className="mt-1 font-black text-lg text-slate-900 dark:text-slate-100">
                        {item.my_score} <span className="text-xs font-semibold text-slate-400">/ {item.max_score}</span>
                        {scorePct !== null && (
                          <span className={`ml-2 text-xs font-bold ${scorePct >= 75 ? "text-emerald-500" : scorePct >= 50 ? "text-amber-500" : "text-rose-500"}`}>
                            ({scorePct}%)
                          </span>
                        )}
                      </div>
                    </div>
                  ) : isSubmitted ? (
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
                        <CheckCircle2 size={13} />
                        Submitted
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Pending Grading</div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                      <Clock size={13} />
                      Pending Submission
                    </div>
                  )}

                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform mt-1">
                    View & Submit <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assignment Detail & Upload Modal */}
      {selectedAssignment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setSelectedAssignment(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    {selectedAssignment.type || "Assignment"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {selectedAssignment.subject}
                  </span>
                  <span className="text-xs text-slate-400">
                    Teacher: {selectedAssignment.teacher_name}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {selectedAssignment.name}
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>Max Marks: <strong>{selectedAssignment.max_score}</strong></span>
                  {selectedAssignment.due_date && (
                    <span>• Due: <strong className="text-rose-500">{new Date(selectedAssignment.due_date).toLocaleDateString()}</strong></span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
              {/* Instructions */}
              {selectedAssignment.description && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Teacher's Instructions
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {selectedAssignment.description}
                  </p>
                </div>
              )}

              {/* Teacher Attached Question Paper / Material */}
              {selectedAssignment.attachment_name && selectedAssignment.attachment_data && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Teacher's Attached Question Paper
                      </div>
                      <div className="text-xs text-indigo-700 dark:text-indigo-400 truncate max-w-xs sm:max-w-sm">
                        {selectedAssignment.attachment_name}
                      </div>
                    </div>
                  </div>
                  <a
                    href={selectedAssignment.attachment_data}
                    download={selectedAssignment.attachment_name}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
                  >
                    <Download size={14} /> Download Question Paper
                  </a>
                </div>
              )}

              {/* Questions List (Making Questions) */}
              {(() => {
                const questions = Array.isArray(selectedAssignment.questions)
                  ? selectedAssignment.questions
                  : typeof selectedAssignment.questions === "string"
                  ? JSON.parse(selectedAssignment.questions || "[]")
                  : [];

                if (questions.length === 0) return null;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen size={15} className="text-indigo-600" />
                        Questions ({questions.length})
                      </h4>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        Total {questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0)} pts
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {questions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                              Question {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {q.points || 10} marks
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {q.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Status Banner */}
              {selectedAssignment.status === "Graded" ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Award size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        Graded by Teacher
                      </div>
                      <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                        Your Score: {selectedAssignment.my_score} / {selectedAssignment.max_score}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg">
                    {Math.round((Number(selectedAssignment.my_score) / Number(selectedAssignment.max_score)) * 100)}%
                  </span>
                </div>
              ) : selectedAssignment.status === "Submitted" ? (
                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sky-900 dark:text-sky-200">
                      Work Submitted Successfully
                    </div>
                    <div className="text-xs text-sky-700 dark:text-sky-400">
                      {selectedAssignment.submitted_at
                        ? `Submitted on ${new Date(selectedAssignment.submitted_at).toLocaleString()}`
                        : "Awaiting teacher review and grading."}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Previous Submission View (if submitted) */}
              {selectedAssignment.submission_file_name && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your Uploaded Work
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      <FileText size={16} className="text-indigo-600 shrink-0" />
                      <span className="truncate">{selectedAssignment.submission_file_name}</span>
                      {selectedAssignment.submission_file_size && (
                        <span className="text-[10px] text-slate-400">({selectedAssignment.submission_file_size})</span>
                      )}
                    </div>
                    {selectedAssignment.submission_file_data && (
                      <a
                        href={selectedAssignment.submission_file_data}
                        download={selectedAssignment.submission_file_name}
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 shrink-0 ml-2"
                      >
                        <Download size={13} /> View File
                      </a>
                    )}
                  </div>
                  {selectedAssignment.submission_notes && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <strong className="block text-[11px] text-slate-500">Your notes/answers:</strong>
                      {selectedAssignment.submission_notes}
                    </div>
                  )}
                </div>
              )}

              {/* Student Upload Option & Submit Form (Available if pending, or allows re-uploading if not graded) */}
              {selectedAssignment.status !== "Graded" && (
                <form onSubmit={handleSubmitAssignment} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Upload size={14} className="text-indigo-600" />
                      {selectedAssignment.status === "Submitted" ? "Re-upload / Update Submission" : "Upload Your Assignment (Submission Option)"}
                    </h4>
                  </div>

                  {/* File Upload Box */}
                  <div>
                    {uploadFile ? (
                      <div className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
                        <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-900 dark:text-indigo-300 truncate">
                          <FileText size={18} className="text-indigo-600 shrink-0" />
                          <span className="truncate">{uploadFile}</span>
                          <span className="text-[10px] text-indigo-400 font-semibold">({uploadSize})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadFile(null);
                            setUploadData("");
                            setUploadSize("");
                          }}
                          className="text-xs font-bold text-rose-500 hover:underline shrink-0 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-900 hover:bg-indigo-50/20 transition-all group">
                        <Upload size={24} className="text-slate-400 group-hover:text-indigo-600 mb-1.5 transition-colors" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600">
                          Click to upload your solution / homework file
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5">
                          PDF, Word documents, images, or ZIP up to 25MB
                        </span>
                        <input
                          type="file"
                          onChange={handleStudentFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.txt"
                        />
                      </label>
                    )}
                  </div>

                  {/* Notes / Written Answer */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Written Answers / Submission Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={studentNotes}
                      onChange={(e) => setStudentNotes(e.target.value)}
                      placeholder="Type answers to the questions, or leave notes for your teacher..."
                      className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900 dark:text-slate-100 transition-colors resize-none"
                    />
                  </div>

                  {submitSuccess && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 size={16} /> Assignment uploaded and submitted successfully!
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAssignment(null)}
                      className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          {selectedAssignment.status === "Submitted" ? "Update Submission" : "Upload & Submit Assignment"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
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
