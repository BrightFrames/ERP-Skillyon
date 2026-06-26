import React, { useEffect, useState } from 'react';

export default function ParentAcademics({ childId }){
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) return;
    const fetchAcademics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/parent/${childId}/academics`, { headers: { ...authHeader }, credentials: 'include' });
        const json = await res.json();
        setMarks(json.data || []);
      } catch (err) {
        console.error('Failed to load academics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademics();
  }, [childId]);

  const avgPct = marks.length > 0
    ? Math.round(marks.reduce((sum, m) => sum + (m.score / m.max_score) * 100, 0) / marks.length)
    : null;

  const getGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    return 'D';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Academics</h2>
        <p className="text-sm text-gray-400 mt-0.5">Exam scores and subject analysis</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">{[1,2].map(i => <div key={i} className="skeleton h-24 rounded-xl"></div>)}</div>
          <div className="skeleton h-48 rounded-xl"></div>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          {marks.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-gray-900">{marks.length}</div>
                <div className="text-xs text-gray-400 mt-1">Exams Taken</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <div className={`text-2xl font-bold ${avgPct >= 75 ? 'text-teal-600' : avgPct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{avgPct}%</div>
                <div className="text-xs text-gray-400 mt-1">Average</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center hidden sm:block">
                <div className="text-2xl font-bold text-gray-900">{getGrade(avgPct)}</div>
                <div className="text-xs text-gray-400 mt-1">Overall Grade</div>
              </div>
            </div>
          )}

          {/* Results table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Exam Results</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50">
                    <th className="text-left px-5 py-3 font-medium">Exam</th>
                    <th className="text-left px-5 py-3 font-medium">Subject</th>
                    <th className="text-left px-5 py-3 font-medium">Score</th>
                    <th className="text-left px-5 py-3 font-medium">Percentage</th>
                    <th className="text-left px-5 py-3 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.length === 0 ? (
                    <tr><td colSpan="5" className="px-5 py-8 text-center text-gray-400">No records found</td></tr>
                  ) : marks.map(m => {
                    const pct = Math.round((m.score / m.max_score) * 100);
                    return (
                      <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-800">{m.exam_name}</td>
                        <td className="px-5 py-3 text-gray-500">{m.subject}</td>
                        <td className="px-5 py-3">
                          <span className="font-semibold text-gray-900">{m.score}</span>
                          <span className="text-gray-400">/{m.max_score}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${pct >= 75 ? 'bg-teal-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${pct}%` }}></div>
                            </div>
                            <span className={`text-sm font-semibold ${pct >= 75 ? 'text-teal-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{pct}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                            pct >= 75 ? 'text-teal-600 bg-teal-50' :
                            pct >= 50 ? 'text-amber-600 bg-amber-50' :
                            'text-rose-600 bg-rose-50'
                          }`}>{getGrade(pct)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
