import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./lib/api";
import {
  GraduationCap,
  ShieldCheck,
  Shield,
  User,
  Briefcase,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  Zap,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "admin" as const,
    label: "Admin",
    email: "admin@school.erp",
    password: "demo-password",
    name: "System Admin",
    icon: Shield,
    color: "bg-violet-50 border-violet-200 text-violet-700",
    activeColor: "border-[#3b3dbf] bg-indigo-50 text-[#3b3dbf]",
    desc: "Full system access",
  },
  {
    role: "teacher" as const,
    label: "Teacher",
    email: "sarah.j@school.edu",
    password: "demo-password",
    name: "Sarah Jenkins",
    icon: User,
    color: "bg-teal-50 border-teal-200 text-teal-700",
    activeColor: "border-[#3b3dbf] bg-indigo-50 text-[#3b3dbf]",
    desc: "Gradebook & students",
  },
  {
    role: "staff" as const,
    label: "Staff",
    email: "janice.d@school.edu",
    password: "demo-password",
    name: "Janice Doe",
    icon: Briefcase,
    color: "bg-orange-50 border-orange-200 text-orange-700",
    activeColor: "border-[#3b3dbf] bg-indigo-50 text-[#3b3dbf]",
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

  // Auto-fill credentials when role changes
  const selectRole = (r: "admin" | "teacher" | "staff") => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === r)!;
    setRole(r);
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

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

  const currentAcc = DEMO_ACCOUNTS.find((a) => a.role === role)!;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/10 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-card rounded-3xl shadow-2xl shadow-indigo-100/50 overflow-hidden border border-border min-h-150">
        {/* Left Panel — Branding */}
        <div className="hidden lg:flex lg:w-5/12 bg-linear-to-br from-[#3b3dbf] via-[#3035b5] to-[#1e20a0] text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <GraduationCap size={26} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Skillyon ERP
                </h1>
                <p className="text-indigo-300 text-[10px] font-bold tracking-wider uppercase">
                  Skillyon Platform
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-4">
              Manage your school
              <br />
              smarter, together.
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-xs">
              Gradebooks, fees, attendance, staff management and analytics — all
              in one place.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-8">
              {[
                "Gradebook",
                "Fee Tracking",
                "Staff Mgmt",
                "Reports",
                "Attendance",
              ].map((f) => (
                <span
                  key={f}
                  className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs font-semibold text-indigo-100"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <ShieldCheck className="text-indigo-300 shrink-0" size={22} />
              <div>
                <p className="text-sm font-bold">Secure Access Portal</p>
                <p className="text-xs text-indigo-300">
                  Role-based authentication · JWT secured
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1 lg:hidden">
              <GraduationCap size={22} className="text-[#3b3dbf]" />
              <span className="text-base font-bold text-[#3b3dbf]">
                Skillyon ERP
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm">
              Select a demo role below to auto-fill credentials
            </p>
          </div>

          {/* Demo Role Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => selectRole(acc.role)}
                className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border-2 transition-all ${
                  role === acc.role
                    ? acc.activeColor + " shadow-md shadow-indigo-100"
                    : "border-border text-muted-foreground hover:border-border/80 hover:bg-muted"
                }`}
              >
                <acc.icon size={18} />
                <span className="text-xs font-bold">{acc.label}</span>
                <span className="text-[10px] font-medium opacity-60">
                  {acc.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Credential Hint */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
            <Zap size={14} className="text-[#3b3dbf] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary">
                Demo credentials auto-filled
              </p>
              <p className="text-[10px] text-muted-foreground font-medium truncate">
                {currentAcc.email} · password: demo-password
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-muted-foreground shrink-0"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <AtSign
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-muted-foreground">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-primary hover:text-primary/80"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary accent-primary"
              />
              <label
                htmlFor="remember"
                className="text-xs font-semibold text-muted-foreground"
              >
                Keep me logged in for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-primary hover:bg-primary/90 active:scale-[0.99] text-primary-foreground font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/60 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* All accounts reference */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
              All Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => selectRole(acc.role)}
                  className="text-left p-2.5 rounded-xl bg-zinc-50 hover:bg-indigo-50 border border-zinc-100 hover:border-indigo-100 transition-colors"
                >
                  <p className="text-[10px] font-bold text-zinc-500">
                    {acc.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-medium truncate">
                    {acc.email}
                  </p>
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-[#3b3dbf] bg-indigo-50 px-1.5 py-0.5 rounded-full">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-zinc-400">
        © 2024 Skillyon ERP · Skillyon Platform · Authorized access only
      </p>
    </div>
  );
}
