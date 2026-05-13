import React, { useEffect, useState } from 'react'
import ParentDashboard from './ParentDashboard'
import ParentAttendance from './ParentAttendance'
import ParentFees from './ParentFees'
import ParentAcademics from './ParentAcademics'
import ParentCommunication from './ParentCommunication'
import ParentTransport from './ParentTransport'
import ParentLogin from './ParentLogin'
import Toast from './Toast'

export default function App() {
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [tab, setTab] = useState('dashboard')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const init = async () => {
      let user = null
      try {
        const userStr = localStorage.getItem('user')
        user = userStr ? JSON.parse(userStr) : null
        if (!user || !user.children) {
          const token = localStorage.getItem('token')
          if (token) {
            const res = await fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } })
            if (res.ok) {
              user = await res.json()
              localStorage.setItem('user', JSON.stringify(user))
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile', err)
      }

      const kids = user?.children || []
      setChildren(kids)
      if (kids.length > 0) setSelectedChild(kids[0].id)
    }
    init()
  }, [])

  if (!localStorage.getItem('token') || !localStorage.getItem('user')) {
    return <ParentLogin onSuccess={(user) => {
      const kids = user?.children || []
      setChildren(kids)
      if (kids.length > 0) setSelectedChild(kids[0].id)
      setTab('dashboard')
      setToast('Signed in successfully')
    }} />
  }

  return (
    <div className="app-root min-h-screen bg-zinc-50 text-zinc-900">
      <header className="p-4 sm:p-6 flex items-center justify-between border-b bg-white">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold">Parents Panel</h1>
          <p className="text-xs text-zinc-500">Overview and quick actions</p>
        </div>
        <div className="flex items-center gap-3">
          {children.length > 1 && (
            <select value={selectedChild || ''} onChange={(e) => setSelectedChild(e.target.value)} className="px-3 py-1 border rounded-md text-sm">
              {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              setChildren([])
              setSelectedChild(null)
              setTab('dashboard')
              setToast('Logged out')
            }}
            className="px-3 py-1 text-sm rounded border bg-white"
          >Logout</button>
        </div>
      </header>

      <Toast message={toast} onClose={() => setToast(null)} />

      <nav className="bg-white p-3 sm:p-4 border-b flex gap-2 sm:gap-4">
        <button onClick={() => setTab('dashboard')} className={`px-3 py-1 rounded ${tab === 'dashboard' ? 'bg-[#3b3dbf] text-white' : 'bg-white'}`}>Dashboard</button>
        <button onClick={() => setTab('attendance')} className={`px-3 py-1 rounded ${tab === 'attendance' ? 'bg-[#3b3dbf] text-white' : 'bg-white'}`}>Attendance</button>
        <button onClick={() => setTab('academics')} className={`px-3 py-1 rounded ${tab === 'academics' ? 'bg-[#3b3dbf] text-white' : 'bg-white'}`}>Academics</button>
        <button onClick={() => setTab('fees')} className={`px-3 py-1 rounded ${tab === 'fees' ? 'bg-[#3b3dbf] text-white' : 'bg-white'}`}>Fees</button>
        <button onClick={() => setTab('communication')} className={`px-3 py-1 rounded ${tab === 'communication' ? 'bg-[#3b3dbf] text-white' : 'bg-white'}`}>Communication</button>
        <button onClick={() => setTab('transport')} className={`px-3 py-1 rounded ${tab === 'transport' ? 'bg-[#3b3dbf] text-white' : 'bg-white'}`}>Transport</button>
      </nav>

      <main>
        {tab === 'dashboard' && <ParentDashboard selectedChild={selectedChild} onChildChange={setSelectedChild} />}
        {tab === 'attendance' && <ParentAttendance childId={selectedChild} />}
        {tab === 'fees' && <ParentFees childId={selectedChild} />}
        {tab === 'academics' && <ParentAcademics childId={selectedChild} />}
        {tab === 'communication' && <ParentCommunication childId={selectedChild} />}
        {tab === 'transport' && <ParentTransport childId={selectedChild} />}
      </main>
    </div>
  )
}
