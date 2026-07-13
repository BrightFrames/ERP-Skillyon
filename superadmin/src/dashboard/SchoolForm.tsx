import { useState } from 'react'
import { X, Loader2, Eye, EyeOff, School, CheckCircle, AlertCircle, Shield, Mail, User, Lock, Building2, Plus } from 'lucide-react'
import api from '../lib/api'

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function SchoolForm({ isOpen, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    school_name: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    subscription_status: 'TRIAL',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.admin_password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    setError('')
    setLoading(true)

    try {
      await api.post('/superadmin', {
        school_name: form.school_name,
        admin_name: form.admin_name,
        admin_email: form.admin_email,
        admin_password: form.admin_password,
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        resetForm()
        onCreated()
      }, 1500)
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to create school. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      school_name: '',
      admin_name: '',
      admin_email: '',
      admin_password: '',
      subscription_status: 'TRIAL',
    })
    setError('')
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  // Password strength logic (simple)
  const getPasswordStrength = () => {
    const pw = form.admin_password
    if (!pw) return { score: 0, label: '', color: 'bg-slate-200' }
    if (pw.length < 6) return { score: 1, label: 'Weak', color: 'bg-red-400' }
    if (pw.length < 10) return { score: 2, label: 'Fair', color: 'bg-amber-400' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-400' }
  }
  const strength = getPasswordStrength()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Onboard New School</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Register a new school and create its principal admin account</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 transition-all cursor-pointer group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="px-8 py-20 text-center animate-fade-in flex-1">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
              <CheckCircle className="w-10 h-10 text-emerald-500 relative z-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">School Onboarded!</h4>
            <p className="text-slate-500 dark:text-slate-400 mt-2">The school and principal account have been created successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-8 py-6 overflow-y-auto">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 animate-slide-down">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Section 1: School Profile */}
                <div className="bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">School Profile</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        School Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="school_name"
                        required
                        value={form.school_name}
                        onChange={handleChange}
                        placeholder="e.g. Springfield Academy"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Initial Status
                      </label>
                      <select
                        name="subscription_status"
                        value={form.subscription_status}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 cursor-pointer appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 1rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.25em 1.25em',
                        }}
                      >
                        <option value="TRIAL" className="dark:bg-slate-900">Trial Mode (Recommended)</option>
                        <option value="ACTIVE" className="dark:bg-slate-900">Active (Paid)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Principal Admin Account */}
                <div className="bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Principal Admin Account</h4>
                  </div>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="text"
                            name="admin_name"
                            required
                            value={form.admin_name}
                            onChange={handleChange}
                            placeholder="e.g. John Smith"
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Email Address <span className="text-red-400">*</span>
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="email"
                            name="admin_email"
                            required
                            value={form.admin_email}
                            onChange={handleChange}
                            placeholder="principal@school.com"
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Account Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="admin_password"
                          required
                          value={form.admin_password}
                          onChange={handleChange}
                          placeholder="Set a secure password"
                          className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1 flex gap-1 h-1.5">
                          {[1, 2, 3].map(level => (
                            <div 
                              key={level} 
                              className={`flex-1 rounded-full transition-colors duration-300 ${strength.score >= level ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-10 text-right uppercase tracking-wider">
                          {strength.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 rounded-b-3xl shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Onboarding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Complete Onboarding
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
