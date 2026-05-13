import { Plus, Edit2, TrendingUp, Users, BookOpen, AlertTriangle, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from './lib/api';

export default function ClassesPage() {
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeBookLoading, setGradebookLoading] = useState(false);
  const [editingGrade, setEditingGrade] = useState<{ studentId: number; assessmentId: number } | null>(null);
  const [tempScore, setTempScore] = useState<string>('');
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [newAssessment, setNewAssessment] = useState({ name: '', type: 'Quiz', max_score: '100' });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic/teacher-classes');
      setAllClasses(res.data);
      if (res.data.length > 0) {
        setSelectedClass(res.data[0]);
        fetchGradebook(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGradebook = async (classId: number) => {
    setGradebookLoading(true);
    setStudents([]);
    setAssessments([]);
    setGrades([]);
    try {
      const res = await api.get(`/academic/classes/${classId}/gradebook`);
      setStudents(res.data.students || []);
      setAssessments(res.data.assessments || []);
      setGrades(res.data.grades || []);
    } catch (err) {
      console.error(err);
    } finally {
      setGradebookLoading(false);
    }
  };

  const selectClass = (cls: any) => {
    setSelectedClass(cls);
    setEditingGrade(null);
    fetchGradebook(cls.id);
  };

  const getStudentGrade = (studentId: number, assessmentId: number) => {
    const grade = grades.find(g => g.student_id === studentId && g.assessment_id === assessmentId);
    return grade ? grade.score : null;
  };

  const saveGrade = async (studentId: number, assessmentId: number) => {
    const score = tempScore.trim();
    if (score === '') {
      setEditingGrade(null);
      return;
    }
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 999) {
      alert('Please enter a valid score.');
      return;
    }
    try {
      await api.put('/academic/grades', { assessment_id: assessmentId, student_id: studentId, score: numScore });
      setGrades(prev => {
        const existing = prev.find(g => g.student_id === studentId && g.assessment_id === assessmentId);
        if (existing) return prev.map(g => g === existing ? { ...g, score: numScore } : g);
        return [...prev, { student_id: studentId, assessment_id: assessmentId, score: numScore }];
      });
      setEditingGrade(null);
    } catch (err) {
      alert('Failed to save score');
    }
  };

  const handleAddAssessment = async () => {
    if (!newAssessment.name.trim() || !selectedClass) return;
    try {
      await api.post(`/academic/classes/${selectedClass.id}/assessments`, {
        name: newAssessment.name,
        type: newAssessment.type,
        max_score: parseInt(newAssessment.max_score) || 100,
      });
      setShowAssessmentModal(false);
      setNewAssessment({ name: '', type: 'Quiz', max_score: '100' });
      fetchGradebook(selectedClass.id);
    } catch {
      alert('Failed to add assessment');
    }
  };

  const calculateOverall = (studentId: number) => {
    if (assessments.length === 0) return { percent: '-', grade: '-' };
    let totalScore = 0, totalMax = 0;
    assessments.forEach(a => {
      const g = grades.find(g => g.student_id === studentId && g.assessment_id === a.id);
      if (g) totalScore += g.score;
      totalMax += a.max_score || 100;
    });
    if (totalMax === 0) return { percent: '-', grade: '-' };
    const percent = Math.round((totalScore / totalMax) * 1000) / 10;
    let letter = 'F';
    if (percent >= 90) letter = 'A';
    else if (percent >= 80) letter = 'B';
    else if (percent >= 70) letter = 'C';
    else if (percent >= 60) letter = 'D';
    return { percent, grade: letter };
  };

  const getGradeColor = (score: number | null, max: number = 100) => {
    if (score === null) return 'text-zinc-300';
    const pct = (score / max) * 100;
    if (pct < 60) return 'text-red-500 font-bold';
    if (pct < 75) return 'text-orange-500 font-semibold';
    return 'text-zinc-800 font-semibold';
  };

  const getOverallBadge = (percent: number | string) => {
    if (percent === '-') return 'bg-zinc-100 text-zinc-400 border-zinc-200';
    if (Number(percent) >= 80) return 'bg-indigo-50 text-[#3b3dbf] border-indigo-200';
    if (Number(percent) >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-600 border-red-200';
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // KPI calculations
  const gradedCount = grades.length;
  const totalPossible = students.length * assessments.length;
  const atRisk = students.filter(s => {
    const overall = calculateOverall(s.id);
    return overall.percent !== '-' && Number(overall.percent) < 60;
  }).length;
  const classAvg = (() => {
    if (students.length === 0 || assessments.length === 0) return '-';
    const totals = students.map(s => calculateOverall(s.id).percent).filter(p => p !== '-');
    if (totals.length === 0) return '-';
    return (totals.reduce((a, b) => Number(a) + Number(b), 0) / totals.length).toFixed(1);
  })();

  const bgColors = [
    'bg-[#3b3dbf]/10 text-[#3b3dbf]',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-orange-100 text-orange-700',
    'bg-rose-100 text-rose-700',
  ];

  return (
    <div className="flex h-full gap-6 text-zinc-900 pb-6">

      {/* LEFT: Class List Panel */}
      <div className="w-60 shrink-0 flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">My Classes</h2>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">Select a class to grade</p>
        </div>

        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="text-xs text-zinc-400 py-4 text-center">Loading...</div>
          ) : allClasses.length === 0 ? (
            <div className="text-xs text-zinc-400 py-4 text-center">No classes assigned.</div>
          ) : allClasses.map((cls, i) => {
            const isSelected = selectedClass?.id === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => selectClass(cls)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border ${
                  isSelected
                    ? 'bg-[#3b3dbf] text-white border-[#3b3dbf] shadow-md shadow-[#3b3dbf]/20'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:border-[#3b3dbf]/40 hover:bg-indigo-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-white/20 text-white' : bgColors[i % bgColors.length]}`}>
                    {getInitials(cls.name)}
                  </div>
                  <span className="text-left leading-tight">{cls.name}</span>
                </div>
                {isSelected && <ChevronRight size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Gradebook Panel */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#3b3dbf]">
              {selectedClass ? `${selectedClass.name} — Gradebook` : 'Student Gradebook'}
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Only <strong>your subject's</strong> assessments are shown. Other teachers grade their own columns.
            </p>
          </div>
          <button
            onClick={() => setShowAssessmentModal(true)}
            disabled={!selectedClass}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#2c2eb5] transition-colors disabled:opacity-50 shrink-0"
          >
            <Plus size={16} />
            New Assessment
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 border-b-4 border-b-[#3b3dbf]">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Class Average</p>
            <p className="text-2xl font-bold text-[#3b3dbf]">{classAvg === '-' ? '—' : `${classAvg}%`}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 border-b-4 border-b-teal-500">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Students</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-teal-600">{students.length}</span>
              <span className="text-xs font-bold text-zinc-400">enrolled</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 border-b-4 border-b-indigo-400">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Graded</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-indigo-600">{gradedCount}</span>
              <span className="text-xs font-bold text-zinc-400">/ {totalPossible}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 border-b-4 border-b-red-400">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">At Risk</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-red-500">{atRisk}</span>
              <span className="text-xs font-bold text-zinc-400">students</span>
            </div>
          </div>
        </div>

        {/* Gradebook Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex-1 flex flex-col overflow-hidden">
          {!selectedClass ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-400 p-12">
              <BookOpen size={40} strokeWidth={1.5} />
              <p className="font-semibold">Select a class from the left to view the gradebook</p>
            </div>
          ) : gradeBookLoading ? (
            <div className="flex-1 flex items-center justify-center p-12 text-zinc-400">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-[#3b3dbf]/30 border-t-[#3b3dbf] rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Loading gradebook...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              {assessments.length === 0 && (
                <div className="p-6 text-center">
                  <div className="inline-flex flex-col items-center gap-3 text-zinc-400">
                    <Plus size={32} strokeWidth={1.5} />
                    <p className="text-sm font-semibold">No assessments yet for this class.</p>
                    <button onClick={() => setShowAssessmentModal(true)} className="text-xs font-bold text-[#3b3dbf] hover:underline">
                      + Add your first assessment
                    </button>
                  </div>
                </div>
              )}
              {students.length === 0 && assessments.length > 0 && (
                <div className="p-6 text-center text-sm text-zinc-400 font-medium">No students enrolled in this class yet.</div>
              )}
              {students.length > 0 && assessments.length > 0 && (
                <table className="w-full text-left text-sm min-w-max">
                  <thead className="bg-zinc-50 border-b border-zinc-100 sticky top-0">
                    <tr>
                      <th className="px-5 py-3.5 font-bold text-xs text-zinc-500 sticky left-0 bg-zinc-50 z-10 min-w-[200px]">Student</th>
                      {assessments.map(a => (
                        <th key={a.id} className="px-4 py-3.5 text-center min-w-[110px]">
                          <div className="font-bold text-xs text-zinc-700">{a.name}</div>
                          <div className="text-[10px] font-semibold text-zinc-400 mt-0.5">{a.type} · /{a.max_score}</div>
                        </th>
                      ))}
                      <th className="px-5 py-3.5 font-bold text-xs text-zinc-500 text-center min-w-[110px]">My Subject Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {students.map((student) => {
                      const overall = calculateOverall(student.id);
                      return (
                        <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                          <td className="px-5 py-3.5 sticky left-0 bg-white group-hover:bg-indigo-50/30 transition-colors z-10">
                            <div className="flex items-center gap-3">
                              {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover border border-zinc-100" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#3b3dbf] flex items-center justify-center text-xs font-bold shrink-0">
                                  {getInitials(student.name)}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-zinc-800 text-sm">{student.name}</div>
                                <div className="text-[10px] text-zinc-400">ID: #{student.id}</div>
                              </div>
                            </div>
                          </td>
                          {assessments.map(a => {
                            const score = getStudentGrade(student.id, a.id);
                            const isEditing = editingGrade?.studentId === student.id && editingGrade?.assessmentId === a.id;
                            return (
                              <td
                                key={a.id}
                                className="px-4 py-3.5 text-center cursor-pointer group/cell"
                                onClick={() => {
                                  if (!isEditing) {
                                    setEditingGrade({ studentId: student.id, assessmentId: a.id });
                                    setTempScore(score !== null ? score.toString() : '');
                                    setTimeout(() => inputRef.current?.focus(), 50);
                                  }
                                }}
                              >
                                {isEditing ? (
                                  <input
                                    ref={inputRef}
                                    type="number"
                                    min={0}
                                    max={a.max_score}
                                    autoFocus
                                    value={tempScore}
                                    onChange={e => setTempScore(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') saveGrade(student.id, a.id);
                                      if (e.key === 'Escape') setEditingGrade(null);
                                    }}
                                    onBlur={() => saveGrade(student.id, a.id)}
                                    className="w-16 px-2 py-1 text-center text-sm font-bold border-2 border-[#3b3dbf] rounded-lg outline-none shadow-sm"
                                  />
                                ) : (
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors ${getGradeColor(score, a.max_score)}`}>
                                    <span>{score !== null ? score : '—'}</span>
                                    <Edit2 size={10} className="opacity-0 group-hover/cell:opacity-50 transition-opacity" />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getOverallBadge(overall.percent)}`}>
                              {overall.percent === '-' ? '—' : `${overall.percent}%`}
                              {overall.grade !== '-' && <span className="ml-1 opacity-70">({overall.grade})</span>}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {students.length > 0 && (
            <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <p className="text-xs font-bold text-zinc-400">{students.length} students enrolled · {assessments.length} assessments</p>
              <p className="text-xs font-semibold text-zinc-400">Click any cell to edit · Enter to save · Esc to cancel</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAssessmentModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-zinc-900 mb-1">New Assessment</h3>
            <p className="text-xs text-zinc-400 font-medium mb-5">for {selectedClass?.name}</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Assessment Name *</label>
                <input
                  autoFocus
                  value={newAssessment.name}
                  onChange={e => setNewAssessment({ ...newAssessment, name: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleAddAssessment()}
                  placeholder="e.g. Midterm Exam, Lab 3..."
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Type</label>
                <select
                  value={newAssessment.type}
                  onChange={e => setNewAssessment({ ...newAssessment, type: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                >
                  <option>Quiz</option>
                  <option>Exam</option>
                  <option>Assignment</option>
                  <option>Lab</option>
                  <option>Project</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Max Score</label>
                <input
                  type="number"
                  value={newAssessment.max_score}
                  onChange={e => setNewAssessment({ ...newAssessment, max_score: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setShowAssessmentModal(false)} className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAddAssessment} className="flex-1 px-4 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm">
                  Add Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}