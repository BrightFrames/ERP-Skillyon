import React, { useState } from 'react'

export default function ParentLogin({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)

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
      const res = await fetch('/api/user/parent-login', {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-3">Parent Login</h2>
        <p className="text-xs text-zinc-500 mb-4">Enter the parent email associated with your child's account.</p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="parent@example.com"
          required
          className="w-full px-3 py-2 border rounded mb-3"
        />
        {touched && !validEmail(email) && (
          <div className="text-sm text-red-500 mb-2">Please enter a valid email address</div>
        )}
        {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
        <div className="flex items-center justify-end gap-2">
          <button type="submit" className="px-4 py-2 bg-[#3b3dbf] text-white rounded" disabled={loading || !validEmail(email)}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  )
}
