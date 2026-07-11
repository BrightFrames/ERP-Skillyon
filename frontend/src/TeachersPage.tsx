import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, UserCheck, BookOpen, Trash2, MoreVertical, X, GraduationCap, Users, Briefcase, Eye, EyeOff } from 'lucide-react';
import api from './lib/api';

const SUBJECTS = [
  "Accountancy", "Art", "Biology", "Business Studies", "Chemistry", "Commerce",
  "Computer Applications", "Economics", "English Language", "English Literature",
  "Environmental Applications", "Geography", "Hindi", "History & Civics",
  "Information Technology", "Mathematics", "Music", "Physical Education",
  "Physics", "Science", "Social Science", "Regional Language"
];

export default function TeachersPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const globalSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'TEACHER', subject: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
    const close = () => setActiveMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    if (!showModal) {
      setShowPassword(false);
    }
  }, [showModal]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff');
      setStaff(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/staff', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', role: 'TEACHER', subject: '', password: '' });
      fetchStaff();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to add staff member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remove ${name} from staff?`)) return;
    try {
      await api.delete(`/staff/${id}`);
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch {
      alert('Failed to delete staff member');
    }
    setActiveMenu(null);
  };

  const filtered = staff.filter(s => {
    const effectiveSearch = search || globalSearch;
    const matchSearch = s.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(effectiveSearch.toLowerCase());
    const matchRole = roleFilter ? s.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  const teacherCount = staff.filter(s => s.role === 'TEACHER').length;
  const staffCount = staff.filter(s => s.role === 'STAFF').length;

  const getRoleBadge = (role: string) => {
    if (role === 'TEACHER') return 'bg-indigo-50 text-[#3b3dbf] border-indigo-100';
    if (role === 'ADMIN') return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-teal-50 text-teal-700 border-teal-100';
  };

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  const avatarColors = [
    'bg-indigo-100 text-[#3b3dbf]', 'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-600', 'bg-pink-100 text-pink-600',
    'bg-violet-100 text-violet-700', 'bg-cyan-100 text-cyan-700',
  ];

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#3b3dbf]">Staff Management</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Manage all teachers and staff members across the institution.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm shrink-0"
        >
          <Plus size={16} />
          Add Staff Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#3b3dbf] flex items-center justify-center shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{teacherCount}</p>
            <p className="text-xs font-semibold text-zinc-400">Teachers</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{staffCount}</p>
            <p className="text-xs font-semibold text-zinc-400">Staff</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{staff.length}</p>
            <p className="text-xs font-semibold text-zinc-400">Total</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#3b3dbf] focus:bg-white transition-colors placeholder:text-zinc-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400">Role:</span>
            {['', 'TEACHER', 'STAFF', 'ADMIN'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  roleFilter === r
                    ? 'bg-[#3b3dbf] text-white border-[#3b3dbf] shadow-sm'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Name</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Email</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Department / Subject</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Role</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Joined</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-300 text-sm">Loading staff...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-300 text-sm">No staff members found.</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id} className="hover:bg-zinc-50/60 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                        {getInitials(s.name)}
                      </div>
                      <span className="font-bold text-zinc-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs font-medium">{s.email}</td>
                  <td className="px-6 py-4">
                    {s.subject ? (
                      <div className="flex items-center gap-1.5 text-zinc-600 font-semibold text-xs">
                        <BookOpen size={13} className="text-zinc-400" />
                        {s.subject}
                      </div>
                    ) : <span className="text-zinc-300 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRoleBadge(s.role)}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs font-semibold">
                    {s.join_date ? new Date(s.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenu(activeMenu === s.id ? null : s.id)}
                        className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeMenu === s.id && (
                        <div className="absolute right-0 z-20 mt-1 w-40 bg-white border border-zinc-100 rounded-xl shadow-xl py-1">
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={13} />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50">
          <p className="text-xs font-bold text-zinc-400">Showing {filtered.length} of {staff.length} members</p>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Add Staff Member</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Full Name *</label>
                <input
                  required autoFocus
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Sarah Wilson"
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Email Address *</label>
                <input
                  required type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. sarah@school.edu"
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    required 
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Set an initial password"
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Role *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                >
                  <option value="TEACHER">Teacher</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {formData.role === 'TEACHER' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">Subject / Department</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                  >
                    <option value="">Select subject...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm disabled:opacity-60">
                  {saving ? 'Saving...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}