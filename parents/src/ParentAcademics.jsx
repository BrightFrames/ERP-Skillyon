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

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-3">Academics</h1>
      {loading ? (
        <div className="text-sm text-zinc-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-zinc-600 mb-4">Exam-wise marks and subject analysis</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-500 text-left border-b">
                <tr>
                  <th className="pb-2">Exam</th>
                  <th className="pb-2">Subject</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Max Score</th>
                  <th className="pb-2">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {marks.length === 0 ? (
                  <tr><td colSpan="5" className="py-4 text-center text-zinc-500">No records found.</td></tr>
                ) : marks.map(m => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{m.exam_name}</td>
                    <td className="py-3">{m.subject}</td>
                    <td className="py-3">{m.score}</td>
                    <td className="py-3 text-zinc-500">{m.max_score}</td>
                    <td className="py-3 font-semibold">{Math.round((m.score/m.max_score)*100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
