import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  School,
  Mail,
  Shield,
  GraduationCap,
  Briefcase,
  RefreshCw,
  Loader2,
  Calendar,
} from 'lucide-react'
import api from '../lib/api'

interface PlatformUser {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STAFF'
  subject?: string
  join_date?: string
  school_id: number
  school_name: string
  subscription_status?: string
}

interface UsersListProps {
  onSelectSchool?: (schoolId: number) => void
}

export default function UsersList({ onSelectSchool }: UsersListProps) {
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'TEACHER' | 'STAFF'>('ALL')
  const [refreshing, setRefreshing] = useState(false)

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const res = await api.get('/superadmin/users/all', {
        params: {
          role: roleFilter,
          search: search || undefined,
        },
      })
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to load platform users:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 250)
    return () => clearTimeout(timer)
  }, [roleFilter, search])

  const roleCounts = useMemo(() => {
    return {
      all: users.length,
      admin: users.filter((u) => u.role === 'ADMIN').length,
      teacher: users.filter((u) => u.role === 'TEACHER').length,
      staff: users.filter((u) => u.role === 'STAFF').length,
    }
  }, [users])

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Platform Staff & Faculty Directory
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global directory of school administrators, teachers, and staff across all tenants
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            {(['ALL', 'ADMIN', 'TEACHER', 'STAFF'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or school…"
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading platform users…</p>
        </div>
      ) : users.length === 0 ? (
        <div className="py-20 text-center">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No staff members found</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
            Try adjusting your search criteria or role filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Assigned School</th>
                <th className="px-6 py-3.5">Department / Subject</th>
                <th className="px-6 py-3.5 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {u.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <Mail size={11} /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300'
                          : u.role === 'TEACHER'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {u.role === 'ADMIN' ? (
                        <Shield size={11} />
                      ) : u.role === 'TEACHER' ? (
                        <GraduationCap size={11} />
                      ) : (
                        <Briefcase size={11} />
                      )}
                      {u.role}
                    </span>
                  </td>

                  <td className="px-6 py-3.5">
                    {onSelectSchool ? (
                      <button
                        onClick={() => onSelectSchool(u.school_id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        <School size={13} className="shrink-0 text-slate-400" />
                        <span className="truncate">{u.school_name || `School #${u.school_id}`}</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <School size={13} className="shrink-0 text-slate-400" />
                        <span className="truncate">{u.school_name || `School #${u.school_id}`}</span>
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400">
                    {u.subject || '—'}
                  </td>

                  <td className="px-6 py-3.5 text-right font-mono text-[11px] text-slate-400">
                    {u.join_date ? new Date(u.join_date).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Summary */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
        <span>Showing {users.length} active platform members</span>
        <span className="hidden sm:inline">Multi-tenant role-based isolation</span>
      </div>
    </div>
  )
}

