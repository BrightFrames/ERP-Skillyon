import React, { useEffect, useState } from 'react';
import { Clock, Calendar, FileText, CreditCard, Bus, MessageCircle, ChevronRight, ArrowUpRight } from 'lucide-react';

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
          } else if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
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
          setFeeDue(totalDue ? `₹${totalDue.toFixed(0)}` : '₹0');
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedChild]);

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? (() => { try { return JSON.parse(userStr) } catch { return {} } })() : {};
  const parentName = user.name || user.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{greetingTime()}, {parentName}</h2>
        <p className="text-sm text-gray-400 mt-0.5">Here's your child's overview</p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Attendance</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock size={14} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${attendancePct !== null ? (attendancePct >= 75 ? 'text-teal-600' : 'text-amber-600') : 'text-gray-300'}`}>
            {attendancePct !== null ? `${attendancePct}%` : '—'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Exams</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <Calendar size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{upcomingExams.length}</div>
          <span className="text-[11px] text-gray-400">upcoming</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Homework</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
              <FileText size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{homeworkPending}</div>
          <span className="text-[11px] text-rose-500 font-medium">pending</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Fee Due</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center">
              <CreditCard size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{feeDue || '—'}</div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left — wider */}
        <div className="lg:col-span-3 space-y-4">

          {/* Latest Marks */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Latest Marks</h3>
              <span className="text-[11px] text-gray-400 font-medium">Current Term</span>
            </div>
            <div className="space-y-3">
              {latestMarks.map(m => (
                <div key={m.subject} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-16 shrink-0">{m.subject}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${m.marks >= 85 ? 'bg-teal-500' : m.marks >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`}
                      style={{ width: `${m.marks}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{m.marks}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notices */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Notices</h3>
              <button className="text-xs text-teal-600 font-medium hover:text-teal-700 flex items-center gap-0.5">
                View all <ChevronRight size={12} />
              </button>
            </div>
            {recentNotices.length === 0 ? (
              <p className="text-sm text-gray-400">No notices</p>
            ) : (
              <div className="space-y-2">
                {recentNotices.map(n => (
                  <div key={n.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors -mx-1">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-teal-400 shrink-0"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{n.title}</div>
                        <div className="text-xs text-gray-400">{n.date}</div>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-gray-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — narrower */}
        <div className="lg:col-span-2 space-y-4">

          {/* Upcoming Exams */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Exams</h3>
            <div className="space-y-2.5">
              {upcomingExams.map(exam => (
                <div key={exam.id} className="flex items-center gap-3 p-2.5 bg-orange-50/60 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-white text-orange-500 flex items-center justify-center border border-orange-100">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{exam.title}</div>
                    <div className="text-xs text-gray-400">{exam.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick info */}
          <div className="bg-teal-600 rounded-xl p-5 text-white">
            <h3 className="text-sm font-semibold mb-4 text-teal-50">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Bus size={16} className="text-teal-200 shrink-0" />
                <div>
                  <div className="text-xs text-teal-200">Bus Status</div>
                  <div className="text-sm font-medium">On route • ETA 12 min</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle size={16} className="text-teal-200 shrink-0" />
                <div>
                  <div className="text-xs text-teal-200">Teacher Remarks</div>
                  <div className="text-sm font-medium">Excellent participation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
