import { 
  Clock, 
  MapPin, 
  Send, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Info, 
  Megaphone, 
  MoreVertical,
  Filter
} from 'lucide-react';

export default function TeacherDashboard() {
  const roster = [
    {
      id: '2024-0012',
      name: 'Alexander Bennett',
      subtitle: 'Top Ranker • 98% Attendance',
      status: 'Present',
      note: '',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id: '2024-0045',
      name: 'Catherine Pierce',
      subtitle: 'Medical Leave History',
      status: 'Late',
      note: 'Bus delayed 10 mins',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id: '2024-0089',
      name: 'Daniel Marcus',
      subtitle: 'Average Grade: B+',
      status: 'Absent',
      note: '',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id: '2024-0102',
      name: 'Elena Rodriguez',
      subtitle: 'Sports Team Captain',
      status: 'Present',
      note: '',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10 min-h-full">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold mb-2">
            <span className="text-red-700">Classes</span>
            <span className="text-zinc-400">&gt;</span>
            <span className="text-[#3b3dbf]">Grade 11-B</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Advanced Mathematics - Grade 11-B</h1>
          <div className="flex items-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-1.5 text-teal-600">
              <Clock size={16} />
              08:00 AM - 09:30 AM
            </div>
            <div className="flex items-center gap-1.5 text-orange-600">
              <MapPin size={16} />
              Room 402 - Science Wing
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-lg text-sm font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm">
          <Send size={16} />
          Submit Attendance
        </button>
      </div>

      {/* Middle Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Lesson */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 font-bold text-lg">
              <BookOpen className="text-[#3b3dbf]" size={20} />
              Today's Lesson
            </div>
            <button className="text-[#3b3dbf] text-xs font-bold hover:underline">
              Edit Plan
            </button>
          </div>
          
          <div className="bg-indigo-50/50 border-l-4 border-[#3b3dbf] p-4 rounded-r-xl mb-6">
            <div className="text-xs font-bold text-[#3b3dbf] mb-1">Module 4: Differential Calculus</div>
            <div className="font-bold text-zinc-900">Introduction to Derivatives and Chain Rule</div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="text-[#3b3dbf] mt-0.5 shrink-0" size={18} />
              <span className="text-sm font-semibold text-zinc-600">Review of limits and continuity (15 min)</span>
            </div>
            <div className="flex gap-3 items-start">
              <Circle className="text-zinc-300 mt-0.5 shrink-0" size={18} />
              <span className="text-sm font-semibold text-zinc-600">Derivative from first principles (25 min)</span>
            </div>
            <div className="flex gap-3 items-start">
              <Circle className="text-zinc-300 mt-0.5 shrink-0" size={18} />
              <span className="text-sm font-semibold text-zinc-600">Group exercise: Power rule applications (30 min)</span>
            </div>
          </div>
          
          <div className="bg-cyan-50/50 border border-cyan-100 p-4 rounded-xl">
            <div className="text-[10px] font-bold text-cyan-700 tracking-wider mb-1 uppercase">Required Materials</div>
            <div className="text-xs font-semibold text-cyan-900">Scientific calculators, Graphing paper, Module 4 Handouts.</div>
          </div>
        </div>

        {/* Class Announcements */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <div className="flex items-center gap-2 font-bold text-lg mb-6">
            <Megaphone className="text-[#3b3dbf]" size={20} />
            Class Announcements
          </div>
          
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-8">
            <textarea 
              placeholder="Write a quick announcement to the class..." 
              className="w-full bg-transparent border-none resize-none focus:outline-none text-sm text-zinc-700 placeholder:text-zinc-400 font-medium"
              rows={3}
            ></textarea>
          </div>
          
          <div className="text-[10px] font-bold text-zinc-500 tracking-wider mb-3 uppercase">Recent Updates</div>
          
          <div className="bg-indigo-50/50 p-4 rounded-xl flex gap-3">
            <div className="shrink-0 mt-0.5">
              <div className="w-6 h-6 rounded-full border border-[#3b3dbf] flex items-center justify-center text-[#3b3dbf]">
                <Info size={14} />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-700 mb-2">Mid-term project guidelines have been uploaded to the student portal. Deadline: Oct 24th.</p>
              <p className="text-xs text-zinc-400 font-medium">Posted 2 hours ago</p>
            </div>
          </div>
        </div>

      </div>

      {/* Digital Attendance Roster */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden mt-2">
        <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
             <h3 className="font-bold text-xl mb-1">Digital Attendance Roster</h3>
             <p className="text-xs font-semibold text-zinc-500">24 Students Enrolled • Oct 16, 2023</p>
           </div>
           <div className="flex items-center gap-3">
             <div className="flex bg-white border border-zinc-200 rounded-lg p-1">
               <button className="px-4 py-1.5 bg-indigo-50 text-[#3b3dbf] rounded-md text-xs font-bold">All</button>
               <button className="px-4 py-1.5 text-zinc-500 hover:bg-zinc-50 rounded-md text-xs font-bold transition-colors">Absent</button>
               <button className="px-4 py-1.5 text-zinc-500 hover:bg-zinc-50 rounded-md text-xs font-bold transition-colors">Late</button>
             </div>
             <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 hover:bg-zinc-50 shadow-sm transition-colors">
               <Filter size={14} />
               Sort
             </button>
           </div>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50/50 text-zinc-500 text-xs font-bold border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Attendance Status</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-semibold">
              {roster.map((student, index) => (
                <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full bg-zinc-200 object-cover" />
                      <div>
                        <div className="text-zinc-900 font-bold">{student.name}</div>
                        <div className="text-xs text-zinc-500">{student.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">ID: {student.id}</td>
                  <td className="px-6 py-4">
                    <div className="inline-flex bg-zinc-100 rounded-full p-1 border border-zinc-200/50">
                      <button className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${student.status === 'Present' ? 'bg-[#3b3dbf] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>Present</button>
                      <button className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${student.status === 'Late' ? 'bg-[#8c4616] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>Late</button>
                      <button className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${student.status === 'Absent' ? 'bg-red-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>Absent</button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.note ? (
                      <span className="text-xs font-bold text-[#8c4616] italic">{student.note}</span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-400 italic">Add remark...</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-2 rounded-lg transition-colors inline-flex">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 md:px-6 border-t border-zinc-100 flex justify-between items-center text-xs font-bold text-zinc-500">
          <div>Showing 4 of 24 students</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-zinc-200 bg-white rounded-lg hover:bg-zinc-50 transition-colors shadow-sm">Previous</button>
            <button className="px-4 py-2 border border-zinc-200 bg-white rounded-lg hover:bg-zinc-50 transition-colors shadow-sm text-zinc-800">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}
