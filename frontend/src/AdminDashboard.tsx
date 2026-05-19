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
    <div className="flex flex-col gap-6 text-zinc-900 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-400 mb-1">{greetingTime()}, {userName} 👋</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Overview Dashboard</h1>
          <p className="text-zinc-400 text-sm">Here's what's happening at EduCore today.</p>
        </div>
      </div>

      {/* Live Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-zinc-900">{loading ? '...' : stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3b3dbf] flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
            <TrendingUp size={12} /> +{stats.newEnrollments} this month
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-1">Total Classes</p>
              <p className="text-3xl font-bold text-zinc-900">{loading ? '...' : classes.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
          </div>
          <p className="text-xs font-semibold text-zinc-400">Active this semester</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-1">Male Students</p>
              <p className="text-3xl font-bold text-zinc-900">{loading ? '...' : stats.male}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <User size={20} />
            </div>
          </div>
          <p className="text-xs font-semibold text-zinc-400">Enrolled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-1">Female Students</p>
              <p className="text-3xl font-bold text-zinc-900">{loading ? '...' : stats.female}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
              <UserCheck size={20} />
            </div>
          </div>
          <p className="text-xs font-semibold text-zinc-400">Enrolled</p>
        </div>
      </div>

      {/* Middle Row */}
      <div className="flex flex-col gap-5">

        {/* Classes Overview */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-base text-zinc-900">Active Classes</h3>
            <div className="flex items-center gap-3">
              {userRole === 'ADMIN' && (
                <button 
                  onClick={() => setShowAddClassModal(true)} 
                  className="flex items-center gap-1 text-xs font-bold text-white bg-[#3b3dbf] px-2.5 py-1.5 rounded-lg hover:bg-[#2c2eb5] transition-colors"
                >
                  <Plus size={14} /> Add Class
                </button>
              )}
              <Link to="/classes" className="text-xs font-bold text-zinc-500 hover:text-zinc-800">View Gradebooks →</Link>
            </div>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-zinc-300 text-sm">Loading...</div>
          ) : classes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-zinc-300 text-sm">No classes found.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {classes.map((cls, i) => {
                const colors = [
                  'bg-indigo-50 text-[#3b3dbf] border-indigo-100',
                  'bg-emerald-50 text-emerald-700 border-emerald-100',
                  'bg-orange-50 text-orange-600 border-orange-100',
                  'bg-pink-50 text-pink-600 border-pink-100',
                  'bg-violet-50 text-violet-700 border-violet-100',
                ];
                const color = colors[i % colors.length];
                return (
                  <button
                    key={cls.id}
                    onClick={() => navigate('/classes')}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left hover:shadow-md transition-all ${color}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center text-xs font-bold shrink-0">
                      {getInitials(cls.name)}
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight">{cls.name}</div>
                      <div className="text-[10px] opacity-60 font-medium mt-0.5">Click to open gradebook</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Enrollments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
          <h3 className="font-bold text-base text-zinc-900">Recent Student Enrollments</h3>
          <Link to="/students" className="text-xs font-bold text-[#3b3dbf] hover:underline">View All →</Link>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50/60 text-zinc-400 font-semibold border-b border-zinc-100">
              <tr>
                <th className="px-6 py-3.5 font-bold text-xs">Student Name</th>
                <th className="px-6 py-3.5 font-bold text-xs">ID</th>
                <th className="px-6 py-3.5 font-bold text-xs">Class</th>
                <th className="px-6 py-3.5 font-bold text-xs">Gender</th>
                <th className="px-6 py-3.5 font-bold text-xs">Status</th>
                <th className="px-6 py-3.5 font-bold text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-300 text-sm">Loading...</td></tr>
              ) : recentStudents.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-300 text-sm">No students found.</td></tr>
              ) : recentStudents.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      {s.avatar ? (
                        <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-zinc-100" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#3b3dbf] flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(s.name)}
                        </div>
                      )}
                      <span className="text-zinc-900 font-bold">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-zinc-400 text-xs font-semibold">#{s.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-3.5">
                    {s.class_name ? (
                      <span className="px-2 py-1 bg-indigo-50 text-[#3b3dbf] rounded-lg text-xs font-bold">{s.class_name}</span>
                    ) : (
                      <span className="text-zinc-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-xs text-zinc-500 font-semibold">{s.gender || '—'}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      s.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {s.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link to={`/students/${s.id}`} className="text-[#3b3dbf] hover:bg-indigo-50 p-2 rounded-lg transition-colors inline-flex">
                      <Eye size={16} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="font-bold text-lg text-zinc-900">Add New Class</h3>
              <button 
                onClick={() => setShowAddClassModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddClass} className="p-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Grade (e.g. 10)</label>
                  <input
                    type="text"
                    required
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Section (e.g. A)</label>
                  <input
                    type="text"
                    required
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    placeholder="A"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-xl mt-2">
                <p className="text-xs font-semibold text-indigo-800">Preview</p>
                <p className="text-sm font-bold text-indigo-900 mt-0.5">
                  {newGrade || newSection 
                    ? `Grade ${newGrade.trim()} - ${newSection.trim().toUpperCase()}`
                    : 'Grade ... - ...'}
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClass || !newGrade.trim() || !newSection.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3b3dbf] hover:bg-[#2c2eb5] disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isSubmittingClass ? 'Creating...' : (
                    <>
                      <Plus size={16} /> Create Class
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
