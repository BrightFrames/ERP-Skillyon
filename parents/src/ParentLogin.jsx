import React, { useState } from 'react'

export default function ParentLogin({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)
  const [isSignup, setIsSignup] = useState(false)

  const validEmail = (value) => {
    return /^\S+@\S+\.\S+$/.test(value)
  }

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
        ? { parentEmail: email, studentId, studentEmail }
        : { email };

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

      // store token and user and notify parent
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
    const demoEmail = 'parent@example.com'
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/user/parent-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail })
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-3">{isSignup ? 'Link Student Account' : 'Parent Login'}</h2>
        <p className="text-xs text-zinc-500 mb-4">
          {isSignup ? "Enter your email along with your child's student ID and email to link accounts." : "Enter the parent email associated with your child's account."}
        </p>

        <label className="block text-sm font-medium mb-1">Parent Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="parent@example.com"
          required
          className="w-full px-3 py-2 border rounded mb-3"
        />

        {isSignup && (
          <>
            <label className="block text-sm font-medium mb-1">Student ID (as provided by school)</label>
            <input
              type="text"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="e.g. 15"
              required
              className="w-full px-3 py-2 border rounded mb-3"
            />
            <label className="block text-sm font-medium mb-1">Student Email</label>
            <input
              type="email"
              value={studentEmail}
              onChange={e => setStudentEmail(e.target.value)}
              placeholder="student@example.com"
              required
              className="w-full px-3 py-2 border rounded mb-3"
            />
          </>
        )}

        {touched && !validEmail(email) && (
          <div className="text-sm text-red-500 mb-2">Please enter a valid email address</div>
        )}
        {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
        
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => { setIsSignup(!isSignup); setError(null); }} className="text-sm text-[#3b3dbf] hover:underline">
            {isSignup ? 'Already registered? Sign in' : 'New parent? Link account'}
          </button>
        </div>

        <div className="flex items-center justify-end gap-2">
          {!isSignup && (
            <button type="button" onClick={demoLogin} className="px-4 py-2 border rounded bg-white" disabled={loading}>
              {loading ? 'Signing in...' : 'Use demo parent'}
            </button>
          )}
          <button type="submit" className="px-4 py-2 bg-[#3b3dbf] text-white rounded" disabled={loading || !validEmail(email)}>
            {loading ? 'Processing...' : (isSignup ? 'Link Account' : 'Sign in')}
          </button>
        </div>
      </form>
    </div>
  )
}
