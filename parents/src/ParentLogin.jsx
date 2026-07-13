import React, { useState } from "react";
import { GraduationCap, Mail, Hash, AtSign, ArrowRight, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";

export default function ParentLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (!validEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const url = isSignup
        ? "/api/user/parent-signup"
        : "/api/user/parent-login";
      const body = isSignup
        ? { parentEmail: email, studentId, studentEmail, password }
        : { email, password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || (isSignup ? "Signup failed" : "Login failed"));
        setLoading(false);
        return;
      }
      localStorage.setItem("token", json.token);
      localStorage.setItem("user", JSON.stringify(json.user));
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100/30 via-slate-50 to-slate-100 dark:from-teal-950/20 dark:via-slate-950 dark:to-slate-950 pointer-events-none"></div>
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 mb-4 animate-float ring-1 ring-white/10">
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Skillyon <span className="text-teal-600 dark:text-teal-400">Parents</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 uppercase font-bold tracking-widest">
            Parent Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-2xl shadow-slate-100 dark:shadow-black/50 overflow-hidden animate-slide-up">
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {isSignup ? "Link Student" : "Parent Sign In"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {isSignup
                ? "Link your child's student account."
                : "Sign in to monitor your child's progress."}
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
                  Parent Email
                </label>
                <div className="relative group">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="parent@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {!isSignup && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {isSignup && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      Student ID
                    </label>
                    <div className="relative group">
                      <Hash
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
                      />
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g. 15"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      Student Email
                    </label>
                    <div className="relative group">
                      <AtSign
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
                      />
                      <input
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="student@example.com"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>
                </>
              )}

              {touched && !validEmail(email) && (
                <p className="text-xs text-rose-500 font-bold">Please enter a valid email address</p>
              )}

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={
                    loading || !validEmail(email) || (!isSignup && !password)
                  }
                  className="w-full py-3 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-650/20 hover:shadow-teal-650/30 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      {isSignup ? "Link Account" : "Sign In"}{" "}
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </>
                  )}
                </button>


              </div>
            </form>
          </div>

          <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/60 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
              }}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
            >
              {isSignup ? "← Back to Sign In" : "New parent? Link account →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
