import React, { useEffect, useState } from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';

export default function ParentDashboard({ selectedChild, onChildChange }) {
  const [children, setChildren] = useState([]);
  const [attendancePct, setAttendancePct] = useState(null);
  const [feeDue, setFeeDue] = useState(null);
  const upcomingExams = [
    { id: 1, title: 'Term 2 - Math', date: '2026-05-20' },
    { id: 2, title: 'Term 2 - Science', date: '2026-05-22' },
  ];
  const homeworkPending = 3;
  const recentNotices = [{ id: 1, title: 'PTM', date: '2026-05-15' }];
  const [latestMarks, setLatestMarks] = useState([{ subject: 'Math', marks: 86 }, { subject: 'Science', marks: 81 }]);

  useEffect(() => {
    const init = async () => {
      const userStr = localStorage.getItem('user');
      let userObj = userStr ? JSON.parse(userStr) : null;
      if (!userObj || !userObj.children) {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            userObj = await res.json();
            localStorage.setItem('user', JSON.stringify(userObj));
          }
        }
      }

      setChildren(userObj?.children || []);
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
        const mRes = await fetch(`/api/parent/${selectedChild}/attendance`, { headers: { ...authHeader }, credentials: 'include' });
        if (mRes.ok) {
          const mJson = await mRes.json();
          setAttendancePct(mJson.summary?.percent ?? null);
        }
        const fRes = await fetch(`/api/parent/${selectedChild}/fees`, { headers: { ...authHeader }, credentials: 'include' });
        if (fRes.ok) {
          const fJson = await fRes.json();
          const unpaid = (fJson.data || []).filter(f => f.status !== 'PAID');
          const totalDue = unpaid.reduce((s, f) => s + Number(f.amount || 0), 0);
          setFeeDue(totalDue ? `₹${totalDue.toFixed(2)}` : '₹0.00');
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedChild]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-sm text-zinc-500">Quick summary</p>
        </div>
        <div className="flex items-center gap-3">
          {children.length > 1 && (
            <select value={selectedChild || ''} onChange={(e) => onChildChange(e.target.value)} className="px-3 py-1 border rounded-md text-sm mr-2">
              {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <button className="px-3 py-1 bg-white border rounded-md">Last 30 days</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-3 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500">Attendance</div>
              <div className="text-xl font-bold">{attendancePct ?? '--'}%</div>
            </div>
            <Clock size={32} className="text-zinc-400" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500">Upcoming Exams</div>
              <div className="text-sm font-medium">{upcomingExams.length} scheduled</div>
            </div>
            <Calendar size={32} className="text-zinc-400" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500">Homework Pending</div>
              <div className="text-xl font-bold">{homeworkPending}</div>
            </div>
            <FileText size={32} className="text-zinc-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-3 rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Recent Notices</h3>
          <ul className="text-sm text-zinc-600 space-y-2">
            {recentNotices.map(n => (
              <li key={n.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-zinc-400">{n.date}</div>
                </div>
                <button className="text-sm text-zinc-500">View</button>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Latest Marks</h4>
            <div className="grid grid-cols-2 gap-2">
              {latestMarks.map(m => (
                <div key={m.subject} className="p-3 bg-zinc-50 rounded-md">
                  <div className="text-sm text-zinc-500">{m.subject}</div>
                  <div className="font-bold text-lg">{m.marks}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Fees & Transport</h3>
          <div className="text-sm text-zinc-500">Due: <span className="font-bold text-zinc-900">{feeDue || '—'}</span></div>
          <div className="mt-4">
            <div className="text-sm text-zinc-500">Bus Status</div>
            <div className="mt-2 font-medium">On route • ETA 12 mins</div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm text-zinc-500">Teacher Remarks</h4>
            <div className="mt-2 text-sm text-zinc-700">Excellent participation in class discussions.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
