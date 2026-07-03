import React, { useEffect, useState } from 'react';
import StudentLogin from './StudentLogin';
import { LayoutDashboard, Calendar, GraduationCap, CreditCard, LogOut, CheckCircle2, Clock, FileText, ChevronRight, Settings } from 'lucide-react';
import StudentSettings from './StudentSettings';
import { fetchAndApplySettings } from './settings';
import { useLanguage, t } from './i18n';

export default function App() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const lang = useLanguage()

  useEffect(() => {
    const init = async () => {
      // Fetch and apply global appearance settings
      fetchAndApplySettings()

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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'academics', label: 'Academics', icon: GraduationCap },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-500/30 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 dark:bg-slate-900 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center">
              <GraduationCap size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight dark:text-slate-100">EduCore</span>
            <span className="hidden sm:inline-block ml-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider dark:bg-slate-800 dark:text-slate-400">Student</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                  tab === item.id 
                    ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <item.icon size={16} strokeWidth={tab === item.id ? 2.5 : 2} />
                {t(item.label, lang)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 dark:bg-slate-850 dark:border-slate-800">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold dark:bg-slate-800 dark:text-indigo-400">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user.name?.split(' ')[0]}</span>
            </div>
            <button 
              onClick={logout} 
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Nav Scrollable */}
        <div className="md:hidden border-t border-slate-100 bg-white/80 backdrop-blur-md dark:bg-slate-900/90 dark:border-slate-800">
          <div className="flex overflow-x-auto px-4 py-2 gap-2 scrollbar-hide">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                  tab === item.id 
                    ? 'bg-sky-50 text-sky-600 border border-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-850' 
                    : 'text-slate-500 border border-transparent dark:text-slate-400'
                }`}
              >
                <item.icon size={16} strokeWidth={tab === item.id ? 2.5 : 2} />
                {t(item.label, lang)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {tab === 'dashboard' && <Dashboard user={user} setTab={setTab} />}
          {tab === 'attendance' && <Attendance />}
          {tab === 'academics' && <Academics />}
          {tab === 'fees' && <Fees />}
          {tab === 'settings' && <StudentSettings />}
        </div>
      </main>
    </div>
  )
}


function Dashboard({ user, setTab }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-[24px] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-sky-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">Hello, {user.name}! 👋</h2>
          <p className="text-sky-100 max-w-md">Welcome back to your portal. Have a great day of learning ahead.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Link Cards */}
        <button onClick={() => setTab('attendance')} className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col items-start gap-4 hover:border-sky-200 hover:shadow-md transition-all group text-left">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Attendance</h3>
            <p className="text-sm text-slate-500 mt-0.5">Check your daily presence.</p>
          </div>
        </button>

        <button onClick={() => setTab('academics')} className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col items-start gap-4 hover:border-sky-200 hover:shadow-md transition-all group text-left">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Academics</h3>
            <p className="text-sm text-slate-500 mt-0.5">View your exam results.</p>
          </div>
        </button>

        <div className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Today's Tip</h3>
            <p className="text-sm text-slate-500 mt-0.5">Stay consistent with your homework to keep stress away!</p>
          </div>
        </div>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Attendance</h2>
        <p className="text-sm text-slate-500">Your presence record for the year.</p>
      </div>

      {data.summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">Percentage</span>
            <span className={`text-3xl font-bold ${data.summary.percent >= 75 ? 'text-teal-500' : 'text-rose-500'}`}>{data.summary.percent}%</span>
          </div>
          <div className="bg-white p-5 rounded-[20px] border border-slate-100 flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">Total Days</span>
            <span className="text-3xl font-bold text-slate-800">{data.summary.total}</span>
          </div>
          <div className="hidden sm:flex bg-white p-5 rounded-[20px] border border-slate-100 flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">Present</span>
            <span className="text-3xl font-bold text-teal-500">{data.summary.present}</span>
          </div>
        </div>
      ) : (
        <div className="h-24 bg-slate-100 rounded-[20px] animate-pulse"></div>
      )}

      <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Recent Records</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {data.active.map((r, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div>
                <div className="font-semibold text-slate-800">{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
              </div>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                r.status === 'PRESENT' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {r.status === 'PRESENT' ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>}
                {r.status}
              </div>
            </div>
          ))}
          {data.active.length === 0 && <div className="p-8 text-center text-slate-400 text-sm font-medium">No recent records.</div>}
        </div>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Academics</h2>
        <p className="text-sm text-slate-500">Exam scores and performance.</p>
      </div>

      <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Exam</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Score</th>
                <th className="px-5 py-4">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {marks.map((m, i) => {
                const pct = Math.round((m.score / m.max_score) * 100);
                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800">{m.exam_name}</td>
                    <td className="px-5 py-4 text-slate-600">{m.subject}</td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900">{m.score}</span>
                      <span className="text-slate-400">/{m.max_score}</span>
                    </td>
                    <td className="px-5 py-4 min-w-[150px]">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${pct >= 75 ? 'bg-sky-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${pct >= 75 ? 'text-sky-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {marks.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-400 text-sm font-medium">No academics data found.</td></tr>}
            </tbody>
          </table>
        </div>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Fees</h2>
        <p className="text-sm text-slate-500">Your fee payment history.</p>
      </div>

      <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {fees.map((f, i) => (
            <div key={i} className="px-5 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div>
                <div className="font-bold text-slate-800 text-lg mb-0.5">{f.term}</div>
                <div className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Calendar size={14} /> Due: {new Date(f.due_date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <span className="font-bold text-xl text-slate-900">₹{f.amount}</span>
                <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  f.status === 'PAID' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {f.status}
                </span>
              </div>
            </div>
          ))}
          {fees.length === 0 && <div className="p-8 text-center text-slate-400 text-sm font-medium">No fee records found.</div>}
        </div>
      </div>
    </div>
  )
}
