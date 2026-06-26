import React, { useState } from 'react'
import { GraduationCap, ArrowRight } from 'lucide-react'

export default function StudentLogin({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/user/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Login failed')
        setLoading(false)
        return
      }
      localStorage.setItem('student_token', json.token)
      localStorage.setItem('student_user', JSON.stringify(json.user))
      if (onSuccess) onSuccess(json.user)
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/user/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo.child@example.com', password: 'password123' })
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Login failed')
        setLoading(false)
        return
      }
      localStorage.setItem('student_token', json.token)
      localStorage.setItem('student_user', JSON.stringify(json.user))
      if (onSuccess) onSuccess(json.user)
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mb-4 shadow-sm">
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Student Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! Sign in to continue.</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]">
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
            />
          </div>
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
            />
          </div>

          {error && (
            <div className="mb-5 text-sm text-rose-500 font-medium px-3 py-2 bg-rose-50 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? 'Signing in...' : (
                <>Sign In <ArrowRight size={16} strokeWidth={2.5} /></>
              )}
            </button>

            <button
              type="button"
              onClick={demoLogin}
              disabled={loading}
              className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
            >
              Try Demo Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}