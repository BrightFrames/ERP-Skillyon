import React, { useEffect, useState } from 'react';
import StudentLogin from './StudentLogin';

export default function App() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    const init = async () => {
      const userStr = localStorage.getItem('student_user')
      if (userStr) {
        setUser(JSON.parse(userStr))
      }
    }
    init()
  }, [])

  if (!localStorage.getItem('student_token') || !user) {
    return <StudentLogin onSuccess={(u) => setUser(u)} />
  }

  const logout = () => {
    localStorage.removeItem('student_token')
    localStorage.removeItem('student_user')
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="p-4 sm:p-6 flex items-center justify-between border-b bg-white">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold">Student Portal</h1>
          <p className="text-sm text-zinc-500">Welcome back, {user.name}</p>
        </div>
        <button onClick={logout} className="px-4 py-2 text-sm rounded border bg-white text-zinc-700 font-medium hover:bg-zinc-50">Logout</button>
      </header>

      <nav className="bg-white p-3 sm:p-4 border-b flex gap-2 sm:gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button onClick={() => setTab('dashboard')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'dashboard' ? 'bg-[#3b3dbf] text-white' : 'bg-transparent text-zinc-600 hover:bg-zinc-100'}`}>Dashboard</button>
        <button onClick={() => setTab('attendance')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'attendance' ? 'bg-[#3b3dbf] text-white' : 'bg-transparent text-zinc-600 hover:bg-zinc-100'}`}>Attendance</button>
        <button onClick={() => setTab('academics')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'academics' ? 'bg-[#3b3dbf] text-white' : 'bg-transparent text-zinc-600 hover:bg-zinc-100'}`}>Academics</button>
        <button onClick={() => setTab('fees')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'fees' ? 'bg-[#3b3dbf] text-white' : 'bg-transparent text-zinc-600 hover:bg-zinc-100'}`}>Fees</button>
      </nav>

      <main className="p-4 sm:p-6 lg:max-w-6xl mx-auto">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'attendance' && <Attendance />}
        {tab === 'academics' && <Academics />}
        {tab === 'fees' && <Fees />}
      </main>
    </div>
  )
}

function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Dashboard</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-zinc-600 mb-2"><strong>Tip:</strong> Always check your academics to see if any new exams are added.</p>
        <p className="text-zinc-600">Your recent updates will appear here.</p>
      </div>
    </div>
  )
}

function Attendance() {
  const [data, setData] = useState({ summary: null, active: [] });

  useEffect(() => {
    fetch('/api/student-portal/attendance', {
      headers: { Authorization: `Bearer ${localStorage.getItem('student_token')}` }
    }).then(r => r.json()).then(res => setData({ summary: res.summary, active: res.data || [] }))
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Attendance</h2>
      {data.summary ? (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-4 inline-block">
          <div className="text-sm text-zinc-500">Attendance Percentage</div>
          <div className="text-2xl font-bold">{data.summary.percent}%</div>
        </div>
      ) : <p className="text-zinc-500">Loading...</p>}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <ul className="divide-y text-sm">
          {data.active.map((r, i) => (
            <li key={i} className="p-4 flex justify-between">
              <span className="font-medium text-zinc-700">{new Date(r.date).toDateString()}</span>
              <span className={`font-semibold ${r.status === 'PRESENT' ? 'text-green-600' : 'text-red-500'}`}>{r.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Academics() {
  const [marks, setMarks] = useState([]);
  useEffect(() => {
    fetch('/api/student-portal/academics', {
      headers: { Authorization: `Bearer ${localStorage.getItem('student_token')}` }
    }).then(r => r.json()).then(res => setMarks(res.data || []))
  }, [])
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Academics</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto border">
        <table className="w-full text-sm">
          <thead className="bg-[#f0f0f5] text-left text-zinc-700 border-b">
            <tr><th className="p-4 font-semibold">Exam</th><th className="p-4 font-semibold">Subject</th><th className="p-4 font-semibold">Score</th></tr>
          </thead>
          <tbody className="divide-y">
            {marks.map((m, i) => (
              <tr key={i} className="hover:bg-zinc-50">
                <td className="p-4 text-zinc-700">{m.exam_name}</td>
                <td className="p-4 text-zinc-800 font-medium">{m.subject}</td>
                <td className="p-4 text-zinc-600">{m.score} / {m.max_score}</td>
              </tr>
            ))}
            {marks.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-zinc-500">No academics data found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Fees() {
  const [fees, setFees] = useState([]);
  useEffect(() => {
    fetch('/api/student-portal/fees', {
      headers: { Authorization: `Bearer ${localStorage.getItem('student_token')}` }
    }).then(r => r.json()).then(res => setFees(res.data || []))
  }, [])
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Fees</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <ul className="divide-y text-sm">
          {fees.map((f, i) => (
            <li key={i} className="p-4 flex justify-between items-center text-sm hover:bg-zinc-50">
              <div>
                <div className="font-medium text-zinc-800">{f.term}</div>
                <div className="text-xs text-zinc-500 mt-1">Due: {new Date(f.due_date).toDateString()}</div>
              </div>
              <div className="flex gap-4 items-center">
                <span className="font-semibold text-lg text-zinc-700">₹{f.amount}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${f.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {f.status}
                </span>
              </div>
            </li>
          ))}
          {fees.length === 0 && <li className="p-4 text-center text-zinc-500">No fees records found.</li>}
        </ul>
      </div>
    </div>
  )
}
