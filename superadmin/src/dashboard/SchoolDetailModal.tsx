import { useState, useEffect } from 'react'
import {
  X,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Mail,
  User,
  ShieldAlert,
} from 'lucide-react'
import api from '../lib/api'

interface SchoolDetailModalProps {
  schoolId: number | null
  onClose: () => void
  onUpdateSubscription?: (school: any) => void
}

interface SchoolStaff {
  id: number
  name: string
  email: string
  role: string
  subject?: string
  join_date?: string
}

interface SchoolDetailData {
  school: {
    id: number
    name: string
    subscription_status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED'
    subscription_expires_at: string | null
    created_at: string
  }
  admin: SchoolStaff | null
  staff: SchoolStaff[]
  stats: {
    student_count: string | number
    staff_count: string | number
    class_count: string | number
  }
}

export default function SchoolDetailModal({ schoolId, onClose, onUpdateSubscription }: SchoolDetailModalProps) {
  const [data, setData] = useState<SchoolDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!schoolId) return
    setLoading(true)
    setError('')
    setShowPasswordReset(false)
    setResetMsg(null)
    setNewPassword('')

    api
      .get(`/superadmin/${schoolId}`)
      .then((res) => {
        setData(res.data)
      })
      .catch((err) => {
        console.error('Failed to load school details:', err)
        setError(err.response?.data?.error || 'Failed to load school details')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [schoolId])

  if (!schoolId) return null

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setResetMsg({ type: 'error', text: 'Password must be at least 6 characters long' })
      return
    }

    setResetting(true)
    setResetMsg(null)

    try {
      await api.post(`/superadmin/${schoolId}/reset-admin-password`, {
        new_password: newPassword,
        admin_id: data?.admin?.id,
      })
      setResetMsg({ type: 'success', text: 'Administrator password reset successfully!' })
      setNewPassword('')
      setTimeout(() => setShowPasswordReset(false), 2000)
    } catch (err: any) {
      setResetMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to reset administrator password',
      })
    } finally {
      setResetting(false)
    }
  }

  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  const schoolPortalUrl = isLocal
    ? 'http://localhost:5173'
    : 'https://erp-skillyon-frontend.vercel.app'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {data?.school.name || 'School Details'}
                </h3>
                {data && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    SCH-{data.school.id.toString().padStart(4, '0')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                School profile, administrator credentials, and staff directory
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={schoolPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-all border border-indigo-200 dark:border-indigo-800"
            >
              Open Staff Portal <ExternalLink size={13} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-medium text-slate-500">Loading school information…</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : data ? (
            <>
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-semibold">Total Students</span>
                    <GraduationCap className="w-4 h-4 text-cyan-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {data.stats.student_count}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-semibold">Faculty & Staff</span>
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {data.stats.staff_count}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-semibold">Classes</span>
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {data.stats.class_count}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-semibold">Status</span>
                    <CreditCard className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${
                        data.school.subscription_status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : data.school.subscription_status === 'TRIAL'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}
                    >
                      {data.school.subscription_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Administrator & Principal Section */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md shadow-indigo-600/20">
                      {data.admin?.name?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {data.admin?.name || 'No Principal Assigned'}
                        </h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-600 text-white">
                          School Admin
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                        <Mail size={13} /> {data.admin?.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordReset(!showPasswordReset)}
                      className="px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <KeyRound size={14} />
                      {showPasswordReset ? 'Cancel Reset' : 'Reset Admin Password'}
                    </button>
                    {onUpdateSubscription && (
                      <button
                        type="button"
                        onClick={() => onUpdateSubscription(data.school)}
                        className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                      >
                        Edit Subscription
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Password Reset Form */}
                {showPasswordReset && (
                  <form onSubmit={handleResetPassword} className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center gap-2.5">
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new admin password (min 6 chars)"
                      className="w-full sm:flex-1 px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="submit"
                      disabled={resetting}
                      className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {resetting ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                      Set Password
                    </button>
                  </form>
                )}

                {resetMsg && (
                  <p
                    className={`text-xs font-semibold mt-2 ${
                      resetMsg.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {resetMsg.text}
                  </p>
                )}
              </div>

              {/* Staff & Faculty Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Users size={16} className="text-slate-400" />
                    School Staff Directory ({data.staff.length})
                  </h4>
                </div>

                {data.staff.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                    No staff members registered for this school yet.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                        <tr>
                          <th className="px-4 py-2.5">Name</th>
                          <th className="px-4 py-2.5">Email</th>
                          <th className="px-4 py-2.5">Role</th>
                          <th className="px-4 py-2.5">Subject / Department</th>
                          <th className="px-4 py-2.5 text-right">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {data.staff.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px]">
                                {s.name?.[0]?.toUpperCase()}
                              </div>
                              {s.name}
                            </td>
                            <td className="px-4 py-3">{s.email}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  s.role === 'ADMIN'
                                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                                    : s.role === 'TEACHER'
                                    ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {s.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{s.subject || '—'}</td>
                            <td className="px-4 py-3 text-right text-slate-500 font-mono text-[11px]">
                              {s.join_date ? new Date(s.join_date).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Created on {data?.school.created_at ? new Date(data.school.created_at).toLocaleDateString() : '—'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

