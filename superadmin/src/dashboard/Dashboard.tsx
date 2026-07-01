import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  LayoutDashboard,
  School,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  RefreshCw,
  Users,
  GraduationCap,
  Activity,
  TrendingUp,
  Zap,
  Globe,
  Key,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Info,
} from 'lucide-react'
import api from '../lib/api'
import SchoolsList from './SchoolsList'

interface SchoolData {
  id: number
  name: string
  subscription_status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED'
  subscription_expires_at: string | null
  created_at: string
  staff_count: number
  student_count: number
}

interface StatCard {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  bgGradient: string
  iconBg: string
}

type NavView = 'dashboard' | 'schools' | 'settings'

const NAV_ITEMS: { label: string; icon: typeof LayoutDashboard; view: NavView }[] = [
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
  { label: 'Schools', icon: School, view: 'schools' },
  { label: 'Settings', icon: Settings, view: 'settings' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [schools, setSchools] = useState<SchoolData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<NavView>('dashboard')
  const [refreshing, setRefreshing] = useState(false)
  const [platformStats, setPlatformStats] = useState({ total_staff: 0, total_students: 0 })

  const user = JSON.parse(localStorage.getItem('sa_user') || '{}')

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const [schoolsRes, meRes] = await Promise.all([
        api.get('/superadmin'),
        api.get('/superadmin/me'),
      ])
      setSchools(Array.isArray(schoolsRes.data) ? schoolsRes.data : schoolsRes.data.schools || [])
      if (meRes.data.stats) {
        setPlatformStats({
          total_staff: parseInt(meRes.data.stats.total_staff) || 0,
          total_students: parseInt(meRes.data.stats.total_students) || 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleLogout = () => {
    localStorage.removeItem('sa_token')
    localStorage.removeItem('sa_user')
    navigate('/login', { replace: true })
  }

  const totalSchools = schools.length
  const activeSchools = schools.filter((s) => s.subscription_status === 'ACTIVE').length
  const trialSchools = schools.filter((s) => s.subscription_status === 'TRIAL').length
  const suspendedSchools = schools.filter((s) => s.subscription_status === 'SUSPENDED').length

  const stats: StatCard[] = [
    {
      label: 'Total Schools',
      value: totalSchools,
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-indigo-600',
      bgGradient: 'from-indigo-500/10 to-indigo-600/5',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    },
    {
      label: 'Active Subscriptions',
      value: activeSchools,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-emerald-600',
      bgGradient: 'from-emerald-500/10 to-emerald-600/5',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    },
    {
      label: 'Trial Schools',
      value: trialSchools,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-amber-600',
      bgGradient: 'from-amber-500/10 to-amber-600/5',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
    },
    {
      label: 'Suspended',
      value: suspendedSchools,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-red-600',
      bgGradient: 'from-red-500/10 to-red-600/5',
      iconBg: 'bg-red-50 text-red-600 border border-red-100',
    },
  ]

  const viewTitle: Record<NavView, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Platform overview & analytics' },
    schools: { title: 'Schools Management', subtitle: 'Manage all registered schools' },
    settings: { title: 'Settings', subtitle: 'Platform configuration & profile' },
  }

  return (
    <div className="flex flex-row h-screen w-full bg-slate-50 overflow-hidden text-slate-800">
      
      {/* ─── Sidebar ─── */}
      <aside className="w-64 flex-none h-full bg-slate-950 flex flex-col border-r border-slate-800 z-20">
        
        {/* Logo / Branding */}
        <div className="h-16 flex-none flex items-center gap-3 px-6 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight">Skillyon</h1>
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Super Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-4">Navigation</p>
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.view
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? 'bg-indigo-500/10 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-500 group-hover:text-slate-300'
                }`}>
                  <item.icon className="w-[18px] h-[18px]" />
                </div>
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-slate-500" />}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-950/50">
          <div className="flex items-center gap-3 p-2 mb-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-md shadow-indigo-500/20">
              {user?.name?.[0] || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Super Admin'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <p className="text-[10px] text-slate-400 font-medium">Platform Owner</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 min-w-0 flex flex-col h-full bg-slate-50/50">
        
        {/* Top Header */}
        <header className="h-16 flex-none bg-white border-b border-slate-200/60 px-6 lg:px-8 flex items-center justify-between z-10 shadow-sm shadow-slate-200/20">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{viewTitle[activeView].title}</h2>
            <p className="text-xs text-slate-500 font-medium">{viewTitle[activeView].subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Verified Admin</span>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Loading platform data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ───── DASHBOARD VIEW ───── */}
              {activeView === 'dashboard' && (
                <div className="animate-fade-in space-y-8 max-w-7xl mx-auto">
                  
                  {/* Hero Banner */}
                  <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{getGreeting()}</span>
                        </div>
                        <h3 className="text-3xl font-extrabold tracking-tight mb-2">{user?.name || 'Super Admin'}</h3>
                        <p className="text-slate-300 text-sm md:text-base max-w-xl">
                          You are currently managing <strong className="text-white">{totalSchools}</strong> schools on the Skillyon platform, serving a total of <strong className="text-white">{platformStats.total_students}</strong> enrolled students.
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <Activity className="w-6 h-6 text-emerald-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Status</p>
                          <p className="text-sm font-bold text-emerald-400">All systems operational</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                      <div
                        key={stat.label}
                        className={`bg-white rounded-3xl p-6 border border-slate-200/70 shadow-sm shadow-slate-200/50 relative overflow-hidden group hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 animate-card-entrance stagger-${i + 1}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.iconBg} transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
                            {stat.icon}
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{stat.value}</p>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        </div>
                        {/* Soft background gradient on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                      </div>
                    ))}
                  </div>

                  {/* Quick Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-sm flex items-center gap-5 animate-card-entrance stagger-5">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Platform Staff</p>
                        <p className="text-2xl font-extrabold text-slate-800">{platformStats.total_staff}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-sm flex items-center gap-5 animate-card-entrance stagger-5">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-cyan-500" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Students</p>
                        <p className="text-2xl font-extrabold text-slate-800">{platformStats.total_students}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-sm flex items-center gap-5 animate-card-entrance stagger-5">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Rate</p>
                        <p className="text-2xl font-extrabold text-slate-800">
                          {totalSchools > 0 ? Math.round((activeSchools / totalSchools) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Schools Section */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" /> Recent Onboardings
                      </h4>
                      <button
                        onClick={() => setActiveView('schools')}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        View all <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <SchoolsList schools={schools.slice(0, 5)} onRefresh={() => fetchData(true)} compact />
                  </div>
                </div>
              )}

              {/* ───── SCHOOLS VIEW ───── */}
              {activeView === 'schools' && (
                <div className="animate-fade-in max-w-7xl mx-auto">
                  <SchoolsList schools={schools} onRefresh={() => fetchData(true)} />
                </div>
              )}

              {/* ───── SETTINGS VIEW ───── */}
              {activeView === 'settings' && (
                <div className="animate-fade-in max-w-4xl mx-auto">
                  <SettingsView user={user} />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

/* ─── Settings View Component ─── */

function SettingsView({ user }: { user: any }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    setSaving(true)
    setMessage(null)
    
    setTimeout(() => {
      setSaving(false)
      setMessage({ type: 'success', text: 'Password change functionality will be available soon.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/70 p-8 shadow-sm animate-card-entrance stagger-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-500" />
          </div>
          <h4 className="text-lg font-bold text-slate-800">Profile Information</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
            <div className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-semibold">
              {user?.name || 'Super Admin'}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
            <div className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-semibold">
              {user?.email || 'N/A'}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
            <div className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-bold text-indigo-700">SUPER ADMIN</span>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Access Level</label>
            <div className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-700">Full Platform Access</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800 leading-relaxed font-medium">
            There can only be one Super Admin for the entire platform. This is the highest level of access. School-level admins are managed separately as "Admin" users under each school.
          </p>
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-white rounded-3xl border border-slate-200/70 p-8 shadow-sm animate-card-entrance stagger-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Key className="w-5 h-5 text-slate-500" />
          </div>
          <h4 className="text-lg font-bold text-slate-800">Security Settings</h4>
        </div>

        {message && (
          <div className={`mb-6 flex items-start gap-3 p-4 rounded-2xl border animate-slide-down ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div className="max-w-md">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Current Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative group">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full px-4 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
