import { useState, useEffect } from 'react';
import {
  TrendingUp, Users, GraduationCap, Banknote,
  BookOpen, Award, AlertTriangle, Download, BarChart2,
  ChevronUp, ChevronDown, Minus
} from 'lucide-react';
import api from './lib/api';

export default function ReportsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [fees, setFees] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students?page=0&limit=200'),
      api.get('/classes'),
      api.get('/fees').catch(() => ({ data: { stats: {} } })),
    ]).then(([sRes, cRes, fRes]) => {
      setStudents(sRes.data.data || []);
      setClasses(cRes.data || []);
      setFees(fRes.data.stats || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // --- derived stats ---
  const total = students.length;
  const active = students.filter(s => s.status === 'Active' || !s.status).length;
  const inactive = students.filter(s => s.status && s.status !== 'Active').length;
  const male = students.filter(s => s.gender === 'Male').length;
  const female = students.filter(s => s.gender === 'Female').length;

  // Students per class
  const classCounts: Record<string, number> = {};
  students.forEach(s => {
    const name = s.class_name || 'Unassigned';
    classCounts[name] = (classCounts[name] || 0) + 1;
  });
  const classData = Object.entries(classCounts).sort((a, b) => b[1] - a[1]);
  const maxClassCount = Math.max(...classData.map(c => c[1]), 1);

  // Gender split bar
  const malePercent = total > 0 ? Math.round((male / total) * 100) : 50;
  const femalePercent = 100 - malePercent;

  // Fee collection rate
  const totalFees = Number(fees.collected || 0) + Number(fees.pending || 0) + Number(fees.overdue || 0);
  const collectionRate = totalFees > 0 ? Math.round((Number(fees.collected) / totalFees) * 100) : 0;

  const FMT = (v: number) => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const Trend = ({ value }: { value: number }) => {
    if (value > 0) return <span className="flex items-center gap-0.5 text-emerald-500 text-xs font-bold"><ChevronUp size={14} />{value}%</span>;
    if (value < 0) return <span className="flex items-center gap-0.5 text-red-400 text-xs font-bold"><ChevronDown size={14} />{Math.abs(value)}%</span>;
    return <span className="flex items-center gap-0.5 text-zinc-400 text-xs font-bold"><Minus size={14} />0%</span>;
  };

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#3b3dbf]">Reports & Analytics</h1>
          <p className="text-zinc-400 text-sm mt-0.5">A complete overview of institutional performance and trends.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 shadow-sm shrink-0 transition-colors">
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: loading ? '...' : total, icon: Users, color: 'bg-indigo-50 text-[#3b3dbf]', trend: 12 },
          { label: 'Active Classes', value: loading ? '...' : classes.length, icon: BookOpen, color: 'bg-teal-50 text-teal-600', trend: 0 },
          { label: 'Fees Collected', value: loading ? '...' : FMT(Number(fees.collected || 0)), icon: Banknote, color: 'bg-emerald-50 text-emerald-600', trend: 8 },
          { label: 'Overdue Fees', value: loading ? '...' : FMT(Number(fees.overdue || 0)), icon: AlertTriangle, color: 'bg-red-50 text-red-500', trend: -5 },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-zinc-400 mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-zinc-900">{item.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon size={20} />
              </div>
            </div>
            <Trend value={item.trend} />
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Students by Class */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-base text-zinc-900">Students by Class</h3>
            <span className="text-xs font-bold text-zinc-400">{classes.length} classes total</span>
          </div>
          {loading ? (
            <div className="text-center text-zinc-300 text-sm py-8">Loading...</div>
          ) : classData.length === 0 ? (
            <div className="text-center text-zinc-300 text-sm py-8">No data available.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {classData.slice(0, 8).map(([name, count], i) => {
                const pct = Math.round((count / maxClassCount) * 100);
                const colors = ['bg-[#3b3dbf]', 'bg-teal-500', 'bg-orange-400', 'bg-pink-500', 'bg-violet-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-400'];
                return (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-28 shrink-0 text-xs font-bold text-zinc-600 truncate" title={name}>{name}</div>
                    <div className="flex-1 h-5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${colors[i % colors.length]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-8 text-xs font-bold text-zinc-500 text-right shrink-0">{count}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gender & Enrollment split */}
        <div className="flex flex-col gap-5">
          {/* Gender Split */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex-1">
            <h3 className="font-bold text-base text-zinc-900 mb-4">Gender Distribution</h3>
            {loading ? (
              <div className="text-center text-zinc-300 text-sm">Loading...</div>
            ) : (
              <>
                <div className="flex gap-0.5 h-8 rounded-xl overflow-hidden mb-4">
                  <div className="bg-[#3b3dbf] flex items-center justify-center text-white text-xs font-bold transition-all duration-700" style={{ width: `${malePercent}%` }}>
                    {malePercent > 15 ? `${malePercent}%` : ''}
                  </div>
                  <div className="bg-pink-400 flex items-center justify-center text-white text-xs font-bold transition-all duration-700" style={{ width: `${femalePercent}%` }}>
                    {femalePercent > 15 ? `${femalePercent}%` : ''}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3b3dbf]" />
                    <span className="text-xs font-semibold text-zinc-500">Male</span>
                    <span className="text-xs font-bold text-zinc-800">{male}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-400" />
                    <span className="text-xs font-semibold text-zinc-500">Female</span>
                    <span className="text-xs font-bold text-zinc-800">{female}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Enrollment Status */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex-1">
            <h3 className="font-bold text-base text-zinc-900 mb-4">Enrollment Status</h3>
            {loading ? (
              <div className="text-center text-zinc-300 text-sm">Loading...</div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-zinc-500">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: total > 0 ? `${(active / total) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-xs font-bold text-zinc-700 w-6 text-right">{active}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs font-semibold text-zinc-500">Inactive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: total > 0 ? `${(inactive / total) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-xs font-bold text-zinc-700 w-6 text-right">{inactive}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fee Collection Summary */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-base text-zinc-900">Fee Collection Summary</h3>
          <span className="text-xs font-bold text-zinc-400">
            {collectionRate}% collection rate
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Collected', value: Number(fees.collected || 0), color: 'bg-emerald-500', textColor: 'text-emerald-600', count: fees.paid_count || 0 },
            { label: 'Pending', value: Number(fees.pending || 0), color: 'bg-indigo-400', textColor: 'text-[#3b3dbf]', count: fees.pending_count || 0 },
            { label: 'Overdue', value: Number(fees.overdue || 0), color: 'bg-red-400', textColor: 'text-red-500', count: fees.overdue_count || 0 },
          ].map((item) => {
            const pct = totalFees > 0 ? Math.round((item.value / totalFees) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-bold text-zinc-500">{item.label}</span>
                  <span className={`text-sm font-bold ${item.textColor}`}>{FMT(item.value)}</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                  <span>{pct}% of total</span>
                  <span>{item.count} invoice{item.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#3b3dbf] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full translate-x-10 -translate-y-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Award size={20} />
              <h3 className="font-bold text-base">School Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { label: 'Avg Students / Class', value: classes.length > 0 ? Math.round(total / classes.length) : 0 },
                { label: 'Total Classes', value: classes.length },
                { label: 'Active Students', value: active },
                { label: 'Inactive Students', value: inactive },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-indigo-200 font-semibold mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-[#3b3dbf]" />
            <h3 className="font-bold text-base text-zinc-900">Financial Health</h3>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Collection Rate', value: collectionRate, color: collectionRate >= 70 ? 'bg-emerald-500' : 'bg-orange-400' },
              { label: 'Paid Invoices', value: totalFees > 0 ? Math.round((Number(fees.paid_count || 0) / (Number(fees.paid_count || 0) + Number(fees.pending_count || 0) + Number(fees.overdue_count || 0))) * 100) : 0, color: 'bg-[#3b3dbf]' },
              { label: 'Overdue Risk', value: totalFees > 0 ? Math.round((Number(fees.overdue || 0) / totalFees) * 100) : 0, color: 'bg-red-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-500">{item.label}</span>
                  <span className="text-xs font-bold text-zinc-700">{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
