import {
  BookOpen, Users, GraduationCap, TrendingUp,
  Clock, ChevronRight, Send, CheckCircle2, Circle,
  Megaphone, AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './lib/api';

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [gradebooks, setGradebooks] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const name = user.name || 'Teacher';
  const subject = user.subject || 'Your Subject';

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [classRes, studentRes] = await Promise.all([
          api.get('/academic/teacher-classes'),
          api.get('/students?page=0&limit=200'),
        ]);

        const cls = classRes.data || [];
        const stu = studentRes.data.data || [];
        setClasses(cls);
        setStudents(stu);

        // Fetch gradebook for each class
        const books: Record<number, any> = {};
        await Promise.all(cls.map(async (c: any) => {
          try {
            const r = await api.get(`/academic/classes/${c.id}/gradebook`);
            books[c.id] = r.data;
          } catch { books[c.id] = { students: [], assessments: [], grades: [] }; }
        }));
        setGradebooks(books);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  // Aggregate stats
  const totalStudents = students.length;
  const totalAssessments = Object.values(gradebooks).reduce((sum, gb) => sum + (gb.assessments?.length || 0), 0);
  const totalGrades = Object.values(gradebooks).reduce((sum, gb) => sum + (gb.grades?.length || 0), 0);
  const ungradedSlots = Object.values(gradebooks).reduce((sum, gb) => {
    return sum + (gb.students?.length || 0) * (gb.assessments?.length || 0) - (gb.grades?.length || 0);
  }, 0);

  const bgColors = [
    'bg-[#3b3dbf]/10 text-[#3b3dbf]',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-orange-100 text-orange-600',
    'bg-rose-100 text-rose-700',
  ];

  // Students at risk across all classes
  const atRiskStudents: any[] = [];
  Object.entries(gradebooks).forEach(([classId, gb]) => {
    const cls = classes.find(c => c.id.toString() === classId);
    gb.students?.forEach((s: any) => {
      const graded = gb.grades?.filter((g: any) => g.student_id === s.id) || [];
      if (graded.length === 0) return;
      const avgScore = graded.reduce((a: number, g: any) => a + g.score, 0) / graded.length;
      const maxScore = gb.assessments?.reduce((a: number, a2: any) => a + (a2.max_score || 100), 0) / (gb.assessments?.length || 1) || 100;
      if ((avgScore / maxScore) * 100 < 60) {
        atRiskStudents.push({ ...s, className: cls?.name, avgScore: Math.round((avgScore / maxScore) * 100) });
      }
    });
  });

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-400 mb-1">{greetingTime()}, {name} 👋</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Subject: <span className="text-[#3b3dbf] font-bold">{subject}</span></p>
        </div>
        <Link
          to="/classes"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm shrink-0"
        >
          <GraduationCap size={16} />
          Open Gradebook
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Classes', value: classes.length, icon: BookOpen, color: 'bg-indigo-50 text-[#3b3dbf]', sub: 'assigned to you' },
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'bg-teal-50 text-teal-600', sub: 'across all classes' },
          { label: 'Assessments', value: totalAssessments, icon: GraduationCap, color: 'bg-violet-50 text-violet-600', sub: 'created by you' },
          { label: 'Ungraded Slots', value: ungradedSlots, icon: AlertTriangle, color: ungradedSlots > 0 ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500', sub: ungradedSlots > 0 ? 'need grading' : 'all caught up!' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-zinc-400 mb-1">{item.label}</p>
                <p className="text-3xl font-bold text-zinc-900">{loading ? '...' : item.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon size={20} />
              </div>
            </div>
            <p className="text-xs font-semibold text-zinc-400">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* My Classes Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base text-zinc-900">My Classes</h3>
            <Link to="/classes" className="text-xs font-bold text-[#3b3dbf] hover:underline flex items-center gap-1">
              View Gradebooks <ChevronRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-4 border-[#3b3dbf]/30 border-t-[#3b3dbf] rounded-full animate-spin" />
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center text-zinc-300 py-8 text-sm">No classes assigned to you yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classes.map((cls, i) => {
                const gb = gradebooks[cls.id] || {};
                const stuCount = gb.students?.length || 0;
                const assmCount = gb.assessments?.length || 0;
                const gradeCount = gb.grades?.length || 0;
                const ungraded = stuCount * assmCount - gradeCount;
                return (
                  <Link
                    key={cls.id}
                    to="/classes"
                    className="group flex items-start gap-3 p-4 rounded-xl border border-zinc-100 hover:border-[#3b3dbf]/40 hover:bg-indigo-50/30 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${bgColors[i % bgColors.length]}`}>
                      {getInitials(cls.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-zinc-800 text-sm truncate">{cls.name}</div>
                      <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">{stuCount} students · {assmCount} assessments</div>
                      {ungraded > 0 && (
                        <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full text-[10px] font-bold">
                          <AlertTriangle size={10} />
                          {ungraded} ungraded
                        </div>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-zinc-300 group-hover:text-[#3b3dbf] transition-colors shrink-0 mt-1" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* At Risk Students */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base text-zinc-900">At Risk Students</h3>
            <span className="text-xs font-bold text-red-400">{atRiskStudents.length} students</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-4 border-[#3b3dbf]/30 border-t-[#3b3dbf] rounded-full animate-spin" />
            </div>
          ) : atRiskStudents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
              <p className="text-xs font-bold text-zinc-400">All students are performing well!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
              {atRiskStudents.slice(0, 6).map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-red-50/50 border border-red-100">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-zinc-800 truncate">{s.name}</div>
                    <div className="text-[10px] text-zinc-400 font-semibold">{s.className}</div>
                  </div>
                  <span className="text-xs font-bold text-red-500 shrink-0">{s.avgScore}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Today's Plan (static but polished) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={18} className="text-[#3b3dbf]" />
            <h3 className="font-bold text-base text-zinc-900">Today's Teaching Plan</h3>
          </div>
          <div className="bg-indigo-50/60 border-l-4 border-[#3b3dbf] p-4 rounded-r-xl mb-4">
            <p className="text-xs font-bold text-[#3b3dbf] mb-0.5">{subject} — Today</p>
            <p className="font-bold text-zinc-800 text-sm">Review & Assessment Prep</p>
          </div>
          <div className="space-y-3">
            {['Review previous assessments with class', 'Cover any at-risk student topics', 'Distribute marks & feedback'].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                {i === 0 ? (
                  <CheckCircle2 size={16} className="text-[#3b3dbf] shrink-0 mt-0.5" />
                ) : (
                  <Circle size={16} className="text-zinc-300 shrink-0 mt-0.5" />
                )}
                <span className="text-sm font-semibold text-zinc-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#3b3dbf] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-bl-full translate-x-8 -translate-y-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone size={18} />
              <h3 className="font-bold text-base">Quick Announcement</h3>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl p-3 mb-4">
              <textarea
                placeholder="Write a message to your classes..."
                className="w-full bg-transparent text-sm font-medium placeholder:text-indigo-200 focus:outline-none resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              {classes.slice(0, 3).map(cls => (
                <span key={cls.id} className="px-2.5 py-1 bg-white/20 text-white text-[10px] font-bold rounded-full">{cls.name}</span>
              ))}
            </div>
            <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-white text-[#3b3dbf] rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors">
              <Send size={14} /> Send to All My Classes
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
