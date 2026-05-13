import React, { useEffect, useState } from 'react';

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

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-3">Attendance</h1>
      {loading ? (
        <div className="text-sm text-zinc-500">Loading...</div>
      ) : (
        <>
          <div className="mb-3 text-xs sm:text-sm text-zinc-500">Today: {today ? `${today.date} — ${today.status}` : 'No record'}</div>

          {summary && (
            <div className="mb-4 bg-white p-3 sm:p-4 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <div className="text-xs text-zinc-500">Days this month</div>
                  <div className="text-lg sm:text-xl font-bold">{summary.total}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Present</div>
                  <div className="text-lg sm:text-xl font-bold">{summary.present}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Attendance %</div>
                  <div className="text-lg sm:text-xl font-bold">{summary.percent}%</div>
                </div>
              </div>
            </div>
          )}

          <div className="hidden sm:block bg-white rounded-xl shadow-sm p-4">
            <table className="w-full text-sm">
              <thead className="text-zinc-500 text-left">
                <tr><th className="pb-2">Date</th><th className="pb-2">Status</th></tr>
              </thead>
              <tbody>
                {records.map(r=> (
                  <tr key={r.date} className="border-t"><td className="py-2">{r.date}</td><td className="py-2">{r.status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-2">
            {records.map(r => (
              <div key={r.date} className="bg-white p-3 rounded-md shadow-sm flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{r.date}</div>
                  <div className="text-xs text-zinc-500">{r.status}</div>
                </div>
                <div className={`text-sm font-semibold ${r.status === 'PRESENT' ? 'text-green-600' : r.status === 'ABSENT' ? 'text-red-500' : 'text-zinc-700'}`}>{r.status}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
