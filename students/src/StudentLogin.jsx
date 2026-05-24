import React, { useState } from 'react'

export default function StudentLogin({ onSuccess }) {
  const [email, setEmail] = useState('')
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
        body: JSON.stringify({ email })
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
        body: JSON.stringify({ email: 'demo.child@example.com' })
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-3">Student Login</h2>
        <p className="text-xs text-zinc-500 mb-4">Sign in using your school registered email.</p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="student@example.com"
          required
          className="w-full px-3 py-2 border rounded mb-3"
        />
        {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
        <div className="flex items-center justify-end gap-2 text-sm">
          <button type="button" onClick={demoLogin} className="px-4 py-2 border rounded bg-white text-zinc-700" disabled={loading}>
            Demo Login
          </button>
          <button type="submit" className="px-4 py-2 bg-[#3b3dbf] text-white rounded" disabled={loading || !email}>
            {loading ? 'Please wait...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  )
}