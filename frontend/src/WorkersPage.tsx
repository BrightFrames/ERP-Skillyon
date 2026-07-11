import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, MoreVertical, X, Briefcase, Users, Shield, Eye, EyeOff } from 'lucide-react';
import api from './lib/api';

const NON_ACADEMIC_ROLES = ['STAFF', 'ADMIN', 'SECURITY', 'MAINTENANCE', 'ACCOUNTANT', 'LIBRARIAN'];

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'STAFF', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkers();
    const close = () => setActiveMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    if (!showModal) {
      setShowPassword(false);
    }
  }, [showModal]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      // Fetch all non-teacher staff (STAFF, ADMIN roles)
      const res = await api.get('/staff');
      const all = res.data.data || [];
      // Exclude TEACHER role — those are managed in Staff Management
      setWorkers(all.filter((s: any) => s.role !== 'TEACHER'));
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
      await api.post('/staff', form);
      setShowModal(false);
      setForm({ name: '', email: '', role: 'STAFF', password: '' });
      fetchWorkers();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    try {
      await api.delete(`/staff/${id}`);
      setWorkers(prev => prev.filter(w => w.id !== id));
    } catch {
      alert('Failed to remove member');
    }
    setActiveMenu(null);
  };

  const filtered = workers.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter ? w.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: 'bg-violet-50 text-violet-700 border-violet-100',
      STAFF: 'bg-teal-50 text-teal-700 border-teal-100',
      SECURITY: 'bg-red-50 text-red-600 border-red-100',
      MAINTENANCE: 'bg-orange-50 text-orange-600 border-orange-100',
      ACCOUNTANT: 'bg-blue-50 text-blue-600 border-blue-100',
      LIBRARIAN: 'bg-pink-50 text-pink-600 border-pink-100',
    };
    return map[role] || 'bg-zinc-50 text-zinc-600 border-zinc-100';
  };

  const avatarColors = [
    'bg-teal-100 text-teal-700', 'bg-violet-100 text-violet-700',
    'bg-orange-100 text-orange-600', 'bg-blue-100 text-blue-600',
    'bg-pink-100 text-pink-600', 'bg-cyan-100 text-cyan-700',
  ];

  const counts = {
    all: workers.length,
    admin: workers.filter(w => w.role === 'ADMIN').length,
    staff: workers.filter(w => w.role === 'STAFF').length,
    other: workers.filter(w => !['ADMIN', 'STAFF'].includes(w.role)).length,
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#3b3dbf]">Administration & Workers</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Manage non-academic staff, administrators, and support workers.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm shrink-0"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{counts.admin}</p>
            <p className="text-xs font-semibold text-zinc-400">Administrators</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{counts.staff}</p>
            <p className="text-xs font-semibold text-zinc-400">General Staff</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{counts.all}</p>
            <p className="text-xs font-semibold text-zinc-400">Total Workers</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm">
        {/* Toolbar */}
        <div className="p-4 px-6 border-b border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#3b3dbf] focus:bg-white transition-colors placeholder:text-zinc-400"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['', 'ADMIN', 'STAFF', 'SECURITY', 'MAINTENANCE', 'ACCOUNTANT'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  roleFilter === r
                    ? 'bg-[#3b3dbf] text-white border-[#3b3dbf]'
                    : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300'
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
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Role</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Joined</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-zinc-300 text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-zinc-300 text-sm">No workers found.</td></tr>
              ) : filtered.map((w, i) => (
                <tr key={w.id} className="hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                        {getInitials(w.name)}
                      </div>
                      <span className="font-bold text-zinc-800">{w.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs font-medium">{w.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRoleBadge(w.role)}`}>
                      {w.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs font-semibold">
                    {w.join_date ? new Date(w.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenu(activeMenu === w.id ? null : w.id)}
                        className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={15} />
                      </button>
                      {activeMenu === w.id && (
                        <div className="absolute right-0 z-20 mt-1 w-36 bg-white border border-zinc-100 rounded-xl shadow-xl py-1">
                          <button
                            onClick={() => handleDelete(w.id, w.name)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={12} /> Remove
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
          <p className="text-xs font-bold text-zinc-400">{filtered.length} of {workers.length} members</p>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Add Worker / Staff</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Non-teaching staff member</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Full Name *</label>
                <input
                  required autoFocus
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ravi Kumar"
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Email Address *</label>
                <input
                  required type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="ravi@school.edu"
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    required 
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
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
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                >
                  <option value="STAFF">General Staff</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="SECURITY">Security</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="LIBRARIAN">Librarian</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold hover:bg-[#2c2eb5] shadow-sm disabled:opacity-60">
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