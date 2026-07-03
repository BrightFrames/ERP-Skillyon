import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Building2,
  MoreHorizontal,
  Users,
  GraduationCap,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import SchoolForm from './SchoolForm'
import SubscriptionModal from './SubscriptionModal'
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
  schools: School[]
  onRefresh: () => void
  compact?: boolean
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  TRIAL: { 
    bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50', 
    text: 'text-amber-700 dark:text-amber-400', 
    dot: 'bg-amber-400', 
    icon: <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> 
  },
  ACTIVE: { 
    bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50', 
    text: 'text-emerald-700 dark:text-emerald-400', 
    dot: 'bg-emerald-400', 
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> 
  },
  PAST_DUE: { 
    bg: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50', 
    text: 'text-orange-700 dark:text-orange-400', 
    dot: 'bg-orange-400', 
    icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" /> 
  },
  SUSPENDED: { 
    bg: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50', 
    text: 'text-red-700 dark:text-red-400', 
    dot: 'bg-red-400', 
    icon: <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" /> 
  },
}

const ITEMS_PER_PAGE = 8

export default function SchoolsList({ schools, onRefresh, compact = false }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  
  const [showForm, setShowForm] = useState(false)
  const [editSchool, setEditSchool] = useState<School | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    let result = schools
    
    if (statusFilter !== 'ALL') {
      result = result.filter(s => s.subscription_status === statusFilter)
    }
    
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.subscription_status.toLowerCase().includes(q)
      )
    }
    
    return result
  }, [schools, search, statusFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const currentItems = compact ? filtered : filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  useMemo(() => setCurrentPage(1), [search, statusFilter])

  const handleDelete = async (school: School) => {
    if (!confirm(`Are you sure you want to delete "${school.name}"? This action cannot be undone.`)) return
    setDeletingId(school.id)
    try {
      await api.delete(`/superadmin/${school.id}`)
      onRefresh()
    } catch (err) {
      console.error('Failed to delete school:', err)
      alert('Failed to delete school. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <>
      <div className={`bg-white border border-slate-200/70 rounded-3xl shadow-sm overflow-hidden animate-fade-in dark:bg-slate-900 dark:border-slate-800 ${compact ? '' : 'stagger-1'}`}>
        
        {!compact && (
          <div className="px-8 py-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/50 dark:border-slate-850 dark:bg-slate-900/40">
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight dark:text-slate-100">
                Registered Schools
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium dark:text-slate-400">
                Manage {schools.length} school{schools.length !== 1 ? 's' : ''} across the platform
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center p-1 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-850 dark:border-slate-750">
                {['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      statusFilter === status 
                        ? 'bg-slate-900 text-white shadow-md dark:bg-indigo-600 dark:text-white' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search schools…"
                  className="pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 w-full sm:w-64 shadow-sm dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200 dark:placeholder-slate-500"
                />
              </div>
              
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              >
                <Plus className="w-4 h-4" />
                Add School
              </button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-24 text-center animate-fade-in">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-sm dark:bg-slate-850 dark:border-slate-800">
              <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-700 mb-2 tracking-tight dark:text-slate-200">
              {search || statusFilter !== 'ALL' ? 'No matching schools found' : 'No schools registered yet'}
            </h4>
            <p className="text-sm text-slate-400 max-w-sm mx-auto font-medium dark:text-slate-500">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your filters or search query.'
                : 'Get started by onboarding the first school to the platform.'}
            </p>
            {(!search && statusFilter === 'ALL' && !compact) && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-100/50 shadow-sm dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30"
              >
                <Plus className="w-5 h-5" />
                Add First School
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/30 dark:border-slate-850">
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8 py-5 whitespace-nowrap dark:text-slate-500">
                    School Details
                  </th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8 py-5 whitespace-nowrap dark:text-slate-500">
                    Status
                  </th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8 py-5 whitespace-nowrap text-center dark:text-slate-500">
                    Population
                  </th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8 py-5 whitespace-nowrap dark:text-slate-500">
                    Onboarded
                  </th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8 py-5 whitespace-nowrap text-right dark:text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {currentItems.map((school) => {
                  const statusStyle = STATUS_STYLES[school.subscription_status] || STATUS_STYLES.TRIAL
                  return (
                    <tr
                      key={school.id}
                      className="group transition-colors duration-200 hover:bg-slate-50/60 dark:hover:bg-slate-850/40"
                    >
                      {/* School Name & ID */}
                      <td className="px-8 py-5 align-middle">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform dark:bg-indigo-950/40 dark:border-indigo-900/50">
                            <Building2 className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 tracking-tight dark:text-slate-100">
                              {school.name}
                            </p>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider dark:text-slate-500">
                              ID: SCH-{school.id.toString().padStart(4, '0')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-8 py-5 align-middle">
                        <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} shadow-sm`}>
                          {statusStyle.icon}
                          <span className="tracking-wide">{school.subscription_status}</span>
                        </div>
                      </td>

                      {/* Population Stats */}
                      <td className="px-8 py-5 align-middle">
                        <div className="flex items-center justify-center gap-6">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700 dark:text-slate-200">
                              <GraduationCap className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                              {school.student_count}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 dark:text-slate-500">Students</span>
                          </div>
                          <div className="w-px h-8 bg-slate-200/80 dark:bg-slate-800/80" />
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700 dark:text-slate-200">
                              <Users className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                              {school.staff_count}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 dark:text-slate-500">Staff</span>
                          </div>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-8 py-5 align-middle">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {formatDate(school.created_at)}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 mt-1 dark:text-slate-500">
                            {school.subscription_expires_at ? `Expires ${formatDate(school.subscription_expires_at)}` : 'No expiry'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-5 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => setEditSchool(school)}
                            title="Edit Subscription"
                            className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer shadow-sm dark:hover:text-indigo-400 dark:hover:bg-indigo-950/30 dark:hover:border-indigo-900/50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(school)}
                            disabled={deletingId === school.id}
                            title="Delete School"
                            className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer shadow-sm disabled:opacity-50 dark:hover:text-red-400 dark:hover:bg-red-950/30 dark:hover:border-red-900/50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <button className="p-2.5 inline-flex items-center justify-center rounded-xl text-slate-400 group-hover:hidden w-10 h-10">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {(!compact && filtered.length > 0) && (
          <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 dark:border-slate-850 dark:bg-slate-900/40">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing <span className="text-slate-800 dark:text-slate-200">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="text-slate-800 dark:text-slate-200">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of{' '}
              <span className="text-slate-800 dark:text-slate-200">{filtered.length}</span> schools
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:shadow-sm disabled:opacity-50 transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200">
                {currentPage} / {totalPages || 1}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:shadow-sm disabled:opacity-50 transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      <SchoolForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => {
          setShowForm(false)
          onRefresh()
        }}
      />

      {editSchool && (
        <SubscriptionModal
          isOpen={!!editSchool}
          onClose={() => setEditSchool(null)}
          school={editSchool}
          onUpdated={() => {
            setEditSchool(null)
            onRefresh()
          }}
        />
      )}
    </>
  )
}
