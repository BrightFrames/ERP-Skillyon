import {
  User,
  UserCheck,
  Banknote,
  Calendar,
  Download,
  UserPlus,
  Megaphone,
  Eye,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Users,
  Plus,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, male: 0, female: 0, newEnrollments: 0 });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Class Modal State
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newGrade, setNewGrade] = useState('');
  const [newSection, setNewSection] = useState('');
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);

  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.name || (user?.role === 'ADMIN' ? 'Admin' : user?.role === 'TEACHER' ? 'Dr. Sarah Wilson' : 'Staff');
  const userRole = user?.role || 'ADMIN';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        api.get('/students?page=0&limit=5'),
        api.get('/classes'),
      ]);
      const data = studentsRes.data;
      setStats({
        total: data.total || 0,
        male: data.metrics?.male || 0,
        female: data.metrics?.female || 0,
        newEnrollments: data.metrics?.newEnrollments || 0,
      });
      setRecentStudents(data.data || []);
      setClasses(classesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrade.trim() || !newSection.trim()) return;
    
    setIsSubmittingClass(true);
    try {
      const className = `Grade ${newGrade.trim()} - ${newSection.trim().toUpperCase()}`;
      await api.post('/classes', { name: className });
      await fetchDashboardData(); // Refresh the classes list
      setShowAddClassModal(false);
      setNewGrade('');
      setNewSection('');
    } catch (err) {
      console.error('Failed to add class', err);
      alert('Failed to create class. Please try again.');
    } finally {
      setIsSubmittingClass(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-slate-900 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-400 mb-1">{greetingTime()}, {userName} 👋</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Overview Dashboard</h1>
          <p className="text-zinc-400 text-sm">Here's what's happening at EduCore today.</p>
        </div>
        <div className="flex items-center gap-3">
          {userRole === 'ADMIN' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-[#3b3dbf] text-white rounded-lg text-sm font-semibold hover:bg-[#2c2eb5] transition-colors shadow-sm">
              <Download size={16} />
              Export Report
            </button>
          )}
        </div>
      </div>

      {/* Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-40 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Students</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight">{loading ? '...' : stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
              <Users size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full z-10">
            <TrendingUp size={16} /> +{stats.newEnrollments} this month
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-40 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Classes</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight">{loading ? '...' : classes.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500 z-10">Active this semester</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-40 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Male Students</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight">{loading ? '...' : stats.male}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
              <User size={24} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500 z-10">Enrolled & Active</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-40 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Female Students</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight">{loading ? '...' : stats.female}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
              <UserCheck size={24} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500 z-10">Enrolled & Active</p>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Classes Overview */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-7 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900">Active Classes</h3>
            <div className="flex items-center gap-4">
              {userRole === 'ADMIN' && (
                <button 
                  onClick={() => setShowAddClassModal(true)} 
                  className="flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <Plus size={16} /> Add Class
                </button>
              )}
              <Link to="/classes" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">View Gradebooks →</Link>
            </div>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium py-10">Loading classes...</div>
          ) : classes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium py-10">No classes found.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {classes.map((cls, i) => {
                const colors = [
                  'bg-indigo-50/80 text-indigo-700 border-indigo-200/50 hover:bg-indigo-100',
                  'bg-emerald-50/80 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100',
                  'bg-amber-50/80 text-amber-700 border-amber-200/50 hover:bg-amber-100',
                  'bg-rose-50/80 text-rose-700 border-rose-200/50 hover:bg-rose-100',
                  'bg-violet-50/80 text-violet-700 border-violet-200/50 hover:bg-violet-100',
                ];
                const color = colors[i % colors.length];
                return (
                  <button
                    key={cls.id}
                    onClick={() => navigate('/classes')}
                    className={`flex items-center gap-4 p-4 rounded-2xl border text-left hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${color} group`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-sm font-black shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      {getInitials(cls.name)}
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight">{cls.name}</div>
                      <div className="text-xs opacity-70 font-medium mt-1">Open gradebook</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#3b3dbf] p-6 rounded-2xl shadow-lg text-white flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full translate-x-8 -translate-y-8"></div>
            <h3 className="font-bold text-base mb-5 relative z-10">Quick Actions</h3>
            <div className="space-y-2.5 relative z-10">
              <Link to="/students" className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left group">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <UserPlus size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold">Manage Students</div>
                  <div className="text-[10px] text-indigo-200">View & edit student records</div>
                </div>
              </Link>
              <Link to="/classes" className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left group">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold">Open Gradebook</div>
                  <div className="text-[10px] text-indigo-200">Add & update marks</div>
                </div>
              </Link>
              <Link to="/messages" className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left group">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Megaphone size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold">Messages</div>
                  <div className="text-[10px] text-indigo-200">Broadcast to parents</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Enrollments Table */}
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col overflow-hidden">
        <div className="px-7 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-900">Recent Student Enrollments</h3>
          <Link to="/students" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">View All Directory →</Link>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-7 py-4 font-bold text-xs uppercase tracking-wider">Student Name</th>
                <th className="px-7 py-4 font-bold text-xs uppercase tracking-wider">ID</th>
                <th className="px-7 py-4 font-bold text-xs uppercase tracking-wider">Class</th>
                <th className="px-7 py-4 font-bold text-xs uppercase tracking-wider">Gender</th>
                <th className="px-7 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                <th className="px-7 py-4 font-bold text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {loading ? (
                <tr><td colSpan={6} className="px-7 py-10 text-center text-slate-400 text-sm">Loading students...</td></tr>
              ) : recentStudents.length === 0 ? (
                <tr><td colSpan={6} className="px-7 py-10 text-center text-slate-400 text-sm">No recent students found.</td></tr>
              ) : recentStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-7 py-4">
                    <div className="flex items-center gap-4">
                      {s.avatar ? (
                        <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0 border-2 border-white shadow-sm">
                          {getInitials(s.name)}
                        </div>
                      )}
                      <span className="text-slate-900 font-bold group-hover:text-indigo-600 transition-colors">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-7 py-4 text-slate-400 text-xs font-bold">#{s.id.toString().padStart(4, '0')}</td>
                  <td className="px-7 py-4">
                    {s.class_name ? (
                      <span className="px-3 py-1 bg-indigo-50/80 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100/50">{s.class_name}</span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-7 py-4 text-xs text-slate-500 font-bold">{s.gender || '—'}</td>
                  <td className="px-7 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase ${
                      s.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'
                    }`}>
                      {s.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-7 py-4 text-right">
                    <Link to={`/students/${s.id}`} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-xl transition-all inline-flex border border-transparent hover:border-indigo-100">
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-7 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-xl text-slate-900">Add New Class</h3>
              <button 
                onClick={() => setShowAddClassModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddClass} className="p-7 flex flex-col gap-5">
              <div className="flex gap-5">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Grade (e.g. 10)</label>
                  <input
                    type="text"
                    required
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium bg-slate-50/50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Section (e.g. A)</label>
                  <input
                    type="text"
                    required
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    placeholder="A"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="p-4 bg-indigo-50/80 rounded-xl mt-2 border border-indigo-100">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Preview</p>
                <p className="text-base font-black text-indigo-900 mt-1">
                  {newGrade || newSection 
                    ? `Grade ${newGrade.trim()} - ${newSection.trim().toUpperCase()}`
                    : 'Grade ... - ...'}
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClass || !newGrade.trim() || !newSection.trim()}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {isSubmittingClass ? 'Creating...' : (
                    <>
                      <Plus size={18} strokeWidth={2.5} /> Create Class
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
