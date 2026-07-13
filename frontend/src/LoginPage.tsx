import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./lib/api";
import {
  GraduationCap,
  ShieldCheck,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowRight,
  Shield,
  User,
  Briefcase,
} from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";
import { motion } from "framer-motion";

const DEMO_ACCOUNTS = [
  {
    role: "admin" as const,
    label: "Admin",
    email: "admin@school.erp",
    password: "demo-password",
    icon: Shield,
    desc: "Full system access",
  },
  {
    role: "teacher" as const,
    label: "Teacher",
    email: "sarah.j@school.edu",
    password: "demo-password",
    icon: User,
    desc: "Gradebook & students",
  },
  {
    role: "staff" as const,
    label: "Staff",
    email: "janice.d@school.edu",
    password: "demo-password",
    icon: Briefcase,
    desc: "Fees & records",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("admin@school.erp");
  const [password, setPassword] = useState("demo-password");
  const [role, setRole] = useState<"admin" | "teacher" | "staff">("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Initialize with admin credentials
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const selectRole = (r: "admin" | "teacher" | "staff") => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === r)!;
    setRole(r);
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/user/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans px-4 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Premium Dynamic Background Grid & Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-slate-50 to-slate-100 dark:from-indigo-950/20 dark:via-slate-955 dark:to-slate-955 pointer-events-none transition-colors duration-500"></div>
      
      {/* Floating Animated Background Orbs */}
      <motion.div 
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none"
        animate={{
          x: [0, 40, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[120px] pointer-events-none"
        animate={{
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Glassmorphic Container Wrapper */}
      <motion.div 
        className="relative w-full max-w-5xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-[0_30px_100px_-20px_rgba(99,102,241,0.15)] dark:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] border border-slate-255/60 dark:border-slate-800/80 overflow-hidden flex flex-col lg:flex-row min-h-[600px]"
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Left Branding Panel */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-[#3b3dbf] via-[#3035b5] to-[#1e20a0] text-white p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Internal Glow Effects */}
          <div className="absolute top-0 right-0 w-82 h-82 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

          {/* Top Logo Section */}
          <div className="relative z-10">
            <motion.div 
              className="flex items-center gap-3.5 mb-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="bg-white/20 p-2.5 rounded-2xl shadow-inner backdrop-blur-md">
                <GraduationCap size={28} strokeWidth={2.5} className="animate-float text-indigo-100" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight leading-none">
                  Skillyon
                </h1>
                <p className="text-indigo-200 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
                  ERP Platform
                </p>
              </div>
            </motion.div>

            <motion.h2 
              className="text-3xl lg:text-4xl font-extrabold leading-tight mb-5 tracking-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Manage your school
              <br />
              smarter, together.
            </motion.h2>
            
            <motion.p 
              className="text-indigo-100 text-sm leading-relaxed max-w-xs font-medium"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Streamlined gradebooks, analytics, fees, staff management and records — consolidated into a unified workspace.
            </motion.p>

            {/* Feature Badges */}
            <motion.div 
              className="flex flex-wrap gap-2 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {[
                "Gradebook",
                "Fees Tracking",
                "Staff Management",
                "Reports & Analytics",
                "Attendance",
              ].map((f, i) => (
                <span
                  key={f}
                  className="px-3.5 py-1.5 bg-white/10 border border-white/10 hover:border-white/20 hover:bg-white/15 rounded-full text-xs font-bold text-indigo-55 transition-all duration-200"
                >
                  {f}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Bottom Security Badge */}
          <motion.div 
            className="relative z-10 mt-10 lg:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-3.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-lg shadow-black/10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="text-indigo-200" size={22} />
              </div>
              <div>
                <p className="text-sm font-extrabold leading-none">Secure Access Portal</p>
                <p className="text-[11px] text-indigo-200 mt-1">
                  Role-based authorization · JWT encryption
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-7/12 p-8 lg:p-14 flex flex-col justify-center bg-white/30 dark:bg-slate-900/30 transition-colors duration-500">
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {/* Mobile Header Logo */}
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <div className="bg-[#3b3dbf] p-1.5 rounded-lg text-white">
                <GraduationCap size={20} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-black text-[#3b3dbf] tracking-tight">
                Skillyon ERP
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
              Select a console role below to test or enter custom credentials.
            </p>
          </motion.div>

          {/* Role Cards Selector */}
          <motion.div 
            className="grid grid-cols-3 gap-3 mb-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isActive = role === acc.role;
              return (
                <motion.button
                  key={acc.role}
                  type="button"
                  onClick={() => selectRole(acc.role)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? "border-[#3b3dbf] bg-indigo-50/50 dark:bg-indigo-955/20 text-[#3b3dbf] dark:text-indigo-350 shadow-md shadow-indigo-50/40 dark:shadow-none"
                      : "border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-350 dark:hover:border-slate-700"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={18} className={isActive ? "text-[#3b3dbf] dark:text-indigo-400" : ""} />
                  <span className="text-xs font-extrabold">{acc.label}</span>
                  <span className="text-[9px] font-bold opacity-60 text-center leading-none mt-0.5">
                    {acc.desc}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {error && (
            <motion.div 
              className="bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-450 px-4 py-3 rounded-2xl mb-6 text-sm font-semibold flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <AtSign
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3b3dbf] transition-colors"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-[#3b3dbf]/15 focus:border-[#3b3dbf] transition-all text-sm font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-[#3b3dbf] dark:text-indigo-400 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3b3dbf] transition-colors"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 focus:bg-white dark:focus:bg-slate-955 focus:outline-none focus:ring-4 focus:ring-[#3b3dbf]/15 focus:border-[#3b3dbf] transition-all text-sm font-semibold text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 dark:hover:text-slate-350 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-2.5 pt-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <input
                id="remember"
                type="checkbox"
                className="w-4.5 h-4.5 rounded-md border-slate-200 dark:border-slate-800 text-[#3b3dbf] accent-[#3b3dbf] cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs font-bold text-slate-550 dark:text-slate-400 cursor-pointer select-none"
              >
                Keep me logged in for 30 days
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <motion.button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-[#3b3dbf] hover:bg-[#3035b5] text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3 cursor-pointer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>

      <motion.p 
        className="absolute bottom-6 text-xs text-slate-400 dark:text-slate-600 font-bold z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        © 2024 Skillyon ERP · Skillyon Platform · Authorized access only
      </motion.p>
    </div>
  );
}
