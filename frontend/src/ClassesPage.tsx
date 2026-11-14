import { Plus, Edit2, TrendingUp, Users, BookOpen, AlertTriangle, ChevronRight, Upload, FileText, Trash2, Paperclip, Download, X, CheckCircle2, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  const [newAssessment, setNewAssessment] = useState<{
    name: string;
    type: string;
    max_score: string;
    due_date: string;
    description: string;
    attachment_name: string;
    attachment_data: string;
    questions: { id: string; text: string; points: number }[];
  }>({
    name: '',
    type: 'Assignment',
    max_score: '100',
    due_date: '',
    description: '',
    attachment_name: '',
    attachment_data: '',
    questions: [],
  });

  const [activeSubmissionsModal, setActiveSubmissionsModal] = useState<any | null>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionGrading, setSubmissionGrading] = useState<{ studentId: number; score: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setNewAssessment(prev => ({
        ...prev,
        attachment_name: file.name,
        attachment_data: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const addQuestion = () => {
    const newQ = {
      id: Math.random().toString(36).substring(2, 9),
      text: '',
      points: 10,
    };
    setNewAssessment(prev => {
      const updated = [...prev.questions, newQ];
      const totalPoints = updated.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
      return {
        ...prev,
        questions: updated,
        max_score: totalPoints > 0 ? String(totalPoints) : prev.max_score,
      };
    });
  };

  const updateQuestion = (id: string, text: string, points: number) => {
    setNewAssessment(prev => {
      const updated = prev.questions.map(q => q.id === id ? { ...q, text, points } : q);
      const totalPoints = updated.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
      return {
        ...prev,
        questions: updated,
        max_score: totalPoints > 0 ? String(totalPoints) : prev.max_score,
      };
    });
  };

  const removeQuestion = (id: string) => {
    setNewAssessment(prev => {
      const updated = prev.questions.filter(q => q.id !== id);
      const totalPoints = updated.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
      return {
        ...prev,
        questions: updated,
        max_score: totalPoints > 0 ? String(totalPoints) : prev.max_score,
      };
    });
  };

  const handleAddAssessment = async () => {
    if (!newAssessment.name.trim() || !selectedClass) return;
    try {
      await api.post(`/academic/classes/${selectedClass.id}/assessments`, {
        name: newAssessment.name,
        type: newAssessment.type,
        max_score: parseInt(newAssessment.max_score) || 100,
        due_date: newAssessment.due_date || null,
        description: newAssessment.description || '',
        questions: newAssessment.questions,
        attachment_name: newAssessment.attachment_name || null,
        attachment_data: newAssessment.attachment_data || null,
      });
      setShowAssessmentModal(false);
      setNewAssessment({
        name: '',
        type: 'Assignment',
        max_score: '100',
        due_date: '',
        description: '',
        attachment_name: '',
        attachment_data: '',
        questions: [],
      });
      fetchGradebook(selectedClass.id);
    } catch {
      alert('Failed to add assessment');
    }
  };

  const openSubmissionsModal = async (assessment: any) => {
    setActiveSubmissionsModal(assessment);
    setSubmissionsLoading(true);
    try {
      const res = await api.get(`/academic/assessments/${assessment.id}/submissions`);
      setSubmissionsList(res.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const saveSubmissionGrade = async (studentId: number, assessmentId: number, scoreStr: string) => {
    const num = Number(scoreStr);
    if (isNaN(num) || num < 0) {
      alert('Please enter a valid number score');
      return;
    }
    try {
      await api.put('/academic/grades', { assessment_id: assessmentId, student_id: studentId, score: num });
      setGrades(prev => {
        const existing = prev.find(g => g.student_id === studentId && g.assessment_id === assessmentId);
        if (existing) return prev.map(g => g === existing ? { ...g, score: num } : g);
        return [...prev, { student_id: studentId, assessment_id: assessmentId, score: num }];
      });
      setSubmissionsList(prev => prev.map(s => s.student_id === studentId ? { ...s, grade: num } : s));
      setSubmissionGrading(null);
    } catch {
      alert('Failed to save score');
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

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toString().includes(searchQuery)
  );

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
    const sum = totals.reduce((a, b) => Number(a) + Number(b), 0);
    return (Number(sum) / totals.length).toFixed(1);
  })();

  const bgColors = [
    'bg-[#3b3dbf]/10 text-[#3b3dbf]',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-orange-100 text-orange-700',
    'bg-rose-100 text-rose-700',
  ];

  return (
    <div className="flex flex-col md:flex-row h-full gap-6 text-zinc-900 pb-6">

      {/* LEFT: Class List Panel */}
      <div className="w-full md:w-60 shrink-0 flex flex-col gap-3">
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
              {students.length === 0 && (
                <div className="p-6 text-center text-sm text-zinc-400 font-medium">No students enrolled in this class yet.</div>
              )}
              {students.length > 0 && (
                <table className="w-full text-left text-sm min-w-max">
                  <thead className="bg-zinc-50 border-b border-zinc-100 sticky top-0">
                    <tr>
                      <th className="px-5 py-3.5 font-bold text-xs text-zinc-500 sticky left-0 bg-zinc-50 z-10 min-w-[200px]">Student</th>
                      {assessments.length === 0 && (
                        <th className="px-4 py-3.5 text-center min-w-[200px]">
                          <button onClick={() => setShowAssessmentModal(true)} className="text-xs font-bold text-[#3b3dbf] hover:underline flex items-center justify-center gap-1 mx-auto">
                            <Plus size={14} /> Add your first assessment
                          </button>
                        </th>
                      )}
                      {assessments.map(a => (
                        <th key={a.id} className="px-4 py-3 text-center min-w-[130px]">
                          <div className="font-bold text-xs text-zinc-700">{a.name}</div>
                          <div className="text-[10px] font-semibold text-zinc-400 mt-0.5">{a.type} · /{a.max_score}</div>
                          <button
                            onClick={() => openSubmissionsModal(a)}
                            className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                              (a.submission_count || 0) > 0
                                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-xs'
                                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                            }`}
                            title="View student submissions & files"
                          >
                            <FileText size={10} />
                            {a.submission_count || 0} submitted
                          </button>
                        </th>
                      ))}
                      <th className="px-5 py-3.5 font-bold text-xs text-zinc-500 text-center min-w-[110px]">My Subject Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {filteredStudents.map((student) => {
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
                                <Link
                                  to={`/students/${student.id}`}
                                  className="font-semibold text-zinc-800 text-sm hover:text-[#3b3dbf] hover:underline transition-colors block"
                                  title="View Student Profile"
                                >
                                  {student.name}
                                </Link>
                                <div className="text-[10px] text-zinc-400">ID: #{student.id}</div>
                              </div>
                            </div>
                          </td>
                          {assessments.length === 0 && (
                            <td className="px-4 py-3.5 text-center cursor-not-allowed">
                              <span className="text-zinc-300">—</span>
                            </td>
                          )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowAssessmentModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">New Assignment / Assessment</h3>
                <p className="text-xs text-zinc-400 font-medium">for {selectedClass?.name}</p>
              </div>
              <button onClick={() => setShowAssessmentModal(false)} className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Assessment Name *</label>
                  <input
                    autoFocus
                    value={newAssessment.name}
                    onChange={e => setNewAssessment({ ...newAssessment, name: e.target.value })}
                    placeholder="e.g. Physics Assignment 1, Quiz 2..."
                    className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Type</label>
                  <select
                    value={newAssessment.type}
                    onChange={e => setNewAssessment({ ...newAssessment, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                  >
                    <option>Assignment</option>
                    <option>Quiz</option>
                    <option>Exam</option>
                    <option>Lab</option>
                    <option>Project</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Max Score (Total Points)</label>
                  <input
                    type="number"
                    value={newAssessment.max_score}
                    onChange={e => setNewAssessment({ ...newAssessment, max_score: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={newAssessment.due_date}
                    onChange={e => setNewAssessment({ ...newAssessment, due_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Instructions / Description</label>
                <textarea
                  rows={2}
                  value={newAssessment.description}
                  onChange={e => setNewAssessment({ ...newAssessment, description: e.target.value })}
                  placeholder="Instructions for students regarding homework, guidelines, or submission rules..."
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Upload Option (Question Paper / Reference Material) */}
              <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                      <Paperclip size={14} className="text-[#3b3dbf]" />
                      Attach Question Paper or Reference Material (Upload Option)
                    </span>
                    <p className="text-[11px] text-zinc-400">PDF, Word doc, or image students can view and download</p>
                  </div>
                  {newAssessment.attachment_name && (
                    <button
                      type="button"
                      onClick={() => setNewAssessment(prev => ({ ...prev, attachment_name: '', attachment_data: '' }))}
                      className="text-xs text-red-500 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {newAssessment.attachment_name ? (
                  <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700">
                    <FileText size={16} />
                    <span className="truncate flex-1">{newAssessment.attachment_name}</span>
                    <span className="text-[10px] text-indigo-400 uppercase font-semibold">Attached</span>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-300 hover:border-[#3b3dbf] rounded-xl cursor-pointer bg-white transition-colors group">
                    <Upload size={16} className="text-zinc-400 group-hover:text-[#3b3dbf]" />
                    <span className="text-xs font-semibold text-zinc-600 group-hover:text-[#3b3dbf]">
                      Click to upload question file (PDF, Doc, Image)
                    </span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                    />
                  </label>
                )}
              </div>

              {/* Making Questions Builder */}
              <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                      <BookOpen size={14} className="text-[#3b3dbf]" />
                      Making Questions (Question List)
                    </span>
                    <p className="text-[11px] text-zinc-400">Create questions directly for this assignment</p>
                  </div>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#3b3dbf] text-white text-xs font-bold rounded-lg hover:bg-[#2c2eb5] transition-colors shadow-xs"
                  >
                    <Plus size={14} /> Add Question
                  </button>
                </div>

                {newAssessment.questions.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-zinc-200 rounded-lg bg-white text-zinc-400 text-xs">
                    No individual questions added. Click <strong>"Add Question"</strong> to build structured questions, or attach a question file above.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {newAssessment.questions.map((q, idx) => (
                      <div key={q.id} className="p-3 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            Q{idx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-semibold text-zinc-500">Points:</label>
                            <input
                              type="number"
                              value={q.points}
                              onChange={e => updateQuestion(q.id, q.text, Number(e.target.value))}
                              className="w-16 px-2 py-1 text-xs border border-zinc-200 rounded-lg text-center font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => removeQuestion(q.id)}
                              className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                              title="Delete question"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <textarea
                          rows={2}
                          value={q.text}
                          onChange={e => updateQuestion(q.id, e.target.value, q.points)}
                          placeholder={`Enter question ${idx + 1} prompt...`}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:border-[#3b3dbf] focus:outline-none transition-colors resize-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-100 mt-2">
              <button
                type="button"
                onClick={() => setShowAssessmentModal(false)}
                className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAssessment}
                className="flex-1 px-4 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm"
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Review Modal */}
      {activeSubmissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setActiveSubmissionsModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                    {activeSubmissionsModal.type || 'Assignment'}
                  </span>
                  <h3 className="text-xl font-bold text-zinc-900">{activeSubmissionsModal.name}</h3>
                </div>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  Submissions & student uploaded work · Max Score: {activeSubmissionsModal.max_score}
                </p>
              </div>
              <button onClick={() => setActiveSubmissionsModal(null)} className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 pr-1">
              {submissionsLoading ? (
                <div className="p-12 text-center text-zinc-400">
                  <div className="w-8 h-8 border-4 border-[#3b3dbf]/30 border-t-[#3b3dbf] rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm font-semibold">Loading submissions...</p>
                </div>
              ) : submissionsList.length === 0 ? (
                <div className="p-12 text-center text-zinc-400">
                  <FileText size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="font-bold text-zinc-700">No submissions yet</p>
                  <p className="text-xs mt-1">Students enrolled in this class haven't submitted their files yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissionsList.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-indigo-200 transition-all space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                        <div>
                          <div className="font-bold text-sm text-zinc-900">{sub.student_name}</div>
                          <div className="text-xs text-zinc-400">Roll: {sub.roll_number || 'N/A'} · {sub.student_email}</div>
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <Clock size={13} />
                          Submitted {new Date(sub.submitted_at).toLocaleString()}
                        </div>
                      </div>

                      {/* Notes / Text response */}
                      {sub.notes && (
                        <div className="p-2.5 bg-zinc-50 rounded-lg text-xs text-zinc-700">
                          <strong className="text-zinc-900 block mb-0.5">Student Notes / Answer:</strong>
                          {sub.notes}
                        </div>
                      )}

                      {/* File Attachment */}
                      {sub.file_data && (
                        <div className="flex items-center justify-between p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg">
                          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
                            <FileText size={16} className="text-indigo-600" />
                            <span className="truncate max-w-xs">{sub.file_name || 'Uploaded Submission'}</span>
                            {sub.file_size && <span className="text-[10px] text-zinc-400">({sub.file_size})</span>}
                          </div>
                          <a
                            href={sub.file_data}
                            download={sub.file_name || 'submission'}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 shadow-2xs transition-colors"
                          >
                            <Download size={13} /> Download Work
                          </a>
                        </div>
                      )}

                      {/* Grading row */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-zinc-600">Current Score:</span>
                          <span className="font-black text-sm text-indigo-600">
                            {sub.grade !== null ? `${sub.grade} / ${activeSubmissionsModal.max_score}` : 'Not graded yet'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {submissionGrading && submissionGrading.studentId === sub.student_id ? (
                            <div className="flex items-center gap-2">
                              <input
                                autoFocus
                                type="number"
                                value={submissionGrading.score}
                                onChange={e => setSubmissionGrading({ studentId: sub.student_id, score: e.target.value })}
                                placeholder="Score"
                                className="w-20 px-2 py-1 text-xs border border-zinc-300 rounded-lg text-center font-bold"
                              />
                              <button
                                onClick={() => saveSubmissionGrade(sub.student_id, activeSubmissionsModal.id, submissionGrading.score)}
                                className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setSubmissionGrading(null)}
                                className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSubmissionGrading({ studentId: sub.student_id, score: sub.grade !== null ? String(sub.grade) : '' })}
                              className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-xs font-bold text-zinc-700 transition-colors"
                            >
                              {sub.grade !== null ? 'Update Grade' : 'Grade Submission'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setActiveSubmissionsModal(null)}
                className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}