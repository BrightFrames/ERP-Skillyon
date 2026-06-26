import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ParentAttendance({ childId }){
  const [today, setToday] = useState(null);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
        const tRes = await fetch(`/api/parent/${childId}/attendance/today`, { headers: { ...authHeader }, credentials: 'include' });
        const tJson = await tRes.json();
        setToday(tJson.data);

        const mRes = await fetch(`/api/parent/${childId}/attendance`, { headers: { ...authHeader }, credentials: 'include' });
        const mJson = await mRes.json();
        setRecords(mJson.data || []);
        setSummary(mJson.summary || null);
      } catch (err) {
        console.error('Failed to load attendance', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [childId]);

  const statusColor = (s) => {
    if (s === 'PRESENT') return 'text-teal-600 bg-teal-50';
    if (s === 'ABSENT') return 'text-rose-600 bg-rose-50';
    return 'text-amber-600 bg-amber-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Attendance</h2>
        <p className="text-sm text-gray-400 mt-0.5">Daily attendance records</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-20 rounded-xl"></div>
          <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-xl"></div>)}</div>
          <div className="skeleton h-48 rounded-xl"></div>
        </div>
      ) : (
        <>
          {/* Today banner */}
          <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${today?.status === 'PRESENT' ? 'bg-teal-50 border border-teal-100' : today?.status === 'ABSENT' ? 'bg-rose-50 border border-rose-100' : 'bg-gray-50 border border-gray-100'}`}>
            {today?.status === 'PRESENT' ? <CheckCircle2 size={18} className="text-teal-500" /> :
             today?.status === 'ABSENT' ? <XCircle size={18} className="text-rose-500" /> :
             <Clock size={18} className="text-gray-400" />}
            <div>
              <span className="text-sm font-medium text-gray-800">Today — </span>
              <span className="text-sm text-gray-500">{today ? today.status : 'No record'}</span>
            </div>
          </div>

          {/* Summary row */}
          {summary && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                <div className="text-xs text-gray-400 mt-1">Total Days</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-teal-600">{summary.present}</div>
                <div className="text-xs text-gray-400 mt-1">Present</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <div className={`text-2xl font-bold ${summary.percent >= 75 ? 'text-teal-600' : 'text-rose-600'}`}>{summary.percent}%</div>
                <div className="text-xs text-gray-400 mt-1">Rate</div>
              </div>
            </div>
          )}

          {/* Records */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Records</h3>
              <span className="text-xs text-gray-400">{records.length} entries</span>
            </div>

            {/* Desktop */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50">
                    <th className="text-left px-5 py-3 font-medium">Date</th>
                    <th className="text-left px-5 py-3 font-medium">Day</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan="3" className="px-5 py-8 text-center text-gray-400 text-sm">No records found</td></tr>
                  ) : records.map(r => (
                    <tr key={r.date} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{r.date}</td>
                      <td className="px-5 py-3 text-gray-500">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' })}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${statusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-gray-50">
              {records.map(r => (
                <div key={r.date} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{r.date}</div>
                    <div className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${statusColor(r.status)}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
