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
  TRIAL: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400', icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
  ACTIVE: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400', icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> },
  PAST_DUE: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', dot: 'bg-orange-400', icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-500" /> },
  SUSPENDED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-400', icon: <XCircle className="w-3.5 h-3.5 text-red-500" /> },
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
      <div className={`bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden animate-fade-in ${compact ? '' : 'stagger-1'}`}>
        
        {!compact && (
          <div className="px-8 py-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                Registered Schools
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Manage {schools.length} school{schools.length !== 1 ? 's' : ''} across the platform
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
                {['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      statusFilter === status 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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
                  className="pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 w-full sm:w-64 shadow-sm"
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
            <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
              <Building2 className="w-10 h-10 text-slate-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-700 mb-2 tracking-tight">
              {search || statusFilter !== 'ALL' ? 'No matching schools found' : 'No schools registered yet'}
            </h4>
            <p className="text-sm text-slate-400 max-w-sm mx-auto font-medium">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your filters or search query.'
                : 'Get started by onboarding the first school to the platform.'}
            </p>
            {(!search && statusFilter === 'ALL' && !compact) && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-100/50 shadow-sm"
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
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8 py-5 whitespace-nowrap">
                    School Details
                  </th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8 py-5 whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8 py-5 whitespace-nowrap text-center">
                    Population
                  </th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8 py-5 whitespace-nowrap">
                    Onboarded
                  </th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8 py-5 whitespace-nowrap text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {currentItems.map((school) => {
                  const statusStyle = STATUS_STYLES[school.subscription_status] || STATUS_STYLES.TRIAL
                  return (
                    <tr
                      key={school.id}
                      className="group transition-colors duration-200 hover:bg-slate-50/60"
                    >
                      {/* School Name & ID */}
                      <td className="px-8 py-5 align-middle">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:scale-105 transition-transform">
                            <Building2 className="w-6 h-6 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 tracking-tight">
                              {school.name}
                            </p>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
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
                            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                              <GraduationCap className="w-4 h-4 text-cyan-500" />
                              {school.student_count}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Students</span>
                          </div>
                          <div className="w-px h-8 bg-slate-200/80" />
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                              <Users className="w-4 h-4 text-violet-500" />
                              {school.staff_count}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Staff</span>
                          </div>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-8 py-5 align-middle">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">
                            {formatDate(school.created_at)}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 mt-1">
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
                            className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer shadow-sm"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(school)}
                            disabled={deletingId === school.id}
                            title="Delete School"
                            className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer shadow-sm disabled:opacity-50"
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
          <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="text-slate-800">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of{' '}
              <span className="text-slate-800">{filtered.length}</span> schools
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm">
                {currentPage} / {totalPages || 1}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:shadow-sm disabled:opacity-50 transition-all cursor-pointer"
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
