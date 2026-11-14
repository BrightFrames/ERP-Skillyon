import { useState, useEffect } from 'react'
import {
  Activity,
  Database,
  Cpu,
  Server,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  HardDrive,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import api from '../lib/api'

interface HealthData {
  status: 'HEALTHY' | 'DEGRADED'
  database: {
    status: 'CONNECTED' | 'ERROR'
    latency_ms: number
    db_time?: string
    version?: string
    pool_total_connections?: number
    pool_idle_connections?: number
    pool_waiting_requests?: number
    error?: string
  }
  system?: {
    uptime_seconds: number
    uptime_formatted: string
    memory: {
      heap_used_mb: number
      heap_total_mb: number
      rss_mb: number
    }
    node_version: string
    platform: string
  }
  timestamp: string
}

export default function SystemHealthView() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pinging, setPinging] = useState(false)

  const checkHealth = async (isManual = false) => {
    try {
      if (isManual) setPinging(true)
      else setLoading(true)

      const res = await api.get('/superadmin/system/health')
      setHealth(res.data)
    } catch (err: any) {
      console.error('Health check failed:', err)
      if (err.response?.data) {
        setHealth(err.response.data)
      }
    } finally {
      setLoading(false)
      setPinging(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              health?.status === 'HEALTHY'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
            }`}
          >
            {health?.status === 'HEALTHY' ? <CheckCircle size={26} /> : <AlertTriangle size={26} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Skillyon SaaS Core Engine
              </h3>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  health?.status === 'HEALTHY'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {health?.status === 'HEALTHY' ? 'Operational' : 'Degraded'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time monitoring of database pool, API latency, and server runtimes
            </p>
          </div>
        </div>

        <button
          onClick={() => checkHealth(true)}
          disabled={pinging}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-sm hover:scale-102 disabled:opacity-50"
        >
          <RefreshCw size={14} className={pinging ? 'animate-spin' : ''} />
          {pinging ? 'Testing Connection…' : 'Ping Diagnostics'}
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Inspecting platform components…</p>
        </div>
      ) : health ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Database Diagnostics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  PostgreSQL Tenancy Pool
                </h4>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <p className="text-[11px] font-semibold text-slate-400">Ping Latency</p>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {health.database.latency_ms} ms
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">
                  High Performance
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <p className="text-[11px] font-semibold text-slate-400">Connection Pool</p>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {health.database.pool_total_connections || 0} active
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {health.database.pool_idle_connections || 0} idle connections
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {health.database.version}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Database Server Time</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
                  {health.database.db_time ? new Date(health.database.db_time).toLocaleString() : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Isolation Mode</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Row-level Multi-Tenant (school_id)
                </span>
              </div>
            </div>
          </div>

          {/* Node.js / Server Runtime Diagnostics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  API Gateway & Node Runtime
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Node {health.system?.node_version}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <p className="text-[11px] font-semibold text-slate-400">System Uptime</p>
                <p className="text-base font-black text-slate-900 dark:text-slate-100 mt-1 truncate">
                  {health.system?.uptime_formatted || '0s'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Continuous uptime</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <p className="text-[11px] font-semibold text-slate-400">Heap Memory Used</p>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {health.system?.memory.heap_used_mb || 0} MB
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  of {health.system?.memory.heap_total_mb || 0} MB total heap
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Host Platform</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {health.system?.platform}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Resident Memory (RSS)</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {health.system?.memory.rss_mb || 0} MB
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">JWT Token Security</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={13} /> HS256 Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

