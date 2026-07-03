import React, { useState } from 'react'
import { GraduationCap, Mail, Hash, AtSign, ArrowRight } from 'lucide-react'

export default function ParentLogin({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [studentId, setStudentId] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)
  const [isSignup, setIsSignup] = useState(false)

  const validEmail = (value) => /^\S+@\S+\.\S+$/.test(value)

  const submit = async (e) => {
    e.preventDefault()
    setTouched(true)
    setError(null)
    if (!validEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      const url = isSignup ? '/api/user/parent-signup' : '/api/user/parent-login';
      const body = isSignup
        ? { parentEmail: email, studentId, studentEmail, password }
        : { email, password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || (isSignup ? 'Signup failed' : 'Login failed'))
        setLoading(false)
        return
      }
      localStorage.setItem('token', json.token)
      localStorage.setItem('user', JSON.stringify(json.user))
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
      const res = await fetch('/api/user/parent-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'parent@example.com', password: 'password123' })
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Login failed')
        setLoading(false)
        return
      }
      localStorage.setItem('token', json.token)
      localStorage.setItem('user', JSON.stringify(json.user))
      if (onSuccess) onSuccess(json.user)
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Skillyon</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">
              {isSignup ? 'Link Student' : 'Parent Login'}
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              {isSignup ? "Link your child's student account." : "Sign in to your parent portal."}
            </p>

            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="parent@example.com"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>
              
              {!isSignup && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {isSignup && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Student ID</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="e.g. 15" required
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-teal-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Student Email</label>
                    <div className="relative">
                      <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} placeholder="student@example.com" required
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-teal-500 transition-colors" />
                    </div>
                  </div>
                </>
              )}

              {touched && !validEmail(email) && (
                <p className="text-xs text-rose-500">Enter a valid email</p>
              )}
              {error && <p className="text-xs text-rose-500">{error}</p>}

              <button
                type="submit"
                disabled={loading || !validEmail(email) || (!isSignup && !password)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? 'Processing...' : <>{isSignup ? 'Link Account' : 'Sign In'} <ArrowRight size={14} /></>}
              </button>

              {!isSignup && (
                <button type="button" onClick={demoLogin} disabled={loading}
                  className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-medium transition-colors border border-gray-200 disabled:opacity-50">
                  Try Demo Account
                </button>
              )}
            </form>
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
            <button type="button" onClick={() => { setIsSignup(!isSignup); setError(null); }}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              {isSignup ? '← Back to Sign In' : "New parent? Link account →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
