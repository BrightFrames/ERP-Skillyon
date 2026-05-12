import { 
  User, 
  UserCheck, 
  Banknote, 
  Calendar,
  Filter,
  Download,
  ChevronDown,
  UserPlus,
  Megaphone,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Overview Dashboard</h1>
          <p className="text-zinc-500 text-sm md:text-base">Welcome back, Admin. Here is what's happening at EduCore today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors shadow-sm text-zinc-700">
            <Filter size={16} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#3b3dbf] text-white rounded-lg text-sm font-semibold hover:bg-[#2c2eb5] transition-colors shadow-sm">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-zinc-500 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-zinc-900">1,250</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#3b3dbf] flex items-center justify-center">
              <User size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            +12% from last term
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-zinc-500 mb-1">Total Teachers</p>
              <p className="text-3xl font-bold text-zinc-900">85</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
            Active & Fully Staffed
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-zinc-500 mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-zinc-900">$45k</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Banknote size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            8% above target
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-zinc-500 mb-1">Attendance</p>
              <p className="text-3xl font-bold text-zinc-900">94%</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Today's average
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg">Monthly Admission Trends</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-600">
              Academic Year 2023-24
              <ChevronDown size={14} />
            </button>
          </div>
          
          {/* Mock Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-2 md:gap-6 pt-4 pb-2 border-b border-zinc-100">
            <div className="w-full bg-indigo-100 rounded-t-sm" style={{ height: '40%' }}></div>
            <div className="w-full bg-indigo-200 rounded-t-sm" style={{ height: '65%' }}></div>
            <div className="w-full bg-indigo-200 rounded-t-sm" style={{ height: '80%' }}></div>
            <div className="w-full bg-indigo-200 rounded-t-sm" style={{ height: '45%' }}></div>
            <div className="w-full bg-indigo-200 rounded-t-sm" style={{ height: '90%' }}></div>
            <div className="w-full bg-indigo-200 rounded-t-sm" style={{ height: '55%' }}></div>
          </div>
          
          <div className="flex justify-between text-xs font-semibold text-zinc-400 pt-3 px-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
          
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3b3dbf]"></div>
              New Admissions
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
              Enquiries
            </div>
          </div>
        </div>

        {/* Right Column Cards */}
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Fee Collection Card */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Fee Collection</h3>
            
            <div className="mb-5">
              <div className="flex justify-between text-xs font-bold text-zinc-800 mb-2">
                <span>Tuition Fees</span>
                <span>85%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#3b3dbf] rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between text-xs font-bold text-zinc-800 mb-2">
                <span>Transportation</span>
                <span>62%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>

            <button className="w-full py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-[#3b3dbf] hover:bg-zinc-50 transition-colors">
              View Full Ledger
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-[#595cdb] p-6 rounded-2xl shadow-lg text-white flex-1">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button onClick={() => navigate('/students')} className="w-full flex items-center gap-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left group">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <UserPlus size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold">Add Student</div>
                  <div className="text-xs text-indigo-100">Register new enrollment</div>
                </div>
              </button>
              
              <button onClick={() => navigate('/teachers')} className="w-full flex items-center gap-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left group">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <UserPlus size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold">Add Teacher</div>
                  <div className="text-xs text-indigo-100">Onboard new faculty member</div>
                </div>
              </button>
              
              <button onClick={() => navigate('/messages')} className="w-full flex items-center gap-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left group">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <Megaphone size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold">Send Notice</div>
                  <div className="text-xs text-indigo-100">Broadcast to all parents</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
           <h3 className="font-bold text-lg">Recent Student Enrollments</h3>
           <a href="#" className="text-sm font-semibold text-[#3b3dbf] hover:underline">View All</a>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-white text-zinc-500 font-semibold border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">ID Number</th>
                <th className="px-6 py-4 font-semibold">Class/Grade</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              <tr className="hover:bg-zinc-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" className="w-8 h-8 rounded-full bg-zinc-200" />
                    <span className="text-zinc-900 font-bold">Sarah Jenkins</span>
                  </div>
                </td>
                <td className="px-6 py-4">#STU-9821</td>
                <td className="px-6 py-4">Grade 8-B</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">ACTIVE</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[#3b3dbf] hover:bg-blue-50 p-2 rounded-lg transition-colors inline-flex">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" className="w-8 h-8 rounded-full bg-zinc-200" />
                    <span className="text-zinc-900 font-bold">Marcus Thompson</span>
                  </div>
                </td>
                <td className="px-6 py-4">#STU-9744</td>
                <td className="px-6 py-4">Grade 10-A</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">ACTIVE</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[#3b3dbf] hover:bg-blue-50 p-2 rounded-lg transition-colors inline-flex">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" className="w-8 h-8 rounded-full bg-zinc-200" />
                    <span className="text-zinc-900 font-bold">Chloe Williams</span>
                  </div>
                </td>
                <td className="px-6 py-4">#STU-9610</td>
                <td className="px-6 py-4">Grade 7-C</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold">PENDING</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[#3b3dbf] hover:bg-blue-50 p-2 rounded-lg transition-colors inline-flex">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
