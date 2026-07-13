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
  Palette,
  Menu,
  X,
} from 'lucide-react'
import api from '../lib/api'
import SchoolsList from './SchoolsList'
import { fetchAndApplySettings, applySettings } from '../lib/settings'
import { useLanguage, t } from '../lib/i18n'
import ThemeToggle from '../components/ThemeToggle'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    fetchAndApplySettings()
    fetchData()
  }, [fetchData])

  const lang = useLanguage()

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
    <div className="flex flex-row h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-200">
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/55 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0f172a] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-slate-800/50 flex flex-col transform transition-transform duration-300 ease-in-out md:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Logo / Branding */}
        <div className="p-6 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Shield className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white leading-tight">
                Skill<span className="text-indigo-400">yon</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Super Admin</p>
            </div>
            <button 
              className="md:hidden text-slate-400 hover:text-white ml-auto cursor-pointer p-1 rounded-lg hover:bg-white/5"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto mt-2">
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase px-4 mb-3">Navigation</p>
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.view
            return (
              <button
                key={item.view}
                onClick={() => {
                  setActiveView(item.view);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all text-sm font-semibold relative overflow-hidden group cursor-pointer ${
                  isActive
                    ? 'text-indigo-300 bg-indigo-500/12 border border-indigo-500/30 shadow-[0_4px_12px_rgba(99,102,241,0.08)]'
                    : 'text-slate-400 hover:bg-indigo-500/5 hover:text-indigo-300'
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full" />}
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'
                  }`}
                />
                {t(item.label, lang)}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-[#0f172a]/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center text-sm font-bold border border-white shadow-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{user?.name || 'Super Admin'}</p>
              <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">{user?.email || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t("Sign out", lang)}
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 min-w-0 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/40">
        
        {/* Top Header */}
        <header className="h-16 flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 lg:px-8 flex items-center justify-between z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 mr-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t(viewTitle[activeView].title, lang)}</h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {getGreeting()}, {user?.name || 'Super Admin'}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        You are currently managing <span className="font-medium text-slate-900 dark:text-white">{totalSchools}</span> schools serving <span className="font-medium text-slate-900 dark:text-white">{platformStats.total_students}</span> students.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      All systems operational
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                      <div
                        key={stat.label}
                        className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                          <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                            {stat.icon}
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Platform Staff</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{platformStats.total_staff}</p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{platformStats.total_students}</p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Rate</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {totalSchools > 0 ? Math.round((activeSchools / totalSchools) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Schools Section */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400 dark:text-slate-550" /> Recent Onboardings
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
                  <SettingsView user={user} lang={lang} />
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

function SettingsView({ user, lang }: { user: any; lang: string }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Appearance states
  const [profile, setProfile] = useState({})
  const [notifications, setNotifications] = useState({})
  const [appearance, setAppearance] = useState({
    theme: 'light',
    density: 'comfortable',
    language: 'English'
  })
  const [savingAppearance, setSavingAppearance] = useState(false)
  const [appearanceSaved, setAppearanceSaved] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/user/settings')
        if (res.status === 200 && res.data) {
          if (res.data.profile) setProfile(res.data.profile)
          if (res.data.notifications) setNotifications(res.data.notifications)
          if (res.data.appearance && Object.keys(res.data.appearance).length > 0) {
            setAppearance(res.data.appearance)
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const handleSaveAppearance = async () => {
    try {
      setSavingAppearance(true)
      const res = await api.put('/user/settings', {
        profile,
        notifications,
        appearance
      })
      if (res.status === 200) {
        applySettings(appearance)
        setAppearanceSaved(true)
        setTimeout(() => setAppearanceSaved(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save appearance settings:', err)
    } finally {
      setSavingAppearance(false)
    }
  }

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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-500" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Profile Information</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Name</label>
            <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 font-medium">
              {user?.name || 'Super Admin'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email</label>
            <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 font-medium">
              {user?.email || 'N/A'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Role</label>
            <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">SUPER ADMIN</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Access Level</label>
            <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Full Platform Access</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
            There can only be one Super Admin for the entire platform. This is the highest level of access. School-level admins are managed separately as "Admin" users under each school.
          </p>
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Key className="w-5 h-5 text-slate-500" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Security Settings</h4>
        </div>

        {message && (
          <div className={`mb-6 flex items-start gap-2 p-3 rounded-lg border ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <p className="text-sm font-medium mt-0.5">{message.text}</p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Current Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
                className="w-full pl-9 pr-10 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                New Password
              </label>
              <div className="relative group">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full px-3 pr-10 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
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
