import { 
  UserPlus, 
  Filter, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  Users,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentsPage() {
  const students = [
    {
      id: '#STU-2024-001',
      name: 'Alexander Bennett',
      email: 'alexander.b@school.edu',
      grade: 'Grade 11 - A',
      gender: 'Male',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id: '#STU-2024-042',
      name: 'Eleanor Vance',
      email: 'e.vance@school.edu',
      grade: 'Grade 10 - B',
      gender: 'Female',
      status: 'Inactive',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id: '#STU-2024-118',
      name: 'Marcus Thorne',
      email: 'm.thorne@school.edu',
      grade: 'Grade 12 - A',
      gender: 'Male',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id: '#STU-2024-205',
      name: 'Sophia Lin',
      email: 'sophia.lin@school.edu',
      grade: 'Grade 9 - C',
      gender: 'Female',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10 min-h-full">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 mb-2">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span className="text-zinc-900">Student Management</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Student Management</h1>
          <p className="text-zinc-500 font-medium">Oversee and manage the student population records and academic enrollment.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-lg text-sm font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm">
          <UserPlus size={18} />
          Add New Student
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
        
        {/* Filters Bar */}
        <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50/30">
           <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-zinc-600">Filter by:</span>
             <button className="px-4 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-bold text-zinc-600 shadow-sm hover:bg-zinc-50">
               All Grades
             </button>
             <button className="px-4 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-bold text-zinc-600 shadow-sm hover:bg-zinc-50">
               All Status
             </button>
             <button className="flex items-center gap-1.5 text-xs font-bold text-[#3b3dbf] hover:text-[#2c2eb5] ml-2">
               <Filter size={14} />
               Clear Filters
             </button>
           </div>
           <div className="text-sm font-semibold text-zinc-500">
             Showing <span className="font-bold text-zinc-800">1-10</span> of <span className="font-bold text-zinc-800">450</span> students
           </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50/50 text-zinc-500 font-bold border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Grade/Class</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-semibold">
              {students.map((student, index) => (
                <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/students/${student.id.replace('#', '')}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                      <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full bg-zinc-200 object-cover" />
                      <div>
                        <div className="text-zinc-900 font-bold hover:text-[#3b3dbf] transition-colors">{student.name}</div>
                        <div className="text-xs text-zinc-500">{student.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{student.id}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold whitespace-nowrap">
                      {student.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-700">{student.gender}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      student.status === 'Active' 
                        ? 'bg-indigo-50 text-[#3b3dbf]' 
                        : 'bg-red-50 text-red-500'
                    }`}>
                      {student.status}
                    </span>
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

        {/* Pagination */}
        <div className="p-4 md:px-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 bg-white rounded-lg text-zinc-600 text-sm font-bold hover:bg-zinc-50 transition-colors shadow-sm">
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center bg-[#3b3dbf] text-white rounded-lg text-sm font-bold shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg text-sm font-bold transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg text-sm font-bold transition-colors">
              3
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-zinc-400 text-sm font-bold">
              ...
            </span>
            <button className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg text-sm font-bold transition-colors">
              45
            </button>
          </div>

          <button className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 bg-white rounded-lg text-zinc-600 text-sm font-bold hover:bg-zinc-50 transition-colors shadow-sm">
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-2">
        {/* Total Students */}
        <div className="bg-[#595cdb] p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div className="text-xs font-semibold text-indigo-100">+12% Monthly</div>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">450</p>
            <p className="text-sm font-semibold text-indigo-100">Total Students</p>
          </div>
        </div>

        {/* Male Students */}
        <div className="bg-zinc-100/80 border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3b3dbf] flex items-center justify-center mb-6">
            {/* Custom SVG for Male symbol */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="14" r="5"></circle>
              <line x1="13.5" y1="10.5" x2="21" y2="3"></line>
              <polyline points="16 3 21 3 21 8"></polyline>
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-zinc-900 mb-1">235</p>
            <p className="text-sm font-semibold text-zinc-500">Male Students</p>
          </div>
        </div>

        {/* Female Students */}
        <div className="bg-zinc-100/80 border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
            {/* Custom SVG for Female symbol */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="9" r="5"></circle>
              <line x1="12" y1="14" x2="12" y2="22"></line>
              <line x1="9" y1="19" x2="15" y2="19"></line>
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-zinc-900 mb-1">215</p>
            <p className="text-sm font-semibold text-zinc-500">Female Students</p>
          </div>
        </div>

        {/* New Enrollments */}
        <div className="bg-zinc-100/80 border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-3xl font-bold text-zinc-900 mb-1">42</p>
            <p className="text-sm font-semibold text-zinc-500">New Enrollments</p>
          </div>
        </div>
      </div>

      {/* Global Footer */}
      <div className="mt-auto pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-zinc-500 gap-4">
        <p>© 2024 EduCore ERP. All Rights Reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-800 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-800 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
