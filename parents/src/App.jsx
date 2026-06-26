import React, { useEffect, useState } from 'react'
import ParentDashboard from './ParentDashboard'
import ParentAttendance from './ParentAttendance'
import ParentFees from './ParentFees'
import ParentAcademics from './ParentAcademics'
import ParentCommunication from './ParentCommunication'
import ParentTransport from './ParentTransport'
import ParentLogin from './ParentLogin'
import Toast from './Toast'
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  CreditCard,
  MessageSquare,
  Bus,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Search
} from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'academics', label: 'Academics', icon: GraduationCap },
  { id: 'fees', label: 'Fees', icon: CreditCard },
  { id: 'communication', label: 'Messages', icon: MessageSquare },
  { id: 'transport', label: 'Transport', icon: Bus },
]

export default function App() {
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [tab, setTab] = useState('dashboard')
  const [toast, setToast] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userStr = localStorage.getItem('user')
  const loggedInUser = userStr ? (() => { try { return JSON.parse(userStr) } catch { return {} } })() : {}
  const displayName = loggedInUser.name || loggedInUser.email || 'Parent'

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
            } else if (res.status === 401) {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              window.location.reload()
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

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P'

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Toast message={toast} onClose={() => setToast(null)} />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar — clean white, slim, soft teal accents */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ease-out md:transform-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        {/* Brand */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
            <GraduationCap size={18} strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">EduCore</span>
          <span className="text-[9px] font-semibold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full ml-auto tracking-wider uppercase">Parent</span>
          <button className="md:hidden ml-2 text-gray-400 hover:text-gray-600" onClick={() => setMobileMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Child selector */}
        {children.length > 1 && (
          <div className="px-4 pt-4">
            <div className="relative">
              <select
                value={selectedChild || ''}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
              >
                {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setMobileMenuOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100">
          <button
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              setChildren([])
              setSelectedChild(null)
              setTab('dashboard')
              setToast('Logged out')
              window.location.reload()
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Top bar — minimal */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold text-gray-900 hidden sm:block">
              {navItems.find(n => n.id === tab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                {getInitials(displayName)}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{displayName}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {tab === 'dashboard' && <ParentDashboard selectedChild={selectedChild} onChildChange={setSelectedChild} />}
            {tab === 'attendance' && <ParentAttendance childId={selectedChild} />}
            {tab === 'fees' && <ParentFees childId={selectedChild} />}
            {tab === 'academics' && <ParentAcademics childId={selectedChild} />}
            {tab === 'communication' && <ParentCommunication childId={selectedChild} />}
            {tab === 'transport' && <ParentTransport childId={selectedChild} />}
          </div>
        </main>
      </div>
    </div>
  )
}
