import { useParams, Link } from 'react-router-dom';
import {
  Mail, TrendingUp, Award, BookText, Plus, ChevronLeft,
  User, Phone, MapPin, Calendar, GraduationCap, Edit2, X, AlertTriangle
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from './lib/api';

export default function StudentProfilePage() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<any[]>([
    { id: 1, category: 'Academic Progress', text: 'Shows strong analytical skills and helps peers during group work.', author: 'Dr. Sarah Wilson', date: 'Feb 14, 2024', color: 'border-indigo-100 bg-indigo-50/50 text-[#3b3dbf]' },
  ]);
  const [showNoteForm, setShowNoteForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchStudent = async () => {
      setLoading(true);
      try {
        // Fetch student details
        const res = await api.get(`/students?page=0&limit=200`);
        const found = (res.data.data || []).find((s: any) => s.id.toString() === id);
        setStudent(found || null);

        if (found?.class_id) {
          const gbRes = await api.get(`/academic/classes/${found.class_id}/gradebook`);
          setAssessments(gbRes.data.assessments || []);
          setGrades((gbRes.data.grades || []).filter((g: any) => g.student_id === found.id));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStudent();
  }, [id]);

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  const calculateAvg = () => {
    if (grades.length === 0 || assessments.length === 0) return null;
    let total = 0, max = 0;
    assessments.forEach(a => {
      const g = grades.find(g => g.assessment_id === a.id);
      if (g) total += g.score;
      max += a.max_score || 100;
    });
    return max > 0 ? Math.round((total / max) * 1000) / 10 : null;
  };

  const getGrade = (pct: number) => {
    if (pct >= 90) return { letter: 'A', color: 'text-emerald-500' };
    if (pct >= 80) return { letter: 'B', color: 'text-[#3b3dbf]' };
    if (pct >= 70) return { letter: 'C', color: 'text-amber-500' };
    if (pct >= 60) return { letter: 'D', color: 'text-orange-500' };
    return { letter: 'F', color: 'text-red-500' };
  };

  const avg = calculateAvg();
  const gradeInfo = avg !== null ? getGrade(avg) : null;

  const addNote = () => {
    if (!noteText.trim()) return;
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    setNotes(prev => [{
      id: Date.now(), category: 'Observation', text: noteText,
      author: user.name || 'Teacher', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      color: 'border-teal-100 bg-teal-50/50 text-teal-700'
    }, ...prev]);
    setNoteText('');
    setShowNoteForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="w-8 h-8 border-4 border-[#3b3dbf]/30 border-t-[#3b3dbf] rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-zinc-400">
        <AlertTriangle size={40} strokeWidth={1.5} />
        <p className="font-semibold">Student not found.</p>
        <Link to="/students" className="text-sm font-bold text-[#3b3dbf] hover:underline">← Back to Students</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10 min-h-full">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
        <Link to="/students" className="flex items-center gap-1 hover:text-[#3b3dbf] transition-colors">
          <ChevronLeft size={14} /> Students
        </Link>
        <span>/</span>
        <span className="text-[#3b3dbf]">{student.name}</span>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
          <div className="relative shrink-0">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-indigo-100 text-[#3b3dbf] flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
                {getInitials(student.name)}
              </div>
            )}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#3b3dbf] text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap border-2 border-white">
              {student.class_name || 'Unassigned'}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left mt-3 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#3b3dbf] leading-tight">{student.name}</h1>
                <p className="text-xs font-bold text-zinc-400 mt-1">ID: #{String(student.id).padStart(4, '0')}</p>
              </div>
              <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#2c2eb5] transition-colors shrink-0">
                <Mail size={16} />
                Message Parent
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              {[
                { icon: Mail, label: student.email || '—' },
                { icon: GraduationCap, label: student.class_name || 'Unassigned' },
                { icon: User, label: student.gender || '—' },
                { icon: Calendar, label: `Joined ${student.join_date ? new Date(student.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                  <item.icon size={13} className="text-zinc-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${student.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {student.status || 'Active'}
              </span>
              {student.class_name && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-[#3b3dbf]">
                  <Award size={10} className="inline mr-1" />Enrolled
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Academic Standing */}
        <div className="bg-[#3b3dbf] rounded-2xl shadow-lg p-6 relative overflow-hidden flex flex-col justify-between text-white">
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <Award size={160} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-indigo-200 mb-1">Academic Standing</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold">{avg !== null ? `${avg}%` : '—'}</span>
            </div>
            {gradeInfo && (
              <span className={`inline-flex px-3 py-1 bg-white/20 rounded-full text-sm font-bold`}>
                Grade: {gradeInfo.letter}
              </span>
            )}
            {avg === null && (
              <p className="text-xs text-indigo-200 font-medium mt-1">No grades recorded yet</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <p className="text-xs font-semibold text-indigo-200 mb-1">Assessments</p>
              <p className="text-xl font-bold">{grades.length}/{assessments.length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <p className="text-xs font-semibold text-indigo-200 mb-1">Status</p>
              <p className="text-xl font-bold">{student.status || 'Active'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      {assessments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-zinc-900">Assessment Scores</h3>
            <span className="text-xs font-bold text-zinc-400">{grades.length} graded</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-400 text-left">Assessment</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-400 text-center">Type</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-400 text-center">Score</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-400 text-center">Max</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-400 text-center">%</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-400 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {assessments.map(a => {
                  const g = grades.find(g => g.assessment_id === a.id);
                  const pct = g ? Math.round((g.score / (a.max_score || 100)) * 100) : null;
                  const gi = pct !== null ? getGrade(pct) : null;
                  return (
                    <tr key={a.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-zinc-800">{a.name}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="px-2 py-1 bg-indigo-50 text-[#3b3dbf] text-[10px] font-bold rounded-full">{a.type}</span>
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-zinc-700">{g ? g.score : '—'}</td>
                      <td className="px-6 py-3.5 text-center text-zinc-400 font-semibold text-xs">{a.max_score || 100}</td>
                      <td className="px-6 py-3.5 text-center">
                        {pct !== null ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pct >= 70 ? 'bg-[#3b3dbf]' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-bold text-zinc-600">{pct}%</span>
                          </div>
                        ) : <span className="text-zinc-300 text-xs">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {gi ? <span className={`font-bold ${gi.color}`}>{gi.letter}</span> : <span className="text-zinc-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teacher Notes */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BookText size={18} className="text-[#3b3dbf]" />
            <h3 className="font-bold text-base text-zinc-900">Teacher Observations & Notes</h3>
          </div>
          <button
            onClick={() => setShowNoteForm(v => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3b3dbf] text-white rounded-xl text-xs font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm"
          >
            {showNoteForm ? <X size={14} /> : <Plus size={14} />}
            {showNoteForm ? 'Cancel' : 'Add Note'}
          </button>
        </div>

        {showNoteForm && (
          <div className="mb-4 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
            <textarea
              autoFocus
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Write an observation or note about this student..."
              className="w-full bg-transparent text-sm font-medium text-zinc-700 placeholder:text-zinc-400 focus:outline-none resize-none mb-3"
              rows={3}
            />
            <button onClick={addNote} className="px-4 py-2 bg-[#3b3dbf] text-white rounded-lg text-xs font-bold hover:bg-[#2c2eb5] transition-colors">
              Save Note
            </button>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center text-zinc-300 py-8 text-sm">No notes yet. Add the first observation.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map(note => (
              <div key={note.id} className={`rounded-xl p-5 border flex flex-col justify-between gap-3 ${note.color}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{note.category}</span>
                    <span className="text-[10px] font-medium text-zinc-400">{note.date}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-700 italic leading-relaxed">"{note.text}"</p>
                </div>
                <p className="text-[10px] font-semibold text-zinc-400">Added by {note.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
