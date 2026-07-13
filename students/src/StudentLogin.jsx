import React, { useState } from "react";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";

export default function StudentLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/user/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Login failed");
        setLoading(false);
        return;
      }
      localStorage.setItem("student_token", json.token);
      localStorage.setItem("student_user", JSON.stringify(json.user));
      if (onSuccess) onSuccess(json.user);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans px-4 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/30 via-slate-50 to-slate-100 dark:from-sky-950/20 dark:via-slate-950 dark:to-slate-950 pointer-events-none"></div>
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-650 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 mb-4 animate-float ring-1 ring-white/10">
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Skillyon <span className="text-sky-500 dark:text-sky-400">Students</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 uppercase font-bold tracking-widest">
            Student Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-2xl shadow-slate-100 dark:shadow-black/50 overflow-hidden animate-slide-up">
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Sign in to manage your student academics and portal.
            </p>

            {error && (
              <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Student Email
                </label>
                <div className="relative group">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    "Signing in..."
                  ) : (
                    <>
                      Sign In <ArrowRight size={16} strokeWidth={2.5} />
                    </>
                  )}
                </button>


              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
