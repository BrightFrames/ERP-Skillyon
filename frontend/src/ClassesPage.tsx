import { Filter, ChevronDown, Plus, Edit2, TrendingUp, Lightbulb, ArrowRight, ChevronLeft, ChevronRight, MoreVertical, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from './lib/api';

export default function ClassesPage() {
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGrade, setEditingGrade] = useState<{ studentId: number; assessmentId: number } | null>(null);
  const [tempScore, setTempScore] = useState<string>('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/academic/teacher-classes');
      setTeacherClasses(res.data);
      if (res.data.length > 0) {
        setSelectedClass(res.data[0]);
        fetchGradebook(res.data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchGradebook = async (classId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/academic/classes/${classId}/gradebook`);
      setStudents(res.data.students || []);
      setAssessments(res.data.assessments || []);
      setGrades(res.data.grades || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cls = teacherClasses.find(c => c.id.toString() === e.target.value);
    setSelectedClass(cls);
    if (cls) fetchGradebook(cls.id);
  };

  const getStudentGrade = (studentId: number, assessmentId: number) => {
    const grade = grades.find(g => g.student_id === studentId && g.assessment_id === assessmentId);
    return grade ? grade.score : '-';
  };

  const saveGrade = async (studentId: number, assessmentId: number) => {
    if (!tempScore || isNaN(Number(tempScore))) {
      setEditingGrade(null);
      return;
    }
    try {
      await api.put('/academic/grades', {
        assessment_id: assessmentId,
        student_id: studentId,
        score: Number(tempScore)
      });
      // Optimistic update
      setGrades(prev => {
        const existing = prev.find(g => g.student_id === studentId && g.assessment_id === assessmentId);
        if (existing) {
          return prev.map(g => g === existing ? { ...g, score: Number(tempScore) } : g);
        }
        return [...prev, { student_id: studentId, assessment_id: assessmentId, score: Number(tempScore) }];
      });
      setEditingGrade(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save score');
    }
  };

  const calculateOverall = (studentId: number) => {
    if (assessments.length === 0) return { percent: 0, grade: 'N/A' };
    
    let totalScore = 0;
    let totalMax = 0;
    
    assessments.forEach(a => {
      const g = grades.find(g => g.student_id === studentId && g.assessment_id === a.id);
      if (g) {
        totalScore += g.score;
      }
      totalMax += a.max_score || 100;
    });

    if (totalMax === 0) return { percent: 0, grade: 'N/A' };
    
    const percent = Math.round((totalScore / totalMax) * 1000) / 10;
    let letter = 'F';
    if (percent >= 90) letter = 'A';
    else if (percent >= 80) letter = 'B';
    else if (percent >= 70) letter = 'C';
    else if (percent >= 60) letter = 'D';
    
    return { percent, grade: letter };
  };

  const getScoreColor = (score: string | number) => {
    if (score === '-') return 'text-zinc-400';
    return Number(score) < 70 ? 'text-red-500' : 'text-zinc-800';
  };

  const getOverallStyle = (score: number) => {
    if (score >= 90) return 'bg-indigo-50 text-[#3b3dbf] border-indigo-100';
    if (score >= 70) return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    return 'bg-red-50 text-red-500 border-red-100';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10 min-h-full">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#3b3dbf] mb-1">Student Gradebook</h1>
          <p className="text-zinc-500 font-semibold text-sm">
            {selectedClass ? selectedClass.name : 'No Class Selected'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {teacherClasses.length > 0 && (
            <select 
              value={selectedClass?.id || ''} 
              onChange={handleClassChange}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors focus:outline-none pr-8"
            >
              {teacherClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors">
            <Filter size={14} />
            Midterm Period 1
          </button>
          <button 
            onClick={async () => {
              if (!selectedClass) return;
              const name = prompt('Enter assessment name (e.g. Final Exam):');
              if (!name) return;
              try {
                await api.post(`/academic/classes/${selectedClass.id}/assessments`, { name, max_score: 100 });
                fetchGradebook(selectedClass.id);
              } catch (e) {
                alert('Failed to add assessment');
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#2c2eb5] transition-colors ml-2"
          >
            <Plus size={16} />
            New Assessment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-2">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 border-b-4 border-b-[#3b3dbf]">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Class Average</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#3b3dbf]">88.4%</span>
            <span className="flex items-center text-xs font-bold text-emerald-500">
              <TrendingUp size={12} className="mr-0.5" /> +2.1%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 border-b-4 border-b-teal-500">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Submissions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-teal-600">24/25</span>
            <span className="text-xs font-bold text-zinc-500">Completed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 border-b-4 border-b-orange-500">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Next Deadline</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-orange-600">Oct 14</span>
            <span className="text-xs font-bold text-zinc-500">Project Beta</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 border-b-4 border-b-red-500">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">At Risk</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-600">2</span>
            <span className="text-xs font-bold text-zinc-500">Students</span>
          </div>
        </div>
      </div>

      {/* Main Gradebook Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50/50 text-zinc-500 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-bold text-xs">Student Name</th>
                {assessments.map(a => (
                  <th key={a.id} className="px-4 py-4 text-center">
                    <div className="font-bold text-xs">{a.name}</div>
                    <div className="text-[10px] font-semibold text-zinc-400 mt-1">{a.type} (/{a.max_score})</div>
                  </th>
                ))}
                <th className="px-6 py-4 font-bold text-xs text-center">Overall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-bold">
              {loading ? (
                <tr><td colSpan={assessments.length + 2} className="p-8 text-center text-zinc-500">Loading gradebook...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={assessments.length + 2} className="p-8 text-center text-zinc-500">No students found in this class.</td></tr>
              ) : students.map((student, index) => {
                const overall = calculateOverall(student.id);
                return (
                <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-indigo-50 text-[#3b3dbf]">
                          {getInitials(student.name)}
                        </div>
                      )}
                      <div>
                        <div className="text-zinc-900">{student.name}</div>
                        <div className="text-[10px] text-zinc-400 font-semibold">ID: #{student.id}</div>
                      </div>
                    </div>
                  </td>
                  {assessments.map(a => {
                    const score = getStudentGrade(student.id, a.id);
                    const isEditing = editingGrade?.studentId === student.id && editingGrade?.assessmentId === a.id;
                    return (
                      <td key={a.id} className={`px-4 py-4 text-center group relative cursor-pointer ${getScoreColor(score)}`}
                          onClick={() => {
                            if (!isEditing) {
                              setEditingGrade({ studentId: student.id, assessmentId: a.id });
                              setTempScore(score === '-' ? '' : score.toString());
                            }
                          }}
                      >
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input 
                              type="text" 
                              autoFocus
                              value={tempScore}
                              onChange={(e) => setTempScore(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveGrade(student.id, a.id);
                                if (e.key === 'Escape') setEditingGrade(null);
                              }}
                              onBlur={() => saveGrade(student.id, a.id)}
                              className="w-12 px-1 py-0.5 text-center text-sm font-bold border border-[#3b3dbf] rounded shadow-sm outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {score}
                            <Edit2 size={12} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-[#3b3dbf] transition-opacity" />
                          </div>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-3 py-1 text-[10px] rounded-full border ${getOverallStyle(overall.percent)}`}>
                      {overall.percent}% ({overall.grade})
                    </span>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 md:px-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <div className="text-xs font-bold text-zinc-500">
            Showing 1 to 5 of 25 students
          </div>
          
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 text-zinc-400 rounded-lg text-sm font-bold shadow-sm hover:bg-zinc-50">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-[#3b3dbf] text-white rounded-lg text-xs font-bold shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg text-xs font-bold transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg text-xs font-bold transition-colors">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 text-zinc-600 rounded-lg text-sm font-bold shadow-sm hover:bg-zinc-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg text-zinc-900">Class Performance Trend</h3>
            <button className="text-zinc-400 hover:text-zinc-700">
              <MoreVertical size={18} />
            </button>
          </div>
          
          {/* Mock Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-4 md:gap-8 pt-4 pb-2 border-b border-zinc-100 h-48">
            <div className="w-full bg-indigo-50 hover:bg-indigo-100 transition-colors rounded-t-sm" style={{ height: '35%' }}></div>
            <div className="w-full bg-indigo-100 hover:bg-indigo-200 transition-colors rounded-t-sm" style={{ height: '45%' }}></div>
            <div className="w-full bg-indigo-100 hover:bg-indigo-200 transition-colors rounded-t-sm" style={{ height: '40%' }}></div>
            <div className="w-full bg-[#a3a5f0] hover:bg-[#8688e0] transition-colors rounded-t-sm" style={{ height: '70%' }}></div>
            <div className="w-full bg-[#3b3dbf] rounded-t-sm" style={{ height: '85%' }}></div>
            <div className="w-full bg-indigo-50 hover:bg-indigo-100 transition-colors rounded-t-sm" style={{ height: '55%' }}></div>
          </div>
          
          <div className="flex justify-between text-[10px] font-bold text-zinc-400 pt-3 px-2">
            <span>WEEK 1</span>
            <span>WEEK 2</span>
            <span>WEEK 3</span>
            <span>WEEK 4</span>
            <span className="text-[#3b3dbf]">WEEK 5</span>
            <span>WEEK 6</span>
          </div>
        </div>

        {/* Grading Assistant */}
        <div className="bg-[#3b3dbf] rounded-2xl shadow-lg p-6 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full transform translate-x-10 -translate-y-10"></div>
          
          <div className="relative z-10">
            <h3 className="font-bold text-xl mb-3">Grading Assistant</h3>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-8">
              You have 12 un-graded submissions for "Recursion Lab".
            </p>
            
            <div className="bg-[#2c2eb5] rounded-xl p-4 flex gap-3 items-start mb-8 border border-white/10">
              <div className="bg-white/20 p-1.5 rounded-lg shrink-0">
                <Lightbulb size={16} className="text-white" />
              </div>
              <p className="text-xs text-indigo-50 font-medium leading-relaxed">
                <span className="font-bold text-white">Pro-tip:</span> Most students struggled with Question 4. Consider a review session.
              </p>
            </div>
          </div>

          <button className="w-full relative z-10 flex items-center justify-center gap-2 py-3 bg-white text-[#3b3dbf] rounded-xl text-sm font-bold shadow-sm hover:bg-zinc-50 transition-colors">
            Start Grading Now
            <ArrowRight size={16} />
          </button>
        </div>

      </div>

    </div>
  );
}