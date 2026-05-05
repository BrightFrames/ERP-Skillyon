import { Filter, ChevronDown, Plus, Edit2, TrendingUp, Lightbulb, ArrowRight, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

export default function ClassesPage() {
  const students = [
    { id: '2024-001', initials: 'AB', name: 'Alexander Bennett', q1: 92, u2: 88, m: 95, l: 90, overall: 91.2, grade: 'A', bg: 'bg-indigo-50 text-[#3b3dbf]' },
    { id: '2024-002', initials: 'CC', name: 'Chloe Chambers', q1: 78, u2: 82, m: 80, l: 65, overall: 76.3, grade: 'C', bg: 'bg-teal-50 text-teal-600' },
    { id: '2024-003', initials: 'DL', name: 'David Lopez', q1: 100, u2: 96, m: 98, l: 99, overall: 98.2, grade: 'A+', bg: 'bg-orange-50 text-orange-600' },
    { id: '2024-004', initials: 'EM', name: 'Elena Martinez', q1: 55, u2: 72, m: 68, l: 70, overall: 66.2, grade: 'D', bg: 'bg-red-50 text-red-700' },
    { id: '2024-005', initials: 'JR', name: 'Julian Rivers', q1: 85, u2: 88, m: 82, l: 84, overall: 84.7, grade: 'B', bg: 'bg-cyan-50 text-cyan-600' },
  ];

  const getScoreColor = (score: number) => {
    return score < 70 ? 'text-red-500' : 'text-zinc-800';
  };

  const getOverallStyle = (score: number) => {
    if (score >= 90) return 'bg-indigo-50 text-[#3b3dbf] border-indigo-100';
    if (score >= 70) return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    return 'bg-red-50 text-red-500 border-red-100';
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10 min-h-full">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#3b3dbf] mb-1">Student Gradebook</h1>
          <p className="text-zinc-500 font-semibold text-sm">AP Computer Science A - Grade 11</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors">
            <Filter size={14} />
            Midterm Period 1
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors">
            All Sections
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#2c2eb5] transition-colors ml-2">
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
                <th className="px-4 py-4 text-center">
                  <div className="font-bold text-xs">Quiz:<br/>Arrays</div>
                  <div className="text-[10px] font-semibold text-zinc-400 mt-1">Sep 24</div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="font-bold text-xs">Unit 2<br/>Project</div>
                  <div className="text-[10px] font-semibold text-zinc-400 mt-1">Oct 02</div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="font-bold text-xs text-[#3b3dbf]">Midterm<br/>Exam</div>
                  <div className="text-[10px] font-semibold text-[#3b3dbf] mt-1">Oct 08</div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="font-bold text-xs">Lab:<br/>Recursion</div>
                  <div className="text-[10px] font-semibold text-zinc-400 mt-1">Oct 10</div>
                </th>
                <th className="px-6 py-4 font-bold text-xs text-center">Overall</th>
                <th className="px-6 py-4 font-bold text-xs text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-bold">
              {students.map((student, index) => (
                <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${student.bg}`}>
                        {student.initials}
                      </div>
                      <div>
                        <div className="text-zinc-900">{student.name}</div>
                        <div className="text-[10px] text-zinc-400 font-semibold">ID: {student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 py-4 text-center ${getScoreColor(student.q1)}`}>{student.q1}</td>
                  <td className={`px-4 py-4 text-center ${getScoreColor(student.u2)}`}>{student.u2}</td>
                  <td className={`px-4 py-4 text-center text-[#3b3dbf] ${getScoreColor(student.m)}`}>{student.m}</td>
                  <td className={`px-4 py-4 text-center ${getScoreColor(student.l)}`}>{student.l}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-3 py-1 text-[10px] rounded-full border ${getOverallStyle(student.overall)}`}>
                      {student.overall}% ({student.grade})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-2 rounded-lg transition-colors inline-flex">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
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