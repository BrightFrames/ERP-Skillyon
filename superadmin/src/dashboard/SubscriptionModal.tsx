import { useState, useEffect } from 'react'
import { X, Loader2, CreditCard, CheckCircle, AlertCircle, Clock, Save, Building2, Calendar, History } from 'lucide-react'
import api from '../lib/api'

interface School {
  id: number
  name: string
  subscription_status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED'
  subscription_expires_at: string | null
  created_at: string
  staff_count: number
  student_count: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  school: School
  onUpdated: () => void
}

const STATUS_OPTIONS = [
  { value: 'TRIAL', label: 'Trial Mode', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { value: 'ACTIVE', label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { value: 'PAST_DUE', label: 'Past Due', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { value: 'SUSPENDED', label: 'Suspended', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
]

export default function SubscriptionModal({ isOpen, onClose, school, onUpdated }: Props) {
  const [status, setStatus] = useState(school.subscription_status)
  const [expiryDate, setExpiryDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setStatus(school.subscription_status)
    setExpiryDate(
      school.subscription_expires_at
        ? school.subscription_expires_at.split('T')[0]
        : ''
    )
    setError('')
    setSuccess(false)
  }, [school])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.put(`/superadmin/${school.id}/subscription`, {
        subscription_status: status,
        subscription_expires_at: expiryDate || null,
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onUpdated()
      }, 1200)
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to update subscription. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const currentOption = STATUS_OPTIONS.find(o => o.value === status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-black/20 animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Manage Subscription</h3>
              <p className="text-[13px] text-slate-500 mt-0.5">Update billing status and access rights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="px-8 py-20 text-center animate-fade-in flex-1">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
              <CheckCircle className="w-10 h-10 text-emerald-500 relative z-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription Updated!</h4>
            <p className="text-slate-500 mt-2">Changes to the school's access have been saved.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-8 py-6 overflow-y-auto space-y-6">
              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 animate-slide-down">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              {/* Context Header */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Target School</p>
                    <p className="text-sm font-bold text-slate-800">{school.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                    STATUS_OPTIONS.find(o => o.value === school.subscription_status)?.bg
                  } ${STATUS_OPTIONS.find(o => o.value === school.subscription_status)?.color}`}>
                    {school.subscription_status}
                  </span>
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <History className="w-3.5 h-3.5" />
                  New Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = status === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value as School['subscription_status'])}
                        className={`relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                          isSelected
                            ? `border-indigo-500 bg-indigo-50/50`
                            : `border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50`
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                        <span className={`text-sm font-bold mb-1 ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {opt.label}
                        </span>
                        <span className={`text-[11px] font-medium ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {opt.value === 'ACTIVE' && 'Full access to platform'}
                          {opt.value === 'TRIAL' && 'Temporary access'}
                          {opt.value === 'PAST_DUE' && 'Payment required soon'}
                          {opt.value === 'SUSPENDED' && 'Access revoked'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  Expiration Date (Optional)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 cursor-pointer"
                  />
                </div>
                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Leave empty for perpetual access. If set, the school will automatically transition to <strong className="text-slate-700">PAST DUE</strong> after this date passes.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200/70 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Subscription
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
