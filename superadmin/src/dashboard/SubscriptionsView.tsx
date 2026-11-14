import { useState, useEffect } from 'react'
import {
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  Loader2,
  RefreshCw,
  PlusCircle,
} from 'lucide-react'
import api from '../lib/api'
import SubscriptionModal from './SubscriptionModal'

interface SchoolSubItem {
  id: number
  name: string
  subscription_status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED'
  subscription_expires_at: string | null
  created_at: string
  student_count: number
  staff_count: number
}

interface SubscriptionsData {
  all: SchoolSubItem[]
  expiringSoon: SchoolSubItem[]
  expired: SchoolSubItem[]
  counts: {
    total: number
    active: number
    trial: number
    suspended: number
    past_due: number
  }
}

export default function SubscriptionsView() {
  const [data, setData] = useState<SubscriptionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'expiring' | 'trials'>('all')
  const [editingSchool, setEditingSchool] = useState<any | null>(null)

  const fetchSubscriptions = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const res = await api.get('/superadmin/subscriptions/overview')
      setData(res.data)
    } catch (err) {
      console.error('Failed to load subscriptions overview:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleQuickExtend = async (schoolId: number, daysToAdd: number) => {
    try {
      const current = data?.all.find((s) => s.id === schoolId)
      const baseDate =
        current?.subscription_expires_at && new Date(current.subscription_expires_at) > new Date()
          ? new Date(current.subscription_expires_at)
          : new Date()
      baseDate.setDate(baseDate.getDate() + daysToAdd)

      await api.put(`/superadmin/${schoolId}/subscription`, {
        subscription_status: 'ACTIVE',
        subscription_expires_at: baseDate.toISOString().split('T')[0],
      })
      fetchSubscriptions(true)
    } catch (err) {
      console.error('Failed to extend subscription:', err)
    }
  }

  const displayedSchools = () => {
    if (!data) return []
    if (activeTab === 'expiring') return data.expiringSoon
    if (activeTab === 'trials') return data.all.filter((s) => s.subscription_status === 'TRIAL')
    return data.all
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tenancies</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {data?.counts.total || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Building2 size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Paid Plans</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {data?.counts.active || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trial Period</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {data?.counts.trial || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Expiring in 30 Days</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {data?.expiringSoon.length || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Expiry Alert banner */}
      {data && data.expiringSoon.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
            <span className="text-xs font-semibold">
              <strong className="font-bold">{data.expiringSoon.length} school(s)</strong> have subscriptions expiring within the next 30 days.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('expiring')}
            className="text-xs font-bold text-amber-900 dark:text-amber-200 underline hover:opacity-80 shrink-0 cursor-pointer"
          >
            Review Renewals
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              School Subscriptions & Renewal Management
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Control SaaS billing statuses, expiration windows, and instant extensions
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center p-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                All ({data?.all.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('expiring')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'expiring'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Expiring Soon ({data?.expiringSoon.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('trials')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'trials'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Trials ({data?.counts.trial || 0})
              </button>
            </div>

            <button
              onClick={() => fetchSubscriptions(true)}
              disabled={refreshing}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading subscriptions…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">School</th>
                  <th className="px-6 py-3.5">Current Status</th>
                  <th className="px-6 py-3.5">Expires On</th>
                  <th className="px-6 py-3.5">Population</th>
                  <th className="px-6 py-3.5 text-right">Quick Extend Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedSchools().map((school) => {
                  const isExpired =
                    school.subscription_expires_at &&
                    new Date(school.subscription_expires_at) <= new Date()

                  return (
                    <tr
                      key={school.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {school.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              ID: SCH-{school.id.toString().padStart(4, '0')}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                            school.subscription_status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                              : school.subscription_status === 'TRIAL'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {school.subscription_status === 'ACTIVE' ? (
                            <CheckCircle size={12} />
                          ) : (
                            <Clock size={12} />
                          )}
                          {school.subscription_status}
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar size={13} className="text-slate-400" />
                          <span
                            className={
                              isExpired
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300'
                            }
                          >
                            {school.subscription_expires_at
                              ? new Date(school.subscription_expires_at).toLocaleDateString()
                              : 'Never (Lifetime)'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <GraduationCap size={13} className="text-cyan-500" />
                            {school.student_count || 0}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Users size={13} className="text-indigo-500" />
                            {school.staff_count || 0}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickExtend(school.id, 30)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
                            title="Add 30 days active subscription"
                          >
                            +30 Days
                          </button>
                          <button
                            onClick={() => handleQuickExtend(school.id, 365)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Add 1 year active subscription"
                          >
                            +1 Year
                          </button>
                          <button
                            onClick={() => setEditingSchool(school)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingSchool && (
        <SubscriptionModal
          isOpen={!!editingSchool}
          onClose={() => setEditingSchool(null)}
          school={editingSchool}
          onUpdated={() => {
            setEditingSchool(null)
            fetchSubscriptions(true)
          }}
        />
      )}
    </div>
  )
}

