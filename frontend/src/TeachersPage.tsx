import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, BookOpen, Trash2, MoreVertical, X, GraduationCap, Users, Briefcase, Eye, EyeOff, Edit3, Shield, Check } from 'lucide-react';
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
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const globalSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'TEACHER',
    subject: '',
    password: '',
    is_class_teacher: false,
    class_teacher_of: '',
    assigned_classes: [] as number[],
    assigned_subjects: [] as string[]
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchClasses();
    const close = () => setActiveMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    if (!showModal) {
      setShowPassword(false);
      setEditingStaffId(null);
      setFormData({
        name: '',
        email: '',
        role: 'TEACHER',
        subject: '',
        password: '',
        is_class_teacher: false,
        class_teacher_of: '',
        assigned_classes: [],
        assigned_subjects: []
      });
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

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClassesList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStaffId(null);
    setFormData({
      name: '',
      email: '',
      role: 'TEACHER',
      subject: '',
      password: '',
      is_class_teacher: false,
      class_teacher_of: '',
      assigned_classes: [],
      assigned_subjects: []
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (member: any) => {
    setEditingStaffId(member.id);
    let parsedClasses: number[] = [];
    let parsedSubjects: string[] = [];

    if (Array.isArray(member.assigned_classes)) {
      parsedClasses = member.assigned_classes.map((c: any) => Number(c));
    } else if (typeof member.assigned_classes === 'string') {
      try { parsedClasses = JSON.parse(member.assigned_classes); } catch {}
    }

    if (Array.isArray(member.assigned_subjects)) {
      parsedSubjects = member.assigned_subjects;
    } else if (typeof member.assigned_subjects === 'string') {
      try { parsedSubjects = JSON.parse(member.assigned_subjects); } catch {}
    }

    setFormData({
      name: member.name || '',
      email: member.email || '',
      role: member.role || 'TEACHER',
      subject: member.subject || '',
      password: '',
      is_class_teacher: Boolean(member.is_class_teacher),
      class_teacher_of: member.class_teacher_of ? String(member.class_teacher_of) : '',
      assigned_classes: parsedClasses,
      assigned_subjects: parsedSubjects
    });
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStaffId) {
        await api.put(`/staff/${editingStaffId}`, formData);
      } else {
        await api.post('/staff', formData);
      }
      setShowModal(false);
      fetchStaff();
    } catch (err: any) {
      console.error("Save staff error:", err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to save staff member';
      alert(msg);
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

  const toggleClassAssignment = (classId: number) => {
    setFormData(prev => {
      const exists = prev.assigned_classes.includes(classId);
      const updated = exists 
        ? prev.assigned_classes.filter(id => id !== classId)
        : [...prev.assigned_classes, classId];
      return { ...prev, assigned_classes: updated };
    });
  };

  const toggleSubjectAssignment = (subj: string) => {
    setFormData(prev => {
      const exists = prev.assigned_subjects.includes(subj);
      const updated = exists
        ? prev.assigned_subjects.filter(s => s !== subj)
        : [...prev.assigned_subjects, subj];
      return { ...prev, assigned_subjects: updated };
    });
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
    if (role === 'TEACHER') return 'bg-indigo-50 text-[#3b3dbf] border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
    if (role === 'ADMIN') return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    return 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800';
  };

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  const avatarColors = [
    'bg-indigo-100 text-[#3b3dbf]', 'bg-teal-100 text-teal-700',
    'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700',
    'bg-purple-100 text-purple-700'
  ];

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-zinc-400">Teachers</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Staff Management</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Manage teachers, administrators, and support staff</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3b3dbf] hover:bg-[#2c2eb5] text-white rounded-xl text-sm font-bold shadow-md transition-colors shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#3b3dbf] flex items-center justify-center shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400">Total Teachers</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{teacherCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400">Support Staff</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{staffCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400">Total Personnel</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{staff.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-zinc-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-bold text-zinc-600 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="TEACHER">Teachers</option>
              <option value="STAFF">Support Staff</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-slate-800 bg-zinc-50/50 dark:bg-slate-900/40 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Subject & Assignments</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Join Date</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-400 text-xs font-semibold">Loading staff list...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-400 text-xs font-semibold">No staff members found.</td></tr>
              ) : filtered.map((s, i) => {
                const assignedClsIds: number[] = Array.isArray(s.assigned_classes)
                  ? s.assigned_classes
                  : (typeof s.assigned_classes === 'string' ? JSON.parse(s.assigned_classes || '[]') : []);

                return (
                  <tr key={s.id} className="hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                          {getInitials(s.name)}
                        </div>
                        <div>
                          <span className="font-bold text-zinc-800 dark:text-zinc-100 block">{s.name}</span>
                          {s.is_class_teacher && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                              <Shield size={10} /> Class Teacher {s.class_teacher_of_name ? `(${s.class_teacher_of_name})` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs font-medium">{s.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {s.subject && (
                          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold text-xs">
                            <BookOpen size={13} className="text-zinc-400 shrink-0" />
                            {s.subject}
                          </div>
                        )}
                        {assignedClsIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {assignedClsIds.map(cid => {
                              const cobj = classesList.find(c => c.id === Number(cid));
                              return (
                                <span key={cid} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 rounded-md text-[10px] font-bold">
                                  {cobj ? cobj.name : `Class #${cid}`}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {!s.subject && assignedClsIds.length === 0 && <span className="text-zinc-300 dark:text-zinc-600 text-xs">—</span>}
                      </div>
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
                          className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {activeMenu === s.id && (
                          <div className="absolute right-0 z-20 mt-1 w-44 bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 rounded-xl shadow-xl py-1 text-left">
                            <button
                              onClick={() => handleOpenEditModal(s)}
                              className="w-full px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Edit3 size={13} />
                              Edit Assignment
                            </button>
                            <button
                              onClick={() => handleDelete(s.id, s.name)}
                              className="w-full px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-slate-800 bg-zinc-50/50 dark:bg-slate-900/40">
          <p className="text-xs font-bold text-zinc-400">Showing {filtered.length} of {staff.length} members</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg my-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 border-b border-zinc-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {editingStaffId ? 'Edit Staff Member' : 'Add Staff Member'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Fill in the role & class assignments below</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">Full Name *</label>
                <input
                  required autoFocus
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Sarah Wilson"
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">Email Address *</label>
                <input
                  required type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. sarah@school.edu"
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                  Password {editingStaffId ? '(Leave blank to keep existing)' : '*'}
                </label>
                <div className="relative">
                  <input
                    required={!editingStaffId}
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingStaffId ? "Leave blank to keep current" : "Set an initial password"}
                    className="w-full px-3.5 py-2.5 pr-10 text-sm border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">Role *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                >
                  <option value="TEACHER">Teacher</option>
                  <option value="STAFF">Support Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {formData.role === 'TEACHER' && (
                <div className="flex flex-col gap-4 border-t border-zinc-100 dark:border-slate-800 pt-4 mt-1">
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">Subject / Department</label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                    >
                      <option value="">Select primary subject...</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Is Class Teacher?</p>
                      <p className="text-[11px] text-zinc-400">Homeroom / Class Head Responsibility</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_class_teacher}
                        onChange={e => setFormData({ 
                          ...formData, 
                          is_class_teacher: e.target.checked,
                          class_teacher_of: e.target.checked ? formData.class_teacher_of : ''
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b3dbf]"></div>
                    </label>
                  </div>

                  {formData.is_class_teacher && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">Class Teacher Of *</label>
                      <select
                        required
                        value={formData.class_teacher_of}
                        onChange={e => setFormData({ ...formData, class_teacher_of: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-slate-800 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                      >
                        <option value="">Select homeroom class...</option>
                        {classesList.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                      Assigned Classes (Multi-Select)
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 dark:bg-slate-800/50 border border-zinc-200 dark:border-slate-700 rounded-xl max-h-36 overflow-y-auto">
                      {classesList.length === 0 ? (
                        <p className="text-xs text-zinc-400">No classes available.</p>
                      ) : classesList.map(c => {
                        const selected = formData.assigned_classes.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleClassAssignment(c.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              selected
                                ? 'bg-[#3b3dbf] text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {selected && <Check size={12} />}
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                      Assigned Subjects (Multi-Select)
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-50 dark:bg-slate-800/50 border border-zinc-200 dark:border-slate-700 rounded-xl max-h-36 overflow-y-auto">
                      {SUBJECTS.map(subj => {
                        const selected = formData.assigned_subjects.includes(subj);
                        return (
                          <button
                            key={subj}
                            type="button"
                            onClick={() => toggleSubjectAssignment(subj)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              selected
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {selected && <Check size={11} />}
                            {subj}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-zinc-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-[#3b3dbf] hover:bg-[#2c2eb5] text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingStaffId ? 'Update Staff Member' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}